import { Prisma, type Balance } from "@/generated/prisma/client";

export type BalanceOperation = "add" | "subtract";

export function calculateAvailableBalance(
  balanceAvailable: Prisma.Decimal,
  amount: Prisma.Decimal | string,
  operation: BalanceOperation,
) {
  const decimalAmount = new Prisma.Decimal(amount);
  const nextAmount =
    operation === "add"
      ? balanceAvailable.plus(decimalAmount)
      : balanceAvailable.minus(decimalAmount);

  if (nextAmount.lessThan(0)) {
    throw new Error("Insufficient balance");
  }

  return nextAmount;
}

export function calculateLockedBalance(
  balanceLocked: Prisma.Decimal,
  amount: Prisma.Decimal | string,
  operation: BalanceOperation,
) {
  const decimalAmount = new Prisma.Decimal(amount);
  const nextAmount =
    operation === "add"
      ? balanceLocked.plus(decimalAmount)
      : balanceLocked.minus(decimalAmount);

  if (nextAmount.lessThan(0)) {
    throw new Error("Cannot reduce locked balance below zero");
  }

  return nextAmount;
}

export function calculateBalanceTotal(balance: Pick<Balance, "balanceAvailable" | "balanceLocked">) {
  return balance.balanceAvailable.plus(balance.balanceLocked);
}
