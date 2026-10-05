"""Authenticated REST endpoints for generating and managing quizzes."""

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Quiz

from auth_app.api.authentication import CookieJWTAuthentication

from .permissions import IsQuizOwner
from .serializers import (
    QuizCreateResponseSerializer,
    QuizCreateSerializer,
    QuizSerializer,
)
from .services import create_quiz_from_url


class QuizListCreateView(generics.GenericAPIView):
    """List the current user's quizzes or generate one from a URL."""

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return all quizzes owned by the authenticated user."""
        quizzes = Quiz.objects.filter(user=request.user)
        serializer = QuizSerializer(quizzes, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        """Generate a quiz from a validated YouTube URL."""
        serializer = QuizCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quiz = create_quiz_from_url(serializer.validated_data["url"], request.user)
        response_data = QuizCreateResponseSerializer(quiz).data
        return Response(response_data, status=status.HTTP_201_CREATED)

class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a quiz owned by the requester."""

    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated, IsQuizOwner]
    serializer_class = QuizSerializer
    queryset = Quiz.objects.all()
