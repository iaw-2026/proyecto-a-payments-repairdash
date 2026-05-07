import { getUserWithBalance } from "@/lib/services/users";
import { BalanceCards } from "@/components/driver/BalanceCards";
import { IncomeChart } from "@/components/driver/IncomeChart";
import { QuickWithdrawalAction } from "@/components/driver/QuickWithdrawalAction";
import { MOCK_EARNED_THIS_MONTH, MOCK_INCOME_CHART } from "@/lib/mocks/driver-mocks";

export default async function DriverDashboardPage() {
  /* ── Query: traer el user con rol driver y su balance ── */
  const user = await getUserWithBalance("driver");

  /* ── Guard: sin datos de seed ── */
  if (!user?.trabajador?.balance) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-secondary">
            No se encontró un driver seed. Ejecutá{" "}
            <code className="rounded bg-background px-2 py-1 font-mono text-sm text-accent">
              npx prisma db seed
            </code>{" "}
            primero.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Hola, {user.fullName}
        </h1>
        <p className="mt-1 text-secondary">
          Resumen financiero de tu cuenta.
        </p>
      </div>

      {/* ── Balance Cards ── */}
      <BalanceCards
        balance={user.trabajador.balance}
        earnedThisMonth={MOCK_EARNED_THIS_MONTH} // TODO: Dato calculado mediante agregación
        currency="ARS"
      />

      {/* ── Gráfico de Ingresos + Acción Rápida ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_0.4fr]">
        <IncomeChart data={MOCK_INCOME_CHART} />

        <QuickWithdrawalAction balanceAvailable={user.trabajador.balance.balanceAvailable.toString()} />
      </div>
    </div>
  );
}