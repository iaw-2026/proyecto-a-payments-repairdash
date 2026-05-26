import { AdminTableFilters } from "@/components/admin/AdminTableFilters";
import { AdminWithdrawalsTable } from "@/components/admin/AdminWithdrawalsTable";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { WithdrawalStatus } from "@/generated/prisma/client";
import {
  getAdminWithdrawals,
  type AdminDateFilters,
} from "@/lib/services/admin";
import {
  firstSearchValue,
  parsePageSearchParam,
  redirectToCanonicalPage,
} from "@/lib/pagination";

export const dynamic = "force-dynamic";

const withdrawalStatusOptions = [
  { value: WithdrawalStatus.REQUESTED, label: "Solicitado" },
  { value: WithdrawalStatus.APPROVED, label: "Transferido" },
  { value: WithdrawalStatus.REJECTED, label: "Rechazado" },
];

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rawPage = resolvedParams.page;
  const filters: AdminDateFilters = {
    q: firstSearchValue(resolvedParams.q),
    status: firstSearchValue(resolvedParams.status),
    from: firstSearchValue(resolvedParams.from),
    to: firstSearchValue(resolvedParams.to),
  };

  const { items, totalCount, totalPages, currentPage } =
    await getAdminWithdrawals(filters, {
      page: parsePageSearchParam(rawPage),
      pageSize: 10,
    });

  redirectToCanonicalPage({
    pathname: "/admin/withdrawals",
    searchParams: resolvedParams,
    requestedPageValue: rawPage,
    currentPage,
  });

  return (
    <div className="max-w-6xl space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Retiros</h1>
        <p className="mt-1 text-secondary">
          Historial operativo de solicitudes automaticas.
        </p>
      </div>

      <AdminTableFilters
        pathname="/admin/withdrawals"
        searchPlaceholder="Buscar por driver, email o retiro"
        q={filters.q}
        status={filters.status}
        from={filters.from}
        to={filters.to}
        statusOptions={withdrawalStatusOptions}
        showDateRange
      />

      <div className="text-sm text-secondary">{totalCount} retiros</div>
      <AdminWithdrawalsTable items={items} />
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
