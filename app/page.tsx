import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso | Repairdash Payments",
  description:
    "Accedé al sistema de pagos, balances, liquidaciones y retiros de Repairdash.",
  openGraph: {
    title: "Acceso | Repairdash Payments",
    description:
      "Accedé al sistema de pagos, balances, liquidaciones y retiros de Repairdash.",
    type: "website",
    locale: "es_AR",
    siteName: "Repairdash Payments",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-border/80 pb-5">
          <Link href="/" className="text-base font-bold text-foreground">
            Repairdash Payments
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
                className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-hover"
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
                  Acceso por perfil
                </p>
                <p className="mt-1 text-xs text-muted">
                  Cada rol ve herramientas distintas
                </p>
              </div>
              <span className="rounded-md bg-accent-subtle px-3 py-1 text-xs font-semibold text-foreground">
                Autenticación
              </span>
            </div>

            <div className="space-y-4 pt-5">
              <div className="rounded-md border border-border/80 bg-background/25 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-foreground">
                      Rider
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      Pagos y seguimiento de trabajos
                    </p>
                  </div>
                  <span className="rounded-md bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                    Cliente
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-border/70 bg-surface/50 p-3">
                    <p className="text-xs text-muted">Checkout</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      Pago seguro
                    </p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-surface/50 p-3">
                    <p className="text-xs text-muted">Historial</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      Estados claros
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-border/80 bg-background/25 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-warning">
                      Driver
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      Balances, liquidaciones y retiros
                    </p>
                  </div>
                  <span className="rounded-md bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                    Trabajador
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-border/70 bg-surface/50 p-3">
                    <p className="text-xs text-muted">Balance</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      Disponible
                    </p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-surface/50 p-3">
                    <p className="text-xs text-muted">Retiros</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      Solicitudes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
