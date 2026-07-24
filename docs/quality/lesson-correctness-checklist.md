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

### Testing review

- [x] Unit + integration: `learnerState`, `persistence`, `useLearnerState`,
  `attemptSnapshot`, `moduleSets`, `reviewStatus`, `scheduler`, `captureRenderers`,
  `ModuleRunner`, `ReviewQueue` — full `vitest` suite **580 passing / 62 files**
- [x] **Mandatory** e2e `e2e/assessment-runner.spec.ts` (2 tests): (1) submit →
  `REVIEW_PENDING` → score every pending proof (finite score) → `REVIEW_COMPLETE`,
  **persisted across reload**; (2) blank proofs stay `REVIEW_FAILED` + export/reset/import
  recovery loop; zero console errors. Full `playwright` suite green (**48 passed**).
- [x] `tsc -b` 0 errors; `npm run lint` (oxlint) clean apart from non-blocking
  `react-refresh` warnings on the provider+hook and shared `captureRenderers` modules

### Status review

- [x] `implementation-package.md` (Package F → shipped), `assessment-plan.md` (Gate 9 still
  PLANNED; no Class-A content authored), and `engineering/platform-contracts.md`
  (persistence §5; "no persistence layer" non-goal superseded for the assessment surface)
  updated to shipped status
- [x] **Gate 8 = NOT PASSED** for L3/L4/L5 preserved — F is capture + review only and emits
  no verdict; **Package G is the next Mode C target** (requires explicit approval)
