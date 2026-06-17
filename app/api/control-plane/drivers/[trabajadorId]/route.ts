import { validateControlPlaneApiKey } from "@/lib/control-plane-auth";
import {
  getControlPlaneDriverDetail,
  getControlPlaneRecentLimit,
} from "@/lib/services/control-plane";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ trabajadorId: string }> },
) {
  const authError = validateControlPlaneApiKey(request);

  if (authError) {
    return authError;
  }

  const { trabajadorId } = await context.params;
  const searchParams = new URL(request.url).searchParams;
  const detail = await getControlPlaneDriverDetail(
    trabajadorId,
    getControlPlaneRecentLimit(searchParams),
  );

  if (!detail) {
    return NextResponse.json(
      {
        success: false,
        errorCode: "DRIVER_NOT_FOUND",
        message: "El trabajador no existe en Payments.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(detail);
}
