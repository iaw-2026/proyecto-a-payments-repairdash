import Link from "next/link";
import { getWithdrawals } from "@/lib/services/withdrawals";
import { WithdrawalTable } from "@/components/driver/WithdrawalTable";
import { PaginationControls } from "@/components/ui/PaginationControls";
import {
  parsePageSearchParam,
  redirectToCanonicalPage,
} from "@/lib/pagination";

export const dynamic = "force-dynamic";

/* ── Page Component ── */

export default async function DriverWithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rawPage = resolvedParams.page;
  const page = parsePageSearchParam(rawPage);

  const { items, totalPages, currentPage } = await getWithdrawals(page, 10);

  redirectToCanonicalPage({
    pathname: "/driver/withdrawals",
    searchParams: resolvedParams,
    requestedPageValue: rawPage,
    currentPage,
  });

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Driver
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Retiros</h1>
        <p className="mt-1 text-secondary">
          Historial de solicitudes de retiro de fondos.
        </p>
      </div>

      {/* ── Content ── */}
      {items.length === 0 ? (
        /* ── Empty State ── */
        <div className="rounded-xl border border-border bg-surface/70 backdrop-blur">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            {/* Icon */}
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-subtle">
              <svg
                className="h-8 w-8 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-foreground">
              Sin retiros todavía
            </h2>
            <p className="mt-2 max-w-sm text-sm text-secondary">
              Cuando solicites tu primer retiro de fondos, aparecerá acá con
              todos los detalles y el estado del mismo.
            </p>

            <Link
              href="/driver"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent-glow"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              Ir al dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* ── Table + Pagination ── */
        <>
          <WithdrawalTable items={items} />

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
