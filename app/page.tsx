import HeroSection from "@/components/HeroSection";
import DownloadForm from "@/components/DownloadForm";
import PlatformGrid from "@/components/PlatformGrid";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import { SITE_NAME } from "@/lib/constants";

const faqItems = [
  {
    question: "Is Universal Video Downloader free?",
    answer: "Yes, Universal Video Downloader is completely free to use. There are no hidden charges or premium plans.",
  },
  {
    question: "What platforms are supported?",
    answer: "We support YouTube, YouTube Shorts, TikTok, Facebook, Instagram, X/Twitter, Vimeo, Pinterest, and Reddit.",
  },
  {
    question: "Is it legal to download videos?",
    answer: "You should only download videos that you own or have permission to use. Respect copyright laws and platform terms of service.",
  },
  {
    question: "Do I need to install any software?",
    answer: "No installation is required. Universal Video Downloader works entirely in your browser.",
  },
  {
    question: "What video qualities are available?",
    answer: "Available qualities depend on the source video. Options may include 1080p, 720p, 480p, 360p, and audio-only formats.",
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: SITE_NAME,
            applicationCategory: "Multimedia",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
      <HeroSection />
      <DownloadForm />
      <PlatformGrid />
      <HowItWorks />
      <FAQ items={faqItems} />
    </>
  );
}
