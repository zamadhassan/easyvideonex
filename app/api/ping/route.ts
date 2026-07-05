import { NextResponse } from "next/server";

const payload = {
  pong: true,
  version: "download-audit-android-client-2026-07-05",
  vercel: process.env.VERCEL === "1",
  backendConfigured: Boolean(process.env.BACKEND_API_URL),
};

export async function POST() {
  return NextResponse.json(payload);
}

export async function GET() {
  return NextResponse.json(payload);
}
