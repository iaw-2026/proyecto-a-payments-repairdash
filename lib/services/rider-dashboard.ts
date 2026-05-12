import { TransactionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RiderDashboardData } from "@/lib/types/rider-dashboard";

export async function getRiderDashboardData(
  transactionId?: string,
): Promise<RiderDashboardData> {
  const rider = await prisma.user.findFirst({
    where: { role: "rider" },
    include: { cliente: true },
  });

  if (!rider?.cliente) {
    return {
      rider,
      transactions: [],
      pendingTransaction: null,
      worker: null,
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: { clientId: rider.clerkId },
    orderBy: { createdAt: "desc" },
  });

  const requestedTransaction = transactionId
    ? transactions.find((transaction) => transaction.id === transactionId) ?? null
    : null;
  const pendingTransaction = transactionId
    ? requestedTransaction?.status === TransactionStatus.PENDING
      ? requestedTransaction
      : null
    : transactions.find((transaction) => transaction.status === TransactionStatus.PENDING) ?? null;

  const worker = pendingTransaction
    ? await prisma.trabajador.findUnique({
        where: { clerkId: pendingTransaction.trabajadorId },
        include: { user: true },
      })
    : null;

  return {
    rider,
    transactions,
    pendingTransaction,
    worker,
  };
}
