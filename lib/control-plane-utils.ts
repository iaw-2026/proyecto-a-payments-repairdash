import { Prisma } from "@/generated/prisma/client";
import type { AdminDateFilters } from "@/lib/services/admin";

export const CONTROL_PLANE_DEFAULT_PAGE = 1;
export const CONTROL_PLANE_DEFAULT_PAGE_SIZE = 10;
export const CONTROL_PLANE_MAX_PAGE_SIZE = 50;
const CONTROL_PLANE_DEFAULT_RECENT_LIMIT = 5;
const CONTROL_PLANE_MAX_RECENT_LIMIT = 20;

export type ControlPlanePagination = {
  page: number;
  pageSize: number;
};

export type ControlPlaneCommissionInput = {
  commissionRate: Prisma.Decimal;
  actorClerkId: string;
  actorEmail: string;
  reason: string;
};

function firstSearchValue(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePositiveInt(value: string | null, fallback: number) {
  if (value === null || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.floor(parsed));
}

export function getControlPlanePagination(searchParams: URLSearchParams): ControlPlanePagination {
  return {
    page: parsePositiveInt(searchParams.get("page"), CONTROL_PLANE_DEFAULT_PAGE),
    pageSize: Math.min(
      parsePositiveInt(searchParams.get("pageSize"), CONTROL_PLANE_DEFAULT_PAGE_SIZE),
      CONTROL_PLANE_MAX_PAGE_SIZE,
    ),
  };
}

export function getControlPlaneDateFilters(searchParams: URLSearchParams): AdminDateFilters {
  return {
    q: firstSearchValue(searchParams.get("q")),
    status: firstSearchValue(searchParams.get("status")),
    from: firstSearchValue(searchParams.get("from")),
    to: firstSearchValue(searchParams.get("to")),
  };
}

export function getControlPlaneQueryFilter(searchParams: URLSearchParams) {
  return {
    q: firstSearchValue(searchParams.get("q")),
  };
}

export function getControlPlaneRecentLimit(searchParams: URLSearchParams) {
  return Math.min(
    parsePositiveInt(searchParams.get("recentLimit"), CONTROL_PLANE_DEFAULT_RECENT_LIMIT),
    CONTROL_PLANE_MAX_RECENT_LIMIT,
  );
}

export function parseControlPlaneCommissionPayload(payload: unknown): ControlPlaneCommissionInput | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const body = payload as Record<string, unknown>;
  const rawRate = body.commissionRate;
  const actorClerkId = typeof body.actorClerkId === "string" ? body.actorClerkId.trim() : "";
  const actorEmail = typeof body.actorEmail === "string" ? body.actorEmail.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (typeof rawRate !== "string" || !actorClerkId || !actorEmail || !reason) {
    return null;
  }

  const normalizedRate = rawRate.trim().replace(",", ".");

  if (!/^\d{1,3}(\.\d{1,2})?$/.test(normalizedRate)) {
    return null;
  }

  const commissionRate = new Prisma.Decimal(normalizedRate);

  if (commissionRate.lessThan(0) || commissionRate.greaterThan(100)) {
    return null;
  }

  return {
    commissionRate,
    actorClerkId,
    actorEmail,
    reason,
  };
}
