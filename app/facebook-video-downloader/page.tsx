import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import DownloadForm from "@/components/DownloadForm";
import FAQ from "@/components/FAQ";

const faqItems = [
  {
    question: "How do I download a Facebook video?",
    answer: "Copy the Facebook video URL and paste it into the input box. Click 'Get Download Options' and choose your quality.",
  },
  {
    question: "Can I download Facebook Reels?",
    answer: "Yes, you can download Facebook Reels by pasting the Reel URL into the downloader.",
  },
  {
    question: "Why can't I download some Facebook videos?",
    answer: "Some Facebook videos may be set to private or have downloading disabled by the uploader. We can only download public videos.",
  },
];

export const metadata: Metadata = {
  title: "Facebook Video Downloader",
  description: "Download Facebook videos in HD quality for free. Save Facebook videos, Reels, and live streams as MP4.",
  openGraph: {
    title: "Facebook Video Downloader",
    description: "Download Facebook videos in HD quality for free. Save Facebook videos, Reels, and live streams as MP4.",
  },
};

export default function FacebookDownloaderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map(i => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } })) }) }} />
      <HeroSection
        title="Facebook Video Downloader"
        subtitle="Download Facebook videos and Reels in HD quality. Free and easy to use."
        small
      />
      <DownloadForm />
      <FAQ items={faqItems} pageTitle="Facebook Downloader" />
    </>
  );
}
