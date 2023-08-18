from datetime import datetime
from decimal import Decimal

from xrpl.clients import JsonRpcClient
from xrpl.core.binarycodec import decode, encode_for_signing
from xrpl.core.keypairs import is_valid_message
from xrpl.models import Response, Tx
from xrpl.models.transactions import NFTokenCreateOffer, NFTokenCreateOfferFlag
from xrpl.utils import datetime_to_ripple_time, xrp_to_drops

client = JsonRpcClient('https://xrplcluster.com/')


def create_listing(token_id: str, amount: Decimal, expiration: datetime) -> NFTokenCreateOffer:
    return NFTokenCreateOffer(
        nftoken_id=token_id,
        amount=xrp_to_drops(amount),
        expiration=datetime_to_ripple_time(expiration) if expiration is not None else None,
        destination='me',
        flags=NFTokenCreateOfferFlag.TF_SELL_NFTOKEN,
    )


def get_transaction_info(tx_hash: str) -> Response:
    return client.request(Tx(transaction=tx_hash))


def verify_signature(tx_blob: str) -> tuple[str, bool]:
    decoded_tx = decode(tx_blob)
    is_sig_valid = is_valid_message(
        bytes.fromhex(encode_for_signing(decoded_tx)),
        bytes.fromhex(decoded_tx['TxnSignature']),
        decoded_tx['SigningPubKey'],
    )
    return decoded_tx['Account'], is_sig_valid
