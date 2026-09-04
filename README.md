# Live Session Toolkit

A responsive web application for live interactive sessions, built around the PRD priorities: Interactive Polls & Quizzes, Instant Feedback, and Automatic Answer Evaluation.

## Stack

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: FastAPI + Python
- Database: PostgreSQL or SQLite for local development
- ORM: SQLAlchemy
- Real-time: WebSockets
- Auth: JWT
- Optional AI: Anthropic API

## New Google-Forms-inspired authoring

The activity builder now supports:

- Quiz as the default mode, with an independent Quiz/Poll toggle on every question
- 1–20 questions per activity
- Short answer and paragraph responses
- Multiple choice, checkboxes, and drop-down
- File upload (10 MB local upload endpoint)
- Linear scale and rating
- Multiple-choice grid and tick-box grid
- Sections
- Image/video URL helpers
- Import questions from JSON or text
- Preview, undo/redo, theme toggle, and share/copy helpers

The existing core live-session flow remains: facilitator creates/launches an activity, participants join by code/QR, responses arrive through WebSockets, and supported quiz answers are evaluated automatically.

## Important after upgrading an existing local database

The backend includes a small compatibility migration for the new question/response columns. If you have an old `dev.db`, restart the backend once so it can add the new columns. For a clean class-project database, deleting `backend/dev.db` and starting the backend again is also fine.
