import { LiquidationsTable } from "@/components/driver/LiquidationsTable";
import { PaginationControls } from "@/components/ui/PaginationControls";
import {
  parsePageSearchParam,
  redirectToCanonicalPage,
} from "@/lib/pagination";
import { getDriverLiquidations } from "@/lib/services/liquidations";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DriverLiquidationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rawPage = resolvedParams.page;
  const page = parsePageSearchParam(rawPage);
  const { items, totalPages, currentPage } = await getDriverLiquidations(page, 10);

  redirectToCanonicalPage({
    pathname: "/driver/liquidations",
    searchParams: resolvedParams,
    requestedPageValue: rawPage,
    currentPage,
  });

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Driver
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Liquidaciones
        </h1>
        <p className="mt-2 text-secondary">
          Historial de liquidaciones y cierres de balance.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/70 p-8 backdrop-blur">
          <h2 className="text-lg font-semibold text-foreground">
            Sin liquidaciones todavia
          </h2>
          <p className="mt-2 text-secondary">
            Cuando un pago reservado cumpla el plazo de liquidacion, vas a ver
            aca el bruto, la comision y el neto disponible para retirar.
          </p>
          <Link
            href="/driver"
            className="mt-6 inline-flex rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover"
          >
            Volver al dashboard
          </Link>
        </div>
      ) : (
        <>
          <LiquidationsTable items={items} />
          <PaginationControls currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
