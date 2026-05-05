/**
 * Validation schemas for withdrawal operations
 * TODO: Implement with Zod in Week 2
 */

export interface WithdrawalInput {
  trabajadorId: string;
  amount: string;
}

export function validateWithdrawal(data: unknown): WithdrawalInput {
  // TODO: Replace with Zod schema validation
  if (!data || typeof data !== "object") {
    throw new Error("Invalid withdrawal data");
  }

  const withdrawal = data as Record<string, unknown>;

  if (!withdrawal.trabajadorId || typeof withdrawal.trabajadorId !== "string") {
    throw new Error("Invalid trabajadorId");
  }

  if (!withdrawal.amount || typeof withdrawal.amount !== "string") {
    throw new Error("Invalid amount");
  }

  return {
    trabajadorId: withdrawal.trabajadorId,
    amount: withdrawal.amount,
  };
}
