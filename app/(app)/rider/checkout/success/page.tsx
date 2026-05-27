import { CheckoutResultView } from "@/components/rider/CheckoutResultView";
import {
  firstCheckoutSearchValue,
  getRiderCheckoutResultData,
  type CheckoutResultSearchParams,
} from "@/lib/services/rider-checkout";

export const dynamic = "force-dynamic";

type RiderCheckoutSuccessPageProps = {
  searchParams: CheckoutResultSearchParams;
};

export default async function RiderCheckoutSuccessPage({
  searchParams,
}: RiderCheckoutSuccessPageProps) {
  const { transactionId: rawTransactionId } = await searchParams;
  const transactionId = firstCheckoutSearchValue(rawTransactionId);
  const data = transactionId ? await getRiderCheckoutResultData(transactionId) : null;

  return <CheckoutResultView kind="success" data={data} />;
}
