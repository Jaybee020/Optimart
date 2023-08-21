from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from xrpl.clients import JsonRpcClient
from xrpl.core.binarycodec import decode, encode_for_signing
from xrpl.core.keypairs import is_valid_message
from xrpl.models import Amount, Response, Tx
from xrpl.models.transactions import NFTokenAcceptOffer, NFTokenCancelOffer, NFTokenCreateOffer, NFTokenCreateOfferFlag
from xrpl.transaction import submit_and_wait
from xrpl.utils import datetime_to_ripple_time, xrp_to_drops
from xrpl.wallet import Wallet


class XRPLClient:
    def __init__(self, url: str, seed: str):
        self.client = JsonRpcClient(url)
        self.wallet = Wallet.from_secret(seed)

    def create_listing(
        self,
        token_id: str,
        amount: Decimal,
        expiration: Optional[datetime],
        action: Literal['auction', 'regular'],
    ) -> NFTokenCreateOffer:
        if action == 'auction' and expiration is None:
            raise TypeError('Cannot create listing of type auction without an expiration')

        return NFTokenCreateOffer(
            nftoken_id=token_id,
            amount=xrp_to_drops(amount),
            expiration=datetime_to_ripple_time(expiration) if expiration is not None else None,
            destination=self.wallet.address,
            flags=NFTokenCreateOfferFlag.TF_SELL_NFTOKEN,
        )

    def cancel_listing(self, sell_offer_id: str, buy_offer_ids: list[str]) -> Response:
        tx = NFTokenCancelOffer(
            account=self.wallet.address,
            nftoken_offers=[sell_offer_id, *buy_offer_ids],
        )
        return submit_and_wait(
            transaction=tx,
            client=self.client,
            wallet=self.wallet,
        )

    def cancel_offers(self, buy_offer_ids: list[str]) -> Response:
        tx = NFTokenCancelOffer(
            account=self.wallet.address,
            nftoken_offers=buy_offer_ids,
        )
        return submit_and_wait(
            transaction=tx,
            client=self.client,
            wallet=self.wallet,
        )

    def accept_offer(self, buy_amount: Decimal, sell_offer_id: str, buy_offer_id: str) -> Response:
        tx = NFTokenAcceptOffer(
            account=self.wallet.address,
            nftoken_buy_offer=buy_offer_id,
            nftoken_sell_offer=sell_offer_id,
            nftoken_broker_fee=self.get_broker_fee(buy_amount),
        )
        return submit_and_wait(transaction=tx, client=self.client, wallet=self.wallet)

    def get_transaction(self, tx_hash: str) -> Response:
        return self.client.request(Tx(transaction=tx_hash))

    @staticmethod
    def get_broker_fee(amount: Decimal) -> Amount:
        return xrp_to_drops(amount * 0.05)

    @staticmethod
    def verify_signature(tx_blob: str) -> tuple[str, bool]:
        decoded_tx = decode(tx_blob)
        is_sig_valid = is_valid_message(
            bytes.fromhex(encode_for_signing(decoded_tx)),
            bytes.fromhex(decoded_tx['TxnSignature']),
            decoded_tx['SigningPubKey'],
        )
        return decoded_tx['Account'], is_sig_valid
