from xrpl.models.response import ResponseStatus
from xrpl.utils import drops_to_xrp, ripple_time_to_datetime

from django.utils import timezone

from rest_framework import serializers

from accounts.serializers import AccountSerializer
from collection.models import NFT
from collection.serializers import NFTSerializer
from services.xrpl import get_transaction_info

from .enums import ListingStatus, ListingType, OfferStatus
from .models import Listing, Offer


class BaseNFTokenCreateOfferSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(required=True)

    def validate(self, attrs):
        response = get_transaction_info(attrs['tx_hash'])
        if response.status == ResponseStatus.ERROR:
            raise serializers.ValidationError(f'{response.result["error_message"]}')

        if self.context['request'].user.address != response.result['Account']:
            raise serializers.ValidationError('Provided transaction hash was not performed by authenticated user')

        if response.result['TransactionType'] != 'NFTokenCreateOffer':
            raise serializers.ValidationError(f'Invalid transaction type of {response.result["TransactionType"]}')

        if response.result['Destination'] != 'my-address':
            raise serializers.ValidationError(f'Invalid destination address: {response.result["Destination"]}')

        ripple_expiration_ts = response.result.get('Expiration')
        if ripple_expiration_ts is not None and timezone.now() > ripple_time_to_datetime(ripple_expiration_ts):
            raise serializers.ValidationError('Invalid expiration time set')

        return {'tx_info': response.result}


class CreateListingSerializer(BaseNFTokenCreateOfferSerializer):
    listing_type = serializers.ChoiceField(choices=ListingType.choices, required=True)

    def validate(self, attrs):
        validated_data = super().validate(attrs)
        tx_info = validated_data['tx_info']

        try:
            nft = NFT.objects.get(token_identifier=tx_info['NFTokenID'])
        except NFT.DoesNotExist as e:
            raise serializers.ValidationError(f'{e!s}') from e

        if nft.listings.filter(status=ListingStatus.ONGOING).exists():
            raise serializers.ValidationError('Cancel ongoing listing before creating a new one')

        if tx_info['Flags'] != 1:
            raise serializers.ValidationError(f'Invalid flags: {tx_info["Flags"]}')

        if attrs['listing_type'] == ListingType.AUCTION and tx_info.get('Expiration') is None:
            raise serializers.ValidationError('Missing expiration for auction')

        validated_data.update({'nft': nft, 'listing_type': attrs['listing_type']})
        return validated_data

    def create(self, validated_data):
        listing = Listing(
            nft=validated_data['nft'],
            status=ListingStatus.ONGOING,
            creator=self.context['request'].user,
            listing_type=validated_data['listing_type'],
            create_tx_hash=validated_data['tx_info']['hash'],
            price=drops_to_xrp(validated_data['tx_info']['Amount']),
            created_at=ripple_time_to_datetime(validated_data['tx_info']['date']),
        )
        if validated_data['tx_info'].get('Expiration') is not None:
            listing.end_at = ripple_time_to_datetime(validated_data['tx_info']['Expiration'])

        listing.save()
        return listing


class CreateOfferSerializer(BaseNFTokenCreateOfferSerializer):
    listing_id = serializers.IntegerField(required=True)

    def validate(self, attrs):
        validated_data = super().validate(attrs)
        tx_info = validated_data['tx_info']

        try:
            listing = Listing.objects.get(id=attrs['listing_id'])
        except Listing.DoesNotExist as e:
            raise serializers.ValidationError(f'{e!s}') from e

        if tx_info['NFTokenID'] != listing.nft.token_identifier:
            raise serializers.ValidationError(
                f'NFToken ID mismatch i.e. {tx_info["NFTokenID"]} != {listing.nft.token_identifier}',
            )

        if tx_info['Flags'] != 0:
            raise serializers.ValidationError(f'Invalid flags: {tx_info["Flags"]}')

        validated_data.update({'listing': listing})
        return validated_data

    def create(self, validated_data):
        offer = Offer(
            listing=validated_data['listing'],
            creator=self.context['request'].user,
            create_tx_hash=validated_data['tx_info']['hash'],
            amount=drops_to_xrp(validated_data['tx_info']['amount']),
            created_at=ripple_time_to_datetime(validated_data['tx_info']['date']),
            status=OfferStatus.PENDING,
        )
        if validated_data['tx_info'].get('Expiration') is not None:
            offer.end_at = ripple_time_to_datetime(validated_data['tx_info']['Expiration'])

        offer.save()
        return offer


class OfferSerializer(serializers.ModelSerializer):
    creator = AccountSerializer()
    nft = NFTSerializer(source='listing.nft')

    class Meta:
        model = Offer
        fields = (
            'id',
            'listing_id',
            'amount',
            'creator',
            'nft',
            'create_tx_hash',
            'update_tx_hash',
            'status',
            'created_at',
            'updated_at',
        )


class ListingSerializer(serializers.ModelSerializer):
    nft = NFTSerializer()
    creator = AccountSerializer()
    offers = OfferSerializer(many=True)

    class Meta:
        model = Listing
        fields = (
            'id',
            'nft',
            'creator',
            'price',
            'offers',
            'create_tx_hash',
            'update_tx_hash',
            'created_at',
            'updated_at',
            'end_at',
            'status',
        )
