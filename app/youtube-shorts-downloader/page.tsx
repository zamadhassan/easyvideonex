import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import DownloadForm from "@/components/DownloadForm";
import FAQ from "@/components/FAQ";

const faqItems = [
  {
    question: "How do I download a YouTube Short?",
    answer: "Copy the Shorts URL from YouTube, paste it into the input box, and click 'Get Download Options'. Select your preferred quality.",
  },
  {
    question: "What format are Shorts downloaded in?",
    answer: "YouTube Shorts can be downloaded as MP4 video or MP3 audio, depending on your preference.",
  },
  {
    question: "Can I download Shorts without watermark?",
    answer: "YouTube Shorts downloaded through our service are saved as posted, without additional watermarks.",
  },
];

export const metadata: Metadata = {
  title: "YouTube Shorts Downloader",
  description: "Download YouTube Shorts videos in high quality for free. Save Shorts as MP4 or MP3. Quick and easy.",
  openGraph: {
    title: "YouTube Shorts Downloader",
    description: "Download YouTube Shorts videos in high quality for free. Save Shorts as MP4 or MP3.",
  },
};

export default function YoutubeShortsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map(i => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } })) }) }} />
      <HeroSection
        title="YouTube Shorts Downloader"
        subtitle="Download YouTube Shorts videos quickly. Paste the Shorts link and save in your preferred quality."
        small
      />
      <DownloadForm />
      <FAQ items={faqItems} pageTitle="YouTube Shorts Downloader" />
    </>
  );
}
