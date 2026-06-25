"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  ["YouTube", "/youtube-video-downloader"],
  ["Shorts", "/youtube-shorts-downloader"],
  ["TikTok", "/tiktok-video-downloader"],
  ["Facebook", "/facebook-video-downloader"],
  ["Instagram", "/instagram-video-downloader"],
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-white/5 bg-gray-950/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-[10px] sm:text-xs group-hover:scale-110 transition-transform">
              UD
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                Universal
              </span>
              <span className="text-gray-400 hidden xs:inline"> Downloader</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.slice(0, 5).map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-all"
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-3 space-y-0.5">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-2 text-sm text-gray-500 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-all"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
