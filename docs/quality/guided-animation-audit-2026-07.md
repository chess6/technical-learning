# Guided-animation audit — July 2026

A dated review of every guided Motion Canvas scene against the pedagogical
criteria below, grounded in (a) the scene source and (b) the reference packs
under `.reference-sources/packs/` (Sláma (a,b)-trees, Reducible Huffman, Jazon
Jiao BFS, 3Blue1Brown eigenvectors — see
[engineering/reference-sources.md](../engineering/reference-sources.md)).
Improvements shipped from this audit are listed at the end; unshipped findings
are the backlog for future scene work.

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
  scenes instead fade in a pre-positioned copy where a travel is claimed
  ("slide w", "slide the difference to the origin").
- **The leaf row is pinned so trees grow upward.** Sláma aligns the post-split
  tree to the bottom, making "all leaves stay level" a property of the layout
  rather than a caption. Our BST lift scene does this natively (vertical-only
  lift); the red-black scene now reads its conserved black height off the
  picture.
- **A persistent apparatus outlives any one beat.** 3B1B pins the same matrix,
  grid, ghost grid, and span lines across ~8 scenes; algebra is linked to
  geometry by *migrating numbers* (tip coordinates morph into matrix columns,
  λ flies into the diagonal), not by cutting between panels. Our derivation
  scene does this at small scale; our weaker scenes swap panels at act breaks
  with nothing persisting.
- **Predictions precede reveals.** Sláma pauses with "pause here" prompts
  before insertion/deletion outcomes; 3B1B's pause-and-ponder prompts are
  unverified, which is exactly where our graded checkpoints are stronger than
  any video. In-scene, only karatsuba had a prediction beat (1.2 s of think
  time — too short); the red-black scene now asks one before the split.
- **Color grammar is a contract.** Sláma reserves red exclusively for
  violations — a grammar that would collide with red-as-data in a red-black
  tree, so our scene keeps red = extra key and marks violations in a distinct
  accent. 3B1B's stable green/red/yellow/maroon assignments hold for 17
  minutes; our `ROLE` palette is consistent within scenes but drifts across
  them (see below).
- **Non-narrated motion needs on-canvas text pacing.** Jiao's BFS video has no
  narration; its state-machine pacing (~1.7 s per algorithm step) and
  blue/yellow/green state grammar work, but nothing explains *why* — a
  negative example for our prose-synchronized model, and the reason exported
  MP4s (which drop the lesson prose) are a secondary mode, not the lesson.

## Scene-by-scene findings

### Strong scenes (patterns to reuse)

- **elimination** — the repo's reference implementation: one progress signal
  drives equation text, matrix row, and geometric line simultaneously (they
  cannot drift); the row operation is *enacted* (the scaled row physically
  slides onto R2); the invariant (solution dot) never leaves the screen and is
  pulsed at every stage; timing fully budgeted (`ELIMINATION_BEATS` +
  `runSegment`).
- **bst-lift-from-array** — choreography-as-proof: the vertical-only lift makes
  "horizontal position = sorted order" impossible to violate, so the tree
  visibly contains no new computation; total object persistence; the ordering
  rule is read off the earned picture afterwards.
- **eigenvectors-derivation** — equation morphs synchronized 1:1 with geometric
  enactments; the nudge-λ-off-and-back falsification beat ("det ≈ 0.4 · not
  flat" → "det = 0 · collapses") demonstrates an "exactly when" claim by
  briefly breaking it.

### Most in need of improvement (backlog, ranked)

1. ~~**columns-rule-graphic**~~ — **fixed** (see "columns-rule-graphic:
   findings → shipped improvements" below). Was: exists to show
   `T(x) = a·T(e₁) + b·T(e₂)` but never draws a component, coefficient, or
   construction; concepts live in captions while dots pulse.
2. ~~**matrix-transformations**~~ — **fixed** (see "matrix-transformations:
   findings → shipped improvements" below). Was: the "Transform the sample"
   beat contains no transformation (the sample is born already transformed;
   the beat is a line-width pulse); the grid fades in pre-deformed in the core
   sequence; the presets tour runs ~1.5 s per new transformation.
3. **eigenvectors-invariant-directions** — grids fade in pre-deformed in
   `scalar`/`defective`; a visible snap glitch entering `rotation`; hidden
   morphs burn time with no visible change; λ demo labels are hand-acted
   rather than derived from `src/math` (honest today, fragile tomorrow).

### Caption↔visual mismatches (all scenes)

- solution-sets `difference`: "Slide that same difference to the origin" — a
  copy fades in; nothing slides.
- vectors `addition`: "Slide w so its tail sits on the tip of v" — a second
  arrow grows in place.
- matrix-transformations `transform-sample`: "it lands on the transformed
  basis" — no landing occurs on screen.
- determinant-area-scaling: the area/det headline is a one-shot snapshot that
  lags the geometry ~2 s through `collapse`/`negative` — the most instructive
  number in the scene is stale exactly when it matters.
- karatsuba `exponent`: the promised leaf-row pulse is an `opacity(1→1)`
  no-op; the climactic beat is caption-only. Its `subtract` prediction gives
  1.2 s of think time.
- chapter0: "Two axes e₁, e₂" mislabels basis vectors in the course's first
  scene.
- bst-lift `degenerate`: "each one walks to the far right" over a simultaneous
  group move.

### Cross-scene color drift

`ROLE.original` (blue) means pre-transform object, equation 1, second
solution, auxiliary rectangle, or subtree tag depending on the scene;
`ROLE.selected` (gold) is sample vector, solution point, target b, eigenline,
probe ring. Most confusing: linear-systems colors b and the solution point the
same gold across the two spaces it carefully separates, and the two
eigenvector scenes in the *same lesson* color eigenlines differently
(gold-dashed vs pink/gold). Candidate future rule: pin `original/transformed`
to before/after meanings course-wide and introduce distinct tokens for
co-equal pairs (R1/R2).

### Timing regimes

Only elimination, solution-sets, and bst-lift use the measured `runSegment`
pattern; the rest still hand-subtract (`waitFor(duration − guessed_total)`),
which desynchronizes step markers the moment choreography is edited (and can
go negative). Migrating the remaining scenes to `runSegment` is mechanical and
worth doing opportunistically. (The red-black scene already used `runSegment`.)

## Red-black scene: findings → shipped improvements

Findings against the criteria, using the Sláma pack as the standard for split
choreography:

- The colour flip — the scene's whole thesis — happened in 0 s (`paint()`
  snap) while the left panel took 0.9 s: the "same event, two views" claim was
  not watchable.
- The arriving key **35** simply faded out at the split: the object whose
  arrival *caused* the split had no fate, an object-persistence break and a
  motivation left dangling.
- No prediction before the reveal.
- The conserved black height (the invariant the lesson's theorems ride on) was
  hidden from `overflow` until `root-split` — invisible exactly while it was
  being conserved.
- Prev/Next idea skipped `establish` and `violation-moves-up`, so chapter
  navigation could not reach the "violation moves up, never multiplies" beat.

Shipped (same commit series):

- Split beat: left-panel key travel and right-panel recolour now run
  **simultaneously as tweens** of the same node objects (`paintTween`).
- 35's arc closes: it slides into the freed 2-node on the left while a red
  child appears under the (now black) neighbour on the right — re-invoking the
  "extra key hangs off in red" rule from earlier beats.
- `overflow` ends with an explicit prediction prompt (~3 s of held think time
  before the reveal): *which key is promoted — and does the right panel move,
  or recolour?*
- New `invariant-held` beat reads the unchanged black height off the picture
  immediately after the flip; `root-split` then updates it to 2 with a tweened
  (not snapped) forced-black recolour.
- All eleven beats are now chapters with authored summaries
  (`sceneTimings.ts`), including the previously unreachable
  `violation-moves-up`.

Representation split remains correct: the guided scene owns the encoding
insight; rotations/order-preservation live in the interactive exploration;
the height bound lives in formal blocks + worked induction — the scene does
not duplicate them.

## matrix-transformations: findings → shipped improvements

Findings: the beat named "Transform the sample" contained no transformation —
the sample arrow was bound directly to the live matrix, which was already `A`
by the time the beat ran, so the vector was *born* transformed and the beat
was a line-width pulse under the caption "By linearity it lands on the
transformed basis". The grid, whose motto the scene states outright, was
forced to opacity 0 during the column beats and then faded in already
deformed. The presets tour spent ~1.5 s per new transformation.

Shipped:

- **The sample travels.** It has its own progress signal, so it is drawn at
  `x` — its untransformed position — with its components on the original
  basis, and then carried to `Ax` while both dashed components swing onto
  `Ae₁` and `Ae₂`. The path is the shared `lerpIdentityToMatrix`, which is
  exactly the straight-line path the deforming grid takes, so the travel is
  not an invented motion.
- **The grid deforms where the claim is made.** It is visible (dim) while each
  column moves, so the shear is watched as the *consequence* of the column
  rather than appearing pre-cooked two beats later. The grid beat then traces
  one gridline against its image — deliberately the **vertical** line `x = 1`,
  because this shear maps horizontal lines onto themselves and a horizontal
  probe would draw its image on top of its own ghost.
- **A prediction precedes the reveal.** A `predict-sample` beat (5.5 s) sits
  between drawing `x` and moving it: both column tip readouts return, `x`
  stays put, and the question is posed with ~5 s of held silence. The answer
  is *derivable* — the columns were established two beats earlier and the
  coefficients are stated as fixed — so it is a prediction rather than a
  guess, and the reveal resolves it concretely to `Ax = (3.5, 0.5)`.
- **The tour is unhurried and honest**: 13 s for four presets (~3.2 s each),
  one redundant rank-1 example dropped, and every preset resets to the
  identity first — morphing one unrelated preset straight into another
  animates a transition that means nothing (the rule `chapter0` already
  follows).
- **The matrix readout can no longer go stale.** It was set imperatively
  *after* each morph resolved, so the header showed the previous matrix while
  the geometry was already becoming the next one. It is now a function of the
  live entries — the same defect class flagged for the determinant scene
  below, fixed here at its root.
- Tip labels and coordinate readouts no longer collide with each other or with
  the sample, and `majorSteps` now covers all nine beats (it previously
  skipped `col2`, `transform-sample`, and `compare`, so Prev/Next could not
  reach the payoff). Migrated to `runSegment`; the export measures 48.53 s
  against a 48.5 s authored budget.

## columns-rule-graphic: findings → shipped improvements

Findings (the audit's top-ranked gap): the scene's whole purpose is
`T(x) = a·T(e₁) + b·T(e₂)`, yet no component, coefficient, or construction
was ever drawn. `vertex` pulsed a dot, `image` re-ran the main scene's I→A
morph and pulsed the dot again, `all-vertices` faded in three more dots and
pulsed each. Every conceptual step lived in a caption; a static two-panel
figure would have carried the same content.

Shipped:

- **The walk is constructed.** `a·e₁` grows from the origin, then `b·e₂`
  grows from its tip, ending on the vertex — which is pulsed so the
  coincidence is *read*, not assumed. Dashed guides drop the vertex onto the
  axes first, so `(a, b)` is earned before it is used.
- **The components are carried through T, not redrawn.** Both arrows are
  bound to the live matrix columns (`a·col₁`, `b·col₂`), so the same two
  objects ride the morph onto the columns and the walk's endpoint is *by
  construction* `M·x`. Confirmed on a mid-morph export frame: the walk still
  terminates on the moving vertex. This is the Sláma pack's
  "keys travel, nothing is faded out and replaced" rule applied to vectors.
- **A prediction precedes the reveal** (`predict`, 5.5 s with ~5 s of held
  think time): the columns' destinations are named, the fixed recipe is
  pinned, and the learner is asked where the walk now ends.
- **Algebra tracks geometry term by term**: `x = a·e₁` appears as the first
  arrow grows, `+ b·e₂` as the second does, and the prediction's
  "→ where?" resolves to the full rule only after the answer is shown.
- **The invariant is visible**: the `(a, b)` readout is derived from the
  geometry and pinned *unchanged* across the transform.
- Closing beat gives every marked vertex its own walk on the same two
  columns, replacing four pulsing dots with the rule applying vertex-wise.
- Craft scaled 0.78 → 1.6 (components were ~27 px), emphasis staged so
  `a·e₁` is never read as a second copy of `e₁`, and the scene migrated to
  `runSegment` measured padding — the export is exactly 945 frames = 31.5 s
  = the segment sum, so no body overruns its budget.
