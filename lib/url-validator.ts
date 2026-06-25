import type { ErrorCode } from "./types";

const LOCAL_IPS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "10.",
  "172.16.",
  "172.17.",
  "172.18.",
  "172.19.",
  "172.20.",
  "172.21.",
  "172.22.",
  "172.23.",
  "172.24.",
  "172.25.",
  "172.26.",
  "172.27.",
  "172.28.",
  "172.29.",
  "172.30.",
  "172.31.",
  "192.168.",
]);

const LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
]);

export interface ValidationResult {
  valid: boolean;
  error?: {
    code: ErrorCode;
    message: string;
  };
}

export function validateUrl(input: string): ValidationResult {
  if (!input || typeof input !== "string") {
    return {
      valid: false,
      error: {
        code: "INVALID_URL",
        message: "Please enter a valid video URL.",
      },
    };
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: {
        code: "INVALID_URL",
        message: "Please enter a valid video URL.",
      },
    };
  }

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return {
      valid: false,
      error: {
        code: "INVALID_URL",
        message: "URL must start with http:// or https://",
      },
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: {
        code: "INVALID_URL",
        message: "The URL format is invalid.",
      },
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (LOCAL_HOSTNAMES.has(hostname)) {
    return {
      valid: false,
      error: {
        code: "INVALID_URL",
        message: "Local URLs are not allowed.",
      },
    };
  }

  for (const prefix of LOCAL_IPS) {
    if (hostname.startsWith(prefix)) {
      return {
        valid: false,
        error: {
          code: "INVALID_URL",
          message: "Private network URLs are not allowed.",
        },
      };
    }
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: {
        code: "INVALID_URL",
        message: "Only http and https URLs are supported.",
      },
    };
  }

  return { valid: true };
}
