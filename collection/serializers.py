from rest_framework import serializers

from accounts.serializers import AccountSerializer

from .models import NFT, Collection, NFTAttribute


class NFTAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NFTAttribute
        fields = ('key', 'value')


class CollectionAttributesSerializer(serializers.ModelSerializer):
    attributes = NFTAttributeSerializer(many=True, source='collection_attributes')

    class Meta:
        model = Collection
        fields = ('attributes',)


class MinimalCollectionSerializer(serializers.ModelSerializer):
    issuer = AccountSerializer()

    class Meta:
        model = Collection
        fields = (
            'name',
            'description',
            'issuer',
            'taxon',
            'floor_price',
            'image_url',
            'banner_url',
        )


class CollectionSerializer(serializers.ModelSerializer):
    issuer = AccountSerializer()
    collection_attributes = NFTAttributeSerializer(many=True)

    class Meta:
        model = Collection
        fields = (
            'name',
            'description',
            'issuer',
            'taxon',
            'floor_price',
            'daily_volume',
            'weekly_volume',
            'monthly_volume',
            'total_volume',
            'image_url',
            'banner_url',
            'discord_link',
            'instagram_link',
            'twitter_link',
        )


class NFTSerializer(serializers.ModelSerializer):
    owner = AccountSerializer()
    nft_attributes = NFTAttributeSerializer(many=True)
    collection = MinimalCollectionSerializer()

    class Meta:
        model = NFT
        fields = (
            'name',
            'collection',
            'token_identifier',
            'sequence',
            'owner',
            'price',
            'uri',
            'flags',
            'image_url',
            'status',
            'nft_attributes',
        )
