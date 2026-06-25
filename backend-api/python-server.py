import yt_dlp
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Video Downloader API (yt-dlp)")

class DownloadRequest(BaseModel):
    url: str
    platform: str = "youtube"
    quality: str = "720p"
    format: str = "mp4"
    videoId: str = ""

@app.post("/api/download")
async def download(req: DownloadRequest):
    try:
        quality_map = {
            "1080p": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
            "720p": "bestvideo[height<=720]+bestaudio/best[height<=720]",
            "480p": "bestvideo[height<=480]+bestaudio/best[height<=480]",
            "360p": "bestvideo[height<=360]+bestaudio/best[height<=360]",
            "240p": "bestvideo[height<=240]+bestaudio/best[height<=240]",
        }
        fmt = quality_map.get(req.quality, "bestvideo+bestaudio/best")

        ydl_opts = {
            "format": fmt,
            "quiet": True,
            "no_warnings": True,
            "extract_flat": False,
            "simulate": True,
            "dump_single_json": True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(req.url, download=False)
            if not info:
                raise HTTPException(status_code=404, detail="No info extracted")

            entries = info.get("entries")
            if entries:
                info = entries[0] if isinstance(entries, list) else next(iter(entries), info)

            formats = info.get("formats", [])
            if not formats:
                url = info.get("url") or ""
                if url:
                    return {"success": True, "downloadUrl": url}
                raise HTTPException(status_code=404, detail="No video formats found")

            req_height = int(req.quality.replace("p", ""))
            best = None
            for f in reversed(formats):
                h = f.get("height") or 0
                if h <= req_height and f.get("url"):
                    best = f
                    break
            if not best:
                for f in reversed(formats):
                    if f.get("url"):
                        best = f
                        break

            if best and best.get("url"):
                return {"success": True, "downloadUrl": best["url"]}

            raise HTTPException(status_code=404, detail="Could not find a suitable video URL")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8787)
