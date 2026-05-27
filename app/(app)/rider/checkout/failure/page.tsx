import { CheckoutResultView } from "@/components/rider/CheckoutResultView";
import {
  firstCheckoutSearchValue,
  getRiderCheckoutResultData,
  type CheckoutResultSearchParams,
} from "@/lib/services/rider-checkout";

export const dynamic = "force-dynamic";

type RiderCheckoutFailurePageProps = {
  searchParams: CheckoutResultSearchParams;
};

export default async function RiderCheckoutFailurePage({
  searchParams,
}: RiderCheckoutFailurePageProps) {
  const { transactionId: rawTransactionId } = await searchParams;
  const transactionId = firstCheckoutSearchValue(rawTransactionId);
  const data = transactionId ? await getRiderCheckoutResultData(transactionId) : null;

  return <CheckoutResultView kind="failure" data={data} />;
}
