# Animation benchmark laboratory

Owner doc for `src/benchmark-lab/` and `src/guided-scenes/validation/`: what
the laboratory is, how to run it, which expert sequences it reconstructs, and
what it is allowed to commit.

The laboratory answers one question — **how close can our Motion Canvas scene
kit get to expert mathematical animation, and which of the differences are
defects rather than taste?** — and converts the answer into gates that run
against production scenes.

## The two halves

| Half | Lives in | Purpose |
| --- | --- | --- |
| Benchmarks | `src/benchmark-lab/` | Reconstruct short expert excerpts and measure the replica against the reference across nine independent dimensions. |
| Production hard gates | `src/guided-scenes/validation/` | Run the *objective* subset of those checks against every real guided scene, with no per-scene instrumentation. |

The split is the point. A benchmark comparison produces both hard failures and
**craft** findings; only the hard ones become gates. Composition, pacing, and
typography stay evidence for
[scene-composition-grammar.md](scene-composition-grammar.md) and are never
auto-failed.

## Running it

```bash
./start.sh                                   # dev server
scripts/fetch-benchmark-media.sh             # local reference media (git-ignored)
open http://localhost:5173/dev/benchmark-lab # reference | replica | overlay | difference
open http://localhost:5173/dev/scene-gates   # hard gates over production scenes

node scripts/capture-benchmark-evidence.mjs  # regenerate measurements + paired frames
npx playwright test e2e/guided-scene-hard-gates.spec.ts   # the permanent gate
npx playwright test e2e/benchmark-lab.spec.ts             # the laboratory's own controls
node scripts/export-scene.mjs --scene benchmark:ab-split  # export a replica
```

Both pages are dev-only routes: `import.meta.env.DEV` drops them, and their
lazy module graphs, from production bundles.

## The benchmarks

One per curated reference pack. Timestamps are seconds in the source video;
commits are the pins in `.reference-sources/manifest.json`, which every
manifest re-asserts in a test so an analysis can never describe code that is
no longer on disk.

| Benchmark | Source | Repo @ commit | Excerpt | Chosen to test |
| --- | --- | --- | --- | --- |
| `eigen-span-stretch` | 3Blue1Brown, *Eigenvectors and eigenvalues* (`PFDu9oVAE-g`) | `3b1b/videos` @ `e317d6c5` | 117.4–129.5 s (12.1 s) | One complete continuous transform: the invariant span is drawn first, then grid, basis, and vector move together; pinned equation and no caption |
| `huffman-merge` | Reducible, *Huffman Codes* (`B3y0RsVCyrw`) | `nipunramk/Reducible` @ `88f4f8f7` | 1450.0–1462.5 s (12.5 s) | One greedy merge: persistent leaves travel into tree slots, a summed parent is born, and its queue copy re-sorts |
| `ab-split` | Tom Sláma, *(a,b)-trees* (`lifFgyB77zc`) | `xiaoxiae/videos` @ `f65794b0` | 310.6–317.9 s (7.3 s) | One structural repair: persistent key tokens split and rise while the leaf row stays pinned; violation colour retires |
| `bfs-frontier` | Jazon Jiao, *BFS visualized* (`mVzsz8Actrc`) | `JazonJiao/Manim.js` @ `7cd0da52` | 21.5–38.5 s (17.0 s) | An established pseudocode/graph frame: tracer movement, graph state, edge pulse, and computed enqueue numbers share one transition |

Adding a benchmark is a manifest + a replica scene + a window in
`referenceWindows.json` + locally fetched frames. No laboratory changes.

## What is committed

Committed: manifests, replica scenes, comparison code, gates, tests, and the
measurement reports under `measurements/`.

Never committed: reference video, extracted reference frames, and the paired
capture PNGs (half of every pair is reference media). `.gitignore` enforces it;
`scripts/fetch-benchmark-media.sh` reproduces it from
`referenceWindows.json`, which is also what `ffmpeg` slices, so the manifests
and the frames cannot drift.

Reference material is studied under the reference-only rules in
[../../engineering/reference-sources.md](../../engineering/reference-sources.md):
every replica is original code written from observation of rendered frames and
committed, paraphrased analyses. No scene code, narration, artwork, or asset
was copied.

## Measured result

All four focused replicas currently have zero hard failures and zero *measured*
craft findings. That does not mean zero visual difference: each report lists
accepted deviations separately, and the current windows deliberately do not
cover camera reframing, prediction overlays, intertitles, graph build-in, or
pseudocode write-in. The residuals below describe only the focused 7–17 second
windows:

| Benchmark | Checks passed | Worst event delta | Worst landmark delta | Declared deviations |
| --- | --- | --- | --- | --- |
| `eigen-span-stretch` | 39/39 | 0.00 s (2 events) | 0 px | 2 |
| `huffman-merge` | 64/64 | 0.00 s (4 events) | 0 px | 2 |
| `ab-split` | 44/44 | 0.00 s (2 events) | 12.2 px | 2 |
| `bfs-frontier` | 59/59 | 0.03 s (4 events) | 0 px | 1 |

Event times anchored to narration are accurate to their transcript segment;
times marked `estimated` were read from the reference frames. Where exact
matching is intentionally not pursued, the manifest records an accepted
deviation — layout rules, serif-versus-sans typography, or a randomised
reference graph fixed to a deterministic instance. Reports never turn those
declarations into an unqualified “zero differences” claim.

## Where the measurements are not the truth

Four measurement traps cost real time here, and each is now encoded in the
gates rather than in anyone's memory:

1. **A text node's box is not its ink.** It carries line leading, padding, and
   stroke — up to ~3.4× the glyph height for overlay captions, and 81 px for a
   single 28 px "x". Gates that must reason about what a reader sees derive
   glyph bands from `fontSize` and bound width by character count.
2. **`localToWorld()` is not the authored frame.** A node's `cacheBBox` unions
   its descendants, so rebasing on the view's *box* shifts every measurement in
   any scene whose geometry runs off one edge. The stage centre is the view's
   local origin carried into world space.
3. **A run that measured nothing must fail.** The first runner sampled zero
   frames — the player's duration arrives asynchronously — and every other gate
   dutifully reported "no findings". `checkRunSampledScene` now makes an empty
   run a failure, because "clean" and "never looked at" must never print the
   same.
4. **A node that failed measurement must remain observable.** The sampler
   carries the key, type, opacity, and failure reason into sampled frames and
   seek records. A visible unmeasurable node is a hard failure; a title or
   caption cannot hide a malformed mathematical line.

Production gates also include explicit semantic geometry contracts for the
scenes that promise Cartesian or transformed grids, displayed coordinate/arrow
agreement, and a whole-plane span. These contracts check axes at zero, integer
lattice families and shared intersections, the two displayed `p=(4,1)` arrows,
and the full-bleed whole-plane cue. They are intentionally narrower than a
general theorem prover, but they would reject the original half-shifted grid.
