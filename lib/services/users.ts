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
