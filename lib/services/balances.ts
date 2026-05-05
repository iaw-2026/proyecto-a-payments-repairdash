/**
 * Balance service layer
 * Handles wallet balance operations and constraints
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function getBalanceByWorker(trabajadorId: string) {
  const balance = await prisma.balance.findUnique({
    where: { trabajadorId },
  });

  return balance;
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

