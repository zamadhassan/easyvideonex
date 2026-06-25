# Universal Video Downloader

A production-ready web application for downloading videos from popular platforms. Built with Next.js 15, TypeScript, and Tailwind CSS.

**Live Demo:** https://universal-video-downloader.vercel.app

## Supported Platforms

- YouTube (videos & Shorts)
- TikTok
- Facebook (videos & Reels)
- Instagram (videos & Reels)
- X / Twitter
- Vimeo
- Pinterest
- Reddit

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- **Deployment:** Vercel (frontend), Render/Railway (optional backend)
- **APIs:** Next.js API Routes (serverless), Express API (backend)

## Architecture

### Why Two Components?

Vercel serverless functions have limitations:
- **10s timeout** on Hobby plan (60s on Pro)
- **50MB response body limit**
- No persistent filesystem

For these reasons, we have:

1. **Frontend (Vercel):** URL detection, metadata display, UI
2. **Backend API (Render/Railway):** Actual video downloading and streaming

### How It Works

```
User → Frontend (Vercel) → Backend API (Render/Railway) → Video File
```

The frontend handles URL validation and displays metadata. When a user wants to download, the request proxies through the Vercel API route to the backend.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd universal-video-downloader

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `BACKEND_API_URL` | No | URL of the backend API on Render/Railway |
| `RATE_LIMIT_MAX` | No | Max requests per IP per minute (default: 30) |

## Project Structure

```
├── app/
│   ├── api/                   # API routes (detect, info, download)
│   ├── youtube-video-downloader/
│   ├── youtube-shorts-downloader/
│   ├── tiktok-video-downloader/
│   ├── facebook-video-downloader/
│   ├── instagram-video-downloader/
│   ├── privacy-policy/
│   ├── terms/
│   ├── layout.tsx
│   └── page.tsx
├── backend-api/               # Separate backend for actual downloading
│   ├── server.js
│   └── README.md
├── components/                # React components
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── DownloadForm.tsx
│   ├── VideoInfoCard.tsx
│   ├── PlatformGrid.tsx
│   ├── HowItWorks.tsx
│   ├── FAQ.tsx
│   ├── Footer.tsx
│   ├── Disclaimer.tsx
│   └── ErrorDisplay.tsx
├── lib/                       # Utilities and types
│   ├── types.ts
│   ├── constants.ts
│   ├── url-detector.ts
│   ├── url-validator.ts
│   ├── rate-limiter.ts
│   └── platform-api.ts
└── README.md
```

## Deployment

### Frontend (Vercel)

```bash
npm run build
# Or deploy via Vercel CLI: vercel --prod
```

### Backend API (Render/Railway)

See `backend-api/README.md` for detailed instructions.

## Security

- **SSRF Protection:** Blocks localhost, private IPs, and non-http(s) URLs
- **Rate Limiting:** 30 requests per minute per IP
- **Input Sanitization:** All URLs are validated and sanitized
- **No API Keys:** No secrets exposed on the frontend
- **No Data Storage:** Videos are not stored on servers

## Legal & Ethics

This tool is designed for downloading **public** content that you own or have permission to use. It:
- Does NOT bypass DRM, login walls, or paywalls
- Does NOT access private videos
- Does NOT scrape personal data
- Shows a clear disclaimer before downloading

## License

MIT
