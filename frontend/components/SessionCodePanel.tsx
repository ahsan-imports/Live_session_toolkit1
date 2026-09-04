"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function SessionCodePanel({ code, joinUrl }: { code: string; joinUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, joinUrl, {
        width: 132,
        margin: 1,
        color: { dark: "#14171F", light: "#F5F6F8" },
      }).catch(() => {});
    }
  }, [joinUrl]);

  return (
    <div className="rounded-2xl bg-ink text-white p-6 flex items-center justify-between gap-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="h-2 w-2 rounded-full bg-live animate-pulse-dot" />
          <span className="text-xs font-semibold tracking-widest text-live uppercase">On air</span>
        </div>
        <p className="text-xs text-white/60 mb-1">Join at {joinUrl.replace(/^https?:\/\//, "")}</p>
        <p className="font-mono text-4xl font-bold tracking-[0.3em] text-white">{code}</p>
      </div>
      <div className="bg-paper rounded-xl p-2 shrink-0">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
