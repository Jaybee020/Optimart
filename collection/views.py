from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView, RetrieveAPIView, get_object_or_404

from .filters import NFTsFilter
from .models import NFT, Collection
from .serializers import CollectionSerializer, NFTSerializer


class CollectionsAPIView(ListAPIView):
    queryset = Collection.objects.select_related('issuer').prefetch_related('collection_attributes')
    serializer_class = CollectionSerializer
    filter_backends = (OrderingFilter,)
    ordering = ('daily_volume',)
    ordering_fields = ('daily_volume', 'weekly_volume', 'monthly_volume', 'total_volume')


class CollectionAPIView(RetrieveAPIView):
    queryset = Collection.objects.select_related('issuer').prefetch_related('collection_attributes')
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
    queryset = NFT.objects.select_related('collection__issuer', 'owner').prefetch_related('nft_attributes')
    serializer_class = NFTSerializer
    lookup_field = 'token_identifier'


class NFTsAPIView(ListAPIView):
    queryset = NFT.objects.select_related('collection__issuer', 'owner').prefetch_related('nft_attributes')
    serializer_class = NFTSerializer
    filterset_class = NFTsFilter
    ordering_fields = ('price', 'name')
    ordering = ('price',)
