import { validateControlPlaneApiKey } from "@/lib/control-plane-auth";
import {
  getControlPlaneDrivers,
  getControlPlanePagination,
  getControlPlaneQueryFilter,
} from "@/lib/services/control-plane";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authError = validateControlPlaneApiKey(request);

  if (authError) {
    return authError;
  }

  const searchParams = new URL(request.url).searchParams;
  const filters = getControlPlaneQueryFilter(searchParams);
  const pagination = getControlPlanePagination(searchParams);
  const drivers = await getControlPlaneDrivers(filters, pagination);

  return NextResponse.json(drivers);
}
