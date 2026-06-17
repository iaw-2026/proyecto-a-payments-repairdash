import { z } from "zod";

const decimalAmountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "El monto debe tener hasta dos decimales.")
  .refine((value) => value !== "0" && value !== "0.0" && value !== "0.00", "El monto debe ser mayor a cero.");

export const checkoutSchema = z.object({
  trabajoId: z.string().trim().min(1, "trabajoId es requerido."),
  clientId: z.string().trim().min(1, "clientId es requerido."),
  trabajadorId: z.string().trim().min(1, "trabajadorId es requerido."),
  amount: decimalAmountSchema,
  description: z.string().trim().min(1).max(180).default("Servicio de reparacion"),
});

export const cancelCheckoutSchema = z.object({
  trabajoId: z.string().trim().min(1, "trabajoId es requerido."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CancelCheckoutInput = z.infer<typeof cancelCheckoutSchema>;

export function validateCheckout(data: unknown): CheckoutInput {
  return checkoutSchema.parse(data);
}

export function validateCancelCheckout(data: unknown): CancelCheckoutInput {
  return cancelCheckoutSchema.parse(data);
}
