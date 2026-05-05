import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, message: "Dispute endpoint placeholder" }, { status: 501 });
}