/**
 * Balance service layer
 * Handles wallet balance operations and constraints
 */

import { prisma } from "@/lib/prisma";
import { Prisma, TransactionStatus } from "@/generated/prisma/client";

const BUENOS_AIRES_UTC_OFFSET_HOURS = -3;

export type WorkerWalletSummary = {
  trabajadorId: string;
  balance: {
    disponible: string;
  };
  metricasHoy: {
    facturacionHoy: string;
    trabajosRealizadosHoy: number;
  };
};

function getBuenosAiresTodayBounds(now = new Date()) {
  const offsetMs = BUENOS_AIRES_UTC_OFFSET_HOURS * 60 * 60 * 1000;
  const buenosAiresNow = new Date(now.getTime() + offsetMs);
  const year = buenosAiresNow.getUTCFullYear();
  const month = buenosAiresNow.getUTCMonth();
  const day = buenosAiresNow.getUTCDate();

  return {
    start: new Date(Date.UTC(year, month, day) - offsetMs),
    end: new Date(Date.UTC(year, month, day + 1) - offsetMs),
  };
}

export async function getBalanceByWorker(trabajadorId: string) {
  const balance = await prisma.balance.findUnique({
    where: { trabajadorId },
  });

  return balance;
}

export async function getWorkerWalletSummary(
  trabajadorId: string,
): Promise<WorkerWalletSummary | null> {
  const wallet = await prisma.balance.findUnique({
    where: { trabajadorId },
    select: {
      balanceAvailable: true,
    },
  });

  if (!wallet) {
    return null;
  }

  const { start, end } = getBuenosAiresTodayBounds();
  const todayCompletedWorkWhere = {
    trabajadorId,
    amount: { gt: new Prisma.Decimal("0.00") },
    status: { in: [TransactionStatus.RESERVED, TransactionStatus.LIQUIDATED] },
    reservedAt: {
      gte: start,
      lt: end,
    },
  };

  const [todayBilling, todayCompletedJobs] = await Promise.all([
    prisma.transaction.aggregate({
      where: todayCompletedWorkWhere,
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.count({
      where: todayCompletedWorkWhere,
    }),
  ]);

  const facturacionHoy = todayBilling._sum.amount ?? new Prisma.Decimal("0.00");

  return {
    trabajadorId,
    balance: {
      disponible: wallet.balanceAvailable.toFixed(2),
    },
    metricasHoy: {
      facturacionHoy: facturacionHoy.toFixed(2),
      trabajosRealizadosHoy: todayCompletedJobs,
    },
  };
}

export async function updateAvailableBalance(
  trabajadorId: string,
  amount: Prisma.Decimal | number,
  operation: "add" | "subtract"
) {
  const currentBalance = await getBalanceByWorker(trabajadorId);

  if (!currentBalance) {
    throw new Error("Balance not found for worker");
  }

  // Use Decimal arithmetic to avoid floating point issues (Rule 3)
  const decimalAmount = new Prisma.Decimal(amount);
  const newAmount =
    operation === "add"
      ? currentBalance.balanceAvailable.plus(decimalAmount)
      : currentBalance.balanceAvailable.minus(decimalAmount);

  if (newAmount.lessThan(0)) {
    throw new Error("Insufficient balance");
  }

  const updated = await prisma.balance.update({
    where: { trabajadorId },
    data: {
      balanceAvailable: newAmount,
    },
  });

  return updated;
}

export async function updateLockedBalance(
  trabajadorId: string,
  amount: Prisma.Decimal | number,
  operation: "add" | "subtract"
) {
  const currentBalance = await getBalanceByWorker(trabajadorId);

  if (!currentBalance) {
    throw new Error("Balance not found for worker");
  }

  // Use Decimal arithmetic to avoid floating point issues (Rule 3)
  const decimalAmount = new Prisma.Decimal(amount);
  const newAmount =
    operation === "add"
      ? currentBalance.balanceLocked.plus(decimalAmount)
      : currentBalance.balanceLocked.minus(decimalAmount);

  if (newAmount.lessThan(0)) {
    throw new Error("Cannot reduce locked balance below zero");
  }

  const updated = await prisma.balance.update({
    where: { trabajadorId },
    data: {
      balanceLocked: newAmount,
    },
  });

  return updated;
}

export async function getTotalBalance(trabajadorId: string) {
  const balance = await getBalanceByWorker(trabajadorId);

  if (!balance) {
    return null;
  }

  return {
    available: balance.balanceAvailable,
    locked: balance.balanceLocked,
    total: balance.balanceAvailable.plus(balance.balanceLocked),
  };
}

