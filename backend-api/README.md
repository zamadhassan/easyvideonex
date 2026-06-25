# Backend API for Universal Video Downloader

This backend handles the actual video downloading. Deploy on **Render** or **Railway** since Vercel serverless has:
- 10s timeout (Hobby) / 60s (Pro)
- 50MB response body limit
- No persistent filesystem

## Quick Start

```bash
cd backend-api
npm install
npm start
```

## Deploy on Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set:
   - **Root Directory**: `backend-api`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Deploy

## Deploy on Railway

1. Create a new project on Railway
2. Connect your repository
3. Set the root directory to `backend-api`
4. Deploy

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `RATE_LIMIT_MAX` | `30` | Max requests per IP per minute |

## API Endpoints

### `POST /api/info`
Get video metadata and available download options.

**Body:** `{ "url": "https://youtube.com/watch?v=..." }`

### `GET /api/download`
Get a downloadable URL or stream the video.

**Query:** `?url=https://...&quality=720p&format=mp4`

### `GET /health`
Health check endpoint.

## Production Setup

For production, install `yt-dlp` on the server and install the npm package `youtube-dl-exec`.

```bash
# On the server (Render/Railway):
apt-get install yt-dlp  # or download the binary
npm install youtube-dl-exec
```

Then uncomment the youtube-dl lines in `server.js`.
