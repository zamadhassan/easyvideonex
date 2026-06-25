export type Platform =
  | "youtube"
  | "youtube-shorts"
  | "tiktok"
  | "facebook"
  | "instagram"
  | "twitter"
  | "vimeo"
  | "pinterest"
  | "reddit"
  | "unknown";

export type ErrorCode =
  | "UNSUPPORTED_URL"
  | "INVALID_URL"
  | "PRIVATE_VIDEO"
  | "NO_MEDIA"
  | "SERVER_TIMEOUT"
  | "INVALID_PLATFORM"
  | "RATE_LIMITED"
  | "UNKNOWN_ERROR";

export interface VideoInfo {
  platform: Platform;
  platformDisplay: string;
  title: string;
  thumbnail: string;
  duration?: string;
  url: string;
  qualities: QualityOption[];
  audioOnly?: AudioOption;
}

export interface QualityOption {
  label: string;
  quality: string;
  format: "mp4" | "webm";
  url: string;
}

export interface AudioOption {
  label: string;
  format: "mp3" | "m4a";
  url: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
  };
}

export interface PlatformInfo {
  id: Platform;
  name: string;
  domains: string[];
  color: string;
}

export interface DetectResult {
  platform: Platform;
  platformInfo: PlatformInfo;
  videoId: string;
  url: string;
}

export type DownloadFormat = "mp4" | "webm" | "mp3" | "m4a" | "thumbnail";
