import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-slate-100">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Clerk</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Sign in</h1>
        <p className="mt-3 text-slate-300">Este punto de entrada quedara conectado a Clerk en la siguiente etapa.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}