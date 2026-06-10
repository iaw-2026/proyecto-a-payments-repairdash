import { validateControlPlaneApiKey } from "@/lib/control-plane-auth";
import {
  getControlPlaneDateFilters,
  getControlPlanePagination,
  getControlPlaneWithdrawals,
} from "@/lib/services/control-plane";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authError = validateControlPlaneApiKey(request);

  if (authError) {
    return authError;
  }

  const searchParams = new URL(request.url).searchParams;
  const filters = getControlPlaneDateFilters(searchParams);
  const pagination = getControlPlanePagination(searchParams);
  const withdrawals = await getControlPlaneWithdrawals(filters, pagination);

  return NextResponse.json(withdrawals);
}
