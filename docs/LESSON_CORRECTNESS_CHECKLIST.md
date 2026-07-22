# Lesson / visualization correctness checklist

Copy this section for each new or substantially changed visualization surface.
Do not mark complete until every applicable item is done.

Reference both standards: [LESSON_DESIGN.md](./LESSON_DESIGN.md) (pedagogy,
notation, visual language) and [MATH_CORRECTNESS.md](./MATH_CORRECTNESS.md)
(mathematics), plus [ERROR_LOG.md](./ERROR_LOG.md) (known failure modes).

## Mathematical review

- [ ] Formulas independently verified (hand calc or known identity)
- [ ] Shared utilities from `src/math` used for all linear algebra
- [ ] No hardcoded geometry that conflicts with the mathematical model
- [ ] Basis-column convention verified (\(A\mathbf{e}_1\) / \(A\mathbf{e}_2\) = columns)
- [ ] Determinant / eigen edge cases checked where the surface touches them
- [ ] Identity→\(A\) interpolation labelled as a visual transition if used

## Visual review

- [ ] Labels match numeric values / KaTeX readouts
- [ ] Arrows point to computed endpoints
- [ ] Grid families align with transformed basis vectors
- [ ] No clipping or misleading overlap of critical labels
- [ ] Screen-\(y\) inversion does not alter mathematical meaning
- [ ] Animation intermediate states are labelled honestly

## Testing review

- [ ] Unit tests for pure math helpers
- [ ] Invariant tests (`src/math/invariants.ts`) for the relevant properties
- [ ] Asymmetric matrix covered (`[[1,2],[3,4]]` or `diagnostic-asymmetric`)
- [ ] Singular / collapse case covered when relevant
- [ ] Browser test for learner-visible readouts when UI is involved
- [ ] [ERROR_LOG.md](./ERROR_LOG.md) entry added if fixing a math/visualization bug

## Teaching review

- [ ] Visualization does not imply a false mathematical statement
- [ ] Readouts and explanation text agree
- [ ] Learner-facing notation uses KaTeX where appropriate

---

## Lesson 3 — Linear Systems: Two Pictures of One Equation

Keystone lesson unifying the row and column interpretations of `A x = b`,
inserted between *Matrices as Linear Transformations* and *Determinants*
(numbered content Lesson 3; the later transformation lessons shift down one).
It reuses Lesson 1's exact numbers so it strengthens that edge rather than
adding an isolated node: independent columns are the basis `(v, w)`, dependent
columns are `(v, 2v)`, and the targets are Lesson 1's `q` and `r`.

### Mathematical review

- [x] Classification is a single shared source of truth: `classifyLinearSystem2x2` / `solveLinearSystem2x2` in `src/math/systems.ts` (Cramer on the shared `determinant2x2`; consistency for a singular system decided by a span/parallel test)
- [x] Row geometry is a single shared source of truth too: `classifyRowConstraint` returns `line` / `all` (`0 = 0`) / `empty` (`0 = c`), so a zero row is never drawn as a false line (regression `systems.test.ts`: `A = [[0,0],[1,0]]`)
- [x] No linear algebra reimplemented in the explorer or the scene — both call the shared helpers / `matrixColumn`
- [x] Row lines and column arrows computed in math space; pixel / y-flip mapping applied only in the renderer
- [x] Singular / collapse case is the core content (infinite vs none), not an afterthought
- [x] Unique solution verified to satisfy `A x = b` (regression test over a grid of targets)
- [x] Dependent recipe endpoint is `s0·e` (the point on the column line matching `b`) — equals `b` when consistent, `b`'s projection when not; the `t` slider sweeps the recipe without moving the endpoint

### Visual review

- [x] Row picture (coefficient space `(x, y)`) and column picture (output space) are explicitly labelled as **different spaces**, not identically-labelled Cartesian planes
- [x] Row picture (`Line.ThroughPoints` / all-space fill / impossible-equation note) and column picture (columns + combination + target) are the SAME system, synchronized
- [x] Degenerate rows drawn honestly: `0 = 0` as a faint full-plane fill ("no constraint"), `0 = c` as an "impossible" note with no line — never a false intersection
- [x] Solution dot / classification readout match `classifyLinearSystem2x2`
- [x] Infinite case demonstrates *infinitely many recipes*: the `t` slider moves both scaled arrows while the endpoint stays on `b`; no-solution case shows the endpoint stuck on the column line, never reaching `b`
- [x] Highlighted preset is derived from live state — dragging `b` off a preset falls back to "free" (no stale "Infinitely many" label over a "No solution" readout)
- [x] Near-singular independent matrix is handled: off-screen solution triggers a warning readout + in-scene note instead of a silently clipped visual
- [x] Distinct role colors + a labelled legend (equations, columns, target); not color-only
- [x] Guided scene uses a local scale so `b = (-1, 5)` and `(3, 6)` stay inside the safe frame; lines clipped to the box (no thousands-of-pixels segments)
- [x] Guided scene uses a **true space transition**: the row lines fully fade to 0 and a "coefficient space → output space" tag switches before the columns appear (no overlaid planes)
- [x] Scene captions label each case honestly (unique / infinitely many / none)

### Testing review

- [x] Unit tests for `src/math/systems.ts` (`systems.test.ts`): trichotomy, zero-matrix edge case, grid consistency check, `classifyRowConstraint` line/all/empty, and the zero-row regression (`A = [[0,0],[1,0]]`)
- [x] Wiring tests: lesson order, guided scene + explorer resolve, row/column sections, three worked cases, formal blocks, practice tiers, Lesson 1 number reuse
- [x] Singular / no-solution / infinite-solution cases all covered
- [x] Browser check of all three explorer presets + guided scene playback (screenshots in `screenshots/`)

### Teaching review

- [x] One-sentence mental model: one equation, two pictures (rows meet in a point; columns combine to a target)
- [x] Opens with a genuine question (are the two questions the same?), not a definition
- [x] Compression payoff: consistency ⇔ `b` in the column space; uniqueness ⇔ independent columns ⇔ invertibility
- [x] Determinant is **not** taught or exercised here — statements are framed in independence / reversibility; `det` appears only in "looking ahead" asides that name (never compute) the next lesson's number
- [x] Misconceptions staged as confrontations (row vs column "different problems"; equation count vs independence)
- [x] Strengthens edges to Lesson 1 (basis ⇒ unique) and Lesson 2 (columns rule) and seeds Lesson 4 (determinant detects the boundary)
- [x] Practice tiers check / drill / transfer; problem set is sequenced to *derive* the trichotomy — classify → translate-to-`A`-`b` → construct-an-inconsistent-system → generalize-where-inconsistency-lives → counterexample → explain-why (construct / counterexample / explain are genuine `prediction` items, not multiple choice)

---

## Lesson 4 — Determinants as Signed Area Scaling (M5)

### Mathematical review

- [x] Formulas independently verified (hand calc or known identity)
- [x] Shared utilities from `src/math` used for all linear algebra
- [x] No hardcoded geometry that conflicts with the mathematical model
- [x] Basis-column convention verified (\(A\mathbf{e}_1\) / \(A\mathbf{e}_2\) = columns)
- [x] Determinant edge cases checked (singular, near-singular, negative, asymmetric)
- [x] Identity→\(A\) interpolation labelled as a visual transition in guided captions

### Visual review

- [x] Labels match numeric values / KaTeX readouts
- [x] Arrows / parallelogram vertices from `applyMatrixToUnitSquare` / `matrixVectorMultiply`
- [x] Orientation uses dashed edge (non-color cue) plus sign readout
- [x] Safe framing preserved; singular states remain finite
- [x] Screen-\(y\) inversion only in render mapping (`toPixels` / Mafs)
- [x] Collapse / negative det states labelled honestly

### Testing review

- [x] Unit tests (`m5-classify`, `DeterminantExplorer`)
- [x] Invariant / area tests via `assertUnitSquareAreaMatchesDeterminant`
- [x] Asymmetric matrix covered (`diagnostic-asymmetric`)
- [x] Singular / collapse covered
- [x] Browser test `e2e/lesson-determinants.spec.ts`
- [x] No new ERROR_LOG bug found during M5

### Teaching review

- [x] Does not imply false statements about det
- [x] Readouts and explanation text agree
- [x] KaTeX used for learner-facing notation
- [x] Quality-bar focus applied (script-event beats, attention focus helpers, ghost-square continuity, name-after-intuition, Lesson 2 column callback, successive diagonal area stages with explicit digression) — see `docs/animation-quality-bar.md`; shared helpers in `sceneKit.ts` (`focusOpacities`, `morphMatrixEntries`, `makeGhostClosedRegion`)

---

## Lesson 4 — Eigenvectors and Eigenvalues (M5 + Chapter 1 depth)

### Mathematical review

- [x] Formulas independently verified (\(A\mathbf{v}=\lambda\mathbf{v}\))
- [x] Shared utilities from `src/math` (`analyzeEigen2x2`, classify helpers)
- [x] Derivation spine: `characteristicPolynomial2x2`, `characteristicRoots2x2`, `matrixShift`, `nullspaceBasis2x2` (`Subspace2D`), `eigenDerivation2x2`
- [x] No TeX/prose in `src/math` — formatting in `eigenFormat.ts`
- [x] No hardcoded eigendirections independent of analysis
- [x] Eigenpairs verified with `assertEigenpair` / `verifiesEigenpair`
- [x] Eigen edge cases: zero vector, λ=0, scalar (`plane`), defective (`line`), complex/no-real
- [x] Asymmetric lesson matrix: λ=3 → (1,0); λ=2 → multiple of (−1,1)
- [x] Visual transitions labelled; complex case states complex eigenvalues may exist

### Visual review

- [x] Labels match numeric / KaTeX readouts
- [x] Eigendirection dashes + arrows from `summarizeEigenAnalysis` / derivation
- [x] Derivation scene embeds in worked example (not a second top-level Watch)
- [x] Off-axis λ=2 direction explicitly labelled in scene + callouts
- [x] Static `EigenSolutionDiagram` for practice reveals
- [x] Stable direction normalization (`stabilizeDirection`)
- [x] Safe framing; reduced-motion via shared player
- [x] Screen-\(y\) inversion only in render mapping
- [x] Defective / no-real cases labelled honestly (no fabricated second direction)

### Testing review

- [x] Unit tests (`eigen.test.ts` derivation helpers, `m5-classify`, `EigenvectorExplorer`)
- [x] `sceneTimings.test.ts` for derivation ladder metadata
- [x] Wiring: worked example `guidedSceneId`, tiers, callouts
- [x] Component tests: DepthLayer, MisconceptionCallout, SolutionReveal, ExercisePanel eigenvalue
- [x] `assertEigenpair` on displayed directions
- [x] Distinct-real covered via `eigen-distinct`
- [x] λ=0 covered via `eigen-zero` preset
- [x] Browser test `e2e/lesson-eigenvectors.spec.ts` (worked computation + tiers)
- [x] No new ERROR_LOG bug found during depth expansion

### Teaching review

- [x] Zero vector never presented as an eigenvector
- [x] Readouts and explanation text agree
- [x] KaTeX used for \(A\mathbf{v}=\lambda\mathbf{v}\)
- [x] Worked example teaches computation with faded second example
- [x] Misconception confrontations at natural points (axes, reverse, defective)
- [x] Concept-graph callbacks to determinants (collapse), span, transformations
- [x] Tiered practice: check / drill / transfer with solution visuals
- [x] Depth layers (connection, looking-ahead, math-note, trap)
- [x] Quality-bar focus applied to Watch (name-after-intuition for “eigenvector”, Lesson 3 collapse callback on λ=0, clearer counterexample caption on rotation; shared `morphMatrixEntries` / `focusOpacities`)

### 3D extension + expand modal (Lesson 4 clip polish)

- [x] 3D objective named: in three dimensions, an eigendirection is still a line that maps onto itself
- [x] 2D derivation vs 3D extension non-equivalence made explicit (different curated \(3\times 3\) example; labels "2D derivation" / "See it in 3D")
- [x] Curated matrix \(A=1.5P\) documented; \(\chi_A(t)=(t-1.5)(t^2+1.5t+2.25)\) with negative quadratic discriminant verified in tests
- [x] Semantic `majorStepId` synchronization (not raw timeline progress across scenes)
- [x] Single-renderer lifecycle (inline unmounts while modal open; Motion Canvas dispose verified)
- [x] WebGL-unavailable fallback + retry path (`forceUnavailable` / jsdom)
- [x] Constrained OrbitControls + Reset view; reduced-motion disables damping auto-motion
- [x] Expand modal scoped to Lesson 4 eigen clips only
- [x] Unit tests: `eigen3.test.ts`, `EigenClipStage.test.tsx`; e2e coverage for modal + 3D entry

#### Clip readability pass (2026-07-20)

- [x] 3D vectors carry real cone arrowheads + on-object labels (`v`, `Av = 1.5 v`,
  `eigenline (1,1,1)`); a color→meaning legend backs up the roles (no color-only cues)
- [x] 3D colours aligned with the 2D `--role-*` tokens (input=original, image=transformed,
  eigenline=selected); camera looks roughly perpendicular to (1,1,1) so the line reads as spatial
- [x] `shift-collapse` draws the image plane explicitly (translucent quad with normal (1,1,1))
  and frames the eigendirection as the nullspace of `A − λI`; caption/legend wording precise
- [x] New math regressions in `eigen3.test.ts`: single application scales length ×1.5 and turns
  ordinary vectors (not a spiral), `v`/`Av` stay collinear, cube collapses into `x+y+z=0`
- [x] 2D Watch scene shows an honest `λ` readout tied to geometry (tip length = λ · ghost length)
  on the highlight/stretch/reverse/collapse beats; captions made symbol-first (not color-named)
