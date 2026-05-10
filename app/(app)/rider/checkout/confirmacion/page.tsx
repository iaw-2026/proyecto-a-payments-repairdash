import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/money";

type ConfirmationPageProps = {
  searchParams: Promise<{
    transactionId?: string;
  }>;
};

export default async function RiderCheckoutConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { transactionId } = await searchParams;

  if (!transactionId) {
    notFound();
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    notFound();
  }

  const trabajador = await prisma.trabajador.findUnique({
    where: { clerkId: transaction.trabajadorId },
    include: { user: true },
  });

  const cliente = transaction.clientId
    ? await prisma.cliente.findUnique({
        where: { clerkId: transaction.clientId },
        include: { user: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-slate-100">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Payments checkout</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Confirmar compra</h1>
        <p className="mt-3 text-slate-300">
          Revisa el detalle antes de continuar a Mercado Pago. El resultado final se confirma por webhook.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Trabajo</p>
            <p className="mt-2 font-mono text-sm text-white">{transaction.trabajoId}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-400">Transaccion</p>
            <p className="mt-2 font-mono text-xs text-slate-300">{transaction.id}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Monto</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatARS(transaction.amount)}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-400">Estado interno</p>
            <p className="mt-2 text-sm font-semibold text-cyan-100">{transaction.status}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Cliente</p>
            <p className="mt-2 text-lg font-semibold text-white">{cliente?.user.fullName ?? transaction.clientId ?? "Sin cliente"}</p>
            <p className="mt-1 text-sm text-slate-300">{cliente?.user.email ?? "Payments no encontro el usuario cliente."}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Trabajador</p>
            <p className="mt-2 text-lg font-semibold text-white">{trabajador?.user.fullName ?? transaction.trabajadorId}</p>
            <p className="mt-1 text-sm text-slate-300">ID {transaction.trabajadorId}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {transaction.gatewayCheckoutUrl ? (
            <a
              href={transaction.gatewayCheckoutUrl}
              className="inline-flex justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Confirmar compra
            </a>
          ) : (
            <span className="inline-flex justify-center rounded-full border border-amber-300/30 bg-amber-300/10 px-6 py-3 text-sm font-semibold text-amber-100">
              Checkout no disponible
            </span>
          )}
          <Link
            href="/rider"
            className="inline-flex justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Cancelar
          </Link>
        </div>
      </section>
    </div>
  );
}
