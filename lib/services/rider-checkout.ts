import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";

export type CheckoutResultKind = "success" | "pending" | "failure";

export type CheckoutResultSearchParams = Promise<{
  transactionId?: string | string[];
  external_reference?: string | string[];
}>;

export type CheckoutResultData = {
  transaction: Prisma.TransactionGetPayload<Record<string, never>>;
  trabajador: Prisma.TrabajadorGetPayload<{
    include: { user: true };
  }> | null;
  cliente: Prisma.ClienteGetPayload<{
    include: { user: true };
  }> | null;
};

export function firstCheckoutSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function resolveCheckoutTransactionId(params: {
  transactionId?: string | string[];
  external_reference?: string | string[];
}) {
  return firstCheckoutSearchValue(params.transactionId)
    ?? firstCheckoutSearchValue(params.external_reference);
}

export async function getRiderCheckoutResultData(
  transactionId: string,
): Promise<CheckoutResultData | null> {
  const { clerkId } = await getAuthUser("rider");

  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      clientId: clerkId,
    },
  });

  if (!transaction) {
    return null;
  }

  const trabajador = await prisma.trabajador.findUnique({
    where: { clerkId: transaction.trabajadorId },
    include: { user: true },
  });

  const cliente = transaction.clientId
    ? await prisma.cliente.findUnique({
        where: { clerkId: transaction.clientId },
        include: { user: true },
      })
    : null;

  return {
    transaction,
    trabajador,
    cliente,
  };
}
