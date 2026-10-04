from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer

from .authentication import CookieJWTAuthentication

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes =  [AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]


    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh = serializer.validated_data['refresh']
        access = serializer.validated_data['access']

        username = request.data.get("username")
        user = User.objects.get(username=username)

        response = Response({"detail": "Login successful.", 
                             "user":{ 
                                 "id": user.id,
                                 "username": user.username,
                                 "email": user.email,
                                 }
                            },
                            status=status.HTTP_200_OK)

        response.set_cookie(
            key='access_token',
            value=str(access),
            httponly=True,
            secure=True, 
            samesite="Lax"
        )

        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite="Lax"
        )

        return response

class LogoutView(generics.GenericAPIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        token = RefreshToken(refresh_token)
        token.blacklist()
        response = Response({"detail": "Log-Out successfully! All Tokens will be deleted. Refresh token is now invalid."}, status=status.HTTP_200_OK)

        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')

        return response
