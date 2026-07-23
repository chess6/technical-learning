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
- [x] Dependent recipe parameter `t` does two honest jobs by case: **consistent** → sweeps the null direction with the endpoint pinned at `b` (many recipes, one target); **inconsistent** → sweeps the endpoint `t·e` along the whole reachable line so every recipe visibly misses `b` (reachability fails). Endpoints are all combinations of the shared `matrixColumn`s — no reimplemented algebra
- [x] Near-singular preset is genuinely independent (`det = 0.1 ≠ 0`) with a far off-screen unique solution `(23, −10)`; regression test asserts unique classification, the exact solution satisfies `A x = b`, and a 0.1 nudge of `b` swings the solution by > 1 unit (conditioning)

### Visual review

- [x] Row picture (coefficient space `(x, y)`) and column picture (output space) are explicitly labelled as **different spaces**, not identically-labelled Cartesian planes
- [x] Row picture (`Line.ThroughPoints` / all-space fill / impossible-equation note) and column picture (columns + combination + target) are the SAME system, synchronized
- [x] Degenerate rows drawn honestly: `0 = 0` as a faint full-plane fill ("no constraint"), `0 = c` as an "impossible" note with no line — never a false intersection
- [x] Solution dot / classification readout match `classifyLinearSystem2x2`
- [x] Infinite case demonstrates *infinitely many recipes*: the `t` slider moves both scaled arrows while the endpoint stays on `b`; no-solution case sweeps the endpoint *along* the columns' line (a single dashed arrow with a "miss" connector to `b`), never reaching `b`
- [x] Highlighted preset is derived from live state — dragging `b` off a preset falls back to "free" (no stale "Infinitely many" label over a "No solution" readout)
- [x] Near-singular independent matrix is handled: off-screen solution triggers a sensitivity/conditioning summary + in-scene note + readout, and an **auto-fit** toggle widens only the coefficient-space view to bring the far crossing back in (solution dot radius scales with the fitted extent) instead of a silently clipped visual
- [x] Distinct role colors + a labelled legend (equations, columns, target); not color-only
- [x] Guided scene uses a local scale so `b = (-1, 5)` and `(3, 6)` stay inside the safe frame; lines clipped to the box (no thousands-of-pixels segments)
- [x] Guided scene uses a **true space transition**: the row lines fully fade to 0 and a "coefficient space → output space" tag switches before the columns appear (no overlaid planes)
- [x] Scene captions label each case honestly (unique / infinitely many / none)

### Testing review

- [x] Unit tests for `src/math/systems.ts` (`systems.test.ts`): trichotomy, zero-matrix edge case, grid consistency check, `classifyRowConstraint` line/all/empty, the zero-row regression (`A = [[0,0],[1,0]]`), and near-singular unique-but-sensitive solving
- [x] Wiring tests: lesson order, guided scene + explorer resolve, row/column sections, three worked cases, formal blocks, practice tiers, Lesson 1 number reuse
- [x] Singular / no-solution / infinite-solution / near-singular cases all covered
- [x] Browser test `e2e/lesson-systems.spec.ts`: guided scene play/replay, all four explorer presets (unique / infinite / no-solution / near-singular), the `t` sweep on no-solution, the auto-fit toggle, reset, and a practice check — zero console errors (screenshots in `screenshots/`)

### Teaching review

- [x] One-sentence mental model: one equation, two pictures (rows meet in a point; columns combine to a target)
- [x] Opens with a genuine question (are the two questions the same?), not a definition
- [x] Compression payoff: consistency ⇔ `b` in the column space; uniqueness ⇔ independent columns ⇔ invertibility
- [x] Determinant is **not** taught or exercised here — statements are framed in independence / reversibility; `det` appears only in "looking ahead" asides that name (never compute) the next lesson's number
- [x] Misconceptions staged as confrontations (row vs column "different problems"; equation count vs independence)
- [x] Strengthens edges to Lesson 1 (basis ⇒ unique) and Lesson 2 (columns rule) and seeds Lesson 4 (determinant detects the boundary)
- [x] Practice tiers check / drill / transfer; problem set is sequenced to *derive* the trichotomy — classify → translate-to-`A`-`b` → construct-an-inconsistent-system → generalize-where-inconsistency-lives → counterexample → explain-why (construct / counterexample / explain are genuine `prediction` items, not multiple choice)

#### Math-space contract caption pass (2026-07-21)

- [x] Panel captions now lead with the **space name** as the primary label —
  **"Coefficient space (x, y)"** and **"Output space"** — not "Row picture" /
  "Column picture" (see `docs/MATH_SPACE_CONVENTIONS.md`)
- [x] Labels single-sourced from `COEFFICIENT_SPACE` / `OUTPUT_SPACE` in
  `src/explorations/spaces.ts`; the descriptors state that the labels are
  **semantic roles**, and that both planes are the same underlying \(\mathbb{R}^2\)
- [x] Unit test `src/explorations/__tests__/spaces.test.ts` asserts the two
  distinct, explicit labels; `e2e/lesson-systems.spec.ts` asserts they render on
  the lesson page (with the shared `ExercisePanel` still rendering after its
  capability refactor)

#### Shared-helper routing pass (2026-07-21)

- [x] Guided scene (`linearSystemsScene.ts`) decides "is this row a line?" via
  `classifyRowConstraint` — `rowLineBoxPoints` returns `null` (draws nothing)
  for a zero row, so `0 = 0` / `0 = c` can never render as a **false line**
  (previous local `lineBoxPoints` had an x-axis fallback; removed)
- [x] Guided scene column arithmetic routed through `matrixColumn` /
  `scaleVector` / `matrixVectorMultiply` (`combo = A·(x, y)`,
  `scaledCol1 = scaleVector(col₁, x)`) — no hand-rolled `cx·a11 + cy·a12`
- [x] Explorer `dependentRecipe(A, b, t, consistent)` builds every endpoint with
  `matrixVectorMultiply`, projects with `dotProduct`, and draws `scaled1` with
  `scaleVector(col₁, x)` — no local `x*col1[0] + y*col2[0]`
- [x] New regression block in `src/math/__tests__/systems.test.ts` (`systems
  visualization contracts`): zero-row all/empty vs line, coincident-line infinite
  case, every dependent recipe reaches `b` via `matrixVectorMultiply`, and the
  near-singular solution genuinely off the ±7 view box; `docs/ERROR_LOG.md`
  entry `2026-07-21` logged
- [x] `npm run lint` clean for these files; targeted `vitest` (systems +
  lessonWiring) and `e2e/lesson-systems.spec.ts` green

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

---

## Elimination — Rewriting a System Without Changing Its Answer (2026-07-21)

Sits after *Linear Systems* (Lesson 3) and before determinants, so it becomes
numbered content Lesson 4 (later lessons — Karatsuba, etc. — shift down one).
Reuses Lesson 3's exact running system \(A=\begin{bmatrix}1&3\\2&-1\end{bmatrix}\),
\(\mathbf{b}=(-1,5)\), solution \((2,-1)\), so the learner watches a computation
they already solved get **rewritten** rather than re-solved. Core mental model:
each row operation replaces the constraints with different constraints that
describe exactly the same solution set.

### Mathematical review

- [x] All row-operation algebra is a single shared source of truth:
  `applyRowOperation` / `inverseRowOperation` / `classifyRowOperation` /
  `eliminationStepToClearX` in `src/math/elimination.ts` (2×2 augmented systems);
  the explorer and guided scene reimplement none of it
- [x] Solution-set invariance is the enforced invariant, not an assertion in
  prose: `assertRowOperationPreservesSolutions` compares the trichotomy +
  solution point before/after via the shared `classifyLinearSystem2x2`
- [x] Line geometry for each row routed through `classifyRowConstraint`
  (`line` / `all` = `0=0` / `empty` = `0=c`), so a row scaled to `0=0` renders
  as a full-plane fill, never a false line
- [x] The one **illegal** move (scale by `0`) is modeled honestly:
  `classifyRowOperation` flags it irreversible, and the explorer readout then
  reports the solution set changed instead of hiding it
- [x] Inverse round-trips tested (`inverseRowOperation` undoes each op); illegal
  ops (scale by 0, add row to itself) detected in `elimination.test.ts`

### Visual review

- [x] Three synchronized views — **written equations**, **augmented matrix
  \([A\mid\mathbf{b}]\)**, and the **two constraint lines** — driven from one
  `AugmentedSystem` state; a row operation changes the equations and matrix
  while the crossing point (solution set) stays fixed
- [x] Guided scene animates \(R_2 \to R_2 - 2R_1\): the second line **pivots
  about** the fixed \((2,-1)\) because the added \(-2R_1\) is \(0=0\) there —
  the theorem drawn, not asserted
- [x] KaTeX for equations, augmented matrix (`array` with `|` separator), and
  all readouts; column vectors / standard notation, no raw `[[...]]` in prose
- [x] Distinct role colors (R1 = original, R2 = transformed, solution = selected,
  starting-point ghost = invariant) + a labelled legend; not color-only
- [x] Degenerate rows after an illegal move drawn honestly (full-plane fill +
  text note), never a fabricated intersection

### Testing review

- [x] Unit tests `src/math/__tests__/elimination.test.ts`: solution-set
  preservation across unique / infinite / none, illegal-move detection, correct
  elimination step, inverse round-trips
- [x] Wiring test block in `lessonWiring.test.ts` (guided scene + explorer
  resolve, custom capabilities used, invariance theorem present, lesson order /
  numbering — elimination = 4, Karatsuba shifts to 7)
- [x] Registry test lists `elimination`; `courseModel.test.ts` marks it built
- [x] Browser test `e2e/lesson-elimination.spec.ts`: guided scene play/replay,
  the triple-view explorer, a legal op keeps `(2,-1)` + `data-preserved="true"`
  while the matrix changes, the illegal scale-by-0 flips to `infinitely many` /
  `data-preserved="false"`, reset restores, and the committed-prediction
  practice grades correct — zero console errors (screenshot in `screenshots/`)

### Teaching review

- [x] One-sentence mental model: a row operation swaps the constraints for
  different ones with exactly the same solution set (not a bag of tricks)
- [x] Opens with a genuine question (if you change the equations, how do you know
  you have not changed the answer?), reuses Lesson 3's solved system
- [x] Proof block (`thm-invariance`) proves invariance both directions (nothing
  lost / nothing gained) and pins reversibility as the reason
- [x] Determinant not taught here — framed in reversibility / equivalence; only a
  "looking ahead" aside names the next lesson
- [x] Exercises validate the new platform capabilities: committed prediction,
  exercise sequence, matrix entry, error diagnosis (illegal move), construction
  of an inconsistent system, and a self-checked invariance proof

#### Correctness pass (2026-07-22)

- [x] Row-operation validity requires a **finite** factor (not just nonzero):
  `isSolutionPreserving` / `classifyRowOperation` / `inverseRowOperation` /
  `numericalStabilityWarning` reject `NaN`/`±∞` (self-add via its canonical
  `1+k` scale); non-finite is an illegality, kept separate from the
  tiny-factor stability warning (regression block in `elimination.test.ts`)
- [x] `haveSameSolutionSet` models both infinite geometries — one **line** or
  the whole **plane** — via `infiniteSolutionGeometry` (reusing `solutionLine` /
  `classifyRowConstraint`), so the all-zero system equals itself and a line ≠
  the plane (regression tests added)
- [x] Explorer's permanent description, canvas caption, and Mafs accessible
  label are preset-sensitive (unique = fixed intersection point; infinite =
  coincident lines / shared solution line; none = parallel lines / empty set) —
  no crossing-point language for infinite or inconsistent presets
  (`EliminationExplorer.test.tsx` + `e2e/lesson-elimination.spec.ts` cover all
  three presets, incl. the accessible label)
- [x] Scene-timing unit tests reworded to claim only that declared
  `ELIMINATION_BEATS` budgets fit within their segments and that `runSegment`
  pads (never truncates) — they do **not** execute the Motion Canvas scene, so
  the actual rendered-timeline alignment is evidenced by the Playwright
  scrubber/marker checks, not the unit test
- [x] `docs/ERROR_LOG.md` entry `2026-07-22` logged; `npm run lint` clean,
  full `vitest` suite (460) green, `e2e/lesson-elimination.spec.ts` green
  (pre-existing `tsc -b` errors in `capabilities.ts` / `learnerState.ts` are
  unrelated to this change and present on clean HEAD)

---

## Solution Sets & Homogeneous Systems (2026-07-22)

Sits after *Elimination* (Lesson 4) and before *Composition, inverses &
determinants*, so it becomes numbered content Lesson 5 (later lessons —
Karatsuba, etc. — shift down one). Reuses Lesson 3's dependent running system
(columns \((1,2),(2,4)\), \(\mathbf{b}=(3,6)\)): \(\mathbf{x}_p=(3,0)\), null
direction \((2,-1)\), so \((3,0),(1,1),(5,-1)\) are all solutions. Discovery
engine: two solutions of one consistent system differ by a vector sent to zero,
which makes the decomposition \(\mathrm{Sol}(A,\mathbf b)=\mathbf x_p+\mathrm{Null}(A)\)
inevitable; the solution set is the null space **translated off the origin**, and
empty when the system is inconsistent.

### Mathematical review

- [x] All solution-set structure is a single shared source of truth:
  `solutionSet2x2` / `particularSolution2x2` / `differenceLiesInNullspace` /
  `generateSolution` in `src/math/solutionSets.ts`; the explorer and guided scene
  reimplement none of it (they map math → screen only)
- [x] `solutionSet2x2` short-circuits an **independent** (invertible) `A` to the
  trivial null space `{0}` before consulting `nullspaceBasis2x2` (which assumes a
  singular matrix), so a unique system is a `point`, not a spurious line
- [x] Corrected scope enforced in code and copy: two distinct solutions establish
  **at least an affine line**; one difference direction does **not** determine the
  whole set when \(\dim\mathrm{Null}(A)>1\) (the `A=0` whole-plane caveat is a
  first-class explorer preset and readout)
- [x] Existence vs multiplicity kept separate: an inconsistent `b` yields the
  **empty** set with `Null(A)` unchanged; a trivial null space gives uniqueness,
  **not** reachability (both are distinct readouts, not conflated)
- [x] `generateSolution(x_p, v, t)` produces `x_p + t·v` and every result is
  verified to satisfy \(A\mathbf x=\mathbf b\); differences verified in `Null(A)`
- [x] Basis-column convention untouched (this surface consumes columns via the
  shared `classifyLinearSystem2x2` / `matrixVectorMultiply`; no local algebra)

### Visual review

- [x] Two linked solution-space panels of the **same** `A`: left = homogeneous
  `A x = 0` (Null(A) through the origin: point / line / whole plane), right =
  `A x = b` (`x_p + Null(A)`, the same shape slid off the origin, or empty)
- [x] The offset arrow origin → `x_p` is drawn as the translate; the difference of
  two solutions is drawn both at its natural place (`x_p → x_p+t·v`) and
  **translated to the origin**, where it lands on the null line — the theorem
  drawn, not asserted
- [x] Guided scene animates the discovery arc (two solutions → subtract → add back
  to generate → the null line → the shifted set → the empty/point/line cases) in
  solution space, reusing Lesson 3's numbers
- [x] KaTeX for the particular-solution and generated-solution readouts (column
  vectors via `VectorTeX`); no raw `[[...]]` in learner-facing prose
- [x] Distinct role colors (Null(A), solution set, particular `x_p`, generated
  `x_p+t·v`, difference) + a labelled legend; not color-only
- [x] Whole-plane / empty degenerate states drawn honestly (shaded region / "∅ — b
  is unreachable" note), never a fabricated line
- [x] Paused establishing frame at `t=0`; reduced-motion path shows the first
  major idea without autoplay (shared player)

### Testing review

- [x] Unit tests `src/math/__tests__/solutionSets.test.ts`: `particularSolution2x2`
  (unique / dependent-consistent / inconsistent / zero-matrix), `solutionSet2x2`
  (point / line / empty / whole-plane / homogeneous), and the discovery-engine
  invariants (`differenceLiesInNullspace`, `generateSolution` stays a solution)
- [x] Asymmetric / dependent matrix covered (columns `(1,2),(2,4)`); singular
  collapse (`A=0` whole plane) and trivial null space (`point`) both covered
- [x] Wiring block in `lessonWiring.test.ts` (guided scene + explorer resolve,
  theorem + misconception guards present, exercise tiers, lesson order /
  numbering — solution-sets = 5, Karatsuba shifts to 8); `courseModel.test.ts`
  marks it built; registry lists `solution-sets`
- [x] Browser test `e2e/lesson-solution-sets.spec.ts`: guided scene
  play/replay + six ordered idea markers, the free-variable `t` sweep generating a
  new solution, the difference toggle, and every explorer preset
  (line / point / empty / whole-plane / homogeneous) with its readouts — zero
  console errors (screenshots in `screenshots/`)

### Teaching review

- [x] One-sentence mental model: the solution set is the null space carried off the
  origin — one particular solution anchors it, `Null(A)` supplies every other
- [x] Opens with a genuine question (what *shape* is "infinitely many"?), building
  on Lesson 3's trichotomy rather than restating it
- [x] Discovery before theorem: the learner subtracts two solutions and generates a
  third **without re-solving** before the decomposition is named
- [x] Consistency condition never dropped: the decomposition is stated **only** for
  consistent systems; the inconsistent case is the empty-set confrontation
- [x] Supporting ideas integrated, not bolted on: homogeneous systems separate
  multiplicity from existence; free variables are coordinates on independent null
  directions (seeds rank–nullity) — both surface inside the one lesson
- [x] `npm run lint` clean; full `vitest` suite (479) green; `npm run build` green;
  `e2e` suite (46) green including the new spec
