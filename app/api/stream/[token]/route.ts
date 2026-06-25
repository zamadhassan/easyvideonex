import { NextRequest, NextResponse } from "next/server";
import { consumeToken } from "@/lib/one-time-download";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";

  const entry = consumeToken(token, ip);
  if (!entry) {
    return NextResponse.json({ error: "Download link expired or invalid" }, { status: 410 });
  }

  return NextResponse.redirect(entry.redirectUrl, {
    headers: {
      "Cache-Control": "no-store",
      "X-One-Time-Download": "true",
    },
  });
}
