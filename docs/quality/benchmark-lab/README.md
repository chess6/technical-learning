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

## Design experiments (`?mode=design`)

The laboratory's second job. A **design experiment** is several complete,
playable candidate clips for ONE lesson, shown in a large 16:9 viewport with the
transport and the design thesis outside the frame. There is no reference to
diff against and no check run: candidates are competing hypotheses about how to
teach something, and scoring them against each other automatically would be a
category error. Open it at `/dev/benchmark-lab?mode=design`; the candidate is in
the URL, so one can be linked.

Candidates live under `src/benchmark-lab/experiments/` and are deliberately NOT
in the replica registry, whose ids are checked against the benchmark manifests.
They share the production `runSegment`, so a beat body that outgrows its
declared length logs an overrun the browser spec fails on.

### Elimination — reference evidence (2026-07)

Watched in the laboratory before implementing: `eigen-span-stretch`
(3Blue1Brown, chapter 14), `bfs-pseudocode-writein` and `bfs-intertitle-build`
(Jazon Jiao), `ab-prediction-reveal` and `ab-split` (Tom Sláma). Principles
extracted — as principles, not choreography:

- **One serif face for the whole frame.** Matrices, row labels, numerals, and
  even intertitles are the same mathematical type. Nothing is set in a UI font.
- **Symbols wear the colour of the geometry they denote.** 3b1b's matrix entries
  are coloured by column to match the basis arrows, so the algebra and the
  picture are one object seen twice.
- **Two or three hues, each carrying one meaning**, on near-black, with
  everything else monochrome. Sláma reserves red for the rule that is broken.
- **Intertitles are thin italic labels with a rule**, not chrome — and the frame
  at `t = 0` is already readable.
- **Text builds in place**; it is not cross-faded and never interpolated.
- **Most of the frame is empty.** One focal cluster at a time.
- **A prediction is a held frame with the evidence still on screen.**

### What the production `elimination` scene does against that bar

Recorded here because it is what the experiment is trying to beat:

1. **Coefficients tick continuously.** R₂'s three numbers are interpolated from
   their old values to their new ones, so for ~2.6 s the frame shows
   `1.87x − 1.38y = 5.13` — an equation nobody wrote.
2. **The origin of the result entries is never shown.** `2−2=0`, `−1−6=−7`,
   `5−(−2)=7` do not appear; a scratch row slides up and the digits change.
3. **The augmented matrix is a monospaced string** built from `[`, `|`, `]`
   characters. It cannot align, and an entry has no identity.
4. **Everything is set in the product sans/mono stack**, with no italic
   variables and hyphens for minus signs.
5. **A permanent three-panel dashboard**, whose ledger overlaps the geometry
   viewport, and whose panel borders read as UI rather than as mathematics.
6. **Row labels and headings are ~22 px on a 960-px stage** — small at embedded
   player size.

### Elimination — outcome (2026-07)

Accepted: **A + B**, and it is now the production `elimination` scene. The
combined clip runs A's arithmetic spine and then B's geometric payoff, with two
changes asked for on review: R₂'s entries **leave the bracket themselves**,
dimming everything else and leaving a translucent record of the row in the slot
they vacate, rather than a duplicate being made in a working area (and the
column guide lines are gone); and the matrix **parks rather than cutting away**
at the handover, so the geometry half can still be read against the rows —
including R₂'s original entries, kept as a faint record. Neither half opens on
an intertitle.

C ("Search") was not taken forward. Elimination is a basic topic, and a basic
topic does not need every implicit step explained: why *that* multiplier is
better left as an exercise for the reader than spent screen time on.

The three candidates stay registered in the lab as the design record, alongside
the shipped clip — which loads the **production scene module itself**, not a
copy, so a lab entry cannot drift from what learners see.

The serif/near-black treatment is accepted **for this lesson**. Whether it
becomes the course-wide animation language is still open, and is not decided by
this experiment.

### Eigenvector derivation — experiment (2026-07)

Two candidates for the chain `Av = λv → (A − λI)v = 0 → det(A − λI) = 0 →
eigenvalues and eigenspaces`, at `?mode=design&experiment=eigen`. They take
opposite routes through it and opposite visual languages.

**A · Knob** — geometry-first, and the only candidate where λ is continuous.
The whole plane deforms under `A − λI` inside a clipped viewport, and the graph
of `det(A − λI)` against λ is *traced* by the same dial, so the algebraic
condition and the geometric collapse are two readouts of one motion. The
eigenvalues are found rather than computed; the characteristic polynomial is
named at the end, as the equation that predicts crossings the learner has
already watched.

**B · Chain** — algebra-first, on a **page rather than a void**. Eleven lines
build downward and none is ever cleared, so the closing frame is the whole
derivation; a witness panel beside it shows the one geometric fact licensing the
line being written. The light ground is a deliberate cosmetic experiment:
mathematical animation is almost always light-on-black, and a warm near-white
page holds fine strokes and small type better at embedded-player size.

Both fix the ambiguity the production scene has while solving `(A − 2I)`: only
that root's null direction is drawn there, because `A − 2I` kills exactly one of
the two eigenlines. Both directions share a frame only after the plane has
returned to `A`, where each is scaled by its own λ — true of both at once.

Corrections after review, all of them things only visible in playback:

- **Knob: kernel and image are different lines, and both are on screen.** At
  λ = 2 the shifted map is `(x, y) ↦ (x + y, 0)`, so the kernel is `y = −x` and
  the image is `y = 0` — and at λ = 3 they swap. Each is now named for the space
  it lives in, a probe walks the kernel while its image sits on the origin, and
  the image line is only labelled where the map is genuinely singular (at
  λ = 2.6 the determinant is −0.24 and nothing has collapsed).
- **Chain: the cancellation compares `Av` with `λv`**, not `v` with `λv`, whose
  difference is `(λ − 1)v` and is not zero. `Av` is computed through `A`, and a
  subtraction arrow anchored at its tip travels by `−λv` to reach the origin.
- **Chain: the factoring is a persistent-symbol transformation.** Each new line
  is born carrying the previous line's LaTeX and morphs as it descends a slot,
  so the minus and the `= 0` are literally the same fragments.
- **Chain: the determinant witness never precedes its written statement.** The
  unit square is brought up at rest under "A − λI is not invertible" and only
  collapses after `det(A − λI) = 0` is written.

The scene-state regressions are on the tables the scenes read — `KNOB_BEATS` and
`CHAIN_SCRIPT` in `eigenSceneScript.ts` — so kernel/image visibility, the active
eigendirection per shifted matrix, the cancellation quantities, and the
witness-after-statement ordering all fail a unit test rather than only an eye.

The lab now holds several experiments; `?experiment=` selects one and the chosen
playback speed survives switching candidates *and* experiments, so two clips are
never compared at different speeds.
