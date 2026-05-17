import { MetricCard } from "@/components/ui/MetricCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import type { AdminDashboardMetrics as AdminDashboardMetricsData } from "@/lib/services/admin";
import { formatARS } from "@/lib/money";
import type { ReactNode } from "react";

function MetricIcon({ children }: { children: ReactNode }) {
  return children;
}

export function AdminDashboardMetrics({
  metrics,
}: {
  metrics: AdminDashboardMetricsData;
}) {
  const monthLabel = metrics.monthStart.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={
            <MetricIcon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </MetricIcon>
          }
          label="Volumen bruto"
          value={formatARS(metrics.grossVolume)}
          valueColor="text-foreground"
          subtitle={monthLabel}
        />
        <MetricCard
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M19 5 5 19" />
              <circle cx="7" cy="7" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          }
          label="Comisiones"
          value={formatARS(metrics.commissionCollected)}
          valueColor="text-accent"
          subtitle="Cobradas este mes"
        />
        <MetricCard
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          }
          label="Neto liquidado"
          value={formatARS(metrics.netLiquidated)}
          valueColor="text-success"
          subtitle="Disponible para drivers"
        />
        <MetricCard
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 19V5m0 0l-4 4m4-4 4 4" />
              <rect x="4" y="14" width="16" height="7" rx="1.5" />
            </svg>
          }
          label="Retiros solicitados"
          value={formatARS(metrics.requestedWithdrawalsAmount)}
          valueColor="text-warning"
          subtitle={`${metrics.requestedWithdrawalsCount} solicitudes`}
        />
        <MetricCard
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M3 12h18" />
              <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
              <path d="M7 12V7a5 5 0 0 1 10 0v5" />
            </svg>
          }
          label="Saldo reservado"
          value={formatARS(metrics.balanceLockedTotal)}
          valueColor="text-warning"
          subtitle="Balance locked agregado"
        />
        <MetricCard
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M16 12h2" />
            </svg>
          }
          label="Saldo disponible"
          value={formatARS(metrics.balanceAvailableTotal)}
          valueColor="text-success"
          subtitle="Balance available agregado"
        />
      </div>

      <section className="rounded-xl border border-border bg-surface/70 backdrop-blur">
        <div className="border-b border-border bg-surface-elevated/40 px-5 py-4">
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            Estados
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">
            Transacciones del mes
          </h2>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.transactionsByStatus.length > 0 ? (
            metrics.transactionsByStatus.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-4 py-3"
              >
                <AdminStatusBadge status={item.status} />
                <span className="font-mono text-lg font-bold text-foreground">
                  {item.count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-secondary">
              Todavia no hay transacciones este mes.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
