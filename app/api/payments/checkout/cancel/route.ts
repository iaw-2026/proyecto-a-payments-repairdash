import { validateInternalApiKey } from "@/lib/internal-auth";
import { cancelCheckout } from "@/lib/services/checkout";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function PUT(request: Request) {
  const authError = validateInternalApiKey(request);

  if (authError) {
    return authError;
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "UNSUPPORTED_CONTENT_TYPE",
          message: "La cancelacion de checkout solo acepta application/json.",
        },
        { status: 415 },
      );
    }

    const body = await request.json();
    const result = await cancelCheckout(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INVALID_CANCEL_CHECKOUT_PAYLOAD",
          message: error.issues[0]?.message ?? "Datos de cancelacion invalidos.",
        },
        { status: 400 },
      );
    }

    console.error("Checkout cancellation failed", error);

    return NextResponse.json(
      {
        success: false,
        errorCode: "CHECKOUT_CANCELLATION_FAILED",
        message: "No se pudo cancelar el checkout.",
      },
      { status: 500 },
    );
  }
}
