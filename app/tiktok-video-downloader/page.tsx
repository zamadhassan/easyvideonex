import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import DownloadForm from "@/components/DownloadForm";
import FAQ from "@/components/FAQ";

const faqItems = [
  {
    question: "How do I download a TikTok video?",
    answer: "Copy the TikTok video URL, paste it into the input box above, and click 'Get Download Options'. Select quality and download.",
  },
  {
    question: "Can I download TikTok videos without watermark?",
    answer: "Our service attempts to provide the best available version. Results depend on the source video.",
  },
  {
    question: "Is it free to download TikTok videos?",
    answer: "Yes, downloading TikTok videos through our service is completely free.",
  },
];

export const metadata: Metadata = {
  title: "TikTok Video Downloader",
  description: "Download TikTok videos without watermark for free. Save TikTok videos as MP4 or MP3. No login required.",
  openGraph: {
    title: "TikTok Video Downloader",
    description: "Download TikTok videos without watermark for free. Save TikTok videos as MP4 or MP3.",
  },
};

export default function TiktokDownloaderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map(i => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } })) }) }} />
      <HeroSection
        title="TikTok Video Downloader"
        subtitle="Download TikTok videos in high quality. Paste the link and save your favorite TikToks."
        small
      />
      <DownloadForm />
      <FAQ items={faqItems} pageTitle="TikTok Downloader" />
    </>
  );
}
