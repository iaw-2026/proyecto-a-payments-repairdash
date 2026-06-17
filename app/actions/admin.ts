"use server";

import { Prisma } from "@/generated/prisma/client";
import { getAuthUser } from "@/lib/auth";
import {
  liquidateReservedTransaction,
  updateCommissionSettings,
} from "@/lib/services/liquidations";
import { approveRequestedWithdrawalByAdmin } from "@/lib/services/withdrawals";
import { revalidatePath } from "next/cache";

export type AdminCommissionActionState = {
  ok: boolean;
  message: string;
};

export type AdminActionResult = {
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

function parseWithdrawalId(formData: FormData) {
  const rawWithdrawalId = formData.get("withdrawalId");

  if (typeof rawWithdrawalId !== "string") {
    return null;
  }

  const withdrawalId = rawWithdrawalId.trim();

  return withdrawalId.length > 0 ? withdrawalId : null;
}

function parseTransactionId(formData: FormData) {
  const rawTransactionId = formData.get("transactionId");

  if (typeof rawTransactionId !== "string") {
    return null;
  }

  const transactionId = rawTransactionId.trim();

  return transactionId.length > 0 ? transactionId : null;
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

export async function approveAdminWithdrawal(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    await getAuthUser("adminPayments");
  } catch {
    return {
      ok: false,
      message: "No tenes permisos para aprobar retiros.",
    };
  }

  const withdrawalId = parseWithdrawalId(formData);

  if (!withdrawalId) {
    return {
      ok: false,
      message: "No se encontro el retiro a aprobar.",
    };
  }

  const result = await approveRequestedWithdrawalByAdmin(withdrawalId);

  if (result.count !== 1) {
    return {
      ok: false,
      message: "El retiro ya no esta pendiente de aprobacion.",
    };
  }

  revalidatePath("/admin/withdrawals");

  return {
    ok: true,
    message: "Retiro aprobado correctamente.",
  };
}

export async function liquidateAdminTransaction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    await getAuthUser("adminPayments");
  } catch {
    return {
      ok: false,
      message: "No tenes permisos para liquidar transacciones.",
    };
  }

  const transactionId = parseTransactionId(formData);

  if (!transactionId) {
    return {
      ok: false,
      message: "No se encontro la transaccion a liquidar.",
    };
  }

  const result = await liquidateReservedTransaction(transactionId);

  if (!result) {
    return {
      ok: false,
      message: "La transaccion ya no esta reservada para liquidar.",
    };
  }

  revalidatePath("/admin/transactions");
  revalidatePath("/admin");
  revalidatePath("/driver");
  revalidatePath("/driver/liquidations");

  return {
    ok: true,
    message: "Transaccion liquidada correctamente.",
  };
}
