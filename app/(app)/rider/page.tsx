import { RiderDashboardView } from "@/components/rider/RiderDashboardView";
import { RiderSeedEmptyState } from "@/components/rider/RiderSeedEmptyState";
import { getRiderDashboardData } from "@/lib/services/rider-dashboard";

export const dynamic = "force-dynamic";

type RiderPageProps = {
  searchParams: Promise<{
    transactionId?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RiderPage({ searchParams }: RiderPageProps) {
  const { transactionId: rawTransactionId } = await searchParams;
  const transactionId = firstSearchValue(rawTransactionId);
  const dashboardData = await getRiderDashboardData(transactionId);

  if (!dashboardData.rider?.cliente) {
    return <RiderSeedEmptyState />;
  }

  return <RiderDashboardView {...dashboardData} />;
}
