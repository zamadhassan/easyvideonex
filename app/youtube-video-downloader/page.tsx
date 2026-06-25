import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import DownloadForm from "@/components/DownloadForm";
import FAQ from "@/components/FAQ";

const faqItems = [
  {
    question: "How do I download a YouTube video?",
    answer: "Simply paste the YouTube video URL into the input box above and click 'Get Download Options'. Then choose your preferred quality and download.",
  },
  {
    question: "Is downloading YouTube videos legal?",
    answer: "You should only download videos you own or have permission to use. Respect copyright and YouTube's Terms of Service.",
  },
  {
    question: "What qualities are available?",
    answer: "Available qualities depend on the original video. Options typically include 1080p, 720p, 480p, 360p, and audio-only MP3.",
  },
  {
    question: "Can I download YouTube videos in MP3?",
    answer: "Yes, you can download audio-only MP3 from YouTube videos using the 'Audio Only' option.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((i) => ({
    "@type": "Question",
    name: i.question,
    acceptedAnswer: { "@type": "Answer", text: i.answer },
  })),
};

export const metadata: Metadata = {
  title: "YouTube Video Downloader",
  description: "Download YouTube videos in HD quality for free. Supports 1080p, 720p, 480p, and MP3 audio. No registration required.",
  openGraph: {
    title: "YouTube Video Downloader",
    description: "Download YouTube videos in HD quality for free. Supports 1080p, 720p, 480p, and MP3 audio.",
  },
};

export default function YoutubeDownloaderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HeroSection
        title="YouTube Video Downloader"
        subtitle="Download YouTube videos in HD quality. Paste the link and choose your preferred format."
        small
      />
      <DownloadForm />
      <FAQ items={faqItems} pageTitle="YouTube Downloader" />
    </>
  );
}
