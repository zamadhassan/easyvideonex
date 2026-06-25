"use client";

import Link from "next/link";
import { PLATFORMS } from "@/lib/constants";
import PlatformIcon from "./PlatformIcon";

const gradients: Record<string, string> = {
  youtube: "from-red-500/15 to-red-500/5",
  "youtube-shorts": "from-red-500/15 to-red-500/5",
  tiktok: "from-gray-500/10 to-gray-500/5",
  facebook: "from-blue-500/15 to-blue-500/5",
  instagram: "from-purple-500/15 to-pink-500/5",
  twitter: "from-gray-500/10 to-gray-500/5",
  vimeo: "from-blue-400/15 to-blue-400/5",
  pinterest: "from-red-600/15 to-red-600/5",
  reddit: "from-orange-500/15 to-orange-500/5",
};

const pages: Record<string, string> = {
  youtube: "/youtube-video-downloader",
  "youtube-shorts": "/youtube-shorts-downloader",
  tiktok: "/tiktok-video-downloader",
  facebook: "/facebook-video-downloader",
  instagram: "/instagram-video-downloader",
};

export default function PlatformGrid() {
  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
            Supported Platforms
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
            Download videos from your favorite platforms
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {PLATFORMS.filter((p) => p.id !== "unknown").map((platform) => {
            const href = pages[platform.id] || "/";
            const gradient = gradients[platform.id] || "from-white/5 to-white/5";
            const hasPage = !!pages[platform.id];

            return (
              <Link
                key={platform.id}
                href={href}
                className={`group relative flex flex-col items-center gap-2.5 p-4 sm:p-5 bg-gradient-to-br ${gradient} border border-white/10 rounded-xl transition-all ${hasPage ? "hover:border-yellow-400/30 hover:bg-white/5 active:scale-[0.97]" : "opacity-50 cursor-default pointer-events-none"}`}
              >
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-lg transition-transform group-hover:scale-110"
                  style={{ backgroundColor: platform.color }}
                >
                  <PlatformIcon platform={platform.id} className="w-4 h-4" />
                </div>
                <span className="text-white text-xs sm:text-sm font-medium text-center leading-tight group-hover:text-yellow-400 transition-colors">
                  {platform.name}
                </span>
                {!hasPage && (
                  <span className="text-[9px] text-gray-600 uppercase tracking-widest">Soon</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
