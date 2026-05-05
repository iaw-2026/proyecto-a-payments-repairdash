type BalanceSummaryProps = {
  available: number;
  locked: number;
};

export function BalanceSummary({ available, locked }: BalanceSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saldo disponible</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-200">{available}</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saldo bloqueado</p>
        <p className="mt-2 text-2xl font-semibold text-cyan-200">{locked}</p>
      </div>
    </div>
  );
}