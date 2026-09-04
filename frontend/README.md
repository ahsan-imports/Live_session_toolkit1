# Live Session Toolkit — Frontend

Next.js 14 (App Router) + TypeScript + Tailwind. Covers both flows from
the PRD:

- **Facilitator:** log in, create a session, build polls/quizzes (by hand
  or drafted by AI), launch the session (code + QR), watch responses come
  in live, close activities, review results and an AI-generated summary.
- **Participant** (`/join`): join by code, wait in a lobby, answer
  questions one at a time with instant feedback (correct/incorrect for
  quizzes, a confirmation for polls), and see a final score + rank once
  the facilitator ends the session.

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Runs at `http://localhost:3000`. Make sure the backend is running first
(see `../backend/README.md`) — `.env.local` points at `http://localhost:8000`
by default.

## Trying it out end-to-end

1. Sign up, then create a session.
2. Add a poll or a quiz — either build it by hand, or click **✨ Generate
   questions with AI**, give it a topic, and review/edit the draft before
   saving (needs `ANTHROPIC_API_KEY` set on the backend).
3. Launch the session — you'll see the code + QR panel.
4. Open `http://localhost:3000/join` in another tab (or scan the QR from a
   phone on the same network), enter the code, and join as a participant.
5. Back in the facilitator tab, launch the poll/quiz. Answer it from the
   `/join` tab — you'll get instant feedback there, and the bars update
   live in the facilitator view.
6. Close the activity, end the session (participants see a final score +
   rank), and check the leaderboard and **✨ Summarize with AI** on the
   results page.

## Structure

```
app/
  page.tsx                 Login
  signup/page.tsx           Sign up
  dashboard/page.tsx        List + create sessions
  session/[id]/page.tsx     Build activities, launch, live results
  session/[id]/results/     Post-session breakdown + leaderboard
  join/page.tsx             Minimal participant page (for testing)
components/                 Shared UI (builder form, QR panel, live bars…)
lib/
  api.ts                    Typed fetch wrapper for the backend
  auth-context.tsx          JWT auth state
  useSessionSocket.ts        WebSocket hook for live updates
  types.ts                  Shared types matching the backend schemas
```

## A note on the Next.js version

This scaffold pins `next@14.2.35`, the final security-patched release on
the 14.x line. Next.js 14 has since reached end-of-life — for anything
beyond a class project, plan to move to a currently supported major version
(15.x/16.x) before relying on this in production.
