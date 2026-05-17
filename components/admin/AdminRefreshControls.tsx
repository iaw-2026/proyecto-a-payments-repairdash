"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 60_000;

export function AdminRefreshControls() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        startTransition(() => {
          router.refresh();
        });
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [router, startTransition]);

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface/60 px-4 py-2.5 text-sm font-semibold text-secondary transition-all hover:border-accent/40 hover:bg-surface-elevated/40 hover:text-foreground disabled:cursor-wait disabled:opacity-60"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
      {isPending ? "Actualizando" : "Actualizar"}
    </button>
  );
}
