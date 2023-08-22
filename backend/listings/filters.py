from django_filters import rest_framework as filters

from .models import Offer


class SentOffersFilter(filters.FilterSet):
    address = filters.CharFilter(field_name='creator__address', lookup_expr='exact')
    status = filters.CharFilter(field_name='listing__status', lookup_expr='exact')

    class Meta:
        model = Offer
        fields = ('address', 'status')


class ReceivedOffersFilter(filters.FilterSet):
    address = filters.CharFilter(field_name='listing__creator__address', lookup_expr='exact')
    status = filters.CharFilter(field_name='listing__status', lookup_expr='exact')

    class Meta:
        model = Offer
        fields = ('address', 'status')
