import { MetricCard } from "@/components/ui/MetricCard";
import { Balance } from "@/generated/prisma";
import type { Prisma } from "@/generated/prisma/client";

type MoneyAmount = Prisma.Decimal | string;

interface BalanceCardsProps {
  balance: Balance;
  earnedThisMonth: MoneyAmount; // TODO: Dato calculado mediante agregación
}

function toDecimalParts(value: MoneyAmount) {
  const normalized = value.toString();
  const [rawInteger = "0", rawFraction = ""] = normalized.split(".");
  const isNegative = rawInteger.startsWith("-");
  const integer = isNegative ? rawInteger.slice(1) : rawInteger;
  const fraction = rawFraction.padEnd(2, "0").slice(0, 2);

  return {
    integer: `${isNegative ? "-" : ""}${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
    fraction,
  };
}

/** Formatea un Decimal como moneda ARS sin convertirlo a number. */
function formatARS(value: MoneyAmount): string {
  const { integer, fraction } = toDecimalParts(value);
  return `$ ${integer},${fraction}`;
}

/**
 * Tres tarjetas de balance del driver:
 * - Saldo Disponible (para retirar)
 * - Saldo Reservado (pendientes de liquidar)
 * - Total Ganado el Mes
 */
export function BalanceCards({ balance, earnedThisMonth }: BalanceCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        }
        label="Saldo Disponible"
        value={formatARS(balance.balanceAvailable)}
        valueColor="text-success"
        subtitle="Disponible para retirar"
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
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        }
        label="Saldo Reservado"
        value={formatARS(balance.balanceLocked)}
        valueColor="text-warning"
        subtitle="Pagos pendientes de liquidar"
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
