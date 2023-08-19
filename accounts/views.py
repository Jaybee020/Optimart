from rest_framework.generics import GenericAPIView
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin


class AccountActivityAPIView(GenericAPIView):
    # TODO: display activity
    ...


class AccountAPIView(GenericAPIView, CreateModelMixin, RetrieveModelMixin):
    # TODO: create and retrieve account
    ...
