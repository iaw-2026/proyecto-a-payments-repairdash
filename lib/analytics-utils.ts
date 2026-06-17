import { Prisma } from "@/generated/prisma/client";

export const ANALYTICS_TIME_ZONE = "America/Argentina/Buenos_Aires";
export const ANALYTICS_DEFAULT_DAYS = 7;
export const ANALYTICS_MAX_DAYS = 31;

export type AnalyticsPeriod = {
  month: string;
  startKey: string;
  endExclusiveKey: string;
};

export type AnalyticsDayBucket = {
  date: string;
  gmv: string;
  transactions: number;
};

export type AnalyticsDailyRow = {
  date: string;
  gmv: Prisma.Decimal | string | number | null;
  transactions: number | bigint | null;
};

function buenosAiresDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ANALYTICS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));

  return date.toISOString().slice(0, 10);
}

function monthFromDateKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

function nextMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber, 1));

  return date.toISOString().slice(0, 7);
}

export function getAnalyticsMonthPeriod(searchParams: URLSearchParams, now = new Date()): AnalyticsPeriod {
  const rawMonth = searchParams.get("month")?.trim();
  const month = rawMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(rawMonth)
    ? rawMonth
    : monthFromDateKey(buenosAiresDateKey(now));

  return {
    month,
    startKey: `${month}-01`,
    endExclusiveKey: `${nextMonth(month)}-01`,
  };
}

export function getAnalyticsDays(searchParams: URLSearchParams) {
  const rawDays = searchParams.get("days");

  if (!rawDays || rawDays.trim() === "") {
    return ANALYTICS_DEFAULT_DAYS;
  }

  const parsed = Number(rawDays);

  if (!Number.isFinite(parsed)) {
    return ANALYTICS_DEFAULT_DAYS;
  }

  return Math.min(Math.max(1, Math.floor(parsed)), ANALYTICS_MAX_DAYS);
}

export function getAnalyticsDailyWindow(days: number, now = new Date()) {
  const endKey = buenosAiresDateKey(now);
  const startKey = addDays(endKey, -(days - 1));
  const endExclusiveKey = addDays(endKey, 1);

  return {
    startKey,
    endExclusiveKey,
  };
}

export function formatAnalyticsMoney(value: Prisma.Decimal | string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "0.00";
  }

  return new Prisma.Decimal(value).toFixed(2);
}

export function buildAnalyticsDailyBuckets(
  rows: AnalyticsDailyRow[],
  options: { startKey: string; days: number },
): AnalyticsDayBucket[] {
  const rowsByDate = new Map(rows.map((row) => [row.date, row]));

  return Array.from({ length: options.days }, (_, index) => {
    const date = addDays(options.startKey, index);
    const row = rowsByDate.get(date);

    return {
      date,
      gmv: formatAnalyticsMoney(row?.gmv),
      transactions: Number(row?.transactions ?? 0),
    };
  });
}
