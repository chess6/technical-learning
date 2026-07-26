# Video export for guided scenes

Reproducible Motion Canvas → MP4 export for any registered guided scene.
Exported video is an **additional mode**, not a replacement: the live player,
checkpoints, explorations, and synchronized lesson content stay as they are.

## Commands

```bash
npm run export:list                       # list exportable scene ids
npm run export:scene -- --scene red-black-encoding
npm run export:scene -- --scene eigenvectors-derivation \
  --fps 30 --scale 2 --out exports/ --keep-frames
```

Options: `--fps <n>` (default 30), `--scale <n>` resolution multiplier of the
960×540 stage (default 2 → 1920×1080; 4 → 4K), `--out <dir>` (default
`exports/`, Git-ignored), `--port <n>`, `--keep-frames`, repeatable `--scene`,
plus the two watchdogs below.

The authoring review preview is intentionally a different artifact:

```bash
npm run animation:review -- --scene matrix-transformations
```

It produces a low-resolution, short prediction-to-reveal excerpt plus labelled
checkpoint evidence under `artifacts/animation-review/`. It is optimized for a
fast review loop and is not a shareable production export. Use `export:scene`
for final MP4 inspection and delivery.

**The run cannot hang.** A renderer that throws before reaching its own error
path (bad scene module, WebGL failure) is caught and reported rather than
leaving the drain loop spinning, and two independent timeouts bound every
pass: `--stall-timeout` (default 90 s with no new frame) and `--scene-timeout`
(default 1800 s for a whole scene). Any of these fails the run with a non-zero
exit. Chromium and a script-started dev server are torn down on every exit
path, including Ctrl-C, so no headless browser is left behind.

## How it works

`scripts/export-scene.mjs` reuses the dev server (or starts one), opens
`/export-harness.html` in headless Chromium (via the installed
`@playwright/test`), and runs Motion Canvas's own `Renderer` — the editor's
deterministic export path — over the scene built by the same plugin-free
`buildGuidedProject` the live player uses (ADR 001, ADR 003). Frames are
handed to Node through an in-page exporter (the stock `ImageExporter` needs
the Motion Canvas vite plugin's HMR channel, which this repo cannot use) and
assembled with FFmpeg:

```
libx264 · crf 18 · yuv420p · -movflags +faststart   (web-streamable)
```

If FFmpeg is missing, the PNG sequence is kept and the exact assembly command
is printed. The harness page is dev-server-only: `vite build` bundles
`index.html` alone, and nothing in the app imports the harness.

## Limitations — read before sharing an export

- **Only what the Motion Canvas scene draws is captured.** Lesson prose, KaTeX
  equation blocks, captions rendered by React, checkpoints, worked examples,
  and explorations live *outside* the scene and do not appear in the video.
  A guided scene is authored as one half of a split-screen lesson; its MP4 is
  not a standalone lesson recording and must not be presented as one.
- If a standalone video is ever needed, author a **separate opt-in scene
  composition** that places the required explanatory material inside the
  Motion Canvas frame. Do not duplicate lesson prose into every live scene to
  make exports self-contained — that degrades the lesson to serve the export.
- Scenes render at their authored 960×540 stage geometry; `--scale` raises
  pixel density, not layout size, so safe-frame guarantees carry over.
- Do not edit files under `src/` while an export is running: the dev server's
  HMR reload destroys the render pass (the CLI retries once).
- Generated videos stay out of Git (`exports/` is ignored).
