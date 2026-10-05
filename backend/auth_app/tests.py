"""Tests for account registration, login, and token revocation."""

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .api.services import blacklist_refresh_token


User = get_user_model()


class AuthenticationServiceTests(TestCase):
    """Verify refresh-token revocation behavior."""

    def test_blacklist_refresh_token_revokes_token(self):
        """A valid refresh token cannot be used after blacklisting."""
        user = User.objects.create_user(username="tester", password="password123")
        token = str(RefreshToken.for_user(user))

        self.assertTrue(blacklist_refresh_token(token))
        with self.assertRaises(TokenError):
            RefreshToken(token).check_blacklist()

    def test_blacklist_refresh_token_rejects_invalid_token(self):
        """An invalid token is reported without raising an exception."""
        self.assertFalse(blacklist_refresh_token("not-a-token"))


class AuthenticationApiTests(TestCase):
    """Verify the public account API endpoints."""

    def setUp(self):
        """Create an API client for each test."""
        self.client = APIClient()

    def test_registration_creates_user(self):
        """Valid registration data creates a password-hashed user."""
        payload = {
            "username": "new-user",
            "email": "new@example.com",
            "password": "StrongPass123!",
            "confirmed_password": "StrongPass123!",
        }
        response = self.client.post("/api/register/", payload, format="json")
        self.assertEqual(response.status_code, 201)
        registered_user = User.objects.get(username="new-user")
        self.assertTrue(registered_user.check_password("StrongPass123!"))

    @override_settings(DEBUG=False)
    def test_login_sets_secure_http_only_cookies(self):
        """Production login returns access and refresh cookies securely."""
        User.objects.create_user(username="tester", password="password123")

        response = self.client.post(
            "/api/login/",
            {"username": "tester", "password": "password123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        for cookie_name in ("access_token", "refresh_token"):
            self.assertTrue(response.cookies[cookie_name]["httponly"])
            self.assertTrue(response.cookies[cookie_name]["secure"])

    @override_settings(DEBUG=False)
    def test_refresh_uses_refresh_cookie(self):
        """The refresh endpoint issues a secure access-token cookie."""
        user = User.objects.create_user(username="refresh-user")
        self.client.cookies["refresh_token"] = str(RefreshToken.for_user(user))
        response = self.client.post("/api/token/refresh/", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.cookies["access_token"]["secure"])

    @override_settings(DEBUG=False)
    def test_logout_blacklists_refresh_and_deletes_cookies(self):
        """Logout revokes the refresh token and expires both cookies."""
        user = User.objects.create_user(username="logout-user")
        refresh_token = RefreshToken.for_user(user)
        self.client.cookies["access_token"] = str(refresh_token.access_token)
        self.client.cookies["refresh_token"] = str(refresh_token)
        response = self.client.post("/api/logout/", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.cookies["access_token"]["max-age"] == 0)
        with self.assertRaises(TokenError):
            RefreshToken(str(refresh_token)).check_blacklist()
