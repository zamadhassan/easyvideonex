"use client";

import type { ErrorCode } from "@/lib/types";

interface ErrorDisplayProps {
  code: ErrorCode;
  message: string;
}

const errorConfig: Record<ErrorCode, { icon: string; gradient: string; border: string }> = {
  UNSUPPORTED_URL: {
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    gradient: "from-yellow-500/10 to-yellow-600/5",
    border: "border-yellow-500/20",
  },
  INVALID_URL: {
    icon: "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-yellow-500/10 to-yellow-600/5",
    border: "border-yellow-500/20",
  },
  PRIVATE_VIDEO: {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    gradient: "from-red-500/10 to-red-600/5",
    border: "border-red-500/20",
  },
  NO_MEDIA: {
    icon: "M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4",
    gradient: "from-orange-500/10 to-orange-600/5",
    border: "border-orange-500/20",
  },
  SERVER_TIMEOUT: {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-orange-500/10 to-orange-600/5",
    border: "border-orange-500/20",
  },
  INVALID_PLATFORM: {
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-yellow-500/10 to-yellow-600/5",
    border: "border-yellow-500/20",
  },
  RATE_LIMITED: {
    icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    gradient: "from-purple-500/10 to-purple-600/5",
    border: "border-purple-500/20",
  },
  UNKNOWN_ERROR: {
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
    gradient: "from-red-500/10 to-red-600/5",
    border: "border-red-500/20",
  },
};

const helpText: Partial<Record<ErrorCode, string>> = {
  RATE_LIMITED: "Please wait a moment before trying again.",
  PRIVATE_VIDEO: "We can only download public videos. Make sure the video is not private or behind a login.",
  UNSUPPORTED_URL: "Supported: YouTube, TikTok, Facebook, Instagram, X/Twitter, Vimeo, Pinterest, Reddit.",
};

export default function ErrorDisplay({ code, message }: ErrorDisplayProps) {
  const cfg = errorConfig[code] || errorConfig.UNKNOWN_ERROR;

  return (
    <div className={`bg-gradient-to-r ${cfg.gradient} border ${cfg.border} rounded-xl p-3.5 sm:p-4`}>
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cfg.icon} />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-white text-xs sm:text-sm font-medium">{message}</p>
          {helpText[code] && (
            <p className="text-gray-400 text-[11px] sm:text-xs mt-1">{helpText[code]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
