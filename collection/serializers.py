from rest_framework import serializers

from .models import NFT, Collection, NFTAttribute


class NFTAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NFTAttribute
        fields = ('key', 'value')


class CollectionSerializer(serializers.ModelSerializer):
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
            'collection_attributes',
        )


class NFTSerializer(serializers.ModelSerializer):
    nft_attributes = NFTAttributeSerializer(many=True)

    class Meta:
        model = NFT
        fields = (
            'name',
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
