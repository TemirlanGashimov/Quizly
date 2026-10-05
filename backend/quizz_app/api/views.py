from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from auth_app.api.authentication import CookieJWTAuthentication

from .serializers import QuizCreateSerializer, QuizSerializer
from .services import create_quiz_from_url


class QuizCreateView(generics.GenericAPIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = QuizCreateSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        url = serializer.validated_data["url"]

        quiz = create_quiz_from_url(
            url=url,
            user=request.user
        )

        response_serializer = QuizSerializer(quiz)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )