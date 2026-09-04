export function Brand({ size = "md", light = false }: { size?: "md" | "lg"; light?: boolean }) {
  const textSize = size === "lg" ? "text-2xl" : "text-lg";
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-live animate-pulse-dot" />
      </span>
      <span
        className={`font-display font-semibold tracking-tight ${textSize} ${
          light ? "text-white" : "text-ink"
        }`}
      >
        Live Session Toolkit
      </span>
    </div>
  );
}
