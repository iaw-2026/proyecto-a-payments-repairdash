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
import {
  getDriverEarnedThisMonth,
  getDriverIncomeChart,
} from "@/lib/services/liquidations";
import { getDriverAppUrl } from "@/lib/driver-app-url";

export const dynamic = "force-dynamic";

type DriverUserPromise = ReturnType<typeof getCurrentDriverWithBalance>;

export default function DriverDashboardPage() {
  // Disparamos la query una sola vez y compartimos la misma promesa entre secciones.
  // Como no usamos await acá, la página puede renderizar los skeletons enseguida.
  const userPromise = getCurrentDriverWithBalance();
  const driverAppUrl = getDriverAppUrl();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 animate-fade-in">
      {/* Header: muestra el saludo cuando llega el user. */}
      <Suspense fallback={<DriverHeaderSkeleton />}>
        <DriverDashboardHeader
          userPromise={userPromise}
          driverAppUrl={driverAppUrl}
        />
      </Suspense>

      {driverAppUrl ? (
        <div className="lg:hidden">
          <DriverAppReturnButton driverAppUrl={driverAppUrl} />
        </div>
      ) : null}

      {/* Balance: depende del trabajador y su Balance 1:1 del schema. */}
      <Suspense fallback={<BalanceCardsSkeleton />}>
        <DriverBalanceSection userPromise={userPromise} />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.4fr]">
        {/* Gráfico: consulta ingresos agregados por día en DB. */}
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
  driverAppUrl,
}: {
  userPromise: DriverUserPromise;
  driverAppUrl: string | null;
}) {
  // Esta sección suspende hasta que resuelve userPromise; mientras tanto se ve DriverHeaderSkeleton.
  const user = await userPromise;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          {user ? `Hola, ${user.fullName}` : "Dashboard del driver"}
        </h1>
        <p className="mt-1 text-secondary">Resumen financiero de tu cuenta.</p>
      </div>

      {driverAppUrl ? (
        <div className="hidden lg:block">
          <DriverAppReturnButton driverAppUrl={driverAppUrl} />
        </div>
      ) : null}
    </div>
  );
}

function DriverAppReturnButton({ driverAppUrl }: { driverAppUrl: string }) {
  return (
    <a
      href={driverAppUrl}
      className="inline-flex w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)] lg:w-auto"
    >
      Volver a Driver App
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-2 h-4 w-4"
        aria-hidden="true"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </a>
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

  const earnedThisMonth = await getDriverEarnedThisMonth();

  return (
    <BalanceCards
      balance={user.trabajador.balance}
      earnedThisMonth={earnedThisMonth} // TODO: Dato calculado mediante agregación
    />
  );
}

async function DriverIncomeSection() {
  const data = await getDriverIncomeChart();

  return <IncomeChart data={data} />;
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
