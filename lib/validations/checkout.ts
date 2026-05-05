/**
 * Validation schemas for checkout operations
 * TODO: Implement with Zod in Week 2
 */

export interface CheckoutInput {
  clientId: string;
  trabajadorId: string;
  amount: string;
}

export function validateCheckout(data: unknown): CheckoutInput {
  // TODO: Replace with Zod schema validation
  if (!data || typeof data !== "object") {
    throw new Error("Invalid checkout data");
  }

  const checkout = data as Record<string, unknown>;

  if (!checkout.clientId || typeof checkout.clientId !== "string") {
    throw new Error("Invalid clientId");
  }

  if (!checkout.trabajadorId || typeof checkout.trabajadorId !== "string") {
    throw new Error("Invalid trabajadorId");
  }

  if (!checkout.amount || typeof checkout.amount !== "string") {
    throw new Error("Invalid amount");
  }

  return {
    clientId: checkout.clientId,
    trabajadorId: checkout.trabajadorId,
    amount: checkout.amount,
  };
}
