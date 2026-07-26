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
| `eigen-span-stretch` | 3Blue1Brown, *Eigenvectors and eigenvalues* (`PFDu9oVAE-g`) | `3b1b/videos` @ `e317d6c5` | 117.4–202.5 s | Continuous geometric transformation; span anchors drawn before motion; gradient fans as one family; a label riding a tip as identity's receipt; **no titles or captions** |
| `huffman-merge` | Reducible, *Huffman Codes* (`B3y0RsVCyrw`) | `nipunramk/Reducible` @ `88f4f8f7` | 1450–1497 s | Algorithm/tree choreography; persistent objects across structural change; parents born at the merge; the queue-token/tree-node double identity |
| `ab-split` | Tom Sláma, *(a,b)-trees* (`lifFgyB77zc`) | `xiaoxiae/videos` @ `f65794b0` | 299–366 s | Keys that travel and never fade; a pinned leaf row with growth at the root; **camera reframing**; a full-frame pause prompt; one reserved violation colour |
| `bfs-frontier` | Jazon Jiao, *BFS visualized* (`mVzsz8Actrc`) | `JazonJiao/Manim.js` @ `7cd0da52` | 0–40 s | **No narration at all**: an intertitle, staggered build-in, a pseudocode panel paced by text length, and a tracer driven by the same transition that mutates the graph |

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

All four replicas currently pass every dimension with no craft findings
outstanding. The residuals are the honest measure of how close the kit gets:

| Benchmark | Checks passed | Worst event delta | Worst landmark delta | Declared deviations |
| --- | --- | --- | --- | --- |
| `eigen-span-stretch` | 179/179 | 0.10 s (15 events) | 0 px | 4 |
| `huffman-merge` | 201/201 | 0.00 s (11 events) | 0 px | 3 |
| `ab-split` | 152/152 | 0.70 s (11 events) | 12.2 px | 5 |
| `bfs-frontier` | 103/103 | 0.29 s (8 events) | 0 px | 3 |

Event times anchored to narration are accurate to their transcript segment;
times marked `estimated` in a manifest were read off the reference frames, and
`ab-split`'s 0.70 s worst case sits in its un-narrated batch-insert montage,
which has no spoken anchor to align to. Where exact matching was impossible the
manifest says so in `knownDeviations` — different layout rules, LaTeX serif
versus the repo's sans stack, a randomised reference graph fixed to a
deterministic instance, and a camera reframed by group transform because the
runtime has no camera rig.

## Where the measurements are not the truth

Three measurement traps cost real time here, and each is now encoded in the
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
