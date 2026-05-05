import { Prisma, TransactionStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function parseAmount(value: FormDataEntryValue | null) {
  const numericValue = typeof value === "string" ? Number(value) : Number(value?.toString() ?? "0");
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let clientId = "";
  let trabajadorId = "";
  let amount = 0;
  let description = "Servicio de reparacion";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      clientId?: string;
      trabajadorId?: string;
      amount?: number;
      description?: string;
    };

    clientId = body.clientId ?? "";
    trabajadorId = body.trabajadorId ?? "";
    amount = Number(body.amount ?? 0);
    description = body.description ?? description;
  } else {
    const formData = await request.formData();
    clientId = String(formData.get("clientId") ?? "");
    trabajadorId = String(formData.get("trabajadorId") ?? "");
    amount = parseAmount(formData.get("amount"));
    description = String(formData.get("description") ?? description);
  }

  if (!clientId || !trabajadorId || amount <= 0) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      id: crypto.randomUUID(),
      amount: new Prisma.Decimal(amount.toFixed(2)),
      status: TransactionStatus.PENDING,
      clientId,
      trabajadorId,
      gatewayPaymentId: null,
    },
  });

  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/rider?created=${encodeURIComponent(description)}`, request.url));
  }

  return NextResponse.json(
    {
      transaction: {
        ...transaction,
        amount: transaction.amount.toString(),
      },
    },
    { status: 201 },
  );
}