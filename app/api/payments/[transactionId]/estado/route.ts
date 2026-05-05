import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await context.params;
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json({
    transaction: {
      ...transaction,
      amount: transaction.amount.toString(),
    },
  });
}
