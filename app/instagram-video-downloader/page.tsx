import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import DownloadForm from "@/components/DownloadForm";
import FAQ from "@/components/FAQ";

const faqItems = [
  {
    question: "How do I download an Instagram video?",
    answer: "Copy the Instagram video or Reel URL, paste it into the input box above, and click 'Get Download Options'.",
  },
  {
    question: "Can I download Instagram Reels?",
    answer: "Yes, our downloader supports Instagram Reels. Just paste the Reel URL and select your preferred quality.",
  },
  {
    question: "Do I need to log in to Instagram?",
    answer: "No, you don't need to log in. Just paste the public video URL and download.",
  },
];

export const metadata: Metadata = {
  title: "Instagram Video Downloader",
  description: "Download Instagram videos, Reels, and IGTV in high quality for free. Save Instagram content as MP4.",
  openGraph: {
    title: "Instagram Video Downloader",
    description: "Download Instagram videos, Reels, and IGTV in high quality for free. Save Instagram content as MP4.",
  },
};

export default function InstagramDownloaderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map(i => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } })) }) }} />
      <HeroSection
        title="Instagram Video Downloader"
        subtitle="Download Instagram videos, Reels, and IGTV. Paste the link and save in seconds."
        small
      />
      <DownloadForm />
      <FAQ items={faqItems} pageTitle="Instagram Downloader" />
    </>
  );
}
