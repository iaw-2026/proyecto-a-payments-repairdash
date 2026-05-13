import Link from "next/link";
import type { RiderDashboardData } from "@/lib/types/rider-dashboard";
import { PaymentActionSection } from "@/components/rider/PaymentActionSection";
import { PendingPaymentSection } from "@/components/rider/PendingPaymentSection";
import { RiderDashboardHeader } from "@/components/rider/RiderDashboardHeader";
import { TransactionHistory } from "@/components/rider/TransactionHistory";

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

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 animate-fade-in sm:px-6 lg:px-0">
      <RiderDashboardHeader riderName={rider.fullName} />

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

      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-secondary transition-all hover:border-accent/40 hover:bg-surface-elevated/40 hover:text-foreground"
      >
        Volver
      </Link>
    </div>
  );
}
