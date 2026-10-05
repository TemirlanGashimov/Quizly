# Quizly Frontend

![Quizzy Logo](/assets/icons/logoheader.png)

## Project Overview

Quizly is an interactive quiz application that allows users to create, take, and manage quizzes. The application features a modern UI with a dark theme and green accents, providing an engaging user experience.

## Features

- **User Authentication**: Register, login, and logout functionality
- **Quiz Generation**: Create quizzes from Youtube-URLs
- **Quiz Taking**: Interactive quiz interface with multiple-choice questions
- **Results Review**: View quiz results with correct/incorrect answers
- **Quiz Management**: View, edit, and delete quizzes

## Requirements

- The backend must support **JWT authentication** with **HttpOnly cookies**. This means:
    - The login response must set the JWT access token as an HttpOnly cookie.
    - Requests to protected routes must be authenticated via this cookie.
    - The frontend must not have direct access to the token (e.g., no localStorage or Authorization header).
    - Make sure your backend correctly allows cross-origin requests (CORS) for the local frontend.
---

## Project Structure

```
Quizzy_frontend/
├── assets/               # Static assets
│   ├── fonts/            # Font files
│   ├── icons/            # Icon images
│   └── img/              # Other images
├── pages/                # HTML pages
│   ├── legalnotice.html  # Legal notice page
│   ├── library.html      # Quiz library page
│   ├── login.html        # Login page
│   ├── privacy.html      # Privacy policy page
│   ├── quiz.html         # Quiz taking page
│   ├── quizoverview.html # Quiz overview page
│   └── registration.html # Registration page
├── shared/               # Shared resources
│   ├── css/              # CSS stylesheets
│   │   ├── auth.css      # Authentication styles
│   │   ├── fonts.css     # Font definitions
│   │   ├── library.css   # Library page styles
│   │   ├── policy.css    # Policy pages styles
│   │   ├── quiz.css      # Quiz page styles
│   │   ├── quizoverview.css # Quiz overview styles
│   │   ├── standart.css  # Base styles
│   │   ├── toastmsg.css  # Toast message styles
│   │   └── variables.css # CSS variables
│   └── js/               # JavaScript files
│       ├── api.js        # API interaction functions
│       ├── auth.js       # Authentication functions
│       ├── config.js     # Configuration constants
│       ├── header.js     # Header component
│       ├── helper.js     # Helper functions
│       ├── library.js    # Library page functions
│       ├── quiz.js       # Quiz functionality
│       ├── quizoverview.js # Quiz overview functions
│       └── template.js   # HTML templates
├── index.html            # Main entry point
└── styles.css            # Global styles
```

## Setup and Installation

1. Clone the repository
2. Ensure you have the backend API running at http://127.0.0.1:8000
3. Open the project in a web server (e.g., Live Server in VS Code)
4. Navigate to the index.html file to start the application

