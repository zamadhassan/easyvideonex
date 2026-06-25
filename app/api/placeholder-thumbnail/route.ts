import { NextRequest, NextResponse } from "next/server";

const SVG_TEMPLATE = (platform: string) => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1f2937"/>
        <stop offset="100%" style="stop-color:#111827"/>
      </linearGradient>
    </defs>
    <rect width="480" height="360" fill="url(#bg)"/>
    <circle cx="240" cy="140" r="50" fill="#374151"/>
    <polygon points="225,120 225,160 255,140" fill="#6b7280"/>
    <text x="240" y="230" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="#6b7280" text-anchor="middle">${platform}</text>
    <text x="240" y="260" font-family="system-ui,sans-serif" font-size="14" fill="#4b5563" text-anchor="middle">No Thumbnail Available</text>
  </svg>`
)}`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "Video";
  const displayName = platform.charAt(0).toUpperCase() + platform.slice(1).replace("-", " ");

  const svg = SVG_TEMPLATE(displayName);
  const response = await fetch(svg);
  const blob = await response.blob();

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
