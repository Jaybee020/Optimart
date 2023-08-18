from django.urls import path

from .views import ListingsAPIView, OngoingListingCheckView

urlpatterns = [
    path('listings', ListingsAPIView.as_view(), name='create-and-get-all-listings'),
    path('listings/check-ongoing', OngoingListingCheckView.as_view(), name='listing-creation-check'),
]
