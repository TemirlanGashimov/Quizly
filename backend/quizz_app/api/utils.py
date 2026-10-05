from urllib.parse import urlparse, parse_qs


def extract_youtube_id(url):
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    video_ids = query_params.get("v")

    if video_ids:
        return video_ids[0]
    return None