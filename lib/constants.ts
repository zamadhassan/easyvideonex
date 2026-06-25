import type { PlatformInfo } from "./types";

export const PLATFORMS: PlatformInfo[] = [
  {
    id: "youtube",
    name: "YouTube",
    domains: [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtu.be",
    ],
    color: "#FF0000",
  },
  {
    id: "youtube-shorts",
    name: "YouTube Shorts",
    domains: ["youtube.com/shorts", "www.youtube.com/shorts"],
    color: "#FF0000",
  },
  {
    id: "tiktok",
    name: "TikTok",
    domains: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "m.tiktok.com"],
    color: "#000000",
  },
  {
    id: "facebook",
    name: "Facebook",
    domains: [
      "facebook.com",
      "www.facebook.com",
      "fb.watch",
      "m.facebook.com",
      "fb.com",
    ],
    color: "#1877F2",
  },
  {
    id: "instagram",
    name: "Instagram",
    domains: [
      "instagram.com",
      "www.instagram.com",
      "instagr.am",
      "ig.me",
    ],
    color: "#E4405F",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    domains: [
      "twitter.com",
      "www.twitter.com",
      "x.com",
      "www.x.com",
      "t.co",
    ],
    color: "#000000",
  },
  {
    id: "vimeo",
    name: "Vimeo",
    domains: ["vimeo.com", "www.vimeo.com", "player.vimeo.com"],
    color: "#1AB7EA",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    domains: [
      "pinterest.com",
      "www.pinterest.com",
      "pin.it",
      "pinterest.co.uk",
    ],
    color: "#BD081C",
  },
  {
    id: "reddit",
    name: "Reddit",
    domains: [
      "reddit.com",
      "www.reddit.com",
      "old.reddit.com",
      "redd.it",
    ],
    color: "#FF4500",
  },
];

export const SITE_NAME = "Universal Video Downloader";
export const SITE_DESCRIPTION =
  "Download videos from YouTube, TikTok, Facebook, Instagram, X/Twitter, Vimeo, Pinterest, Reddit and more. Fast, free, and private.";
export const SITE_URL = "https://universal-video-downloader.vercel.app";

export const ERROR_MESSAGES: Record<string, string> = {
  UNSUPPORTED_URL:
    "This URL is not supported. Please paste a link from a supported platform.",
  INVALID_URL: "Please enter a valid video URL.",
  PRIVATE_VIDEO:
    "This video is private or requires login. We only support public videos.",
  NO_MEDIA:
    "No downloadable media found at this URL.",
  SERVER_TIMEOUT:
    "The request timed out. This video may be too long or the server is busy.",
  INVALID_PLATFORM:
    "Could not detect a supported platform from this URL.",
  RATE_LIMITED:
    "Too many requests. Please wait a moment before trying again.",
  UNKNOWN_ERROR:
    "Something went wrong. Please try again later.",
};
