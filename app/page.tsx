import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          Repairdash
        </p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Repairdash Payments
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-secondary sm:text-lg">
          Plataforma de pagos para Repairdash: centraliza cobros, estados de
          transacciones, balances de trabajadores y solicitudes de retiro.
        </p>
        <div className="mt-9">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)]"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>
    </main>
  );
}
