import Link from "next/link";

export default function DriverWithdrawalsPage() {
  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Driver
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Retiros</h1>
        <p className="mt-2 text-secondary">
          Gestión de retiros y solicitudes de pago.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface/70 p-8 backdrop-blur">
        <p className="text-secondary">
          Acá vamos a armar juntos la vista completa de retiros.
        </p>
        <Link
          href="/driver"
          className="mt-6 inline-flex rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-hover"
        >
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}