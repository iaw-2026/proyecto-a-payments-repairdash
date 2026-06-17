import { Prisma, TransactionStatus } from "@/generated/prisma/client";
import type { IncomeDataPoint } from "@/lib/types/income";

export const DRIVER_INCOME_CHART_DAYS = 7;
export const DRIVER_INCOME_TIME_ZONE = "America/Argentina/Buenos_Aires";
export const DRIVER_INCOME_STATUSES = [
  TransactionStatus.RESERVED,
  TransactionStatus.LIQUIDATED,
] as const;

export type DriverIncomeAggregateRow = {
  day: Date | string;
  amount: Prisma.Decimal | string | null;
};

export type DriverIncomeTotalRow = {
  amount: Prisma.Decimal | string | null;
};

type IncomeChartDateWindowOptions = {
  now?: Date;
  dayCount?: number;
  timeZone?: string;
};

type IncomeMonthDateWindowOptions = {
  now?: Date;
  timeZone?: string;
};

function zero() {
  return new Prisma.Decimal("0.00");
}

export function getLocalDateKey(
  date: Date,
  timeZone: string = DRIVER_INCOME_TIME_ZONE,
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("INVALID_DATE_PARTS");
  }

  return `${year}-${month}-${day}`;
}

function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function shiftMonthKey(monthKey: string, months: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
  ].join("-");
}

function formatDayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const label = new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    timeZone: "UTC",
  })
    .format(date)
    .replace(".", "");

  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

function normalizeRowDateKey(day: Date | string) {
  if (day instanceof Date) {
    return getLocalDateKey(day);
  }

  return day.slice(0, 10);
}

export function getIncomeChartDateWindow({
  now = new Date(),
  dayCount = DRIVER_INCOME_CHART_DAYS,
  timeZone = DRIVER_INCOME_TIME_ZONE,
}: IncomeChartDateWindowOptions = {}) {
  const endKey = getLocalDateKey(now, timeZone);
  const startKey = shiftDateKey(endKey, -(dayCount - 1));
  const endExclusiveKey = shiftDateKey(endKey, 1);
  const dateKeys = Array.from({ length: dayCount }, (_, index) =>
    shiftDateKey(startKey, index),
  );

  return {
    startKey,
    endExclusiveKey,
    dateKeys,
  };
}

export function getIncomeMonthDateWindow({
  now = new Date(),
  timeZone = DRIVER_INCOME_TIME_ZONE,
}: IncomeMonthDateWindowOptions = {}) {
  const currentDateKey = getLocalDateKey(now, timeZone);
  const currentMonthKey = currentDateKey.slice(0, 7);
  const nextMonthKey = shiftMonthKey(currentMonthKey, 1);

  return {
    startKey: `${currentMonthKey}-01`,
    endExclusiveKey: `${nextMonthKey}-01`,
  };
}

export function normalizeDriverIncomeTotal(
  amount: Prisma.Decimal | string | null | undefined,
) {
  return (amount ? new Prisma.Decimal(amount.toString()) : zero()).toFixed(2);
}

export function buildDriverIncomeChartData(
  rows: DriverIncomeAggregateRow[],
  options: IncomeChartDateWindowOptions = {},
): IncomeDataPoint[] {
  const { dateKeys } = getIncomeChartDateWindow(options);
  const allowedDateKeys = new Set(dateKeys);
  const totalsByDay = new Map<string, Prisma.Decimal>();

  for (const row of rows) {
    const dateKey = normalizeRowDateKey(row.day);

    if (!allowedDateKeys.has(dateKey)) {
      continue;
    }

    const amount = row.amount ? new Prisma.Decimal(row.amount.toString()) : zero();
    const current = totalsByDay.get(dateKey) ?? zero();
    totalsByDay.set(dateKey, current.plus(amount));
  }

  return dateKeys.map((dateKey) => {
    const amount = (totalsByDay.get(dateKey) ?? zero()).toFixed(2);

    return {
      day: formatDayLabel(dateKey),
      amount, // TODO: Dato calculado mediante agregación
      chartAmount: Number(amount),
    };
  });
}
