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

## Deploy Without Card: Hugging Face Spaces

Use this if Render asks for card details.

1. Create a Hugging Face account: `https://huggingface.co/join`
2. Go to: `https://huggingface.co/new-space`
3. Use these settings:

| Setting | Value |
|---------|-------|
| Space name | `easyvideonex-api` |
| License | Any, for example `MIT` |
| Space SDK | `Docker` |
| Visibility | `Public` |
| Hardware | Free CPU |

4. Create the Space.
5. Add the files from this repo to that Space, or connect/sync this GitHub repo if Hugging Face shows that option.
6. Hugging Face will use the root `Dockerfile` and start this FastAPI backend on port `7860`.
7. Open this URL to check health:

```text
https://YOUR-HF-USERNAME-easyvideonex-api.hf.space/health
```

If it returns `{ "status": "ok" }`, the API is ready.

Use this as your Vercel environment variable:

```text
BACKEND_API_URL=https://YOUR-HF-USERNAME-easyvideonex-api.hf.space
```

Do not add a trailing slash.

If the Space shows an error:

- Confirm the Space SDK is `Docker`, not Gradio/Streamlit/Static.
- Confirm the Space has this repo's root `Dockerfile`.
- Confirm the Space README metadata has `sdk: docker` and `app_port: 7860`.
- Open **Logs** in the Hugging Face Space and check the first red error line.

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

Example Render API base URL:

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
