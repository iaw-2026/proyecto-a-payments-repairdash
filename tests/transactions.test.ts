import test from "node:test";
import assert from "node:assert/strict";
import { TransactionStatus } from "@/generated/prisma/client";
import { getCheckoutCancellationOutcome } from "@/lib/checkout-cancellation";

test("checkout cancellation only cancels pending transactions", () => {
  assert.equal(getCheckoutCancellationOutcome(TransactionStatus.PENDING), "cancelled");
  assert.equal(getCheckoutCancellationOutcome(TransactionStatus.FAILED), "already_failed");
  assert.equal(getCheckoutCancellationOutcome(TransactionStatus.RESERVED), "already_paid");
  assert.equal(getCheckoutCancellationOutcome(TransactionStatus.LIQUIDATED), "already_paid");
  assert.equal(getCheckoutCancellationOutcome(TransactionStatus.TRANSFERRED), "already_paid");
  assert.equal(getCheckoutCancellationOutcome(TransactionStatus.DISPUTED), "not_cancellable");
  assert.equal(getCheckoutCancellationOutcome(TransactionStatus.REFUNDED), "not_cancellable");
});
