import type { Prisma } from "@/generated/prisma/client";

export type RiderDashboardUser = Prisma.UserGetPayload<{
  include: { cliente: true };
}>;

export type RiderDashboardTransaction = Prisma.TransactionGetPayload<Record<string, never>>;

export type RiderDashboardWorker = Prisma.TrabajadorGetPayload<{
  include: { user: true };
}>;

export type RiderDashboardData = {
  rider: RiderDashboardUser | null;
  transactions: RiderDashboardTransaction[];
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
  pendingTransaction: RiderDashboardTransaction | null;
  worker: RiderDashboardWorker | null;
};
