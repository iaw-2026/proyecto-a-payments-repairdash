import {
  Prisma,
  TransactionStatus,
  WithdrawalStatus,
  type Balance,
  type Cliente,
  type Transaction,
  type Trabajador,
  type User,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCommissionSettings } from "@/lib/services/liquidations";
import { unstable_cache } from "next/cache";

const ADMIN_PAGE_SIZE_MAX = 50;

export type AdminDateFilters = {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
};

export type AdminPaginationOptions = {
  page?: number;
  pageSize?: number;
};

export type AdminDashboardMetrics = {
  periodStart: Date;
  periodEnd: Date;
  grossVolume: Prisma.Decimal;
  commissionCollected: Prisma.Decimal;
  netLiquidated: Prisma.Decimal;
};

type CachedAdminDashboardMetrics = {
  periodStart: string;
  periodEnd: string;
  grossVolume: string;
  commissionCollected: string;
  netLiquidated: string;
};

export type AdminDriverItem = {
  trabajador: Trabajador;
  user: User;
  balance: Balance | null;
  withdrawalCount: number; // TODO: Dato calculado mediante agregacion
  transactionCount: number; // TODO: Dato calculado mediante agregacion
  latestActivityAt: Date | null; // TODO: Dato calculado mediante agregacion
};

export type AdminRiderItem = {
  cliente: Cliente;
  user: User;
  transactionCount: number; // TODO: Dato calculado mediante agregacion
  volumePaid: Prisma.Decimal; // TODO: Dato calculado mediante agregacion
  latestTransactionAt: Date | null; // TODO: Dato calculado mediante agregacion
};

function zero() {
  return new Prisma.Decimal("0.00");
}

function safePageSize(pageSize: number | undefined) {
  return Math.max(1, Math.min(ADMIN_PAGE_SIZE_MAX, Math.floor(pageSize ?? 10)));
}

function safePage(page: number | undefined) {
  return Math.max(1, Math.floor(page ?? 1));
}

function monthBounds(now = new Date()) {
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}

function dayBounds(now = new Date()) {
  return {
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
  };
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function monthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function parseDateStart(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateEnd(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setDate(date.getDate() + 1);
  return date;
}

function createdAtRange(filters: AdminDateFilters) {
  const gte = parseDateStart(filters.from);
  const lt = parseDateEnd(filters.to);

  if (!gte && !lt) {
    return undefined;
  }

  return {
    ...(gte ? { gte } : {}),
    ...(lt ? { lt } : {}),
  };
}

function normalizeQuery(value?: string) {
  const query = value?.trim();
  return query ? query : undefined;
}

function isWithdrawalStatus(value?: string): value is WithdrawalStatus {
  return !!value && Object.values(WithdrawalStatus).includes(value as WithdrawalStatus);
}

function isTransactionStatus(value?: string): value is TransactionStatus {
  return !!value && Object.values(TransactionStatus).includes(value as TransactionStatus);
}

export async function getAdminDashboardData(now = new Date()) {
  const dailyBounds = dayBounds(now);
  const monthlyBounds = monthBounds(now);

  const [settings, dailyMetrics, monthlyMetrics] = await Promise.all([
    getCommissionSettings(),
    getCachedAdminDashboardMetrics(
      `admin-metrics-day-${dateKey(dailyBounds.start)}`,
      dailyBounds.start,
      dailyBounds.end,
    ),
    getCachedAdminDashboardMetrics(
      `admin-metrics-month-${monthKey(monthlyBounds.start)}`,
      monthlyBounds.start,
      monthlyBounds.end,
    ),
  ]);

  return {
    settings,
    dailyMetrics,
    monthlyMetrics,
  };
}

async function getAdminDashboardMetricsForRange(
  start: Date,
  end: Date,
): Promise<CachedAdminDashboardMetrics> {
  const periodCreatedAt = {
    gte: start,
    lt: end,
  };

  const [
    grossVolume,
    liquidatedTotals,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        createdAt: periodCreatedAt,
        status: {
          in: [TransactionStatus.RESERVED, TransactionStatus.LIQUIDATED],
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        liquidatedAt: periodCreatedAt,
        status: TransactionStatus.LIQUIDATED,
      },
      _sum: {
        commissionAmount: true,
        netAmount: true,
      },
    }),
  ]);

  return {
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    grossVolume: (grossVolume._sum.amount ?? zero()).toString(), // TODO: Dato calculado mediante agregacion
    commissionCollected: (liquidatedTotals._sum.commissionAmount ?? zero()).toString(), // TODO: Dato calculado mediante agregacion
    netLiquidated: (liquidatedTotals._sum.netAmount ?? zero()).toString(), // TODO: Dato calculado mediante agregacion
  };
}

async function getCachedAdminDashboardMetrics(
  cacheKey: string,
  start: Date,
  end: Date,
): Promise<AdminDashboardMetrics> {
  const cachedMetrics = await unstable_cache(
    () => getAdminDashboardMetricsForRange(start, end),
    [cacheKey],
    {
      revalidate: 60,
      tags: [cacheKey],
    },
  )();

  return {
    periodStart: new Date(cachedMetrics.periodStart),
    periodEnd: new Date(cachedMetrics.periodEnd),
    grossVolume: new Prisma.Decimal(cachedMetrics.grossVolume),
    commissionCollected: new Prisma.Decimal(cachedMetrics.commissionCollected),
    netLiquidated: new Prisma.Decimal(cachedMetrics.netLiquidated),
  };
}

export async function getAdminWithdrawals(
  filters: AdminDateFilters = {},
  options: AdminPaginationOptions = {},
) {
  const pageSize = safePageSize(options.pageSize);
  const requestedPage = safePage(options.page);
  const query = normalizeQuery(filters.q);
  const createdAt = createdAtRange(filters);

  const where: Prisma.WithdrawalWhereInput = {
    ...(isWithdrawalStatus(filters.status) ? { status: filters.status } : {}),
    ...(createdAt ? { createdAt } : {}),
  };

  if (query) {
    const matchingUsers = await prisma.user.findMany({
      where: {
        role: "driver",
        OR: [
          { clerkId: { contains: query } },
          { email: { contains: query } },
          { fullName: { contains: query } },
        ],
      },
      select: { clerkId: true },
      take: 100,
    });

    where.OR = [
      { id: { contains: query } },
      { trabajadorId: { contains: query } },
      { trabajadorId: { in: matchingUsers.map((user) => user.clerkId) } },
    ];
  }

  const totalCount = await prisma.withdrawal.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const items = await prisma.withdrawal.findMany({
    where,
    include: {
      trabajador: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return {
    items,
    totalCount,
    totalPages,
    currentPage,
  };
}

export type AdminTransactionItem = {
  transaction: Transaction;
  cliente: User | null;
  trabajador: User | null;
};

export async function getAdminTransactions(
  filters: AdminDateFilters = {},
  options: AdminPaginationOptions = {},
) {
  const pageSize = safePageSize(options.pageSize);
  const requestedPage = safePage(options.page);
  const query = normalizeQuery(filters.q);
  const createdAt = createdAtRange(filters);

  const where: Prisma.TransactionWhereInput = {
    ...(isTransactionStatus(filters.status) ? { status: filters.status } : {}),
    ...(createdAt ? { createdAt } : {}),
  };

  if (query) {
    const matchingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { clerkId: { contains: query } },
          { email: { contains: query } },
          { fullName: { contains: query } },
        ],
      },
      select: { clerkId: true },
      take: 100,
    });
    const matchingUserIds = matchingUsers.map((user) => user.clerkId);

    where.OR = [
      { id: { contains: query } },
      { trabajoId: { contains: query } },
      { clientId: { contains: query } },
      { trabajadorId: { contains: query } },
      { gatewayPreferenceId: { contains: query } },
      { gatewayPaymentId: { contains: query } },
      { clientId: { in: matchingUserIds } },
      { trabajadorId: { in: matchingUserIds } },
    ];
  }

  const totalCount = await prisma.transaction.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const userIds = Array.from(
    new Set(
      transactions.flatMap((transaction) => [
        transaction.clientId,
        transaction.trabajadorId,
      ]).filter((value): value is string => !!value),
    ),
  );

  const users = await prisma.user.findMany({
    where: {
      clerkId: {
        in: userIds,
      },
    },
  });
  const usersById = new Map(users.map((user) => [user.clerkId, user]));

  const items: AdminTransactionItem[] = transactions.map((transaction) => ({
    transaction,
    cliente: transaction.clientId ? usersById.get(transaction.clientId) ?? null : null,
    trabajador: usersById.get(transaction.trabajadorId) ?? null,
  }));

  return {
    items,
    totalCount,
    totalPages,
    currentPage,
  };
}

export async function getAdminDrivers(
  filters: Pick<AdminDateFilters, "q"> = {},
  options: AdminPaginationOptions = {},
) {
  const pageSize = safePageSize(options.pageSize);
  const requestedPage = safePage(options.page);
  const query = normalizeQuery(filters.q);

  const where: Prisma.TrabajadorWhereInput = {};

  if (query) {
    const matchingUsers = await prisma.user.findMany({
      where: {
        role: "driver",
        OR: [
          { clerkId: { contains: query } },
          { email: { contains: query } },
          { fullName: { contains: query } },
        ],
      },
      select: { clerkId: true },
      take: 100,
    });

    where.OR = [
      { clerkId: { contains: query } },
      { cbuCvu: { contains: query } },
      { clerkId: { in: matchingUsers.map((user) => user.clerkId) } },
    ];
  }

  const totalCount = await prisma.trabajador.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const trabajadores = await prisma.trabajador.findMany({
    where,
    include: {
      user: true,
      balance: true,
    },
    orderBy: {
      clerkId: "asc",
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const items = await Promise.all(
    trabajadores.map(async (trabajador): Promise<AdminDriverItem> => {
      const [withdrawalCount, transactionCount, latestTransaction, latestWithdrawal] =
        await Promise.all([
          prisma.withdrawal.count({
            where: { trabajadorId: trabajador.clerkId },
          }),
          prisma.transaction.count({
            where: { trabajadorId: trabajador.clerkId },
          }),
          prisma.transaction.findFirst({
            where: { trabajadorId: trabajador.clerkId },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          }),
          prisma.withdrawal.findFirst({
            where: { trabajadorId: trabajador.clerkId },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          }),
        ]);

      const latestDates = [latestTransaction?.createdAt, latestWithdrawal?.createdAt].filter(
        (value): value is Date => !!value,
      );

      return {
        trabajador: {
          clerkId: trabajador.clerkId,
          cbuCvu: trabajador.cbuCvu,
        },
        user: trabajador.user,
        balance: trabajador.balance,
        withdrawalCount,
        transactionCount,
        latestActivityAt:
          latestDates.length > 0
            ? new Date(Math.max(...latestDates.map((date) => date.getTime())))
            : null,
      };
    }),
  );

  return {
    items,
    totalCount,
    totalPages,
    currentPage,
  };
}

export async function getAdminRiders(
  filters: Pick<AdminDateFilters, "q"> = {},
  options: AdminPaginationOptions = {},
) {
  const pageSize = safePageSize(options.pageSize);
  const requestedPage = safePage(options.page);
  const query = normalizeQuery(filters.q);

  const where: Prisma.ClienteWhereInput = {};

  if (query) {
    const matchingUsers = await prisma.user.findMany({
      where: {
        role: "rider",
        OR: [
          { clerkId: { contains: query } },
          { email: { contains: query } },
          { fullName: { contains: query } },
        ],
      },
      select: { clerkId: true },
      take: 100,
    });

    where.OR = [
      { clerkId: { contains: query } },
      { clerkId: { in: matchingUsers.map((user) => user.clerkId) } },
    ];
  }

  const totalCount = await prisma.cliente.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const clientes = await prisma.cliente.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: {
      clerkId: "asc",
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const items = await Promise.all(
    clientes.map(async (cliente): Promise<AdminRiderItem> => {
      const paidWhere: Prisma.TransactionWhereInput = {
        clientId: cliente.clerkId,
        status: {
          in: [TransactionStatus.RESERVED, TransactionStatus.LIQUIDATED],
        },
      };

      const [transactionCount, volume, latestTransaction] = await Promise.all([
        prisma.transaction.count({
          where: { clientId: cliente.clerkId },
        }),
        prisma.transaction.aggregate({
          where: paidWhere,
          _sum: { amount: true },
        }),
        prisma.transaction.findFirst({
          where: { clientId: cliente.clerkId },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
      ]);

      return {
        cliente: {
          clerkId: cliente.clerkId,
        },
        user: cliente.user,
        transactionCount,
        volumePaid: volume._sum.amount ?? zero(),
        latestTransactionAt: latestTransaction?.createdAt ?? null,
      };
    }),
  );

  return {
    items,
    totalCount,
    totalPages,
    currentPage,
  };
}

export type AdminWithdrawalItem = Awaited<
  ReturnType<typeof getAdminWithdrawals>
>["items"][number];
