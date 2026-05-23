/**
 * Withdrawal Service Layer
 * Handles the business logic for money withdrawals.
 */

import { prisma } from "@/lib/prisma";
import { Prisma, TransactionStatus, Withdrawal, WithdrawalStatus } from "@/generated/prisma/client";
import { getAuthUser } from "@/lib/auth";
import { randomUUID } from "crypto";

const LOCAL_WITHDRAWAL_APPROVAL_TIMER_MS = 30_000;

export function scheduleWithdrawalApproval(withdrawalId: string) {
  // TODO: Reemplazar por una tarea persistente antes de produccion.
  setTimeout(() => {
    void approveRequestedWithdrawalStatus(withdrawalId).catch((error) => {
      console.error("No se pudo aprobar automaticamente el retiro", error);
    });
  }, LOCAL_WITHDRAWAL_APPROVAL_TIMER_MS);
}

async function approveRequestedWithdrawalStatus(withdrawalId: string) {
  return prisma.withdrawal.updateMany({
    where: {
      id: withdrawalId,
      status: WithdrawalStatus.REQUESTED,
    },
    data: {
      status: WithdrawalStatus.APPROVED,
    },
  });
}

export async function approveRequestedWithdrawalByAdmin(withdrawalId: string) {
  return approveRequestedWithdrawalStatus(withdrawalId);
}

/**
 * Procesa una solicitud de retiro de forma atómica.
 * Cumple con AGENTS.md:
 * - Rule 1: Uso de tipos generados.
 * - Rule 2: Separación de modelos Trabajador/Balance.
 * - Rule 3: Precisión Decimal para integridad financiera.
 */
export async function createWithdrawalRequest(clerkId: string, amount: number) {
  const decimalAmount = new Prisma.Decimal(amount.toFixed(2));

  const result = await prisma.$transaction(async (tx) => {
    /* 1. Validar Trabajador e Identidad (Rule 2) */
    const trabajador = await tx.trabajador.findUnique({
      where: { clerkId },
      select: { clerkId: true, cbuCvu: true },
    });

    if (!trabajador) throw new Error("TRABAJADOR_NOT_FOUND");
    if (!trabajador.cbuCvu) throw new Error("CBU_CVU_MISSING");

    /* 2. Validar Balance (Rule 2: Modelo separado) */
    const balance = await tx.balance.findUnique({
      where: { trabajadorId: clerkId },
    });

    if (!balance) throw new Error("BALANCE_NOT_FOUND");

    /* 3. Validar Saldo (Rule 3: Aritmética Decimal) */
    if (balance.balanceAvailable.lessThan(decimalAmount)) {
      throw new Error("INSUFFICIENT_BALANCE");
    }

    /* 4. Operaciones de Base de Datos */
    // Debitar saldo
    await tx.balance.update({
      where: { trabajadorId: clerkId },
      data: {
        balanceAvailable: balance.balanceAvailable.minus(decimalAmount),
      },
    });

    // Crear registro de retiro
    const withdrawalId = randomUUID();
    const withdrawal = await tx.withdrawal.create({
      data: {
        id: withdrawalId,
        trabajadorId: clerkId,
        amount: decimalAmount,
        status: WithdrawalStatus.REQUESTED,
      },
    });

    // Crear movimiento en el historial (Monto negativo para retiros)
    await tx.transaction.create({
      data: {
        id: randomUUID(),
        trabajoId: `withdrawal:${withdrawalId}`,
        amount: decimalAmount.negated(),
        status: TransactionStatus.PENDING,
        trabajadorId: clerkId,
        // clientId es opcional
      },
    });

    return {
      withdrawal,
      cbuCvu: trabajador.cbuCvu
    };
  });

  scheduleWithdrawalApproval(result.withdrawal.id);

  return result;
}

/**
 * Resultado paginado de retiros.
 * Usa tipos generados de Prisma (Rule 1 — AGENTS.md).
 */
export type PaginatedWithdrawals = {
  items: Withdrawal[];
  totalPages: number;
  currentPage: number;
};

/**
 * Obtiene el historial de retiros del trabajador autenticado con paginación
 * server-side (skip/take).
 *
 * @param page      - Número de página (1-indexed). Default: 1.
 * @param pageSize  - Cantidad de ítems por página. Default: 10.
 *
 * Cumple con AGENTS.md:
 * - Rule 1: Retorna `Withdrawal[]` (tipo generado de Prisma).
 * - Rule 2: Consulta solo el modelo Withdrawal, sin aplanar con Trabajador.
 * - Rule 3: Los montos se mantienen como Decimal del modelo generado.
 */
export async function getWithdrawals(
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedWithdrawals> {
  const { clerkId } = await getAuthUser("driver");

  // Asegurar valores mínimos válidos
  const safePageSize = Math.max(1, Math.min(50, Math.floor(pageSize)));

  // Primero obtener el total para poder clampear la página
  const totalCount = await prisma.withdrawal.count({
    where: { trabajadorId: clerkId },
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));

  // Si el usuario pide una página que excede el total, lo mandamos a la última
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const skip = (safePage - 1) * safePageSize;

  const items = await prisma.withdrawal.findMany({
    where: { trabajadorId: clerkId },
    orderBy: { createdAt: "desc" },
    skip,
    take: safePageSize,
  });

  return {
    items,
    totalPages,
    currentPage: safePage,
  };
}

/**
 * Obtiene un retiro específico por ID.
 */
export async function getWithdrawalById(withdrawalId: string) {
  return await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });
}
