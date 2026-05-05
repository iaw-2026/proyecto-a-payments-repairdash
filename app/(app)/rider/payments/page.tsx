import Link from "next/link";

export default function RiderPaymentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-slate-100">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Rider</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Historial de pagos</h1>
        <p className="mt-3 text-slate-300">Acá después podés separar la tabla de transacciones del dashboard principal.</p>
        <Link href="/rider" className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}