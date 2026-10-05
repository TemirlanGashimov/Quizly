"""External media and persistence services for quizzes."""

import os
import tempfile
from functools import lru_cache

import yt_dlp

from django.db import transaction
from dotenv import load_dotenv
from google import genai

from ..models import Quiz, Question
from .utils import extract_youtube_id, parse_quiz_response


load_dotenv()

QUIZ_PROMPT = """Generate a quiz from the transcript below and return only valid JSON.
Use this structure: title, description (maximum 150 characters), and questions.
Create exactly 10 questions, each with a question_title, exactly 4 distinct
question_options, and an answer that exactly matches one option.

Transcript:
"""


@lru_cache(maxsize=1)
def _get_whisper_model():
    """Load and cache the Whisper base model on first transcription."""
    import whisper

    return whisper.load_model("base")


def _audio_download_options(output_template):
    """Build yt-dlp options for downloading and converting audio to MP3."""
    return {
        "format": "bestaudio/best",
        "outtmpl": output_template,
        "quiet": True,
        "noplaylist": True,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
    }


def download_audio(url):
    """Download a YouTube video's audio and return its path and canonical URL."""
    video_id = extract_youtube_id(url)
    if not video_id:
        raise ValueError("Invalid YouTube URL.")
    youtube_url = f"https://www.youtube.com/watch?v={video_id}"
    tmp_file = tempfile.NamedTemporaryFile(delete=False)
    tmp_base = tmp_file.name
    tmp_file.close()
    os.remove(tmp_base)
    output_template = tmp_base + ".%(ext)s"
    with yt_dlp.YoutubeDL(_audio_download_options(output_template)) as ydl:
        ydl.download([youtube_url])
    return tmp_base + ".mp3", youtube_url


def transcribe_audio(audio_file):
    """Transcribe an audio file with the cached Whisper model."""
    result = _get_whisper_model().transcribe(audio_file)
    return result["text"]


def generate_quiz_from_transcript(transcript):
    """Generate and validate a ten-question quiz using Gemini Flash."""
    client = genai.Client()
    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=QUIZ_PROMPT + transcript,
    )
    return parse_quiz_response(response.text)


def _save_generated_quiz(quiz_data, youtube_url, user):
    """Persist a generated quiz and all its questions in one transaction."""
    quiz = Quiz.objects.create(
        user=user,
        title=quiz_data["title"],
        description=quiz_data["description"],
        video_url=youtube_url,
    )
    questions = [
        Question(quiz=quiz, **question_data)
        for question_data in quiz_data["questions"]
    ]
    Question.objects.bulk_create(questions)
    return quiz


def _remove_audio_file(audio_file):
    """Delete a temporary audio file when it exists."""
    if audio_file and os.path.exists(audio_file):
        os.remove(audio_file)


@transaction.atomic
def create_quiz_from_url(url, user):
    """Download, transcribe, generate, and save a quiz for one user."""
    audio_file = None
    try:
        audio_file, youtube_url = download_audio(url)
        transcript = transcribe_audio(audio_file)
        if not transcript.strip():
            raise ValueError("The video could not be transcribed.")
        quiz_data = generate_quiz_from_transcript(transcript)
        return _save_generated_quiz(quiz_data, youtube_url, user)
    finally:
        _remove_audio_file(audio_file)