import os
import base64

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
    cookies_b64 = os.environ.get("YOUTUBE_COOKIES_B64") or os.environ.get("YT_DLP_COOKIES_B64")
    if cookies_b64:
        cookies = base64.b64decode(cookies_b64).decode("utf-8")
    if not cookies:
        return None

    if os.path.exists(cookies):
        return cookies

    with open(COOKIE_PATH, "w", encoding="utf-8") as cookie_file:
        cookie_file.write(cookies.replace("\\n", "\n"))
    return COOKIE_PATH


def get_extractor_attempts(video_url: str):
    attempts = []
    if is_youtube_url(video_url):
        attempts.extend([
            {"extractor_args": {"youtube": {"player_client": ["android"]}}},
            {"extractor_args": {"youtube": {"player_client": ["ios"]}}},
            {"extractor_args": {"youtube": {"player_client": ["web"]}}},
            {"extractor_args": {"youtube": {"player_client": ["web_embedded"]}}},
            {"extractor_args": {"youtube": {"player_client": ["android_vr"]}}},
            {"extractor_args": {"youtube": {"player_client": ["web_safari"]}}},
            {"extractor_args": {"youtube": {"player_client": ["mweb"]}}},
        ])
    attempts.append({})
    return attempts


def has_media_format(info) -> bool:
    entries = info.get("entries")
    if entries:
        info = entries[0] if isinstance(entries, list) else next(iter(entries), info)

    if info.get("url"):
        return True

    for f in info.get("formats", []):
        has_video = f.get("vcodec") and f.get("vcodec") != "none"
        has_audio = f.get("acodec") and f.get("acodec") != "none"
        if f.get("url") and (has_video or has_audio):
            return True

    return False

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
        base_ydl_opts = {
            "format": "all",
            "ignore_no_formats_error": True,
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
                if info and has_media_format(info):
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
                has_audio = f.get("acodec") and f.get("acodec") != "none"
                if f.get("vcodec") == "none" and has_audio and f.get("url"):
                    return {"success": True, "downloadUrl": f["url"]}

            for f in reversed(formats):
                has_audio = f.get("acodec") and f.get("acodec") != "none"
                if has_audio and f.get("url"):
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
                has_video = f.get("vcodec") and f.get("vcodec") != "none"
                if h <= req_height and has_video and f.get("url"):
                    best = f
                    break
        if not best:
            for f in reversed(formats):
                has_video = f.get("vcodec") and f.get("vcodec") != "none"
                if has_video and f.get("url"):
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
