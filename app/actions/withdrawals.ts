"use server";

/**
 * Server Action — Solicitar retiro de fondos.
 *
 * Actúa como orquestador entre la UI y la capa de servicios.
 * Se encarga de:
 *  1. Gestión de identidad (Auth).
 *  2. Validación de inputs básicos.
 *  3. Mapeo de errores de negocio a mensajes amigables para el usuario.
 */

import { getAuthUser } from "@/lib/auth";
import { createWithdrawalRequest } from "@/lib/services/withdrawals";
import { revalidatePath } from "next/cache";

/* ── Tipos de respuesta ── */

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

/* ── Server Action ── */

export async function requestWithdrawal(amount: number): Promise<WithdrawalResult> {
  /* 1. Identidad */
  let clerkId: string;

  try {
    const user = await getAuthUser("driver");
    clerkId = user.clerkId;
  } catch {
    return { ok: false, error: "No hay sesión activa. Iniciá sesión para continuar." };
  }

  /* 2. Validación básica del input */
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "El monto debe ser un número positivo." };
  }

  /* 3. Llamada al servicio modularizado */
  try {
    const result = await createWithdrawalRequest(clerkId, amount);

    // Forzar la actualización del Dashboard y componentes de cliente
    revalidatePath("/driver");

    return {
      ok: true,
      withdrawalId: result.withdrawal.id,
      amountFormatted: `$${result.withdrawal.amount.toFixed(2)}`,
      cbuCvu: result.cbuCvu,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    // Mapeo de errores técnicos a mensajes de usuario
    const userMessages: Record<string, string> = {
      TRABAJADOR_NOT_FOUND: "No se encontró tu perfil de trabajador.",
      CBU_CVU_MISSING: "No tenés un CBU/CVU registrado. Por favor, cargalo en la sección de configuración.",
      BALANCE_NOT_FOUND: "No se pudo acceder a tu balance. Contactá a soporte.",
      INSUFFICIENT_BALANCE: "Saldo insuficiente para realizar este retiro.",
    };

    return {
      ok: false,
      error: userMessages[message] ?? "No se pudo procesar el retiro. Intentá de nuevo.",
    };
  }
}
