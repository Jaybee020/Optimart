from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):  # noqa: ARG002
        return request.user.address == obj.address
