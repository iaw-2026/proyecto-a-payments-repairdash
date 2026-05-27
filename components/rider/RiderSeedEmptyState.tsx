export function RiderSeedEmptyState() {
  return (
    <div className="max-w-4xl">
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="text-secondary">
          No se encontro un rider seed. Ejecuta{" "}
          <code className="rounded bg-background px-2 py-1 font-mono text-sm text-accent">
            npx prisma db seed
          </code>{" "}
          primero.
        </p>
      </div>
    </div>
  );
}
