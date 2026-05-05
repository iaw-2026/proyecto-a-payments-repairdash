import Link from "next/link";

export default function RiderCheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-slate-100">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Rider</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Crear pago de prueba</h1>
        <p className="mt-3 text-slate-300">Acá va el formulario aislado para probar checkout sin mezclarlo con la vista general.</p>
        <form action="/api/payments/checkout" method="post" className="mt-6 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <input name="clientId" placeholder="clientId" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none" />
          <input name="trabajadorId" placeholder="trabajadorId" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none" />
          <input name="amount" placeholder="amount" className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none" />
          <button type="submit" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
            Enviar prueba
          </button>
        </form>
        <Link href="/rider" className="mt-6 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}