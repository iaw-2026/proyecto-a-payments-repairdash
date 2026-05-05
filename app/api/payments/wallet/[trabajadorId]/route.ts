import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ trabajadorId: string }> }) {
  const { trabajadorId } = await context.params;
  const trabajador = await prisma.trabajador.findUnique({
    where: { clerkId: trabajadorId },
    include: {
      user: true,
      balance: true,
      withdrawals: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!trabajador?.balance) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  const transactions = await prisma.transaction.findMany({
    where: { trabajadorId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    trabajador: {
      clerkId: trabajador.clerkId,
      fullName: trabajador.user.fullName,
      cbuCvu: trabajador.cbuCvu,
    },
    balance: {
      available: trabajador.balance.balanceAvailable.toString(),
      locked: trabajador.balance.balanceLocked.toString(),
    },
    withdrawals: trabajador.withdrawals.map((withdrawal) => ({
      ...withdrawal,
      amount: withdrawal.amount.toString(),
    })),
    transactions: transactions.map((transaction) => ({
      ...transaction,
      amount: transaction.amount.toString(),
    })),
  });
}