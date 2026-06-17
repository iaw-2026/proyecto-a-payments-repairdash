import { validateInternalApiKey } from "@/lib/internal-auth";
import { getWorkerWalletSummary } from "@/lib/services/balances";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{ trabajadorId: string }> }) {
  const authError = validateInternalApiKey(request);

  if (authError) {
    return authError;
  }

  const { trabajadorId } = await context.params;
  const wallet = await getWorkerWalletSummary(trabajadorId);

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  return NextResponse.json(wallet);
}
