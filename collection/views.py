from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView, RetrieveAPIView, get_object_or_404

from listings.serializers import NFTWithOffersSerializer

from .filters import NFTsFilter
from .models import NFT, Collection
from .serializers import CollectionAttributesSerializer, CollectionSerializer, NFTSerializer


class CollectionsAPIView(ListAPIView):
    queryset = Collection.objects.select_related('issuer')
    serializer_class = CollectionSerializer
    filter_backends = (OrderingFilter,)
    ordering = ('daily_volume',)
    ordering_fields = ('daily_volume', 'weekly_volume', 'monthly_volume', 'total_volume')


class CollectionAttributesAPIView(RetrieveAPIView):
    queryset = Collection.objects.prefetch_related('nft_set')
    serializer_class = CollectionAttributesSerializer
    lookup_fields = ('issuer', 'taxon')

    def get_object(self):
        filters = {}
        for field in self.lookup_fields:
            if field == 'issuer':
                filters['issuer__address'] = self.kwargs[field]
            else:
                filters[field] = self.kwargs[field]

        obj = get_object_or_404(self.get_queryset(), **filters)
        self.check_object_permissions(self.request, obj)
        return obj


class CollectionAPIView(RetrieveAPIView):
    queryset = Collection.objects.select_related('issuer')
    serializer_class = CollectionSerializer
    lookup_fields = ('issuer', 'taxon')

    def get_object(self):
        filters = {}
        for field in self.lookup_fields:
            if field == 'issuer':
                filters['issuer__address'] = self.kwargs[field]
            else:
                filters[field] = self.kwargs[field]

        obj = get_object_or_404(self.get_queryset(), **filters)
        self.check_object_permissions(self.request, obj)
        return obj


class NFTAPIView(RetrieveAPIView):
    queryset = NFT.objects.select_related('collection__issuer', 'owner').prefetch_related(
        'attributes',
        'nft_offers__creator',
    )
    serializer_class = NFTWithOffersSerializer
    lookup_field = 'token_identifier'


class NFTsAPIView(ListAPIView):
    queryset = NFT.objects.select_related('collection__issuer', 'owner')
    serializer_class = NFTSerializer
    filterset_class = NFTsFilter
    ordering_fields = ('price', 'name')
    ordering = ('price',)

    @method_decorator(cache_page(60 * 60 * 24))
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
