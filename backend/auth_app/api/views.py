"""REST endpoints for account registration and cookie-based JWT auth."""

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from .serializers import RegisterSerializer, LoginSerializer
from .services import (
    blacklist_refresh_token,
    clear_auth_cookies,
    set_auth_cookies,
)

from .authentication import CookieJWTAuthentication

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Create a user account from validated registration data."""

    serializer_class = RegisterSerializer
    permission_classes =  [AllowAny]


class LoginView(TokenObtainPairView):
    """Authenticate a user and return tokens in HTTP-only cookies."""

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]


    def post(self, request, *args, **kwargs):
        """Validate credentials and issue authentication cookies."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh = serializer.validated_data['refresh']
        access = serializer.validated_data['access']
        username = request.data.get("username")
        user = User.objects.get(username=username)
        user_data = {"id": user.id, "username": user.username, "email": user.email}
        response = Response(
            {"detail": "Login successful.", "user": user_data},
            status=status.HTTP_200_OK,
        )
        return set_auth_cookies(response, access, refresh)

class LogoutView(generics.GenericAPIView):
    """Revoke the refresh token and clear the browser authentication cookies."""

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """Blacklist the refresh token and remove both cookies."""
        refresh_token = request.COOKIES.get('refresh_token')
        blacklist_refresh_token(refresh_token)
        response = Response(
            {"detail": "Logout successful. Authentication cookies cleared."},
            status=status.HTTP_200_OK,
        )
        return clear_auth_cookies(response)



class TokenRefreshView(generics.GenericAPIView):
    """Issue a fresh access token using the refresh-token cookie."""

    permission_classes = [AllowAny]
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        """Validate the refresh cookie and replace the access cookie."""
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response(
                {"detail": "Refresh token missing"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        serializer = self.get_serializer(data={'refresh': refresh_token})
        serializer.is_valid(raise_exception=True)
        response = Response({"detail": "Token refreshed"}, status=status.HTTP_200_OK)
        return set_auth_cookies(response, serializer.validated_data["access"])


        