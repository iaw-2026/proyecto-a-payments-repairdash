import { MetricCard } from "@/components/ui/MetricCard";
import type { AdminDashboardMetrics as AdminDashboardMetricsData } from "@/lib/services/admin";
import { formatARS } from "@/lib/money";
import type { ReactNode } from "react";

function MetricIcon({ children }: { children: ReactNode }) {
  return children;
}

export function AdminDashboardMetrics({
  dailyMetrics,
  monthlyMetrics,
}: {
  dailyMetrics: AdminDashboardMetricsData;
  monthlyMetrics: AdminDashboardMetricsData;
}) {
  return (
    <div className="space-y-6">
      <MetricsSection title="Hoy" metrics={dailyMetrics} variant="day" />
      <MetricsSection
        title="Mes actual"
        metrics={monthlyMetrics}
        variant="month"
      />
    </div>
  );
}

function MetricsSection({
  title,
  metrics,
  variant,
}: {
  title: string;
  metrics: AdminDashboardMetricsData;
  variant: "day" | "month";
}) {
  const periodLabel =
    variant === "day"
      ? metrics.periodStart.toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : metrics.periodStart.toLocaleDateString("es-AR", {
          month: "long",
          year: "numeric",
        });
  const commissionSubtitle =
    variant === "day" ? "Cobradas hoy" : "Cobradas este mes";

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        {title}
      </h2>
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
          subtitle={periodLabel}
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
          subtitle={commissionSubtitle}
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
    </section>
  );
}
