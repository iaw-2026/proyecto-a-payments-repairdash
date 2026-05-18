import { SkeletonBlock } from "@/components/ui/Skeleton";

export function DriverHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-9 w-56 rounded-md" />
      <SkeletonBlock className="h-4 w-72" />
    </div>
  );
}

export function BalanceCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-xl border border-border bg-surface"
        >
          <div className="absolute inset-x-0 top-0 h-[2px] bg-accent opacity-40" />
          <div className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-lg" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
            <SkeletonBlock className="h-9 w-36 rounded-md" />
            <SkeletonBlock className="mt-3 h-4 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function IncomeChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface/70 p-6 backdrop-blur">
      <div className="mb-6 space-y-3">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-7 w-36 rounded-md" />
      </div>

      <div className="flex h-64 w-full items-end gap-3">
        {[42, 68, 52, 78, 64, 88, 36].map((height, index) => (
          <div key={index} className="flex flex-1 items-end">
            <SkeletonBlock
              className="w-full rounded-t-md"
              style={{ height: `${height}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuickWithdrawalActionSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-surface/70 p-6 backdrop-blur">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-7 w-40 rounded-md" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-4/5" />
      </div>

      <SkeletonBlock className="mt-6 h-11 w-full rounded-md" />
    </div>
  );
}
