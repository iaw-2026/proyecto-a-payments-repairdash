import { formatARS } from "@/lib/money";
import type {
  RiderDashboardTransaction,
  RiderDashboardWorker,
} from "@/lib/types/rider-dashboard";
import { RiderStatusBadge } from "@/components/rider/RiderStatusBadge";

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}

export function PendingPaymentSection({
  transaction,
  worker,
}: {
  transaction: RiderDashboardTransaction | null;
  worker: RiderDashboardWorker | null;
}) {
  if (!transaction) {
    return (
      <section className="rounded-xl border border-border bg-surface/70 p-6 backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Estado
        </p>
        <h2 className="mt-2 text-xl font-bold text-foreground">
          Estas al dia
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-secondary">
          No tenes pagos pendientes por confirmar.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface/70 p-6 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            Pago pendiente
          </p>
          <h2 className="mt-2 text-xl font-bold text-foreground">
            Servicio de reparacion
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            Revisa el detalle antes de continuar a Mercado Pago. La confirmacion final llega por webhook.
          </p>
        </div>
        <RiderStatusBadge status={transaction.status} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SummaryItem label="Monto" value={formatARS(transaction.amount)} />
        <SummaryItem label="Trabajo" value={transaction.trabajoId} />
        <SummaryItem
          label="Trabajador"
          value={worker?.user.fullName ?? transaction.trabajadorId}
        />
        <SummaryItem label="Transaccion" value={transaction.id} />
      </div>
    </section>
  );
}
