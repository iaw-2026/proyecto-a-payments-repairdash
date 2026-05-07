export default function WithdrawalsLoading() {
  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      {/* ── Header skeleton ── */}
      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-surface-elevated/60 animate-pulse" />
        <div className="h-8 w-40 rounded-md bg-surface-elevated/60 animate-pulse" />
        <div className="h-4 w-72 rounded bg-surface-elevated/40 animate-pulse" />
      </div>

      {/* ── Table skeleton ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface/70 backdrop-blur">
        {/* Header row */}
        <div className="border-b border-border bg-surface-elevated/40 px-5 py-3.5">
          <div className="hidden md:flex gap-8">
            <div className="h-3 w-16 rounded bg-muted/20 animate-pulse" />
            <div className="h-3 w-14 rounded bg-muted/20 animate-pulse" />
            <div className="h-3 w-14 rounded bg-muted/20 animate-pulse" />
            <div className="h-3 w-10 rounded bg-muted/20 animate-pulse" />
          </div>
          {/* Mobile header */}
          <div className="md:hidden h-3 w-24 rounded bg-muted/20 animate-pulse" />
        </div>

        {/* Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-border/50 last:border-b-0"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Desktop row */}
            <div className="hidden md:flex items-center gap-8 px-5 py-4">
              <div className="h-4 w-36 rounded bg-surface-elevated/50 animate-pulse" />
              <div className="h-4 w-24 rounded bg-surface-elevated/60 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-surface-elevated/40 animate-pulse" />
              <div className="h-4 w-16 rounded bg-surface-elevated/30 animate-pulse" />
            </div>

            {/* Mobile card */}
            <div className="md:hidden space-y-3 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-28 rounded bg-surface-elevated/60 animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-surface-elevated/40 animate-pulse" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 w-32 rounded bg-surface-elevated/30 animate-pulse" />
                <div className="h-3 w-16 rounded bg-surface-elevated/30 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination skeleton ── */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-surface-elevated/40 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-surface-elevated/30 animate-pulse" />
          <div className="h-9 w-24 rounded-lg bg-surface-elevated/30 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
