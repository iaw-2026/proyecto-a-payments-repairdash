import { getAnalyticsMonthPeriod } from "@/lib/analytics-utils";
import { validateControlPlaneApiKey } from "@/lib/control-plane-auth";
import { getAnalyticsStatusBreakdown } from "@/lib/services/analytics";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authError = validateControlPlaneApiKey(request);

  if (authError) {
    return authError;
  }

  const searchParams = new URL(request.url).searchParams;
  const period = getAnalyticsMonthPeriod(searchParams);
  const breakdown = await getAnalyticsStatusBreakdown(period);

  return NextResponse.json(breakdown);
}
