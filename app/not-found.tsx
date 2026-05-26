import Link from "next/link";
import { getUserRole } from "@/lib/auth";
import { Topbar } from "@/components/layout/Topbar";

export default async function NotFound() {
  const role = await getUserRole();
  const href = role ? "/dashboard" : "/";
  const label = role ? "Volver al dashboard" : "Volver al inicio";

  return (
    <>
      {role ? <Topbar /> : null}
      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl items-center px-6 py-16 text-slate-100">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">404</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Pagina no encontrada</h1>
          <p className="mt-3 text-slate-300">La ruta no existe o todavia no fue creada.</p>
          <Link href={href} className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
            {label}
          </Link>
        </div>
      </div>
    </>
  );
}
