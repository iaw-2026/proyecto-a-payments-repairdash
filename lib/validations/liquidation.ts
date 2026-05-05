export type LiquidationInput = {
  trabajadorId: string;
  amount: string;
};

export function validateLiquidation(input: Partial<LiquidationInput>) {
  return Boolean(input.trabajadorId && input.amount && Number(input.amount) > 0);
}