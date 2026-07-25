#!/usr/bin/env python3
"""Fetch YouTube captions + metadata into the local transcript reference cache.

Downloads NO video media by default. For each video it saves, under
<output-dir>/<video-id>/:

  metadata.json   video id, title, channel, upload date, url, language,
                  caption provenance (manual / automatic / whisper-local)
  captions.orig.* the original caption file as served (json3 or vtt)
  transcript.json normalized machine-readable transcript:
                    {"video": {...}, "segments": [{"start", "duration", "text"}]}
  transcript.txt  clean plain-text transcript

Caption preference: creator-supplied English captions, then automatic English
captions. Videos already fetched are skipped unless --force is given.

Examples:
  scripts/fetch-transcripts.py https://www.youtube.com/watch?v=dQw4w9WgXcQ
  scripts/fetch-transcripts.py --limit 5 https://www.youtube.com/playlist?list=PL...
  scripts/fetch-transcripts.py --output-dir /tmp/tr --force <url> <url>
  scripts/fetch-transcripts.py --whisper <url>   # EXPLICIT local-transcription
                                                 # fallback for caption-less videos
                                                 # (downloads audio; needs
                                                 # faster-whisper + ffmpeg)

Transcripts fetched here are third-party reference material: keep them inside
the Git-ignored cache (.reference-sources/transcripts/) and never commit them.
See docs/engineering/reference-sources.md.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path

DEFAULT_OUTPUT_DIR = (
    Path(__file__).resolve().parent.parent / ".reference-sources" / "transcripts"
)
SUBTITLE_LANGS = ["en", "en-US", "en-GB", "en-orig"]
# Conservative request behavior: pause between per-video requests.
SLEEP_BETWEEN_VIDEOS_S = 1.5


def die(message: str) -> "NoReturn":  # type: ignore[name-defined]
    print(f"error: {message}", file=sys.stderr)
    sys.exit(1)


def load_yt_dlp():
    try:
        import yt_dlp  # type: ignore

        return yt_dlp
    except ImportError:
        die(
            "yt-dlp is not installed. Install it with:\n"
            "  pip3 install --user yt-dlp\n"
            "(or pipx install yt-dlp)"
        )


@dataclass
class Segment:
    start: float
    duration: float
    text: str

    def as_json(self) -> dict:
        return {
            "start": round(self.start, 3),
            "duration": round(self.duration, 3),
            "text": self.text,
        }


@dataclass
class FetchResult:
    fetched: list[str] = field(default_factory=list)
    skipped: list[str] = field(default_factory=list)
    no_captions: list[str] = field(default_factory=list)
    failed: list[str] = field(default_factory=list)


# --------------------------------------------------------------------------
# Caption normalization (pure functions — unit-testable without network)
# --------------------------------------------------------------------------

def normalize_json3(raw: str) -> list[Segment]:
    """Normalize YouTube's json3 caption format into segments."""
    data = json.loads(raw)
    segments: list[Segment] = []
    for event in data.get("events", []):
        if "segs" not in event:
            continue
        text = "".join(seg.get("utf8", "") for seg in event["segs"])
        text = clean_text(text)
        if not text:
            continue
        start = event.get("tStartMs", 0) / 1000.0
        duration = event.get("dDurationMs", 0) / 1000.0
        segments.append(Segment(start=start, duration=duration, text=text))
    return dedupe_rolling(segments)


_VTT_TIME = re.compile(
    r"(?:(\d+):)?(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(?:(\d+):)?(\d{2}):(\d{2})[.,](\d{3})"
)


def _vtt_seconds(h: str | None, m: str, s: str, ms: str) -> float:
    return int(h or 0) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000.0


def normalize_vtt(raw: str) -> list[Segment]:
    """Normalize a WebVTT caption file into segments."""
    segments: list[Segment] = []
    lines = raw.splitlines()
    i = 0
    while i < len(lines):
        match = _VTT_TIME.search(lines[i])
        if not match:
            i += 1
            continue
        start = _vtt_seconds(*match.groups()[0:4])
        end = _vtt_seconds(*match.groups()[4:8])
        i += 1
        text_lines: list[str] = []
        while i < len(lines) and lines[i].strip() and "-->" not in lines[i]:
            text_lines.append(lines[i])
            i += 1
        text = clean_text(" ".join(text_lines))
        if text:
            segments.append(Segment(start=start, duration=max(0.0, end - start), text=text))
    return dedupe_rolling(segments)


_TAG = re.compile(r"<[^>]+>")
_WS = re.compile(r"\s+")


def clean_text(text: str) -> str:
    """Strip inline cue tags/entities and collapse whitespace."""
    text = _TAG.sub("", text)
    text = (
        text.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&#39;", "'")
        .replace("&quot;", '"')
        .replace("​", "")
    )
    return _WS.sub(" ", text).strip()


def dedupe_rolling(segments: list[Segment]) -> list[Segment]:
    """Drop the rolling-window duplicates YouTube auto-captions produce.

    Auto captions often emit each line twice (once as a live cue, once as part
    of the next two-line window). Keep the first occurrence.
    """
    result: list[Segment] = []
    for seg in segments:
        if result and seg.text == result[-1].text:
            # Same text again: extend the previous cue instead of duplicating.
            prev = result[-1]
            prev.duration = max(prev.duration, seg.start + seg.duration - prev.start)
            continue
        result.append(seg)
    return result


def to_plain_text(segments: list[Segment]) -> str:
    """Clean readable text: one paragraph break at gaps > 4s."""
    parts: list[str] = []
    prev_end = 0.0
    for seg in segments:
        if parts and seg.start - prev_end > 4.0:
            parts.append("\n\n")
        elif parts:
            parts.append(" ")
        parts.append(seg.text)
        prev_end = seg.start + seg.duration
    return "".join(parts).strip() + "\n"


def sanitize_id(video_id: str) -> str:
    """YouTube ids are [-_A-Za-z0-9]; refuse anything path-hostile."""
    if not re.fullmatch(r"[-_A-Za-z0-9]{6,64}", video_id):
        die(f"refusing suspicious video id for a filesystem path: {video_id!r}")
    return video_id


# --------------------------------------------------------------------------
# Fetching
# --------------------------------------------------------------------------

def enumerate_video_urls(yt_dlp, url: str, limit: int | None) -> list[str]:
    """Expand a playlist/channel URL into watch URLs; pass videos through."""
    opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": "in_playlist",
        "skip_download": True,
    }
    if limit is not None:
        # Bound the enumeration itself rather than slicing afterwards: a channel
        # can hold thousands of entries, and paging all of them to keep five is
        # both slow and needlessly hard on the server.
        opts["playlistend"] = limit
        opts["playlist_items"] = f"1:{limit}"
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)
    if info is None:
        return []
    if info.get("_type") == "playlist":
        entries = [e for e in info.get("entries") or [] if e]
        if limit is not None:
            # Belt and braces: extractors that ignore playlistend still get cut.
            entries = entries[:limit]
        return [
            e.get("url") or f"https://www.youtube.com/watch?v={e['id']}"
            for e in entries
        ]
    return [url]


def pick_captions(info: dict) -> tuple[str, str, dict] | None:
    """Choose the best caption track: (provenance, lang, track_dict)."""
    for source, provenance in (("subtitles", "manual"), ("automatic_captions", "automatic")):
        tracks = info.get(source) or {}
        for lang in SUBTITLE_LANGS:
            formats = tracks.get(lang)
            if not formats:
                continue
            by_ext = {f.get("ext"): f for f in formats}
            chosen = by_ext.get("json3") or by_ext.get("vtt") or formats[0]
            return provenance, lang, chosen
    return None


def download_caption_data(yt_dlp, track: dict) -> tuple[str, str]:
    """Download a caption track's payload. Returns (ext, raw_text)."""
    import urllib.request

    url = track["url"]
    ext = track.get("ext") or "vtt"
    req = urllib.request.Request(url, headers={"User-Agent": yt_dlp.utils.random_user_agent()})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return ext, resp.read().decode("utf-8", errors="replace")


def video_metadata(info: dict, provenance: str, lang: str) -> dict:
    return {
        "id": info["id"],
        "title": info.get("title"),
        "channel": info.get("channel") or info.get("uploader"),
        "channel_id": info.get("channel_id"),
        "upload_date": info.get("upload_date"),
        "duration": info.get("duration"),
        "source_url": info.get("webpage_url") or f"https://www.youtube.com/watch?v={info['id']}",
        "language": lang,
        "captions": provenance,  # "manual" | "automatic" | "whisper-local"
    }


def write_outputs(
    out_dir: Path,
    metadata: dict,
    segments: list[Segment],
    orig_ext: str | None,
    orig_raw: str | None,
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "metadata.json").write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False) + "\n"
    )
    if orig_raw is not None:
        (out_dir / f"captions.orig.{orig_ext}").write_text(orig_raw)
    (out_dir / "transcript.json").write_text(
        json.dumps(
            {"video": metadata, "segments": [s.as_json() for s in segments]},
            indent=2,
            ensure_ascii=False,
        )
        + "\n"
    )
    (out_dir / "transcript.txt").write_text(to_plain_text(segments))


def already_fetched(out_dir: Path) -> bool:
    return (out_dir / "transcript.json").exists() and (out_dir / "metadata.json").exists()


def fetch_video(yt_dlp, url: str, output_dir: Path, force: bool, whisper: bool, result: FetchResult) -> None:
    opts = {"quiet": True, "no_warnings": True, "skip_download": True}
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)
    if info is None:
        result.failed.append(url)
        return

    video_id = sanitize_id(info["id"])
    out_dir = output_dir / video_id
    if already_fetched(out_dir) and not force:
        print(f"  skip (cached): {video_id}  {info.get('title', '')}")
        result.skipped.append(video_id)
        return

    picked = pick_captions(info)
    if picked is None:
        if whisper:
            transcribe_with_whisper(yt_dlp, info, out_dir, result)
        else:
            print(
                f"  no English captions: {video_id}  {info.get('title', '')}"
                "  (re-run with --whisper to transcribe locally)"
            )
            result.no_captions.append(video_id)
        return

    provenance, lang, track = picked
    ext, raw = download_caption_data(yt_dlp, track)
    segments = normalize_json3(raw) if ext == "json3" else normalize_vtt(raw)
    if not segments:
        print(f"  caption track was empty: {video_id}")
        result.no_captions.append(video_id)
        return

    write_outputs(out_dir, video_metadata(info, provenance, lang), segments, ext, raw)
    print(f"  fetched ({provenance}/{lang}, {len(segments)} segments): {video_id}  {info.get('title', '')}")
    result.fetched.append(video_id)


def transcribe_with_whisper(yt_dlp, info: dict, out_dir: Path, result: FetchResult) -> None:
    """EXPLICIT fallback: download audio and transcribe locally.

    Only reached with --whisper. Output is labeled "whisper-local" because it
    is NOT creator-provided and may contain recognition errors.
    """
    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ImportError:
        die(
            "--whisper requires faster-whisper. Install it with:\n"
            "  pip3 install --user faster-whisper"
        )

    video_id = info["id"]
    print(f"  transcribing locally (downloads audio): {video_id}")
    import tempfile

    with tempfile.TemporaryDirectory(prefix="yt-audio-") as tmp:
        audio_opts = {
            "quiet": True,
            "no_warnings": True,
            "format": "bestaudio/best",
            "outtmpl": f"{tmp}/%(id)s.%(ext)s",
        }
        with yt_dlp.YoutubeDL(audio_opts) as ydl:
            ydl.download([info["webpage_url"]])
        audio_files = list(Path(tmp).iterdir())
        if not audio_files:
            result.failed.append(video_id)
            return
        model = WhisperModel("base.en", compute_type="int8")
        whisper_segments, _ = model.transcribe(str(audio_files[0]))
        segments = [
            Segment(start=s.start, duration=s.end - s.start, text=clean_text(s.text))
            for s in whisper_segments
            if clean_text(s.text)
        ]

    if not segments:
        result.failed.append(video_id)
        return
    write_outputs(out_dir, video_metadata(info, "whisper-local", "en"), segments, None, None)
    print(f"  transcribed locally ({len(segments)} segments): {video_id} [whisper-local]")
    result.fetched.append(video_id)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("urls", nargs="+", help="YouTube video, playlist, or channel URLs")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"cache directory (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument("--force", action="store_true", help="re-fetch even if cached")
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="max videos to take from each playlist/channel",
    )
    parser.add_argument(
        "--whisper",
        action="store_true",
        help="for videos WITHOUT captions: download audio and transcribe locally "
        "with faster-whisper; output is labeled whisper-local (off by default)",
    )
    args = parser.parse_args(argv)

    yt_dlp = load_yt_dlp()

    result = FetchResult()
    video_urls: list[str] = []
    for url in args.urls:
        try:
            video_urls.extend(enumerate_video_urls(yt_dlp, url, args.limit))
        except Exception as error:  # noqa: BLE001 — surface per-URL failures, keep going
            print(f"  failed to enumerate {url}: {error}", file=sys.stderr)
            result.failed.append(url)

    for index, url in enumerate(video_urls):
        if index > 0:
            time.sleep(SLEEP_BETWEEN_VIDEOS_S)
        try:
            fetch_video(yt_dlp, url, args.output_dir, args.force, args.whisper, result)
        except Exception as error:  # noqa: BLE001
            print(f"  failed {url}: {error}", file=sys.stderr)
            result.failed.append(url)

    print(
        f"\ndone: {len(result.fetched)} fetched, {len(result.skipped)} cached, "
        f"{len(result.no_captions)} without captions, {len(result.failed)} failed"
    )
    return 1 if result.failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
