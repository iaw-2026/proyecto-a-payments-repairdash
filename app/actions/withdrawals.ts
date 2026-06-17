"use server";

import { getAuthUser } from "@/lib/auth";
import { createWithdrawalRequest } from "@/lib/services/withdrawals";
import { validateAuthenticatedWithdrawal } from "@/lib/validations/withdrawal";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

type WithdrawalSuccess = {
  ok: true;
  withdrawalId: string;
  amountFormatted: string;
  cbuCvu: string;
};

type WithdrawalError = {
  ok: false;
  error: string;
};

export type WithdrawalResult = WithdrawalSuccess | WithdrawalError;

export async function requestWithdrawal(amount: string): Promise<WithdrawalResult> {
  let clerkId: string;

  try {
    const user = await getAuthUser("driver");
    clerkId = user.clerkId;
  } catch {
    return { ok: false, error: "No hay sesion activa. Inicia sesion para continuar." };
  }

  try {
    validateAuthenticatedWithdrawal({ amount });
  } catch (error) {
    if (error instanceof ZodError) {
      return { ok: false, error: error.issues[0]?.message ?? "Ingresa un monto valido." };
    }

    return { ok: false, error: "Ingresa un monto valido." };
  }

  try {
    const result = await createWithdrawalRequest(clerkId, amount);

    revalidatePath("/driver");

    return {
      ok: true,
      withdrawalId: result.withdrawal.id,
      amountFormatted: `$${result.withdrawal.amount.toFixed(2)}`,
      cbuCvu: result.cbuCvu,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    const userMessages: Record<string, string> = {
      TRABAJADOR_NOT_FOUND: "No se encontro tu perfil de trabajador.",
      CBU_CVU_MISSING: "No tenes un CBU/CVU registrado. Por favor, cargalo en la seccion de configuracion.",
      BALANCE_NOT_FOUND: "No se pudo acceder a tu balance. Contacta a soporte.",
      INSUFFICIENT_BALANCE: "Saldo insuficiente para realizar este retiro.",
    };

    return {
      ok: false,
      error: userMessages[message] ?? "No se pudo procesar el retiro. Intenta de nuevo.",
    };
  }
}
