import base64
import json
import os
from http.server import BaseHTTPRequestHandler

import yt_dlp


QUALITY_MAP = {
    "1080p": "best[height<=1080]/18/best",
    "720p": "best[height<=720]/18/best",
    "480p": "best[height<=480]/18/best",
    "360p": "best[height<=360]/18/best",
    "240p": "best[height<=240]/18/best",
}

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
COOKIE_PATH = "/tmp/youtube-cookies.txt"
VERSION = "extract-android-client-2026-07-05"


class ExtractionError(Exception):
    def __init__(self, message, attempts):
        super().__init__(message)
        self.attempts = attempts


def is_youtube_url(video_url):
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


def build_options(quality, output_format, extra_options=None):
    audio_only = output_format in {"mp3", "m4a"} or quality == "audio"
    options = {
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
    cookie_file = get_cookie_file()
    if cookie_file:
        options["cookiefile"] = cookie_file
    if extra_options:
        options.update(extra_options)
    return options


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
            has_audio = fmt.get("acodec") and fmt.get("acodec") != "none"
            if fmt.get("vcodec") == "none" and has_audio and fmt.get("url"):
                return fmt["url"]
        for fmt in reversed(formats):
            has_audio = fmt.get("acodec") and fmt.get("acodec") != "none"
            if has_audio and fmt.get("url"):
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
        has_video = fmt.get("vcodec") and fmt.get("vcodec") != "none"
        if height <= requested_height and has_video and fmt.get("url"):
            return fmt["url"]

    for fmt in reversed(formats):
        has_video = fmt.get("vcodec") and fmt.get("vcodec") != "none"
        if has_video and fmt.get("url"):
            return fmt["url"]

    return direct_url


def extract_url(video_url, quality, output_format):
    attempts = [("default", {})]
    if is_youtube_url(video_url):
        attempts.extend([
            ("youtube-android", {"extractor_args": {"youtube": {"player_client": ["android"]}}}),
            ("youtube-android-vr", {"extractor_args": {"youtube": {"player_client": ["android_vr"]}}}),
            ("youtube-web-safari", {"extractor_args": {"youtube": {"player_client": ["web_safari"]}}}),
            ("youtube-mweb", {"extractor_args": {"youtube": {"player_client": ["mweb"]}}}),
        ])

    last_error = None
    attempt_results = []
    for name, extra_options in attempts:
        try:
            with yt_dlp.YoutubeDL(build_options(quality, output_format, extra_options)) as ydl:
                info = ydl.extract_info(video_url, download=False)
            if info:
                download_url = pick_download_url(info, quality, output_format)
                if download_url:
                    return download_url
                attempt_results.append({"name": name, "error": "no media URL in extracted formats"})
        except Exception as exc:
            last_error = exc
            attempt_results.append({"name": name, "error": str(exc)})

    if last_error:
        raise ExtractionError(str(last_error), attempt_results)

    raise ExtractionError("No media URL found", attempt_results)


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

    def do_GET(self):
        self.send_json(200, {
            "ok": True,
            "version": VERSION,
            "cookiesConfigured": bool(os.environ.get("YOUTUBE_COOKIES") or os.environ.get("YT_DLP_COOKIES")),
            "cookiesBase64Configured": bool(os.environ.get("YOUTUBE_COOKIES_B64") or os.environ.get("YT_DLP_COOKIES_B64")),
        })

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
        except ExtractionError as exc:
            self.send_json(502, {
                "success": False,
                "error": {"message": str(exc), "requiresCookies": "cookies" in str(exc).lower() or "bot" in str(exc).lower()},
                "attempts": exc.attempts,
                "version": VERSION,
            })
        except Exception as exc:
            self.send_json(500, {"success": False, "error": {"message": str(exc)}, "version": VERSION})
