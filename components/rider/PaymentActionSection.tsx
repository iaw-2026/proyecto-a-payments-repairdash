import type { RiderDashboardTransaction } from "@/lib/types/rider-dashboard";

export function PaymentActionSection({
  transaction,
}: {
  transaction: RiderDashboardTransaction | null;
}) {
  return (
    <aside className="flex flex-col justify-between rounded-xl border border-border bg-surface/70 p-6 backdrop-blur">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-muted">
          Accion principal
        </p>
        {transaction?.gatewayCheckoutUrl ? (
          <>
            <h3 className="mt-2 text-xl font-bold text-foreground">
              Confirmar pago
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Vas a salir a Mercado Pago para completar la operacion.
            </p>
          </>
        ) : transaction ? (
          <>
            <h3 className="mt-2 text-xl font-bold text-foreground">
              Checkout no disponible
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Todavia no se genero el link de pago. Volve a intentar desde Rider App.
            </p>
          </>
        ) : (
          <>
            <h3 className="mt-2 text-xl font-bold text-foreground">
              Sin pagos por confirmar
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Cuando haya un trabajo pendiente, vas a ver aca el acceso al pago.
            </p>
          </>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {transaction?.gatewayCheckoutUrl ? (
          <a
            href={transaction.gatewayCheckoutUrl}
            className="inline-flex w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)]"
          >
            Confirmar e ir a pagar
          </a>
        ) : (
          <span className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-md border border-border/50 bg-surface/30 px-6 py-3 text-sm font-semibold text-muted/70">
            Checkout no disponible
          </span>
        )}
      </div>
    </aside>
  );
}
