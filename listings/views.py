from django.utils import timezone

from rest_framework import status
from rest_framework.exceptions import ParseError
from rest_framework.generics import GenericAPIView, ListAPIView, RetrieveDestroyAPIView
from rest_framework.mixins import CreateModelMixin, ListModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .enums import ListingStatus, OfferStatus
from .filters import ReceivedOffersFilter, SentOffersFilter
from .models import Listing, Offer
from .permissions import IsOwnListing
from .serializers import CreateListingSerializer, ListingSerializer, OfferSerializer


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

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class ListingAPIView(RetrieveDestroyAPIView):
    queryset = Listing.objects.select_related('creator', 'nft__nft_attributes', 'nft__owner').prefetch_related(
        'offers__creator',
    )
    permission_classes = (IsAuthenticated, IsOwnListing)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListingSerializer

        return None

    def delete(self, request, *args, **kwargs):  # noqa: ARG002
        listing: Listing = self.get_object()
        if listing.status in {ListingStatus.CANCELLED, ListingStatus.COMPLETED}:
            return Response(status=status.HTTP_204_NO_CONTENT)

        # TODO: add a background job to cancel the offers and listing.
        listing.status = ListingStatus.CANCELLED
        listing.offers.filter(status=OfferStatus.PENDING).update(
            status=OfferStatus.CANCELLED,
            updated_at=timezone.now(),
        )
        listing.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SentOffersAPIView(ListAPIView):
    serializer_class = OfferSerializer
    filterset_class = SentOffersFilter

    queryset = Offer.objects.select_related('creator', 'listing__nft__owner', 'listing__nft__collection__issuer')


class ReceivedOffersAPIView(ListAPIView):
    serializer_class = OfferSerializer
    filterset_class = ReceivedOffersFilter

    queryset = Offer.objects.select_related('creator', 'listing__nft__owner', 'listing__nft__collection__issuer')

    def get_queryset(self):
        address = self.request.query_params.get('address')
        if address is None:
            raise ParseError('address must be provided as query parameter')

        qs = super().get_queryset()
        return qs.filter(listing__creator__address=address)


class OfferAPIView(GenericAPIView):
    queryset = Offer.objects.select_related('creator', 'listing__nft__owner', 'listing__nft__collection__issuer')

    def get(self, request):
        # get offer
        ...

    def delete(self, request):
        # cancel offer
        ...

    def patch(self, request):
        # accept offer
        ...
