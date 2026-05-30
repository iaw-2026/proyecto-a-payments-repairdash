import type { RiderDashboardData } from "@/lib/types/rider-dashboard";
import { PaymentActionSection } from "@/components/rider/PaymentActionSection";
import { PendingPaymentSection } from "@/components/rider/PendingPaymentSection";
import { RiderDashboardHeader } from "@/components/rider/RiderDashboardHeader";
import { TransactionHistory } from "@/components/rider/TransactionHistory";
import { getRiderAppUrl } from "@/lib/rider-app-url";

export function RiderDashboardView({
  rider,
  transactions,
  totalTransactions,
  currentPage,
  totalPages,
  pendingTransaction,
  worker,
}: RiderDashboardData) {
  if (!rider) {
    return null;
  }

  const riderAppUrl = getRiderAppUrl();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 animate-fade-in sm:px-6 lg:px-0">
      <RiderDashboardHeader riderName={rider.fullName} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.4fr)]">
        <PendingPaymentSection
          transaction={pendingTransaction}
          worker={worker}
        />
        <div className="space-y-3">
          {riderAppUrl ? (
            <a
              href={riderAppUrl}
              className="inline-flex w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)]"
            >
              Volver a Rider App
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
          ) : null}
          <PaymentActionSection transaction={pendingTransaction} />
        </div>
      </div>

      <TransactionHistory
        transactions={transactions}
        totalTransactions={totalTransactions}
        currentPage={currentPage}
        totalPages={totalPages}
      />

    </div>
  );
}
