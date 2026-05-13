import { formatARS } from "@/lib/money";
import type { RiderDashboardTransaction } from "@/lib/types/rider-dashboard";
import { RiderStatusBadge } from "@/components/rider/RiderStatusBadge";
import { PaginationControls } from "@/components/ui/PaginationControls";

function formatDate(value: Date) {
  return value.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function shortId(id: string) {
  return id.length > 8 ? `...${id.slice(-8)}` : id;
}

export function TransactionHistory({
  transactions,
  totalTransactions,
  currentPage,
  totalPages,
}: {
  transactions: RiderDashboardTransaction[];
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface/70 backdrop-blur">
      <div className="flex flex-col gap-2 border-b border-border bg-surface-elevated/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            Historial
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">
            Transacciones del cliente
          </h2>
        </div>
        <span className="text-sm text-secondary">
          {totalTransactions} movimientos
        </span>
      </div>

      {transactions.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    ID
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Monto
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Estado
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition-colors hover:bg-surface-elevated/20"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-secondary">
                      {transaction.id}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-foreground">
                      {formatARS(transaction.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <RiderStatusBadge status={transaction.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-secondary">
                      {formatDate(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-border md:hidden">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="space-y-3 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="whitespace-nowrap font-mono text-lg font-semibold text-foreground">
                      {formatARS(transaction.amount)}
                    </p>
                    <p className="mt-2 whitespace-nowrap text-xs text-muted">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-col items-end gap-2 text-right">
                    <RiderStatusBadge status={transaction.status} />
                    <p className="max-w-[8.5rem] truncate font-mono text-xs text-muted">
                      {shortId(transaction.id)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border px-4 py-4 sm:px-5">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        </>
      ) : (
        <div className="px-5 py-10 text-sm text-secondary">
          Todavia no hay transacciones para este rider.
        </div>
      )}
    </section>
  );
}
