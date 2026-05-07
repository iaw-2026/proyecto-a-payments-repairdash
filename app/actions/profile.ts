"use server";

import { getAuthUser } from "@/lib/mock-auth";
import { updateTrabajadorCbuCvu } from "@/lib/services/users";
import { revalidatePath } from "next/cache";

type UpdateCbuSuccess = {
  ok: true;
};

type UpdateCbuError = {
  ok: false;
  error: string;
};

export type UpdateCbuResult = UpdateCbuSuccess | UpdateCbuError;

export async function updateCbuCvuAction(cbuCvu: string): Promise<UpdateCbuResult> {
  try {
    const { clerkId } = await getAuthUser();

    // Validar en el servidor: exactamente 22 dígitos numéricos
    if (!/^\d{22}$/.test(cbuCvu)) {
      return { ok: false, error: "El CBU/CVU debe tener exactamente 22 dígitos numéricos." };
    }

    await updateTrabajadorCbuCvu(clerkId, cbuCvu);

    // Revalidar las rutas afectadas
    revalidatePath("/driver");
    revalidatePath("/driver/config");
    revalidatePath("/driver/withdrawals");

    return { ok: true };
  } catch (error) {
    console.error("Error updating CBU/CVU:", error);
    return { ok: false, error: "Ocurrió un error al guardar la cuenta. Intentá nuevamente." };
  }
}
