import { validateControlPlaneApiKey } from "@/lib/control-plane-auth";
import {
  parseControlPlaneCommissionPayload,
  updateControlPlaneCommission,
} from "@/lib/services/control-plane";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const authError = validateControlPlaneApiKey(request);

  if (authError) {
    return authError;
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      {
        success: false,
        errorCode: "UNSUPPORTED_CONTENT_TYPE",
        message: "La actualizacion de comision solo acepta application/json.",
      },
      { status: 415 },
    );
  }

  const payload = await request.json();
  const input = parseControlPlaneCommissionPayload(payload);

  if (!input) {
    return NextResponse.json(
      {
        success: false,
        errorCode: "INVALID_COMMISSION_PAYLOAD",
        message: "Datos de comision invalidos.",
      },
      { status: 400 },
    );
  }

  const result = await updateControlPlaneCommission(input);

  return NextResponse.json(result);
}
