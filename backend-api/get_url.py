import os
import sys, json, yt_dlp

url = sys.argv[1]
quality = sys.argv[2] if len(sys.argv) > 2 else "720p"
output_format = sys.argv[3] if len(sys.argv) > 3 else "mp4"
audio_only = output_format in {"mp3", "m4a"} or quality == "audio"
COOKIE_PATH = "/tmp/youtube-cookies.txt"


def is_youtube_url(video_url):
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


def get_extractor_attempts(video_url):
    attempts = [{}]
    if is_youtube_url(video_url):
        attempts.extend([
            {"extractor_args": {"youtube": {"player_client": ["android"]}}},
            {"extractor_args": {"youtube": {"player_client": ["android_vr"]}}},
            {"extractor_args": {"youtube": {"player_client": ["web_safari"]}}},
            {"extractor_args": {"youtube": {"player_client": ["mweb"]}}},
        ])
    return attempts

quality_map = {
    "1080p": "best[height<=1080]/18/best",
    "720p": "best[height<=720]/18/best",
    "480p": "best[height<=480]/18/best",
    "360p": "best[height<=360]/18/best",
    "240p": "best[height<=240]/18/best",
}
fmt = "bestaudio/best" if audio_only else quality_map.get(quality, "18/best")

try:
    base_ydl_opts = {
        "format": fmt,
        "quiet": True,
        "no_warnings": True,
        "simulate": True,
        "dump_single_json": True,
    }
    cookie_file = get_cookie_file()
    if cookie_file:
        base_ydl_opts["cookiefile"] = cookie_file

    info = None
    last_error = None
    for extra_options in get_extractor_attempts(url):
        ydl_opts = {**base_ydl_opts, **extra_options}
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
            if info:
                break
        except Exception as e:
            last_error = e

    if not info:
        print(json.dumps({"error": str(last_error) if last_error else "No info extracted"}))
        sys.exit(1)

    entries = info.get("entries")
    if entries:
        info = entries[0] if isinstance(entries, list) else next(iter(entries), info)

    formats = info.get("formats", [])
    if not formats:
        url = info.get("url", "")
        if url:
            print(json.dumps({"success": True, "downloadUrl": url}))
            sys.exit(0)
        print(json.dumps({"error": "No formats found"}))
        sys.exit(1)

    if audio_only:
        for f in reversed(formats):
            has_audio = f.get("acodec") and f.get("acodec") != "none"
            if f.get("vcodec") == "none" and has_audio and f.get("url"):
                print(json.dumps({"success": True, "downloadUrl": f["url"]}))
                sys.exit(0)

        for f in reversed(formats):
            has_audio = f.get("acodec") and f.get("acodec") != "none"
            if has_audio and f.get("url"):
                print(json.dumps({"success": True, "downloadUrl": f["url"]}))
                sys.exit(0)

        print(json.dumps({"error": "No audio URL found"}))
        sys.exit(1)

    req_height = int(quality.replace("p", ""))
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
        print(json.dumps({"success": True, "downloadUrl": best["url"]}))
        sys.exit(0)

    print(json.dumps({"error": "No suitable URL found"}))
    sys.exit(1)

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
