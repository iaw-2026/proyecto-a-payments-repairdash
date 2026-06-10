import {
  Prisma,
  TransactionStatus,
  WithdrawalStatus,
  type Balance,
  type Cliente,
  type Transaction,
  type Trabajador,
  type User,
  type Withdrawal,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getAdminDrivers,
  getAdminRiders,
  getAdminTransactions,
  getAdminWithdrawals,
  type AdminDateFilters,
  type AdminDriverItem,
  type AdminRiderItem,
  type AdminTransactionItem,
  type AdminWithdrawalItem,
} from "@/lib/services/admin";
import {
  getCommissionSettings,
  updateCommissionSettings,
} from "@/lib/services/liquidations";
import type {
  ControlPlaneCommissionInput,
  ControlPlanePagination,
} from "@/lib/control-plane-utils";
export {
  CONTROL_PLANE_DEFAULT_PAGE,
  CONTROL_PLANE_DEFAULT_PAGE_SIZE,
  CONTROL_PLANE_MAX_PAGE_SIZE,
  getControlPlaneDateFilters,
  getControlPlanePagination,
  getControlPlaneQueryFilter,
  getControlPlaneRecentLimit,
  parseControlPlaneCommissionPayload,
} from "@/lib/control-plane-utils";

function serializeDate(date: Date | null | undefined) {
  return date ? date.toISOString() : null;
}

function serializeDecimal(amount: Prisma.Decimal | null | undefined) {
  return amount ? amount.toFixed(2) : null;
}

function serializeUser(user: User | null) {
  if (!user) {
    return null;
  }

  return {
    clerkId: user.clerkId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

function serializeTrabajador(trabajador: Pick<Trabajador, "clerkId" | "cbuCvu">) {
  return {
    clerkId: trabajador.clerkId,
    cbuCvu: trabajador.cbuCvu,
  };
}

function serializeCliente(cliente: Pick<Cliente, "clerkId">) {
  return {
    clerkId: cliente.clerkId,
  };
}

function serializeBalance(balance: Balance | null) {
  if (!balance) {
    return null;
  }

  return {
    trabajadorId: balance.trabajadorId,
    balanceAvailable: serializeDecimal(balance.balanceAvailable),
    balanceLocked: serializeDecimal(balance.balanceLocked),
    updatedAt: serializeDate(balance.updatedAt),
  };
}

function serializeBalanceWithTotal(balance: Balance | null) {
  if (!balance) {
    return null;
  }

  return {
    trabajadorId: balance.trabajadorId,
    balanceAvailable: serializeDecimal(balance.balanceAvailable),
    balanceLocked: serializeDecimal(balance.balanceLocked),
    total: serializeDecimal(balance.balanceAvailable.plus(balance.balanceLocked)),
    updatedAt: serializeDate(balance.updatedAt),
  };
}

function serializeTransaction(transaction: Transaction) {
  return {
    id: transaction.id,
    trabajoId: transaction.trabajoId,
    amount: serializeDecimal(transaction.amount),
    status: transaction.status,
    clientId: transaction.clientId,
    trabajadorId: transaction.trabajadorId,
    gatewayPreferenceId: transaction.gatewayPreferenceId,
    gatewayCheckoutUrl: transaction.gatewayCheckoutUrl,
    gatewayPaymentId: transaction.gatewayPaymentId,
    createdAt: serializeDate(transaction.createdAt),
    reservedAt: serializeDate(transaction.reservedAt),
    liquidatedAt: serializeDate(transaction.liquidatedAt),
    commissionRate: serializeDecimal(transaction.commissionRate),
    commissionAmount: serializeDecimal(transaction.commissionAmount),
    netAmount: serializeDecimal(transaction.netAmount),
  };
}

function serializeWithdrawal(withdrawal: Withdrawal) {
  return {
    id: withdrawal.id,
    trabajadorId: withdrawal.trabajadorId,
    amount: serializeDecimal(withdrawal.amount),
    status: withdrawal.status,
    createdAt: serializeDate(withdrawal.createdAt),
  };
}

function serializeCommissionSettings(settings: Awaited<ReturnType<typeof getCommissionSettings>>) {
  return {
    id: settings.id,
    commissionRate: serializeDecimal(settings.commissionRate),
    updatedAt: serializeDate(settings.updatedAt),
  };
}

function buildPagination({
  totalCount,
  totalPages,
  currentPage,
  pageSize,
}: {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}) {
  return {
    totalCount,
    totalPages,
    currentPage,
    pageSize,
  };
}

function serializeTransactionItem(item: AdminTransactionItem) {
  return {
    transaction: serializeTransaction(item.transaction),
    cliente: serializeUser(item.cliente),
    trabajador: serializeUser(item.trabajador),
  };
}

function serializeWithdrawalItem(withdrawal: AdminWithdrawalItem) {
  return {
    withdrawal: serializeWithdrawal(withdrawal),
    trabajador: serializeTrabajador(withdrawal.trabajador),
    user: serializeUser(withdrawal.trabajador.user),
  };
}

function serializeDriverItem(item: AdminDriverItem) {
  return {
    trabajador: serializeTrabajador(item.trabajador),
    user: serializeUser(item.user),
    balance: serializeBalance(item.balance),
    withdrawalCount: item.withdrawalCount,
    transactionCount: item.transactionCount,
    latestActivityAt: serializeDate(item.latestActivityAt),
  };
}

function serializeRiderItem(item: AdminRiderItem) {
  return {
    cliente: serializeCliente(item.cliente),
    user: serializeUser(item.user),
    transactionCount: item.transactionCount,
    volumePaid: serializeDecimal(item.volumePaid),
    latestTransactionAt: serializeDate(item.latestTransactionAt),
  };
}

function statusCounts<TStatus extends string>(
  statuses: readonly TStatus[],
  rows: Array<{ status: TStatus; _count: { status: number } }>,
) {
  const counts = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<TStatus, number>;

  for (const row of rows) {
    counts[row.status] = row._count.status;
  }

  return counts;
}

export async function getControlPlaneSummary(now = new Date()) {
  const [
    commission,
    transactionsByStatusRows,
    withdrawalsByStatusRows,
    riders,
    drivers,
  ] = await Promise.all([
    getCommissionSettings(),
    prisma.transaction.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
    prisma.withdrawal.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
    prisma.cliente.count(),
    prisma.trabajador.count(),
  ]);

  return {
    success: true,
    generatedAt: serializeDate(now),
    commission: serializeCommissionSettings(commission),
    transactionsByStatus: statusCounts(Object.values(TransactionStatus), transactionsByStatusRows),
    withdrawalsByStatus: statusCounts(Object.values(WithdrawalStatus), withdrawalsByStatusRows),
    users: {
      riders,
      drivers,
    },
  };
}

export async function getControlPlaneTransactions(
  filters: AdminDateFilters,
  pagination: ControlPlanePagination,
) {
  const result = await getAdminTransactions(filters, pagination);

  return {
    success: true,
    items: result.items.map(serializeTransactionItem),
    pagination: buildPagination({
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      pageSize: pagination.pageSize,
    }),
  };
}

export async function getControlPlaneWithdrawals(
  filters: AdminDateFilters,
  pagination: ControlPlanePagination,
) {
  const result = await getAdminWithdrawals(filters, pagination);

  return {
    success: true,
    items: result.items.map(serializeWithdrawalItem),
    pagination: buildPagination({
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      pageSize: pagination.pageSize,
    }),
  };
}

export async function getControlPlaneDrivers(
  filters: Pick<AdminDateFilters, "q">,
  pagination: ControlPlanePagination,
) {
  const result = await getAdminDrivers(filters, pagination);

  return {
    success: true,
    items: result.items.map(serializeDriverItem),
    pagination: buildPagination({
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      pageSize: pagination.pageSize,
    }),
  };
}

export async function getControlPlaneRiders(
  filters: Pick<AdminDateFilters, "q">,
  pagination: ControlPlanePagination,
) {
  const result = await getAdminRiders(filters, pagination);

  return {
    success: true,
    items: result.items.map(serializeRiderItem),
    pagination: buildPagination({
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      pageSize: pagination.pageSize,
    }),
  };
}

export async function getControlPlaneDriverDetail(
  trabajadorId: string,
  recentLimit: number,
) {
  const trabajador = await prisma.trabajador.findUnique({
    where: { clerkId: trabajadorId },
    include: {
      user: true,
      balance: true,
    },
  });

  if (!trabajador) {
    return null;
  }

  const [recentTransactions, recentWithdrawals] = await Promise.all([
    prisma.transaction.findMany({
      where: { trabajadorId },
      orderBy: { createdAt: "desc" },
      take: recentLimit,
    }),
    prisma.withdrawal.findMany({
      where: { trabajadorId },
      orderBy: { createdAt: "desc" },
      take: recentLimit,
    }),
  ]);

  const clientIds = Array.from(
    new Set(
      recentTransactions
        .map((transaction) => transaction.clientId)
        .filter((value): value is string => !!value),
    ),
  );
  const clientes = await prisma.user.findMany({
    where: {
      clerkId: {
        in: clientIds,
      },
    },
  });
  const clientesById = new Map(clientes.map((user) => [user.clerkId, user]));

  return {
    success: true,
    trabajador: serializeTrabajador(trabajador),
    user: serializeUser(trabajador.user),
    balance: serializeBalanceWithTotal(trabajador.balance),
    recentTransactions: recentTransactions.map((transaction) => ({
      transaction: serializeTransaction(transaction),
      cliente: transaction.clientId ? serializeUser(clientesById.get(transaction.clientId) ?? null) : null,
      trabajador: serializeUser(trabajador.user),
    })),
    recentWithdrawals: recentWithdrawals.map((withdrawal) => ({
      withdrawal: serializeWithdrawal(withdrawal),
      trabajador: serializeTrabajador(trabajador),
      user: serializeUser(trabajador.user),
    })),
  };
}

export async function updateControlPlaneCommission(input: ControlPlaneCommissionInput) {
  const settings = await updateCommissionSettings(input.commissionRate);

  return {
    success: true,
    commission: serializeCommissionSettings(settings),
  };
}
