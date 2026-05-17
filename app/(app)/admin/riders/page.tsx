import { AdminRidersTable } from "@/components/admin/AdminRidersTable";
import { AdminTableFilters } from "@/components/admin/AdminTableFilters";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { getAdminRiders } from "@/lib/services/admin";
import {
  firstSearchValue,
  parsePageSearchParam,
  redirectToCanonicalPage,
} from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function AdminRidersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const rawPage = resolvedParams.page;
  const q = firstSearchValue(resolvedParams.q);
  const { items, totalCount, totalPages, currentPage } = await getAdminRiders(
    { q },
    {
      page: parsePageSearchParam(rawPage),
      pageSize: 10,
    },
  );

  redirectToCanonicalPage({
    pathname: "/admin/riders",
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
        <h1 className="mt-2 text-3xl font-bold text-foreground">Riders</h1>
        <p className="mt-1 text-secondary">
          Clientes, volumen pagado y actividad de checkout.
        </p>
      </div>

      <AdminTableFilters
        pathname="/admin/riders"
        searchPlaceholder="Buscar por nombre, email o ID"
        q={q}
      />

      <div className="text-sm text-secondary">{totalCount} riders</div>
      <AdminRidersTable items={items} />
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
