import { AdminDriversTable } from "@/components/admin/AdminDriversTable";
import { AdminTableFilters } from "@/components/admin/AdminTableFilters";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { getAdminDrivers } from "@/lib/services/admin";
import {
  firstSearchValue,
  parsePageSearchParam,
  redirectToCanonicalPage,
} from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function AdminDriversPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rawPage = resolvedParams.page;
  const q = firstSearchValue(resolvedParams.q);
  const { items, totalCount, totalPages, currentPage } = await getAdminDrivers(
    { q },
    {
      page: parsePageSearchParam(rawPage),
      pageSize: 10,
    },
  );

  redirectToCanonicalPage({
    pathname: "/admin/drivers",
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
        <h1 className="mt-2 text-3xl font-bold text-foreground">Drivers</h1>
        <p className="mt-1 text-secondary">
          Trabajadores, balances y actividad reciente.
        </p>
      </div>

      <AdminTableFilters
        pathname="/admin/drivers"
        searchPlaceholder="Buscar por nombre, email, ID o CBU/CVU"
        q={q}
      />

      <div className="text-sm text-secondary">{totalCount} drivers</div>
      <AdminDriversTable items={items} />
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
