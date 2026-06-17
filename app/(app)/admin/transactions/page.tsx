import { AdminTableFilters } from "@/components/admin/AdminTableFilters";
import { AdminTransactionsTable } from "@/components/admin/AdminTransactionsTable";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { TransactionStatus } from "@/generated/prisma/client";
import {
  getAdminTransactions,
  type AdminDateFilters,
} from "@/lib/services/admin";
import {
  firstSearchValue,
  parsePageSearchParam,
  redirectToCanonicalPage,
} from "@/lib/pagination";

export const dynamic = "force-dynamic";

const transactionStatusOptions = [
  { value: TransactionStatus.PENDING, label: "Pendiente" },
  { value: TransactionStatus.RESERVED, label: "Reservada" },
  { value: TransactionStatus.LIQUIDATED, label: "Liquidada" },
  { value: TransactionStatus.TRANSFERRED, label: "Transferido" },
  { value: TransactionStatus.DISPUTED, label: "En disputa" },
  { value: TransactionStatus.REFUNDED, label: "Reembolsada" },
  { value: TransactionStatus.FAILED, label: "Fallida" },
];

export default async function AdminTransactionsPage({
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
    await getAdminTransactions(filters, {
      page: parsePageSearchParam(rawPage),
      pageSize: 10,
    });

  redirectToCanonicalPage({
    pathname: "/admin/transactions",
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
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Transacciones
        </h1>
        <p className="mt-1 text-secondary">
          Historial completo de pagos, estados y referencias operativas.
        </p>
      </div>

      <AdminTableFilters
        pathname="/admin/transactions"
        searchPlaceholder="Buscar por cliente, driver, trabajo, pago o transaccion"
        q={filters.q}
        status={filters.status}
        from={filters.from}
        to={filters.to}
        statusOptions={transactionStatusOptions}
        showDateRange
      />

      <div className="text-sm text-secondary">{totalCount} transacciones</div>
      <AdminTransactionsTable items={items} />
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
