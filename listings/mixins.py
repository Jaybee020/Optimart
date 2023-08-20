from django.conf import settings

from collection.models import NFTStatus
from listings.enums import ListingStatus, OfferStatus
from services.xrpl import XRPLClient

xrpl_client = XRPLClient(
    url=settings.XRPL_NODE_URL,
    seed=settings.XRPL_WALLET_SEED,
)


class OfferCancellationError(Exception):
    ...


class OfferAcceptanceError(Exception):
    ...


class OfferRejectionError(Exception):
    ...


class OfferActionsMixin:
    @staticmethod
    def cancel_offers(offers: list):
        try:
            response = xrpl_client.cancel_offers(buy_offer_ids=[x.buy_offer_id for x in offers])
        except Exception as e:  # noqa: BLE001
            raise OfferCancellationError('Offer cancellation failed due to xrpl node exception') from e

        if response.result['meta']['TransactionResult'] != 'tesSUCCESS':
            raise OfferCancellationError(f'Offer cancellation failed with {response.result["error_message"]}')

        for offer in offers:
            offer.status = OfferStatus.CANCELLED
            offer.update_tx_hash = response.result['hash']
            offer.save()

    @staticmethod
    def accept_offer(offer):
        try:
            response = xrpl_client.accept_offer(
                buy_amount=offer.amount,
                buy_offer_id=offer.buy_offer_id,
                sell_offer_id=offer.listing.sell_offer_id if offer.listing is not None else None,
            )
        except Exception as e:  # noqa: BLE001
            raise OfferAcceptanceError('Offer acceptance failed due to xrpl node exception') from e

        if response.result['meta']['TransactionResult'] != 'tesSUCCESS':
            raise OfferAcceptanceError(f'Offer acceptance failed with {response.result["error_message"]}')

        offer.status = OfferStatus.ACCEPTED
        offer.update_tx_hash = response.result['hash']
        if offer.listing:
            offer.listing.status = ListingStatus.COMPLETED
            offer.listing.update_tx_hash = response.result['hash']

        offer.nft.owner = offer.creator
        offer.nft.status = NFTStatus.UNLISTED
        offer.listing.save()
        offer.nft.save()
        offer.save()

    @staticmethod
    def reject_offers(offers: list):
        try:
            response = xrpl_client.cancel_offers(buy_offer_ids=[x.buy_offer_id for x in offers])
        except Exception as e:  # noqa: BLE001
            raise OfferRejectionError('Offer rejection failed due to xrpl node exception') from e

        if response.result['meta']['TransactionResult'] != 'tesSUCCESS':
            raise OfferRejectionError(f'Offer rejection failed with {response.result["error_message"]}')

        for offer in offers:
            offer.status = OfferStatus.REJECTED
            offer.update_tx_hash = response.result['hash']
            offer.save()
