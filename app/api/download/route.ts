import { NextRequest, NextResponse } from "next/server";
import { execFileSync } from "child_process";
import path from "path";
import { validateUrl } from "@/lib/url-validator";
import { checkRateLimit } from "@/lib/rate-limiter";
import { detectPlatform } from "@/lib/url-detector";
import { ERROR_MESSAGES } from "@/lib/constants";
import { createToken } from "@/lib/one-time-download";
import type { Platform } from "@/lib/types";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "";
const PYTHON_SCRIPT = path.join(process.cwd(), "backend-api", "get_url.py");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

async function tryFetchJson(url: string, timeout = 10000): Promise<Record<string, unknown> | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json, text/plain, */*" },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) return null;
  const text = await res.text();
  try { return JSON.parse(text); } catch { return null; }
}

function getStr(data: Record<string, unknown> | null, ...keys: string[]): string | null {
  if (!data) return null;
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "string") return v;
  }
  return null;
}

function getArr(data: Record<string, unknown> | null, key: string): Record<string, unknown>[] | null {
  if (!data) return null;
  const v = data[key];
  if (Array.isArray(v)) return v as Record<string, unknown>[];
  return null;
}

function findInArray(arr: Record<string, unknown>[] | null, key: string, val: string): Record<string, unknown> | null {
  if (!arr) return null;
  for (const item of arr) {
    const v = item[key];
    if (typeof v === "string" && v.includes(val)) return item;
  }
  return null;
}

function getFirstUrl(arr: Record<string, unknown>[] | null): string | null {
  if (!arr || arr.length === 0) return null;
  const v = arr[0].url;
  return typeof v === "string" ? v : null;
}

async function getYouTubeUrl(videoId: string, quality: string): Promise<string | null> {
  const q = quality === "1080p" ? "1080" : quality === "720p" ? "720" : quality === "480p" ? "480" : quality === "360p" ? "360" : "720";

  const strategies = [
    async () => getStr(await tryFetchJson(`https://yt-api.com/api/download?id=${videoId}&quality=${q}`), "downloadUrl", "url", "download_url"),
    async () => {
      const data = await tryFetchJson(`https://yt-api.com/api/download?id=${videoId}`);
      const dl = getStr(data, "downloadUrl", "url", "download_url");
      if (dl) return dl;
      const formats = getArr(data, "formats");
      if (formats) {
        const match = findInArray(formats, "qualityLabel", quality.replace("p", ""));
        if (match) return getStr(match, "url");
        return getFirstUrl(formats);
      }
      return null;
    },
    async () => {
      const data = await tryFetchJson(`https://inv.nadeko.net/api/v1/videos/${videoId}`, 8000);
      const streams = getArr(data, "formatStreams");
      if (streams) {
        const match = findInArray(streams, "quality", quality.replace("p", ""));
        if (match) return getStr(match, "url");
        return getFirstUrl(streams);
      }
      return null;
    },
    async () => {
      const data = await tryFetchJson(`https://yewtu.be/api/v1/videos/${videoId}`, 8000);
      const streams = getArr(data, "formatStreams");
      if (streams) {
        const match = findInArray(streams, "quality", quality.replace("p", ""));
        if (match) return getStr(match, "url");
        return getFirstUrl(streams);
      }
      return null;
    },
    async () => {
      const data = await tryFetchJson(`https://pipedapi.kavin.rocks/streams/${videoId}`, 8000);
      const vs = getArr(data, "videoStreams");
      if (vs) {
        const match = findInArray(vs, "quality", quality.replace("p", ""));
        if (match) return getStr(match, "url");
        return getFirstUrl(vs);
      }
      const as = getArr(data, "audioStreams");
      return getFirstUrl(as);
    },
  ];

  for (const strat of strategies) {
    try {
      const url = await strat();
      if (url) return url;
    } catch {}
  }
  return null;
}

async function getTikTokUrl(videoUrl: string): Promise<string | null> {
  try {
    const data = await tryFetchJson(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
    if (!data) return null;
    const d = data.data;
    const dlUrl = (d && typeof d === "object" ? (d as Record<string, unknown>).play || (d as Record<string, unknown>).wmplay : null) || data.url;
    if (typeof dlUrl === "string") return dlUrl.startsWith("http") ? dlUrl : `https:${dlUrl}`;
  } catch {}
  return null;
}

async function getPythonUrl(videoUrl: string, quality: string, format: string): Promise<string | null> {
  try {
    const result = execFileSync("python", [PYTHON_SCRIPT, videoUrl, quality, format], {
      timeout: 60000,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    const data = JSON.parse(result.trim());
    if (data.success && data.downloadUrl) return data.downloadUrl;
    return null;
  } catch { return null; }
}

async function tryBackend(url: string, body: Record<string, string>, timeout = 55000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.downloadUrl || data.data?.downloadUrl || null;
  } catch { return null; }
}

async function getVideoDownloadUrl(videoUrl: string, platform: Platform, quality: string, format: string, videoId: string): Promise<string | null> {
  // 1) Try local Python (yt-dlp) script first (fastest, most reliable)
  if (!BACKEND_API_URL) {
    const pyUrl = await getPythonUrl(videoUrl, quality, format);
    if (pyUrl) return pyUrl;
  }

  // 2) Try remote backend (Render/Railway)
  if (BACKEND_API_URL) {
    const body = { url: videoUrl, platform, quality, format, videoId };
    const beUrl = await tryBackend(`${BACKEND_API_URL}/api/download`, body, 55000);
    if (beUrl) return beUrl;
  }

  // 3) Fallback: JS strategies
  if (platform === "youtube" || platform === "youtube-shorts") {
    return getYouTubeUrl(videoId, quality);
  }

  if (platform === "tiktok") {
    return getTikTokUrl(videoUrl);
  }

  return null;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: ERROR_MESSAGES.RATE_LIMITED } }, { status: 429 });
  }

  let body: { url?: string; quality?: string; format?: string; videoId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: { code: "INVALID_URL", message: "Invalid request body." } }, { status: 400 });
  }

  const { url, quality, format, videoId: rawVideoId } = body;
  if (!url || !quality || !format) {
    return NextResponse.json({ success: false, error: { code: "INVALID_URL", message: "Missing required parameters." } }, { status: 400 });
  }

  const validation = validateUrl(url);
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
  }

  const detected = detectPlatform(url);
  if (!detected) {
    return NextResponse.json({ success: false, error: { code: "UNSUPPORTED_URL", message: "Unsupported URL." } }, { status: 400 });
  }

  const platform = detected.platform;
  const videoId = rawVideoId || detected.videoId;

  const dlUrl = await getVideoDownloadUrl(url, platform, quality, format, videoId);
  if (!dlUrl) {
    return NextResponse.json({ success: false, error: { code: "NO_MEDIA", message: "Could not retrieve a download URL for this video." } }, { status: 404 });
  }

  const ext = format === "mp3" || format === "m4a" ? `.${format}` : ".mp4";
  const fileName = `video-${quality}${ext}`;

  const token = createToken(dlUrl, ip, fileName);

  return NextResponse.json({ success: true, downloadUrl: `/api/stream/${token}` });
}

export async function GET() {
  return NextResponse.json({ success: false, error: { code: "UNSUPPORTED_URL", message: "Use POST to request a download." } }, { status: 405 });
}
