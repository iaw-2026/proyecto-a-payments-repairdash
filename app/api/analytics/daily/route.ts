import { getAnalyticsDays } from "@/lib/analytics-utils";
import { validateControlPlaneApiKey } from "@/lib/control-plane-auth";
import { getAnalyticsDaily } from "@/lib/services/analytics";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authError = validateControlPlaneApiKey(request);

  if (authError) {
    return authError;
  }

  const searchParams = new URL(request.url).searchParams;
  const days = getAnalyticsDays(searchParams);
  const daily = await getAnalyticsDaily(days);

  return NextResponse.json(daily);
}
