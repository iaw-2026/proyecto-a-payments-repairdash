import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function parseAmount(value: FormDataEntryValue | null) {
  const numericValue = typeof value === "string" ? Number(value) : Number(value?.toString() ?? "0");
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const formData = contentType.includes("application/json") ? null : await request.formData();
  const payload = contentType.includes("application/json") ? await request.json() : null;

  const trabajadorId = String(payload?.trabajadorId ?? formData?.get("trabajadorId") ?? "");
  const amount = contentType.includes("application/json")
    ? Number(payload?.amount ?? 0)
    : parseAmount(formData?.get("amount") ?? null);

  if (!trabajadorId || amount <= 0) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  try {
    const withdrawal = await prisma.$transaction(async (tx) => {
      const balance = await tx.balance.findUnique({
        where: { trabajadorId },
      });

      if (!balance) {
        throw new Error("BALANCE_NOT_FOUND");
      }

      const currentAvailable = balance.balanceAvailable.toNumber();

      if (currentAvailable < amount) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const nextAvailable = currentAvailable - amount;

      await tx.balance.update({
        where: { trabajadorId },
        data: {
          balanceAvailable: new Prisma.Decimal(nextAvailable.toFixed(2)),
        },
      });

      return tx.withdrawal.create({
        data: {
          id: crypto.randomUUID(),
          trabajadorId,
          amount: new Prisma.Decimal(amount.toFixed(2)),
          status: "REQUESTED",
        },
      });
    });

    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL(`/driver?withdrawal=${withdrawal.id}`, request.url));
    }

    return NextResponse.json({
      withdrawal: {
        ...withdrawal,
        amount: withdrawal.amount.toString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    return NextResponse.json({ error: "No se pudo registrar el retiro" }, { status: 500 });
  }
}