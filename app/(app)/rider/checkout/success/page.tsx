import Link from "next/link";

export default function RiderCheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-slate-100">
      <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-950/40 p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Checkout</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Pago aprobado</h1>
        <p className="mt-3 text-slate-300">Esta pantalla se usará como retorno del sandbox de Mercado Pago.</p>
        <Link href="/rider" className="mt-6 inline-flex rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200">
          Volver al rider
        </Link>
      </div>
    </div>
  );
}