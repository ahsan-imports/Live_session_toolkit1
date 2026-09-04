interface OptionLike {
  id: string;
  text: string;
  is_correct?: boolean;
}

export function LiveResultsBars({
  options,
  counts,
  showCorrect,
}: {
  options: OptionLike[];
  counts: Record<string, number>;
  showCorrect: boolean;
}) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const count = counts[opt.id] ?? 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={opt.id}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-1.5 text-ink/90">
                {showCorrect && opt.is_correct && <span className="text-correct">✓</span>}
                {opt.text}
              </span>
              <span className="text-ink-600/60 font-mono text-xs">
                {count} · {pct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-black/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  showCorrect && opt.is_correct ? "bg-correct" : "bg-signal"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-ink-600/50 pt-1">{total} response{total === 1 ? "" : "s"}</p>
    </div>
  );
}
