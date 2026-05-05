/**
 * Transaction service layer
 * Handles transaction state transitions and business logic
 */

import { prisma } from "@/lib/prisma";
import type { TransactionStatus } from "@/generated/prisma/client";
import { randomUUID } from "crypto";

export async function createTransaction(
  clientId: string,
  trabajadorId: string,
  amount: string
) {
  const transaction = await prisma.transaction.create({
    data: {
      id: randomUUID(),
      clientId,
      trabajadorId,
      amount: parseFloat(amount),
      status: "PENDING" as TransactionStatus,
    },
  });

  return transaction;
}

export async function getTransactionById(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  return transaction;
}

export async function getTransactionsByClient(clientId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  return transactions;
}

export async function getTransactionsByWorker(trabajadorId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { trabajadorId },
    orderBy: { createdAt: "desc" },
  });

  return transactions;
}

/**
 * Transition transaction status
 * TODO: Add audit logging in Week 3
 */
export async function transitionTransactionStatus(
  transactionId: string,
  newStatus: TransactionStatus,
  reason?: string
) {
  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: newStatus,
    },
  });

  // TODO: Log state transition for audit trail
  console.log(`Transaction ${transactionId} transitioned to ${newStatus}${reason ? `: ${reason}` : ""}`);

  return transaction;
}
