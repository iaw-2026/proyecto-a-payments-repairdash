import type { AdminDriverItem } from "@/lib/services/admin";
import { formatDateTime, shortId } from "@/lib/format";
import { formatARS } from "@/lib/money";

export function AdminDriversTable({ items }: { items: AdminDriverItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface/70 p-8 backdrop-blur">
        <h2 className="text-lg font-semibold text-foreground">
          Sin drivers para mostrar
        </h2>
        <p className="mt-2 text-secondary">
          Ajusta la busqueda o espera a que se registren trabajadores.
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
                Driver
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                CBU/CVU
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Disponible
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Reservado
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Actividad
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map((item) => (
              <tr
                key={item.trabajador.clerkId}
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
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-secondary">
                  {item.trabajador.cbuCvu ?? "Sin configurar"}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono font-semibold text-success">
                  {formatARS(item.balance?.balanceAvailable)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono font-semibold text-warning">
                  {formatARS(item.balance?.balanceLocked)}
                </td>
                <td className="px-5 py-4">
                  <p className="text-secondary">
                    {item.transactionCount} transacciones
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {item.withdrawalCount} retiros |{" "}
                    {formatDateTime(item.latestActivityAt)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border/50 md:hidden">
        {items.map((item) => (
          <div key={item.trabajador.clerkId} className="space-y-4 px-5 py-4">
            <div>
              <p className="font-semibold text-foreground">
                {item.user.fullName}
              </p>
              <p className="mt-1 truncate text-xs text-muted">
                {item.user.email}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted">Disponible</p>
                <p className="font-mono font-semibold text-success">
                  {formatARS(item.balance?.balanceAvailable)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Reservado</p>
                <p className="font-mono font-semibold text-warning">
                  {formatARS(item.balance?.balanceLocked)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs text-muted">
              <span>{item.transactionCount} transacciones</span>
              <span className="font-mono">
                {shortId(item.trabajador.clerkId)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
