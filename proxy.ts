import { NextResponse } from "next/server";

export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/rider/:path*", "/driver/:path*"],
};