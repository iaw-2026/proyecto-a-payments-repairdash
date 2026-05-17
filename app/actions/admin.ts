"use server";

import { Prisma } from "@/generated/prisma/client";
import { getAuthUser } from "@/lib/auth";
import { updateCommissionSettings } from "@/lib/services/liquidations";
import { revalidatePath } from "next/cache";

export type AdminCommissionActionState = {
  ok: boolean;
  message: string;
};

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

export async function updateAdminCommissionRate(
  _previousState: AdminCommissionActionState,
  formData: FormData,
): Promise<AdminCommissionActionState> {
  try {
    await getAuthUser("adminPayments");
  } catch {
    return {
      ok: false,
      message: "No tenes permisos para cambiar la comision.",
    };
  }

  const commissionRate = parseCommissionRate(formData);

  if (!commissionRate) {
    return {
      ok: false,
      message: "Ingresa una comision valida entre 0 y 100, con hasta 2 decimales.",
    };
  }

  await updateCommissionSettings(commissionRate);
  revalidatePath("/admin");

  return {
    ok: true,
    message: "Comision actualizada correctamente.",
  };
}
