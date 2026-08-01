# Known failure modes (math & visualization)

A **curated** list of recurring hazards and the prevention rule for each. Read
this before changing any math or visualization code.

This is deliberately short. Once a specific bug is fixed and covered by a
regression test, **the test and git history own the detailed post-mortem** — this
file keeps only the durable rule that stops the *class* of bug from recurring. Add
a new hazard here only when it is a genuinely new class, not a one-off already
guarded by a test.

See also: [../engineering/math-correctness.md](../engineering/math-correctness.md)
(conventions, source of truth) and the
[math-visualization-correctness rule](../../.cursor/rules/math-visualization-correctness.mdc).

---

## 1. Renderers reimplementing linear algebra

**Hazard.** Scene/explorer code combines columns or packs a matrix by hand
(`x*col1[0] + y*col2[0]`, a bespoke `toMafsMatrix`) and silently desyncs from the
tested math. The classic repro is the transformed grid for
\(A = [[1.8, 0], [1.8, 2.2]]\): a wrong 6-tuple packing drew a horizontal grid
family while the basis arrows (a different code path) still looked plausible.

**Prevention.** `src/math` is the only source of truth. Build every column
combination from `matrixVectorMultiply` / `scaleVector` / `matrixColumn`, and
every transformed grid from `transformedGridSegments` (endpoints through
`matrixVectorMultiply`). Never derive slopes from rows or trust a third-party
matrix layout without a packing test against `matrixVectorMultiply`. Test with
**asymmetric** matrices (`diagnostic-asymmetric`, `grid-bug-repro`), never only
identity/scaling. Keep the math space separate from the pixel/y-flip mapping.

## 2. Drawing a constraint as a line without classifying it

**Hazard.** Rendering `a·x + b·y = c` as a line unconditionally (or falling back
to the x-axis for a degenerate row) draws a **false line** and a spurious
intersection. A zero row is not a line; an `infinite` 2×2 system can be a single
line **or** the whole plane, so a solution-set comparison that assumes "infinite ⇒
one line" reports the whole-plane system as unequal to itself.

**Prevention.** Ask `classifyRowConstraint` (`line` / `all` / `empty`) before
drawing a row — never a "draw every equation as a line" fallback. Model **every**
geometry a classification allows when comparing solution sets (line=line by
normalized coefficients, plane=plane, line≠plane).

## 3. Operation validity that checks nonzero but not finiteness

**Hazard.** Treating `factor !== 0` as "valid" accepts `NaN` / `±∞` row-operation
factors as reversible and returns garbage inverses (`1/∞ = 0`).

**Prevention.** Operation validity must require `Number.isFinite` (and nonzero
where a bijection needs it), and stay **separate** from numerical-stability
warnings — a non-finite factor is illegal, not a warning.

## 4. Figure that contradicts its caption / equation

**Hazard.** A beat narrates one example while the previous example's figure is
still on screen (e.g. a carry beat about `78 × 56` still showing the `12 × 13`
rectangle); a caption names an effect ("reverse", "collapse", "stretch") while the
geometry stays a fixed length; a tree is drawn at an independent `depth` knob while
the caption states a leaf count for `log₂ n`.

**Prevention.** A beat's caption/equation and its on-canvas figure must describe
the **same** example — swap the figure when the example changes. Derive a
visualization's geometry (tree depth, drawn regions, tip length/direction) from the
**same quantity** as its caption; no independent knob that can desync.

## 5. Hardcoded learner-facing copy across synchronized representations

**Hazard.** The prose description, canvas caption, and accessible label are fixed
strings for one case (e.g. "the crossing point") and become false for the others
(coincident lines share a whole line; parallel lines have an empty set).

**Prevention.** Derive prose, caption, and aria label from the **live
classification**, never hardcode one case across the three representations.

## 6. Overlay captions colliding with or clipped by the stage

**Hazard.** Long overlay captions run off the safe frame (unwrapped single-line
`Txt`), and center-anchored captions/tip labels sit on top of teaching geometry
(vector tips, eigenlines, axes).

**Prevention.** Use `makeOverlayLabel` with a safe max width and `textWrap`; keep
overlay Y anchors in the stage **margin**, outside the teaching half-extent
(`OVERLAY_CLEAR_HALF_EXTENT`); offset tip labels perpendicular to the stroke and
anchor them at the edge, never center-anchored on the tip. Prefer shorter copy over
a wrap that crowds the geometry.

**The collision is usually caused by the motion, not by the placement.** A label
anchored to a moving tip sweeps an annulus, so two labels that never overlap in
the frame you designed collide in the frame between: a basis label rotating onto
a fixed vertex label, `λv` landing on `v` when λ ≈ 1, an arc label sharing a ray
with the column it bisects, a peeled tile carrying its label onto a panel title.
Check the whole sweep, not the end states — and when two labels must travel to
one point (a merge), dissolve them *as* they arrive rather than parking them on
top of each other. A live readout can also grow into a clip: budget for the
**longest** string the formatter can produce, since a headline that wraps to two
lines is anchored from its centre and loses the first line off the stage.
`e2e/guided-scene-hard-gates.spec.ts` gates all of this.

## 7. A claimed operation shown as a pre-computed picture appearing

**Hazard.** The caption names a motion — slide, travel, collapse, split, merge,
peel — and the scene delivers something else that ends in the same place: a
second object faded in where the first would have arrived, an already-deformed
figure faded in, a snap, a pulse, or a tween that runs while the affected object
is at opacity 0. The end state is right, so it survives review of the source and
of the final frame; only the middle is missing, which is the part that teaches.

The quietest instance is a tween that is **already at its target**: an overlay
label created at full opacity and then faded in over 0.5 s, or a shape revealed
that was never hidden. The code reads as animation, the beat budget is spent,
and the frames are identical throughout. Two production scenes shipped this way
until the missing-claimed-motion gate compared each segment's declared non-hold
budget against the movement actually sampled in it.

**Prevention.** Animate the object the caption names, from where it is to where
it ends up, and leave a ghost so the "from" stays visible. Interpolate a matrix
or a position signal rather than cross-fading two states. If the beat's subject
is off screen, bring it on screen before the motion, or reword the beat to
describe what is actually watched. When the next example is unrelated, reset to
an intelligible baseline (usually the identity) first — but reset **visibly**, or
snap only opacities, never a position or a shape.

## 8. A readout written imperatively beside geometry that is still moving

**Hazard.** A number is `set` before and after a tween — a determinant headline,
a matrix readout, a running total — so for the whole tween the screen shows the
previous value. This is worst exactly where the number matters most, because
those are the beats with the longest morphs. The same class covers a total typed
as a third literal beside the two counts it should be the sum of.

**Prevention.** Bind the readout to the live signals (`label.text(() => …)`) so
it is recomputed every frame, and compute derived quantities *from* the parts
rather than alongside them. Put the formatter in a Motion-Canvas-free module so
a unit test can hold it against the mathematics. Beware `Txt.text(value,
duration)`: Motion Canvas interpolates text character by character, which renders
scrambled words mid-tween — snap captions and spend the time as a hold.

---

## When you find a new failure mode

1. Fix it and add a **regression test** (prefer asymmetric matrices; see the
   math-visualization-correctness rule).
2. If it is a new *class* of hazard, add a short entry here (hazard + prevention
   rule only). If an existing rule already covers it, strengthen that rule instead
   of appending a duplicate.
3. Let the test and the commit carry the detailed story — do not paste a full
   post-mortem here.

## A `**bold**` span that straddles inline math silently loses its markers

**Seen in:** `rankNullity.ts`'s rank–nullity proof (introduced when the proof
moved from a collapsed `math-note` layer to the lesson's main line as a
`proof` route block, package R3) and, on inspection, pre-existing in
`determinants.ts`, `matrixComposition.ts`, `redBlackTrees.ts`,
`structureModuleItems.ts`, and `subspacesRank.ts` — not fixed there; those
lessons are outside this package's scope.

`ProseWithMath.splitMath` extracts every `$...$` token from the whole string
**before** `splitEmphasis` looks for `**bold**`/`*italic*` markers, and then
runs emphasis-detection independently on each text segment *between* math
tokens. A bold span whose opening `**` and closing `**` land in two different
segments — because a `$...$` token sits between them — can never be
detected: each segment sees only one of the two markers, finds no pair, and
emits the literal asterisks as plain text. Example: `"**The images $A\mathbf{w}_j$
span $\operatorname{Col}(A)$:**"` renders as literal `**` characters around
correctly-rendered math, with no bold applied — silent, not a thrown error,
so it is easy to ship and hard to notice in review.

**The fix is authoring discipline, not a parser change:** keep every
`**...**` span inside a single text run with no `$...$` token inside it. If a
symbol must be referenced in a bolded lead-in, either restate the clause
without the inline math (`"**The images span the column space:**"` instead of
naming `$A\mathbf{w}_j$` inside the bold) or move the math just outside the
markers (`"**the solution** of $A\mathbf{x} = \mathbf{e}_j$"`).

**Now enforced.** `src/lessons/__tests__/proseEmphasis.test.ts` replays
`splitMath`'s exact ordering over **runtime** lesson data (so concatenated
prose is checked as the learner receives it, which source-level pattern
matching gets wrong) and fails on any segment left holding an unpaired `*`.
It covers lesson prose and module-owned assessment items, and carries its own
positive/negative case so it cannot silently stop biting. The nine
occurrences it found on first run — across `change-of-basis`, `determinants`
(×2), `matrix-composition` (×2), `red-black-trees` (×2), `subspaces-rank`,
`systems`, and one `calculus-foundations` module item — are all fixed.

The walker is shared with the KaTeX validator via
`src/lessons/__tests__/lessonProse.ts`; **a new learner-facing prose field on
`LessonDefinition` must be added there**, or both validators will silently
stop covering it.

## `$$display$$` math in prose inverts every span after it

**Seen in:** `chainRule.ts`'s "The honest repair" section, from the day L5
shipped until 2026-08-01. Reported by the repository owner as "broken LaTeX"
on `/lesson/chain-rule` — it survived L5's independent review, that review's
16 findings, and three later self-review passes over the same branch.

`ProseWithMath` understands exactly **one** delimiter: `$...$`, matched by
`/\$([^$]+)\$/g`. That pattern cannot match `$$`, because `[^$]+` refuses the
second dollar. So a `$$display$$` block is consumed asymmetrically: the
opening `$$` contributes one delimiter to the *preceding* span and leaves the
other stranded, and from that point on **every math/text boundary is off by
one for the rest of the string**. Prose gets rendered as math (KaTeX garbles
it — em-dashes and ordinary words become `unknownSymbol` warnings) and the
real LaTeX gets rendered as literal text. In `chain-rule` this inverted the
entire remainder of the derivation, roughly 900 characters.

It throws nothing. KaTeX only *warns* on unrecognized Unicode, and warnings
do not fail a build or a test, so the page ships looking plausible to anyone
not reading the mathematics closely.

**Two lessons worth generalizing:**

- **A delimiter parser must be checked against the delimiter set it actually
  supports, not the one LaTeX supports.** `$$` is universal in LaTeX and
  entirely absent from this renderer.
- **Warnings are not diagnostics.** The KaTeX `unknownSymbol` warnings were
  being emitted on every render of this lesson and nobody saw them. The scan
  that found this rendered every math span with `throwOnError` and inspected
  the warning stream.

**The fix is structural, not a parser change:** display math belongs in a
structural slot — `LessonSection.equation`, or an `EquationSequence` — never
inside a prose string. Where the slot is already occupied (as it was here, by
the lesson's final result), restate the step as inline `$...$`.

**Now enforced.** `src/lessons/__tests__/proseEmphasis.test.ts` fails on any
`$$` in runtime lesson prose, carrying its own positive/negative case so it
cannot silently stop biting. It shares the `lessonProse.ts` walker with the
checks above, so it covers every learner-facing field automatically.

**Checked for elsewhere.** Finding this raised the question of whether it was
one instance or a symptom: every `$...$` span the app's own parser currently
recognizes as math was rendered through KaTeX in strict mode (2849 distinct
spans, repo-wide) with zero errors and zero warnings, and every learner-facing
prose string was checked for `$` parity. Both were clean — this was isolated,
not systemic. The same pass added a second, more general test alongside the
`$$`-specific one: **any odd number of `$` in a prose string**, not just a
`$$` block, leaves one delimiter unpaired and corrupts every span after it the
same way — a stray literal dollar sign ("costs $5 to run") would trigger it
identically. That guard found nothing live but is proven to bite (a synthetic
regression injected and reverted) so the next occurrence is caught before
shipping rather than found later by an owner reading the page.

## A named route target that resolves to nothing drops content silently

**Seen in:** the `visual` + `sceneId` placement used by `eigenvectors`,
`fundamental-theorem`, and `derivative-local-linearity` — unvalidated from the
day it shipped until 2026-08.

`LessonLayout` renders a `visual` block naming a `sceneId` as **that scene or
nothing** — it deliberately never falls back to the lesson's own clip, because
falling back would quietly put the *wrong* animation where the route asked for
a specific one. Correct, but it means a typo'd or renamed `sceneId` removes
the animation from the page with no error, no console warning, and no failing
test. The lesson still renders; the learner just never sees the clip. Package
R1's `explore` + `explorationId` placement copied the same shape.

**Prevention rule:** every route block that names a target by id must have its
target resolved in `contentValidation.test.ts`. That now covers `visual`
(`sceneId`), `explore` (`explorationId`), `callout`, `proof`, `composed`,
`section`, `formal`, `worked`, and `handoff`. When you add a route-block kind
that references content by id, add its resolution check in the same commit —
the renderer's own `return null` is not a safety net, it is the failure mode.

## Marginal caption clipping, revealed only when webfont metrics differ

**Seen in:** `solution-sets`, at the beat where "homogeneous — varies" and
"their sum — a solution" are captioned (frame ≈ 2082).

The two captions sit **7–10px** from the stage edge. When the guided-scene hard
gates run before `Source Sans 3` has loaded, the fallback face measures slightly
wider and both captions cross the edge, so `text-clipping` fires. The run is
therefore **intermittent — roughly 2 failures in 6** — and it is *not* a load
flake: it reproduces standalone, at the same rate, on a tree with no local
changes.

**Why it matters.** A caption that clips only under a font race is a real defect
that ordinary review will never see, and "it passed last time" is not evidence.
The gate is behaving correctly; the scene is genuinely marginal.

**The fix is not "increase the tolerance".** Either shorten the captions or move
them inside the safe frame with room for the widest plausible metrics. A scene
whose text fits only in the best case is not laid out.

*Recorded 2026-07-28 while shipping applied-mathematics Package A slice A1. Not
fixed there: `solution-sets` is a linear-algebra lesson and outside that
package's scope. It needs its own narrow-correction commit.*

## Media-heavy specs that fail only inside the full `--e2e` sweep

**Seen in:** `benchmark-lab.spec.ts` ("elimination: builds and plays every
candidate") and `inline-motion-figures.spec.ts`
("elimination-fixed-intersection loads both formats and poster").

Two consecutive full `./check.sh --e2e` runs on the same tree failed **different**
tests: the first only `solution-sets` hard gates, the second only these two, with
`solution-sets` passing. Both re-run green in isolation — 16/16 — and the
symptoms are starvation rather than wrongness: a design-lab clock still reading
`0.00s / 38s` after 15s, and a `<video>` that never became scrollable within 30s.

**Why it matters, and why it is different from the entry above.** The caption
clipping *does* reproduce standalone at the same rate; these do not. That
difference is the evidence that separates a real marginal defect from contention
under two Playwright workers on a suite that decodes video and drives Motion
Canvas at the same time. Do not conflate them, and do not "fix" either by
re-running until green.

**What would actually settle it:** raise the timeouts on the two media specs to
match what a loaded machine needs, or serialize the media-decoding specs into
their own project. Both are platform work on the harness, not lesson work.

*Recorded 2026-07-28 while shipping Package A slice A3, on a tree whose changes
touch none of the three specs.*

## `Latex` glyph identities are not stable across a scene reset, and can fail seek-determinism

**Hazard.** The `seek-determinism` hard gate seeks to a segment's midpoint two
ways — forward from frame 0, and backward (via a full scene reset) from the
last frame — and compares every sampled node's identity, position, and
opacity. A scene with several `Latex` nodes whose **text content differs
across beats** can fail this gate even though the canvas pixels are byte-
identical in both replays (the gate's own `canvas matches` note confirms it):
`Latex`'s internal glyphs are children of the node, individually auto-keyed by
a per-class-name counter (`Scene2D.registerNode`) that is reset per scene
instance, but `Latex` also resolves its rendered SVG through a **static,
process-lifetime cache** (`Latex.texNodesPool` / `svgContentsPool`, never
cleared by `reset()`). Whether a given string's glyphs are freshly built or
served from that cache can differ between the two replay paths, and the
resulting construction-order difference reassigns which glyph gets which
auto-generated key — so the gate compares the wrong pair of (visually
identical) nodes and reports a large, spurious position delta.

**Confirmed NOT the cause, tried in this order, same failure signature every
time:** giving every node an explicit `key` (fixes the *parent* Latex node's
own identity, not its auto-keyed children); moving beat-to-beat text out of
imperative `node.tex(string)` calls into a signal (`tex: mySignal`); replacing
one reused, repeatedly-mutated label with one static, never-mutated node per
distinct string (rules out mutation timing, not the cache/counter race
underneath it). A scene built the same way with *more* distinct strings and
*more* beats (`ftc-telescoping`) did not trip it — the fragility is not simply
"how many Latex nodes", and no reliable trigger short of the framework's own
cache state has been found.

**Prevention (partial).** Keep beat-to-beat title/caption/equation text as
short-lived as possible and prefer the fewest distinct strings a clip
genuinely needs; this lowers the odds of hitting the race without eliminating
it. Do not spend further authoring effort chasing a specific occurrence past
one focused diagnostic pass — confirm via the gate's own `canvas matches`
note that the mismatch is confined to node identity, not pixels, and record
it here rather than reinvent the diagnosis. A real fix would patch
`@motion-canvas/2d`'s `Latex`/`Scene2D` (out of scope for lesson authoring).

**Not a lesson-content defect.** Every other hard gate (motion presence, no
teleport, no flicker, text-in-stage, no overlap, segment-overrun,
empty-frame) is unaffected, and chapter-seeking/Prev-Next/reduced-motion all
work normally for an affected scene.

*Recorded 2026-07-29–30 while shipping applied-mathematics Package A slice A4,
on `ftc-accumulate-then-measure`.*
