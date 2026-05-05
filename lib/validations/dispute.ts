export type DisputeInput = {
  transactionId: string;
  reason: string;
};

export function validateDispute(input: Partial<DisputeInput>) {
  return Boolean(input.transactionId && input.reason?.trim());
}