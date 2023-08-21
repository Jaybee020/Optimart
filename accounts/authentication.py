from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

from services.xrpl import XRPLClient

from .models import Account


class XRPLWalletAuthentication(TokenAuthentication):
    keyword = 'Signature'

    def authenticate_credentials(self, key):
        try:
            address, is_valid = XRPLClient.verify_signature(key)
        except Exception as e:  # noqa: BLE001
            raise AuthenticationFailed(f'Authentication failed due to {e!s}') from e

        if not is_valid:
            raise AuthenticationFailed('Invalid signature provided')

        try:
            account = Account.objects.get(address=address)
        except Account.DoesNotExist as e:
            raise AuthenticationFailed('Invalid token provided') from e

        return (account,)
