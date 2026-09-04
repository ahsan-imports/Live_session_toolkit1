const STYLES: Record<string, string> = {
  draft: "bg-ink-600/10 text-ink-600",
  live: "bg-live/15 text-live",
  ended: "bg-black/5 text-ink-600/60",
};

const LABELS: Record<string, string> = {
  draft: "Draft",
  live: "Live",
  ended: "Ended",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        STYLES[status] ?? STYLES.draft
      }`}
    >
      {status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-dot" />}
      {LABELS[status] ?? status}
    </span>
  );
}
