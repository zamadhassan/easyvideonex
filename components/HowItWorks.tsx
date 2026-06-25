"use client";

const steps = [
  {
    number: "1",
    title: "Paste Link",
    desc: "Copy any video URL from YouTube, TikTok, Facebook, Instagram, X, Vimeo, Pinterest, or Reddit.",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  },
  {
    number: "2",
    title: "Pick Quality",
    desc: "Choose from 1080p, 720p, 480p, 360p video or download audio-only MP3/M4A.",
    icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
  },
  {
    number: "3",
    title: "Download",
    desc: "Save your video or audio directly to your device. Ready to watch offline.",
    icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-14 sm:py-16 lg:py-20 relative">
      <div className="absolute inset-x-4 sm:inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-gray-500">Download videos in three simple steps</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-400/20">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                </svg>
              </div>

              <div className="absolute -top-1 -right-1 sm:top-0 sm:right-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 text-[10px] sm:text-xs font-bold">
                {step.number}
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5">{step.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
