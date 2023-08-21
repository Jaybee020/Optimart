from rest_framework.generics import CreateAPIView, GenericAPIView, RetrieveUpdateAPIView

from accounts.models import Account
from accounts.serializers import AccountSerializer


class AccountActivityAPIView(GenericAPIView):
    # TODO: display activity
    ...


class CreateAccountAPIView(CreateAPIView):
    queryset = Account
    serializer_class = AccountSerializer


class AccountAPIView(RetrieveUpdateAPIView):
    queryset = Account
    lookup_field = 'address'
    serializer_class = AccountSerializer
