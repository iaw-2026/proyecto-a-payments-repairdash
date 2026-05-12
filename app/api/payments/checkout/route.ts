import { validateInternalApiKey } from "@/lib/internal-auth";
import { CheckoutError, createCheckout } from "@/lib/services/checkout";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

function getBaseUrl(request: Request) {
  const configuredUrl = process.env.APP_URL?.trim();

  if (!configuredUrl) {
    return new URL(request.url).origin;
  }

  return /^https?:\/\//i.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`;
}

function buildRiderConfirmationUrl(baseUrl: string, transactionId: string) {
  const url = new URL("/rider", baseUrl);
  url.searchParams.set("transactionId", transactionId);

  return url;
}

export async function POST(request: Request) {
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
          message: "El checkout externo solo acepta application/json.",
        },
        { status: 415 },
      );
    }

    const body = await request.json();
    const checkout = await createCheckout(body, getBaseUrl(request));

    return NextResponse.redirect(buildRiderConfirmationUrl(getBaseUrl(request), checkout.transactionId), { status: 303 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INVALID_CHECKOUT_PAYLOAD",
          message: error.issues[0]?.message ?? "Datos de checkout inválidos.",
        },
        { status: 400 },
      );
    }

    if (error instanceof CheckoutError) {
      return NextResponse.json(
        {
          success: false,
          errorCode: error.errorCode,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }

    console.error("Checkout creation failed", error);

    return NextResponse.json(
      {
        success: false,
        errorCode: "CHECKOUT_CREATION_FAILED",
        message: "No se pudo crear el checkout.",
      },
      { status: 500 },
    );
  }
}
