import { TransactionStatus } from "@/generated/prisma/client";

export type CheckoutCancellationOutcome =
  | "cancelled"
  | "not_found"
  | "already_paid"
  | "already_failed"
  | "not_cancellable";

export function getCheckoutCancellationOutcome(status: TransactionStatus): Exclude<CheckoutCancellationOutcome, "not_found"> {
  if (status === TransactionStatus.PENDING) {
    return "cancelled";
  }

  if (status === TransactionStatus.FAILED) {
    return "already_failed";
  }

  if (
    status === TransactionStatus.RESERVED ||
    status === TransactionStatus.LIQUIDATED ||
    status === TransactionStatus.TRANSFERRED
  ) {
    return "already_paid";
  }

  return "not_cancellable";
}
