"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { VideoInfo, ErrorCode } from "@/lib/types";
import { getDownloadUrl } from "@/lib/platform-api";
import ErrorDisplay from "./ErrorDisplay";
import PlatformIcon from "./PlatformIcon";

interface VideoInfoCardProps {
  info: VideoInfo;
}

export default function VideoInfoCard({ info }: VideoInfoCardProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<{ code: ErrorCode; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const handleDownload = useCallback(
    async (quality: string, format: string) => {
      setDownloadError(null);
      setDownloading(`${quality}-${format}`);
      try {
        const downloadUrl = await getDownloadUrl(info.url, info.platform, "", quality, format);
        if (downloadUrl) {
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `${info.title}-${quality}.${format}`;
          a.target = "_blank";
          a.click();
        } else {
          setDownloadError({ code: "NO_MEDIA", message: "Could not retrieve a download URL. Try a different quality." });
        }
      } catch (err) {
        setDownloadError({ code: "UNKNOWN_ERROR", message: err instanceof Error ? err.message : "Download failed." });
      } finally {
        setDownloading(null);
      }
    },
    [info.url, info.platform, info.title]
  );

  const handleCopyTitle = useCallback(() => {
    navigator.clipboard.writeText(info.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [info.title]);

  const handleDownloadThumbnail = useCallback(async () => {
    try {
      const r = await fetch(info.thumbnail);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thumbnail-${info.platform}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(info.thumbnail, "_blank");
    }
  }, [info.thumbnail, info.platform]);

  const qualityLabels: Record<string, string> = {
    "1080p": "1080p HD",
    "720p": "720p HD",
    "480p": "480p SD",
    "360p": "360p",
    "240p": "240p",
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-4 sm:mb-5">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black shrink-0">
            <PlatformIcon platform={info.platform} className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] sm:text-xs font-medium text-yellow-400 uppercase tracking-wider">
                {info.platformDisplay}
              </span>
              {info.duration && info.duration !== "0:00" && (
                <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {info.duration}
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-white truncate">{info.title}</h2>
          </div>

          <button
            onClick={handleCopyTitle}
            className="shrink-0 px-2.5 py-1.5 text-[10px] sm:text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-yellow-400 rounded-lg transition-all border border-white/10"
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <div className="relative w-full sm:w-56 aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
            {!thumbError && info.thumbnail ? (
              <Image
                src={info.thumbnail}
                alt={info.title}
                fill
                sizes="(max-width: 640px) 100vw, 224px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
                onError={() => setThumbError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {info.duration && info.duration !== "0:00" && (
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded-md backdrop-blur-sm">
                {info.duration}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[11px] sm:text-xs font-medium text-gray-500 mb-2.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Quality Options
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {info.qualities.map((q) => (
                <button
                  key={`${q.quality}-${q.format}`}
                  onClick={() => handleDownload(q.quality, q.format)}
                  disabled={downloading === `${q.quality}-${q.format}`}
                  className="px-3 sm:px-3.5 py-2 text-[11px] sm:text-xs bg-white/5 hover:bg-yellow-400/10 border border-white/10 hover:border-yellow-400/30 rounded-lg text-gray-300 hover:text-yellow-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  {downloading === `${q.quality}-${q.format}` ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Wait
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {qualityLabels[q.quality] || q.label}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {info.audioOnly && (
              <div className="mt-3.5 sm:mt-4">
                <h3 className="text-[11px] sm:text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                  </svg>
                  Audio
                </h3>
                <button
                  onClick={() => handleDownload("audio", info.audioOnly!.format)}
                  disabled={downloading === `audio-${info.audioOnly.format}`}
                  className="px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 rounded-lg text-green-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  {downloading === `audio-${info.audioOnly.format}` ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Wait
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      Download {info.audioOnly.format.toUpperCase()}
                    </span>
                  )}
                </button>
              </div>
            )}

            <button
              onClick={handleDownloadThumbnail}
              className="mt-2.5 px-3 py-1.5 text-[11px] sm:text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-500 hover:text-gray-300 transition-all active:scale-95"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Thumbnail
              </span>
            </button>
          </div>
        </div>

        {downloadError && (
          <div className="mt-4 sm:mt-5">
            <ErrorDisplay code={downloadError.code} message={downloadError.message} />
          </div>
        )}
      </div>
    </div>
  );
}
