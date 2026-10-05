"""Database models for quizzes and their multiple-choice questions."""

from django.db import models
from django.conf import settings


class Quiz(models.Model):
    """A user-owned quiz generated from a YouTube video."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="quizzes",
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    video_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Return the quiz title for admin and debugging displays."""
        return self.title


class Question(models.Model):
    """A multiple-choice question belonging to one quiz."""

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question_title = models.CharField(max_length=255)
    question_options = models.JSONField()
    answer = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Return the question title for admin and debugging displays."""
        return self.question_title