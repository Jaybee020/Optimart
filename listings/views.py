from django.db import transaction
from django.utils import timezone

from rest_framework import status
from rest_framework.generics import CreateAPIView, GenericAPIView, ListAPIView, RetrieveDestroyAPIView
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from collection.models import NFTStatus

from .enums import ListingStatus, OfferStatus
from .filters import ReceivedOffersFilter, SentOffersFilter
from .models import Listing, Offer
from .permissions import IsListingOwner, IsOfferForListingOwner, IsOfferOwner
from .serializers import (
    AcceptRejectOfferSerializer,
    CreateListingSerializer,
    CreateOfferSerializer,
    ListingSerializer,
    OfferSerializer,
)


class OngoingListingCheckView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):  # noqa: ARG002
        if Listing.objects.filter(creator=self.request.user, status=ListingStatus.ONGOING).exists():
            return Response(data={'detail': 'An ongoing listing already exists'}, status=status.HTTP_409_CONFLICT)

        return Response(data={'detail': 'Proceed with listing creation'}, status=status.HTTP_200_OK)


class ListingsAPIView(GenericAPIView, CreateModelMixin, ListModelMixin):
    queryset = Listing.objects.select_related('creator', 'nft__nft_attributes', 'nft__owner').prefetch_related(
        'offers__creator',
    )

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListingSerializer

        if self.request.method == 'POST':
            return CreateListingSerializer

        return None


class ListingAPIView(RetrieveDestroyAPIView):
    queryset = Listing.objects.select_related('creator', 'nft__nft_attributes', 'nft__owner').prefetch_related(
        'offers__creator',
    )
    permission_classes = (IsAuthenticated, IsListingOwner)

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

        # TODO: add a background job to cancel the offers and listing.
        # also add the tx hash of the cancellation.
        listing.status = ListingStatus.CANCELLED
        listing.nft.status = NFTStatus.UNLISTED
        listing.offers.filter(status=OfferStatus.PENDING).update(
            status=OfferStatus.CANCELLED,
            updated_at=timezone.now(),
        )
        listing.nft.save()
        return Response(
            data={'detail': 'Listing cancelled successfully'},
            status=status.HTTP_200_OK,
        )


class SentOffersAPIView(ListAPIView):
    serializer_class = OfferSerializer
    filterset_class = SentOffersFilter

    queryset = Offer.objects.select_related('creator', 'listing__nft__owner', 'listing__nft__collection__issuer')


class CreateOfferAPIView(CreateAPIView):
    serializer_class = CreateOfferSerializer


class ReceivedOffersAPIView(ListAPIView):
    serializer_class = OfferSerializer
    filterset_class = ReceivedOffersFilter

    queryset = Offer.objects.select_related('creator', 'listing__nft__owner', 'listing__nft__collection__issuer')


class OfferAPIView(GenericAPIView, RetrieveModelMixin):
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

        offer.status = OfferStatus.CANCELLED
        offer.save()
        # TODO: Cancel the offer on the XRPL blockchain using a background job.
        # add the tx hash for the cancellation.
        return Response(data={'detail': 'Offer cancelled successfully'}, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        offer = serializer.data['offer']

        if serializer.data['action'] == 'accept':
            with transaction.atomic():
                offer.status = OfferStatus.ACCEPTED
                offer.listing.status = ListingStatus.COMPLETED
                offer.listing.save()
                offer.save()
                # todo: background task to accept the offer on-chain
                # add the tx hash for the cancellation.

                Offer.objects.filter(listing=offer.listing, status=OfferStatus.PENDING).update(
                    status=OfferStatus.REJECTED,
                    updated_at=timezone.now(),
                )
                # todo: background task to cancel the offer on-chain
                # add the tx hash for the cancellation.
                return Response(data={'detail': 'Offer accepted successfully'}, status=status.HTTP_200_OK)

        offer.status = OfferStatus.REJECTED
        offer.save()
        # todo: background task to cancel the offer on-chain
        # add the tx hash for the cancellation.
        return Response(data={'detail': 'Offer rejected successfully'}, status=status.HTTP_200_OK)
