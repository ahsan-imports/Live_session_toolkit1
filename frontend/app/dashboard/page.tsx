"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { TopNav } from "@/components/TopNav";
import { StatusPill } from "@/components/StatusPill";
import type { SessionSummary } from "@/lib/types";

export default function DashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!token) return;
    api
      .listSessions(token)
      .then(setSessions)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load your sessions."));
  }, [token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !title.trim()) return;
    setCreating(true);
    try {
      const session = await api.createSession(token, title.trim());
      router.push(`/session/${session.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the session.");
      setCreating(false);
    }
  }
async function handleReuse(sessionId: string) {
  if (!token) return;

  try {
    const copy = await api.reuseSession(token, sessionId);
    router.push(`/session/${copy.id}`);
  } catch (err) {
    setError(
      err instanceof ApiError
        ? err.message
        : "Couldn't reuse this session."
    );
  }
}

async function handleDelete(sessionId: string, sessionTitle: string) {
  if (!token) return;

  if (!confirm(`Delete "${sessionTitle}"? This cannot be undone.`)) {
    return;
  }

  try {
    await api.deleteSession(token, sessionId);

    setSessions((current) =>
      current
        ? current.filter((session) => session.id !== sessionId)
        : current
    );
  } catch (err) {
    setError(
      err instanceof ApiError
        ? err.message
        : "Couldn't delete the session."
    );
  }
}
  if (isLoading || !user) return null;

  return (
    <main className="min-h-screen bg-paper">
      <TopNav />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">Your sessions</h1>
            <p className="text-ink-600/70 text-sm mt-1">
              Create a session, then add polls and quizzes for participants to join.
            </p>
          </div>
          <div className="flex items-center gap-3">
  <button
    onClick={() => router.push("/join")}
    className="rounded-lg border border-signal text-signal font-medium px-4 py-2.5 text-sm hover:bg-signal hover:text-white transition-colors"
  >
    Join Session
  </button>

  <button
    onClick={() => setShowCreate(true)}
    className="rounded-lg bg-signal text-white font-medium px-4 py-2.5 text-sm hover:bg-signal-dark transition-colors"
  >
    New session
  </button>
</div>
        </div>

        {error && <p className="text-sm text-wrong mb-4">{error}</p>}

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="mb-8 bg-white rounded-xl border border-black/5 p-5 flex items-end gap-3"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink/80 mb-1" htmlFor="title">
                Session title
              </label>
              <input
                id="title"
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Networking Basics — Week 4"
                className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-ink text-white font-medium px-4 py-2.5 text-sm hover:bg-ink-700 transition-colors disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-600/70 hover:text-ink"
            >
              Cancel
            </button>
          </form>
        )}

        {sessions === null ? (
          <p className="text-sm text-ink-600/60">Loading…</p>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/15 p-12 text-center">
            <p className="font-display text-lg text-ink mb-1">No sessions yet</p>
            <p className="text-sm text-ink-600/70">
              Create your first session to start building polls and quizzes.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
  {sessions.map((s) => (
    <li
      key={s.id}
      className="bg-white rounded-xl border border-black/5 p-5 flex items-center justify-between hover:border-signal/40 hover:shadow-sm transition-all"
    >
      <button
        onClick={() => router.push(`/session/${s.id}`)}
        className="flex-1 text-left"
      >
        <p className="font-display text-base font-semibold text-ink">
          {s.title}
        </p>

        <p className="text-xs text-ink-600/60 mt-1 font-mono">
  Code {s.code}
</p>

<p className="text-xs text-ink-600/50 mt-1">
  Created{" "}
  {new Date(s.created_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })}
</p>
      </button>

      <div className="flex items-center gap-3 ml-4">
        <StatusPill status={s.status} />

        {s.status === "ended" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReuse(s.id)}
              className="rounded-lg border border-signal/30 text-signal text-xs font-medium px-3 py-1.5 hover:bg-signal/5"
            >
              Edit & use again
            </button>

            <button
            onClick={() => handleDelete(s.id, s.title)}
              className="rounded-lg border border-wrong/20 text-wrong text-xs font-medium px-3 py-1.5 hover:bg-wrong/5"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  ))}
</ul>
         )}
      </div>
    </main>
  );
}