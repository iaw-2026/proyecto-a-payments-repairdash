/**
 * User service layer
 * Handles user queries with related data
 */

import { prisma } from "@/lib/prisma";
import { User } from "@/generated/prisma";

/**
 * Busca un User por rol e incluye su Trabajador y Balance.
 * Devuelve null si no existe.
 */
export async function getUserWithBalance(role: string) {
  const user = await prisma.user.findFirst({
    where: { role },
    include: {
      trabajador: {
        include: {
          balance: true,
        },
      },
    },
  });

  return user;
}

/**
 * Obtiene el trabajador de un usuario.
 */
export async function getTrabajadorByClerkId(clerkId: string) {
  return await prisma.trabajador.findUnique({
    where: { clerkId },
  });
}

/**
 * Actualiza el CBU/CVU de un trabajador.
 */
export async function updateTrabajadorCbuCvu(clerkId: string, cbuCvu: string) {
  return await prisma.trabajador.update({
    where: { clerkId },
    data: { cbuCvu },
  });
}
