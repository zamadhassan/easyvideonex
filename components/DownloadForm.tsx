"use client";

import { useState, useCallback, useMemo } from "react";
import { detectPlatform } from "@/lib/url-detector";
import { validateUrl } from "@/lib/url-validator";
import { fetchVideoInfo } from "@/lib/platform-api";
import { PLATFORMS, ERROR_MESSAGES } from "@/lib/constants";
import VideoInfoCard from "./VideoInfoCard";
import ErrorDisplay from "./ErrorDisplay";
import Disclaimer from "./Disclaimer";
import PlatformIcon from "./PlatformIcon";
import type { VideoInfo, ErrorCode } from "@/lib/types";

const platformStyles: Record<string, string> = {
  youtube: "bg-red-500",
  "youtube-shorts": "bg-red-500",
  tiktok: "bg-white/10 text-white border border-white/20",
  facebook: "bg-blue-500",
  instagram: "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500",
  twitter: "bg-black border border-gray-600",
  vimeo: "bg-blue-400",
  pinterest: "bg-red-600",
  reddit: "bg-orange-500",
};

export default function DownloadForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [error, setError] = useState<{ code: ErrorCode; message: string } | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const detectedPlatform = useMemo(() => {
    if (!url.trim()) return null;
    const val = validateUrl(url.trim());
    if (!val.valid) return null;
    return detectPlatform(url.trim());
  }, [url]);

  const detectedPlatformInfo = useMemo(() => {
    if (!detectedPlatform) return null;
    return PLATFORMS.find((p) => p.id === detectedPlatform.platform) || null;
  }, [detectedPlatform]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setVideoInfo(null);

      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        setError({ code: "INVALID_URL", message: ERROR_MESSAGES.INVALID_URL });
        return;
      }

      const validation = validateUrl(trimmedUrl);
      if (!validation.valid && validation.error) {
        setError(validation.error);
        return;
      }

      const detected = detectPlatform(trimmedUrl);
      if (!detected) {
        setError({ code: "UNSUPPORTED_URL", message: ERROR_MESSAGES.UNSUPPORTED_URL });
        return;
      }

      setShowDisclaimer(true);
      setLoading(true);

      try {
        const info = await fetchVideoInfo(trimmedUrl, detected.platform, detected.videoId);
        setVideoInfo(info);
      } catch (err) {
        const message = err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR;
        const code: ErrorCode =
          message === ERROR_MESSAGES.PRIVATE_VIDEO ? "PRIVATE_VIDEO"
            : message === ERROR_MESSAGES.NO_MEDIA ? "NO_MEDIA"
            : message === ERROR_MESSAGES.SERVER_TIMEOUT ? "SERVER_TIMEOUT"
            : "UNKNOWN_ERROR";
        setError({ code, message });
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <form onSubmit={handleSubmit}>
        <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-3 p-[2px] bg-gradient-to-r from-yellow-400/30 via-yellow-400/15 to-yellow-400/30 rounded-2xl">
          <div className="relative flex-1 bg-gray-900 rounded-xl">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
                setVideoInfo(null);
                setShowDisclaimer(false);
              }}
              placeholder="Paste video link here..."
              className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400/40 focus:ring-1 focus:ring-yellow-400/20 text-sm sm:text-base transition-all"
              disabled={loading}
              autoComplete="off"
              autoFocus
            />

            {detectedPlatformInfo && !videoInfo && !error && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 hidden sm:inline">{detectedPlatformInfo.name}</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${platformStyles[detectedPlatformInfo.id] || "bg-gray-600"}`}
                >
                  <PlatformIcon platform={detectedPlatformInfo.id} className="w-2.5 h-2.5" />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap shadow-lg shadow-yellow-400/15 hover:shadow-yellow-400/25 active:scale-[0.97]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Processing</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Get Options</span>
              </span>
            )}
          </button>
        </div>

        {detectedPlatformInfo && !videoInfo && !error && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
            <svg className="w-3 h-3 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Detected: <span className="text-yellow-400 font-medium">{detectedPlatformInfo.name}</span>
          </div>
        )}
      </form>

      {showDisclaimer && <div className="mt-4 sm:mt-5"><Disclaimer /></div>}

      {loading && !videoInfo && (
        <div className="mt-5 sm:mt-6 animate-fadeIn">
          <div className="bg-gray-900 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg animate-shimmer shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 w-16 animate-shimmer rounded" />
                <div className="h-4 w-48 sm:w-64 animate-shimmer rounded" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-full sm:w-56 aspect-video rounded-lg animate-shimmer" />
              <div className="flex-1 space-y-2.5">
                <div className="h-3.5 w-28 animate-shimmer rounded" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-20 animate-shimmer rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 sm:mt-5 animate-fadeIn">
          <ErrorDisplay code={error.code} message={error.message} />
        </div>
      )}

      {videoInfo && (
        <div className="mt-5 sm:mt-6 animate-fadeIn">
          <VideoInfoCard info={videoInfo} />
        </div>
      )}
    </div>
  );
}
