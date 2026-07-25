# Reference sources (animation repos, transcripts, packs)

Owner doc for the **reference-only study cache** under `.reference-sources/`:
what it is, how to (re)fetch it, what may be committed, and how lesson authors
use it without copying anything.

The purpose of this system is narrow: let an author or agent inspect carefully
selected animation **source code** and **timestamped narration** side by side,
extract *pedagogical patterns* (sequencing, persistent objects, invariants,
framing, pacing), and apply those patterns to **original** Motion Canvas
lessons. It is not an inspiration archive and must not grow into one.

## Layout

```text
.reference-sources/
├── manifest.json            # COMMITTED: url + inspected SHA + framework + license per repo
├── animation-repos/         # ignored: shallow clones of the reference repositories
├── transcripts/             # ignored: fetched captions/metadata per video id
└── packs/<video-id>/        # curated video ↔ source pairings
    ├── source.json          # COMMITTED: video id/title/channel, repo slug + SHA, scene paths
    ├── scene-map.json       # COMMITTED: transcript beats ↔ scene classes/files (timestamps)
    ├── analysis.md          # COMMITTED: paraphrased pedagogical analysis
    ├── transcript.json      # ignored: copied from transcripts/<id>/ for convenience
    └── transcript.txt       # ignored
```

`.gitignore` enforces the split: clones, transcripts, and any raw caption
material stay local; only the manifest, pack metadata, and **paraphrased**
analyses are committed.

## Fetching

```bash
scripts/fetch-animation-references.sh            # clone missing / update all (idempotent, shallow)
scripts/fetch-animation-references.sh --status   # local HEADs, no network
scripts/fetch-animation-references.sh xiaoxiae-videos   # limit to one slug

scripts/fetch-transcripts.py <video/playlist/channel URL>...
scripts/fetch-transcripts.py --limit 5 <playlist-url>    # cap playlist expansion
scripts/fetch-transcripts.py --force <url>               # ignore the cache
scripts/fetch-transcripts.py --whisper <url>             # EXPLICIT local transcription for
                                                         # caption-less videos (downloads audio;
                                                         # needs faster-whisper; output labeled
                                                         # "whisper-local", not creator-provided)
```

The transcript tool needs `yt-dlp` (`pip3 install --user yt-dlp`). It downloads
no video media by default, prefers creator-supplied English captions, falls back
to automatic ones, sleeps between requests, and skips already-fetched videos.
Normalized output per video: `metadata.json`, the original caption file,
`transcript.json` (`{"segments": [{"start", "duration", "text"}]}`), and
`transcript.txt`. Provenance is recorded as `manual` / `automatic` /
`whisper-local`. Offline unit tests for the normalization layer:
`python3 -m pytest scripts/test_fetch_transcripts.py`.

## Licensing and the reference-only rule

`manifest.json` records each repository's license. Most of these repositories
declare **no license** (all rights reserved), one is **GPL-3.0** (copyleft),
one is **CC BY-NC-SA** — and transcripts are creator-owned in every case.
Therefore, regardless of license:

- **Never** copy scene code, prose, narration, artwork, equations-as-authored,
  or assets from a reference into this app. Treat every repository as
  reference-only, even the MIT one.
- Committed analyses **paraphrase**; they may quote at most a short phrase for
  identification and must cite timestamps rather than reproducing transcript
  passages.
- What you *may* take: structural ideas — beat ordering, what stays on screen,
  which invariant is made visible, when a prediction is asked for. Ideas are
  re-expressed from scratch in our own scene kit and voice.

## How lesson authors use a pack

1. Read the pack's `analysis.md` for the explanatory arc (starting mental
   model → central insight → beats).
2. Open `scene-map.json` to jump between a narration beat and the reference
   scene class that renders it; read the reference source in
   `.reference-sources/animation-repos/<slug>/` (fetch first if absent).
3. Steal the *pattern*, not the scene: write an original storyboard in our
   segment/beat model (`src/guided-scenes/scenes/sceneTimings.ts`) that serves
   our lesson's mastery goals — including where our interactive checkpoints and
   explorations do a job the video could only gesture at.
4. Judge the result against `docs/authoring/animation-quality-bar.md`, not
   against how closely it resembles the reference.

## Adding a new reference

- New repository: add a `slug|url` line to
  `scripts/fetch-animation-references.sh`, run it, and record the SHA,
  framework, and license in `manifest.json` in the same change.
- New pack: create `.reference-sources/packs/<video-id>/` with `source.json`,
  `scene-map.json`, and `analysis.md`; keep transcripts out of Git. A pack is
  only worth committing when the video↔source mapping is reliable and the
  analysis answers to a concrete lesson we are building or improving.
