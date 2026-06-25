import sys, json, yt_dlp

url = sys.argv[1]
quality = sys.argv[2] if len(sys.argv) > 2 else "720p"
output_format = sys.argv[3] if len(sys.argv) > 3 else "mp4"
audio_only = output_format in {"mp3", "m4a"} or quality == "audio"

quality_map = {
    "1080p": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
    "720p": "bestvideo[height<=720]+bestaudio/best[height<=720]",
    "480p": "bestvideo[height<=480]+bestaudio/best[height<=480]",
    "360p": "bestvideo[height<=360]+bestaudio/best[height<=360]",
    "240p": "bestvideo[height<=240]+bestaudio/best[height<=240]",
}
fmt = "bestaudio/best" if audio_only else quality_map.get(quality, "bestvideo+bestaudio/best")

try:
    ydl_opts = {
        "format": fmt,
        "quiet": True,
        "no_warnings": True,
        "simulate": True,
        "dump_single_json": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        if not info:
            print(json.dumps({"error": "No info extracted"}))
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
                if f.get("vcodec") == "none" and f.get("url"):
                    print(json.dumps({"success": True, "downloadUrl": f["url"]}))
                    sys.exit(0)

            for f in reversed(formats):
                if f.get("url"):
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
                if h <= req_height and f.get("url"):
                    best = f
                    break
        if not best:
            for f in reversed(formats):
                if f.get("url"):
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
