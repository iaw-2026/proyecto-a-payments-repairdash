import { CheckoutError, processMercadoPagoPaymentById } from "@/lib/services/checkout";
import { NextResponse } from "next/server";

function extractPaymentId(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const event = payload as {
    data?: { id?: string | number };
    type?: string;
    topic?: string;
  };

  const eventType = event.type ?? event.topic;

  if (eventType && eventType !== "payment") {
    return null;
  }

  return event.data?.id ? String(event.data.id) : null;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const paymentId = extractPaymentId(payload);

    if (!paymentId) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const result = await processMercadoPagoPaymentById(paymentId);

    return NextResponse.json({
      success: true,
      transactionId: result.transaction.id,
      trabajoId: result.transaction.trabajoId,
      riderCallbackPayload: result.callbackPayload,
    });
  } catch (error) {
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

    console.error("Mercado Pago webhook failed", error);

    return NextResponse.json(
      {
        success: false,
        errorCode: "WEBHOOK_PROCESSING_FAILED",
        message: "No se pudo procesar el webhook de Mercado Pago.",
      },
      { status: 500 },
    );
  }
}
