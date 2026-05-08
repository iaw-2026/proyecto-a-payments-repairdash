import { Withdrawal, WithdrawalStatus } from "@/generated/prisma";

/* ── Status badge config ── */

const STATUS_CONFIG: Record<
  WithdrawalStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  REQUESTED: {
    label: "Pendiente",
    dotClass: "bg-warning",
    badgeClass: "bg-warning/10 text-warning border-warning/20",
  },
  APPROVED: {
    label: "Transferido",
    dotClass: "bg-success",
    badgeClass: "bg-success/10 text-success border-success/20",
  },
  REJECTED: {
    label: "Rechazado",
    dotClass: "bg-danger",
    badgeClass: "bg-danger/10 text-danger border-danger/20",
  },
};

/* ── Formatting helpers ── */

/** Formatea fecha como DD/MM/YYYY HH:mm */
function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} ${hh}:${mm}`;
}

/** Formatea monto como moneda argentina: $1.500,00 */
function formatCurrency(value: { toFixed: (n: number) => string }): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(Number(value.toFixed(2)));
}

/** Muestra los últimos 8 caracteres del ID */
function shortId(id: string): string {
  return id.length > 8 ? `…${id.slice(-8)}` : id;
}

/* ── Status Badge ── */

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.badgeClass}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dotClass}`}
      />
      {cfg.label}
    </span>
  );
}

/* ── Table Component ── */

interface WithdrawalTableProps {
  items: Withdrawal[];
}

export function WithdrawalTable({ items }: WithdrawalTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/70 backdrop-blur">
      {/* ── Desktop table ── */}
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-elevated/40">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Fecha
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Monto
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Estado
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map((w) => (
              <tr
                key={w.id}
                className="transition-colors hover:bg-surface-elevated/20"
              >
                <td className="whitespace-nowrap px-5 py-4 text-secondary">
                  {formatDate(w.createdAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono font-semibold text-foreground">
                  {formatCurrency(w.amount)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={w.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted">
                  {shortId(w.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="divide-y divide-border/50 md:hidden">
        {items.map((w) => (
          <div key={w.id} className="space-y-3 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-semibold text-foreground">
                {formatCurrency(w.amount)}
              </span>
              <StatusBadge status={w.status} />
            </div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{formatDate(w.createdAt)}</span>
              <span className="font-mono">{shortId(w.id)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
