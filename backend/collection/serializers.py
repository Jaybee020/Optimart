from django.db.models import CharField, Value
from django.db.models.functions import Concat

from rest_framework import serializers

from accounts.serializers import AccountSerializer

from .models import NFT, Collection, NFTAttribute


class NFTAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NFTAttribute
        fields = ('key', 'value')


class CollectionAttributesSerializer(serializers.ModelSerializer):
    attributes = serializers.SerializerMethodField()

    def get_attributes(self, obj: Collection):
        # Due to duplicates in attributes caused by data import and my poor schema modelling skills,
        # this approach handles unique combinations without adding a unique constraint.
        # Adding a unique constraint could break existing data, so this workaround is employed for now.
        attrs = (
            obj.nft_set.all()
            .annotate(
                combined_attr=Concat('attributes__key', Value(':'), 'attributes__value', output_field=CharField()),
            )
            .values('combined_attr')
            .distinct()
        )
        return [
            {'key': attribute['combined_attr'].split(':')[0], 'value': attribute['combined_attr'].split(':')[1]}
            for attribute in attrs
        ]

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
        )
