import { liquidateAdminTransaction } from "@/app/actions/admin";
import type { AdminTransactionItem } from "@/lib/services/admin";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { TransactionStatus } from "@/generated/prisma/client";
import { formatDateTime, shortId } from "@/lib/format";
import { formatARS } from "@/lib/money";

function UserCell({
  user,
  fallback,
}: {
  user: AdminTransactionItem["cliente"];
  fallback: string | null;
}) {
  if (!user) {
    return (
      <span className="block break-all font-mono text-xs text-muted">
        {fallback ?? "-"}
      </span>
    );
  }

  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-foreground">{user.fullName}</p>
      <p className="mt-1 truncate font-mono text-xs text-muted">{user.email}</p>
    </div>
  );
}

export function AdminTransactionsTable({
  items,
}: {
  items: AdminTransactionItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface/70 p-8 backdrop-blur">
        <h2 className="text-lg font-semibold text-foreground">
          Sin transacciones para mostrar
        </h2>
        <p className="mt-2 text-secondary">
          Ajusta los filtros o espera a que se creen nuevas transacciones.
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
                Trabajo
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Rider
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
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map(({ transaction, cliente, trabajador }) => (
              <tr
                key={transaction.id}
                className="transition-colors hover:bg-surface-elevated/20"
              >
                <td className="whitespace-nowrap px-5 py-4 text-secondary">
                  {formatDateTime(transaction.createdAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted">
                  {shortId(transaction.trabajoId)}
                </td>
                <td className="px-5 py-4">
                  <UserCell user={cliente} fallback={transaction.clientId} />
                </td>
                <td className="px-5 py-4">
                  <UserCell user={trabajador} fallback={transaction.trabajadorId} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono font-semibold text-foreground">
                  {formatARS(transaction.amount)}
                </td>
                <td className="px-5 py-4">
                  <AdminStatusBadge status={transaction.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted">
                  {shortId(transaction.id)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  {transaction.status === TransactionStatus.RESERVED ? (
                    <form action={liquidateAdminTransaction}>
                      <input type="hidden" name="transactionId" value={transaction.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-success/15"
                      >
                        Liquidar
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border/50 md:hidden">
        {items.map(({ transaction, cliente, trabajador }) => (
          <div key={transaction.id} className="space-y-3 px-5 py-4">
            <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-lg font-semibold text-foreground">
                  {formatARS(transaction.amount)}
                </p>
                <p className="mt-1 font-mono text-xs text-muted">
                  Trabajo {shortId(transaction.trabajoId)}
                </p>
              </div>
              <div className="shrink-0">
                <AdminStatusBadge status={transaction.status} />
              </div>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted">Rider</p>
                <UserCell user={cliente} fallback={transaction.clientId} />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted">Driver</p>
                <UserCell user={trabajador} fallback={transaction.trabajadorId} />
              </div>
            </div>
            {transaction.status === TransactionStatus.RESERVED ? (
              <form action={liquidateAdminTransaction}>
                <input type="hidden" name="transactionId" value={transaction.id} />
                <button
                  type="submit"
                  className="rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-success/15"
                >
                  Liquidar
                </button>
              </form>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>{formatDateTime(transaction.createdAt)}</span>
              <span className="font-mono">{shortId(transaction.id)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
