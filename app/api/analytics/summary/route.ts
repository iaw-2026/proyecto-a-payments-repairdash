import { validateControlPlaneApiKey } from "@/lib/control-plane-auth";
import { getAnalyticsMonthPeriod } from "@/lib/analytics-utils";
import { getAnalyticsSummary } from "@/lib/services/analytics";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authError = validateControlPlaneApiKey(request);

  if (authError) {
    return authError;
  }

  const searchParams = new URL(request.url).searchParams;
  const period = getAnalyticsMonthPeriod(searchParams);
  const summary = await getAnalyticsSummary(period);

  return NextResponse.json(summary);
}
