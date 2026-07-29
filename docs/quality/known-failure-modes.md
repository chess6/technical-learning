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
