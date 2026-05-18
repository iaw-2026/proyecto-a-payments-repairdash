import { MetricCard } from "@/components/ui/MetricCard";
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
      </div>
    </div>
  );
}
