/**
 * Withdrawal service layer
 * Handles withdrawal request processing and status management
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { updateAvailableBalance } from "./balances";
import { randomUUID } from "crypto";

export async function createWithdrawalRequest(trabajadorId: string, amount: Prisma.Decimal | number) {
  // Check if worker has sufficient balance
  const balance = await prisma.balance.findUnique({
    where: { trabajadorId },
  });

  const decimalAmount = new Prisma.Decimal(amount);

  if (!balance || balance.balanceAvailable.lessThan(decimalAmount)) {
    throw new Error("Insufficient available balance for withdrawal");
  }

  // Create withdrawal request
  const withdrawal = await prisma.withdrawal.create({
    data: {
      id: randomUUID(),
      trabajadorId,
      amount: decimalAmount,
      status: "REQUESTED",
    },
  });

  // Deduct from available balance
  await updateAvailableBalance(trabajadorId, decimalAmount, "subtract");

  return withdrawal;
}


export async function getWithdrawalsByWorker(trabajadorId: string) {
  const withdrawals = await prisma.withdrawal.findMany({
    where: { trabajadorId },
    orderBy: { createdAt: "desc" },
  });

  return withdrawals;
}

export async function getWithdrawalById(withdrawalId: string) {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  return withdrawal;
}

/**
 * Approve withdrawal (manual or automatic)
 * TODO: Integrate with Mercado Pago in Week 2
 */
export async function approveWithdrawal(withdrawalId: string) {
  const withdrawal = await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      status: "APPROVED",
    },
  });

  // TODO: Trigger Mercado Pago transfer here
  console.log(`Withdrawal ${withdrawalId} approved - ready for Mercado Pago transfer`);

  return withdrawal;
}

export async function rejectWithdrawal(withdrawalId: string, reason: string) {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal not found");
  }

  // Refund balance if it was already deducted
  if (withdrawal.status === "REQUESTED") {
    await updateAvailableBalance(withdrawal.trabajadorId, withdrawal.amount, "add");
  }

  const updated = await prisma.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      status: "REJECTED",
    },
  });

  console.log(`Withdrawal ${withdrawalId} rejected: ${reason}`);

  return updated;
}
