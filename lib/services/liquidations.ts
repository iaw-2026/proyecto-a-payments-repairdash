import { Prisma, Transaction, TransactionStatus } from "@/generated/prisma/client";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const COMMISSION_SETTINGS_ID = "platform";
const DEFAULT_COMMISSION_RATE = new Prisma.Decimal("10.00");
const LIQUIDATION_DELAY_MS = 30_000;
const LOCAL_LIQUIDATION_TIMER_MS = 5_000;

type PaginatedLiquidations = {
  items: Transaction[];
  totalPages: number;
  currentPage: number;
};

export type LiquidationRunSummary = {
  processedCount: number;
  grossTotal: Prisma.Decimal;
  commissionTotal: Prisma.Decimal;
  netTotal: Prisma.Decimal;
};

type RunPendingLiquidationsOptions = {
  now?: Date;
  delayMs?: number;
};

function zero() {
  return new Prisma.Decimal("0.00");
}

function roundMoney(amount: Prisma.Decimal) {
  return new Prisma.Decimal(amount.toFixed(2));
}

function getLiquidationCutoff(now: Date, delayMs: number) {
  return new Date(now.getTime() - delayMs);
}

async function getCommissionRate(tx: Prisma.TransactionClient) {
  const settings = await tx.commissionSettings.upsert({
    where: { id: COMMISSION_SETTINGS_ID },
    create: {
      id: COMMISSION_SETTINGS_ID,
      commissionRate: DEFAULT_COMMISSION_RATE,
    },
    update: {},
  });

  return settings.commissionRate;
}

export async function getCommissionSettings() {
  const settings = await prisma.commissionSettings.findUnique({
    where: { id: COMMISSION_SETTINGS_ID },
  });

  return {
    id: COMMISSION_SETTINGS_ID,
    commissionRate: settings?.commissionRate ?? DEFAULT_COMMISSION_RATE,
    updatedAt: settings?.updatedAt ?? null,
  };
}

export async function updateCommissionSettings(commissionRate: Prisma.Decimal) {
  return prisma.commissionSettings.upsert({
    where: { id: COMMISSION_SETTINGS_ID },
    create: {
      id: COMMISSION_SETTINGS_ID,
      commissionRate,
    },
    update: {
      commissionRate,
    },
  });
}

export async function runPendingLiquidations({
  now = new Date(),
  delayMs = LIQUIDATION_DELAY_MS,
}: RunPendingLiquidationsOptions = {}): Promise<LiquidationRunSummary> {
  const cutoff = getLiquidationCutoff(now, delayMs);

  const candidates = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.RESERVED,
      liquidatedAt: null,
      OR: [
        {
          reservedAt: {
            lte: cutoff,
          },
        },
        {
          reservedAt: null,
          createdAt: {
            lte: cutoff,
          },
        },
      ],
    },
    orderBy: { reservedAt: "asc" },
  });

  let processedCount = 0;
  let grossTotal = zero();
  let commissionTotal = zero();
  let netTotal = zero();

  for (const candidate of candidates) {
    const result = await prisma.$transaction(async (tx) => {
      const commissionRate = await getCommissionRate(tx);
      const grossAmount = candidate.amount;
      const commissionAmount = roundMoney(grossAmount.mul(commissionRate).div(100));
      const netAmount = grossAmount.minus(commissionAmount);

      const claimed = await tx.transaction.updateMany({
        where: {
          id: candidate.id,
          status: TransactionStatus.RESERVED,
          liquidatedAt: null,
        },
        data: {
          status: TransactionStatus.LIQUIDATED,
          reservedAt: candidate.reservedAt ?? candidate.createdAt,
          liquidatedAt: now,
          commissionRate,
          commissionAmount,
          netAmount,
        },
      });

      if (claimed.count !== 1) {
        return null;
      }

      const balance = await tx.balance.findUnique({
        where: { trabajadorId: candidate.trabajadorId },
      });

      if (!balance) {
        throw new Error("BALANCE_NOT_FOUND");
      }

      const nextLocked = balance.balanceLocked.lessThan(grossAmount)
        ? zero()
        : balance.balanceLocked.minus(grossAmount);

      await tx.balance.update({
        where: { trabajadorId: candidate.trabajadorId },
        data: {
          balanceLocked: nextLocked,
          balanceAvailable: balance.balanceAvailable.plus(netAmount),
        },
      });

      return {
        grossAmount,
        commissionAmount,
        netAmount,
      };
    });

    if (!result) {
      continue;
    }

    processedCount += 1;
    grossTotal = grossTotal.plus(result.grossAmount);
    commissionTotal = commissionTotal.plus(result.commissionAmount);
    netTotal = netTotal.plus(result.netAmount);
  }

  return {
    processedCount,
    grossTotal,
    commissionTotal,
    netTotal,
  };
}

export function schedulePendingLiquidations() {
  // TODO: Reemplazar por cron antes de produccion.
  setTimeout(() => {
    void runPendingLiquidations({ delayMs: 0 });
  }, LOCAL_LIQUIDATION_TIMER_MS);
}

export async function waitAndRunPendingLiquidations() {
  // TODO: Reemplazar por cron antes de produccion.
  await new Promise((resolve) => setTimeout(resolve, LOCAL_LIQUIDATION_TIMER_MS));
  return runPendingLiquidations({ delayMs: 0 });
}

export async function getDriverLiquidations(
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedLiquidations> {
  const { clerkId } = await getAuthUser("driver");
  const safePageSize = Math.max(1, Math.min(50, Math.floor(pageSize)));

  const totalCount = await prisma.transaction.count({
    where: {
      trabajadorId: clerkId,
      status: TransactionStatus.LIQUIDATED,
    },
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const currentPage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const skip = (currentPage - 1) * safePageSize;

  const items = await prisma.transaction.findMany({
    where: {
      trabajadorId: clerkId,
      status: TransactionStatus.LIQUIDATED,
    },
    orderBy: [
      { liquidatedAt: "desc" },
      { createdAt: "desc" },
    ],
    skip,
    take: safePageSize,
  });

  return {
    items,
    totalPages,
    currentPage,
  };
}
