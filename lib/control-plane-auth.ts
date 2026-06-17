import { NextResponse } from "next/server";

export function validateControlPlaneApiKey(request: Request) {
  const expectedApiKey = process.env.CONTROL_PLANE_API_KEY;

  if (!expectedApiKey) {
    return NextResponse.json(
      {
        success: false,
        errorCode: "CONTROL_PLANE_AUTH_NOT_CONFIGURED",
        message: "La autenticacion de Control Plane no esta configurada.",
      },
      { status: 500 },
    );
  }

  const providedApiKey = request.headers.get("x-control-plane-api-key");

  if (providedApiKey !== expectedApiKey) {
    return NextResponse.json(
      {
        success: false,
        errorCode: "UNAUTHORIZED",
        message: "API key de Control Plane invalida o ausente.",
      },
      { status: 401 },
    );
  }

  return null;
}
