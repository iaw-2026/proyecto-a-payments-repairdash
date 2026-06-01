import { TransactionStatus } from "@/generated/prisma/client";
import type { RiderPaymentEstado } from "@/lib/types/payment-callback";

export function mapMercadoPagoStatusToTransactionStatus(status: string | undefined) {
  if (status === "approved") return TransactionStatus.RESERVED;
  if (status === "rejected" || status === "cancelled") return TransactionStatus.FAILED;
  if (status === "refunded" || status === "charged_back") return TransactionStatus.REFUNDED;
  return TransactionStatus.PENDING;
}

export function resolveNextTransactionStatus(
  currentStatus: TransactionStatus,
  nextStatus: TransactionStatus,
  liquidatedAt: Date | null,
) {
  if (currentStatus === TransactionStatus.FAILED) {
    return TransactionStatus.FAILED;
  }

  if (currentStatus === TransactionStatus.RESERVED && liquidatedAt && nextStatus === TransactionStatus.RESERVED) {
    return TransactionStatus.LIQUIDATED;
  }

  if (
    currentStatus === TransactionStatus.LIQUIDATED &&
    (nextStatus === TransactionStatus.RESERVED || nextStatus === TransactionStatus.PENDING)
  ) {
    return TransactionStatus.LIQUIDATED;
  }

  if (
    currentStatus === TransactionStatus.RESERVED &&
    nextStatus === TransactionStatus.PENDING
  ) {
    return TransactionStatus.RESERVED;
  }

  return nextStatus;
}

export function mapTransactionStatusToRiderEstado(status: TransactionStatus): RiderPaymentEstado | null {
  if (status === TransactionStatus.RESERVED || status === TransactionStatus.LIQUIDATED) return "aceptado";
  if (status === TransactionStatus.FAILED || status === TransactionStatus.REFUNDED) return "rechazado";
  return null;
}
