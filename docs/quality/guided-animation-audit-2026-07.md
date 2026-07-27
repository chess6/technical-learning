# Guided-animation audit — July 2026

A dated review of every guided Motion Canvas scene against the pedagogical
criteria below, grounded in (a) the scene source, (b) frame-exact MP4 exports,
and (c) the reference packs under `.reference-sources/packs/` (Sláma
(a,b)-trees, Reducible Huffman, Jazon Jiao BFS, 3Blue1Brown eigenvectors — see
[engineering/reference-sources.md](../engineering/reference-sources.md)).

**Status: closed as an exhaustive programme; see
[Deferred until product maturity](#deferred-until-product-maturity).** The July
pass below remains the historical record of its narrower audit, and the Batch 1
rows record what was actually built. The remaining scenes are **not** scheduled
for the exhaustive treatment: the product is early-stage, and teaching quality
in the learner-facing lessons outranks animation-production evidence. Batch 1
implementation and deterministic evidence are complete on
`guided-animation-batch-1-continuous-space`; independent visual sign-off is
neither pending work nor a gate.

## Deferred until product maturity

The animation-production tooling built for this programme **stays in the repo and
keeps working**, but it is **frozen and is no longer an acceptance gate** for any
lesson change. It may be used opportunistically to diagnose a specific defect.
Do not spend time repairing a deferred tool unless it blocks the learner-facing
app, ordinary development, or the standard test/build workflow.

Deferred (not scheduled; do not resume without an explicit product decision):

- Per-scene MP4 export and inspection.
- Contact sheets and approval packets.
- Reference-frame comparisons.
- Exhaustive semantic evidence and trajectory analysis.
- Cross-beat automated discontinuity infrastructure.
- Further `BeatSpec` migration undertaken solely for coverage.
- Hidden-object evidence validation.
- `--skip-video` approval-status refinements.
- Exhaustive animation completion ledgers (the tables below are frozen history,
  not a to-do list).
- Separate reduced-motion screenshot packets.
- Perfect frame-count determinism.
- Native Motion Canvas editor refinements.
- Debug-overlay and presentation-tuning polish.
- Storyboard-approval infrastructure.
- Benchmark-laboratory expansion.
- Inline WebM/MP4 lesson clips.
- Per-animation desktop/narrow-layout evidence runs.

**What still gates a scene change.** A guided-scene edit is accepted on the
ordinary learner-facing evidence: the animation visibly performs what its caption
claims, captions/geometry/readouts stay synchronized, chapter seeking and reset
and playback work in the real player, reduced motion still shows an establishing
frame, and the repository tier from `AGENTS.md` passes. Basic reduced-motion
behaviour must keep working; a separate evidence package for it is deferred.

**PENDING rows below are not a backlog.** A scene marked `PENDING Batch 2` means
"the exhaustive contract was never applied here", not "work is owed". Those
scenes are improved as part of ordinary learner-facing lesson work, judged
against the bar in the paragraph above.

Criteria: model-changing idea vs mere motion; object persistence across
transformations; explanatory purpose of every visual change; invariants kept
visible (not asserted); narration/caption↔motion synchronization; pacing and
prediction/reveal structure; semantic consistency of labels and colors; right
representation (guided scene vs explorer vs prose vs worked example); no
unearned prerequisites.

## What the references showed that our scenes alone did not

- **Keys travel; nothing is faded out and replaced.** Sláma's `ABTree` animates
  every mutation as piecewise transforms of the same key objects — a split is
  the middle key visibly rising while the node's border halves. Several of our
  scenes instead faded in a pre-positioned copy where a travel was claimed
  ("slide w", "slide the difference to the origin"). This is the single most
  common defect the audit found, and the one this pass spent the most effort on.
- **The leaf row is pinned so trees grow upward.** Sláma aligns the post-split
  tree to the bottom, making "all leaves stay level" a property of the layout
  rather than a caption. Our BST lift scene does this natively (vertical-only
  lift); the red-black scene reads its conserved black height off the picture.
- **A persistent apparatus outlives any one beat.** 3B1B pins the same matrix,
  grid, ghost grid, and span lines across ~8 scenes; algebra is linked to
  geometry by *migrating numbers*, not by cutting between panels.
- **Predictions precede reveals.** Sláma pauses with "pause here" prompts before
  insertion/deletion outcomes. In-scene, only karatsuba had a prediction beat
  (1.2 s of think time — too short). Sixteen of the seventeen production scenes
  now carry one; the seventeenth is justified below.
- **Color grammar is a contract.** Sláma reserves red exclusively for
  violations. 3B1B's stable assignments hold for 17 minutes; our `ROLE` palette
  was consistent within scenes but drifted across them.
- **Non-narrated motion needs on-canvas text pacing.** Jiao's BFS video has no
  narration; its state-machine pacing works, but nothing explains *why* — a
  negative example for our prose-synchronized model, and the reason exported
  MP4s (which drop the lesson prose) are a secondary mode, not the lesson.

## What this pass changed, by defect class

### 1. Claims made by fading in a pre-computed picture

Eight beats across seven scenes stated an operation and then showed something
that was not that operation. Each is now enacted on the object the caption names:

| Scene · beat | Was | Now |
| --- | --- | --- |
| `solution-sets` · `difference` | "Slide that same difference to the origin" — a **second** arrow faded in at the origin | one arrow translates by −x₂; a dashed ghost marks where it started |
| `vectors-linear-combinations` · `addition` | "Slide w so its tail sits on the tip of v" — a second arrow grew in place | `wArrow` itself travels along v (`wShift`), ghost left behind |
| `why-linear-algebra` · `translation` | a dashed craft faded in **already displaced** | the ghost starts coincident with the craft and travels |
| `subspaces-rank` · `reach` | an already-flat image cube faded in | the output cube is an exact copy of the input cube and visibly flattens |
| `subspaces-rank` · `crush` | null line and origin dot snapped on | a probe travels the null line while its image — through the same live matrix — never leaves the origin |
| `linear-systems` · `none` | b was tweened off the column line **while every output-space object was at opacity 0** | the beat crosses to the output space so the move is watched, then returns to the row picture |
| `karatsuba-cross-terms` · `share` | two ×10 labels cross-faded into a third | both labels travel to one point and merge there |
| `karatsuba-cross-terms` · `exponent` | the promised leaf-row pulse was `opacity(1 → 1)` — a literal no-op | the leaf dots themselves swell, and both leaf counts are drawn as bars on one shared scale |
| `bst-lift-from-array` · `degenerate` | "each one walks to the far right" over a simultaneous group move | keys insert one at a time, each edge appearing as its key lands |
| `change-of-basis` · `map-eigenbasis` | "identical motion, different description" asserted over a **frozen** already-deformed square, with the other basis never drawn | the plane returns to the identity and deforms again by the same matrix, over the eigenbasis, whose two drawn directions only stretch |

### 2. Readouts that could drift from the geometry

- **determinant-area-scaling.** The area/det headline was set imperatively
  before and after each morph, so through `collapse` and `negative` — the two
  beats where the number *is* the point — it showed the previous value for up to
  two seconds. It is now a function of the live matrix signals.
- **determinant-area-scaling, orientation.** The "orientation" indicator was a
  dashed arrow lying exactly on `Ae₁`, which cannot show a flip: handedness is
  the *signed sweep* from `Ae₁` to `Ae₂`. It is now an arc that reverses
  direction as the determinant crosses zero. `orientationSweep` is pure and
  tested against `determinant2x2`'s sign.
- **rank-nullity.** The ledger total was a third literal typed beside the two
  counts it was supposed to be the sum of, and was written by hand at each beat
  (so a token in flight sat under a total that did not include it). It is now
  `formatLedgerTally(rank, nullity)`, whose total is the sum by construction.
- **why-linear-algebra.** The matrix readout was written after each morph
  resolved; it is now a live function of the four entry signals.
- **karatsuba-cross-terms.** Captions were tweened, and Motion Canvas
  interpolates `Txt.text` **character by character** — an export frame caught
  `"only their sD+BC+BDeede"`. Captions now snap; the tween's time is an
  explicit hold, so the beat is budgeted identically.

New pure module `sceneReadouts.ts` holds every formatter (it is
Motion-Canvas-free precisely so `sceneReadouts.test.ts` can resolve it — scene
modules import `@motion-canvas/2d` and are never resolved in jsdom).

### 3. Timing

All seven hand-subtracting scenes (`waitFor(duration − guessed_total)`) are
migrated to measured `runSegment`: `why-linear-algebra`,
`vectors-linear-combinations`, `linear-systems`, `determinant-area-scaling`,
`eigenvectors-derivation`, `karatsuba-cross-terms`, `transform-spike`. Every
production scene is now on the measured pattern, and every export's frame count
equals its declared segment sum exactly (see the ledger).

The gate the audit asked for now exists in two layers:

- **Pure data.** `SCENE_BEATS` in `sceneTimings.ts` declares the wall-clock cost
  of every animated yield, per segment; scene bodies read their durations from
  it via `requireBeats`. `sceneTimings.test.ts` fails when any segment's budget
  exceeds its segment duration, when a segment has no budget, or when a scene is
  neither budgeted nor on the documented `SCENES_WITHOUT_DECLARED_BEATS` list
  (the four scenes fixed in earlier passes, which run on `runSegment` with
  inline durations and verified exports).
- **Runtime.** `runSegment` measures each body and, on a real overrun, records it
  in `SEGMENT_OVERRUNS` and logs a console error. `e2e/guided-scene-chapters.spec.ts`
  fails on any console error, so an overrun in a body whose declared budget still
  adds up is caught by the running scene.

### 4. Colour

Two roles were added to `semanticRoles.ts` because two collisions were real:

- `target` (teal) — what a construction aims at. linear-systems drew the target
  `b` and the solution point in the same gold, in the one scene whose whole job
  is keeping those two spaces apart.
- `violation` (red) — a rule broken, or a move the mathematics forbids. Used for
  chapter 0's impossible translation and rank-nullity's "no room" band.

`basis1`/`basis2` are now documented and used as the **co-equal pair** role, so
R1/R2 in elimination, the two equations in linear-systems, and the two solutions
in solution-sets stop borrowing `original`/`transformed`, which mean
before/after. The two eigenvector scenes were the audit's named inconsistency:
both now colour eigendirection *i* by the co-equal pair role (they were gold in
one scene and gold/pink in the other, and in the Watch scene both eigenlines
shared one hue despite being co-equal).

`semanticRoles.test.ts` asserts the palette holds its own rules: all
distinguishable roles differ, every pair is ≥16° apart in hue (the tightest
legacy pair is tan/gold at ~17°, never used for two objects in one comparison),
the two roles added to break a collision clear ≥22° from everything, and every
teaching role reaches 4.5:1 against the stage background.

Colour is never the only cue: dashes, shapes, labels, and legends carry the same
distinctions independently.

### 5. Chapters

Every production segment now has an authored summary, and `majorSteps` is the
full segment list for all 17 scenes — previously `regroup`, `components`,
`basis`, `sign`, `probe-rest`, `weights`, `setup`, and the three solution-set
cases were unreachable through Prev/Next. `solution-sets`' single opaque `cases`
segment is split into `case-empty` / `case-point` / `case-line`.

### 6. Defects found beyond the audit's list

- `linear-systems` `none` tweened b while every output-space object was hidden
  (motion behind an invisible object).
- `subspaces-rank` `reach` faded in a pre-flattened cube.
- `determinant-area-scaling`'s orientation indicator carried no orientation
  information at all.
- `karatsuba` captions rendered scrambled text for ~0.4 s at every change.
- `why-linear-algebra`'s opening caption said "on a coordinate grid" over a grid
  drawn at opacity 0.16 — invisible on the near-black stage.
- `matrix-composition` `undo` snapped the craft from RA straight onto A's image;
  it now resets to the identity and applies A where the learner can see it.
- `linear-systems` closed on the *no-solution* configuration under a caption
  about "the same solution set"; it now returns to its own system.
- `rank-nullity`'s first attempt at an entry animation parked the tokens
  off-stage, so the paused first frame was an empty ledger. Reverted to an
  establishing count-out — the posting motion belongs to the next beat anyway.
- `vectors-linear-combinations`' w label printed itself over p once w slid onto
  v's tip; `solution-sets`' difference label ran into the x₃ label;
  `subspaces-rank`' projection note sat under the wrapped caption; `bst-lift`'s
  new order ruler ran through the title. All repositioned.

## Verification method

1. **Player.** `e2e/guided-scene-chapters.spec.ts` drives all 17 scenes: start
   playback and confirm the scrubber advances; seek to every authored chapter and
   assert the stage title, the stage summary, and the active chapter marker all
   name that chapter and the canvas is still painting; walk Prev/Next across the
   whole scene and confirm it reaches the first and last chapter; fail on any
   console error (which is what makes the overrun detector a gate). A separate
   case checks reduced motion still shows an establishing frame and enabled
   chapter controls.
2. **Export.** Every production scene exported to MP4 at 30 fps via
   `scripts/export-scene.mjs` and its frame count checked against the declared
   segment sum.
3. **Frames.** Opening frame, every major transition, each prediction and its
   reveal, and the final frame inspected on contact sheets.
4. **Discontinuity scan.** Each export decoded to a small greyscale with the
   caption bands cropped out, then scanned for frames whose change dwarfs *both*
   neighbours. Continuous motion sits near ratio 1; a snap is an isolated spike.
   Every surviving spike was traced to one of: a documented beat-boundary
   opacity snap (no drawn object changes position or shape), a deliberate
   label rename in place, or the first frame of a tween following a static hold.
   No unexplained teleport remains.

## Exhaustive redesign completion ledger (frozen)

Frozen record of how far the course-wide redesign got before it was deferred. It
is **not** a work queue — see
[Deferred until product maturity](#deferred-until-product-maturity). “Review
packet” means the contract-backed production-scene workflow, not the benchmark
lab. “MP4 inspected” separates mechanical export/frame verification from actual
visual inspection.

| Scene | Changes or justified no-change | Prediction or rationale | Visible invariant | `runSegment` | Chapters checked | Player checked | Review packet | MP4 inspected |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `columns-rule-graphic` | Prior completed slice; no Batch 1 change | Existing `predict` | Derived `(a,b)` stays pinned | already | 5/5 historical | historical pass | prior completed evidence | historical July inspection |
| `matrix-transformations` | Prior completed pilot; no Batch 1 change | Existing `predict-sample` | Coefficients stay pinned during travel | already | 10/10 historical | historical pass | contract-backed pilot PASS | historical July inspection |
| `eigenvectors-invariant-directions` | Prior completed slice; no Batch 1 change | Existing `predict-reverse` | Eigenlines remain fixed | already | 12/12 historical | historical pass | prior completed evidence | historical July inspection |
| `red-black-encoding` | Prior completed slice; no Batch 1 change | Existing `overflow` prediction | Black height remains readable | already | 11/11 historical | historical pass | prior completed evidence | historical July inspection |
| `why-linear-algebra` | Added typed contract, semantic instrumentation, truthful geometry/stability gates; shortened the clipped translation caption | `predict-translation` | Origin anchor stays fixed through every map | measured | 10/10 | PASS: full 153-test E2E suite | PASS: 40/40 checkpoints + 10 genuine reduced-motion frames | exported 1486 frames; metadata PASS; visual sign-off pending |
| `vectors-linear-combinations` | Added typed contract/instrumentation; explicitly retired the hidden dependent-walk helper to prevent a false teleport | `predict-coordinates` | Fixed p and reference grid | measured | 14/14 | PASS: full 153-test E2E suite | PASS: 56/56 checkpoints + 14 genuine reduced-motion frames | exported 1882 frames; metadata PASS; visual sign-off pending |
| `matrix-composition` | Added typed contract and stable craft, basis, path, endpoint, comparison, and collapse identities; choreography already enacted R then A on persistent objects | `predict-order` | AR outline remains while RA is built | measured | 8/8 | PASS: full 153-test E2E suite | PASS: 32/32 checkpoints + 8 genuine reduced-motion frames | exported 1531 frames; metadata PASS; visual sign-off pending |
| `determinant-area-scaling` | Added typed contract and stable region, basis, orientation, and live-readout identities; prior live-readout/sign correction retained | `predict-negative` | Region, determinant, and orientation share one live matrix | measured | 10/10 | PASS: full 153-test E2E suite | PASS: 40/40 checkpoints + 10 genuine reduced-motion frames | exported 1230 frames; metadata PASS; visual sign-off pending |
| `change-of-basis` | Added typed contract and stable grid, basis, walk, outline, eigenvector, and readout identities; fixed p remains persistent | `predict-readout` | p never moves while its coordinates and basis change | measured | 7/7 | PASS: full 153-test E2E suite | PASS: 28/28 checkpoints + 7 genuine reduced-motion frames | exported 1260 frames; metadata PASS; visual sign-off pending |
| `linear-systems` | **PENDING Batch 2** | pending | pending | historical only | pending redesign check | pending | pending | pending |
| `elimination` | **PENDING Batch 2** | pending | pending | historical only | pending redesign check | pending | pending | pending |
| `solution-sets` | **PENDING Batch 2** | pending | pending | historical only | pending redesign check | pending | pending | pending |
| `subspaces-rank` | **PENDING Batch 2** | pending | pending | historical only | pending redesign check | pending | pending | pending |
| `rank-nullity` | **PENDING Batch 2** | pending | pending | historical only | pending redesign check | pending | pending | pending |
| `eigenvectors-derivation` | **PENDING Batch 2** | pending | pending | historical only | pending redesign check | pending | pending | pending |
| `bst-lift-from-array` | **PENDING Batch 2** | pending | pending | historical only | pending redesign check | pending | pending | pending |
| `karatsuba-cross-terms` | **PENDING Batch 2** | pending | pending | historical only | pending redesign check | pending | pending | pending |

### Closed after Batch 1

`matrix-composition` — the one learner-visible defect Batch 1 left open. The
three beats that begin a fresh trial (`one-map`, `predict-order`, `undo`) reset
the live matrix to the identity, and did it imperatively: the craft, both basis
arrows, and both arrow labels jumped from their previous state to the identity
in a single frame. The teleport hard gate did not catch it because a reset moves
most of the frame at once, which the gate correctly exempts as an authored cut.

Fixed with a **staged reset** (`stagedReset` in `sceneKit.ts`): the objects that
read the live matrix fade out, the state is rewritten while nothing is drawn, and
they fade back in already at the identity. The dashed original craft, the grid,
and the origin stay put through the blank, so the learner keeps a reference. The
third option — tweening AR → I — was rejected: a continuous motion back to the
identity reads as another linear map, which is false. The same blank now also
retires the two-stage paths and introduces the dashed AR comparison outline, so
neither snaps on. Captions name the move as staging ("a new trial, not another
map") rather than describing it as a transformation.

Verified in the ordinary learner player at 1× playback across all three
transitions (no console errors), plus the chapter spec and the hard gates.
Regression: `sceneTimings.test.ts` asserts the three beats keep a
`fadeOut`/`resetHold`/`fadeIn` budget classified as transitions.

### Algebra & dual-representations slice (2026-07)

Six learner-facing lessons improved as complete learning experiences, judged on
the bar in [Deferred until product maturity](#deferred-until-product-maturity) —
the animation performs what its captions claim, the representations stay
synchronized, and the player works. No review packets, MP4s, or BeatSpec
migration; the scenes below are **not** promoted in the frozen ledger.

| Lesson | Learner-visible change |
| --- | --- |
| `linear-systems` | The scene morphs its matrix and target through the whole trichotomy, but the algebra was typed into captions once, so from the first morph the symbols described a system no longer being drawn. A **live system card** now carries the equation view and the augmented matrix beside the picture, every entry a function of the same signals the geometry reads. It re-reads itself as the scene crosses spaces — equations tinted like their lines, then the same six numbers read down and tinted like their arrows. A **live verdict** from the shared `classifyLinearSystem2x2` makes the trichotomy watchable: the count changes as the lines touch, and again as `b` leaves the column line. The crossing dot is drawn only when the system has one. |
| `elimination` | Choreography unchanged — it already enacts the row operation across equations, augmented matrix, and geometry with the intersection fixed. One fix: the prediction blanked the whole stage, so "will (2, −1) stay on the new second line?" was asked with none of its evidence visible. `makeFullFrameTreatment` gained a `banner` coverage; the apparatus now stays up. |
| `solution-sets` | The `difference` beat needed no change (it already translates the one arrow with a ghost). Added a **parameter sweep**: one dot traverses the whole solution line off a single `t`, with particular / homogeneous / sum written beside it. `t = 1` lands on x₃, `t = 0` on xₚ, `t = −1` on x₂ — the points the learner already watched being built. |
| `subspaces-rank` | The plane was named "the span of A's columns" with the columns never drawn. A **`columns` chapter** admits them one at a time: c₁ opens a line, c₂ points off it and the reach grows to a plane with the rank, and the dependent c₃ = 2c₁ + 3c₂ lands inside and changes nothing. A prediction sits between the relation and the reveal. |
| `rank-nullity` | Once the tokens left the input stack, `n` survived only as the number after the equals sign. A **budget bar** draws it as one fixed length split in two, its boundary tweened alongside the moving token. Degrading the map slides the boundary; changing the map's shape does not change the length. |
| `eigenvectors-derivation` | *(superseded — see the next section; kept for the record.)* "Solve (A − λI)v = 0" was a caption over two answer lines fading in. Each root now has **its own chapter and is genuinely substituted back**: the shifted matrix is written out, the plane is carried to it, and a probe walks the line it kills while its image stays on the origin. The λ = 2 line was drawn along (1,−1) and labelled (−1,1) — the opposite ray, and the opposite orientation from the lesson prose; direction labels are now derived from the direction drawn. |

Checks: full unit suite, typecheck, lint, production build, and the guided-scene
chapter, hard-gate, and per-lesson Playwright specs. Every changed beat was also
watched at 1× in the ordinary learner player.

### `eigenvectors-derivation` replaced by the Chain treatment (2026-07)

The worked-example clip above was superseded. The lab's **Chain** candidate was
promoted into `eigenvectors-derivation` wholesale: the derivation is now written
out as a chain of equivalences on a page, each line produced by transforming the
line above it, none ever cleared, so the closing frame is the whole argument. A
witness panel beside the chain shows the one geometric fact licensing the line
being written.

This replaces the **worked example**, not the introduction. `eigenvectors-invariant-directions`
still opens the lesson and still teaches what an eigenvector is; the derivation
clip now assumes that and teaches the reproducible symbolic procedure. The two
clips have different jobs, and no course-wide "one animation per lesson" rule is
implied by either.

What the promotion carried across from the lab corrections:

- the cancellation witness compares **Av with λv**, resolved through
  `resolveCancellationTerm` so the picture cannot drift from the declared terms;
- `Av − λv = 0 → (A − λI)v = 0` is a genuine persistent-symbol transformation —
  the minus and the `= 0` are literally the same LaTeX fragments;
- the singular demonstration is attached to the line that **states**
  `det(A − λI) = 0`, so it can never precede its own claim;
- each root is substituted back one at a time, because `A − λI` kills exactly one
  of the two eigendirections; both share the frame only under `A` itself.

Two defects found while promoting it, and fixed:

- the flattened unit square lands exactly on the image line `y = 0`, i.e. on the
  drawn axis, so at a hairline weight the collapse read as "the square vanished".
  The stroke now thickens as it squashes and the readout names the surviving line.
- a beat that writes two lines was spending the second line's time inside the
  window the intent table calls a hold, and a morph was spending 1.3× its
  declared `write`. Each chain line now takes its **own** declared
  `write`/`witness` pair, and a line with no budgeted window throws at render
  time rather than quietly borrowing the hold.

`eigenvectors-derivation` also left the `standard-grid` semantic-geometry
contract: the promoted clip is a written page whose witness is a sketch panel,
not a coordinate plane a learner reads positions off. Its mathematics is held by
the `eigenDerivationData` assertions and its named semantic nodes instead.

The production scene is registered in the design lab as the `shipped` candidate
of the `eigen` experiment, reading its chapters from the production timing
registry so the lab cannot drift from the lesson.

### Batch 1 evidence note

All five full review packets are under `artifacts/animation-review-batch1/` and
contain contract-derived chapter seeking, semantic movement/stability
assertions, hard gates, genuine learner-route reduced-motion captures, contact
sheets, and prediction-to-reveal previews. A focused single-checkpoint run
requested one frame and the Motion Canvas renderer emitted only its inclusive
two-frame range, so focused work does not render a full scene.

The native editor was opened for each Batch 1 scene. Timeline controls, node
inspection, all overlay controls, scene selection, and HMR were exercised with
no browser errors. These scenes deliberately have no persisted presentation
tuning profile; the editor says so instead of exposing no-op controls. The
matrix pilot remains the proof of typed tuning and persistence.

The five production MP4s were exported and frame-counted against declared
timings. The Codex image-viewer bridge failed to initialize in this environment,
so contact-sheet and full-MP4 visual inspection is explicitly **not claimed**.
Batch 1 visual acceptance therefore remains pending an independent reviewer.

### Development-only row

| Scene | Status | Review packet | MP4 inspection |
| --- | --- | --- | --- |
| `transform-spike` | Development timing fixture only; not a production scene and not part of Batch 1 | unsupported by design | not required for production ledger |

## Historical July completion ledger (superseded for exhaustive status)

All 17 production scenes. "Player checked" = the chapter spec above passes for
that scene; "Export" = MP4 frame count ÷ 30 fps against the declared total.

| Scene | Changes made, or justified no-change | Prediction | Visible invariant | `runSegment` | Chapters checked | Player checked |
| --- | --- | --- | --- | --- | --- | --- |
| `why-linear-algebra` | caption called e₁,e₂ "axes"; translation ghost faded in already displaced → now travels; matrix readout made live; reference grid was invisible at 0.16 opacity; origin marker added; migrated to `runSegment` | `predict-translation` — five transforms have run and the origin never moved; can any of them slide the craft off it? | the origin dot + ring, marked from `reveal` and watchable through every preset | migrated | 10/10 | ✅ 49.53 s / 49.5 s |
| `vectors-linear-combinations` | `addition` grew a second arrow → w itself travels with a ghost; coordinate payoff split into read → predict → construct, the reveal re-using the same v and w arrows; w label moved off p; basis grid brightened; migrated to `runSegment` | `predict-coordinates` — the arrow has not moved and both grid directions are lit: how many steps of each land on p? | p's position is written once at construction and never again | migrated | 14/14 | ✅ 62.73 s / 62.7 s |
| `matrix-transformations` | **no change** — treated in the previous pass (sample travels, grid deforms where the claim is made, live matrix readout, unhurried tour). Re-verified only. | `predict-sample` (existing) | the coefficients, pinned unchanged across the travel | already | 10/10 | ✅ 54.03 s / 54 s |
| `columns-rule-graphic` | **no change** — treated in the previous pass (walk constructed, components carried through T, `(a,b)` pinned). Re-verified only. | `predict` (existing) | the `(a, b)` readout, derived and unchanged across the transform | already | 5/5 | ✅ 31.5 s / 31.5 s |
| `linear-systems` | b and the solution point shared one gold → b is now `target`; two equations recoloured as a co-equal pair; `none` tweened b while it was invisible → now crosses to the output space; `regroup` was an unreachable chapter; closed on the no-solution case → now returns to its own system; migrated to `runSegment` | `predict-column` — the row picture already gave (2, −1); what do those numbers do to the columns? | the solution point (2, −1), the same in both pictures | migrated | 9/9 | ✅ 48.53 s / 48.5 s |
| `elimination` | R1/R2 recoloured as a co-equal pair (they were before/after hues); prediction beat added; summaries authored. Choreography unchanged — it is the repo's reference implementation | `predict` — both equations hold at the crossing; must R2 − 2·R1 still pass through it? | the solution dot, on screen and pulsed at every stage | already | 6/6 | ✅ 32.5 s / 32.5 s |
| `solution-sets` | `difference` faded in a copy → one arrow travels; `cases` split into three chapters; dots recoloured (co-equal pair vs derived); labels de-collided | `predict-generate` — A x₁ = b and A(x₁−x₂) = 0 are both on screen; what is A(x₁ + (x₁−x₂))? | Null(A) is unchanged across all three cases, including the empty one | already | 9/9 | ✅ 47.03 s / 47 s |
| `matrix-composition` | prediction beat added; `undo` snapped from RA onto A → now resets to the identity and applies A visibly; summaries authored; beat budgets declared | `predict-order` — with AR's landing place kept as a dashed outline, does A-then-R reach it? | the dashed original craft and the two persistent basis arrows | already | 8/8 | ✅ 51.03 s / 51 s |
| `determinant-area-scaling` | headline lagged the geometry → now live; orientation arrow carried no handedness → now a signed arc that reverses; prediction added; `basis` and `sign` were unreachable chapters; migrated to `runSegment` | `predict-negative` — the factor has reached 0 and the columns keep going: what can a negative area factor mean? | the area factor and the orientation sweep, both live, both on screen throughout the collapse and the flip | migrated | 10/10 | ✅ 41.0 s / 41 s |
| `subspaces-rank` | pre-flattened cube faded in → the output cube is a copy of the input cube and deforms; null line snapped on → a probe travels it while its image holds the origin; `rank-one` resets before re-deforming; prediction added; projection note moved off the caption | `predict-rank-one` — the next map has rank 1: does Null(A) shrink, stay, or grow? | the two panels never share a frame, and the probe's image is computed through the same live matrix | already | 8/8 | ✅ 52.03 s / 52 s |
| `rank-nullity` | tally was a hand-typed third number → derived from the live split; prediction added; "no room" band given the violation role | `predict-degrade` — only one direction will survive: does a token leave, appear, or cross? | the running total, which is the sum of the two counts by construction | already | 7/7 | ✅ 43.0 s / 43 s |
| `change-of-basis` | the eigenbasis was never drawn and nothing moved in the beat claiming identical motion → the deformation is replayed over the eigenbasis with both directions drawn; readout reveal is now a constructed walk; prediction added; the two basis directions were both violet → co-equal pair | `predict-readout` — both grid directions are lit and p has not moved: how many steps of each? | the arrow's position is written once, at setup, and nowhere else | already | 7/7 | ✅ 42.0 s / 42 s |
| `eigenvectors-invariant-directions` | **near-no-change** — treated in the previous pass. One real defect found: both eigenlines wore gold, which is also the "selected" role, and disagreed with the derivation scene. Each line now takes its arrow's co-equal pair colour | `predict-reverse` (existing) | the eigenlines, placed once and unmoved across the whole λ arc | already | 12/12 | ✅ 58.53 s / 58.5 s |
| `eigenvectors-derivation` | eigendirection colours aligned with the Watch scene; prediction added; det readout made live during the collapse; migrated to `runSegment` | `predict-collapse` — v ≠ 0 is sent to the origin: what must A − λI do to area? | the unit square's area under A − λI, live, including the nudge-off-and-back falsification | migrated | 7/7 | ✅ 35.5 s / 35.5 s |
| `bst-lift-from-array` | `degenerate` moved all seven keys at once under a caption saying each walks in turn → one at a time; sorted-order ruler added and kept through the chain; prediction added; `establish` and `probe-rest` were unreachable chapters | `predict-gap` — same keys, same order: worst-case comparisons for this chain vs the balanced shape? | the sorted-order ruler: horizontal position never changes, through the lift and the chain | already | 11/11 | ✅ 59.03 s / 59 s |
| `red-black-encoding` | **no change** — treated in the previous pass (simultaneous split/recolour, 35's arc closed, prediction, black-height beat, all beats chaptered). Re-verified only. | `overflow` (existing) | black height, read off the picture immediately after the flip | already | 11/11 | ✅ 56.03 s / 56 s |
| `karatsuba-cross-terms` | `exponent`'s leaf pulse was an opacity no-op → leaf dots plus two same-scale count bars; `subtract` gave 1.2 s of think time → 4.2 s, and the corners now slide out; `share` cross-faded → the labels travel and merge; carry chips now travel between place columns; captions were rendering scrambled text mid-tween → snap; `setup`/`weights` were unreachable chapters; migrated to `runSegment` | `subtract` — AC and BD are known; remove them from this rectangle: what is left? | the place-value weights, attached to each region and carried into the combined term | migrated | 10/10 | ✅ 63.03 s / 63 s |

### Development-only infrastructure

| Scene | Change |
| --- | --- |
| `transform-spike` | Not a lesson and not redesigned as one. Migrated off its bare `waitFor` sequence onto the shared segment loop (`SPIKE_SEGMENTS` + `requireBeats` + `runSegment`) so the scene where timing-infrastructure changes get tried first cannot be the one scene that drifts from the contract. Export: 3.03 s / 3 s. |

### Prediction coverage

Sixteen production scenes carry a prediction placed after the mechanic it builds
on and before the counterintuitive result, with 3–4.4 s of held silence and the
relevant apparatus left on screen; the reveal always resolves it on the same
persistent objects. `sceneTimings.test.ts` asserts every production scene names
one, that it precedes its reveal, that the segment is ≥5 s, and that ≥3 s of
that is budgeted as think time.

One scene is deliberately different: **`why-linear-algebra`** is the course's
first scene, and for its first eight beats the learner has been taught nothing
to reason from — a prediction there would be a guess. Its prediction is placed
at the one point where the scene has supplied its own evidence: five
transformations have run with the origin dot marked and visibly fixed, so
"could any rule of this kind slide the craft off it?" is answerable from what is
on screen. No prediction was added to any introductory or purely definitional
beat elsewhere (`plane`, `vector-v`, `setup`, `establish`, `equations`,
`two-panels`, `one-arrow`, `fan`, `recap` all remain plain).

### Commits

- `Enact what the captions claim across the remaining guided scenes` — the
  thirteen-scene remediation, the timing/colour/readout infrastructure, and the
  three new test suites.
- `Record the closed guided-animation audit and its completion ledger` — this
  document.
- `Address what the export frames and the full e2e run found` — the four defects
  frame review turned up after the first pass (the linear-systems space tag
  renaming mid-crossfade, an elimination label outside the safe frame, chapter
  0's invisible grid and filled travelling ghost, rank-nullity's off-stage
  opening frame), plus the lesson specs that addressed chapters by ordinal.
- `Record the two failure modes this pass met more than once` — the
  known-failure-modes entries for pre-computed pictures and imperative readouts.

### Checks run

- `./check.sh` — oxlint, `tsc -b`, **1330 unit tests across 99 files**, python
  transcript tests. Passing.
- `npm run build` — production build. Passing.
- `npm run test:e2e` — **120 Playwright tests**. Passing, including the 19 new
  per-scene chapter cases and the reduced-motion case.
- **18 MP4 exports** rendered at 30 fps (17 production scenes + the spike) and
  frame-counted against their declared totals; contact sheets and the
  discontinuity scan reviewed for each.

### Not verified

None. Every production scene was exercised in the player and on an export.
