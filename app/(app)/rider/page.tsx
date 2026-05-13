import { RiderDashboardView } from "@/components/rider/RiderDashboardView";
import { RiderSeedEmptyState } from "@/components/rider/RiderSeedEmptyState";
import {
  firstSearchValue,
  parsePageSearchParam,
  redirectToCanonicalPage,
} from "@/lib/pagination";
import { getRiderDashboardData } from "@/lib/services/rider-dashboard";

export const dynamic = "force-dynamic";

type RiderPageProps = {
  searchParams: Promise<{
    transactionId?: string | string[];
    page?: string | string[];
  }>;
};

export default async function RiderPage({ searchParams }: RiderPageProps) {
  const resolvedSearchParams = await searchParams;
  const {
    transactionId: rawTransactionId,
    page: rawPage,
  } = resolvedSearchParams;
  const transactionId = firstSearchValue(rawTransactionId);
  const page = parsePageSearchParam(rawPage);
  const dashboardData = await getRiderDashboardData({
    transactionId,
    page,
    pageSize: 10,
  });

  redirectToCanonicalPage({
    pathname: "/rider",
    searchParams: resolvedSearchParams,
    requestedPageValue: rawPage,
    currentPage: dashboardData.currentPage,
  });

  if (!dashboardData.rider?.cliente) {
    return <RiderSeedEmptyState />;
  }

  return <RiderDashboardView {...dashboardData} />;
}
