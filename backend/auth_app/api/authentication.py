"""JWT authentication using the access-token cookie."""

from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """Authenticate requests with the HTTP-only access-token cookie."""

    def authenticate(self, request):
        """Return the authenticated user and token, or None without a cookie."""
        access_token = request.COOKIES.get("access_token")
        if not access_token:
            return None
        validated_token = self.get_validated_token(access_token)
        user = self.get_user(validated_token)
        return (user, validated_token)
