from logging import getLogger

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from rest_framework import status
from rest_framework.generics import CreateAPIView, GenericAPIView, ListAPIView, RetrieveDestroyAPIView
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from collection.models import NFTStatus
from services.xrpl import XRPLClient

from .enums import ListingStatus, OfferStatus
from .filters import ReceivedOffersFilter, SentOffersFilter
from .mixins import OfferActionsMixin
from .models import Listing, Offer
from .permissions import IsListingOwner, IsOfferForListingOwner, IsOfferOwner
from .serializers import (
    AcceptRejectOfferSerializer,
    CreateListingSerializer,
    CreateOfferSerializer,
    ListingSerializer,
    OfferSerializer,
)

logger = getLogger(__name__)
xrpl_client = XRPLClient(
    url=settings.XRPL_NODE_URL,
    seed=settings.XRPL_WALLET_SEED,
)


class OngoingListingCheckView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):  # noqa: ARG002
        if Listing.objects.filter(creator=self.request.user, status=ListingStatus.ONGOING).exists():
            return Response(data={'detail': 'An ongoing listing already exists'}, status=status.HTTP_409_CONFLICT)

        return Response(data={'detail': 'Proceed with listing creation'}, status=status.HTTP_200_OK)


class ListingsAPIView(GenericAPIView, CreateModelMixin, ListModelMixin):
    queryset = Listing.objects.select_related('creator', 'nft__attributes', 'nft__owner').prefetch_related(
        'offers__creator',
    )

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListingSerializer

        if self.request.method == 'POST':
            return CreateListingSerializer

        return None


class ListingAPIView(RetrieveDestroyAPIView):
    queryset = Listing.objects.select_related('creator', 'nft__owner').prefetch_related(
        'offers__creator',
        'nft__attributes',
    )
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAuthenticated, IsListingOwner]

        return super().get_permissions()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListingSerializer

        return None

    def delete(self, request, *args, **kwargs):  # noqa: ARG002
        listing: Listing = self.get_object()
        if listing.status in {ListingStatus.CANCELLED, ListingStatus.COMPLETED}:
            return Response(
                data={'detail': 'Listing has already been cancelled or completed'},
                status=status.HTTP_200_OK,
            )

        try:
            response = xrpl_client.cancel_listing(
                sell_offer_id=listing.sell_offer_id,
                buy_offer_ids=listing.offers.values_list('buy_offer_id', flat=True),
            )
        except Exception as e:
            logger.exception('Listing cancellation failed due to node exception', exc_info=e)
            return Response(
                data={'detail': 'Listing cancellation failed due to xrpl node exception'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if response.result['meta']['TransactionResult'] != 'tesSUCCESS':
            return Response(
                data={'detail': f'Listing cancellation failed with {response.result["error_message"]}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        with transaction.atomic():
            listing.status = ListingStatus.CANCELLED
            listing.update_tx_hash = response.result['hash']
            listing.nft.status = NFTStatus.UNLISTED
            listing.offers.filter(status=OfferStatus.PENDING).update(
                updated_at=timezone.now(),
                status=OfferStatus.CANCELLED,
                update_tx_hash=response.result['hash'],
            )
            listing.nft.save()
            listing.save()

        return Response(
            data={'detail': 'Listing cancelled successfully'},
            status=status.HTTP_200_OK,
        )


class SentOffersAPIView(ListAPIView):
    queryset = Offer.objects.select_related('creator', 'listing__nft__owner', 'listing__nft__collection__issuer')
    serializer_class = OfferSerializer
    filterset_class = SentOffersFilter


class CreateOfferAPIView(CreateAPIView):
    serializer_class = CreateOfferSerializer


class ReceivedOffersAPIView(ListAPIView):
    queryset = Offer.objects.select_related('creator', 'listing__nft__owner', 'listing__nft__collection__issuer')
    serializer_class = OfferSerializer
    filterset_class = ReceivedOffersFilter


class OfferAPIView(GenericAPIView, RetrieveModelMixin, OfferActionsMixin):
    queryset = Offer.objects.select_related(
        'creator',
        'listing__creator',
        'listing__nft__owner',
        'listing__nft__collection__issuer',
    )
    serializer_class = OfferSerializer
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return AcceptRejectOfferSerializer

        return super().get_serializer_class()

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsAuthenticated, IsOfferOwner]

        if self.request.method == 'PATCH':
            return [IsAuthenticated, IsOfferForListingOwner]

        return super().get_permissions()

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def delete(self, request):  # noqa: ARG002
        offer = self.get_object()
        if offer.status in {OfferStatus.CANCELLED, OfferStatus.ACCEPTED, OfferStatus.REJECTED}:
            return Response(
                data={'detail': 'Offer already accepted or cancelled or rejected'},
                status=status.HTTP_200_OK,
            )

        try:
            self.cancel_offers([offer])
        except Exception as e:
            logger.exception('An exception occurred', exc_info=e)
            return Response(
                data={'detail': 'Error occurred during offer cancellation'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(data={'detail': 'Offer cancelled successfully'}, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = serializer.data['offer']

        if serializer.data['action'] == 'accept':
            with transaction.atomic():
                try:
                    self.accept_offer(offer, sell_offer_tx=serializer.data['sell_offer_tx'])
                except Exception as e:
                    logger.exception('An exception occurred', exc_info=e)
                    return Response(
                        data={'detail': 'Error occurred during offer acceptance'},
                        status=status.HTTP_502_BAD_GATEWAY,
                    )

            if offer.listing:
                with transaction.atomic():
                    offers_to_cancel = Offer.objects.filter(listing=offer.listing, status=OfferStatus.PENDING)
                    try:
                        self.cancel_offers(offers_to_cancel)
                    except Exception as e:
                        logger.exception('An exception occurred', exc_info=e)
                        return Response(
                            data={'detail': 'Error occurred during offers cancellation after acceptance'},
                            status=status.HTTP_502_BAD_GATEWAY,
                        )

            return Response(data={'detail': 'Offer accepted successfully'}, status=status.HTTP_200_OK)

        # can only be rejection.
        self.reject_offers([offer])
        return Response(data={'detail': 'Offer rejected successfully'}, status=status.HTTP_200_OK)
