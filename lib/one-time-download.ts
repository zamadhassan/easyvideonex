import crypto from "crypto";

interface TokenEntry {
  redirectUrl: string;
  ip: string;
  expiresAt: number;
  filename: string;
}

const tokens = new Map<string, TokenEntry>();
const TTL = 5 * 60 * 1000;

const CLEANUP_INTERVAL = 60 * 1000;
const timer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of tokens) {
    if (entry.expiresAt < now) {
      tokens.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

if (typeof timer.unref === "function") timer.unref();

export function createToken(redirectUrl: string, ip: string, filename: string): string {
  const token = crypto.randomBytes(24).toString("hex");
  tokens.set(token, { redirectUrl, ip, expiresAt: Date.now() + TTL, filename });
  return token;
}

export function consumeToken(token: string, ip: string): { redirectUrl: string; filename: string } | null {
  const entry = tokens.get(token);
  if (!entry) return null;
  if (entry.ip !== ip) return null;
  if (entry.expiresAt < Date.now()) {
    tokens.delete(token);
    return null;
  }
  tokens.delete(token);
  return { redirectUrl: entry.redirectUrl, filename: entry.filename };
}
