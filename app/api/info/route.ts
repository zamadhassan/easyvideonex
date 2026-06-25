import { NextRequest, NextResponse } from "next/server";
import { detectPlatform } from "@/lib/url-detector";
import { validateUrl } from "@/lib/url-validator";
import { checkRateLimit } from "@/lib/rate-limiter";
import { fetchVideoInfo } from "@/lib/platform-api";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please wait a moment before trying again.",
        },
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_URL",
            message: "Please provide a valid URL.",
          },
        },
        { status: 400 }
      );
    }

    const validation = validateUrl(url);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const detected = detectPlatform(url);
    if (!detected) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNSUPPORTED_URL",
            message: "This URL is not from a supported platform.",
          },
        },
        { status: 400 }
      );
    }

    const videoInfo = await fetchVideoInfo(
      url,
      detected.platform,
      detected.videoId
    );

    return NextResponse.json({ success: true, data: videoInfo });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}
