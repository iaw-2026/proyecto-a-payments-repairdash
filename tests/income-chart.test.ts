import test from "node:test";
import assert from "node:assert/strict";
import { Prisma, TransactionStatus } from "../generated/prisma/client";
import {
  buildDriverIncomeChartData,
  DRIVER_INCOME_CHART_DAYS,
  DRIVER_INCOME_STATUSES,
  getIncomeMonthDateWindow,
  normalizeDriverIncomeTotal,
} from "../lib/income-chart";

test("buildDriverIncomeChartData fills seven calendar days with zero income", () => {
  const data = buildDriverIncomeChartData([], {
    now: new Date("2026-05-20T15:00:00.000Z"),
  });

  assert.equal(data.length, DRIVER_INCOME_CHART_DAYS);
  assert.deepEqual(
    data.map((point) => point.amount),
    ["0.00", "0.00", "0.00", "0.00", "0.00", "0.00", "0.00"],
  );
  assert.deepEqual(
    data.map((point) => point.chartAmount),
    [0, 0, 0, 0, 0, 0, 0],
  );
});

test("buildDriverIncomeChartData sums decimal rows by day and keeps order", () => {
  const data = buildDriverIncomeChartData(
    [
      { day: "2026-05-14", amount: new Prisma.Decimal("100.10") },
      { day: "2026-05-14", amount: "0.20" },
      { day: "2026-05-17", amount: "50.00" },
      { day: "2026-05-13", amount: "999.00" },
    ],
    {
      now: new Date("2026-05-20T15:00:00.000Z"),
    },
  );

  assert.deepEqual(
    data.map((point) => point.amount),
    ["100.30", "0.00", "0.00", "50.00", "0.00", "0.00", "0.00"],
  );
  assert.deepEqual(
    data.map((point) => point.chartAmount),
    [100.3, 0, 0, 50, 0, 0, 0],
  );
});

test("driver income chart only counts reserved and liquidated transactions", () => {
  assert.deepEqual(DRIVER_INCOME_STATUSES, [
    TransactionStatus.RESERVED,
    TransactionStatus.LIQUIDATED,
  ]);
});

test("getIncomeMonthDateWindow returns current local month bounds", () => {
  assert.deepEqual(
    getIncomeMonthDateWindow({
      now: new Date("2026-05-20T15:00:00.000Z"),
    }),
    {
      startKey: "2026-05-01",
      endExclusiveKey: "2026-06-01",
    },
  );
});

test("getIncomeMonthDateWindow handles December to January rollover", () => {
  assert.deepEqual(
    getIncomeMonthDateWindow({
      now: new Date("2026-12-20T15:00:00.000Z"),
    }),
    {
      startKey: "2026-12-01",
      endExclusiveKey: "2027-01-01",
    },
  );
});

test("normalizeDriverIncomeTotal returns fixed money strings", () => {
  assert.equal(normalizeDriverIncomeTotal(null), "0.00");
  assert.equal(normalizeDriverIncomeTotal("123.4"), "123.40");
  assert.equal(
    normalizeDriverIncomeTotal(new Prisma.Decimal("10.005")),
    "10.01",
  );
});
