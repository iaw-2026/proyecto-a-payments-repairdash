import { runPendingLiquidations } from "@/lib/services/liquidations";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length);
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  const headerSecret = request.headers.get("x-cron-secret") ?? getBearerToken(request);
  return headerSecret === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runPendingLiquidations();

  return NextResponse.json({
    processedCount: summary.processedCount,
    grossTotal: summary.grossTotal.toFixed(2),
    commissionTotal: summary.commissionTotal.toFixed(2),
    netTotal: summary.netTotal.toFixed(2),
  });
}
