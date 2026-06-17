"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl items-center px-6 py-16 text-slate-100">
      <div className="rounded-[2rem] border border-rose-300/20 bg-rose-950/40 p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Error</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Algo salio mal</h1>
        <p className="mt-3 text-slate-300">Podés intentar de nuevo o volver al inicio.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={reset} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            Reintentar
          </button>
          <Link href="/" className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}