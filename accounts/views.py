from rest_framework.generics import CreateAPIView, GenericAPIView, RetrieveAPIView
from rest_framework.mixins import UpdateModelMixin

from accounts.models import Account
from accounts.serializers import AccountSerializer


class AccountActivityAPIView(GenericAPIView):
    # TODO: display activity
    ...


class CreateAccountAPIView(CreateAPIView):
    queryset = Account
    serializer_class = AccountSerializer


class AccountAPIView(RetrieveAPIView, UpdateModelMixin):
    queryset = Account
    lookup_field = 'address'
    serializer_class = AccountSerializer

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
