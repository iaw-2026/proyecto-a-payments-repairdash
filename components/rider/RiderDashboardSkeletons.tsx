import type { CSSProperties } from "react";

function SkeletonBlock({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded bg-surface-elevated/50 animate-pulse ${className}`}
      style={style}
    />
  );
}

export function RiderHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-9 w-52 rounded-md" />
      <SkeletonBlock className="h-4 w-full max-w-md" />
    </div>
  );
}

export function PendingPaymentSectionSkeleton() {
  return (
    <section className="rounded-xl border border-border bg-surface/70 p-6 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-7 w-52 rounded-md" />
          <SkeletonBlock className="h-4 w-full max-w-md" />
          <SkeletonBlock className="h-4 w-4/5 max-w-sm" />
        </div>
        <SkeletonBlock className="h-7 w-24 rounded-full" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-surface-elevated/30 p-4"
          >
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="mt-3 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function PaymentActionSectionSkeleton() {
  return (
    <aside className="flex flex-col justify-between rounded-xl border border-border bg-surface/70 p-6 backdrop-blur">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="h-7 w-40 rounded-md" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-4/5" />
      </div>

      <SkeletonBlock className="mt-6 h-11 w-full rounded-md" />
    </aside>
  );
}

export function TransactionHistorySkeleton() {
  return (
    <section className="rounded-xl border border-border bg-surface/70 backdrop-blur">
      <div className="flex flex-col gap-2 border-b border-border bg-surface-elevated/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-7 w-56 rounded-md" />
        </div>
        <SkeletonBlock className="h-4 w-28" />
      </div>

      <div className="overflow-x-auto">
        <div className="hidden min-w-[720px] md:block">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b border-border px-5 py-3.5">
            <SkeletonBlock className="h-3 w-12" />
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-3 w-14" />
          </div>

          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center border-b border-border px-5 py-4 last:border-b-0"
            >
              <SkeletonBlock className="h-4 w-44" />
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-6 w-24 rounded-full" />
              <SkeletonBlock className="h-4 w-28" />
            </div>
          ))}
        </div>

        <div className="divide-y divide-border md:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <SkeletonBlock className="h-5 w-32" />
                  <SkeletonBlock className="h-3 w-28" />
                </div>
                <div className="flex flex-col items-end gap-3">
                  <SkeletonBlock className="h-6 w-24 rounded-full" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-4 sm:px-5">
        <SkeletonBlock className="h-4 w-28" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-24 rounded-lg" />
          <SkeletonBlock className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </section>
  );
}

export function RiderDashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 animate-fade-in sm:px-6 lg:px-0">
      <RiderHeaderSkeleton />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.4fr)]">
        <PendingPaymentSectionSkeleton />
        <PaymentActionSectionSkeleton />
      </div>

      <TransactionHistorySkeleton />

      <SkeletonBlock className="h-11 w-24 rounded-md" />
    </div>
  );
}
