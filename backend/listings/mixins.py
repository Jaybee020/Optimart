from django.conf import settings

from collection.models import NFTStatus
from services.xrpl import XRPLClient

from .enums import ListingStatus, OfferStatus
from .tasks import notify_offer_accepted_and_sold

xrpl_client = XRPLClient(
    url=settings.XRPL_NODE_URL,
    seed=settings.XRPL_WALLET_SEED,
)


class OfferActionError(Exception):
    ...


class OfferActionsMixin:
    @staticmethod
    def _send_cancel_offer_request(buy_offer_ids):
        try:
            return xrpl_client.cancel_offers(buy_offer_ids=buy_offer_ids)
        except Exception as e:  # noqa: BLE001
            raise OfferActionError('Offer action failed due to XRPL node exception') from e

    @classmethod
    def cancel_offers(cls, offers):
        buy_offer_ids = [offer.buy_offer_id for offer in offers]
        response = cls._send_cancel_offer_request(buy_offer_ids)

        if response.result['meta']['TransactionResult'] != 'tesSUCCESS':
            raise OfferActionError(f'Offer cancellation failed with {response.result["error_message"]}')

        for offer in offers:
            cls._update_offer_status(offer, OfferStatus.CANCELLED, response.result['hash'])

    @classmethod
    def accept_offer(cls, offer, sell_offer_tx=None):
        cls._validate_offer_acceptance(offer, sell_offer_tx)
        response = cls._send_accept_offer_request(offer, sell_offer_tx)
        if response.result['meta']['TransactionResult'] != 'tesSUCCESS':
            raise OfferActionError(f'Offer acceptance failed with {response.result["error_message"]}')

        cls._update_offer_status(offer, OfferStatus.ACCEPTED, response.result['hash'])
        if offer.listing:
            cls._update_listing_status(offer.listing, ListingStatus.COMPLETED, response.result['hash'])

        cls._update_nft_status(offer.nft, offer, NFTStatus.UNLISTED)
        if offer.creator.email:
            notify_offer_accepted_and_sold.schedule((offer.id,), delay=2)

    @staticmethod
    def _validate_offer_acceptance(offer, sell_offer_tx):
        if offer.listing is None and sell_offer_tx is None:
            raise OfferActionError('Cannot accept offer without providing a sell offer on chain')

    @staticmethod
    def _send_accept_offer_request(offer, sell_offer_tx):
        sell_offer_id = offer.listing.sell_offer_id if offer.listing else sell_offer_tx['meta']['offer_id']
        try:
            return xrpl_client.accept_offer(
                buy_amount=offer.amount,
                buy_offer_id=offer.buy_offer_id,
                sell_offer_id=sell_offer_id,
            )
        except Exception as e:  # noqa: BLE001
            raise OfferActionError('Offer acceptance failed due to XRPL node exception') from e

    @classmethod
    def reject_offers(cls, offers):
        buy_offer_ids = [offer.buy_offer_id for offer in offers]
        response = cls._send_cancel_offer_request(buy_offer_ids)

        if response.result['meta']['TransactionResult'] != 'tesSUCCESS':
            raise OfferActionError(f'Offer rejection failed with {response.result["error_message"]}')

        for offer in offers:
            cls._update_offer_status(offer, OfferStatus.REJECTED, response.result['hash'])

    @staticmethod
    def _update_offer_status(offer, new_status, tx_hash):
        offer.status = new_status
        offer.update_tx_hash = tx_hash
        offer.save()

    @staticmethod
    def _update_listing_status(listing, new_status, tx_hash):
        listing.status = new_status
        listing.update_tx_hash = tx_hash
        listing.save()

    @staticmethod
    def _update_nft_status(nft, offer, new_status):
        nft.owner = offer.creator
        nft.status = new_status
        nft.save()
