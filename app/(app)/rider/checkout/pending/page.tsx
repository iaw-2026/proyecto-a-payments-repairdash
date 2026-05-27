import { CheckoutResultView } from "@/components/rider/CheckoutResultView";
import {
  firstCheckoutSearchValue,
  getRiderCheckoutResultData,
  type CheckoutResultSearchParams,
} from "@/lib/services/rider-checkout";

export const dynamic = "force-dynamic";

type RiderCheckoutPendingPageProps = {
  searchParams: CheckoutResultSearchParams;
};

export default async function RiderCheckoutPendingPage({
  searchParams,
}: RiderCheckoutPendingPageProps) {
  const { transactionId: rawTransactionId } = await searchParams;
  const transactionId = firstCheckoutSearchValue(rawTransactionId);
  const data = transactionId ? await getRiderCheckoutResultData(transactionId) : null;

  return <CheckoutResultView kind="pending" data={data} />;
}
