"use server";

import { Prisma } from "@/generated/prisma/client";
import { getAuthUser } from "@/lib/auth";
import { updateCommissionSettings } from "@/lib/services/liquidations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseCommissionRate(formData: FormData) {
  const rawRate = formData.get("commissionRate");

  if (typeof rawRate !== "string") {
    return null;
  }

  const normalizedRate = rawRate.trim().replace(",", ".");

  if (!/^\d{1,3}(\.\d{1,2})?$/.test(normalizedRate)) {
    return null;
  }

  const commissionRate = new Prisma.Decimal(normalizedRate);

  if (commissionRate.lessThan(0) || commissionRate.greaterThan(100)) {
    return null;
  }

  return commissionRate;
}

export async function updateCommissionRate(formData: FormData) {
  try {
    await getAuthUser("admin");
  } catch {
    redirect("/admin/liquidations?error=forbidden");
  }

  const commissionRate = parseCommissionRate(formData);

  if (!commissionRate) {
    redirect("/admin/liquidations?error=invalid-rate");
  }

  await updateCommissionSettings(commissionRate);
  revalidatePath("/admin/liquidations");

  redirect("/admin/liquidations?updated=1");
}
