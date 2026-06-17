import test from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "../generated/prisma/client";
import {
  ANALYTICS_DEFAULT_DAYS,
  ANALYTICS_MAX_DAYS,
  buildAnalyticsDailyBuckets,
  formatAnalyticsMoney,
  getAnalyticsDailyWindow,
  getAnalyticsDays,
  getAnalyticsMonthPeriod,
} from "../lib/analytics-utils";

test("getAnalyticsMonthPeriod uses the requested valid month", () => {
  assert.deepEqual(
    getAnalyticsMonthPeriod(new URLSearchParams("month=2026-06")),
    {
      month: "2026-06",
      startKey: "2026-06-01",
      endExclusiveKey: "2026-07-01",
    },
  );
});

test("getAnalyticsMonthPeriod falls back to current Buenos Aires month", () => {
  assert.deepEqual(
    getAnalyticsMonthPeriod(
      new URLSearchParams("month=bad"),
      new Date("2026-06-17T15:00:00.000Z"),
    ),
    {
      month: "2026-06",
      startKey: "2026-06-01",
      endExclusiveKey: "2026-07-01",
    },
  );
});

test("getAnalyticsMonthPeriod handles December rollover", () => {
  assert.deepEqual(
    getAnalyticsMonthPeriod(new URLSearchParams("month=2026-12")),
    {
      month: "2026-12",
      startKey: "2026-12-01",
      endExclusiveKey: "2027-01-01",
    },
  );
});

test("getAnalyticsDays applies defaults and caps the requested range", () => {
  assert.equal(getAnalyticsDays(new URLSearchParams()), ANALYTICS_DEFAULT_DAYS);
  assert.equal(getAnalyticsDays(new URLSearchParams("days=0")), 1);
  assert.equal(getAnalyticsDays(new URLSearchParams("days=3.9")), 3);
  assert.equal(getAnalyticsDays(new URLSearchParams("days=1000")), ANALYTICS_MAX_DAYS);
  assert.equal(getAnalyticsDays(new URLSearchParams("days=abc")), ANALYTICS_DEFAULT_DAYS);
});

test("getAnalyticsDailyWindow returns a closed range start and exclusive end", () => {
  assert.deepEqual(
    getAnalyticsDailyWindow(7, new Date("2026-06-17T15:00:00.000Z")),
    {
      startKey: "2026-06-11",
      endExclusiveKey: "2026-06-18",
    },
  );
});

test("buildAnalyticsDailyBuckets fills missing days with zeroes", () => {
  const buckets = buildAnalyticsDailyBuckets(
    [
      { date: "2026-06-11", gmv: "100.25", transactions: 2 },
      { date: "2026-06-13", gmv: new Prisma.Decimal("50"), transactions: BigInt(1) },
    ],
    {
      startKey: "2026-06-11",
      days: 4,
    },
  );

  assert.deepEqual(buckets, [
    { date: "2026-06-11", gmv: "100.25", transactions: 2 },
    { date: "2026-06-12", gmv: "0.00", transactions: 0 },
    { date: "2026-06-13", gmv: "50.00", transactions: 1 },
    { date: "2026-06-14", gmv: "0.00", transactions: 0 },
  ]);
});

test("formatAnalyticsMoney returns fixed decimal strings", () => {
  assert.equal(formatAnalyticsMoney(null), "0.00");
  assert.equal(formatAnalyticsMoney("10"), "10.00");
  assert.equal(formatAnalyticsMoney(new Prisma.Decimal("10.005")), "10.01");
});
