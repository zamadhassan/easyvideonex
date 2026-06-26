import os

import yt_dlp
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Video Downloader API (yt-dlp)")
COOKIE_PATH = "/tmp/youtube-cookies.txt"


def is_youtube_url(video_url: str) -> bool:
    return "youtube.com" in video_url or "youtu.be" in video_url


def get_cookie_file():
    cookies = os.environ.get("YOUTUBE_COOKIES") or os.environ.get("YT_DLP_COOKIES")
    if not cookies:
        return None

    if os.path.exists(cookies):
        return cookies

    with open(COOKIE_PATH, "w", encoding="utf-8") as cookie_file:
        cookie_file.write(cookies.replace("\\n", "\n"))
    return COOKIE_PATH


def get_extractor_attempts(video_url: str):
    attempts = [{}]
    if is_youtube_url(video_url):
        attempts.extend([
            {"extractor_args": {"youtube": {"player_client": ["android_vr"]}}},
            {"extractor_args": {"youtube": {"player_client": ["web_safari"]}}},
            {"extractor_args": {"youtube": {"player_client": ["mweb"]}}},
        ])
    return attempts

class DownloadRequest(BaseModel):
    url: str
    platform: str = "youtube"
    quality: str = "720p"
    format: str = "mp4"
    videoId: str = ""

@app.post("/api/download")
async def download(req: DownloadRequest):
    try:
        audio_only = req.format in {"mp3", "m4a"} or req.quality == "audio"
        quality_map = {
            "1080p": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
            "720p": "bestvideo[height<=720]+bestaudio/best[height<=720]",
            "480p": "bestvideo[height<=480]+bestaudio/best[height<=480]",
            "360p": "bestvideo[height<=360]+bestaudio/best[height<=360]",
            "240p": "bestvideo[height<=240]+bestaudio/best[height<=240]",
        }
        fmt = "bestaudio/best" if audio_only else quality_map.get(req.quality, "bestvideo+bestaudio/best")

        base_ydl_opts = {
            "format": fmt,
            "quiet": True,
            "no_warnings": True,
            "extract_flat": False,
            "simulate": True,
            "dump_single_json": True,
        }
        cookie_file = get_cookie_file()
        if cookie_file:
            base_ydl_opts["cookiefile"] = cookie_file

        info = None
        last_error = None
        for extra_options in get_extractor_attempts(req.url):
            ydl_opts = {**base_ydl_opts, **extra_options}
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(req.url, download=False)
                if info:
                    break
            except Exception as e:
                last_error = e

        if not info:
            if last_error:
                raise last_error
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

        if audio_only:
            for f in reversed(formats):
                if f.get("vcodec") == "none" and f.get("url"):
                    return {"success": True, "downloadUrl": f["url"]}

            for f in reversed(formats):
                if f.get("url"):
                    return {"success": True, "downloadUrl": f["url"]}

            raise HTTPException(status_code=404, detail="No audio URL found")

        req_height = int(req.quality.replace("p", ""))
        best = None
        for f in reversed(formats):
            h = f.get("height") or 0
            has_video = f.get("vcodec") and f.get("vcodec") != "none"
            has_audio = f.get("acodec") and f.get("acodec") != "none"
            if h <= req_height and has_video and has_audio and f.get("url"):
                best = f
                break
        if not best:
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
    port = int(os.environ.get("PORT", "8787"))
    host = os.environ.get("HOST", "0.0.0.0" if "PORT" in os.environ else "127.0.0.1")
    uvicorn.run(app, host=host, port=port)
