import { Prisma, TransactionStatus } from "@/generated/prisma/client";
import { getMercadoPagoPayment, createMercadoPagoPreference } from "@/lib/integrations/mercadopago";
import { sendRiderPaymentCallback } from "@/lib/integrations/rider-callback";
import { prisma } from "@/lib/prisma";
import { waitAndRunPendingLiquidations } from "@/lib/services/liquidations";
import type { RiderPaymentCallbackPayload, RiderPaymentEstado } from "@/lib/types/payment-callback";
import type { CheckoutInput } from "@/lib/validations/checkout";
import { validateCheckout } from "@/lib/validations/checkout";
import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";

export class CheckoutError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export type CheckoutResult = {
  success: true;
  transactionId: string;
  trabajoId: string;
  preferenceId: string;
  checkoutUrl: string;
};

function getCheckoutUrlFromPreference(preference: { init_point?: string; sandbox_init_point?: string }) {
  const checkoutUrl = preference.init_point ?? preference.sandbox_init_point;

  if (!checkoutUrl) {
    throw new CheckoutError("CHECKOUT_URL_NOT_CREATED", "Mercado Pago no devolvió una URL de checkout.", 502);
  }

  return checkoutUrl;
}

function assertSameCheckout(existing: {
  amount: Prisma.Decimal;
  clientId: string | null;
  trabajadorId: string;
}, input: CheckoutInput, amount: Prisma.Decimal) {
  if (existing.clientId !== input.clientId || existing.trabajadorId !== input.trabajadorId || !existing.amount.equals(amount)) {
    throw new CheckoutError(
      "PAYMENT_ALREADY_EXISTS",
      "Ya existe un proceso de pago para este trabajo con datos diferentes.",
      409,
    );
  }
}

export async function createCheckout(inputData: unknown, baseUrl: string): Promise<CheckoutResult> {
  const input = validateCheckout(inputData);
  const amount = new Prisma.Decimal(input.amount);

  if (amount.lessThanOrEqualTo(0)) {
    throw new CheckoutError("INVALID_AMOUNT", "El monto debe ser mayor a cero.", 400);
  }

  const cliente = await prisma.cliente.findUnique({
    where: { clerkId: input.clientId },
    include: { user: true },
  });

  if (!cliente) {
    throw new CheckoutError("CLIENT_NOT_FOUND", "El cliente no existe en Payments.", 404);
  }

  const trabajador = await prisma.trabajador.findUnique({
    where: { clerkId: input.trabajadorId },
    include: { balance: true },
  });

  if (!trabajador) {
    throw new CheckoutError("WORKER_NOT_FOUND", "El trabajador no existe en Payments.", 404);
  }

  if (!trabajador.balance) {
    throw new CheckoutError("WORKER_BALANCE_NOT_FOUND", "El trabajador no tiene balance configurado.", 404);
  }

  let transaction = await prisma.transaction.findUnique({
    where: { trabajoId: input.trabajoId },
  });

  if (transaction) {
    assertSameCheckout(transaction, input, amount);

    if (transaction.status === TransactionStatus.RESERVED || transaction.status === TransactionStatus.LIQUIDATED) {
      throw new CheckoutError("PAYMENT_ALREADY_COMPLETED", "El pago de este trabajo ya fue confirmado.", 409);
    }

    if (
      transaction.status === TransactionStatus.DISPUTED ||
      transaction.status === TransactionStatus.REFUNDED ||
      transaction.status === TransactionStatus.FAILED
    ) {
      throw new CheckoutError("PAYMENT_NOT_RETRYABLE", "El pago de este trabajo no puede reintentarse.", 409);
    }

    if (transaction.gatewayPreferenceId && transaction.gatewayCheckoutUrl) {
      return {
        success: true,
        transactionId: transaction.id,
        trabajoId: transaction.trabajoId,
        preferenceId: transaction.gatewayPreferenceId,
        checkoutUrl: transaction.gatewayCheckoutUrl,
      };
    }
  } else {
    transaction = await prisma.transaction.create({
      data: {
        id: crypto.randomUUID(),
        trabajoId: input.trabajoId,
        amount,
        status: TransactionStatus.PENDING,
        clientId: input.clientId,
        trabajadorId: input.trabajadorId,
        gatewayPaymentId: null,
        gatewayPreferenceId: null,
        gatewayCheckoutUrl: null,
      },
    });
  }

  const preference = await createMercadoPagoPreference({
    transactionId: transaction.id,
    trabajoId: transaction.trabajoId,
    amount: transaction.amount.toString(),
    description: input.description,
    payerEmail: cliente.user.email,
    baseUrl,
  });

  if (!preference.id) {
    throw new CheckoutError("PREFERENCE_NOT_CREATED", "Mercado Pago no devolvió preferenceId.", 502);
  }

  const checkoutUrl = getCheckoutUrlFromPreference(preference);

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      gatewayPreferenceId: preference.id,
      gatewayCheckoutUrl: checkoutUrl,
    },
  });

  return {
    success: true,
    transactionId: transaction.id,
    trabajoId: transaction.trabajoId,
    preferenceId: preference.id,
    checkoutUrl,
  };
}

export function mapMercadoPagoStatusToTransactionStatus(status: string | undefined) {
  if (status === "approved") return TransactionStatus.RESERVED;
  if (status === "rejected" || status === "cancelled") return TransactionStatus.FAILED;
  if (status === "refunded" || status === "charged_back") return TransactionStatus.REFUNDED;
  return TransactionStatus.PENDING;
}

export function mapTransactionStatusToRiderEstado(status: TransactionStatus): RiderPaymentEstado | null {
  if (status === TransactionStatus.RESERVED || status === TransactionStatus.LIQUIDATED) return "aceptado";
  if (status === TransactionStatus.FAILED || status === TransactionStatus.REFUNDED) return "cancelado";
  return null;
}

function getRiderTravelId(trabajoId: string) {
  if (!/^\d+$/.test(trabajoId)) {
    throw new CheckoutError(
      "INVALID_RIDER_TRAVEL_ID",
      "trabajoId debe ser numerico para notificar a Rider App como id_viaje.",
      500,
    );
  }

  const idViaje = Number(trabajoId);

  if (!Number.isSafeInteger(idViaje)) {
    throw new CheckoutError(
      "INVALID_RIDER_TRAVEL_ID",
      "trabajoId excede el rango seguro para notificar a Rider App como id_viaje.",
      500,
    );
  }

  return idViaje;
}

function buildCallbackPayload(args: {
  trabajoId: string;
  status: TransactionStatus;
}): RiderPaymentCallbackPayload | null {
  const estado = mapTransactionStatusToRiderEstado(args.status);

  if (!estado) {
    return null;
  }

  return {
    id_viaje: getRiderTravelId(args.trabajoId),
    estado,
  };
}

export async function processMercadoPagoPayment(payment: PaymentResponse) {
  const transactionId = payment.external_reference;

  if (!transactionId) {
    throw new CheckoutError("MISSING_EXTERNAL_REFERENCE", "El pago de Mercado Pago no tiene external_reference.", 400);
  }

  const nextStatus = mapMercadoPagoStatusToTransactionStatus(payment.status);
  const gatewayPaymentId = payment.id ? String(payment.id) : null;

  const updatedTransaction = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new CheckoutError("TRANSACTION_NOT_FOUND", "La transacción no existe en Payments.", 404);
    }

    // Idempotencia: Mercado Pago puede reenviar webhooks. Solo acreditamos
    // el balanceLocked cuando la transacción todavía no estaba reservada.
    if (nextStatus === TransactionStatus.RESERVED && transaction.status !== TransactionStatus.RESERVED && transaction.status !== TransactionStatus.LIQUIDATED) {
      const balance = await tx.balance.findUnique({
        where: { trabajadorId: transaction.trabajadorId },
      });

      if (!balance) {
        throw new CheckoutError("WORKER_BALANCE_NOT_FOUND", "El trabajador no tiene balance configurado.", 404);
      }

      await tx.balance.update({
        where: { trabajadorId: transaction.trabajadorId },
        data: {
          balanceLocked: balance.balanceLocked.plus(transaction.amount),
        },
      });
    }

    if (nextStatus === TransactionStatus.REFUNDED && transaction.status === TransactionStatus.RESERVED) {
      const balance = await tx.balance.findUnique({
        where: { trabajadorId: transaction.trabajadorId },
      });

      if (balance) {
        const nextLocked = balance.balanceLocked.lessThan(transaction.amount)
          ? new Prisma.Decimal("0.00")
          : balance.balanceLocked.minus(transaction.amount);

        await tx.balance.update({
          where: { trabajadorId: transaction.trabajadorId },
          data: { balanceLocked: nextLocked },
        });
      }
    }

    return tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: nextStatus,
        gatewayPaymentId,
        reservedAt:
          nextStatus === TransactionStatus.RESERVED &&
          transaction.status !== TransactionStatus.RESERVED &&
          transaction.status !== TransactionStatus.LIQUIDATED
            ? new Date()
            : transaction.reservedAt,
      },
    });
  });

  const callbackPayload = buildCallbackPayload({
    trabajoId: updatedTransaction.trabajoId,
    status: updatedTransaction.status,
  });

  // Primero persistimos el estado interno; recién después notificamos a Rider.
  // Si el callback falla, Payments conserva la fuente de verdad.
  if (callbackPayload) {
    await sendRiderPaymentCallback(callbackPayload);
  }

  if (updatedTransaction.status === TransactionStatus.RESERVED) {
    await waitAndRunPendingLiquidations();
  }

  return {
    transaction: updatedTransaction,
    callbackPayload,
  };
}

export async function processMercadoPagoPaymentById(paymentId: string) {
  const payment = await getMercadoPagoPayment(paymentId);
  return processMercadoPagoPayment(payment);
}
