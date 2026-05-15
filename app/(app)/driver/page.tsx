import { Suspense } from "react";
import { getCurrentDriverWithBalance } from "@/lib/services/users";
import { BalanceCards } from "@/components/driver/BalanceCards";
import { IncomeChart } from "@/components/driver/IncomeChart";
import { QuickWithdrawalAction } from "@/components/driver/QuickWithdrawalAction";
import {
  BalanceCardsSkeleton,
  DriverHeaderSkeleton,
  IncomeChartSkeleton,
  QuickWithdrawalActionSkeleton,
} from "@/components/driver/DriverDashboardSkeletons";
import { MOCK_EARNED_THIS_MONTH, MOCK_INCOME_CHART } from "@/lib/mocks/driver-mocks";

export const dynamic = "force-dynamic";

type DriverUserPromise = ReturnType<typeof getCurrentDriverWithBalance>;

export default function DriverDashboardPage() {
  // Disparamos la query una sola vez y compartimos la misma promesa entre secciones.
  // Como no usamos await acá, la página puede renderizar los skeletons enseguida.
  const userPromise = getCurrentDriverWithBalance();

  return (
    <div className="max-w-5xl space-y-8 animate-fade-in">
      {/* Header: muestra el saludo cuando llega el user. */}
      <Suspense fallback={<DriverHeaderSkeleton />}>
        <DriverDashboardHeader userPromise={userPromise} />
      </Suspense>

      {/* Balance: depende del trabajador y su Balance 1:1 del schema. */}
      <Suspense fallback={<BalanceCardsSkeleton />}>
        <DriverBalanceSection userPromise={userPromise} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.4fr]">
        {/* Gráfico: hoy usa mocks, pero queda aislado para una futura query async. */}
        <Suspense fallback={<IncomeChartSkeleton />}>
          <DriverIncomeSection />
        </Suspense>

        {/* Acción rápida: necesita el balance disponible para abrir el modal de retiro. */}
        <Suspense fallback={<QuickWithdrawalActionSkeleton />}>
          <DriverWithdrawalSection userPromise={userPromise} />
        </Suspense>
      </div>
    </div>
  );
}

async function DriverDashboardHeader({
  userPromise,
}: {
  userPromise: DriverUserPromise;
}) {
  // Esta sección suspende hasta que resuelve userPromise; mientras tanto se ve DriverHeaderSkeleton.
  const user = await userPromise;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
        Dashboard
      </p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">
        {user ? `Hola, ${user.fullName}` : "Dashboard del driver"}
      </h1>
      <p className="mt-1 text-secondary">Resumen financiero de tu cuenta.</p>
    </div>
  );
}

async function DriverBalanceSection({
  userPromise,
}: {
  userPromise: DriverUserPromise;
}) {
  // Esta sección suspende de forma independiente y luego valida que exista Trabajador + Balance.
  const user = await userPromise;

  // Si faltan datos seed, mostramos el aviso solamente en el espacio del balance.
  if (!user?.trabajador?.balance) {
    return <DriverSeedEmptyState />;
  }

  return (
    <BalanceCards
      balance={user.trabajador.balance}
      earnedThisMonth={MOCK_EARNED_THIS_MONTH} // TODO: Dato calculado mediante agregación
    />
  );
}

async function DriverIncomeSection() {
  // No espera DB por ahora, pero sigue bajo Suspense para mantener el patrón por componente.
  return <IncomeChart data={MOCK_INCOME_CHART} />;
}

async function DriverWithdrawalSection({
  userPromise,
}: {
  userPromise: DriverUserPromise;
}) {
  // Reutiliza la misma promesa del dashboard para no duplicar la consulta de usuario.
  const user = await userPromise;

  // Sin balance no hay retiro posible; el aviso principal ya lo muestra DriverBalanceSection.
  if (!user?.trabajador?.balance) {
    return null;
  }

  return (
    <QuickWithdrawalAction
      balanceAvailable={user.trabajador.balance.balanceAvailable.toString()}
    />
  );
}

function DriverSeedEmptyState() {
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
