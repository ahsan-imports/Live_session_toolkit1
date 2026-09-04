"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Brand } from "@/components/Brand";

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [isLoading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.login(email, password);
      login(res.access_token, res.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand size="lg" light />
        </div>

        <div className="bg-paper rounded-2xl shadow-2xl p-8">
          <h1 className="font-display text-2xl font-semibold text-ink mb-1">Welcome back</h1>
          <p className="text-ink-600/70 text-sm mb-6">Log in to run your next session.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
                placeholder="you@school.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-signal"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-wrong">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-signal text-white font-medium py-2.5 text-sm hover:bg-signal-dark transition-colors disabled:opacity-60"
            >
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>

     <p className="text-center text-sm text-ink-600/70 mt-6">
  New here?{" "}
  <Link href="/signup" className="text-signal font-medium hover:underline">
    Create an account
  </Link>
</p>
        </div>
      </div>
    </main>
  );
}
