import { TransactionStatus } from "@/generated/prisma/client";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { RiderDashboardData } from "@/lib/types/rider-dashboard";

type GetRiderDashboardDataInput = {
  transactionId?: string;
  page?: number;
  pageSize?: number;
};

export async function getRiderDashboardData({
  transactionId,
  page = 1,
  pageSize = 10,
}: GetRiderDashboardDataInput = {}): Promise<RiderDashboardData> {
  const { clerkId } = await getAuthUser("rider");
  const rider = await prisma.user.findUnique({
    where: { clerkId },
    include: { cliente: true },
  });

  if (!rider?.cliente) {
    return {
      rider,
      transactions: [],
      totalTransactions: 0,
      currentPage: 1,
      totalPages: 1,
      pendingTransaction: null,
      worker: null,
    };
  }

  const safePageSize = Math.max(1, Math.min(50, Math.floor(pageSize)));
  const totalTransactions = await prisma.transaction.count({
    where: { clientId: rider.clerkId },
  });
  const totalPages = Math.max(1, Math.ceil(totalTransactions / safePageSize));
  const currentPage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const skip = (currentPage - 1) * safePageSize;

  const transactions = await prisma.transaction.findMany({
    where: { clientId: rider.clerkId },
    orderBy: { createdAt: "desc" },
    skip,
    take: safePageSize,
  });

  const requestedTransaction = transactionId
    ? await prisma.transaction.findFirst({
        where: {
          id: transactionId,
          clientId: rider.clerkId,
        },
      })
    : null;
  const pendingTransaction = transactionId
    ? requestedTransaction?.status === TransactionStatus.PENDING
      ? requestedTransaction
      : null
    : await prisma.transaction.findFirst({
        where: {
          clientId: rider.clerkId,
          status: TransactionStatus.PENDING,
        },
        orderBy: { createdAt: "desc" },
      });

  const worker = pendingTransaction
    ? await prisma.trabajador.findUnique({
        where: { clerkId: pendingTransaction.trabajadorId },
        include: { user: true },
      })
    : null;

  return {
    rider,
    transactions,
    totalTransactions,
    currentPage,
    totalPages,
    pendingTransaction,
    worker,
  };
}
