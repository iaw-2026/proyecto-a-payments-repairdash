function RiderAppButton({ riderAppUrl }: { riderAppUrl: string }) {
  return (
    <a
      href={riderAppUrl}
      className="inline-flex w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)] lg:w-auto"
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
  );
}

export function RiderDashboardHeader({
  riderName,
  riderAppUrl,
}: {
  riderName: string;
  riderAppUrl: string | null;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Rider
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Hola, {riderName}
        </h1>
        <p className="mt-1 text-secondary">
          Consulta tus pagos pendientes y el historial de trabajos.
        </p>
      </div>

      {riderAppUrl ? (
        <div className="hidden lg:block">
          <RiderAppButton riderAppUrl={riderAppUrl} />
        </div>
      ) : null}
    </div>
  );
}

export function RiderAppReturnButton({ riderAppUrl }: { riderAppUrl: string }) {
  return <RiderAppButton riderAppUrl={riderAppUrl} />;
}
