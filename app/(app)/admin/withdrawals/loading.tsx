import { AdminListPageSkeleton } from "@/components/admin/AdminSkeletons";

export default function AdminWithdrawalsLoading() {
  return (
    <AdminListPageSkeleton
      titleWidth="w-36"
      showDateRange
      columns={5}
    />
  );
}
