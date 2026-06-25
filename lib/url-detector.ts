import { PLATFORMS } from "./constants";
import type { Platform, DetectResult, PlatformInfo } from "./types";

function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function getPath(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.pathname;
  } catch {
    return "";
  }
}

function findMatchingPlatform(domain: string, path: string): PlatformInfo | null {
  const fullPath = domain + path;
  for (const platform of PLATFORMS) {
    for (const d of platform.domains) {
      if (fullPath.startsWith(d.replace(/^www\./, ""))) {
        return platform;
      }
      if (fullPath.includes(d)) {
        return platform;
      }
    }
  }
  return null;
}

function extractVideoId(platform: Platform, url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    switch (platform) {
      case "youtube":
      case "youtube-shorts": {
        if (path.startsWith("/shorts/")) {
          return path.replace("/shorts/", "").split("/")[0].split("?")[0];
        }
        if (path.startsWith("/watch")) {
          return parsed.searchParams.get("v") || path.split("/").pop() || "";
        }
        if (parsed.hostname === "youtu.be") {
          return path.slice(1).split("?")[0];
        }
        return "";
      }
      case "tiktok": {
        const parts = path.split("/").filter(Boolean);
        const videoIndex = parts.indexOf("video");
        if (videoIndex !== -1 && parts[videoIndex + 1]) {
          return parts[videoIndex + 1].split("?")[0];
        }
        return path.split("/").filter(Boolean).pop()?.split("?")[0] || "";
      }
      case "facebook": {
        const fbMatch = path.match(/\/videos\/(\d+)/);
        if (fbMatch) return fbMatch[1];
        const fbWatch = path.match(/\/watch\/?\?v=(\d+)/);
        if (fbWatch) return fbWatch[1];
        return path.split("/").filter(Boolean).pop()?.split("?")[0] || "";
      }
      case "instagram": {
        const igMatch = path.match(/\/reel\/([^/?#]+)/);
        if (igMatch) return igMatch[1];
        const igP = path.match(/\/p\/([^/?#]+)/);
        if (igP) return igP[1];
        return "";
      }
      case "twitter": {
        const parts = path.split("/").filter(Boolean);
        const statusIndex = parts.indexOf("status");
        if (statusIndex !== -1 && parts[statusIndex + 1]) {
          return parts[statusIndex + 1].split("?")[0];
        }
        return path.split("/").filter(Boolean).pop()?.split("?")[0] || "";
      }
      case "vimeo": {
        const vimeoParts = path.split("/").filter(Boolean);
        return vimeoParts[0]?.split("?")[0] || "";
      }
      case "pinterest": {
        const pinMatch = path.match(/\/pin\/([^/?#]+)/);
        if (pinMatch) return pinMatch[1];
        return path.split("/").filter(Boolean).pop()?.split("?")[0] || "";
      }
      case "reddit": {
        const rvMatch = path.match(/\/r\/\w+\/comments\/([^/?#]+)/);
        if (rvMatch) return rvMatch[1];
        return path.split("/").filter(Boolean).pop()?.split("?")[0] || "";
      }
      default:
        return "";
    }
  } catch {
    return "";
  }
}

export function detectPlatform(url: string): DetectResult | null {
  const domain = getDomain(url);
  const path = getPath(url);

  if (!domain) return null;

  const platformInfo = findMatchingPlatform(domain, path);
  if (!platformInfo) return null;

  let platform = platformInfo.id;

  if (platform === "youtube") {
    if (path.startsWith("/shorts")) {
      platform = "youtube-shorts";
    }
  }

  const videoId = extractVideoId(platform, url);

  return {
    platform,
    platformInfo: {
      ...platformInfo,
      id: platform,
      name: platform === "youtube-shorts" ? "YouTube Shorts" : platformInfo.name,
    },
    videoId,
    url,
  };
}

export function isSupportedUrl(url: string): boolean {
  return detectPlatform(url) !== null;
}
