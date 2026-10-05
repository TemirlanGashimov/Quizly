"""Tests for YouTube parsing and quiz-generation services."""

from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase
from rest_framework.test import APITestCase

from .api.services import create_quiz_from_url
from .api.utils import extract_youtube_id, parse_quiz_response, validate_quiz_data
from .models import Question, Quiz


def make_quiz_data():
    """Return a valid ten-question quiz payload for tests."""
    return {
        "title": "Test quiz",
        "description": "A quiz used in tests.",
        "questions": [
            {
                "question_title": f"Question {index}",
                "question_options": ["A", "B", "C", "D"],
                "answer": "A",
            }
            for index in range(10)
        ],
    }


def make_quiz(user, title, description):
    """Create a quiz fixture owned by the provided user."""
    return Quiz.objects.create(
        user=user,
        title=title,
        description=description,
        video_url="https://youtu.be/dQw4w9WgXcQ",
    )


class YouTubeUrlTests(SimpleTestCase):
    """Verify supported YouTube URL formats and reject other hosts."""

    def test_extracts_video_id_from_common_youtube_urls(self):
        """Standard, short, Shorts, and embed URLs return the same ID."""
        video_id = "dQw4w9WgXcQ"
        urls = (
            f"https://www.youtube.com/watch?v={video_id}",
            f"https://youtu.be/{video_id}",
            f"https://youtube.com/shorts/{video_id}",
            f"https://www.youtube.com/embed/{video_id}",
        )

        self.assertEqual([extract_youtube_id(url) for url in urls], [video_id] * 4)

    def test_rejects_non_youtube_or_malformed_urls(self):
        """Only valid eleven-character IDs from YouTube hosts are accepted."""
        self.assertIsNone(extract_youtube_id("https://example.com/watch?v=dQw4w9WgXcQ"))
        self.assertIsNone(extract_youtube_id("https://youtu.be/short"))


class QuizPayloadTests(SimpleTestCase):
    """Verify generated quiz JSON meets the application contract."""

    def test_parses_fenced_json(self):
        """A Markdown JSON fence is removed before parsing."""
        import json

        payload = make_quiz_data()
        response = f"```json\n{json.dumps(payload)}\n```"
        self.assertEqual(parse_quiz_response(response), payload)

    def test_rejects_wrong_question_count(self):
        """Generated quizzes must contain exactly ten questions."""
        payload = make_quiz_data()
        payload["questions"].pop()
        with self.assertRaisesMessage(ValueError, "exactly 10 questions"):
            validate_quiz_data(payload)

    def test_rejects_answer_outside_options(self):
        """Every correct answer must exactly match one available option."""
        payload = make_quiz_data()
        payload["questions"][0]["answer"] = "E"
        with self.assertRaisesMessage(ValueError, "one of the question options"):
            validate_quiz_data(payload)


class QuizGenerationServiceTests(TestCase):
    """Verify generated quiz data is saved for its requesting user."""

    @patch("quizz_app.api.services.generate_quiz_from_transcript")
    @patch("quizz_app.api.services.transcribe_audio", return_value="Transcript")
    @patch("quizz_app.api.services.download_audio")
    def test_create_quiz_saves_questions(
        self, download_audio, transcribe_audio, generate_quiz
    ):
        """The generation pipeline persists its quiz and all questions."""
        user = get_user_model().objects.create_user(username="quiz-user")
        download_audio.return_value = ("/tmp/audio.mp3", "https://youtu.be/dQw4w9WgXcQ")
        generate_quiz.return_value = make_quiz_data()

        quiz = create_quiz_from_url("https://youtu.be/dQw4w9WgXcQ", user)

        self.assertEqual(Quiz.objects.get(pk=quiz.pk).user, user)
        self.assertEqual(Question.objects.filter(quiz=quiz).count(), 10)
        transcribe_audio.assert_called_once_with("/tmp/audio.mp3")


class QuizOwnershipApiTests(APITestCase):
    """Verify quiz list and detail permissions are scoped to the owner."""

    def setUp(self):
        """Create two users and one quiz for each user."""
        self.user = get_user_model().objects.create_user(username="owner")
        self.quiz = make_quiz(self.user, "Owned quiz", "Owned")
        self.other_quiz = make_quiz(
            get_user_model().objects.create_user(username="other"),
            "Other quiz",
            "Private",
        )
        self.client.force_authenticate(user=self.user)

    def test_quiz_list_contains_only_current_users_quizzes(self):
        """The list endpoint does not expose another user's quizzes."""
        response = self.client.get("/api/quizzes/")
        self.assertEqual([item["id"] for item in response.data], [self.quiz.pk])

    def test_non_owner_cannot_update_quiz(self):
        """Object permissions prevent changing another user's quiz."""
        response = self.client.patch(
            f"/api/quizzes/{self.other_quiz.pk}/", {"title": "Changed"}
        )
        self.assertEqual(response.status_code, 403)

    def test_owner_can_update_quiz_metadata(self):
        """The quiz owner can update editable metadata fields."""
        response = self.client.patch(
            f"/api/quizzes/{self.quiz.pk}/", {"title": "Updated title"}
        )
        self.assertEqual(response.status_code, 200)
        self.quiz.refresh_from_db()
        self.assertEqual(self.quiz.title, "Updated title")
