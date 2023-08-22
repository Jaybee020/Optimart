from django.urls import path

from .views import CollectionAPIView, CollectionAttributesAPIView, CollectionsAPIView, NFTAPIView, NFTsAPIView

urlpatterns = [
    path('nfts', NFTsAPIView.as_view(), name='nfts'),
    path('nfts/<str:token_identifier>', NFTAPIView.as_view(), name='nft'),
    path('collections', CollectionsAPIView.as_view(), name='collections'),
    path('collections/<str:issuer>/<int:taxon>', CollectionAPIView.as_view(), name='collection'),
    path(
        'collections/<str:issuer>/<int:taxon>/attributes',
        CollectionAttributesAPIView.as_view(),
        name='collection-attributes',
    ),
]
