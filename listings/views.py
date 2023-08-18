from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework.mixins import CreateModelMixin, ListModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


from .enums import ListingStatus
from .models import Listing
from .serializers import CreateListingSerializer, ListingSerializer


class OngoingListingCheckView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):  # noqa: ARG002
        if Listing.objects.filter(creator=self.request.user, status=ListingStatus.ONGOING).exists():
            return Response(data={'detail': 'An ongoing listing already exists.'}, status=status.HTTP_409_CONFLICT)

        return Response(data={'detail': 'Proceed with listing creation.'}, status=status.HTTP_200_OK)


class ListingsAPIView(GenericAPIView, CreateModelMixin, ListModelMixin):
    queryset = Listing.objects.get_queryset()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ListingSerializer

        if self.request.method == 'POST':
            return CreateListingSerializer

        return None

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)
