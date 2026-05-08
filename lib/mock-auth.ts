/**
 * Mock de autenticación — reemplazar por Clerk cuando esté disponible.
 *
 * Simula `currentUser()` de Clerk devolviendo el clerkId del driver
 * que existe en el seed. Cuando se integre Clerk, borrar este archivo
 * y usar `import { currentUser } from "@clerk/nextjs/server"`.
 */

const MOCK_CLERK_ID = "user_driver_1";

/**
 * Devuelve el clerkId del usuario autenticado.
 * @throws Error si no hay sesión (simulada).
 */
export async function getAuthUser(): Promise<{ clerkId: string }> {
  // TODO: Reemplazar con Clerk → const user = await currentUser();
  const clerkId = MOCK_CLERK_ID;

  if (!clerkId) {
    throw new Error("NO_SESSION");
  }

  return { clerkId };
}
