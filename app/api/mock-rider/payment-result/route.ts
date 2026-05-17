import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  const expectedApiKey = process.env.REPAIRDASH_API_KEY?.trim() || process.env.RIDER_CALLBACK_API_KEY?.trim();
  const payload = await request.json();

  if (expectedApiKey && apiKey !== expectedApiKey) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.id_viaje !== "number" ||
    !Number.isSafeInteger(payload.id_viaje) ||
    (payload.estado !== "aceptado" && payload.estado !== "cancelado")
  ) {
    return NextResponse.json({ message: "Estado no valido" }, { status: 400 });
  }

  // TODO: Borrar este endpoint cuando Rider App exponga su callback real.
  // Sirve solo para probar que Payments envia el PUT con el estado del pago.
  console.log("Mock Rider statepayment callback", {
    apiKey,
    payload,
  });

  const message = payload.estado === "aceptado" ? "Viaje aceptado" : "Viaje cancelado";

  return NextResponse.json({ message });
}
