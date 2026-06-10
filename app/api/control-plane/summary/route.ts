import { validateControlPlaneApiKey } from "@/lib/control-plane-auth";
import { getControlPlaneSummary } from "@/lib/services/control-plane";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authError = validateControlPlaneApiKey(request);

  if (authError) {
    return authError;
  }

  const summary = await getControlPlaneSummary();

  return NextResponse.json(summary);
}
