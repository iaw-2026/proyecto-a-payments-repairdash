import { AdminListPageSkeleton } from "@/components/admin/AdminSkeletons";

export default function AdminTransactionsLoading() {
  return (
    <AdminListPageSkeleton
      titleWidth="w-56"
      showDateRange
      columns={7}
    />
  );
}
