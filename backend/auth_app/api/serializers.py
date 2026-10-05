"""Serializers for account registration and credential validation."""

from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework.exceptions import AuthenticationFailed


class RegisterSerializer(serializers.ModelSerializer):
    """Validate registration data and create a password-hashed user."""

    confirmed_password = serializers.CharField(write_only=True)

    class Meta:
        """Define fields and write-only password behavior."""

        model = User
        fields = ['username', 'password', 'confirmed_password', 'email']
        extra_kwargs = {
            'password': {
                'write_only':True
                },
            'email': {
                'required': True
            }
        }

    def validate_confirmed_password(self, value):
        """Reject confirmation values that do not match the password."""
        password = self.initial_data.get('password')
        if password and value and password != value:
            raise serializers.ValidationError("Passwords do not match.")
        return value

    def validate_email(self, value):
        """Reject an email address already assigned to an account."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def save(self):
        """Create the account while hashing the submitted password."""
        pw = self.validated_data['password']

        account = User(
            email=self.validated_data['email'],
            username=self.validated_data['username'],
        )
        account.set_password(pw)
        account.save()
        return account

User = get_user_model()

class LoginSerializer(TokenObtainPairSerializer):
    """Validate username and password before issuing a JWT pair."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Authenticate the username and return SimpleJWT token data."""
        user = self._get_validated_user(attrs)
        attrs['username'] = user.username
        return super().validate(attrs)

    def _get_validated_user(self, attrs):
        """Return the matching user or raise a generic authentication error."""
        username = attrs.get("username")
        password = attrs.get("password")
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid username or password.")
        if not user.check_password(password):
            raise AuthenticationFailed("Invalid username or password.")
        return user
