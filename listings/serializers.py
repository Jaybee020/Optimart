from xrpl.models.response import ResponseStatus
from xrpl.utils import drops_to_xrp, ripple_time_to_datetime

from django.conf import settings
from django.db.models import CharField, Value
from django.db.models.functions import Concat
from django.utils import timezone

from rest_framework import serializers

from accounts.serializers import AccountSerializer
from collection.models import NFT, NFTStatus
from collection.serializers import MinimalCollectionSerializer, NFTSerializer
from services.xrpl import XRPLClient

from .enums import ListingStatus, ListingType, OfferStatus
from .models import Listing, Offer
from .tasks import notify_offer_received

xrpl_client = XRPLClient(
    url=settings.XRPL_NODE_URL,
    seed=settings.XRPL_WALLET_SEED,
)


def validate_xrpl_transaction(attrs, expected_type):
    tx = xrpl_client.get_transaction(attrs['tx_hash'])
    if tx.status == ResponseStatus.ERROR:
        raise serializers.ValidationError(f'{tx.result["error_message"]}')

    if tx.result['TransactionType'] != expected_type:
        raise serializers.ValidationError(f'Invalid transaction type of {tx.result["TransactionType"]}')

    if tx.result['Destination'] != xrpl_client.wallet.address:
        raise serializers.ValidationError(f'Invalid destination address: {tx.result["Destination"]}')

    ripple_expiration_ts = tx.result.get('Expiration')
    if ripple_expiration_ts is not None and timezone.now() > ripple_time_to_datetime(ripple_expiration_ts):
        raise serializers.ValidationError('Invalid expiration time set')

    return tx.result


class BaseNFTokenCreateOfferSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(required=True)

    def validate(self, attrs):
        tx_info = validate_xrpl_transaction(attrs, 'NFTokenCreateOffer')
        if self.context['request'].user.address != tx_info['Account']:
            raise serializers.ValidationError('Provided transaction hash was not performed by authenticated user')

        return {'tx_info': tx_info}


class CreateListingSerializer(BaseNFTokenCreateOfferSerializer):
    listing_type = serializers.ChoiceField(choices=ListingType.choices, required=True)

    def validate(self, attrs):
        validated_data = super().validate(attrs)
        tx_info = validated_data['tx_info']

        try:
            nft = NFT.objects.get(token_identifier=tx_info['NFTokenID'])
        except NFT.DoesNotExist as e:
            raise serializers.ValidationError(
                f'NFT with token ID {tx_info["NFTokenID"]} is not supported on Optimart',
            ) from e

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
            sell_offer_id=validated_data['tx_info']['meta']['offer_id'],
            created_at=ripple_time_to_datetime(validated_data['tx_info']['date']),
        )
        if validated_data['tx_info'].get('Expiration') is not None:
            listing.end_at = ripple_time_to_datetime(validated_data['tx_info']['Expiration'])

        listing.nft.status = NFTStatus.LISTED
        listing.save()
        listing.nft.save()
        return listing


class BaseOfferSerializerMixin:
    @staticmethod
    def _validate_transaction_flags(tx_info, expected_flags):
        if tx_info['Flags'] != expected_flags:
            raise serializers.ValidationError(f'Invalid flags: {tx_info["Flags"]}')

    @staticmethod
    def _validate_transaction_account(tx_info, user_address):
        if user_address != tx_info['Account']:
            raise serializers.ValidationError('Provided transaction hash was not performed by authenticated user')

    @staticmethod
    def _validate_transaction_destination(tx_info, expected_destination):
        if tx_info['Destination'] != expected_destination:
            raise serializers.ValidationError(f'Invalid destination address: {tx_info["Destination"]}')

    @staticmethod
    def _validate_transaction_expiration(tx_info):
        ripple_expiration_ts = tx_info.get('Expiration')
        if ripple_expiration_ts is not None and timezone.now() > ripple_time_to_datetime(ripple_expiration_ts):
            raise serializers.ValidationError('Invalid expiration time set')


class CreateOfferSerializer(BaseNFTokenCreateOfferSerializer, BaseOfferSerializerMixin):
    listing_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        validated_data = super().validate(attrs)
        tx_info = validated_data['tx_info']

        listing = None
        if validated_data['listing_id'] is not None:
            listing, nft = self._validate_listing_offer(tx_info, attrs['listing_id'])
        else:
            nft = self._validate_non_listing_offer(tx_info)

        self._validate_transaction_flags(tx_info, 0)
        validated_data.update({'listing': listing, 'nft': nft})
        return validated_data

    def create(self, validated_data):
        return self._create_offer(validated_data)

    def _validate_listing_offer(self, tx_info, listing_id):
        try:
            listing = Listing.objects.get(id=listing_id)
        except Listing.DoesNotExist as e:
            raise serializers.ValidationError(f'{e!s}') from e

        self._validate_token_id_match(tx_info, listing.nft.token_identifier)
        self._validate_listing_expiry(listing)
        self._validate_auction_bid(tx_info, listing)

        return listing, listing.nft

    @staticmethod
    def _validate_non_listing_offer(tx_info):
        try:
            nft = NFT.objects.get(token_identifier=tx_info['NFTokenID'])
        except NFT.DoesNotExist as e:
            raise serializers.ValidationError(f'NFT {tx_info["NFTokenID"]} is not tracked by Optimart') from e

        return nft

    @staticmethod
    def _validate_token_id_match(tx_info, token_identifier):
        if tx_info['NFTokenID'] != token_identifier:
            raise serializers.ValidationError(
                f'NFToken ID mismatch i.e. {tx_info["NFTokenID"]} != {token_identifier}',
            )

    @staticmethod
    def _validate_listing_expiry(listing):
        if listing.end_at is not None and listing.end_at >= timezone.now():
            # convenient to do this here instead of a background job
            listing.status = ListingStatus.CANCELLED
            listing.save()
            raise serializers.ValidationError('Listing has expired')

    @staticmethod
    def _validate_auction_bid(tx_info, listing):
        if listing.listing_type == ListingType.AUCTION and drops_to_xrp(tx_info['amount']) < listing.price:
            raise serializers.ValidationError('Auction bid must not be less than starting price')

    def _create_offer(self, validated_data):
        offer = Offer(
            nft=validated_data['nft'],
            status=OfferStatus.PENDING,
            listing=validated_data['listing'],
            creator=self.context['request'].user,
            buy_offer_id=validated_data['meta']['offer_id'],
            create_tx_hash=validated_data['tx_info']['hash'],
            amount=drops_to_xrp(validated_data['tx_info']['amount']),
            created_at=ripple_time_to_datetime(validated_data['tx_info']['date']),
        )
        if validated_data['tx_info'].get('Expiration') is not None:
            offer.end_at = ripple_time_to_datetime(validated_data['tx_info']['Expiration'])

        offer.save()
        notify_offer_received.schedule((offer.id,), delay=2)
        return offer


class OfferSerializer(serializers.ModelSerializer):
    creator = AccountSerializer()
    nft = NFTSerializer()

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


class AcceptRejectOfferSerializer(serializers.Serializer, BaseOfferSerializerMixin):
    action = serializers.CharField(required=True)
    offer_id = serializers.IntegerField(required=True)
    sell_offer_tx_hash = serializers.CharField(required=False, default=None)

    def validate(self, attrs):
        offer, sell_offer_tx = self._validate_offer(attrs)
        self._validate_offer_action(attrs['action'], offer)
        return {'offer': offer, 'action': attrs['action'], 'sell_offer_tx': sell_offer_tx}

    def _validate_offer(self, attrs):
        try:
            offer = Offer.objects.select_related('listing__nft', 'creator').get(id=attrs['offer_id'])
        except Offer.DoesNotExist as e:
            raise serializers.ValidationError(f'{e!s}') from e

        if offer.listing.listing_type == ListingType.AUCTION:
            raise serializers.ValidationError('Offers cannot be accepted or rejected for auctions')

        sell_offer_tx = self._validate_accept_offer(attrs, offer) if attrs['action'] == 'accept' else None

        return offer, sell_offer_tx

    @staticmethod
    def _validate_offer_action(action, offer):
        if action not in {'accept', 'reject'}:
            raise serializers.ValidationError('Invalid action provided. Valid actions are: accept, reject.')

        if action == 'accept' and Offer.objects.filter(listing=offer.listing, status=OfferStatus.ACCEPTED).exists():
            raise serializers.ValidationError('An offer has already been accepted for this listing')

    def _validate_accept_offer(self, attrs, offer):
        if offer.listing is None and not attrs['sell_offer_tx_hash']:
            raise serializers.ValidationError(
                'To accept an offer made without listing, a sell offer has to be created',
            )

        if offer.listing is None and attrs['sell_offer_tx_hash']:
            tx_info = validate_xrpl_transaction(attrs, 'NFTokenCreateOffer')
            self._validate_transaction_flags(tx_info, 1)
            self._validate_transaction_account(tx_info, self.context['request'].user.address)
            self._validate_transaction_destination(tx_info, xrpl_client.wallet.address)
            self._validate_transaction_expiration(tx_info)
            return tx_info

        return None


class MinimalOfferSerializer(serializers.ModelSerializer):
    creator = AccountSerializer()

    class Meta:
        model = Offer
        fields = (
            'amount',
            'creator',
            'created_at',
            'updated_at',
            'create_tx_hash',
            'update_tx_hash',
            'status',
        )


class NFTWithOffersSerializer(serializers.ModelSerializer):
    owner = AccountSerializer()
    attributes = serializers.SerializerMethodField()
    collection = MinimalCollectionSerializer()
    ongoing_listing = serializers.SerializerMethodField()
    nft_offers = MinimalOfferSerializer(many=True)

    def get_ongoing_listing(self, obj: NFT):
        ongoing_listing = obj.listings.select_related('creator').filter(status=ListingStatus.ONGOING).first()
        if ongoing_listing is None:
            return None

        return {
            'id': ongoing_listing.id,
            'price': ongoing_listing.price,
            'end_at': ongoing_listing.end_at,
            'type': ongoing_listing.listing_type,
            'creator': ongoing_listing.creator.address,
        }

    def get_attributes(self, obj: NFT):
        # Due to duplicates in attributes caused by data import and my poor schema modelling skills,
        # this approach handles unique combinations without adding a unique constraint.
        # Adding a unique constraint could break existing data, so this workaround is employed for now.
        attrs = (
            obj.attributes.all()
            .annotate(
                combined_attr=Concat('key', Value(':'), 'value', output_field=CharField()),
            )
            .values('combined_attr')
            .distinct()
        )
        return [
            {'key': attribute['combined_attr'].split(':')[0], 'value': attribute['combined_attr'].split(':')[1]}
            for attribute in attrs
        ]

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
            'nft_offers',
            'image_url',
            'ongoing_listing',
            'status',
            'attributes',
        )
