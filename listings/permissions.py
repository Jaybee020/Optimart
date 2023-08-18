from rest_framework.permissions import BasePermission


class IsOwnListing(BasePermission):
    def has_object_permission(self, request, view, obj):  # noqa: ARG002
        if request.method == 'GET':
            return True

        return request.user.address == obj.creator.address
