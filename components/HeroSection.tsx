"use client";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  small?: boolean;
}

const platforms = ["YouTube", "TikTok", "Facebook", "Instagram", "X/Twitter", "Vimeo", "Pinterest", "Reddit"];

export default function HeroSection({
  title = "Download Videos from Any Platform",
  subtitle = "Paste any video link and download in high quality. Supports YouTube, TikTok, Facebook, Instagram, X/Twitter, Vimeo, Pinterest, Reddit and more.",
  small = false,
}: HeroSectionProps) {
  return (
    <section className={`relative overflow-hidden ${small ? "py-10 sm:py-14" : "py-14 sm:py-20 lg:py-24"}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-yellow-400/5 rounded-full blur-[80px] animate-float pointer-events-none" />
      <div className="absolute bottom-[15%] right-[10%] w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-yellow-400/5 rounded-full blur-[80px] animate-float pointer-events-none" style={{ animationDelay: "-3s" }} />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[11px] sm:text-xs font-medium mb-4 sm:mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Free &bull; Fast &bull; Private
        </div>

        <h1 className={`font-bold text-white leading-[1.1] ${small ? "text-2xl sm:text-3xl lg:text-4xl" : "text-3xl sm:text-4xl lg:text-5xl"}`}>
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-300 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>

        <p className={`mt-4 sm:mt-5 text-gray-400 max-w-xl mx-auto leading-relaxed ${small ? "text-sm sm:text-base" : "text-sm sm:text-base lg:text-lg"}`}>
          {subtitle}
        </p>

        <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] sm:text-xs text-gray-600">
          {platforms.map((p) => (
            <span key={p} className="flex items-center gap-1">
              <svg className="w-1 h-1 fill-yellow-400 shrink-0" viewBox="0 0 6 6">
                <circle cx="3" cy="3" r="3" />
              </svg>
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
