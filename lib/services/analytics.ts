import {
  Prisma,
  TransactionStatus,
  WithdrawalStatus,
} from "@/generated/prisma/client";
import {
  ANALYTICS_TIME_ZONE,
  buildAnalyticsDailyBuckets,
  formatAnalyticsMoney,
  getAnalyticsDailyWindow,
  type AnalyticsPeriod,
} from "@/lib/analytics-utils";
import { prisma } from "@/lib/prisma";

const PAID_TRANSACTION_STATUSES = [
  TransactionStatus.RESERVED,
  TransactionStatus.LIQUIDATED,
  TransactionStatus.TRANSFERRED,
] as const;

const SETTLED_TRANSACTION_STATUSES = [
  TransactionStatus.LIQUIDATED,
  TransactionStatus.TRANSFERRED,
] as const;

type SummaryRow = {
  gmv: string | null;
  paidTransactions: number | bigint | null;
  platformCommission: string | null;
  netToWorkers: string | null;
  failedTransactions: number | bigint | null;
  refundedTransactions: number | bigint | null;
};

type StatusBreakdownRow = {
  status: TransactionStatus;
  count: number | bigint;
  amount: string | null;
};

type DailyRow = {
  date: string;
  gmv: string | null;
  transactions: number | bigint | null;
};

type TransactionSettlementsRow = {
  liquidatedTransactions: number | bigint | null;
  liquidatedGross: string | null;
  commissionCollected: string | null;
  netLiquidatedToWorkers: string | null;
};

type WithdrawalSettlementsRow = {
  withdrawalsRequested: number | bigint | null;
  withdrawalsApproved: number | bigint | null;
  withdrawalsRejected: number | bigint | null;
  withdrawalsAmountApproved: string | null;
};

function generatedAt(now = new Date()) {
  return now.toISOString();
}

function periodPayload(period: AnalyticsPeriod) {
  return {
    month: period.month,
    start: period.startKey,
    endExclusive: period.endExclusiveKey,
    timeZone: ANALYTICS_TIME_ZONE,
  };
}

function statusListSql(statuses: readonly TransactionStatus[]) {
  return Prisma.join(statuses.map((status) => Prisma.sql`${status}::"TransactionStatus"`));
}

function allTransactionStatuses() {
  return Object.values(TransactionStatus);
}

function allWithdrawalStatuses() {
  return Object.values(WithdrawalStatus);
}

export async function getAnalyticsSummary(period: AnalyticsPeriod, now = new Date()) {
  const rows = await prisma.$queryRaw<SummaryRow[]>(Prisma.sql`
    SELECT
      COALESCE(SUM("amount") FILTER (
        WHERE "status" IN (${statusListSql(PAID_TRANSACTION_STATUSES)})
      ), 0)::text AS "gmv",
      COUNT(*) FILTER (
        WHERE "status" IN (${statusListSql(PAID_TRANSACTION_STATUSES)})
      )::int AS "paidTransactions",
      COALESCE(SUM("commissionAmount") FILTER (
        WHERE "status" IN (${statusListSql(PAID_TRANSACTION_STATUSES)})
      ), 0)::text AS "platformCommission",
      COALESCE(SUM("netAmount") FILTER (
        WHERE "status" IN (${statusListSql(PAID_TRANSACTION_STATUSES)})
      ), 0)::text AS "netToWorkers",
      COUNT(*) FILTER (
        WHERE "status" = ${TransactionStatus.FAILED}::"TransactionStatus"
      )::int AS "failedTransactions",
      COUNT(*) FILTER (
        WHERE "status" = ${TransactionStatus.REFUNDED}::"TransactionStatus"
      )::int AS "refundedTransactions"
    FROM "Transaction"
    WHERE (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date) >= ${period.startKey}::date
      AND (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date) < ${period.endExclusiveKey}::date
  `);

  const row = rows[0];
  const gmv = new Prisma.Decimal(row?.gmv ?? "0");
  const paidTransactions = Number(row?.paidTransactions ?? 0);

  return {
    success: true,
    source: "payments",
    period: periodPayload(period),
    generatedAt: generatedAt(now),
    kpis: {
      gmv: formatAnalyticsMoney(gmv),
      paidTransactions,
      averageTicket: paidTransactions > 0
        ? formatAnalyticsMoney(gmv.div(paidTransactions))
        : "0.00",
      platformCommission: formatAnalyticsMoney(row?.platformCommission),
      netToWorkers: formatAnalyticsMoney(row?.netToWorkers),
      failedTransactions: Number(row?.failedTransactions ?? 0),
      refundedTransactions: Number(row?.refundedTransactions ?? 0),
    },
  };
}

export async function getAnalyticsStatusBreakdown(period: AnalyticsPeriod, now = new Date()) {
  const rows = await prisma.$queryRaw<StatusBreakdownRow[]>(Prisma.sql`
    SELECT
      "status",
      COUNT(*)::int AS "count",
      COALESCE(SUM("amount"), 0)::text AS "amount"
    FROM "Transaction"
    WHERE (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date) >= ${period.startKey}::date
      AND (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date) < ${period.endExclusiveKey}::date
    GROUP BY "status"
  `);

  const rowsByStatus = new Map(rows.map((row) => [row.status, row]));

  return {
    success: true,
    source: "payments",
    period: periodPayload(period),
    generatedAt: generatedAt(now),
    statuses: allTransactionStatuses().map((status) => {
      const row = rowsByStatus.get(status);

      return {
        status,
        count: Number(row?.count ?? 0),
        amount: formatAnalyticsMoney(row?.amount),
      };
    }),
  };
}

export async function getAnalyticsDaily(days: number, now = new Date()) {
  const window = getAnalyticsDailyWindow(days, now);
  const rows = await prisma.$queryRaw<DailyRow[]>(Prisma.sql`
    SELECT
      (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date)::text AS "date",
      COALESCE(SUM("amount"), 0)::text AS "gmv",
      COUNT(*)::int AS "transactions"
    FROM "Transaction"
    WHERE "status" IN (${statusListSql(PAID_TRANSACTION_STATUSES)})
      AND (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date) >= ${window.startKey}::date
      AND (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date) < ${window.endExclusiveKey}::date
    GROUP BY "date"
    ORDER BY "date" ASC
  `);

  return {
    success: true,
    source: "payments",
    days,
    period: {
      start: window.startKey,
      endExclusive: window.endExclusiveKey,
      timeZone: ANALYTICS_TIME_ZONE,
    },
    generatedAt: generatedAt(now),
    buckets: buildAnalyticsDailyBuckets(rows, {
      startKey: window.startKey,
      days,
    }),
  };
}

export async function getAnalyticsSettlementsSummary(period: AnalyticsPeriod, now = new Date()) {
  const [transactionRows, withdrawalRows] = await Promise.all([
    prisma.$queryRaw<TransactionSettlementsRow[]>(Prisma.sql`
      SELECT
        COUNT(*) FILTER (
          WHERE "status" IN (${statusListSql(SETTLED_TRANSACTION_STATUSES)})
        )::int AS "liquidatedTransactions",
        COALESCE(SUM("amount") FILTER (
          WHERE "status" IN (${statusListSql(SETTLED_TRANSACTION_STATUSES)})
        ), 0)::text AS "liquidatedGross",
        COALESCE(SUM("commissionAmount") FILTER (
          WHERE "status" IN (${statusListSql(SETTLED_TRANSACTION_STATUSES)})
        ), 0)::text AS "commissionCollected",
        COALESCE(SUM("netAmount") FILTER (
          WHERE "status" IN (${statusListSql(SETTLED_TRANSACTION_STATUSES)})
        ), 0)::text AS "netLiquidatedToWorkers"
      FROM "Transaction"
      WHERE (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date) >= ${period.startKey}::date
        AND (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date) < ${period.endExclusiveKey}::date
    `),
    prisma.$queryRaw<WithdrawalSettlementsRow[]>(Prisma.sql`
      SELECT
        COUNT(*) FILTER (
          WHERE "status" = ${WithdrawalStatus.REQUESTED}::"WithdrawalStatus"
        )::int AS "withdrawalsRequested",
        COUNT(*) FILTER (
          WHERE "status" = ${WithdrawalStatus.APPROVED}::"WithdrawalStatus"
        )::int AS "withdrawalsApproved",
        COUNT(*) FILTER (
          WHERE "status" = ${WithdrawalStatus.REJECTED}::"WithdrawalStatus"
        )::int AS "withdrawalsRejected",
        COALESCE(SUM("amount") FILTER (
          WHERE "status" = ${WithdrawalStatus.APPROVED}::"WithdrawalStatus"
        ), 0)::text AS "withdrawalsAmountApproved"
      FROM "Withdrawal"
      WHERE (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date) >= ${period.startKey}::date
        AND (("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date) < ${period.endExclusiveKey}::date
    `),
  ]);

  const transactionRow = transactionRows[0];
  const withdrawalRow = withdrawalRows[0];

  return {
    success: true,
    source: "payments",
    period: periodPayload(period),
    generatedAt: generatedAt(now),
    settlements: {
      liquidatedTransactions: Number(transactionRow?.liquidatedTransactions ?? 0),
      liquidatedGross: formatAnalyticsMoney(transactionRow?.liquidatedGross),
      commissionCollected: formatAnalyticsMoney(transactionRow?.commissionCollected),
      netLiquidatedToWorkers: formatAnalyticsMoney(transactionRow?.netLiquidatedToWorkers),
      withdrawalsRequested: Number(withdrawalRow?.withdrawalsRequested ?? 0),
      withdrawalsApproved: Number(withdrawalRow?.withdrawalsApproved ?? 0),
      withdrawalsRejected: Number(withdrawalRow?.withdrawalsRejected ?? 0),
      withdrawalsAmountApproved: formatAnalyticsMoney(withdrawalRow?.withdrawalsAmountApproved),
    },
    withdrawalStatuses: allWithdrawalStatuses(),
  };
}
