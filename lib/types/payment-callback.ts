export type RiderPaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";

export type RiderPaymentCallbackPayload = {
  transactionId: string;
  trabajoId: string;
  paymentStatus: RiderPaymentStatus;
  reason: string | null;
  paidAt: string | null;
};
