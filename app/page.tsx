import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso | Repairdash Payments",
  description:
    "Accedé al sistema de pagos, balances, liquidaciones y retiros de Repairdash.",
};

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-border/80 pb-5">
          <Link href="/" className="text-base font-bold text-foreground">
            Repairdash Payments
          </Link>
          <Link
            href="/sign-in"
            className="hidden rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-accent/60 hover:bg-accent-subtle sm:inline-flex"
          >
            Entrar
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_440px]">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-accent">
              Acceso seguro para el equipo
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-foreground">
              Gestioná pagos, balances y retiros desde un solo lugar.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-secondary">
              Entrá a Repairdash Payments para consultar cobros, revisar
              liquidaciones y administrar solicitudes con la misma cuenta del
              sistema.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)]"
              >
                Iniciar sesión
              </Link>
              <p className="flex items-center text-sm leading-6 text-muted">
                Acceso exclusivo para usuarios habilitados.
              </p>
            </div>
          </div>

          <aside
            aria-label="Vista previa de Repairdash Payments"
            className="rounded-lg border border-border bg-surface/70 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Panel operativo
                </p>
                <p className="mt-1 text-xs text-muted">Resumen de actividad</p>
              </div>
              <span className="rounded-md bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                Activo
              </span>
            </div>

            <div className="grid grid-cols-2 border-b border-border">
              <div className="border-r border-border py-5 pr-4">
                <p className="text-xs font-medium text-muted">Disponible</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  $128.400
                </p>
              </div>
              <div className="py-5 pl-4">
                <p className="text-xs font-medium text-muted">Reservado</p>
                <p className="mt-2 text-2xl font-bold text-warning">
                  $42.900
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-5">
              <div className="flex items-center justify-between rounded-md border border-border/80 bg-background/25 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Cobro confirmado
                  </p>
                  <p className="mt-1 text-xs text-muted">Trabajo RD-1048</p>
                </div>
                <span className="text-sm font-semibold text-success">
                  Liquidado
                </span>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border/80 bg-background/25 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Solicitud de retiro
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Pendiente de revisión
                  </p>
                </div>
                <span className="text-sm font-semibold text-warning">
                  En curso
                </span>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border/80 bg-background/25 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Nueva transacción
                  </p>
                  <p className="mt-1 text-xs text-muted">Pago registrado</p>
                </div>
                <span className="text-sm font-semibold text-accent">
                  Reservado
                </span>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
