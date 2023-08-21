from rest_framework.permissions import BasePermission


class IsListingOwner(BasePermission):
    """Allows access only to the owner of the listing."""

    def has_object_permission(self, request, view, obj):  # noqa: ARG002
        if request.method == 'GET':
            return True

        return request.user.address == obj.creator.address


class IsOfferOwner(BasePermission):
    """Allows access only to the owner of the offer."""

    def has_object_permission(self, request, view, obj):  # noqa: ARG002
        if request.method == 'GET':
            return True

        return request.user.address == obj.creator.address


class IsOfferForListingOwner(BasePermission):
    """Allows access only to the owner of the listing the offer was made to."""

    def has_object_permission(self, request, view, obj):  # noqa: ARG002
        if request.method == 'GET':
            return True

        return request.user.address == obj.listing.owner.address
