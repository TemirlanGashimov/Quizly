# Quizly

Quizly is a Django REST API that lets registered users create and manage quizzes from YouTube videos. It downloads a video's audio with `yt-dlp` and FFmpeg, transcribes it locally with Whisper, and asks Google Gemini Flash to generate a validated ten-question multiple-choice quiz. The API also provides account registration, JWT cookie authentication, and user-owned quiz endpoints.

## Contents

- [Quickstart](#quickstart)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Tests](#tests)
- [Notes](#notes)
- [Contributing](#contributing)
- [License](#license)

## Quickstart

### Prerequisites

- Python 3.12 or newer
- FFmpeg installed and available on `PATH` (`ffmpeg -version` should succeed)
- A Google Gemini API key
- Internet access for YouTube downloads and Gemini requests

### Setup

From the repository root, run:

```powershell
python -m venv backend/.venv
.\backend\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
if (-not (Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Edit `backend/.env` and set `DJANGO_SECRET_KEY` to a fresh random value and `GEMINI_API_KEY` to your Google AI Studio API key. Then initialize and start the backend:

```powershell
Set-Location backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/api/`; Django Admin is at `http://127.0.0.1:8000/admin/`.

## Usage

All API routes are prefixed with `/api/`. Authentication tokens are returned as HTTP-only cookies; clients should retain and send cookies rather than read tokens from response JSON.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/register/` | Register with `username`, `email`, `password`, and `confirmed_password`. |
| `POST` | `/api/login/` | Authenticate with `username` and `password`; sets access and refresh cookies. |
| `POST` | `/api/token/refresh/` | Use the refresh cookie to issue a new access cookie. |
| `POST` | `/api/logout/` | Blacklist the refresh token and clear both authentication cookies. |
| `GET` | `/api/quizzes/` | List the authenticated user's quizzes. |
| `POST` | `/api/quizzes/` | Create a quiz from a JSON body such as `{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}`. |
| `GET`, `PATCH`, `DELETE` | `/api/quizzes/<id>/` | Retrieve, update metadata, or delete a quiz owned by the authenticated user. |

Generated quizzes contain ten questions with four distinct options each. The answer must match one of the options. Quiz owners can also edit quizzes and individual questions in Django Admin.

## Project Structure

```text
.
|-- README.md
|-- requirements.txt
`-- backend/
    |-- manage.py
    |-- core/                 # Django settings and root URL configuration
    |-- auth_app/             # Registration and JWT cookie authentication
    |   `-- api/
    |-- quizz_app/            # Quiz and question models, admin, and API
    |   `-- api/
    |       |-- services.py   # Download, transcription, generation, persistence
    |       `-- utils.py      # URL parsing and generated-payload validation
    `-- db.sqlite3            # Local development database (ignored by Git)
```

## Tests

Run Django's system checks and test suite from the repository root:

```powershell
Push-Location backend
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py test
Pop-Location
```

The tests cover account registration, secure production cookie flags, refresh-token blacklisting, YouTube URL parsing, generated quiz validation, and quiz persistence. External downloads, Whisper inference, and Gemini generation are mocked in tests.

## Notes

- Whisper's `base` model is loaded on the first transcription and cached for later requests. Its model download and inference can take time and use significant memory.
- Audio extraction requires FFmpeg. Gemini generation requires `GEMINI_API_KEY` and an outbound network connection.
- The endpoint that generates a quiz runs download, transcription, and Gemini generation synchronously. Long videos may exceed a production request timeout.
- `DJANGO_DEBUG` defaults to `true` for local development. Production deployments must set `DJANGO_DEBUG=false`, provide a strong `DJANGO_SECRET_KEY`, and set `DJANGO_ALLOWED_HOSTS`.
- In production, authentication cookies are `Secure`, `HttpOnly`, and `SameSite=Lax`. Local development disables the `Secure` cookie flag so cookies work over the default HTTP development server.
- The current repository contains the backend only. The checklist's frontend, dashboard/sidebar, quiz play and progress persistence, scoring/review, privacy policy, and legal notice stories are not implemented here. Cross-origin frontend integration and deployment-specific CSRF/CORS policy also remain to be configured before production use.
- Logged-out access tokens remain valid until their short expiry; logout blacklists the refresh token and clears browser cookies. This backend does not maintain an access-token blacklist.
- Do not commit `.env`, API keys, production secrets, or the local SQLite database.

## Contributing

Keep changes focused, use `snake_case` for Python functions and variables, add PEP 257 docstrings to modules and public classes/functions, and add tests for behavior changes. Run `manage.py check` and `manage.py test` before submitting a change. Keep business workflows in app services and pure parsing/validation helpers in `utils.py`.

## License

No license has been specified for this repository yet. All rights are reserved by default; add a license before redistributing the project.
