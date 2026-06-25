"use client";

export default function Disclaimer() {
  return (
    <div className="bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 sm:p-4 animate-fadeIn">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-yellow-400/20 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-yellow-300/80 text-xs sm:text-sm leading-relaxed">
          Only download content you own or have permission to use. Respect copyright laws and platform terms of service.
        </p>
      </div>
    </div>
  );
}
