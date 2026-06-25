import type { VideoInfo, QualityOption, AudioOption, Platform } from "./types";
import { ERROR_MESSAGES } from "./constants";

interface OEmbedResponse {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  provider_name?: string;
  type?: string;
  html?: string;
}

async function fetchOEmbed(url: string): Promise<OEmbedResponse | null> {
  try {
    const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

async function getRealYouTubeInfo(url: string, videoId: string): Promise<VideoInfo | null> {
  try {
    const oembed = await fetchOEmbed(url);
    const thumbnail = getYouTubeThumbnail(videoId);

    return {
      platform: "youtube",
      platformDisplay: "YouTube",
      title: oembed?.title || `YouTube Video (${videoId})`,
      thumbnail,
      url,
      qualities: [
        { label: "1080p Full HD", quality: "1080p", format: "mp4", url: "" },
        { label: "720p HD", quality: "720p", format: "mp4", url: "" },
        { label: "480p SD", quality: "480p", format: "mp4", url: "" },
        { label: "360p", quality: "360p", format: "mp4", url: "" },
      ],
      audioOnly: { label: "Audio Only", format: "mp3", url: "" },
    };
  } catch {
    return null;
  }
}

async function getRealYouTubeShortsInfo(url: string, videoId: string): Promise<VideoInfo | null> {
  try {
    const oembed = await fetchOEmbed(url);
    const thumbnail = getYouTubeThumbnail(videoId);

    return {
      platform: "youtube-shorts",
      platformDisplay: "YouTube Shorts",
      title: oembed?.title || `YouTube Shorts (${videoId})`,
      thumbnail,
      url,
      qualities: [
        { label: "720p HD", quality: "720p", format: "mp4", url: "" },
        { label: "480p SD", quality: "480p", format: "mp4", url: "" },
        { label: "360p", quality: "360p", format: "mp4", url: "" },
      ],
      audioOnly: { label: "Audio Only", format: "mp3", url: "" },
    };
  } catch {
    return null;
  }
}

async function getRealTikTokInfo(url: string, videoId: string): Promise<VideoInfo | null> {
  try {
    const oembed = await fetchOEmbed(url);
    return {
      platform: "tiktok",
      platformDisplay: "TikTok",
      title: oembed?.title || `TikTok Video (${videoId})`,
      thumbnail: oembed?.thumbnail_url || "",
      url,
      qualities: [
        { label: "720p HD", quality: "720p", format: "mp4", url: "" },
        { label: "480p SD", quality: "480p", format: "mp4", url: "" },
        { label: "360p", quality: "360p", format: "mp4", url: "" },
      ],
      audioOnly: { label: "Audio Only", format: "mp3", url: "" },
    };
  } catch {
    return null;
  }
}

async function getRealFacebookInfo(url: string, videoId: string): Promise<VideoInfo | null> {
  try {
    const oembed = await fetchOEmbed(url);
    return {
      platform: "facebook",
      platformDisplay: "Facebook",
      title: oembed?.title || `Facebook Video (${videoId})`,
      thumbnail: oembed?.thumbnail_url || "",
      url,
      qualities: [
        { label: "720p HD", quality: "720p", format: "mp4", url: "" },
        { label: "480p SD", quality: "480p", format: "mp4", url: "" },
        { label: "360p", quality: "360p", format: "mp4", url: "" },
      ],
    };
  } catch {
    return null;
  }
}

async function getRealInstagramInfo(url: string, videoId: string): Promise<VideoInfo | null> {
  try {
    const oembed = await fetchOEmbed(url);
    return {
      platform: "instagram",
      platformDisplay: "Instagram",
      title: oembed?.title || `Instagram Video (${videoId})`,
      thumbnail: oembed?.thumbnail_url || "",
      url,
      qualities: [
        { label: "720p HD", quality: "720p", format: "mp4", url: "" },
        { label: "480p SD", quality: "480p", format: "mp4", url: "" },
        { label: "360p", quality: "360p", format: "mp4", url: "" },
      ],
    };
  } catch {
    return null;
  }
}

function generateMockQualities(platform: Platform): QualityOption[] {
  const isShorts = platform === "youtube-shorts";
  const qualities: QualityOption[] = [];

  if (!isShorts) {
    qualities.push(
      { label: "1080p Full HD", quality: "1080p", format: "mp4", url: "" },
      { label: "720p HD", quality: "720p", format: "mp4", url: "" },
      { label: "480p SD", quality: "480p", format: "mp4", url: "" }
    );
  }

  qualities.push(
    { label: "360p", quality: "360p", format: "mp4", url: "" },
    { label: "240p", quality: "240p", format: "mp4", url: "" }
  );

  return qualities;
}

function generateMockAudio(): AudioOption {
  return { label: "Audio Only", format: "mp3", url: "" };
}

function getMockThumbnail(platform: Platform, videoId: string): string {
  if (platform === "youtube" || platform === "youtube-shorts") {
    return getYouTubeThumbnail(videoId);
  }
  return "";
}

export async function fetchVideoInfo(
  url: string,
  platform: Platform,
  videoId: string
): Promise<VideoInfo> {
  return fetchVideoInfoLocal(url, platform, videoId);
}

async function fetchVideoInfoLocal(
  url: string,
  platform: Platform,
  videoId: string
): Promise<VideoInfo> {
  if (!videoId) {
    throw new Error(ERROR_MESSAGES.NO_MEDIA);
  }

  let result: VideoInfo | null = null;

  switch (platform) {
    case "youtube":
      result = await getRealYouTubeInfo(url, videoId);
      break;
    case "youtube-shorts":
      result = await getRealYouTubeShortsInfo(url, videoId);
      break;
    case "tiktok":
      result = await getRealTikTokInfo(url, videoId);
      break;
    case "facebook":
      result = await getRealFacebookInfo(url, videoId);
      break;
    case "instagram":
      result = await getRealInstagramInfo(url, videoId);
      break;
  }

  if (result) return result;

  await new Promise((r) => setTimeout(r, 600));

  const platformDisplayNames: Record<Platform, string> = {
    youtube: "YouTube",
    "youtube-shorts": "YouTube Shorts",
    tiktok: "TikTok",
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "X / Twitter",
    vimeo: "Vimeo",
    pinterest: "Pinterest",
    reddit: "Reddit",
    unknown: "Unknown",
  };

  return {
    platform,
    platformDisplay: platformDisplayNames[platform] || "Unknown",
    title: `Video from ${platformDisplayNames[platform] || platform}`,
    thumbnail: getMockThumbnail(platform, videoId),
    url,
    qualities: generateMockQualities(platform),
    audioOnly: generateMockAudio(),
  };
}

export async function getDownloadUrl(
  url: string,
  platform: Platform,
  videoId: string,
  quality: string,
  format: string
): Promise<string> {
  const response = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, platform, videoId, quality, format }),
    signal: AbortSignal.timeout(180000),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
  }

  const data = await response.json();
  return data.downloadUrl;
}
