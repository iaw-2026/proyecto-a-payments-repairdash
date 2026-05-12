import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import type { CheckoutResultData, CheckoutResultKind } from "@/lib/services/rider-checkout";

type CheckoutResultViewProps = {
  kind: CheckoutResultKind;
  data: CheckoutResultData | null;
};

type ResultCopy = {
  eyebrow: string;
  title: string;
  emptyTitle: string;
  emptyBody: string;
  toneClassName: string;
  iconClassName: string;
};

const RESULT_COPY: Record<CheckoutResultKind, ResultCopy> = {
  success: {
    eyebrow: "Checkout",
    title: "Pago confirmado",
    emptyTitle: "No pudimos identificar el pago",
    emptyBody: "Falta el identificador de transaccion para consultar el estado interno.",
    toneClassName: "text-success",
    iconClassName: "bg-success/10 text-success",
  },
  pending: {
    eyebrow: "Checkout",
    title: "Pago en proceso",
    emptyTitle: "No pudimos consultar el pago",
    emptyBody: "Necesitamos el identificador de transaccion para mostrar el detalle.",
    toneClassName: "text-warning",
    iconClassName: "bg-warning/10 text-warning",
  },
  failure: {
    eyebrow: "Checkout",
    title: "Pago no aprobado",
    emptyTitle: "No pudimos validar el rechazo",
    emptyBody: "Falta el identificador de transaccion para recuperar el pago original.",
    toneClassName: "text-danger",
    iconClassName: "bg-danger/10 text-danger",
  },
};

function toDecimalParts(value: Prisma.Decimal | string) {
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

function formatARS(value: Prisma.Decimal | string) {
  const { integer, fraction } = toDecimalParts(value);
  return `$ ${integer},${fraction}`;
}

function buildRefreshHref(kind: CheckoutResultKind, transactionId: string) {
  const params = new URLSearchParams({
    transactionId,
    refreshedAt: Date.now().toString(),
  });

  return `/rider/checkout/${kind}?${params.toString()}`;
}

function ResultEmptyState({ copy }: { copy: ResultCopy }) {
  return (
    <div className="flex min-h-[calc(100dvh-var(--spacing-topbar)-1.5rem)] w-full items-center justify-center px-2 py-4 sm:min-h-[calc(100dvh-var(--spacing-topbar))] sm:px-6 sm:py-8">
      <div className="w-full max-w-3xl space-y-4 animate-fade-in sm:space-y-6">
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            {copy.eyebrow}
          </p>
          <h1 className="mt-1.5 text-xl font-bold text-foreground sm:mt-2 sm:text-3xl">
            {copy.emptyTitle}
          </h1>
          <p className="mt-1 text-sm text-secondary sm:text-base">{copy.emptyBody}</p>
        </div>

        <div className="rounded-xl border border-border bg-surface/70 p-3.5 backdrop-blur sm:p-6">
          <p className="text-xs leading-relaxed text-secondary sm:text-sm">
            Volve al historial para revisar los pagos recientes o iniciar un nuevo intento desde Rider.
          </p>
          <div className="mt-4 flex flex-col gap-2.5 sm:mt-6 sm:gap-3 sm:flex-row">
            <Link
              href="/rider/payments"
              className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)] sm:px-5 sm:py-3 sm:text-sm"
            >
              Ver historial
            </Link>
            <Link
              href="/rider"
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-xs font-semibold text-foreground transition-all hover:border-accent/40 hover:bg-white/5 sm:px-5 sm:py-3 sm:text-sm"
            >
              Volver a Rider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutSummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface-elevated/30 px-2.5 py-2.5 text-left sm:px-4 sm:py-3">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-muted sm:text-xs sm:tracking-[0.18em]">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-foreground [overflow-wrap:anywhere] sm:text-base">
        {value}
      </p>
    </div>
  );
}

function CheckoutSummaryResult({
  copy,
  kind,
  data,
}: {
  copy: ResultCopy;
  kind: CheckoutResultKind;
  data: CheckoutResultData;
}) {
  const { transaction, trabajador } = data;
  const shouldShowRefresh = kind === "pending" || kind === "failure";

  return (
    <div className="flex min-h-[calc(100dvh-var(--spacing-topbar)-1.5rem)] w-full items-center justify-center px-2 py-4 sm:min-h-[calc(100dvh-var(--spacing-topbar))] sm:px-6 sm:py-8">
      <section className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-surface/70 p-3.5 text-center shadow-2xl shadow-black/10 backdrop-blur animate-fade-in sm:max-w-xl sm:p-8">
        <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg sm:h-14 sm:w-14 ${copy.iconClassName}`}>
          {kind === "pending" ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 animate-spin sm:h-7 sm:w-7"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-3-6.7" />
            </svg>
          ) : null}
          {kind === "failure" ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 sm:h-7 sm:w-7"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : null}
          {kind === "success" ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 sm:h-7 sm:w-7"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : null}
        </div>

        <h1 className={`mt-3 text-balance text-lg font-bold leading-tight sm:mt-5 sm:text-3xl ${copy.toneClassName}`}>
          {copy.title}
        </h1>

        <div className="mt-4 grid min-w-0 gap-2.5 sm:mt-6 sm:gap-3">
          <CheckoutSummaryItem label="Valor del trabajo" value={formatARS(transaction.amount)} />
          <CheckoutSummaryItem label="ID del trabajo" value={transaction.trabajoId} />
          <CheckoutSummaryItem
            label="Trabajador"
            value={trabajador?.user.fullName ?? transaction.trabajadorId}
          />
        </div>

        <div className="mt-4 flex flex-col justify-center gap-2.5 sm:mt-6 sm:gap-3 md:flex-row">
          {shouldShowRefresh ? (
            <Link
              href={buildRefreshHref(kind, transaction.id)}
              className="inline-flex w-full items-center justify-center rounded-md border border-border px-3 py-2.5 text-xs font-semibold text-foreground transition-all hover:border-accent/40 hover:bg-white/5 sm:px-4 sm:py-3 sm:text-sm md:w-auto"
            >
              Actualizar estado
            </Link>
          ) : null}
          <Link
            href="/rider/payments"
            className="inline-flex w-full items-center justify-center rounded-md bg-accent px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)] sm:px-4 sm:py-3 sm:text-sm md:w-auto"
          >
            Volver al historial
          </Link>
        </div>
      </section>
    </div>
  );
}

export function CheckoutResultView({ kind, data }: CheckoutResultViewProps) {
  const copy = RESULT_COPY[kind];

  if (!data) {
    return <ResultEmptyState copy={copy} />;
  }

  return <CheckoutSummaryResult copy={copy} kind={kind} data={data} />;
}
