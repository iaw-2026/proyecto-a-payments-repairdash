import type { AdminRiderItem } from "@/lib/services/admin";
import { formatDateTime, shortId } from "@/lib/format";
import { formatARS } from "@/lib/money";

export function AdminRidersTable({ items }: { items: AdminRiderItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface/70 p-8 backdrop-blur">
        <h2 className="text-lg font-semibold text-foreground">
          Sin riders para mostrar
        </h2>
        <p className="mt-2 text-secondary">
          Ajusta la busqueda o espera a que se registren clientes.
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
                Rider
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Volumen pagado
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Transacciones
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Ultima actividad
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map((item) => (
              <tr
                key={item.cliente.clerkId}
                className="transition-colors hover:bg-surface-elevated/20"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-foreground">
                    {item.user.fullName}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {item.user.email}
                  </p>
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono font-semibold text-foreground">
                  {formatARS(item.volumePaid)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-secondary">
                  {item.transactionCount}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-secondary">
                  {formatDateTime(item.latestTransactionAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted">
                  {shortId(item.cliente.clerkId)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border/50 md:hidden">
        {items.map((item) => (
          <div key={item.cliente.clerkId} className="space-y-4 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {item.user.fullName}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {item.user.email}
                </p>
              </div>
              <p className="font-mono text-lg font-semibold text-foreground">
                {formatARS(item.volumePaid)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs text-muted">
              <span>{item.transactionCount} transacciones</span>
              <span>{formatDateTime(item.latestTransactionAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
