# Live Session Toolkit API

FastAPI backend for the Live Session Toolkit.

## Local setup

```bash
cd backend
python -m venv venv
# Git Bash on Windows:
source venv/Scripts/activate
# PowerShell:
# .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
```

For the easiest local setup, use SQLite in `.env`:

```env
DATABASE_URL=sqlite:///./dev.db
```

Then run:

```bash
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs`.

## Question types

The API supports Google-Forms-inspired types: short answer, paragraph, multiple choice, checkboxes, dropdown, file upload, linear scale, rating, multiple-choice grid, and checkbox grid.

Each question has its own `mode` (`quiz` or `poll`), so a single activity can contain a mixture of quiz and poll questions. Quiz questions can define correct options/values for automatic evaluation; subjective questions can remain unevaluated or be assisted by AI later.

## Anthropic AI

Add your API key to `backend/.env`:

```env
ANTHROPIC_API_KEY=your-key-here
```

Never commit `.env` or the key to GitHub. `.gitignore` already excludes it.
