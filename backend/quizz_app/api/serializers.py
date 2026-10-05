"""Serializers for quiz, question, and quiz-generation payloads."""

from rest_framework import serializers

from ..models import Question, Quiz


class QuestionSerializer(serializers.ModelSerializer):
    """Serialize a quiz question and its answer options."""

    class Meta:
        """Define the fields exposed for a question."""

        model = Question
        fields = [
            "id",
            "question_title",
            "question_options",
            "answer"
        ]


class QuestionCreateResponseSerializer(serializers.ModelSerializer):
    """Serialize a newly created question including timestamps."""

    class Meta:
        """Define the creation response fields for a question."""

        model = Question
        fields = [
            "id",
            "question_title",
            "question_options",
            "answer",
            "created_at",
            "updated_at"
        ]


class QuizSerializer(serializers.ModelSerializer):
    """Serialize a quiz and its related questions for API responses."""

    questions = QuestionSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        """Define the fields exposed for a quiz."""

        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "created_at",
            "updated_at",
            "video_url",
            "questions"
        ]


class QuizCreateResponseSerializer(serializers.ModelSerializer):
    """Serialize a generated quiz with question timestamps."""

    questions = QuestionCreateResponseSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        """Define the quiz fields returned immediately after generation."""

        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "created_at",
            "updated_at",
            "video_url",
            "questions"
        ]


class QuizCreateSerializer(serializers.Serializer):
    """Validate the URL submitted to create a quiz."""

    url = serializers.URLField()