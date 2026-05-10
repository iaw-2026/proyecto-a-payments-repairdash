import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatMoney(value: { toNumber: () => number } | null) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value ? value.toNumber() : 0);
}

export default async function RiderPage() {
  const rider = await prisma.user.findFirst({
    where: { role: "rider" },
    include: { cliente: true },
  });

  if (!rider?.cliente) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200">
          No se encontro un rider seed. Ejecuta el seed de Prisma primero.
        </p>
      </div>
    );
  }

  const transactions = await prisma.transaction.findMany({
    where: { clientId: rider.clerkId },
    orderBy: { createdAt: "desc" },
  });

  const pendingTransaction = transactions.find((transaction) => transaction.status === "PENDING") ?? transactions[0] ?? null;

  const worker = pendingTransaction
    ? await prisma.trabajador.findUnique({
        where: { clerkId: pendingTransaction.trabajadorId },
        include: { user: true, balance: true },
      })
    : null;

  const statusStyles: Record<string, string> = {
    PENDING: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    RESERVED: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
    LIQUIDATED: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    DISPUTED: "border-rose-300/30 bg-rose-300/10 text-rose-100",
    REFUNDED: "border-slate-300/30 bg-slate-300/10 text-slate-100",
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Rider</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">{rider.fullName}</h1>
          <p className="mt-2 text-slate-300">Vista cliente para iniciar y consultar pagos locales.</p>
        </div>
        <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5">
          Volver
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Trabajo pendiente</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Servicio de reparacion</h2>
            </div>
            <span className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${pendingTransaction ? statusStyles[pendingTransaction.status] : "border-white/10 bg-white/5 text-slate-200"}`}>
              {pendingTransaction ? pendingTransaction.status : "SIN PEDIDOS"}
            </span>
          </div>

          {pendingTransaction && worker ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Trabajador asignado</p>
                <p className="mt-2 text-lg font-semibold text-white">{worker.user.fullName}</p>
                <p className="mt-1 text-sm text-slate-300">CBU/CVU {worker.cbuCvu}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Monto</p>
                <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(pendingTransaction.amount)}</p>
                <p className="mt-1 text-sm text-slate-300">Pago local pendiente de aprobacion.</p>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-300">No hay transaccion pendiente para este rider.</p>
          )}

          <form action="/api/payments/checkout" method="post" className="mt-6 flex flex-col gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-300/8 p-5 md:flex-row md:items-end md:justify-between">
            <input type="hidden" name="clientId" value={rider.clerkId} />
            <input type="hidden" name="trabajadorId" value={worker?.clerkId ?? "user_driver_1"} />
            <input type="hidden" name="amount" value={pendingTransaction ? pendingTransaction.amount.toString() : "18000"} />
            <input type="hidden" name="description" value="Servicio de reparacion" />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/70">Accion principal</p>
              <p className="mt-2 text-lg font-semibold text-white">Iniciar pago local</p>
            </div>
            <button type="submit" className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
              Iniciar pago
            </button>
          </form>
        </article>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Estado</p>
          <div className="mt-4 space-y-4">
            {pendingTransaction ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Consulta por contrato</p>
                <p className="mt-1 font-mono text-xs text-slate-200">GET /api/payments/{pendingTransaction.id}/estado</p>
              </div>
            ) : null}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Moneda</p>
              <p className="mt-1 text-xl font-semibold text-white">ARS</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Historial</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Transacciones del cliente</h2>
          </div>
          <span className="text-sm text-slate-300">{transactions.length} movimientos</span>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/30 text-slate-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-3 font-mono text-xs">{transaction.id}</td>
                  <td className="px-4 py-3">{formatMoney(transaction.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusStyles[transaction.status]}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{transaction.createdAt.toLocaleString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
