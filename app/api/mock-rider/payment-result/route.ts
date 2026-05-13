import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-internal-api-key");
  const payload = await request.json();

  // TODO: Borrar este endpoint cuando Rider App exponga su callback real.
  // Sirve solo para probar que Payments envia el POST con el resultado del pago.
  console.log("Mock Rider payment result callback", {
    apiKey,
    payload,
  });

  return NextResponse.json({ ok: true });
}
