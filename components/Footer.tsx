"use client";

import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-10 sm:mt-14">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-base sm:text-lg font-bold">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                Universal
              </span>
              <span className="text-gray-400"> Downloader</span>
            </Link>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-[200px]">
              Download videos from your favorite platforms. Fast, free, and private.
            </p>
          </div>

          <div>
            <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 sm:mb-4">
              Downloaders
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                ["YouTube", "/youtube-video-downloader"],
                ["Shorts", "/youtube-shorts-downloader"],
                ["TikTok", "/tiktok-video-downloader"],
                ["Facebook", "/facebook-video-downloader"],
                ["Instagram", "/instagram-video-downloader"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-xs sm:text-sm text-gray-500 hover:text-yellow-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 sm:mb-4">
              Legal
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-xs sm:text-sm text-gray-500 hover:text-yellow-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs sm:text-sm text-gray-500 hover:text-yellow-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 sm:mb-4">
              Info
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li className="text-xs sm:text-sm text-gray-500">
                Only download content you own or have permission to use.
              </li>
              <li className="text-[10px] sm:text-xs text-gray-600">
                &copy; {new Date().getFullYear()} {SITE_NAME}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] sm:text-xs text-gray-600">
            Respect copyright laws. Only download content you have rights to.
          </p>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-600">
            <span>Free &bull; Fast &bull; Private</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
