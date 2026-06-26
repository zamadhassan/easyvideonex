import { NextResponse } from "next/server";

const payload = {
  pong: true,
  version: "download-fallback-2026-06-25",
  vercel: process.env.VERCEL === "1",
  backendConfigured: Boolean(process.env.BACKEND_API_URL),
};

export async function POST() {
  return NextResponse.json(payload);
}

export async function GET() {
  return NextResponse.json(payload);
}
