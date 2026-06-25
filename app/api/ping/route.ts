import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ pong: true });
}

export async function GET() {
  return NextResponse.json({ pong: true });
}
