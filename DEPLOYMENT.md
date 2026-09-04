# Deploying Live Session Toolkit

This walks through putting the app on the internet using **Railway** for the
backend + database and **Vercel** for the frontend — both have free tiers
and don't need you to touch a server. Swap in Render/Fly.io/your own VPS for
the backend if you prefer; the `Dockerfile` in `backend/` works anywhere
that runs containers.

## 0. Push the code to GitHub

```bash
cd live-session-toolkit
git init
git add .
git commit -m "Initial commit"
```
Create a new repo on GitHub, then follow its instructions to push (usually
`git remote add origin <url>` then `git push -u origin main`).

## 1. Backend + database on Railway

1. Go to [railway.app](https://railway.app), sign in with GitHub, **New
   Project → Deploy from GitHub repo**, pick your repo.
2. Railway will try to build the whole repo — tell it to only look at the
   backend: open the new service's **Settings → Root Directory**, set it to
   `backend`. It will detect the `Dockerfile` and build from that.
3. **New → Database → Add PostgreSQL** in the same project. Railway creates
   it and exposes a `DATABASE_URL` variable automatically.
4. On the backend service, go to **Variables** and add:
   - `DATABASE_URL` → click "Add Reference" and point it at the Postgres
     plugin's `DATABASE_URL` (so it stays in sync automatically)
   - `SECRET_KEY` → a long random string (e.g. run
     `python -c "import secrets; print(secrets.token_hex(32))"` locally)
   - `ACCESS_TOKEN_EXPIRE_MINUTES` → `1440`
   - `CORS_ORIGINS` → leave as `http://localhost:3000` for now; you'll
     update this in step 3 once you have a Vercel URL
   - `ANTHROPIC_API_KEY` → your key from console.anthropic.com (optional —
     leave blank to skip AI features)
   - `ANTHROPIC_MODEL` → `claude-sonnet-5`
5. Deploy. Once it's live, Railway gives you a public URL like
   `https://your-app.up.railway.app` — open `<that-url>/health` to confirm
   you get `{"status":"ok"}`, and `<that-url>/docs` for the interactive API docs.

## 2. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub, **Add New →
   Project**, pick the same repo.
2. Set **Root Directory** to `frontend`. Vercel auto-detects Next.js —
   leave the build settings as default.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` → your Railway backend URL from step 1
   - `NEXT_PUBLIC_PARTICIPANT_URL` → `https://<your-vercel-domain>/join`
     (you'll know the domain after the first deploy — you can add this
     variable and redeploy once you do)
4. Deploy. Vercel gives you a URL like `https://your-app.vercel.app`.

## 3. Connect them: update CORS

Back in Railway, update the backend's `CORS_ORIGINS` variable to your real
Vercel domain, e.g.:
```
CORS_ORIGINS=https://your-app.vercel.app
```
Redeploy the backend for this to take effect (Railway usually does this
automatically when you change a variable).

If you set `NEXT_PUBLIC_PARTICIPANT_URL` after your first Vercel deploy,
redeploy the frontend too (Vercel → Deployments → ⋯ → Redeploy) so the QR
codes point at the right place.

## 4. Try it

Visit your Vercel URL, sign up, create a session, and launch it. Scan the
QR code with your phone (or open `<vercel-url>/join` in another tab) to
join as a participant and confirm live results show up.

## Notes

- **Database migrations:** this scaffold calls `Base.metadata.create_all()`
  on startup, which is fine to get going but won't handle schema changes
  gracefully later. Once you're iterating on the models for real, switch to
  [Alembic](https://alembic.sqlalchemy.org/) migrations.
- **WebSockets:** Railway supports them out of the box. If you move the
  backend to a host that doesn't (some serverless platforms don't keep
  long-lived connections open), the live-results feature needs a different
  host or a managed pub/sub layer.
- **Costs:** Railway and Vercel free tiers are enough for a class project
  and light use; keep an eye on usage if this gets real traffic.
- **AI features:** if you skip `ANTHROPIC_API_KEY`, the app still works —
  the "Generate with AI" and "Summarize with AI" buttons will show a clear
  error instead of the feature working, everything else is unaffected.
