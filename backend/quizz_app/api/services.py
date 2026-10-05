import json
import os
import tempfile

import whisper
import yt_dlp

from django.db import transaction
from dotenv import load_dotenv
from google import genai

from ..models import Quiz, Question
from .utils import extract_youtube_id


load_dotenv()

whisper_model = whisper.load_model("base")


def download_audio(url):
    video_id = extract_youtube_id(url)

    if not video_id:
        raise ValueError("Invalid YouTube URL.")

    youtube_url = f"https://www.youtube.com/watch?v={video_id}"

    tmp_file = tempfile.NamedTemporaryFile(
        delete=False
    )

    tmp_base = tmp_file.name
    tmp_file.close()

    os.remove(tmp_base)

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": tmp_base + ".%(ext)s",
        "quiet": True,
        "noplaylist": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])

    tmp_filename = tmp_base + ".mp3"

    return tmp_filename, youtube_url


def transcribe_audio(audio_file):
    result = whisper_model.transcribe(audio_file)

    return result["text"]


def generate_quiz_from_transcript(transcript):
    client = genai.Client()

    prompt = f"""
Based on the following transcript, generate a quiz in valid JSON format.

The quiz must follow this exact structure:

{{
    "title": "Create a concise quiz title based on the topic of the transcript.",
    "description": "Summarize the transcript in no more than 150 characters. Do not include any quiz questions or answers.",
    "questions": [
        {{
            "question_title": "The question goes here.",
            "question_options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            "answer": "The correct answer from the above options"
        }}
    ]
}}

Requirements:
- Create exactly 10 questions.
- Each question must have exactly 4 distinct options.
- Only one option may be correct.
- The value of "answer" must be exactly one of the values in "question_options".
- The description must contain no more than 150 characters.
- Return valid JSON that can be parsed using json.loads().
- Do not return any text outside the JSON.

Transcript:

{transcript}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    if not response.text:
        raise ValueError("Gemini returned an empty response.")

    response_text = response.text.strip()

    if response_text.startswith("```json"):
        response_text = response_text[7:]
    elif response_text.startswith("```"):
        response_text = response_text[3:]

    if response_text.endswith("```"):
        response_text = response_text[:-3]

    response_text = response_text.strip()

    quiz_data = json.loads(response_text)

    validate_quiz_data(quiz_data)

    return quiz_data


def validate_quiz_data(quiz_data):
    if "title" not in quiz_data:
        raise ValueError("Quiz title is missing.")

    if "description" not in quiz_data:
        raise ValueError("Quiz description is missing.")

    if len(quiz_data["description"]) > 150:
        raise ValueError("Quiz description is longer than 150 characters.")

    questions = quiz_data.get("questions")

    if not isinstance(questions, list):
        raise ValueError("Questions must be a list.")

    if len(questions) != 10:
        raise ValueError("Quiz must contain exactly 10 questions.")

    for question in questions:
        question_title = question.get("question_title")
        options = question.get("question_options")
        answer = question.get("answer")

        if not question_title:
            raise ValueError("Question title is missing.")

        if not isinstance(options, list):
            raise ValueError("Question options must be a list.")

        if len(options) != 4:
            raise ValueError("Each question must contain exactly 4 options.")

        if len(set(options)) != 4:
            raise ValueError("Question options must be distinct.")

        if answer not in options:
            raise ValueError(
                "The correct answer must be one of the question options."
            )


@transaction.atomic
def create_quiz_from_url(url, user):
    audio_file = None

    try:
        audio_file, youtube_url = download_audio(url)

        transcript = transcribe_audio(audio_file)

        if not transcript.strip():
            raise ValueError("The video could not be transcribed.")

        quiz_data = generate_quiz_from_transcript(transcript)

        quiz = Quiz.objects.create(
            user=user,
            title=quiz_data["title"],
            description=quiz_data["description"],
            video_url=youtube_url
        )

        for question_data in quiz_data["questions"]:
            Question.objects.create(
                quiz=quiz,
                question_title=question_data["question_title"],
                question_options=question_data["question_options"],
                answer=question_data["answer"]
            )

        return quiz

    finally:
        if audio_file and os.path.exists(audio_file):
            os.remove(audio_file)