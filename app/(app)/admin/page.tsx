import { AdminCommissionAction } from "@/components/admin/AdminCommissionAction";
import { AdminDashboardMetrics } from "@/components/admin/AdminDashboardMetrics";
import { AdminRefreshControls } from "@/components/admin/AdminRefreshControls";
import { getAdminDashboardData } from "@/lib/services/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { settings, dailyMetrics, monthlyMetrics } = await getAdminDashboardData();

  return (
    <div className="max-w-6xl space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-secondary">
            Resumen operativo de Payments y configuracion vigente.
          </p>
        </div>

        <AdminRefreshControls />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <AdminDashboardMetrics
          dailyMetrics={dailyMetrics}
          monthlyMetrics={monthlyMetrics}
        />
        <AdminCommissionAction
          currentRate={settings.commissionRate.toFixed(2)}
        />
      </div>
    </div>
  );
}
