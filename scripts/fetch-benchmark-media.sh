#!/usr/bin/env bash
[ -z "${BASH_VERSION:-}" ] && exec bash "$0" "$@"
# Fetch the git-ignored reference media the benchmark laboratory compares
# against. Reads src/benchmark-lab/manifests/referenceWindows.json, downloads
# each source video once with yt-dlp (video-only, <=720p), and extracts the
# benchmark windows as 960x540 JPEG frame sequences with ffmpeg.
#
# Output layout (ALL of it ignored; see .gitignore):
#   .reference-sources/media/<videoId>.mp4
#   .reference-sources/media/frames/<benchmarkId>/00001.jpg ...
#   .reference-sources/media/frames/<benchmarkId>/meta.json
#
# Reference media is study material under the same reference-only rules as the
# cloned repos (docs/engineering/reference-sources.md): never committed, never
# bundled, never shipped. The lab serves it in dev only.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WINDOWS="$ROOT/src/benchmark-lab/manifests/referenceWindows.json"
MEDIA="$ROOT/.reference-sources/media"

command -v yt-dlp >/dev/null || { echo "yt-dlp is required (pip3 install --user yt-dlp)" >&2; exit 1; }
command -v ffmpeg >/dev/null || { echo "ffmpeg is required" >&2; exit 1; }
command -v python3 >/dev/null || { echo "python3 is required" >&2; exit 1; }

mkdir -p "$MEDIA/frames"

only="${1:-}"

python3 - "$WINDOWS" <<'PY' | while read -r bench vid start end fps; do
import json, sys
data = json.load(open(sys.argv[1]))
for w in data["windows"]:
    print(w["benchmarkId"], w["videoId"], w["start"], w["end"], w["frameFps"])
PY
  if [[ -n "$only" && "$only" != "$bench" ]]; then continue; fi

  video="$MEDIA/$vid.mp4"
  if [[ ! -s "$video" ]]; then
    echo "== downloading $vid"
    yt-dlp -f 'bv*[height<=720][ext=mp4]/bv*[height<=720]/b[height<=720]' \
      --no-part -o "$video" "https://www.youtube.com/watch?v=$vid" </dev/null
  else
    echo "== $vid.mp4 already present"
  fi

  out="$MEDIA/frames/$bench"
  if [[ -s "$out/meta.json" ]]; then
    echo "== frames for $bench already extracted"
    continue
  fi
  echo "== extracting $bench [$start-$end] @ ${fps}fps"
  rm -rf "$out"; mkdir -p "$out"
  ffmpeg -nostdin -hide_banner -loglevel error -ss "$start" -to "$end" -i "$video" \
    -vf "fps=$fps,scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:black" \
    -q:v 3 "$out/%05d.jpg"
  count=$(ls "$out" | wc -l)
  python3 - "$out/meta.json" "$bench" "$vid" "$start" "$end" "$fps" "$count" <<'PY'
import json, sys
path, bench, vid, start, end, fps, count = sys.argv[1:]
json.dump({"benchmarkId": bench, "videoId": vid, "start": float(start),
           "end": float(end), "frameFps": float(fps), "frameCount": int(count)},
          open(path, "w"), indent=2)
PY
  echo "   $count frames"
done

echo "done"
