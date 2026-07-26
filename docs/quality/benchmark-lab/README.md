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

Four core causal windows cover every curated reference pack; four additional treatment windows close the presentation gaps. Timestamps are seconds in the source video;
commits are the pins in `.reference-sources/manifest.json`, which every
manifest re-asserts in a test so an analysis can never describe code that is
no longer on disk.

| Benchmark | Excerpt | Measured treatment |
| --- | --- | --- |
| `eigen-span-stretch` | 117.4–129.5 s (12.1 s) | Continuous grid/vector transform with pinned equation and invariant span |
| `huffman-merge` | 1450.0–1462.5 s (12.5 s) | Persistent-token greedy merge and visible queue re-sort |
| `ab-split` | 310.6–317.9 s (7.3 s) | Persistent-key structural repair with pinned leaf row |
| `bfs-frontier` | 21.5–38.5 s (17.0 s) | Synchronized pseudocode tracer and graph-state transition |
| `bfs-intertitle-build` | 0.0–12.5 s (12.5 s) | Full-frame intertitle into staggered node/edge build |
| `bfs-pseudocode-writein` | 12.5–21.5 s (9.0 s) | Length-paced pseudocode write-in beside fixed geometry |
| `ab-prediction-reveal` | 302.9–317.9 s (15.0 s) | Frozen full-frame prediction treatment followed by reveal |
| `ab-camera-reframe` | 340.6–352.6 s (12.0 s) | Viewport reframe around a local proof and temporary annotation |

The eight windows total 97.4 seconds. No single window exceeds 17 seconds; the five newly covered treatments live in 9–15 second windows, so the laboratory never restores the earlier 40–85 second replicas.

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

All eight focused replicas currently have zero hard failures and zero runtime-generated craft findings. That sentence is deliberately qualified: it describes only the checks the sampler ran. Every remaining difference is listed with one of four classifications — `measured finding`, `accepted with rationale`, `blocked by runtime limitation`, or `intentionally different for product semantics`. A manifest declaration cannot silently become accepted: the validator requires a separate rationale.

| Benchmark | Checks | Worst event delta | Worst landmark delta | Classified deviations |
| --- | ---: | ---: | ---: | ---: |
| `eigen-span-stretch` | 39/39 | 0.00 s | 0 px | 2 |
| `huffman-merge` | 60/60 | 0.00 s | — | 2 |
| `ab-split` | 44/44 | 0.00 s | 12.2 px | 2 |
| `bfs-frontier` | 56/56 | 0.03 s | — | 1 |
| `bfs-intertitle-build` | 40/40 | 0.29 s | — | 2 |
| `bfs-pseudocode-writein` | 23/23 | 0.00 s | — | 1 |
| `ab-prediction-reveal` | 62/62 | 0.00 s | — | 2 |
| `ab-camera-reframe` | 31/31 | 0.00 s | — | 2 |

Composition landmarks participate in grading only when they carry an explicit local reference-frame time. Replica-layout landmarks were removed; missing independent geometry is shown as missing evidence, never as a zero-pixel match. Events use scene-map or observed reference anchors, and paired reference/replica captures are produced for every beat.

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
