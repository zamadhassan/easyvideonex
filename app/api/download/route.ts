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
const IS_VERCEL = process.env.VERCEL === "1";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

interface DownloadLookupResult {
  downloadUrl: string | null;
  errors: string[];
}

interface BackendAttemptResult {
  downloadUrl: string | null;
  error: string | null;
}

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

function getErrorMessage(value: unknown): string {
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const nestedError = record.error;
    if (nestedError && typeof nestedError === "object") {
      const message = (nestedError as Record<string, unknown>).message;
      if (typeof message === "string") return message;
    }
    const detail = record.detail;
    if (typeof detail === "string") return detail;
    const message = record.message;
    if (typeof message === "string") return message;
  }
  return "Unknown extractor error";
}

async function tryBackend(url: string, body: Record<string, string>, timeout = 55000): Promise<BackendAttemptResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { downloadUrl: null, error: getErrorMessage(data) };
    const downloadUrl = data.downloadUrl || data.data?.downloadUrl || null;
    return { downloadUrl, error: downloadUrl ? null : getErrorMessage(data) };
  } catch (err) {
    return { downloadUrl: null, error: err instanceof Error ? err.message : "Extractor request failed" };
  }
}

async function getVideoDownloadUrl(videoUrl: string, platform: Platform, quality: string, format: string, videoId: string, origin: string): Promise<DownloadLookupResult> {
  const body = { url: videoUrl, platform, quality, format, videoId };
  const errors: string[] = [];

  // 1) Try local Python (yt-dlp) script first in local development.
  if (!BACKEND_API_URL && !IS_VERCEL) {
    const pyUrl = await getPythonUrl(videoUrl, quality, format);
    if (pyUrl) return { downloadUrl: pyUrl, errors };
    errors.push("local-python: no URL returned");
  }

  // 2) Try Vercel Python function before hosted backends in production.
  // Hugging Face free Spaces are often blocked by YouTube/TikTok datacenter rules.
  if (origin && IS_VERCEL) {
    const attempt = await tryBackend(`${origin}/api/extract`, body, 55000);
    if (attempt.downloadUrl) return { downloadUrl: attempt.downloadUrl, errors };
    if (attempt.error) errors.push(`vercel-python: ${attempt.error}`);
  }

  // 3) Try hosted backend (Hugging Face/Render/etc.)
  if (BACKEND_API_URL) {
    const attempt = await tryBackend(`${BACKEND_API_URL}/api/download`, body, 55000);
    if (attempt.downloadUrl) return { downloadUrl: attempt.downloadUrl, errors };
    if (attempt.error) errors.push(`hosted-backend: ${attempt.error}`);
  }

  // 4) Try Vercel Python function as a final hosted fallback outside Vercel.
  if (origin && !IS_VERCEL) {
    const attempt = await tryBackend(`${origin}/api/extract`, body, 55000);
    if (attempt.downloadUrl) return { downloadUrl: attempt.downloadUrl, errors };
    if (attempt.error) errors.push(`vercel-python: ${attempt.error}`);
  }

  // 5) Fallback: JS strategies
  if (platform === "youtube" || platform === "youtube-shorts") {
    const fallbackUrl = await getYouTubeUrl(videoId, quality);
    if (fallbackUrl) return { downloadUrl: fallbackUrl, errors };
    errors.push("youtube-js-fallback: no URL returned");
    return { downloadUrl: null, errors };
  }

  if (platform === "tiktok") {
    const fallbackUrl = await getTikTokUrl(videoUrl);
    if (fallbackUrl) return { downloadUrl: fallbackUrl, errors };
    errors.push("tiktok-js-fallback: no URL returned");
    return { downloadUrl: null, errors };
  }

  errors.push(`${platform}: no fallback available`);
  return { downloadUrl: null, errors };
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

  const lookup = await getVideoDownloadUrl(url, platform, quality, format, videoId, request.nextUrl.origin);
  if (!lookup.downloadUrl) {
    const debug = request.nextUrl.searchParams.get("debug") === "1";
    return NextResponse.json({
      success: false,
      error: {
        code: "NO_MEDIA",
        message: `Could not retrieve a download URL for this ${platform} video. Public YouTube videos are currently working; this link may be private, region-blocked, removed, or blocked by the source platform.`,
      },
      ...(debug ? { debug: { platform, videoId, errors: lookup.errors } } : {}),
    }, { status: 404 });
  }

  const ext = format === "mp3" || format === "m4a" ? `.${format}` : ".mp4";
  const fileName = `video-${quality}${ext}`;

  const token = createToken(lookup.downloadUrl, ip, fileName);

  return NextResponse.json({ success: true, downloadUrl: `/api/stream/${token}` });
}

export async function GET() {
  return NextResponse.json({ success: false, error: { code: "UNSUPPORTED_URL", message: "Use POST to request a download." } }, { status: 405 });
}
