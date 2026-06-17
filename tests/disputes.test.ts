import test from "node:test";
import assert from "node:assert/strict";
import { TransactionStatus } from "../generated/prisma/client";
import {
  mapMercadoPagoStatusToTransactionStatus,
  mapTransactionStatusToRiderEstado,
  resolveNextTransactionStatus,
} from "../lib/payment-status";

test("Mercado Pago refunds and chargebacks become refunded transactions", () => {
  assert.equal(
    mapMercadoPagoStatusToTransactionStatus("refunded"),
    TransactionStatus.REFUNDED,
  );
  assert.equal(
    mapMercadoPagoStatusToTransactionStatus("charged_back"),
    TransactionStatus.REFUNDED,
  );
});

test("failed transactions are not revived by later approved webhooks", () => {
  assert.equal(
    resolveNextTransactionStatus(
      TransactionStatus.FAILED,
      TransactionStatus.RESERVED,
      null,
    ),
    TransactionStatus.FAILED,
  );
});

test("liquidated transactions stay liquidated after stale pending or approved webhooks", () => {
  assert.equal(
    resolveNextTransactionStatus(
      TransactionStatus.LIQUIDATED,
      TransactionStatus.PENDING,
      new Date("2026-05-20T15:00:00.000Z"),
    ),
    TransactionStatus.LIQUIDATED,
  );
  assert.equal(
    resolveNextTransactionStatus(
      TransactionStatus.LIQUIDATED,
      TransactionStatus.RESERVED,
      new Date("2026-05-20T15:00:00.000Z"),
    ),
    TransactionStatus.LIQUIDATED,
  );
});

test("refunded transactions notify Rider as rejected", () => {
  assert.equal(
    mapTransactionStatusToRiderEstado(TransactionStatus.REFUNDED),
    "rechazado",
  );
});
