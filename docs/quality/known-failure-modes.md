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

---

## When you find a new failure mode

1. Fix it and add a **regression test** (prefer asymmetric matrices; see the
   math-visualization-correctness rule).
2. If it is a new *class* of hazard, add a short entry here (hazard + prevention
   rule only). If an existing rule already covers it, strengthen that rule instead
   of appending a duplicate.
3. Let the test and the commit carry the detailed story — do not paste a full
   post-mortem here.
