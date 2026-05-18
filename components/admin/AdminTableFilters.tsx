import Link from "next/link";

type FilterOption = {
  value: string;
  label: string;
};

type AdminTableFiltersProps = {
  pathname: string;
  searchPlaceholder: string;
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  statusOptions?: FilterOption[];
  showDateRange?: boolean;
};

export function AdminTableFilters({
  pathname,
  searchPlaceholder,
  q = "",
  status = "",
  from = "",
  to = "",
  statusOptions = [],
  showDateRange = false,
}: AdminTableFiltersProps) {
  return (
    <form
      action={pathname}
      className="rounded-xl border border-border bg-surface/70 p-4 backdrop-blur"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_150px_150px_auto_auto]">
        <label className="block">
          <span className="sr-only">Buscar</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted/60 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>

        {statusOptions.length > 0 ? (
          <label className="block">
            <span className="sr-only">Estado</span>
            <select
              name="status"
              defaultValue={status}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            >
              <option value="">Todos</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="hidden lg:block" />
        )}

        {showDateRange ? (
          <div className="grid grid-cols-2 gap-3 lg:contents">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted lg:sr-only">
                Desde
              </span>
              <input
                type="date"
                name="from"
                defaultValue={from}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted lg:sr-only">
                Hasta
              </span>
              <input
                type="date"
                name="to"
                defaultValue={to}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </label>
          </div>
        ) : (
          <>
            <div className="hidden lg:block" />
            <div className="hidden lg:block" />
          </>
        )}

        <div className="grid grid-cols-2 gap-3 lg:contents">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover"
          >
            Filtrar
          </button>
          <Link
            href={pathname}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-surface/60 px-5 text-sm font-semibold text-secondary transition-all hover:border-accent/40 hover:bg-surface-elevated/40 hover:text-foreground"
          >
            Limpiar
          </Link>
        </div>
      </div>
    </form>
  );
}
