import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";

export default async function Home() {
  const role = await getUserRole();

  if (role) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5">
        <span className="text-sm font-semibold tracking-[0.2em] uppercase text-foreground">
          Repairdash
        </span>
        <div className="flex gap-2">
          <Link
            href="/rider"
            className="px-4 py-2 rounded-md text-sm font-medium text-muted transition-all hover:text-foreground hover:bg-white/5"
          >
            Rider
          </Link>
          <Link
            href="/driver"
            className="px-4 py-2 rounded-md text-sm font-medium text-muted transition-all hover:text-foreground hover:bg-white/5"
          >
            Driver
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl w-full grid gap-10 lg:grid-cols-[1.3fr_0.7fr] items-center">
          {/* Left — CTA */}
          <div className="animate-slide-up">
            <span className="inline-flex rounded-md border border-accent/20 bg-accent-subtle px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-6">
              Payments Platform
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-foreground">
              Pagos simples
              <br />
              <span className="text-accent">para reparaciones.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-secondary">
              Gestioná cobros, wallet y retiros desde una sola plataforma. Vista
              cliente y vista trabajador integradas.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/rider"
                className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)]"
              >
                Entrar como Rider
              </Link>
              <Link
                href="/driver"
                className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-accent/40 hover:bg-white/5"
              >
                Entrar como Driver
              </Link>
            </div>
          </div>

          {/* Right — Feature cards */}
          <div className="grid gap-4 animate-fade-in">
            <article className="rounded-xl border border-border bg-surface/70 p-6 backdrop-blur transition-all hover:border-muted/50 hover:bg-surface">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                Cliente
              </p>
              <h2 className="mt-3 text-xl font-semibold text-foreground">
                Crear y consultar pagos
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Iniciá un pago, consultá el estado y revisá tu historial.
              </p>
            </article>

            <article className="rounded-xl border border-border bg-surface/70 p-6 backdrop-blur transition-all hover:border-muted/50 hover:bg-surface">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                Trabajador
              </p>
              <h2 className="mt-3 text-xl font-semibold text-foreground">
                Wallet y retiros
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Saldo disponible, saldo bloqueado y retiro con persistencia
                local.
              </p>
            </article>

            <article className="rounded-xl border border-border bg-gradient-to-br from-accent/8 to-surface p-6 backdrop-blur transition-all hover:from-accent/12">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                Stack
              </p>
              <p className="mt-3 text-sm leading-relaxed text-secondary">
                Next.js App Router, Prisma 7 y PostgreSQL — listo para Clerk y
                Mercado Pago.
              </p>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
