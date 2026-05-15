import { validateInternalApiKey } from "@/lib/internal-auth";
import { CheckoutError, createCheckout } from "@/lib/services/checkout";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

function getBaseUrl(request: Request) {
  const configuredUrl = process.env.APP_URL?.trim();

  if (!configuredUrl) {
    return new URL(request.url).origin;
  }

  const absoluteUrl = /^https?:\/\//i.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl}`;

  return new URL(absoluteUrl).origin;
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

    const baseUrl = getBaseUrl(request);
    const body = await request.json();
    const checkout = await createCheckout(body, baseUrl);
    const redirectUrl = buildRiderConfirmationUrl(baseUrl, checkout.transactionId).toString();

    return NextResponse.json(
      {
        success: checkout.success,
        transactionId: checkout.transactionId,
        trabajoId: checkout.trabajoId,
        redirectUrl,
      },
      { status: 201 },
    );
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
