"""Pure validation and parsing helpers for quiz generation."""

import json
import re
from urllib.parse import parse_qs, urlparse


YOUTUBE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{11}$")


def extract_youtube_id(url):
    """Return an 11-character video ID from a supported YouTube URL."""
    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()
    path_parts = [part for part in parsed.path.split("/") if part]

    if hostname in {"youtu.be", "www.youtu.be"} and path_parts:
        video_id = path_parts[0]
    elif hostname in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
        video_id = _youtube_id_from_path(parsed.path, parsed.query, path_parts)
    else:
        return None

    return video_id if YOUTUBE_ID_PATTERN.fullmatch(video_id or "") else None


def _youtube_id_from_path(path, query, path_parts):
    """Extract an ID from a standard, embed, Shorts, or live URL."""
    if path == "/watch":
        return parse_qs(query).get("v", [None])[0]
    if len(path_parts) > 1 and path_parts[0] in {"embed", "shorts", "live"}:
        return path_parts[1]
    return None


def parse_quiz_response(response_text):
    """Parse Gemini's JSON response and validate its quiz structure."""
    if not response_text:
        raise ValueError("Gemini returned an empty response.")
    try:
        quiz_data = json.loads(_strip_json_fence(response_text))
    except json.JSONDecodeError as error:
        raise ValueError("Gemini returned invalid JSON.") from error
    validate_quiz_data(quiz_data)
    return quiz_data


def _strip_json_fence(response_text):
    """Remove an optional Markdown code fence around a JSON response."""
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


def validate_quiz_data(quiz_data):
    """Raise ValueError unless a generated quiz has the required shape."""
    if not isinstance(quiz_data, dict):
        raise ValueError("Quiz data must be an object.")
    if not isinstance(quiz_data.get("title"), str) or not quiz_data["title"].strip():
        raise ValueError("Quiz title is missing.")
    _validate_description(quiz_data.get("description"))
    questions = quiz_data.get("questions")
    if not isinstance(questions, list) or len(questions) != 10:
        raise ValueError("Quiz must contain exactly 10 questions.")
    for question in questions:
        _validate_question(question)


def _validate_description(description):
    """Require a non-empty quiz description of at most 150 characters."""
    if not isinstance(description, str) or not description.strip():
        raise ValueError("Quiz description is missing.")
    if len(description) > 150:
        raise ValueError("Quiz description is longer than 150 characters.")


def _validate_question(question):
    """Require four unique options and one matching correct answer."""
    if not isinstance(question, dict) or not question.get("question_title"):
        raise ValueError("Question title is missing.")
    options = question.get("question_options")
    if not isinstance(options, list) or len(options) != 4:
        raise ValueError("Each question must contain exactly 4 options.")
    if not all(isinstance(option, str) and option.strip() for option in options):
        raise ValueError("Question options must be non-empty strings.")
    if len(set(options)) != 4:
        raise ValueError("Question options must be distinct.")
    if question.get("answer") not in options:
        raise ValueError("The correct answer must be one of the question options.")