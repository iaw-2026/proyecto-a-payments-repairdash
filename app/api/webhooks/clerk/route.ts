import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

type ClerkUserRole = "rider" | "driver" | "admin";

function parseRole(value: unknown): ClerkUserRole | null {
  if (value === "rider" || value === "driver" || value === "admin") {
    return value;
  }

  return null;
}

function getPrimaryEmail(user: {
  primary_email_address_id: string | null;
  email_addresses: Array<{ id: string; email_address: string }>;
}) {
  const primaryEmail = user.email_addresses.find(
    (email) => email.id === user.primary_email_address_id,
  );

  return primaryEmail?.email_address ?? user.email_addresses[0]?.email_address ?? null;
}

function getFullName(user: {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
}, email: string) {
  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.username || email;
}

async function syncRiderUser(input: {
  clerkId: string;
  email: string;
  fullName: string;
}) {
  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { clerkId: input.clerkId },
      create: {
        clerkId: input.clerkId,
        email: input.email,
        fullName: input.fullName,
        role: "rider",
      },
      update: {
        email: input.email,
        fullName: input.fullName,
        role: "rider",
      },
    });

    await tx.cliente.upsert({
      where: { clerkId: input.clerkId },
      create: { clerkId: input.clerkId },
      update: {},
    });
  });
}

async function syncDriverUser(input: {
  clerkId: string;
  email: string;
  fullName: string;
}) {
  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { clerkId: input.clerkId },
      create: {
        clerkId: input.clerkId,
        email: input.email,
        fullName: input.fullName,
        role: "driver",
      },
      update: {
        email: input.email,
        fullName: input.fullName,
        role: "driver",
      },
    });

    await tx.trabajador.upsert({
      where: { clerkId: input.clerkId },
      create: {
        clerkId: input.clerkId,
        cbuCvu: null,
      },
      update: {},
    });

    await tx.balance.upsert({
      where: { trabajadorId: input.clerkId },
      create: {
        trabajadorId: input.clerkId,
        balanceAvailable: new Prisma.Decimal("0.00"),
        balanceLocked: new Prisma.Decimal("0.00"),
      },
      update: {},
    });
  });
}

export async function POST(request: NextRequest) {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return Response.json({ success: false, error: "INVALID_WEBHOOK_SIGNATURE" }, { status: 400 });
  }

  if (event.type !== "user.created" && event.type !== "user.updated") {
    return Response.json({ success: true, ignored: true });
  }

  const role = parseRole(event.data.public_metadata.role);

  if (role !== "rider" && role !== "driver") {
    return Response.json({ success: true, ignored: true });
  }

  const email = getPrimaryEmail(event.data);

  if (!email) {
    return Response.json(
      { success: false, error: "PRIMARY_EMAIL_MISSING" },
      { status: 422 },
    );
  }

  const userInput = {
    clerkId: event.data.id,
    email,
    fullName: getFullName(event.data, email),
  };

  try {
    if (role === "rider") {
      await syncRiderUser(userInput);
    } else {
      await syncDriverUser(userInput);
    }

    return Response.json({ success: true, role });
  } catch (error) {
    console.error("Clerk user sync failed", error);
    return Response.json({ success: false, error: "CLERK_USER_SYNC_FAILED" }, { status: 500 });
  }
}
