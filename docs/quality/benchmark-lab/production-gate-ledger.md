# Production hard-gate ledger

What the benchmark-derived hard gates found when they were first pointed at
every registered guided scene, and what was done about each finding.

The gates are in `src/guided-scenes/validation/hardGates.ts`; the permanent
run is `e2e/guided-scene-hard-gates.spec.ts`. See
[README.md](README.md) for what the laboratory is.

## Package status

| Package | Branch | Status | Scope |
| --- | --- | --- | --- |
| Guided-animation redesign · production slice 1 | `guided-animation-redesign-slice-1` | **IN PROGRESS** | Trustworthy changing-geometry and beat-intent contracts; focused missing-treatment benchmarks; composable presentation primitives; redesigns of `matrix-transformations`, `elimination`, and `red-black-encoding`; restrained inline motion figures |

## Result

First full sweep: **23 findings across 8 of 18 scenes.** After the corrections
below: **18 of 18 scenes pass every gate**, and the sweep is a checked-in e2e
suite so the same defects cannot return silently.

Ten scenes were clean on the first run and are recorded here as clean, not as
unexamined: `columns-rule-graphic`, `solution-sets`, `matrix-composition`,
`rank-nullity`, `change-of-basis`, `vectors-linear-combinations`,
`matrix-transformations`, `transform-spike`, `bst-lift-from-array`,
`red-black-encoding`.

A later correction sweep tightened what “measured” and “motion” mean. It found one visible empty `Line` placeholder in `linear-systems` and nine segments whose only changes were captions, readouts, label scale, or line thickness. The empty line was removed. Those nine beat budgets are now named as holds/pauses, so a caption-only climax or newly inserted object no longer clears `missing-claimed-motion`; an already-authored non-text diagram fade may still count as choreography, while semantic contracts verify the mathematical operation itself.

The same pass promoted line endpoints, drawn fractions, and measurement failures into the sample model. Visible unmeasurable nodes now fail closed. Scene-specific semantic contracts cover static and transformed axes/integer lattices, the displayed `p=(4,1)` arrow/readout agreement in both coordinate scenes, and the whole-plane span cue. The `p` grids now extend past x=4, and the bounded span parallelogram is replaced by a full-bleed plane cue.

## Corrected defects

| # | Scene | Gate | Defect | Correction |
| --- | --- | --- | --- | --- |
| 1 | `linear-systems` | missing-claimed-motion | The `equations` segment budgets 0.5 s to fade the title and caption in, but both were created at full opacity — the tween ran 1 → 1 and the beat played as a still. | Both overlay labels start hidden, so the declared fade is the motion on screen. |
| 2 | `subspaces-rank` | missing-claimed-motion | Same shape in `two-panels`: 0.6 s budgeted to reveal the cube and the map arrow, both already visible. | Cube and map arrow start hidden. |
| 3 | `determinant-area-scaling` | text-clipping | The signed-area headline printed `det(A) ≈ -0.01 · \|det\| ≈ 0.01 · orientation reversed`, which wrapped to two lines in the overlay band and lost its **first line off the top of the stage**. | `formatSignedArea` drops the redundant `\|det\|` term — the signed value already carries the magnitude. A unit test pins the longest reading to one line. |
| 4 | `determinant-area-scaling` | text-overlap | The orientation-sweep label `e₁ → e₂` rode *outside* the arc, on the same ray as whichever column the arc bisected, printing it under `e₁`/`e₂`. | The label rides inside the arc, at a radius bounded to half the shorter column, so it can never reach the arrow tips. |
| 5 | `karatsuba-cross-terms` | text-overlap | The two ×10 weight labels travelled to one point and sat there superimposed at 0.25 opacity — an unreadable blob at exactly the moment the merge is meant to be read. | They dissolve *as* they arrive while the combined term rises in their place: the merge is still the motion, but the frame never shows two strings on one spot. |
| 6 | `karatsuba-cross-terms` | text-overlap | The peeled `AC` corner tile carried its label onto the auxiliary panel's title. | The AC corner peels sideways instead of diagonally, clear of the title. |
| 7 | `eigenvectors-derivation` | text-overlap | `λv` and `v` run along one direction, so their tip labels coincided whenever λ ≈ 1 — `λv` was printed under `v` for the whole recap beat. | The `λv` label is offset clear of `v`'s. |
| 8 | `elimination` | text-overlap | The scratch `−2·R1` row faded across its whole travel onto R2, so two readings of the same row were legible on top of each other for the last stretch of the slide. | The ghost dissolves over the first half of the move — gone before it lands. |
| 9 | `linear-systems` | text-overlap | The `b` vector label sat above its tip, in the band where the persistent space tag lives, printing `b` onto `output space — columns combine to reach b`. | The label sits below-right of the tip. |
| 10 | `why-linear-algebra` | text-overlap | The sweeping `e₁`/`e₂` labels crossed the static `x` label during the rotation and shear presets; `origin — watch it` was also swept by `e₂`. | The origin note moved clear of the basis arrows' reach, and the static `x` label retires for the preset tour (its ghost ring still marks the spot) and returns for the translation beat, where the vertex is the subject again. |

## Findings that were the gate's fault, not the scene's

Recorded because the corrections to the *gates* are the reusable part, and
because a gate that cries wolf gets switched off:

| Symptom | Truth | Gate correction |
| --- | --- | --- |
| Every caption "extends 460 px past the stage edge" | Measurements were rebased on the view's bounding-box centre, which unions descendants — any scene with geometry off one edge shifted wholesale (192 px in `determinant-area-scaling`). | Rebase on the view's local origin carried into world space. |
| Empty `Line` geometry in `linear-systems` | The placeholder had no finite box and was visible by opacity even though it drew nothing. | Measurement failures now carry key, type, opacity, and reason into every frame/seek record; visible failures are hard findings. The useless placeholder was removed. |
| A stacked title and subtitle "overlap by 62%" | Text boxes carry leading; the glyphs were 8 px apart. | Vertical comparison uses an em-box band derived from `fontSize`, and requires genuine interpenetration rather than contact. |
| `"x"` and `"Ax"` overlapping 50 px apart | A one-glyph label at 28 px measures 81 px wide. | Ink width is bounded by character count × font size. |
| Eight "flickers" in `eigenvectors-invariant-directions` and `linear-systems` | Smooth crossfades (0.9 → 0.72 → 0.06 → 0 → 0.09 → 0.48 → 0.9) that dip below the visibility threshold — correct practice. | A flicker requires a hard cut out *and* a hard cut back, with no animated shoulder. |
| `elimination`'s scratch row (initially) | A label crossing another during an authored merge is choreography. | Overlap must persist ≥ 0.35 s to count. |

Every one of these was settled by rendering the frame the gate accused and
looking at it. That is the standard: a gate finding is not a defect until a
frame shows it.

## Regression coverage

- `src/guided-scenes/validation/__tests__/hardGates.test.ts` plus `semanticGeometry.test.ts` — 54 tests; every
  gate has both a case that fires it and a case that must not, most built from
  the real measured geometry of the scene that produced the false positive.
- `src/guided-scenes/scenes/__tests__/sceneReadouts.test.ts` — pins the signed
  determinant headline to one line of the overlay band.
- `e2e/guided-scene-hard-gates.spec.ts` — the sweep itself, per scene, failing
  on any finding *and* on any console error (which is what makes the
  `runSegment` overrun detector a gate).
- `src/guided-scenes/scenes/__tests__/kitLayout.test.ts` — the pure layout and
  pacing calculators behind the new motion primitives.

## A note on scope

Semantic geometry contracts now fail objective mathematical mismatches for the explicitly registered grids, coordinate readouts, and whole-plane cue. They are not a universal proof of every scene's mathematics; new mathematical diagram families need their own contract. Nothing here fails on composition, pacing, typography, camera choice, or explanatory rhythm. Those are author judgment, they are where the reference
animations are genuinely better than ours, and they are recorded as evidence in
[scene-composition-grammar.md](scene-composition-grammar.md). A gate that fails
on taste is a gate someone will route around.
