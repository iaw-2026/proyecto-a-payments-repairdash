export function RiderDashboardHeader({ riderName }: { riderName: string }) {
  return (
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
  );
}
