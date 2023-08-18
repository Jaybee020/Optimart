from django.urls import path

from .views import (
    ListingAPIView,
    ListingsAPIView,
    OfferAPIView,
    OngoingListingCheckView,
    ReceivedOffersAPIView,
    SentOffersAPIView,
)

urlpatterns = [
    path('listings', ListingsAPIView.as_view(), name='create-and-get-all-listings'),
    path('listings/check-ongoing', OngoingListingCheckView.as_view(), name='listing-creation-check'),
    path('listings/<int:listing_id>', ListingAPIView.as_view(), name='get-cancel-listing'),
    path('offers/sent', SentOffersAPIView.as_view(), name='sent-offers'),
    path('offers/received', ReceivedOffersAPIView.as_view(), name='received-offers'),
    path('offers/<int:offer_id>', OfferAPIView.as_view(), name='get-delete-update-offer'),
]
