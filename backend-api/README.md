# EasyVideoNex Backend API

This is the FastAPI backend used by the Next.js frontend to get direct download URLs with `yt-dlp`.

## Local Run

```bash
cd backend-api
pip install -r requirements.txt
python python-server.py
```

Health check:

```bash
http://127.0.0.1:8787/health
```

## Deploy On Render

1. Go to Render Dashboard.
2. Click **New +**.
3. Select **Web Service**.
4. Connect GitHub repo: `zamadhassan/easyvideonex`.
5. Use these settings:

| Setting | Value |
|---------|-------|
| Root Directory | `backend-api` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `python python-server.py` |
| Instance Type | `Free` |

6. Click **Create Web Service**.
7. Wait until Render shows **Live**.
8. Open `/health` on the Render URL to confirm it returns `{ "status": "ok" }`.

Example API base URL:

```text
https://easyvideonex-api.onrender.com
```

## Use The API In Vercel

In your Vercel project, add this environment variable:

```text
BACKEND_API_URL=https://your-render-service.onrender.com
```

Do not add a trailing slash.

After saving the variable, redeploy the Vercel project.

## API Endpoints

### `GET /health`

Health check endpoint.

### `POST /api/download`

Returns a direct media URL for a supported public video.

Request body:

```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "platform": "youtube",
  "quality": "720p",
  "format": "mp4",
  "videoId": ""
}
```

Response:

```json
{
  "success": true,
  "downloadUrl": "https://..."
}
```

## Notes

- Render free services sleep after inactivity, so the first request can be slow.
- This backend does not store videos.
- `mp3`/`m4a` requests return the best direct audio URL available from the source. It does not transcode files.
