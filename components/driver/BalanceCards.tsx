import { MetricCard } from "@/components/ui/MetricCard";
import { Balance } from "@/generated/prisma";

interface BalanceCardsProps {
  balance: Balance;
  earnedThisMonth: number; // TODO: Dato calculado mediante agregación
  currency: string;
}

/** Formatea un número como moneda ARS */
function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Tres tarjetas de balance del driver:
 * - Saldo Disponible (para retirar) → color success (verde)
 * - Saldo Reservado (pendientes de liquidar) → color secondary (purple claro)
 * - Total Ganado el Mes → color accent (magenta)
 */
export function BalanceCards({ balance, earnedThisMonth, currency }: BalanceCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        }
        label="Saldo Disponible"
        value={formatARS(balance.balanceAvailable.toNumber())}
        valueColor="text-success"
        subtitle="Disponible para retirar"
      />

      <MetricCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        }
        label="Saldo Reservado"
        value={formatARS(balance.balanceLocked.toNumber())}
        valueColor="text-warning"
        subtitle="Pagos pendientes de liquidar"
      />

      <MetricCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        }
        label="Total del Mes"
        value={formatARS(earnedThisMonth)}
        valueColor="text-accent"
        subtitle="Acumulado este mes"
      />
    </div>
  );
}
