"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  pageTitle?: string;
}

export default function FAQ({ items, pageTitle }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
            Frequently Asked Questions
          </h2>
          {pageTitle && <p className="text-sm sm:text-base text-gray-500">About {pageTitle}</p>}
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                openIndex === index ? "border-yellow-400/30 bg-yellow-400/5" : "border-white/10 bg-white/5"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left"
              >
                <span className="text-white text-xs sm:text-sm font-medium pr-3">
                  {item.question}
                </span>
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                  openIndex === index ? "bg-yellow-400/20 rotate-180" : "bg-white/10"
                }`}>
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div className={`transition-all duration-200 overflow-hidden ${
                openIndex === index ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
              }`}>
                <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4">
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
