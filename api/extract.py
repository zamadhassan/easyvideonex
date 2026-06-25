import json
from http.server import BaseHTTPRequestHandler

import yt_dlp


QUALITY_MAP = {
    "1080p": "best[height<=1080]/best",
    "720p": "best[height<=720]/best",
    "480p": "best[height<=480]/best",
    "360p": "best[height<=360]/best",
    "240p": "best[height<=240]/best",
}

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"


def build_options(quality, output_format):
    audio_only = output_format in {"mp3", "m4a"} or quality == "audio"
    return {
        "format": "bestaudio/best" if audio_only else QUALITY_MAP.get(quality, "best"),
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
        "nocheckcertificate": True,
        "retries": 2,
        "socket_timeout": 20,
        "source_address": "0.0.0.0",
        "http_headers": {
            "User-Agent": USER_AGENT,
            "Accept-Language": "en-US,en;q=0.9",
        },
    }


def pick_download_url(info, quality, output_format):
    entries = info.get("entries")
    if entries:
        info = entries[0] if isinstance(entries, list) else next(iter(entries), info)

    direct_url = info.get("url")
    formats = info.get("formats", [])
    if direct_url and not formats:
        return direct_url

    audio_only = output_format in {"mp3", "m4a"} or quality == "audio"
    if audio_only:
        for fmt in reversed(formats):
            if fmt.get("vcodec") == "none" and fmt.get("url"):
                return fmt["url"]
        for fmt in reversed(formats):
            if fmt.get("url"):
                return fmt["url"]
        return None

    try:
        requested_height = int(quality.replace("p", ""))
    except ValueError:
        requested_height = 720

    for fmt in reversed(formats):
        height = fmt.get("height") or 0
        has_video = fmt.get("vcodec") and fmt.get("vcodec") != "none"
        has_audio = fmt.get("acodec") and fmt.get("acodec") != "none"
        if height <= requested_height and has_video and has_audio and fmt.get("url"):
            return fmt["url"]

    for fmt in reversed(formats):
        height = fmt.get("height") or 0
        if height <= requested_height and fmt.get("url"):
            return fmt["url"]

    for fmt in reversed(formats):
        if fmt.get("url"):
            return fmt["url"]

    return direct_url


def extract_url(video_url, quality, output_format):
    with yt_dlp.YoutubeDL(build_options(quality, output_format)) as ydl:
        info = ydl.extract_info(video_url, download=False)
    if not info:
        return None
    return pick_download_url(info, quality, output_format)


class handler(BaseHTTPRequestHandler):
    def send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_json(200, {"ok": True})

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            data = json.loads(self.rfile.read(length) or b"{}")
            video_url = data.get("url")
            quality = data.get("quality") or "720p"
            output_format = data.get("format") or "mp4"

            if not video_url:
                self.send_json(400, {"success": False, "error": {"message": "URL is required."}})
                return

            download_url = extract_url(video_url, quality, output_format)
            if not download_url:
                self.send_json(404, {"success": False, "error": {"message": "No media URL found."}})
                return

            self.send_json(200, {"success": True, "downloadUrl": download_url})
        except Exception as exc:
            self.send_json(500, {"success": False, "error": {"message": str(exc)}})
