import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/youtube-video-downloader",
    "/youtube-shorts-downloader",
    "/tiktok-video-downloader",
    "/facebook-video-downloader",
    "/instagram-video-downloader",
    "/privacy-policy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
