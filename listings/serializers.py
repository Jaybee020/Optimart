from xrpl.models.response import ResponseStatus
from xrpl.utils import drops_to_xrp, ripple_time_to_datetime
from rest_framework import serializers
from django.utils import timezone
from collection.models import NFT
from services.xrpl import get_transaction_info

from .enums import ListingStatus, ListingType
from .models import Listing


class CreateListingSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(required=True)
    listing_type = serializers.ChoiceField(choices=ListingType.choices, required=True)
    token_identifier = serializers.CharField(required=True)

    def validate(self, attrs):
        try:
            nft = NFT.objects.get(token_identifier=attrs['token_identifier'])
        except NFT.DoesNotExist as e:
            raise serializers.ValidationError(f'{e!s}') from e

        if nft.listings.filter(status=ListingStatus.ONGOING).exists():
            raise serializers.ValidationError('Cancel ongoing listing before creating a new one')

        response = get_transaction_info(attrs['tx_hash'])
        if response.status == ResponseStatus.ERROR:
            raise serializers.ValidationError(f'{response.result["error_message"]}')

        if response.result['TransactionType'] != 'NFTokenCreateOffer':
            raise serializers.ValidationError(f'Invalid transaction type: {response.result["TransactionType"]}')

        if response.result['NFTokenID'] != nft.token_identifier:
            raise serializers.ValidationError(
                f'NFToken ID mismatch: {response.result["NFTokenID"]} != {nft.token_identifier}',
            )

        if response.result['Destination'] != 'my-address':
            raise serializers.ValidationError(f'Invalid destination address: {response.result["Destination"]}')

        if response.result['Flags'] != 1:
            raise serializers.ValidationError(f'Invalid flags: {response.result["Flags"]}')

        if attrs['listing_type'] == ListingType.AUCTION and response.result.get('Expiration') is None:
            raise serializers.ValidationError('Missing expiration for auction')

        expiration = (
            ripple_time_to_datetime(response.result.get('Expiration'))
            if response.result.get('Expiration') is not None
            else None
        )
        if expiration > timezone.now():
            raise serializers.ValidationError('')

        # todo: add end at check...
        return {
            'nft': nft,
            'tx_info': response.result,
            'listing_type': attrs['listing_type'],
        }

    def create(self, validated_data):
        Listing.objects.create(
            nft=validated_data['nft'],
            creator=self.context['request'].user,
            listing_type=validated_data['listing_type'],
            status=ListingStatus.ONGOING,
            price=drops_to_xrp(validated_data['tx_info']['Amount']),
        )
        ...


class MakeOfferSerializer(serializers.Serializer):
    ...
