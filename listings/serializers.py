from xrpl.models.response import ResponseStatus
from xrpl.utils import drops_to_xrp, ripple_time_to_datetime

from django.utils import timezone

from rest_framework import serializers

from collection.models import NFT
from services.xrpl import get_transaction_info

from .enums import ListingStatus, ListingType, OfferStatus
from .models import Listing, Offer


class CreateListingSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(required=True)
    listing_type = serializers.ChoiceField(choices=ListingType.choices, required=True)

    def validate(self, attrs):
        response = get_transaction_info(attrs['tx_hash'])
        if response.status == ResponseStatus.ERROR:
            raise serializers.ValidationError(f'{response.result["error_message"]}')

        if self.context['request'].user.address != response.result['Account']:
            raise serializers.ValidationError('Provided transaction hash was not performed by authenticated user')

        if response.result['TransactionType'] != 'NFTokenCreateOffer':
            raise serializers.ValidationError(f'Invalid transaction type of {response.result["TransactionType"]}')

        try:
            nft = NFT.objects.get(token_identifier=response.result['NFTokenID'])
        except NFT.DoesNotExist as e:
            raise serializers.ValidationError(f'{e!s}') from e

        if nft.listings.filter(status=ListingStatus.ONGOING).exists():
            raise serializers.ValidationError('Cancel ongoing listing before creating a new one')

        if response.result['Destination'] != 'my-address':
            raise serializers.ValidationError(f'Invalid destination address: {response.result["Destination"]}')

        if response.result['Flags'] != 1:
            raise serializers.ValidationError(f'Invalid flags: {response.result["Flags"]}')

        if attrs['listing_type'] == ListingType.AUCTION and response.result.get('Expiration') is None:
            raise serializers.ValidationError('Missing expiration for auction')

        ripple_expiration_ts = response.result.get('Expiration')
        if ripple_expiration_ts is not None and timezone.now() > ripple_time_to_datetime(ripple_expiration_ts):
            raise serializers.ValidationError('Invalid expiration time set')

        return {
            'nft': nft,
            'tx_info': response.result,
            'listing_type': attrs['listing_type'],
        }

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


class CreateOfferSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(required=True)
    listing_id = serializers.IntegerField(required=True)

    def validate(self, attrs):
        try:
            listing = Listing.objects.get(id=attrs['listing_id'])
        except Listing.DoesNotExist as e:
            raise serializers.ValidationError(f'{e!s}') from e

        response = get_transaction_info(attrs['tx_hash'])
        if response.status == ResponseStatus.ERROR:
            raise serializers.ValidationError(f'{response.result["error_message"]}')

        if self.context['request'].user.address != response.result['Account']:
            raise serializers.ValidationError('Provided transaction hash was not performed by authenticated user')

        if response.result['TransactionType'] != 'NFTokenCreateOffer':
            raise serializers.ValidationError(f'Invalid transaction type of {response.result["TransactionType"]}')

        if response.result['NFTokenID'] != listing.nft.token_identifier:
            raise serializers.ValidationError(
                f'NFToken ID mismatch i.e. {response.result["NFTokenID"]} != {listing.nft.token_identifier}',
            )

        if response.result['Destination'] != 'my-address':
            raise serializers.ValidationError(f'Invalid destination address: {response.result["Destination"]}')

        if response.result['Flags'] != 0:
            raise serializers.ValidationError(f'Invalid flags: {response.result["Flags"]}')

        ripple_expiration_ts = response.result.get('Expiration')
        if ripple_expiration_ts is not None and timezone.now() > ripple_time_to_datetime(ripple_expiration_ts):
            raise serializers.ValidationError('Invalid expiration time set')

        return {
            'listing': listing,
            'tx_info': response.result,
        }

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


class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = '__all__'


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = '__all__'
