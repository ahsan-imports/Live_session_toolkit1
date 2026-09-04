"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Brand } from "./Brand";

export function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-black/5 bg-white/70 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard">
          <Brand />
        </Link>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-ink-600/70 hidden sm:inline">{user.name}</span>}
          <button
            onClick={logout}
            className="text-sm font-medium text-ink-600/70 hover:text-ink transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
