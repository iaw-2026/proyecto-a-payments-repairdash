import type { RiderDashboardData } from "@/lib/types/rider-dashboard";
import { PaymentActionSection } from "@/components/rider/PaymentActionSection";
import { PendingPaymentSection } from "@/components/rider/PendingPaymentSection";
import {
  RiderAppReturnButton,
  RiderDashboardHeader,
} from "@/components/rider/RiderDashboardHeader";
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
      <RiderDashboardHeader
        riderName={rider.fullName}
        riderAppUrl={riderAppUrl}
      />

      {riderAppUrl ? (
        <div className="lg:hidden">
          <RiderAppReturnButton riderAppUrl={riderAppUrl} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.4fr)]">
        <PendingPaymentSection
          transaction={pendingTransaction}
          worker={worker}
        />
        <PaymentActionSection transaction={pendingTransaction} />
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
