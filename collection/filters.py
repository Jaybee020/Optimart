from django.db.models import Count
from django_filters import rest_framework as filters

from .models import NFT


class NFTsFilter(filters.FilterSet):
    attributes = filters.CharFilter(method='filter_attributes')
    name = filters.CharFilter(field_name='name', lookup_expr='icontains')
    status = filters.CharFilter(field_name='status', lookup_expr='exact')
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    attributes_count = filters.NumberFilter(method='filter_attributes_count')
    taxon = filters.NumberFilter(field_name='collection__taxon', lookup_expr='exact')
    issuer = filters.CharFilter(field_name='collection__issuer__address', lookup_expr='exact')

    def filter_attributes_count(self, queryset, name, value):  # noqa: ARG002
        return queryset.annotate(attributes_count=Count('nft_attributes')).filter(attributes_count=value)

    def filter_attributes(self, queryset, name, value):  # noqa: ARG002
        attribute_pairs = value.split(',')
        filters = {}

        for pair in attribute_pairs:
            key, val = pair.split(':')
            filters['nft_attributes__key'] = key
            filters['nft_attributes__value'] = key

        return queryset.filter(**filters)

    class Meta:
        model = NFT
        fields = ('name', 'status', 'min_price', 'max_price', 'taxon', 'issuer', 'attributes', 'attributes_count')
