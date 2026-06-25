// Backend API for Universal Video Downloader
// Deploy on Render / Railway for actual video downloading.
// Vercel serverless has 10s timeout and 50MB limit, so this backend
// handles the heavy lifting of fetching and streaming video files.

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "30", 10);
const ipRequests = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const record = ipRequests.get(ip);
  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get video info
// Uses youtube-dl-exec to extract metadata from supported platforms
app.post("/api/info", async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: { code: "INVALID_URL", message: "URL is required" } });
  }

  try {
    // For production, install youtube-dl or yt-dlp and use youtube-dl-exec:
    // const youtubedl = (await import("youtube-dl-exec")).default;
    // const info = await youtubedl(url, {
    //   dumpSingleJson: true,
    //   noWarnings: true,
    //   noCallHome: true,
    //   noCheckCertificate: true,
    // });

    // Mock response for initial development:
    const mockInfo = {
      platform: "youtube",
      platformDisplay: "YouTube",
      title: "Video from " + url,
      thumbnail: "https://img.youtube.com/vi/example/hqdefault.jpg",
      duration: "5:30",
      url,
      qualities: [
        { label: "720p HD", quality: "720p", format: "mp4", url: "" },
        { label: "480p SD", quality: "480p", format: "mp4", url: "" },
        { label: "360p", quality: "360p", format: "mp4", url: "" },
      ],
      audioOnly: { label: "Audio Only", format: "mp3", url: "" },
    };

    res.json({ success: true, data: mockInfo });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "UNKNOWN_ERROR", message: err.message },
    });
  }
});

// Download a video
// Streams the video file directly to the client
app.get("/api/download", async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return res.status(429).json({ success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } });
  }

  const { url, quality } = req.query;
  if (!url) {
    return res.status(400).json({ success: false, error: { code: "INVALID_URL", message: "URL is required" } });
  }

  try {
    // In production, use youtube-dl to get the direct download URL:
    // const youtubedl = (await import("youtube-dl-exec")).default;
    // const info = await youtubedl(url, {
    //   format: quality || "best",
    //   getUrl: true,
    // });
    // return res.redirect(info);

    // For now, return a mock response
    res.json({
      success: true,
      data: {
        downloadUrl: `https://example.com/download?quality=${quality || "720p"}`,
        title: "downloaded-video",
        format: "mp4",
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: "DOWNLOAD_BLOCKED", message: err.message },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
