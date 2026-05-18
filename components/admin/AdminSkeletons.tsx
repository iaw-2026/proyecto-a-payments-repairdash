import { SkeletonBlock } from "@/components/ui/Skeleton";

export function AdminPageHeaderSkeleton({
  titleWidth = "w-44",
  subtitleWidth = "w-full max-w-md",
}: {
  titleWidth?: string;
  subtitleWidth?: string;
}) {
  return (
    <div className="space-y-3">
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className={`h-9 rounded-md ${titleWidth}`} />
      <SkeletonBlock className={`h-4 ${subtitleWidth}`} />
    </div>
  );
}

export function AdminMetricCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-accent opacity-40" />
      <div className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <SkeletonBlock className="h-10 w-10 rounded-lg" />
          <SkeletonBlock className="h-3 w-28" />
        </div>
        <SkeletonBlock className="h-9 w-36 rounded-md" />
        <SkeletonBlock className="mt-3 h-4 w-32" />
      </div>
    </div>
  );
}

export function AdminCommissionCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-surface/70 p-5 backdrop-blur sm:p-6">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-7 w-44 rounded-md" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-4/5" />
        <SkeletonBlock className="mt-4 h-8 w-24 rounded-md sm:mt-5" />
      </div>
      <SkeletonBlock className="mt-6 h-11 w-full rounded-md" />
    </div>
  );
}

export function AdminRefreshButtonSkeleton() {
  return <SkeletonBlock className="h-10 w-full rounded-md sm:w-32" />;
}

function AdminMetricSectionSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonBlock className="h-4 w-28" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <AdminMetricCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="max-w-6xl space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeaderSkeleton titleWidth="w-40" />
        <AdminRefreshButtonSkeleton />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <AdminMetricSectionSkeleton />
          <AdminMetricSectionSkeleton />
        </div>
        <AdminCommissionCardSkeleton />
      </div>
    </div>
  );
}

export function AdminFiltersSkeleton({ showDateRange = false }) {
  return (
    <div className="rounded-xl border border-border bg-surface/70 p-4 backdrop-blur">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_150px_150px_auto_auto]">
        <SkeletonBlock className="h-11 w-full rounded-lg" />
        <SkeletonBlock className="h-11 w-full rounded-lg" />
        {showDateRange ? (
          <div className="grid grid-cols-2 gap-3 lg:contents">
            <div>
              <SkeletonBlock className="mb-1.5 h-3 w-12 lg:hidden" />
              <SkeletonBlock className="h-11 w-full rounded-lg" />
            </div>
            <div>
              <SkeletonBlock className="mb-1.5 h-3 w-12 lg:hidden" />
              <SkeletonBlock className="h-11 w-full rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            <div className="hidden lg:block" />
            <div className="hidden lg:block" />
          </>
        )}
        <div className="grid grid-cols-2 gap-3 lg:contents">
          <SkeletonBlock className="h-11 w-full rounded-lg" />
          <SkeletonBlock className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function AdminTableSkeleton({
  columns = 5,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface/70 backdrop-blur">
      <div className="hidden overflow-x-auto md:block">
        <div
          className="grid gap-5 border-b border-border bg-surface-elevated/40 px-5 py-3.5"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(110px, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <SkeletonBlock key={index} className="h-3 w-16" />
          ))}
        </div>

        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-5 border-b border-border/50 px-5 py-4 last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(110px, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <SkeletonBlock
                key={columnIndex}
                className={columnIndex === 0 ? "h-4 w-32" : "h-4 w-24"}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="divide-y divide-border/50 md:hidden">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-3 px-5 py-4">
            <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
              <div className="space-y-3">
                <SkeletonBlock className="h-5 w-32" />
                <SkeletonBlock className="h-3 w-28" />
              </div>
              <SkeletonBlock className="h-6 w-24 rounded-full" />
            </div>
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPaginationSkeleton() {
  return (
    <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
      <SkeletonBlock className="h-4 w-28" />
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <SkeletonBlock className="h-9 w-full rounded-lg sm:w-24" />
        <SkeletonBlock className="h-9 w-full rounded-lg sm:w-24" />
      </div>
    </div>
  );
}

export function AdminListPageSkeleton({
  titleWidth = "w-40",
  showDateRange = false,
  columns = 5,
}: {
  titleWidth?: string;
  showDateRange?: boolean;
  columns?: number;
}) {
  return (
    <div className="max-w-6xl space-y-6 animate-fade-in">
      <AdminPageHeaderSkeleton titleWidth={titleWidth} />
      <AdminFiltersSkeleton showDateRange={showDateRange} />
      <SkeletonBlock className="h-4 w-28" />
      <AdminTableSkeleton columns={columns} />
      <AdminPaginationSkeleton />
    </div>
  );
}
