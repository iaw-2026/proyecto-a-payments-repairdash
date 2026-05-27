import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

export const withdrawalAmountSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(",", "."))
  .refine(
    (value) => /^\d+(\.\d{1,2})?$/.test(value),
    "El monto debe tener hasta dos decimales.",
  )
  .refine(
    (value) => new Prisma.Decimal(value).greaterThan(0),
    "El monto debe ser mayor a cero.",
  );

export const withdrawalSchema = z.object({
  trabajadorId: z.string().trim().min(1, "trabajadorId es requerido."),
  amount: withdrawalAmountSchema,
});

export const authenticatedWithdrawalSchema = z.object({
  amount: withdrawalAmountSchema,
});

export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type AuthenticatedWithdrawalInput = z.infer<typeof authenticatedWithdrawalSchema>;

export function validateWithdrawal(data: unknown): WithdrawalInput {
  return withdrawalSchema.parse(data);
}

export function validateAuthenticatedWithdrawal(data: unknown): AuthenticatedWithdrawalInput {
  return authenticatedWithdrawalSchema.parse(data);
}
