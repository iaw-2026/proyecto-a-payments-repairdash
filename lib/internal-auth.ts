import { NextResponse } from "next/server";

export function validateInternalApiKey(request: Request) {
  const expectedApiKey = process.env.PAYMENTS_INTERNAL_API_KEY;

  if (!expectedApiKey) {
    return NextResponse.json(
      {
        success: false,
        errorCode: "INTERNAL_AUTH_NOT_CONFIGURED",
        message: "La autenticación interna de Payments no está configurada.",
      },
      { status: 500 },
    );
  }

  const providedApiKey = request.headers.get("x-internal-api-key");

  if (providedApiKey !== expectedApiKey) {
    return NextResponse.json(
      {
        success: false,
        errorCode: "UNAUTHORIZED",
        message: "API key interna inválida o ausente.",
      },
      { status: 401 },
    );
  }

  return null;
}
