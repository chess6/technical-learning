# Lesson / visualization correctness checklist

Copy this section for each new or substantially changed visualization surface.
Do not mark complete until every applicable item is done.

Reference both standards: [authoring/lesson-design.md](../authoring/lesson-design.md) (pedagogy,
notation, visual language) and [engineering/math-correctness.md](../engineering/math-correctness.md)
(mathematics), plus [quality/known-failure-modes.md](known-failure-modes.md) (known failure modes).

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
- [ ] [quality/known-failure-modes.md](known-failure-modes.md) entry added if fixing a math/visualization bug

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
  "Column picture" (see `docs/engineering/math-space-conventions.md`)
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
  near-singular solution genuinely off the ±7 view box; `docs/quality/known-failure-modes.md`
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
- [x] Quality-bar focus applied (script-event beats, attention focus helpers, ghost-square continuity, name-after-intuition, Lesson 2 column callback, successive diagonal area stages with explicit digression) — see `docs/authoring/animation-quality-bar.md`; shared helpers in `sceneKit.ts` (`focusOpacities`, `morphMatrixEntries`, `makeGhostClosedRegion`)

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
- [x] `docs/quality/known-failure-modes.md` entry `2026-07-22` logged; `npm run lint` clean,
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
  solution space, reusing Lesson 3's numbers. The final beat **visually** clears
  the shifted set for ∅, collapses Null(A) for the unique-point case, then
  restores the affine line — not caption-only.
- [x] Whole-plane preset exposes **two** free-variable sliders \(t_1, t_2\) with
  readout \(\mathbf{x} = t_1\mathbf{e}_1 + t_2\mathbf{e}_2\), so nullity-2 is
  experienced (Package 3 abstraction return), not only stated
- [x] KaTeX for the particular-solution and generated-solution readouts (column
  vectors via `VectorTeX`); no raw `[[...]]` in learner-facing prose
- [x] Distinct role colors (Null(A), solution set, particular `x_p`, generated
  `x_p+t·v`, difference) + a labelled legend; not color-only
- [x] Whole-plane / empty degenerate states drawn honestly (shaded region / "∅ — b
  is unreachable" note), never a fabricated line
- [x] Paused establishing frame at `t=0`; reduced-motion path shows the first
  major idea without autoplay (shared player)
- [x] Difference toggle is named for what it controls ("translated to the origin");
  the natural difference arrow stays visible as the thing being translated

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

---

## Systems–Elimination module — lesson-owned mastery remediation (2026-07-22)

Implements Packages **B–E** of the
[implementation package](../courses/linear-algebra/modules/systems-elimination/implementation-package.md)
across L3 systems, L4 elimination, L5 solution-sets: fresh-instance E3 production,
de-inflated Checks (reveal-only `prediction` → `committed-prediction` on fresh cases),
genuine E4 construction on fresh columns, and learner-written proof surfaces. Adds one
new shared example (`systems-fresh`) and the L4 self-addition-legality prose fix. No
math/visualization renderer changed — only lesson content + one pure-data example.

### Mathematical review

- [x] Every number in the new `systems-fresh` example verified against the shared
  `src/math` source of truth (Cramer solve, `classifyLinearSystem2x2`,
  `particularSolution2x2`, `solutionSet2x2`, `generateSolution`,
  `differenceLiesInNullspace`) — no algebra reimplemented in lesson code
- [x] Asymmetric matrices used (independent det \(=-5\); a genuinely dependent pair
  \((1,2),(3,6)\) with null direction \((3,-1)\)); distinct from `systems-default` so a
  drill cannot be passed by recall (guarded by a test)
- [x] Fresh elimination arithmetic hand-checked and test-checked (multiplier 3,
  triangular row \((0,-5\mid-15)\), \(y=3\), \(x=-2\))
- [x] `construct-in-explorer` items grade against `classifyLinearSystem2x2` (expect
  `none`) — a real predicate, not a self-mark
- [x] L4 illegal-moves prose corrected: \(R_i\to R_i+R_i=2R_i\) is a legal nonzero
  scaling (reversible); \(i\ne j\) is only the definitional boundary of *replacement*
  (matches the L4 insight contract)

### Testing review

- [x] New unit test `src/lessons/__tests__/freshExample.test.ts` (8 cases) covers the
  independent solve, fresh elimination arithmetic, dependent consistent line, generate-
  a-third, and the inconsistent (empty) case
- [x] Full `vitest` suite green (**487**, +8) incl. `lessonWiring` (route ids resolve,
  tiers), `courseModel`, `ExercisePanel`, `capabilities`, `contentValidation`
- [x] `npm run lint` (oxlint) clean; `tsc -b` reports 0 errors on the edited files
- [x] `e2e` for the three touched lessons green
  (`lesson-systems`, `lesson-elimination`, `lesson-solution-sets`; 5 tests) — no console
  errors; committed-prediction still grades

### Teaching review

- [x] Fresh drills are labeled "a different system" so continuity with the taught
  running example is preserved while the drills demand production, not recall
- [x] KaTeX / column vectors throughout; no raw `[[...]]` in learner-facing prose
- [x] Proof `self-check` items are honestly framed as E6 *surfaces* (learner writes the
  proof + model answer + rubric); the contracts and implementation package state that E6
  **credit** requires human scoring (module Package F), not the in-app self-mark
- [x] L3 trichotomy proof item derives the result from independence/basis, **not** the
  not-yet-defined determinant (matches the corrected L3 insight contract)
- [x] Mastery contracts (L3/L4/L5) Gate 8 records updated: **PASS for lesson-owned
  P1/P2 outcomes (E3/E4)**; **P3 proof line CONDITIONAL** pending human scoring

---

## Systems–Elimination module — Packages B–E evidence-integrity correction (2026-07-23)

Corrects the over-claim recorded in the 2026-07-22 pass above. Under the active
**P3 override** for this module, Gate 8 is a single gate and cannot PASS while any
lesson-owned outcome sits below its required level or a proof surface stays
unscored. Re-audits every named item against the canonical evidence definitions
(`multiple-choice` / committed-MC = **E1** recognition; commit-before-reveal makes
an item *valid* but not automatically E3; **E3** = fresh unaided production of the
*complete* outcome; **E4** = unfamiliar transfer/construction; `self-check` = an
**unscored E6 surface**), completes the missing lesson-owned evidence, and
restores all three Gate 8 verdicts to **NOT PASSED**. No math/visualization
renderer changed — lesson content, contracts, and the implementation package only.

### Evidence re-audit (honest levels)

- [x] L3 systems: `sys-classify-fresh` (committed-MC) and `sys-invertible-link`
  are **E1**; `sys-solve-confirm-fresh` (sequence: rows → column confirmation) and
  `sys-translate-augmented-fresh` (full \([A\mid\mathbf b]\) matrix-entry) are **E3**;
  `sys-construct-inconsistent` is **E3** construction (not E4 — same familiar frame);
  `sys-reason-dependent-count` and the two proofs are **E6 surfaces** (unscored)
- [x] L4 elimination: committed-prediction / diagnosis-identification MC are **E1**;
  `elim-diagnose-repair-fresh` (identify **E1** + numeric repair **E3**),
  `elim-contradiction-row-fresh` (matrix-entry **E3**) and `elim-construct-infinite`
  (construct-in-explorer **E3**) supply fresh production/construction below the P3
  **E4** target; the invariance proof is an **E6 surface**
- [x] L5 solution-sets: committed-MC items are **E1**; `sol-produce-parametric-fresh`
  and `sol-freevars-dimension-fresh` (sequences) are **E3** production;
  inconsistency-refusal is **E1**; `sol-justify-existence-multiplicity`,
  `sol-justify-one-direction`, and the proofs are **E6 surfaces**
- [x] **Gate 8 = NOT PASSED** for L3, L4, and L5 — recorded as a single verdict per
  lesson (no per-outcome PASS), with the remaining gaps enumerated precisely in the
  [implementation package](../courses/linear-algebra/modules/systems-elimination/implementation-package.md)
- [x] Gate 9 module assessment plan kept **PLANNED**; Class A (module-owned deferred)
  vs Class B (cumulative reassessment of lesson-owned outcomes) ownership preserved

### Mathematical review

- [x] L3 trichotomy proof (`sys-prove-trichotomy`) generalized to **all** dependent
  \(2\times2\) matrices via a nonzero null relation
  \(\alpha\mathbf a_1+\beta\mathbf a_2=\mathbf 0\); explicitly covers a **zero first
  column** (\(\mathbf a_1=\mathbf 0\Rightarrow(\alpha,\beta)=(1,0)\)) and the **zero
  matrix** (\(L=\{\mathbf 0\}\), any nonzero \((\alpha,\beta)\)) — no determinant used
- [x] L3 fresh exercise (`sys-solve-confirm-fresh`) forward bridge corrected: **next
  is elimination (Lesson 4)**; the determinant that certifies independence at a glance
  is **Lesson 7** — no determinant argument in the learner-facing L3 explanation
- [x] L4 duplicated construction removed; replaced by a **different** inconsistent
  system driven to its contradiction row \((0,0\mid 2)\) (fresh matrix-entry) plus a
  distinct infinite-solutions construction
- [x] New / fresh systems hand- and test-checked against `src/math` helpers
  (`classifyLinearSystem2x2`, `matrixVectorMultiply`, `solutionSet2x2`)

### Testing review

- [x] New unit test `src/lessons/__tests__/remediationExercises.test.ts` grades every
  new/changed item on both the **correct** and an **incorrect** path
  (committed-prediction, exercise-sequence, matrix-entry, construct-in-explorer,
  self-check), verifies the inline fresh systems against `src/math`, and asserts the
  L3 trichotomy model answer uses no determinant argument
- [x] Full `vitest` suite green (**505**); `npm run lint` (oxlint) clean; `tsc -b` 0 errors
- [x] `e2e` for the three touched lessons green (`lesson-systems`, `lesson-elimination`,
  `lesson-solution-sets`; 5 tests)
- [x] Browser verification (Playwright, dev server): every new interaction reachable and
  behaving as described — L3 full \([A\mid\mathbf b]\) matrix-entry grades **correct**;
  L4 all 9 main-practice items reachable and the contradiction-row matrix-entry grades
  **correct** (with the taught/fresh elimination matrices correctly rejecting wrong
  values); L5 items reachable and `sol-produce-parametric-fresh` driven through **all four
  steps** (predicate-graded particular solution, predicate-graded null direction, dimension,
  and the complete instantiated point) to full completion via real user gestures

### Teaching review

- [x] Fresh drills demand production, not recall; framed as "a different system" for
  continuity with the taught running example
- [x] Proof and justification `self-check` items honestly framed as **E6 surfaces**
  (learner writes the argument + model answer + rubric); **E6 credit requires human
  scoring** (module Package F), never the in-app self-mark
- [x] KaTeX / column vectors throughout; no raw `[[...]]` in learner-facing prose

---

## Systems–Elimination module — lesson-owned interaction gaps closed (2026-07-23, completion pass)

Completes the *non-scoring* lesson-owned interactions the 2026-07-23 evidence-integrity
pass had documented as still missing (it had honestly marked them incomplete rather than
built). This pass **builds** them so the only remaining lesson-owned obligation is human
**scoring** (Package F). No math/visualization renderer changed — lesson content,
contracts, the implementation package, the assessment plan, and tests only. **Gate 8 stays
NOT PASSED** for L3/L4/L5 (unscored reasoning/proof surfaces).

### Interaction evidence built (honest levels)

- [x] **L3 produced classification** — `sys-classify-produce-fresh` (exercise-sequence):
  the learner *produces* the none/one/∞ witness (forced solution / a second distinct
  solution / the contradiction value) across three fresh systems rather than picking from
  a 3-way choice → **E3** (the MC `sys-classify-fresh` remains an E1 backup)
- [x] **L3 full two-coordinate column confirmation** — `sys-solve-confirm-fresh` now checks
  **both** coordinates of \(x\mathbf a_1+y\mathbf a_2=\mathbf b\) (was first coordinate
  only) → complete-vector **E3**
- [x] **L3 in-lesson E4 transfer** — `sys-characterize-parameter-fresh` (exercise-sequence):
  characterize the dependency/consistency boundary on a **symbolic parameter** → **E4**
  unfamiliar transfer (not deferred to a module set)
- [x] **L4 produced diagnosis + repair on an unfamiliar system** — `elim-diagnose-repair-fresh`
  rewritten to *produce* the erroneous coefficient (diagnosis) and the corrected
  coefficients (repair) with **no MC identify step** → **E4**; paired self-check
  `elim-diagnose-explain-fresh` captures the written explanation (E6 surface, unscored)
- [x] **L4 in-lesson E4 degenerate-case transfer** — `elim-degenerate-pivot-transfer`
  (**matrix-entry**): a **zero pivot** forces a row swap; the learner **produces the swapped
  augmented matrix** before feedback → **E4** (routine back-substitution is deliberately not
  graded as the transfer)
- [x] **L5 produced inconsistency refusal** — committed-MC `sol-inconsistent-empty`
  **replaced** by `sol-refuse-inconsistent-fresh` (produce the \(0=c\) contradiction + the
  count 0, **E3**) + `sol-justify-inconsistent-refusal` (produced reasoning why ∅, not
  \(\operatorname{Null}(A)\); E6 surface, unscored)
- [x] **L5 complete parametric set, nothing revealed before commitment** —
  `sol-produce-parametric-fresh` rewritten as a 4-step sequence that **predicate-grades a
  learner-chosen** particular solution \(\mathbf x_p\) (any valid vector, both coordinates)
  and a **nonzero** null direction (any valid multiple, both coordinates), plus the
  dimension and a **complete** instantiated point (both coordinates) — no coordinate handed
  over, **no formula shown before commitment** → complete-set **E3**
- [x] **L5 in-lesson E4 distinction** — `sol-construct-second-null-direction`
  (construct-in-explorer): on \(A=\mathbf 0\), build a null vector **off** the
  single-difference line, distinguishing one direction from the whole null space →
  **scored E4**

### Mathematical / progression review

- [x] **L3 sequencing fully corrected** — every learner-facing "determinant is next" claim
  removed from `systems.ts`; the next lesson is stated as **elimination (Lesson 4)** and
  the determinant as **Lesson 7** (the "Why the determinant is next" heading and "the next
  lesson introduces a single number" prose are gone; developer comments updated too)
- [x] **`sys-reason-dependent-count` generalized** — model answer now uses a nonzero
  relation \(\alpha\mathbf a_1+\beta\mathbf a_2=\mathbf 0\) and states the span correctly
  for a **zero first column** (\(L=\operatorname{span}\{\mathbf a_2\}\)) and the **zero
  matrix** (\(L=\{\mathbf 0\}\), not a line) — matching the already-generalized proof item
- [x] All new/changed fresh systems hand- and test-checked against `src/math`
  (`classifyLinearSystem2x2`, `matrixVectorMultiply`, `particularSolution2x2`,
  `solutionSet2x2`)

### Testing review

- [x] `remediationExercises.test.ts` strengthened: asserts the **full** claimed objects —
  both coordinates of the column confirmation, every component of the produced parametric
  set (both \(\mathbf x_p\) coordinates, the null direction, the instantiated point), the
  produced classification witnesses, both E4 sequences, the produced ∅-refusal, and the
  generalized `sys-reason-dependent-count` model text; correct **and** incorrect paths
- [x] A regex guard asserts **no** learner-facing "determinant is next" claim survives in
  L3 prose
- [x] Full `vitest` suite green; `npm run lint` (oxlint) clean; `tsc -b` 0 errors
- [x] `e2e` for the three touched lessons green (`lesson-systems`, `lesson-elimination`,
  `lesson-solution-sets`); browser verification that each new interaction is reachable and
  grades as described

### Ownership / status review

- [x] Contracts (L3/L4/L5), `implementation-package.md`, and `assessment-plan.md` updated:
  Packages **C/D built** (produced classification + refusal, both-coordinate confirmation,
  in-lesson E4 transfers); Package **E surfaces built but unscored → F**; **Package F is
  now the next package** (it resolves only the human-scoring obligation)
- [x] **Gate 8 = NOT PASSED** for L3/L4/L5 kept — a single verdict per lesson; the only
  remaining lesson-owned obligation is scoring the produced reasoning/proof surfaces
- [x] Lesson-owned **E4 outcomes are in-lesson**, not deferred to module Package G; Class A
  vs Class B ownership in the assessment plan preserved

---

## Systems–Elimination module — evidence-integrity hardening (2026-07-23, pre-Package-F pass)

Tightens the produced-evidence claims flagged in review, so no outcome overstates what the
learner independently produces. Lesson content, contracts, implementation package,
assessment plan, and tests only — **no math/visualization renderer changed**. **Gate 8 stays
NOT PASSED** for L3/L4/L5 (unscored reasoning/proof surfaces). Supersedes the specific
interaction descriptions above where they differ.

### Evidence-integrity corrections built

- [x] **L3 classification submits a count with no early reveal** — `sys-classify-produce-fresh`
  is now a 6-step sequence: for each of three fresh systems the learner **produces the
  witness** (a solution / a distinct second solution / the \(0=c\) contradiction value) and
  **then commits the solution count**; the witness steps name no class, so the classification
  is never revealed before the complete response. Honest framing: **produce-then-classify**
  (the production is the E3 evidence; the count is the committed conclusion)
- [x] **L3 characterization assesses the *general* boundary** — `sys-characterize-parameter-fresh`
  now pins the parameter for dependence, produces the general consistency condition
  \(v = 2u\) for an arbitrary \(\mathbf b=(u,v)\) (not the \((2,k)\) slice), and **constructs**
  a target on each side of the boundary (predicate-graded off/on the column line) → **E4**
- [x] **L4 zero-pivot transfer is produced** — `elim-degenerate-pivot-transfer` is a
  **matrix-entry**: the learner produces the repaired augmented matrix before feedback; the
  subsequent routine back-substitution is explicitly **not** counted → **E4**. *(Refined in
  the final pass below: the operation is left unnamed and predicate-graded so the method
  **selection** is the E4 evidence.)*
- [x] **L5 parametric set predicate-grades learner-chosen vectors** —
  `sol-produce-parametric-fresh` captures a **complete** particular vector (any valid
  \(\mathbf x_p\), both coords), a **complete nonzero** null direction (any valid multiple,
  both coords), the dimension, and a **complete** instantiated point — no coordinate handed
  over, no formula shown before commitment → complete-set **E3**
- [x] **L5 difference-of-solutions is produced** — new `sol-difference-produce-fresh`
  (exercise-sequence): the learner produces **both** coordinates of the difference of two
  solutions and verifies **both** homogeneous rows vanish, mapping the difference outcome to
  produced **E3** (the MC `sol-difference-homogeneous` remains an E1 backup)
- [x] **L4 fixed-point outcome mapped to the invariance proof** — `elim-predict-fixed-point`
  is recorded as an E1 learning event whose "say why" is owned by the (unscored E6)
  `elim-explain-invariance` proof surface, not counted as independent evidence

### Capability / infrastructure (lesson-interaction only, not the module runner)

- [x] `exercise-sequence` extended with **`vector`** and predicate-graded **`construct`**
  step kinds, and a new **`solves-system`** `ConstructCheck` (with optional `exclude`) — all
  pure logic in `src/lessons/capabilities.ts`; rendering + per-coordinate submission in
  `src/components/lesson/ExercisePanel.tsx`. This is the lesson-interaction plumbing the
  learner-chosen complete vectors require; it is **not** the Package F module runner or
  scoring surface

### Testing review

- [x] `remediationExercises.test.ts` and `capabilities.test.ts` strengthened so **every
  genuinely entered field is independently mutated**: each coordinate of every `vector` /
  `construct` step, the `solves-system` predicate (valid / non-solution / excluded), the
  count-commit steps, and the general-boundary numeric + construction steps have correct
  **and** incorrect paths
- [x] Full `vitest` suite green; `npm run lint` (oxlint) clean; `tsc -b` 0 errors; targeted
  e2e for the three lessons green; browser verification that each new/changed interaction is
  reachable and grades as described
- [x] Stale **"All 3 steps correct"** browser record corrected to the current four-step,
  predicate-graded `sol-produce-parametric-fresh` interaction

---

## Systems–Elimination module — produced classification + unnamed pivot repair (2026-07-23, pre-Package-F, final pass)

Two final evidence-integrity corrections so the L3 count and the L4 zero-pivot repair are
**produced, not recognized**, and the L4 operation is **not disclosed before commitment**.
Lesson content, capabilities/UI plumbing, contracts, implementation package, and tests only
— **no math/visualization renderer changed**. **Gate 8 stays NOT PASSED** for L3/L4/L5
(unscored reasoning/proof surfaces). Supersedes the interaction descriptions above where they
differ.

### Corrections built

- [x] **L3 classification is TYPED, not multiple-choice** — the three solution-count steps in
  `sys-classify-produce-fresh` are now free-text **`text`** sequence steps. No classifications
  are displayed as choices before commitment; the learner **types** the count and it is
  graded against normalized spellings (`none`/`0`, `one`/`1`, `infinite`/`infinity`, plus
  case/whitespace/trailing-punctuation tolerance). The produced witness **and** the typed
  count are both required per system
- [x] **L4 zero-pivot operation is unnamed until commitment** — `elim-degenerate-pivot-transfer`
  removes "row swap" and \(R_1\leftrightarrow R_2\) from the prompt; it asks the learner to
  **choose and apply one legal elementary operation** that puts a nonzero entry in the
  \(a_{11}\) pivot and enter the resulting matrix. Grading is the new **`row-equivalent-usable-pivot`**
  `matrix-entry` predicate (via the shared **`singleRowOperationBetween`**): a matrix passes
  iff it is reachable by **exactly one** legal operation giving a nonzero \(a_{11}\) — the swap
  or \(R_1\to R_1+k\,R_2\) — so no single answer is leaked and the method **selection** is
  the E4 evidence. The row-swap explanation is revealed only in post-commit feedback.
  *(Tightened below: "same solution set" is no longer treated as "one operation".)*

### Capability / infrastructure (lesson-interaction only)

- [x] `exercise-sequence` gained a **`text`** step kind (normalized-accept grading via the
  exported `normalizeAnswerText`); `matrix-entry` gained an optional **`check`** predicate
  (`row-equivalent-usable-pivot`) that grades an open-ended matrix by shared `src/math`
  rather than a fixed `expected`. Pure logic in `capabilities.ts`;
  a text input rendered in `ExercisePanel.tsx`. Not the Package F module runner

### Testing review

- [x] New tests prove **classification is no longer multiple-choice** (step kinds are
  `text`, none `multiple-choice`), **accepted spellings normalize** (`1`/`one`, `0`/`none`,
  `∞`/`infinity`, case + punctuation), **a wrong typed classification fails even with a
  correct witness**, and the **L4 prompt does not disclose the swap** before commitment
  (no "swap"/`\leftrightarrow`); the L4 predicate accepts a swap *and* \(R_1\to R_1+R_2\) but
  rejects the unchanged original and any solution-changing matrix
- [x] `tsc -b` 0 errors; `npm run lint` (oxlint) clean; targeted `vitest` green; e2e +
  browser verification of the new interactions

---

## Systems–Elimination module — L4 pivot predicate = exactly one operation (2026-07-23, pre-Package-F)

Final correction so `row-equivalent-usable-pivot` is not satisfied by *any* equivalent
matrix but only by a genuine **single-operation** image of the original. Capability + shared
math + tests + contracts only — **no math/visualization renderer changed**. **Gate 8 stays
NOT PASSED** (human-scored reasoning/proofs).

- [x] **New shared helper `singleRowOperationBetween(from, to, tol)`** in `src/math/elimination.ts`
  (exported via `src/math/index.ts`): returns the single elementary `RowOperation` mapping
  `from → to`, or `null` when `to` needs more than one operation. It **infers** each candidate
  factor from the most stable component and **verifies** by actually applying the op with the
  existing `applyRowOperation` + `isSolutionPreserving` — reusing the row-operation
  arithmetic, never re-deriving it. It explicitly does **not** equate "same solution set" with
  "one operation"
- [x] **`row-equivalent-usable-pivot` now uses it:** a matrix passes iff it is **exactly one**
  legal operation from the original **and** has a nonzero pivot. For the current zero-pivot
  system it accepts the **swap** and \(R_1\to R_1+k\,R_2\) for any nonzero \(k\); it rejects
  the **unchanged** matrix, **solution-changing** matrices, the **full RREF / any multi-step**
  result, and an **unrelated** system that merely shares the same unique solution
- [x] **Regression tests added:** `elimination.test.ts` (round-trips each reversible op, accepts
  swap + \(R_1\to R_1+k\,R_2\), rejects RREF / unrelated / solution-changing, and proves a
  two-op image with the same solution set returns `null`); `capabilities.test.ts` and
  `remediationExercises.test.ts` extended with the RREF and unrelated-same-solution rejections
- [x] `tsc -b` 0 errors; `npm run lint` clean; **full `vitest` 529 passing**

**Outcome:** with this correction passing, Packages **B–E are approved**; **Package F**
(human-scoring capture) is the next authorized planning target. Gate 8 stays **NOT PASSED**
pending human scoring of the reasoning/proof surfaces.

---

## Systems–Elimination module — Package F shipped (module assessment infrastructure) (2026-07-23)

Implements Package **F1–F4** of the
[implementation package](../courses/linear-algebra/modules/systems-elimination/implementation-package.md#package-f--shipped)
(authorized Mode C pass): the first real persistence, a cumulative/interleaved module
runner with deferred feedback + snapshotting, a human-scoring review queue, and an
idempotent scheduler seam. **No math/visualization renderer or existing lesson changed** —
new platform + assessment modules, one provider mounted in `AppShell`, and dev-gated
routes only. **Gate 8 stays NOT PASSED** (F never emits a Gate 8 verdict; real learner
responses remain unscored by an author).

### Architecture / correctness review

- [x] **Persistence is hydration-safe** — `loadLearnerState` classifies into
  `empty` / `loaded` / `incompatible{newer-schema|unmigratable}` / `corrupt`; the provider
  arms saves **only after** load resolves and goes **read-only** for incompatible/corrupt
  blobs, **never overwriting** them with empty state (`persistence.test.ts`,
  `useLearnerState.test.tsx`)
- [x] **Schema migration** `1 → 2` adds `attemptSets` + `reviews`; each step stamps exactly
  its version via `buildLearnerState`; normalizers drop malformed entries and enforce
  key === id (`learnerState.test.ts`)
- [x] **Released attempts are reproducible** — `AttemptItemSnapshot` freezes the serialized
  definition + capability id + answer-schema version + rubric; `gradeSnapshot` grades
  against the **snapshot**, not the live registry, and is stable if the source exercise
  later changes (`attemptSnapshot.test.ts`)
- [x] **Auto vs human results stay separate** — `AutoResult` (tagged
  `graded`/`error`/`omitted`) on the response vs `ReviewRecord` (pending/scored) keyed by
  rubric id + version; never merged
- [x] **Deferred feedback: no correctness leak in capture** — the runner's capture
  renderer paints no `data-state` and shows no reveal before submit
  (`ModuleRunner.test.tsx`, `e2e/assessment-runner.spec.ts`)
- [x] **Critical transitions persist synchronously** (submit, release, reviewer scoring,
  scheduler claim); ordinary drafts debounced — a completed transition survives an
  immediate reload (`useLearnerState.test.tsx`)
- [x] **Scheduler dispatch is at-most-once** — `claimSchedulerEmission` sets + persists
  `schedulerEmittedAt` (idempotency key = `attemptSetId`) **before** invoking the hook; a
  throwing hook is isolated and never auto-retried; rerender/reload/repeat do not
  re-invoke (`ModuleRunner.test.tsx`, `useLearnerState.test.tsx`)
- [x] **Runner route identifies the concrete set** (`dev/module/:setId`), so G–I can
  register multiple sets per module without a routing change
- [x] **Conservative blocker, no auto Gate 8** — `reviewStatus` returns only
  `REVIEW_PENDING` / `REVIEW_COMPLETE` / `REVIEW_FAILED` (`reviewStatus.test.ts`)
- [x] **Both surfaces dev-gated on the same origin** — runner + reviewer share one
  `localStorage` learner state (routes are `import.meta.env.DEV`-gated)

### Hardening pass (2026-07-23, post-ship, before Package G)

- [x] **Blank required responses can never be passed** — a blank written proof is recorded
  as an `omitted` `ReviewRecord` (auto `passed:false`); it never enters the human queue and
  `reviewStatus` can never reach `REVIEW_COMPLETE` from it (`reviewStatus.test.ts`,
  `ReviewQueue.test.tsx`, `e2e/assessment-runner.spec.ts`)
- [x] **Human scoring matches the contract** — a **finite** reviewer score is required before
  Save; malformed/blank scores are rejected; pass/fail + score + feedback + reviewer +
  `scoredAt` persisted (`ReviewQueue.test.tsx`)
- [x] **Shared phase-correct renderer** (`captureRenderers.tsx`) covers the atomic Package G
  kinds (`multiple-choice`, `numeric`, `vector`, `matrix-entry`, `construct-in-explorer`,
  `self-check`) with no capture leak; review renders stored answer + `AutoResult` +
  persisted `solutionReveal` (`captureRenderers.test.tsx`)
- [x] **Practice mode removed** (honest narrowing) — the module surface is exam-only; no
  half-built immediate-feedback mode ships
- [x] **Executable recovery** — `dev/recovery` exposes Export / Import / Reset with
  corrupt vs newer-schema vs save-failed messaging; a failed synchronous save flips a sticky
  `saveHealthy=false` durable warning (`useLearnerState.test.tsx`, `persistence.test.ts`,
  `e2e/assessment-runner.spec.ts`)

### Final persistence-integrity correction (2026-07-23, before Package G)

- [x] **`REVIEW_COMPLETE` requires a fully-formed passing record** — `isValidScoredPass`
  enforces `state==="scored"`, boolean `passed===true`, finite `score`, and a `Date.parse`-able
  `scoredAt`; omitted/incomplete/malformed/imported records → `REVIEW_FAILED`, never complete;
  `REVIEW_PENDING`/`REVIEW_FAILED` distinctions preserved (`reviewStatus.test.ts`)
- [x] **Export reflects the live state after a save failure** — in `ready` phase Export
  serializes the in-memory state (with the unsaved critical transition); untouched raw bytes
  are exported only in read-only (corrupt/incompatible) recovery; regression proves a failed
  save exports the newer transition, not the stale stored bytes (`useLearnerState.test.tsx`)
- [x] **Durable save-failure warning in the reviewer queue** too (not only the runner /
  recovery surface) — a failed reviewer save never appears safely persisted (`ReviewQueue.tsx`)

### Package G — Class-A module item sets (2026-07-23, on the completed Package F runner; evidence-integrity corrected 2026-07-24)

- [x] **General (m×n) math is the source of truth** — `src/math/linearSystemsGeneral.ts`
  (`rref`, `solveLinearSystem`, `solves`, `inNullSpace`, `vectorSetRank`,
  `areLinearlyIndependent`, plus `augmentedMatrix`, `areRowEquivalent`, `isRowEchelonForm`,
  `hasContradictionRow`); every fresh system + predicate re-verified independently
  (`linearSystemsGeneral.test.ts`). Concrete finite systems only — no general ℝⁿ rank–nullity.
- [x] **`solution-set` capability predicate-grades any valid parameterization** (particular
  solves; each null direction nonzero + in Null(A); independent; correct free count; ∅ for
  inconsistent), never revealing the expected shape (`solutionSetCapability.test.ts` — correct,
  incorrect, field-mutation, independence, ∅)
- [x] **`elimination-solution` capability** captures produced elimination evidence for the
  three concrete applied/cumulative items — a row-equivalent echelon matrix (ANY valid
  reduction via `areRowEquivalent`), pivot/free identification (RREF-invariant), free count,
  particular + null directions (consistent), or a produced **contradiction row + typed
  classification** (inconsistent; a bare toggle cannot pass) (`eliminationCapability.test.ts`)
- [x] **Blank ≠ 0 in numeric capture** — `solution-set` and `elimination-solution` serialize
  blanks as `null` and grade incomplete; every expected zero must be typed; clearing a field
  clears the stored answer (blank/cleared-field regressions in `solutionSetCapability.test.ts`,
  `eliminationCapability.test.ts`, `captureRenderers.test.tsx`)
- [x] **Phase-correct capture** — learner-chosen number of null directions (free count never
  hinted), ∅/consistency toggle, no pre-submit leak; review replays stored answer + snapshot
  feedback (`captureRenderers.test.tsx`, `ModuleRunner.test.tsx`)
- [x] **Eight items authored + registered** with human/auto split honored, versioned rubric
  snapshots for written items, no raw array notation in prompts, and **no method cueing in
  `mod-select-method`** (methods live only in the post-commit rubric); two deterministic,
  versioned, duplicate-id-guarded sets (`moduleItems.test.ts`, `moduleSets.test.ts`)
- [x] **MC never used as the decisive object**; written reasoning/proofs route to Package F
  human scoring; E4 items use fresh unfamiliar systems; E5 spans L4+L5; inconsistent
  contradiction-row ∅ case included in the applied/cumulative set

### Testing review

- [x] Unit + integration: `learnerState`, `persistence`, `useLearnerState`,
  `attemptSnapshot`, `moduleSets`, `reviewStatus`, `scheduler`, `captureRenderers`,
  `ModuleRunner`, `ReviewQueue`, `linearSystemsGeneral`, `solutionSetCapability`,
  `eliminationCapability`, `moduleItems` — full `vitest` suite **661 passing / 66 files**
- [x] **Mandatory** e2e `e2e/assessment-runner.spec.ts` (2 tests) + `e2e/assessment-package-g.spec.ts`
  (2 tests): (1) submit → `REVIEW_PENDING` → score every pending proof (finite score) →
  `REVIEW_COMPLETE`, **persisted across reload**; (2) blank proofs stay `REVIEW_FAILED` +
  export/reset/import recovery loop; (3) Package G applied set — produced **elimination
  evidence** (echelon matrix + pivots + parametric set) + a produced contradiction-row ∅
  verdict graded from snapshot, replay on reload; (4) Package G transfer set — written items
  enter human-review queue; zero console errors.
- [x] `tsc -b` 0 errors; `npm run lint` (oxlint) clean apart from non-blocking
  `react-refresh` warnings on the provider+hook and shared `captureRenderers` modules

### Status review

- [x] `implementation-package.md` (Package F **SHIPPED**, Package G **BUILT** + evidence-
  integrity corrected), `assessment-plan.md` (Gate 9 still PLANNED; Class-A content built but
  **not administered**), and `engineering/platform-contracts.md` (persistence §5;
  `solution-set` + `elimination-solution` capabilities; blank-≠-0 capture) reconciled
- [x] **Gate 8 = NOT PASSED** for L3/L4/L5 and **Gate 9 = NOT PASSED** preserved — G exercises
  the *machinery* with synthetic answers, not real learner evidence; **Package H is the next
  Mode C target** (requires explicit approval); H, I remain PLANNED

## Systems–Elimination module — Package H spaced retrieval (D12) (2026-07-24, on the Package F/G runner)

### Domain model & integrity (schema v2 → v3)

- [x] **Occurrence-keyed model** — each scheduled retrieval is a `ScheduledSpacedReview`
  keyed by a STABLE deterministic id (`spaced:moduleId:exerciseId:delayDays`), so the same
  item is answered once at ~7d and again at ~30d via distinct occurrences/attempts (fixes the
  ambiguous "oldest review for this exercise"). `AttemptSet.scheduledReviewId` links a
  one-item attempt to its exact occurrence.
- [x] **Module-scoped terminal state** — a `SpacedCohort` record (keyed by moduleId, status
  `seeded`/`failed`) is the authoritative gate: once the first eligible primary release seeds
  or fails, later releases never invoke the scheduler. Failure is persisted as a **visible,
  module-wide, terminal** `failed` cohort (never auto-retried).
- [x] **Atomic primary release + cohort** (`releasePrimaryAttempt`) — the attempt release,
  the cohort record, and all six occurrences land in ONE provider transition; invariant:
  never a released first-eligible primary without a seeded-or-failed cohort. Revalidates the
  attempt's module + primary eligibility + submitted status; validates the computed six
  occurrences through the SAME integrity pass the normalizer uses.
- [x] **Exact-occurrence completion** (`releaseSpacedAttempt`) — derives the occurrence from
  the persisted attempt's `scheduledReviewId` (not a parameter); completes only when mapped,
  scheduled, due (`releasedAt ≥ dueAt`), and not already completed — otherwise a no-op that
  surfaces a mismatch.
- [x] **Single canonical release timestamp** — created once in the runner and used for the
  attempt's `releasedAt`, the cohort anchor, the scheduler summary, and every occurrence's
  `dueAt`; alignment survives reload + normalization (regression in `useLearnerState.test`).
- [x] **Hardened + cross-record normalization** — per-entry checks (parseable `dueAt`,
  allowlisted set/exercise/delay, mapping, `id === deriveStableKey`, status/completion
  consistency) plus a total cross-record pass (origin references an eligible released primary;
  `dueAt = anchor + delay` at exact ms; completed occurrences fully back-referenced &
  released-no-earlier-than-due; a `seeded` cohort must hold exactly its six occurrences or it
  is demoted to `failed`). Timestamps compared via parsed ms, never lexical order.

### Content, scheduler & surfaces

- [x] **Three fresh multiple-choice retention items** (`mod-spaced-trichotomy` /
  `-uniqueness` / `-rowops`), E1–E2 by design (retention signals on already-evidenced
  outcomes, not new transfer evidence); fresh systems re-verified vs `solveLinearSystem` and
  distinct from every lesson/Package-G fixture.
- [x] **Narrowed `SchedulerHook`** — the bypassed `dueReviews()` no-op was **removed** (a
  deliberate F-seam contract change); `dueSpacedReviews(state, now)` is the canonical
  pure due-query. `computeSpacedSchedule` is pure, gated to eligible primary releases.
- [x] **Dev-gated surfaces** — `dev/spaced` due list + `dev/spaced/:scheduledReviewId`
  occurrence route (the only path that can complete an occurrence). The occurrence route
  rejects not-yet-due / unknown occurrences; the generic `dev/module/:setId` route rejects
  spaced set ids so a learner cannot preview a spaced item early; spaced sets are omitted from
  the dev assessment index.

### Testing review

- [x] `tsc -b` 0 errors; `npm run lint` (oxlint) clean apart from the pre-existing non-blocking
  `react-refresh` warnings on `useLearnerState` + `captureRenderers`
- [x] `npx vitest run` — **704 tests / 70 files** pass, incl. new `spacedReviews` (normalizer
  + cross-record integrity + reconcile), `spacedSchedule`, `dueReviews`, `devSpacedPages`
  (not-due / not-found / spaced-rejected guards), and `useLearnerState` (atomic seed,
  module-wide gate, failed cohort, exact-occurrence completion, canonical-timestamp alignment)
- [x] `npx playwright test` assessment suites — F runner (×2), Package G (×2), and the
  **mandatory Package H** (×2: due occurrence answered from the list → completes & persists
  across reload; not-yet-due URL blocked + generic route rejects spaced sets) all green, zero
  console errors

### Status review

- [x] `implementation-package.md` (Package H **PARTIALLY SHIPPED**; Mode C boundary now before
  Package I), `assessment-plan.md` (Class B **runnable, not administered**; D12 row built +
  verified) reconciled
- [x] **Gate 8 = NOT PASSED** for L3/L4/L5 and **Gate 9 = NOT PASSED** preserved — H exercises
  the *machinery* with synthetic answers, not real learner evidence; the **L7/L8/L9
  prerequisite-check wiring stays a tracked, deferred D12 obligation** (D12 partially
  discharged), and **Package I remains PLANNED**

---

## Systems–Elimination module — Package I timed mock (D11 · S3) (2026-07-24, on the Package F runner)

Implements slices **I1–I3** of the
[implementation-ready plan](../courses/linear-algebra/modules/systems-elimination/package-i-plan.md)
(authorized Mode C pass, branch `package-i`, authored contract-table-first per ADR-002): a
short **timed mock** (`systems-elimination-mock` — historically tracked as `mod-timed-mock`)
on three fresh items, with a deadline-derived countdown, honest auto-submit, and deferred
feedback. **No new grading capability** — computation/classification reuse
`elimination-solution`, the proof reuses `self-check`, exactly as Package G proved out. **No
math/visualization renderer changed.** **Gate 8 stays NOT PASSED** for L3/L4/L5 (unrelated);
**Gate 9 stays NOT PASSED** — I ships machinery, not real learner evidence.

### Domain model (schema stays additive, no version bump)

- [x] **`ModuleSet.timeLimitSec?: number`** (`src/lessons/moduleSets.ts`) — when present the
  set is time-boxed; absent ⇒ untimed (F/G/H behavior unchanged). `systems-elimination-mock`
  sets it to `1200` (20 min) for its three items.
- [x] **`AttemptSet.autoSubmittedAt?: string`** (`src/platform/learnerState.ts`, +
  `normalizeAttemptSet` copy) — present iff the deadline, not the learner, triggered submit;
  purely additive optional field, no migration.
- [x] **The deadline is derived, never stored** — `src/lessons/timeBox.ts` (new, pure):
  `deadlineFor`/`remainingSec`/`isExpired` compute off the attempt's existing `startedAt` +
  the set's `timeLimitSec` + "now", so a reload past the deadline reads as expired without a
  separately-tamperable absolute time.

### Content + grading contracts (zero new capability code)

- [x] **Three fresh items** (`src/lessons/moduleItems.ts`), each on a system re-verified
  independently against `src/math/linearSystemsGeneral.ts` and numerically distinct from
  every lesson / Package-G / Package-H fixture: `mod-mock-compute` (fresh consistent 3×3, one
  free variable, `elimination-solution`, target **E4**), `mod-mock-classify` (fresh
  inconsistent 3×2 rectangular, `elimination-solution`, target **E4**), `mod-mock-proof`
  (fresh existence-of-infinitely-many-solutions proof, `self-check`/human-scored, target
  **E5**).
- [x] **Evidence-manifest entries** for all three in `ITEM_ASSESSMENT_META`
  (`src/lessons/assessmentManifest.ts`) — evidence target + full `evidenceBasis`
  (freshness/unfamiliarity/integration/scaffolding/scoring authority); the two auto items are
  `scoringAuthority: "auto"`, the proof `"human-scored"`.
- [x] **Grading-contract specs for the two auto items** (`gradingContract.test.ts`) reusing
  the same `elimination-solution` contract pattern already proven on Package G: mustAccept
  (canonical echelon + pivots + free count + particular + null direction for the compute item;
  contradiction row + typed verdict for the classify item) plus an adversarial mustReject
  battery (all-blank, blank-≠-0, zero-fill, pivot off-by-one, non-echelon, wrong null
  direction, superset extra direction / superset text, flipped consistency, bare toggle,
  wrong verdict) — matching the contract table in the plan's §2.
- [x] **Fresh-instance distinctness is tested, not asserted** — `moduleItems.test.ts` verifies
  `SYS_MOCK_COMPUTE`/`SYS_MOCK_CLASSIFY` solve/classify as intended via `solveLinearSystem`
  and are byte-distinct from every prior fixture; also asserts `systems-elimination-mock`
  registers the three items in the documented order.

### Runner: countdown, auto-submit, honest recording

- [x] **Live countdown** — `ModuleRunner` renders `Time remaining: mm:ss` (`role="timer"`,
  `data-testid="mock-countdown"`) whenever the resolved set has `timeLimitSec` and the attempt
  is not yet released; untimed sets render nothing new.
- [x] **Auto-submit exactly once at the deadline** — a 1 Hz clock drives `isExpired`; on
  expiry the runner calls the existing `submit` path (via a ref, since `submit` is defined
  after the early-return branches) with an `autoSubmitted` flag, tagging the released attempt
  `autoSubmittedAt` — no per-item correctness was revealed before that submit.
- [x] **Reload past the deadline auto-submits immediately** — because the deadline is derived
  from the persisted `startedAt`, a fresh mount whose `isExpired` check is already true fires
  the same auto-submit effect on the next tick; the existing release-idempotency guard
  (`set.status === "released"` early-return in `releasePrimaryAttempt`) prevents a double
  release.
- [x] **`autoSubmittedAt` is stamped atomically with release** — `releasePrimaryAttempt`
  (`src/platform/useLearnerState.tsx`) gained an optional trailing parameter set only when the
  submit was deadline-triggered; a manual pre-deadline submit passes nothing, leaving the field
  unset (honest signal, matches the plan's mandatory regression #3).
- [x] **Honest review notice, no grade change** — `ReviewView` shows "Submitted automatically
  at the time limit." (`data-testid="mock-auto-submitted"`) when `autoSubmittedAt` is set;
  purely informational.
- [x] **Blank required items stay recorded omissions under time-out** — the runner's existing
  omission path (unchanged) still governs the proof capture, so `reviewStatus` cannot reach
  `REVIEW_COMPLETE` off a timed-out blank; no new bypass was introduced for the timed path.
- [x] **Untimed sets (F/G/H) are unaffected** — the new countdown/auto-submit branches are
  gated on `resolved.set.timeLimitSec !== undefined`; the pre-existing untimed `ModuleRunner`
  tests pass unchanged (see Testing review).

### Testing review

- [x] `timeBox.test.ts` (new): deadline = `startedAt + timeLimitSec`, an unparseable
  `startedAt` returns `null`, remaining counts down and clamps at 0, `isExpired` flips exactly
  at the boundary, a reload well past the deadline reads as expired, and `mm:ss` formatting.
- [x] `moduleItems.test.ts` (extended): the three mock items exist with the documented
  capability/tier, `systems-elimination-mock` registers them in order, both fresh systems
  independently solve/classify as claimed via `solveLinearSystem`, and both are distinct from
  every prior fixture and from each other.
- [x] `gradingContract.test.ts` (extended): `mod-mock-compute` and `mod-mock-classify` each
  pass their mustAccept case and reject the full adversarial mustReject battery listed above;
  the coverage meta-test sees a contract for both (the proof is human-scored and exempt).
- [x] Full `vitest` suite green — **795 tests / 74 files** (up from Package H's 704/70,
  +91 for the domain-model, content, and contract additions above); `npx tsc -b` 0 errors;
  `npm run lint` (oxlint) clean apart from the pre-existing non-blocking `react-refresh`
  warnings on `useLearnerState`/`captureRenderers`.
- [x] Existing untimed `ModuleRunner.test.tsx` suite (10 tests, F/G/H flows) passes unchanged
  against the modified runner — confirms the timed-path additions are additive, not a
  regression.
- [x] **Runner-level timed path:** a dedicated `ModuleRunner` regression block (5 tests) — no
  countdown for untimed sets, countdown renders for the timed set, auto-submit-at-expiry
  (fake timers) grading + `autoSubmittedAt`, manual submit leaves no marker, and
  blank-proof-under-timeout stays an omission (verified `REVIEW_FAILED`, never
  `REVIEW_COMPLETE`).
- [x] **Mandatory** `e2e/assessment-mock.spec.ts` — `/dev/module/systems-elimination-mock`:
  countdown ticks, no pre-submit reveal, manual submit reaches `review-status`, persistence
  survives reload, zero console errors.

### Status review

- [x] `implementation-package.md` (Package I **BUILT, machinery-verified, not administered**;
  D11 discharged by the build; S3 readiness claim still requires real administration),
  `assessment-plan.md` (D11 row → built as `systems-elimination-mock`; Class A now `0/6` core
  items built, still zero with real evidence) reconciled
- [x] **Gate 8 = NOT PASSED** for L3/L4/L5 (unaffected by this package) and **Gate 9 = NOT
  PASSED** preserved — I exercises the *machinery* (deadline math + grading contracts) with
  synthetic/adversarial inputs, not real learner evidence under actual time pressure
- [x] Runner-level timed-path regression tests and the mandatory
  `e2e/assessment-mock.spec.ts` authored and passing — Package I is now verified end-to-end
  in the same sense as Package G/H (machinery only; still not administered)

#### Timer-integrity correction pass (2026-07-24)

Four review findings on the Package I time-box, closed as a bounded correction (no new
capability, no schema-version bump — `AttemptSet.timeLimitSec` is one more additive
optional field). Each finding has a focused regression; the claims above that this
supersedes are corrected here rather than edited in place.

- [x] **1 · The administered time limit is SNAPSHOTTED onto the attempt.**
  `AttemptSet.timeLimitSec` (`src/platform/learnerState.ts`, `makeAttemptSet` +
  `normalizeAttemptSet`) is written when the attempt is created, exactly like `setVersion`
  records the administered form. `ModuleRunner` resolves the governing limit through
  `governingTimeLimitSec(attempt.timeLimitSec, set.timeLimitSec)` (`src/lessons/timeBox.ts`),
  so **editing `ModuleSet.timeLimitSec` can no longer move a running attempt's deadline**.
  The registry is a **narrow, documented compatibility fallback** with exactly one legitimate
  reader — an attempt persisted before this field existed, which recorded no limit at all and
  would otherwise read as untimed. Every attempt created from now on carries its own snapshot.
- [x] **2 · The deadline, not the control, decides automatic vs manual.** `submit()` compares
  `new Date()` against the derived deadline at submission time: a click landing **at or after**
  the deadline is recorded with automatic-submission semantics and persists `autoSubmittedAt`
  (`= releasedAt`, the single canonical release timestamp). This closes the race where a stale
  or throttled 1 Hz tick left the manual button live past the deadline. Manual submission is
  additionally **disabled once expiration is observed** (`expirationObserved` → `disabled`,
  "Time's up — submitting…"), so the control is closed *and* fails safe if clicked.
- [x] **3 · A malformed timed attempt can never become indefinitely untimed.** Two layers:
  `normalizeAttemptSet` now **rejects** a stored attempt whose `startedAt` is unparseable
  (no parseable anchor ⇒ no derivable deadline) and **fails closed** on a `timeLimitSec` that
  is present but not a positive finite number (the record is dropped, never normalized into an
  untimed attempt); and `timeBox` itself fails closed — an unparseable `startedAt` reads as
  `isExpired: true` / `remainingSec: 0`, **superseding** the earlier "returns `null` / treated
  as NOT expired" behavior recorded in the Testing review above.
- [x] **4 · Mandatory browser regression through the recovery/import path.**
  `e2e/assessment-mock.spec.ts` (second spec): start a real attempt (proof left blank),
  **export** it from `/dev/recovery`, move `startedAt` to 4 s before the deadline, **import**
  it back as live state, then verify on the real product path — countdown in its last seconds,
  **no** correctness/reveal before submit, expiration observed, **exactly one** automatic
  submission (single attempt, `status: released`, `autoSubmittedAt === releasedAt`), the
  manual control gone, the "submitted automatically" notice, `REVIEW_FAILED` from the blank
  required proof (omission — never `REVIEW_COMPLETE`), durability across a reload, and zero
  console errors. The exported bytes also confirm the snapshotted `timeLimitSec` survives
  export/import.
- [x] **Persist-gating hazard found by finding 3's reload regression.** React commits child
  effects before parent effects, so a write issued in the very commit where hydration flips
  `phase` to `"ready"` (the runner creating an attempt, or auto-submitting an already-expired
  attempt on reload) read a stale `phaseRef` and was silently dropped by `persist` — the
  transition lived in memory only. `LearnerStateProvider` now mirrors phase into `phaseRef`
  **synchronously** (`applyPhase`) instead of in an effect.
- [x] Regressions: `timeBox.test.ts` (fail-closed on an unparseable `startedAt`; snapshot beats
  registry; fallback only when the attempt recorded no limit), `learnerState.test.ts`
  (snapshot written by `makeAttemptSet`; round-trip; rejection of unparseable `startedAt`;
  fail-closed on a malformed limit; absent-is-untimed still admitted), `ModuleRunner.test.tsx`
  (+6: new attempt snapshots 1200; a seeded 120 s attempt is governed by 120 s while the
  registry says 1200; click at the deadline ⇒ automatic + persisted marker; click at
  deadline−1 s ⇒ manual, no marker; once observed, no manual control and exactly one release;
  already-expired reload auto-submits once and the release is **persisted**).
- [x] Verified at package-commit tier (new persisted field + runner + persistence):
  `./check.sh --e2e` — oxlint + `tsc -b` clean, **807 unit tests / 74 files** (up from 795),
  **54 Playwright specs** green including both `assessment-mock` specs.
- [x] Gate posture **unchanged**: Package I remains BUILT, machinery-verified, **not
  administered**; **Gate 9 stays NOT PASSED**; S3 still requires real administration.

---

## Visual identity — the two-theme live notebook (2026-07-24, product-wide vertical slice)

The identity is the **live interactive notebook** (`vision.md` §1). It now ships as **two
presentations of that one identity**, not two products:

- **Notebook** (default) — warm-ivory reading surface, deep-navy ink, restrained warm
  dividers and raised surfaces, and **dark mathematical canvases**. The strong page↔canvas
  contrast is a deliberate choice: a figure is an instrument set into paper.
- **Observatory** (optional) — an ink reading surface *continuous* with the canvas, so the
  page becomes the same sky the mathematics is drawn on.

> **Correction to the entry this supersedes.** An earlier pass shipped the Observatory
> inversion as *the* permanent identity, made the whole product dark by default, and locked
> that choice into tests ("the page must be dark", "page and canvas must be near-identical
> in luminance", "Observatory is the product identity"). Those were **subjective
> product-direction choices asserted as universal contracts**. The warm notebook is restored
> as the default; Observatory is retained as a selectable theme; and the tests now assert
> what is genuinely contractual (completeness, contrast, role meanings, switching,
> persistence, no overflow) instead of one presentation's taste.

**This pass changed no lesson content, no math, and no visualization geometry** — only how
surfaces are lit. Role→meaning bindings are untouched, and are now *proved* identical across
both themes.

### The theme layer

- [x] **Token layer** (`src/styles/tokens.css`) — one shared `:root` block (semantic math
  roles, typography scale, spacing, layout, motion, `--color-on-role`) plus one colour /
  surface block per presentation. Component CSS reads the same semantic names in both and
  **never branches on the theme**. The bare `:root` selector carries the Notebook values, so
  the product still renders as the notebook with no `data-theme` attribute at all.
- [x] **Selection** (`src/platform/theme.ts`, `src/hooks/useTheme.ts`,
  `src/components/layout/ThemeToggle.tsx`) — a two-button group in the app header, each
  option named and carrying `aria-pressed`; the choice persists to one `localStorage` key.
- [x] **No flash on reload** — a small inline script in `index.html` stamps `data-theme`
  before the first paint. It deliberately does **not** read `prefers-color-scheme`: a
  dark operating system is not a request for the Observatory identity.
- [x] **Reduced motion preserved** — the `prefers-reduced-motion` duration overrides live on
  the shared `:root`, so they apply under either presentation.
- [x] **Theme-dependent chrome tokenized** — the chapter-node colour (`--color-node`), node
  halos (`--glow-node`, `--glow-node-soft`), and the ink that sits on a luminous role fill
  (`--color-on-role`) replaced hardcoded role-blue and raw `rgb()` glows, which had assumed
  an ink page.

### Identity hygiene kept from the Observatory pass

- [x] **`--color-surface-muted` is defined** — five components read
  `var(--color-surface-muted, #f8f6f1)`, so a fallback colour was what actually shipped. The
  same check covers `--guided-scene-standalone-max` and `--color-canvas-text-muted`.
- [x] **The dev assessment runner's undefined namespace** (`--role-surface`, `--role-border`,
  `--role-accent`, `--role-danger`, …) still reads real semantic tokens.
- [x] **Dead fallbacks stay stripped** across 18 stylesheets (`var(--token, #hex)` →
  `var(--token)`), so the token file is genuinely authoritative.
- [x] **Text on a luminous fill** uses `--color-on-accent` (action / status fills) or
  `--color-on-role` (role fills) rather than a hardcoded `#fff`, so the polarity is correct
  in whichever presentation is active.
- [x] **The hero wordmark's gradient** now derives from `--color-text` → `--color-node` and
  is gated on `background-clip: text` support, so it can no longer ship invisible type — one
  fewer documented raw-hex exception.

### Testing review

- [x] `src/styles/__tests__/designSystem.test.ts` (25 tests) — parses the token file into its
  three blocks and asserts: every theme defines every theme-owned token; **the two themes
  define exactly the same token set** (so a switch can never leave a property unresolved);
  every custom property read by a component is defined; no raw hex outside `tokens.css` (two
  documented exceptions — the 3-D canvas text halo, and the theme control, which previews
  *both* presentations at once); the `--role-*` set is declared once in the shared block,
  never redefined by a theme, and resolves to the same values under both; and the **same
  WCAG floors in both themes** (body ink ≥ AAA on all six reading surfaces, muted/faint ≥ AA,
  link/action/node type ≥ AA, status colours ≥ AA, focus ring ≥ 3:1, on-accent and on-role
  ink ≥ AA over their fills, canvas labels ≥ AAA).
- [x] The two page↔canvas relationships are asserted **as each theme's own intent**, not as
  law: Notebook's canvas is ≥ 8:1 against its paper page; Observatory's is < 1.35:1.
- [x] `e2e/visual-identity.spec.ts` (6 specs) — measured from computed styles in a browser:
  Notebook is the default **even with `prefers-color-scheme: dark` emulated**; both
  presentations clear the contrast floors on the real page; each page↔canvas relationship
  holds on `/lesson/systems`; the `--role-*` values are byte-identical across a switch; the
  control is `role="group"`-labelled, Tab-reachable with a visible focus ring, operable by
  Enter, persisted, and re-applied after `reload()`; and **no horizontal overflow** on `/`
  and `/lesson/vectors` at 1440 px and 390 px in *both* themes.
- [x] Screenshots saved to `screenshots/`: `identity-home-notebook.png`,
  `identity-home-observatory.png`, `identity-lesson-notebook.png`,
  `identity-lesson-observatory.png`, `identity-home-notebook-390.png`.

---

## Platform identity, course context, and page grammar (2026-07-24)

Two product-direction corrections, applied together because they are the same
mistake seen twice: **one course presented as the whole product**, and **internal
machinery presented as learner-facing prose.**

**No lesson content, math, animation, grading, persistence, or assessment
behaviour changed in this pass.** Every edit is to the shared shell, the
curriculum tree, and per-lesson *labels* — never to a lesson's mathematics.

### Part A — the platform is not "Linear Algebra"

Implements only the **minimal near-term schema** of
`docs/courses/multi-domain-architecture.md` §2 (Steps 1–3). Explicitly NOT built:
prerequisite/graph edges, learning paths, learner accounts, a backend, or
namespaced routing (§6 stays deferred).

- [x] `src/lessons/courseModel.ts` is now **authoritative** — `subject → course →
  unit → lesson refs`, holding ids only. `curriculum.ts` and its flat
  `COURSE_SECTIONS` are deleted; `registry.ts` is a pure **content** registry.
- [x] Curriculum data covers **Linear Algebra** (Chapter 0 + L1–L7 built, the rest
  of the L1–L14 spine as `future` nodes) and **Algorithms & Complexity →
  Algorithmic Thinking** (Karatsuba built, Red–Black Trees `future`).
- [x] **The app brand is product-level** — `PRODUCT_NAME` ("Interactive Textbook",
  from `docs/product/vision.md`) in `src/platform/product.ts`; the header, the
  document title, and the home `h1` no longer name a course.
- [x] **The sidebar renders the active course** — title, subtitle, and units come
  from the tree, and the active course is derived from **lesson membership**, so
  `/lesson/:lessonId` routes are unchanged. Karatsuba shows the Algorithmic
  Thinking spine; nothing from linear algebra leaks in.
- [x] **The home page is a catalog** — one card per course, each with its own
  title, subtitle, chapter count, entry CTA, and course-relative chapter list.
- [x] **Numbering, prior/current/upcoming, progress, and Prev/Next are
  course-relative.** Karatsuba is chapter **1 of 1** in its course, not 9 of 9;
  eigenvectors is the last linear-algebra lesson and therefore has **no Next
  link** — the cross-course "Next → Karatsuba" is gone.
- [x] No lesson content was duplicated and no computation moved: the tree holds
  bare `{ kind, lessonId }` references (asserted in `courseModel.test.ts`).

### Part B — the generic phase rail is not chapter prose

`docs/product/semantic-page-grammar.md` §1 is authoritative for learner-visible
naming: a reader infers a block's role from content and typography, never from a
repeated generic phase label. The shell was rendering "Think about it", "Watch
the idea", "Quick check", "Try it yourself", and "Remember this" as `h2`s and as
table-of-contents rows on every lesson.

- [x] **Block kinds stay internal** and are still available as route metadata,
  `data-block-kind` + `data-phase` hooks, styling variants, and accessible region
  descriptions (`aria-label` on each block's `<section>`).
- [x] **`Phase` renders no visible heading by default**, and no generic name is
  inserted into either table of contents (the on-page one or the sidebar's
  expansion of the current lesson).
- [x] **A route block may author its own labels** — `RouteBlock.heading` (visible,
  content-specific) and `.tocLabel` (contents only, for a block whose child
  already carries the visible heading, e.g. an explorer).
- [x] **Only two conventional textbook labels survive** — *Practice* and *Worked
  examples* (grammar §5.2 furniture), plus the existing *Definition* / *Theorem*
  labels on formal blocks and the content-specific titles of sections, worked
  examples, and exercises.
- [x] **Every lesson was audited, not find-and-replaced.** Guided scenes that no
  section title introduces got an authored heading naming what the animation
  builds (vectors, elimination, determinants, eigenvectors, karatsuba); the ones
  a section title already introduces got none (transformations, systems, solution
  sets); Chapter 0's mystery scene is deliberately unheaded. Each summary's
  heading now names its **synthesis** ("A basis is a coordinate language",
  "One particular solution plus the null space"), not "Remember this".
- [x] **Redundant utility copy removed** — the stock ledes above worked examples
  ("Watch the derivation and the notebook reasoning together…") and above the
  explorer ("Now take control of the same example you just watched…"), which were
  identical on every lesson.
- [x] **Heading hierarchy repaired** where the removed `h2` would have left a gap:
  `ExplorationPanel`'s own content-specific title is now the block's `h2`, a
  worked example placed on its own by a `worked` route block takes `h2`
  (`headingLevel` prop) while examples inside the combined block stay `h3`, and
  `KaratsubaTreeDiagram` moved `h4` → `h3`.
- [x] **Typography follows the structure**: with the rail gone, a section title is
  the page's top heading level under the lesson title, so section and authored
  block headings share one display treatment; a displayed equation is given room
  rather than a bordered card (one fewer nested card per section).
- [x] `MotivatingQuestion`'s region label is "Motivating question", not "Predict" —
  prediction is a tool, not a ritual (`vision.md` §4).

### Testing review

- [x] `src/lessons/__tests__/toc.test.ts` — asserts, **for every registered
  lesson**, that no generic phase label appears anywhere in its contents, that the
  contents are never empty, and that the two conventional labels survive where a
  block of that kind exists.
- [x] `src/lessons/__tests__/courseModel.test.ts` — active course derived from
  membership (including the unplaced-id fallback), numbering restarting per
  course, progress measured against the course, and **no adjacency across a course
  boundary** (`getAdjacentLessons("eigenvectors").next === null`).
- [x] `e2e/course-context-and-grammar.spec.ts` (5 specs) — the catalog lists both
  courses and files Karatsuba under its own; Karatsuba's sidebar carries
  `data-course="algorithmic-thinking"` with no linear-algebra links; the last
  linear-algebra lesson renders **no Next link**; **all nine lessons** are swept
  for generic phase text in headings and in both tables of contents while still
  emitting `data-block-kind`; and every lesson has exactly one `h1` with no
  skipped heading levels.
- [x] Verified at package tier: `./check.sh --e2e`.

---

## Binary Search Trees — Gate 7 correctness review (2026-07-24)

First lesson of the `data-structures` unit, built from
`docs/courses/data-structures/lessons/binary-search-trees/` (insight `PASS` →
mastery contract → plan). Promoted `future → built`; it is now chapter 2 of
Algorithmic Thinking, ahead of Red–Black Trees.

### Math layer

- [x] **All tree state is computed in `src/math/binarySearchTrees.ts`.** No scene
  or explorer recomputes a key, a path, a height, or a bound.
- [x] **Three conventions fixed in the module header**, because each one silently
  breaks a lesson claim if left loose: height counts **edges** (so
  $n \le 2^{h+1}-1$ needs no correction), cost counts **key comparisons** (so
  cost $=$ depth $+1$ is an identity, not an approximation), and duplicates are
  **rejected** (so in-order-equals-sorted cannot fail).
- [x] **The weaker test is implemented on purpose.** `passesLocalChildChecks`
  exists beside `isValidBST` so the lesson's misconception can be *demonstrated*
  rather than asserted, and so a test can pin the two disagreeing.

### Invariants (all seven, `src/math/invariants.ts`)

- [x] (1) in-order is the sorted sequence, for every insertion order — 150
  randomized orders;
- [x] (2) every insert-at-leaf tree is valid, **and** (negative) a
  locally-valid/globally-invalid tree is *rejected*;
- [x] (3) comparison count $=$ depth $+1$, present and absent keys;
- [x] (4) sorted insertion gives height $n-1$; (5) the balanced build attains
  $\lceil\log_2(n+1)\rceil-1$; (6) every random order lands inside the bounds;
- [x] (7) binary search's probes equal the **balanced** tree's path — and a
  companion test asserts they do **not** equal an arbitrary tree's, so the
  restriction the Stage-2 audit forced into the insight contract cannot silently
  widen back into the false claim.
- [x] **Guard on the guard:** the negative assertion itself is tested against a
  not-actually-locally-valid fixture and against a genuinely valid tree, so it
  cannot pass vacuously.

### Honest-visualization review

- [x] The `lift` beat moves array cells **straight down** into tree positions —
  the horizontal slot never changes — and is captioned as a redraw, so the
  animation cannot imply that a computation occurred.
- [x] The `degenerate` beat is captioned as a *different insertion order*, not a
  different algorithm.
- [x] Every caption number (probe sequence, path, heights, costs) is read from
  `src/math` at scene-build time rather than typed into the scene.
- [x] Explorer readouts (height, worst-case comparisons, bounds band, comparison
  trace, in-order readout) all come from the same helpers the exercises grade
  against.

### Testing review

- [x] `binarySearchTrees.test.ts` — 20 tests: construction, duplicate rejection,
  empty/single-key edges, shape-independent in-order over 200 shuffles, the cost
  identity, both degenerate directions, median-first reproducing the balanced
  tree exactly, the bounds over $n \le 12$, the closed form's tightness, the
  interval reports, and the array↔balanced-tree identity at odd *and* even sizes.
- [x] `bstInvariants.test.ts` — 10 tests over the seven invariants plus the
  guard-on-the-guard trio.
- [x] `bstGradingContract.test.ts` — 42 tests. Every auto-graded item carries the
  adversarial battery, with the rejects chosen to be the *plausible* wrong
  answers rather than noise: right keys in the wrong order, cost counted as depth
  rather than depth $+1$, heights instead of comparison counts, "$\log_2 7$" on a
  chain (the $O(\log n)$ reflex), the interval taken from the parent alone (the
  misconception itself), and a right answer with a circular justification.
  It also asserts no graded item reuses the scene's key set.
- [x] `e2e/lesson-binary-search-trees.spec.ts` — 5 specs: the lesson loads inside
  the **Algorithmic Thinking** frame with its authored scene heading; switching
  the insertion order moves height 2→6 and cost 3→7 **while the in-order readout
  is asserted unchanged**; a search highlights exactly one node per comparison;
  the interval toggle is off by default; and no horizontal overflow at 1440 px
  and 390 px in **both themes**.
- [x] The nine-lesson page-grammar sweep in `course-context-and-grammar.spec.ts`
  picks the new lesson up automatically (added to `LESSON_IDS`): no generic phase
  headings, no generic ToC rows, one `h1`, no skipped heading levels.
- [x] Verified at package tier: `./check.sh --e2e`.

### Scope honesty

- [x] The lesson **refuses** the unqualified "$O(\log n)$" claim in prose, in a
  callout, and in a graded distractor. Search is $\Theta(h)$; balance is the
  sequel's job.
- [x] The average-case-over-random-orders result is offered as an enrichment
  layer **with its assumption stated**, and is never assessed.
- [x] Deletion is named in a `looking-ahead` layer only.

---

## Red–Black Trees — Gate 7 correctness review (2026-07-24)

Third chapter of Algorithmic Thinking, built from
`docs/courses/data-structures/lessons/red-black-trees/`. Promoted `future → built`.
It is the course's last lesson and therefore has no Next link.

### Corrections the build forced

- [x] **The insight contract's case 3 was internally inconsistent** — "a fourth
  key arrives (a 5-node)" cannot also leave "two 2-nodes", because promoting the
  middle of four keys leaves a 2-node and a 3-node. Splitting **pre-emptively**,
  on the way down, makes the contract's own sentence true and is what the lesson
  animates. Recorded in the module header, not silently absorbed.
- [x] **The left-leaning normalization is adopted and disclosed.** The contract
  names it as a legal, separately-stated choice; taking it makes `encode`/`decode`
  an exact bijection, so the round-trip is a test rather than a caveat, and the
  mirror freedom is still explained to the learner in a depth layer.
- [x] **Invariant (4) was wrong on the first attempt, and the test caught it.**
  "A split preserves EXTERNAL black height" is false under the exclusive count
  (1 before, 2 after). It holds on a path entering *through* the representative,
  so the representative's own colour counts. That qualifier is exactly what
  misconception M4 drops; writing the test to match the code would have shipped
  the lesson asserting the wrong quantity.

### Math layer

- [x] Everything the scene and explorer show — trees, colours, per-path black
  counts, repair classifications, legality reports — comes from
  `src/math/redBlackTrees.ts`.
- [x] `classifyRepair` is **derived from the real insertion**, so the
  classification a learner is graded on and the repair the explorer performs can
  never disagree.
- [x] `rotateOnlyAt` implements a purely structural rotation with **every node
  keeping its own colour** — the honest meaning of "the rotation alone", and the
  reason it can move a black node between paths.

### Invariants (all seven, `src/math/invariants.ts`)

- [x] (1) `encode(decode(R)) = R`; (2) every repair preserves the key order;
  (3) the tree stays legal; (5) only a root split changes the total black height,
  and then by exactly one; (6) `height ≤ 2·log₂(n+1)` after every insertion —
  **including on sorted input up to n = 64**, the order that destroyed the plain
  BST in the previous lesson.
- [x] (4) a split preserves **external** black height, with the qualifier
  implemented explicitly and justified in the comment.
- [x] (7) **NEGATIVE**: a bare rotation must break the tree. If it ever stops
  breaking it, the lesson's sharpest confrontation has quietly become a claim
  about nothing, so the assertion fails loudly. Guards-on-the-guard: the starting
  tree must be legal first, and a non-cluster fixture must be rejected by (4).

### Honest-visualization review

- [x] The scene animates **one cluster**, not a whole tree: the insight is about
  what a single node *is*, and at 960×540 a full tree would make the colour change
  — the actual subject — the smallest thing on screen. The whole-tree view is the
  explorer's job.
- [x] At `split-is-recolour` the left panel physically splits while the right panel
  **only changes colour**, which is the claim being made. No pointer is animated
  on the encoded side, because none moves.
- [x] The violation marker is captioned as a *repair state*, so M3 cannot form.

### Testing review

- [x] `redBlackTrees.test.ts` — 21 tests: legality after **every single
  insertion** across 120 random orders; the height bound on sorted input; the
  encoding round-trip both directions; black height equal to the decoded 2–3–4
  height; the total black height changing only on a root split, **uniformly**;
  classification agreeing with the insertion it describes; and a bare rotation
  preserving order while breaking legality.
- [x] `rbInvariants.test.ts` — 10 tests over the seven invariants plus the two
  guards-on-the-guard.
- [x] `rbtGradingContract.test.ts` — 46 tests. Rejects are answers a learner would
  actually produce: arity read *after* insertion, "it has room so nothing to do"
  (missing the orientation half), the black count read from the node exclusive,
  the tree's height in place of its black height, and — twice — the red-red pair
  read as a five-key node.
- [x] `e2e/lesson-red-black-trees.spec.ts` — 5 specs: the lesson sits third in
  Algorithmic Thinking with **no Next link**; the explorer shows the decoded
  2–3–4 tree beside the encoding; **Rotate only (break it)** breaks legality and
  diverges the per-path black counts **while the in-order readout is asserted
  unchanged** — the misconception repair, executed rather than narrated; cluster
  rings off by default; no horizontal overflow at 1440 px and 390 px in both themes.
- [x] Verified at package tier: `./check.sh --e2e`.

### Scope honesty

- [x] Deletion is named as the dual in a `looking-ahead` layer and **not taught**.
- [x] The amortized restructuring figure is stated **with its variant caveat** and
  is never assessed.
- [x] No optimality claim: the lesson proves sufficiency and a logarithmic bound,
  not that red-black balance is minimal.


---

## Guided-scene revision — red-black encoding + player controls (2026-07-24)

Scope: no grading semantics touched. `red-black-encoding` scene revised per
[guided-animation-audit-2026-07.md](guided-animation-audit-2026-07.md): the
split's colour flip is a watchable tween simultaneous with the 2–3–4 key
travel (same node objects); the arriving key 35 now completes its arc into
the freed 2-node / red child of 40 instead of vanishing; a prediction prompt
precedes the reveal; a new `invariant-held` beat reads the conserved black
height off the picture (still 1 after the flip — one black on every path
through the cluster; 2 only after the root split, uniformly), matching what
`redBlackTrees.test.ts` proves about the model. All 11 beats are chapters
with summaries; `violation-moves-up` is reachable via Prev/Next.

- [x] Displayed black-height claims re-derived against the encoding
      (one black crossed per cluster on every path; root split adds one
      level to all paths at once).
- [x] Sorted order preserved by the new choreography: 35 enters left of 40;
      right panel nodes never move.
- [x] Timing metadata and scene bodies share `RED_BLACK_SEGMENTS`
      (`runSegment` measured padding); step markers verified by
      `sceneTimings.test.ts` monotonicity and `lessonWiring.test.ts`.
- [x] Player controls (speed/theater/fullscreen/keyboard/chapters) covered by
      `GuidedScenePlayer.test.tsx`; verified at package tier with e2e.

---

## Karatsuba route restructuring — historical-breakthrough archetype (2026-08, R2)

Scope: `src/lessons/karatsuba.ts` route restructuring (package R2 of
`feature/experience-architecture`, see
[courses/algorithms/lessons/karatsuba/lesson-plan.md](../courses/algorithms/lessons/karatsuba/lesson-plan.md)'s
restructuring addendum). No guided scene, explorer, worked example, checkpoint,
or exercise content changed — only route order, callout placement, one new
`composed` block, and the closing section. No new math beyond what
`karatsubaStep` already computes and tests.

### Mathematical review

- [x] `KaratsubaThreeEvaluationsLab` draws zero new arithmetic — every displayed
      number (`z0`, `z1`, `z2`, `sumProduct`, `product`) comes directly from
      `karatsubaStep`, the same tested pure function the lesson's exercises and
      worked examples already use. No new formula was introduced.
- [x] The reassembly weights ($100$/$10$ shown to the learner) are derived from
      `step.base ** step.m`, not hardcoded, so the component stays correct if a
      future config selects a different split point.
- [x] The approved insight contract's causal chain (`insight.md` §4, items 1–11)
      is unchanged in content; every obligation in the traceability table still
      maps to the same content, only at a different route position.

### Visual review

- [x] `MisconceptionCallout`'s new `attribution` line renders only when
      authored (`formatAttribution`); no existing callout in any of the other
      18 lessons sets it, so their rendering is byte-identical.
- [x] The `karatsuba-three-evaluations` composed block has its own accessible
      region label ("Three evaluations of a quadratic") distinct from the
      guided scene and explorer regions, so assistive tech never sees two
      regions announcing the same thing.
- [x] **Found and fixed by `./check.sh --e2e`:** the `o-n-squared-belief`
      callout was originally placed directly after `motivate` (which renders
      no heading), so the page's `h1` jumped straight to the callout's `h3`
      title — `e2e/course-context-and-grammar.spec.ts`'s heading-hierarchy
      check caught it. Fixed by moving the callout after the opening `visual`
      block (which renders an `h2`); the general pitfall — a `callout` block
      must never be the first heading-bearing route block — is now documented
      in lesson-design.md's block palette.
- [x] **Found and fixed by a strengthened component test:** two table cells in
      `KaratsubaThreeEvaluationsLab` used raw `$z_0$`/`$z_2$` JSX text instead
      of `ProseWithMath`, leaving literal, un-rendered KaTeX delimiters visible
      in the DOM (caught visually via a manual browser screenshot, then given
      a permanent regression test asserting no `$` reaches the rendered text).

### Testing review

- [x] `KaratsubaThreeEvaluationsLab.test.tsx` — 5 tests: accessible label;
      values match `karatsubaStep` for the default preset; a configured
      `exampleId` is honored when it resolves; an unresolved `exampleId` falls
      back safely; switching presets via the picker recomputes correctly.
- [x] `blockComponents.test.tsx` extended to resolve the real registered entry
      end-to-end (lazy load + Suspense + accessible label).
- [x] `MisconceptionCallout.test.tsx` (new) covers belief/confront/resolve
      labels and the three attribution-formatting branches (both fields, one
      field, source-only).
- [x] `toc.ts` gained real cases for `callout`/`proof`/`composed` and a fixed
      guard for named vs. combined `explore` placement (a latent gap from R1,
      found while wiring this lesson) — covered by 7 new cases in
      `toc.test.ts`.
- [x] `lessonWiring.test.ts` and `contentValidation.test.ts` pass unchanged
      against the restructured route (both are structural validators, not
      pinned to Karatsuba's specific shape).
- [x] Full unit suite green (2139 tests) and `./check.sh --e2e` green with
      `e2e/lesson-karatsuba.spec.ts` updated to match the new route (see that
      spec's diff for what changed: the callout/composed-block assertions
      added, no assertion on the removed summary block since none existed).

### Teaching review

- [x] The historical callout (`o-n-squared-belief`) states only what its cited
      source supports (Karatsuba & Ofman 1962; the seminar/1960 framing is
      standard, widely-cited CS history per Knuth TAOCP Vol. 2) — no invented
      or unverifiable biographical detail.
- [x] The lesson ends on an explicitly unresolved question (Toom-Cook → FFT),
      stated as *not built here*, not implied as solved — matches the
      insight contract's own scope limits (sufficiency shown, optimality and
      the FFT connection explicitly deferred).
- [x] `docs/quality/known-failure-modes.md` — no new entry needed; no
      math/visualization bug was fixed, only route composition.

---

## Package R3 — node types, production routes, and the first `proof` retrofit (2026-08)

Scope: `src/lessons/courseModel.ts` (`workshop`/`assessment` `UnitItem` kinds),
`src/app/routes.tsx` + `src/pages/ModuleSetPage.tsx` (production `/set/:setId`
route), `src/components/layout/CourseSidebar.tsx` (rendering), and
`src/lessons/rankNullity.ts` (retrofitting `thm-rank-nullity` to a `proof`
route block). Package R3 of `feature/experience-architecture`.

### Mathematical review

- [x] The rank–nullity proof moved into `FormalBlock.proof` is **byte-identical
      in mathematical content** to the `math-note` depth layer it replaced
      (spanning basis extension, spanning argument, independence argument,
      conclusion) — only two bold-emphasis clauses were reworded (see below),
      never the mathematical claims themselves.
- [x] `workshop`/`assessment` nodes reuse existing, already-reviewed
      `ModuleSet`s (`systems-elimination-transfer`, `systems-elimination-mock`)
      verbatim — zero new exercises, zero new grading logic.

### Visual review

- [x] **Found and fixed:** the first `FormalStatement` design (R1) rendered a
      `proof` route block as the FULL statement/interpretation/layers block
      again, with the proof merely appended — so a theorem followed
      immediately by its `proof` block showed the statement, "In words," and
      the "COMMON TRAP" callout **twice** in a row. Caught by a manual browser
      screenshot (not by any test, since R1's component tests only checked a
      single block in isolation, not the two-block route sequence). Redesigned
      so `variant="proof"` renders a distinct, minimal block — just the proof,
      labeled "Proof (Theorem — …)", ending in ∎ — never repeating what the
      preceding `formal` block already showed. `data-testid` was also
      colliding (`formal-<id>` used by both renderings); now
      `proof-<id>`/`formal-<id>` are distinct, matching `toc.ts`'s existing
      anchor-id convention.
- [x] **Found and fixed:** two `**bold**` spans in the relocated proof text
      (and one pre-existing, unrelated one elsewhere in the same lesson file)
      wrapped an inline `$...$` token, which `ProseWithMath` cannot render
      (documented as a new `known-failure-modes.md` entry) — the markers
      rendered as literal, un-bolded asterisks. Reworded both clauses to keep
      bold spans clear of math tokens; content/meaning unchanged. Five more
      pre-existing occurrences were found in other, unrelated lessons
      (`determinants.ts`, `matrixComposition.ts`, `redBlackTrees.ts`,
      `structureModuleItems.ts`, `subspacesRank.ts`) and are recorded, not
      fixed here — outside this package's scope.
- [x] Workshop/assessment sidebar entries use a lettered square badge (not the
      numbered lesson circle) and a "(beta)" tag, distinguishing them from
      numbered lessons without a false claim of production polish.

### Testing review

- [x] `courseModel.test.ts` extended: the linear-algebra spine test now proves
      the two new nodes resolve to the expected `ModuleSet`s at the expected
      position, and `validateCurriculum` rejects an unknown `setId` for
      `workshop`/`assessment` (referential integrity, mirroring the existing
      lesson-id check).
- [x] `FormalStatement.test.tsx` rewritten for the new proof-only rendering:
      asserts the proof block never repeats the statement/interpretation/
      layers, and that variant="proof" with no `.proof` field renders nothing.
- [x] `lessonWiring.test.ts`'s rank-nullity proof test updated to read
      `thm.proof` (not a `math-note` layer) and to assert the `proof` route
      block is present.
- [x] `e2e/module-set-production-route.spec.ts` (new) — the sidebar links
      resolve to the right URLs and load; the timed-mock countdown renders;
      the production route rejects a spaced one-item set exactly like the dev
      route does.
- [x] Full unit suite (2140 tests) and `./check.sh --e2e` green (only the two
      pre-existing, documented, waived failures present — see the R2 entry
      above for the baseline reproduction).

### Teaching review

- [x] The proof is now the lesson's stated main line (per its own scope note:
      "The proof is shown in full"), not an optional aside — consistent with
      vision.md §0 principle 9 ("proof … is the main line, not a disclosure").
- [x] Workshop/assessment framing is honest: both currently render through the
      same deferred-feedback `ModuleRunner` (no immediate-feedback practice
      mode exists yet) — the beta banner and code comments say so explicitly,
      rather than implying a distinction the runtime doesn't yet deliver.

---

## Slice review pass — R0–R3 self-review findings (2026-08)

A critical re-read of the whole R0–R3 diff before requesting independent
review. Four real defects found; all four fixed in the same pass.

### 1. `objectives` shipped with no consumer — the validator asserted nothing

`objectiveCoverage.test.ts` (77 lines, shipped in R1) iterates
`lesson.objectives ?? []`. **No lesson declared `objectives`**, so every
assertion in it was vacuous, and R1's stated acceptance criterion
("objective coverage is validated from data") was not actually met. This
also contradicted the reasoning used to *defer* the `review` node kind in
R3 — "a node without a consumer is exactly what ADR-005 rejects" — applied
to one addition but not the other.

- [x] **Fixed** by migrating `karatsuba` to declare `objectives`, giving the
      validator a real consumer. Four objectives are `lesson-owned` with
      resolvable `itemIds` at honest levels (numeric items claim E3,
      multiple-choice items claim E2 — never above
      `CAPABILITY_EVIDENCE_CEILING`); **two are `course-owned`**, because the
      four-pieces expansion and the shared-weight argument are exercised only
      by the checkpoint and the guided scene, neither of which is a graded
      `ExerciseDefinition`, and Algorithmic Thinking has no module assessment
      set. That is a real, previously-invisible coverage gap — the model
      surfacing it is the intended behavior, not a failure.
- [x] **Verified the validator bites**, not merely passes: temporarily
      raising one objective's claim from E2 to E4 (above the multiple-choice
      ceiling) fails with a precise message naming the objective, the lesson,
      and the claimed level. Reverted after confirming.

### 2. ADR-006 asserted something the code does not do

The ADR claimed `ITEM_ASSESSMENT_META` coverage had been extended from module
items to lesson exercises "as part of R1's `objectiveCoverage.test.ts`". It
had not: that test uses `CAPABILITY_EVIDENCE_CEILING` (the *necessary* bound),
and the manifest still covers `MODULE_ITEMS` only — as `evidenceCeiling.test.ts`
independently asserts.

- [x] **Fixed** ADR-006's Decision and Consequences sections to state what the
      code actually does, and to record the real consequence for R6:
      `objectiveState` can derive `performed` from a ceiling check, but
      **cannot** derive `transferred` without the freshness/unfamiliarity
      signals only `evidenceBasis` carries. Extending the manifest is real R6
      work, not something R1 completed.

### 3. The `proof` block render — R3's headline deliverable — was asserted nowhere

`e2e/lesson-rank-nullity.spec.ts` never mentioned the proof. The only
verification the proof rendering ever received was a manual browser
screenshot during development; a regression in `FormalStatement`'s proof
variant would have failed no test.

- [x] **Fixed** with a dedicated spec asserting the statement and proof are
      distinct elements with distinct anchors, the proof is expanded prose
      (no `<details>`), it ends in ∎, it does **not** repeat "In words." (the
      redundancy defect the first R1 design shipped), and — guarding the
      `known-failure-modes.md` hazard directly — that both bold lead-ins
      survive as real `<strong>` with no literal `**` reaching the DOM.

### 4. No global anchor-uniqueness check

`callout-<calloutId>` and `proof-<formalId>` (added in R1) are keyed by
content id, not route position, so placing the same callout or proof twice
in one route silently emits duplicate DOM ids — invalid HTML, and every
anchor link to it lands on whichever came first. The pre-existing
`formal-<formalId>` scheme had the same latent hazard; R1 widened it. The
only uniqueness test in the repo covered `chapter0Lesson` alone.

- [x] **Fixed** with a repo-wide check in `contentValidation.test.ts` over
      every route block of every lesson. **Verified it bites**: duplicating
      one `callout` placement in `karatsuba` fails with the lesson id and the
      colliding anchor named. Reverted after confirming.

### Reviewed and deliberately left alone

- **`RouteBlock.practice.scaffold`** is authoring-only data with no runtime
  effect, documented as such in `types.ts` and `lesson-design.md`. Unlike
  `objectives` it carries no validator implying it is enforced, so it is a
  declared-but-inert field rather than a false claim. It stays.
- **Named `explore` + `explorationId` placement** is implemented and
  ToC-tested but unused by any lesson and has no render test. It mirrors the
  `visual` + `sceneId` precedent, which *is* used, so the symmetry the type
  comment promises is worth keeping — but it is untested at the render layer
  and is recorded here as such rather than claimed as covered.
- **ToC/layout divergence for named targets:** `getBlockTocLabel` returns a
  label for a named `visual`/`explore` block without checking the target
  resolves, while `LessonLayout` drops the block when it doesn't — so an
  unresolvable named target yields a ToC row pointing at nothing. Pre-existing
  for `visual`; mirrored for `explore`. Not triggered by any current lesson
  (LessonPage always populates the map, falling back to a placeholder panel).
  Recorded, not fixed.
