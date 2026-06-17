import test from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "../generated/prisma/client";
import {
  calculateAvailableBalance,
  calculateBalanceTotal,
  calculateLockedBalance,
} from "../lib/balance-math";

test("calculateAvailableBalance adds money using Decimal precision", () => {
  const result = calculateAvailableBalance(
    new Prisma.Decimal("0.10"),
    new Prisma.Decimal("0.20"),
    "add",
  );

  assert.equal(result.toFixed(2), "0.30");
});

test("calculateAvailableBalance prevents negative available balance", () => {
  assert.throws(
    () =>
      calculateAvailableBalance(
        new Prisma.Decimal("50.00"),
        new Prisma.Decimal("50.01"),
        "subtract",
      ),
    /Insufficient balance/,
  );
});

test("calculateLockedBalance prevents negative locked balance", () => {
  assert.throws(
    () =>
      calculateLockedBalance(
        new Prisma.Decimal("10.00"),
        new Prisma.Decimal("10.01"),
        "subtract",
      ),
    /Cannot reduce locked balance below zero/,
  );
});

test("calculateBalanceTotal composes available and locked balances", () => {
  const total = calculateBalanceTotal({
    balanceAvailable: new Prisma.Decimal("125.25"),
    balanceLocked: new Prisma.Decimal("74.75"),
  });

  assert.equal(total.toFixed(2), "200.00");
});
