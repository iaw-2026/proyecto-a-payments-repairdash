import type { AdminWithdrawalItem } from "@/lib/services/admin";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatDateTime, shortId } from "@/lib/format";
import { formatARS } from "@/lib/money";

export function AdminWithdrawalsTable({
  items,
}: {
  items: AdminWithdrawalItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface/70 p-8 backdrop-blur">
        <h2 className="text-lg font-semibold text-foreground">
          Sin retiros para mostrar
        </h2>
        <p className="mt-2 text-secondary">
          Ajusta los filtros o espera a que los drivers soliciten retiros.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/70 backdrop-blur">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-elevated/40">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Fecha
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Driver
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
            {items.map((withdrawal) => (
              <tr
                key={withdrawal.id}
                className="transition-colors hover:bg-surface-elevated/20"
              >
                <td className="whitespace-nowrap px-5 py-4 text-secondary">
                  {formatDateTime(withdrawal.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-foreground">
                    {withdrawal.trabajador.user.fullName}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {withdrawal.trabajador.user.email}
                  </p>
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono font-semibold text-foreground">
                  {formatARS(withdrawal.amount)}
                </td>
                <td className="px-5 py-4">
                  <AdminStatusBadge status={withdrawal.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted">
                  {shortId(withdrawal.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border/50 md:hidden">
        {items.map((withdrawal) => (
          <div key={withdrawal.id} className="space-y-3 px-5 py-4">
            <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-lg font-semibold text-foreground">
                  {formatARS(withdrawal.amount)}
                </p>
                <p className="mt-1 truncate text-sm text-secondary">
                  {withdrawal.trabajador.user.fullName}
                </p>
                <p className="mt-1 truncate font-mono text-xs text-muted">
                  {withdrawal.trabajador.user.email}
                </p>
              </div>
              <div className="shrink-0">
                <AdminStatusBadge status={withdrawal.status} />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>{formatDateTime(withdrawal.createdAt)}</span>
              <span className="font-mono">{shortId(withdrawal.id)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
