"""Object-level permissions for user-owned quizzes."""

from rest_framework.permissions import BasePermission


class IsQuizOwner(BasePermission):
    """Allow access only to the user who owns the quiz object."""

    def has_object_permission(self, request, view, obj):
        """Return whether the request user owns the requested object."""
        return obj.user == request.user