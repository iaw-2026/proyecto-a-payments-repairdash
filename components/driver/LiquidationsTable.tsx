import { Transaction } from "@/generated/prisma/client";

function formatDate(date: Date | null): string {
  if (!date) return "-";

  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} ${hh}:${mm}`;
}

function formatCurrency(value: Transaction["amount"] | null): string {
  if (!value) return "-";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(Number(value.toFixed(2)));
}

function formatRate(value: Transaction["commissionRate"] | null): string {
  return value ? `${value.toFixed(2)}%` : "-";
}

function shortId(id: string): string {
  return id.length > 10 ? `...${id.slice(-10)}` : id;
}

export function LiquidationsTable({ items }: { items: Transaction[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/70 backdrop-blur">
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-elevated/40">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Fecha
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Bruto
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Comision
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Neto
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Trabajo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map((transaction) => (
              <tr
                key={transaction.id}
                className="transition-colors hover:bg-surface-elevated/20"
              >
                <td className="whitespace-nowrap px-5 py-4 text-secondary">
                  {formatDate(transaction.liquidatedAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-foreground">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="font-mono font-semibold text-danger">
                    {formatCurrency(transaction.commissionAmount)}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {formatRate(transaction.commissionRate)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono font-semibold text-success">
                  {formatCurrency(transaction.netAmount)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted">
                  {shortId(transaction.trabajoId)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border/50 md:hidden">
        {items.map((transaction) => (
          <div key={transaction.id} className="space-y-3 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">
                  Neto liquidado
                </p>
                <p className="mt-1 font-mono text-lg font-semibold text-success">
                  {formatCurrency(transaction.netAmount)}
                </p>
              </div>
              <span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                Liquidado
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted">Bruto</p>
                <p className="font-mono text-foreground">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Comision</p>
                <p className="font-mono text-danger">
                  {formatCurrency(transaction.commissionAmount)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{formatDate(transaction.liquidatedAt)}</span>
              <span className="font-mono">{shortId(transaction.trabajoId)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
