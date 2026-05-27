import { CheckoutResultView } from "@/components/rider/CheckoutResultView";
import {
  getRiderCheckoutResultData,
  resolveCheckoutTransactionId,
  type CheckoutResultSearchParams,
} from "@/lib/services/rider-checkout";

export const dynamic = "force-dynamic";

type RiderCheckoutFailurePageProps = {
  searchParams: CheckoutResultSearchParams;
};

export default async function RiderCheckoutFailurePage({
  searchParams,
}: RiderCheckoutFailurePageProps) {
  const transactionId = resolveCheckoutTransactionId(await searchParams);
  const data = transactionId ? await getRiderCheckoutResultData(transactionId) : null;

  return <CheckoutResultView kind="failure" data={data} />;
}
