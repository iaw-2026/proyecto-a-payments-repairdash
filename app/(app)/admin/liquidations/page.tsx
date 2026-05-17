import { updateCommissionRate } from "@/app/actions/liquidations";
import { getCommissionSettings } from "@/lib/services/liquidations";

export const dynamic = "force-dynamic";

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLiquidationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [settings, resolvedParams] = await Promise.all([
    getCommissionSettings(),
    searchParams,
  ]);
  const updated = firstSearchValue(resolvedParams.updated) === "1";
  const error = firstSearchValue(resolvedParams.error);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-slate-100">
      <div className="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Liquidaciones
          </h1>
          <p className="mt-3 text-slate-300">
            Configura la comision vigente para las proximas liquidaciones
            automaticas.
          </p>
        </div>

        {updated ? (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            Comision actualizada correctamente.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error === "forbidden"
              ? "No tenes permisos para cambiar la comision."
              : "Ingresa una comision valida entre 0 y 100, con hasta 2 decimales."}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-[1fr_1.3fr]">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">Comision vigente</p>
            <p className="mt-3 font-mono text-4xl font-semibold text-cyan-200">
              {settings.commissionRate.toFixed(2)}%
            </p>
            <p className="mt-3 text-xs text-slate-500">
              {settings.updatedAt
                ? `Ultima actualizacion: ${settings.updatedAt.toLocaleString("es-AR")}`
                : "Valor default inicial"}
            </p>
          </div>

          <form
            action={updateCommissionRate}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >
            <label
              htmlFor="commissionRate"
              className="text-sm font-medium text-slate-200"
            >
              Nuevo porcentaje
            </label>
            <div className="mt-3 flex gap-3">
              <input
                id="commissionRate"
                name="commissionRate"
                type="text"
                inputMode="decimal"
                defaultValue={settings.commissionRate.toFixed(2)}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 font-mono text-white outline-none transition focus:border-cyan-300/60"
              />
              <button
                type="submit"
                className="rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Guardar
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              El cambio afecta solo a pagos que todavia no fueron liquidados.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
