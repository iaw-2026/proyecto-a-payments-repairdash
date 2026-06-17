import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function LiquidationsLoading() {
  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-8 w-52 rounded-md" />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface/70 backdrop-blur">
        <div className="hidden md:block">
          <div className="grid grid-cols-[1.2fr_0.9fr_1fr_0.9fr_0.8fr] gap-5 border-b border-border bg-surface-elevated/40 px-5 py-3.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-3 w-16" />
            ))}
          </div>

          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-[1.2fr_0.9fr_1fr_0.9fr_0.8fr] gap-5 border-b border-border/50 px-5 py-4 last:border-b-0"
            >
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-4 w-24" />
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-3 w-12" />
              </div>
              <SkeletonBlock className="h-4 w-24" />
              <SkeletonBlock className="h-4 w-20" />
            </div>
          ))}
        </div>

        <div className="divide-y divide-border/50 md:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-3 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-28" />
                  <SkeletonBlock className="h-6 w-32 rounded-md" />
                </div>
                <SkeletonBlock className="h-6 w-20 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-12" />
                  <SkeletonBlock className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <SkeletonBlock className="h-3 w-16" />
                  <SkeletonBlock className="h-4 w-24" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
        <SkeletonBlock className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <SkeletonBlock className="h-9 w-full rounded-lg sm:w-24" />
          <SkeletonBlock className="h-9 w-full rounded-lg sm:w-24" />
        </div>
      </div>
    </div>
  );
}
