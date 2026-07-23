# Mathematical / visualization error log

Durable record of math or visualization mistakes. Add an entry whenever a
mathematically incorrect visualization is discovered (before or after fix).

Agents and humans: read this before changing visualizations. Prefer prevention
rules over one-off patches.

---

## Entry template

```
### YYYY-MM-DD — Title

- **Date:**
- **Title:**
- **Symptom:**
- **Mathematical expectation:**
- **Root cause:**
- **Affected files:**
- **Fix:**
- **Regression test added:**
- **General lesson / prevention rule:**
- **Status:** open | fixed
```

---

### 2026-07-22 — Elimination: non-finite row-op factors accepted, all-zero system mis-compared, explorer language assumed a crossing point

- **Date:** 2026-07-22
- **Title:** `RowOperation` validity only tested against zero (accepting `NaN`/`±∞`), `haveSameSolutionSet` assumed every infinite system is a line (so the whole-plane zero system compared unequal to itself), and the elimination explorer's permanent description / canvas caption / accessible Mafs label described a unique "crossing point" for the infinite and inconsistent presets too
- **Symptom:**
  1. `isSolutionPreserving` / `classifyRowOperation` used `factor !== 0`, so `scale`/`add`/self-add with `NaN`, `Infinity`, or `-Infinity` were reported reversible/solution-preserving; `inverseRowOperation` returned garbage (e.g. `1/∞ = 0`, a scale-by-0) instead of failing.
  2. `haveSameSolutionSet` fetched a single `solutionLine` for the `infinite` branch and returned `false` when it was `null`. The all-zero system `0x+0y=0, 0x+0y=0` (classified `infinite`, but its solution set is the **entire plane**) has no line, so it compared **unequal even to itself**.
  3. The explorer's `description`, the canvas `figcaption`, and the `MafsSceneShell` `ariaLabel` were fixed strings naming "the crossing point" / "their fixed intersection point" — mathematically false for the `infinite` (coincident lines, a shared solution line) and `none` (parallel lines, empty set) presets.
- **Mathematical expectation:** A row-operation factor must be **finite and (for scale / the `1+k` self-add) nonzero** to be a reversible bijection on the rows; non-finite factors are illegal, not a stability warning. An `infinite` 2×2 system's solution set is either **one line** or the **whole plane**; equality must compare like-for-like (line=line by normalized coefficients, plane=plane, line≠plane). Learner-facing language must match the case: a point (unique), a shared line (infinite), or the empty set (none) — never a crossing point for infinite/none.
- **Root cause:** Validity conflated "nonzero" with "valid" and never checked finiteness; the infinite-case comparison modeled only the line geometry; the explorer hardcoded unique-case copy in three synchronized representations.
- **Affected files:** `src/math/elimination.ts`, `src/explorations/EliminationExplorer.tsx`
- **Fix:**
  1. `isSolutionPreserving` / `classifyRowOperation` / `numericalStabilityWarning` / `inverseRowOperation` now require `Number.isFinite(factor)` (self-add via its canonical `1+k` scale); `inverseRowOperation` throws for non-finite factors; the stability warning stays strictly separate (non-finite ⇒ illegal, never a warning).
  2. New internal `infiniteSolutionGeometry` returns `{ kind: "line" | "plane" }` by reusing `solutionLine` / `classifyRowConstraint`; `haveSameSolutionSet` compares plane=plane equal, line=line by coefficients, and line≠plane.
  3. The explorer derives `description` / caption / aria label from `current.kind` (unique = fixed intersection point, infinite = coincident lines with a shared solution line, none = parallel lines with an empty set).
- **Regression test added:** `src/math/__tests__/elimination.test.ts` — a non-finite-factor block (NaN/±∞ across scale, distinct-row add, self-add: invalid, no inverse, not asserted preserving, no stability warning) and whole-plane cases (all-zero system equals itself; line-vs-plane unequal both orders). `src/explorations/__tests__/EliminationExplorer.test.tsx` and `e2e/lesson-elimination.spec.ts` assert the preset-sensitive description/caption/aria label for all three presets.
- **General lesson / prevention rule:** Operation validity must check **finiteness**, not only nonzero-ness, and keep it separate from numerical-stability warnings. Solution-set comparison must model **every** geometry a classification allows (an `infinite` system can be a line OR the whole plane). Synchronized learner-facing representations (prose description, caption, accessible label) must be derived from the live classification, never hardcoded to one case.
- **Status:** fixed

---

### 2026-07-21 — Linear Systems: guided scene + explorer reimplemented column arithmetic and could draw a false zero-row line

- **Date:** 2026-07-21
- **Title:** Linear Systems guided scene drew every row via a local line helper (a zero row would become a false line) and both scene + explorer combined columns with hand-rolled arithmetic instead of the shared `src/math` helpers
- **Symptom:**
  1. The guided scene (`linearSystemsScene.ts`) built each row line with a local `lineBoxPoints(a, b, c, ext)` whose degenerate branch **fell back to drawing the x-axis** (`[-ext,0]→[ext,0]`). For a zero row (`0·x + 0·y = 0` ⇒ the whole plane; `0·x + 0·y = c ≠ 0` ⇒ impossible) it would therefore render a **false line** implying a spurious intersection, instead of "no constraint" / "impossible".
  2. The scene combined columns with a local `combo() = [cx·a11 + cy·a12, cx·a21 + cy·a22]` and `scaledCol1() = [cx·a11, cx·a21]`, and the explorer's `dependentRecipe()` / `scaled1` used `x*col1[0] + y*col2[0]` — duplicated matrix–vector arithmetic that could silently desync from the tested source of truth.
- **Mathematical expectation:** Whether a row `a·x + b·y = c` is a line is decided **only** by `classifyRowConstraint` (`line` / `all` / `empty`); a zero row is never a line. Every column combination `x·col₁ + y·col₂` is exactly the shared `matrixVectorMultiply(A, [x, y])`, and `x·col₁` is `scaleVector(matrixColumn(A, 0), x)`.
- **Root cause:** The renderers pre-dated (or bypassed) the shared helpers and reimplemented the linear algebra locally, violating the "`src/math` is the only source of truth" rule; the scene additionally had an x-axis fallback for the non-line case.
- **Affected files:** `src/guided-scenes/scenes/linearSystemsScene.ts`, `src/explorations/SystemsExplorer.tsx`
- **Fix:**
  1. Scene: `rowLineBoxPoints` now first calls `classifyRowConstraint`; it returns `null` (⇒ the `Line` gets empty points and draws nothing) unless the row is a genuine `line`, so a zero row can never become a false line. The box-clipping is only reached for real lines.
  2. Scene column arithmetic now flows through `matrixColumn` / `scaleVector` / `matrixVectorMultiply` (`combo = A·(x, y)`, `scaledCol1 = scaleVector(col₁, x)`).
  3. Explorer `dependentRecipe(A, b, t, consistent)` builds every endpoint via `matrixVectorMultiply(A, …)`, projects with `dotProduct`, and `scaled1 = scaleVector(col₁, recipe.x)`. The explorer already classified rows with `classifyRowConstraint` (all-plane tint / impossible note) — that path is preserved.
- **Regression test added:** `src/math/__tests__/systems.test.ts` — new "systems visualization contracts" block: `A=[[0,0],[1,0]]` row 1 = `all` / row 2 = `line` (system infinite), zero row with nonzero rhs = `empty` (system none), the infinite dependent example draws two **coincident** lines, every dependent recipe reaches `b` through `matrixVectorMultiply`, and the near-singular unique solution genuinely lands outside the ±7 view box (off-screen readout is honest).
- **General lesson / prevention rule:** Renderers must ask `classifyRowConstraint` "is this a line?" before drawing a row — never a "draw every equation as a line" fallback — and must build every column combination from `matrixVectorMultiply` / `scaleVector` / `matrixColumn`, never a local `x*col1[0] + …`.
- **Status:** fixed

---

### 2026-07-20 — Karatsuba Watch scene: bare weight labels, text-only trees, carry beat still showed 12×13

- **Date:** 2026-07-20
- **Title:** Karatsuba Watch scene: bare weight labels, text-only recurrence trees, carry-vs-width beat still showed 12×13
- **Symptom:**
  1. The weighted rectangle labeled its four regions with bare place values (`100`, `10`, `10`, `1`), so the learner had to remember which weight belonged to which region; the auxiliary rectangle had no in-rectangle region labels at all.
  2. The `branch` and `exponent` beats described the recurrence trees only in a caption (`branch 4 → 64 leaves …`) — no actual tree was drawn, so the branching-factor → leaf-count claim was asserted, not shown.
  3. The `carry-vs-width` beat kept the **12 × 13** weighted rectangle on screen while the narration and equation discussed the **78 × 56** carrying example — a picture/word mismatch (the visible rectangle was the wrong number).
- **Mathematical expectation:** Each region label should carry its own weight (`100·AC`, `10·AD`, `10·BC`, `BD`) so the shared ×10 of AD and BC is legible; the two recurrence trees must be drawn with real nodes/edges whose leaf counts equal `leafCount(4,3)=64` and `leafCount(3,3)=27`; and a beat about `78 × 56` must not show the `12 × 13` figure — it must show the 78×56 coefficient blocks `(35,82,48)→(35,86,8)→(43,6,8)` from `karatsubaStep(78,56,1).normalized`.
- **Root cause:** The weight labels were authored as bare values; the tree beats were placeholder text; and the carry beat reused the weighted-rectangle nodes instead of a dedicated 78×56 carrying diagram.
- **Affected files:** `src/guided-scenes/scenes/karatsubaCrossTermsScene.ts`, `src/components/lesson/GuidedScenePlayer.css`
- **Fix:**
  1. Region labels inside **both** rectangles: the weighted rectangle labels combine name+weight (`AC` → `100\,AC`, `AD` → `10\,AD`, `BC` → `10\,BC`, `BD`) with the weight fading in during the `weights` beat; the auxiliary rectangle labels each subrectangle `AC/AD/BC/BD`. The `share` beat makes the shared ×10 the focal event (dim AC/BD, pulse AD/BC) and collapses them into a single `10(AD+BC)` label.
  2. `branch`/`exponent` now draw two side-by-side conceptual trees from `recursionTree(4,3)` / `recursionTree(3,3)` (nodes + edges) with leaf-count labels `64 leaves = n²` and `27 leaves ≈ n^1.585`, keeping the "conceptual, not a literal call tree" caption.
  3. `carry-vs-width` fades the 12×13 weighted (and auxiliary) rectangle out and fades in a dedicated 78×56 coefficient-block diagram whose three blocks animate `(35,82,48)→(35,86,8)→(43,6,8)` driven by `BOUNDARY.normalized.steps`, with `+4`/`+8` carry chips as temporaries.
  4. Enlarged the displayed clip (`GuidedScenePlayer.css` canvas `max-height`) so captions/labels stay legible without shrinking the shared logical stage; captions kept short enough to sit inside the safe frame.
- **Regression test added:** `src/guided-scenes/scenes/__tests__/karatsubaSceneData.test.ts` pins the exact data each beat renders (weighted region values, aux `(A+B)(C+D)=12`, the 78×56 carry order + blocks, and the branch-4/branch-3 leaf counts from `recursionTree`/`leafCount`). `e2e/lesson-karatsuba.spec.ts` steps through the major beats (incl. the boundary carry beat and trees) and adds narrow-viewport passes (768 px, 390 px) asserting the canvas is not cropped.
- **General lesson / prevention rule:** A beat's caption/equation and its on-canvas figure must describe the **same** example — never leave a previous example's figure on screen while narrating a new one. Recurrence trees are drawn from `recursionTree`/`leafCount`, never text-only. Region labels should carry the quantity (name+weight) the learner must reason about, in both rectangles.
- **Status:** fixed

---

### 2026-07-20 — Karatsuba recurrence-tree picture/caption mismatch, missing weight labels, wrong "L-shape"

- **Date:** 2026-07-20
- **Title:** Karatsuba recurrence-tree picture/caption mismatch, missing weight labels, wrong "L-shape"
- **Symptom:**
  1. The explorer's conceptual recursion tree was drawn at a separate `depth` prop (default 2) while its caption read "Leaves at depth {levels}: 27/64" (levels = log₂ n = 3 at n=8) — the drawn picture contradicted the stated leaf count.
  2. The guided scene's "Place-value weights" beat asked "which two pieces share a place-value weight?" but drew no weight labels; the `weightLabels` signal was discarded via `void weightLabels`.
  3. The `subtract()` beat captioned the region remaining after peeling AC and BD as an "L-shape"; peeling two opposite corners actually leaves AD + BC — two opposite diagonal corners, not an L.
- **Mathematical expectation:** A recursion-tree drawing must have the same depth/leaf count as its caption (branch³ = 27 leaves for branch 3, 64 for branch 4 at n=8). The two shared-weight middle pieces (AD and BC, both weight 10) must be visibly labeled. After removing AC (top-left) and BD (bottom-right), the remaining area is AD (bottom-left) + BC (top-right).
- **Root cause:** An independent `depth` control decoupled the drawn tree from the `levels = log₂ n` used in captions; the weight-label fade was stubbed out and never implemented; caption copy described the wrong geometry.
- **Affected files:** `src/explorations/KaratsubaTreeDiagram.tsx`, `src/explorations/KaratsubaExplorer.tsx`, `src/guided-scenes/scenes/karatsubaCrossTermsScene.ts`
- **Fix:**
  1. Draw both trees at `renderDepth = levels = log₂ n`, restrict n to `[2, 4, 8]`, remove the redundant "Tree depth" control and its plumbing, and derive the caption leaf total from `countLeaves()` of the actually-drawn tree so picture and number agree by construction.
  2. Add four `Latex` weight labels (100 on AC, 10 on AD, 10 on BC, 1 on BD) at the subrectangle centers using the existing `wx0/wy0/splitX/splitY/wW/wH` coordinates, opacity bound to the `weightLabels` signal (hidden at t=0, faded in during the `weights()` beat).
  3. Reword the caption to "The two opposite corners left = AD+BC = z₁ = 12 − 1 − 6 = 5" (numbers unchanged).
- **Regression test added:** `src/explorations/__tests__/KaratsubaExplorer.test.tsx` — leaf-count captions track drawn depth (log₂ n) for n ∈ {2,4,8}; the "Tree depth" control is gone; the advanced toggle reveals a quadratic-evaluation note. Existing `karatsuba.test.ts` leaf-count invariants still cover the math source of truth.
- **General lesson / prevention rule:** A visualization's geometry (tree depth, drawn regions) must be derived from the same quantity as its caption — no independent "depth" knob that can desync from `log₂ n`. When a caption asks the learner to find something in the picture (shared weights) or names a shape ("L-shape", "opposite corners"), the drawn geometry must actually show it.
- **Status:** fixed

---

### 2026-07-20 — Overlay captions sat on teaching geometry

- **Date:** 2026-07-20
- **Title:** Overlay captions sat on teaching geometry
- **Symptom:** Top/bottom guided-scene captions overlapped vector tips, eigenspace lines, and grid axes (e.g. defective / highlight beats; derivation tip labels on arrowheads).
- **Mathematical expectation:** N/A (presentation). Overlay titles/captions must sit in stage margin bands; tip annotations must sit off the stroked geometry.
- **Root cause:** `LABEL_TOP_Y` / `LABEL_BOTTOM_Y` were inset deep into the teaching zone; grids used half-extent 3–4 so lines ran through caption bands; tip `Txt` nodes were center-anchored on the tip.
- **Affected files:** `safeFrame.ts`, `sceneKit.ts`, all lesson guided scenes (grid half-extent), `eigenvectorsInvariantDirectionsScene.ts` (fan length), `eigenvectorsDerivationScene.ts` (tip offsets)
- **Fix:** Move overlay bands to the stage edges; introduce `OVERLAY_CLEAR_HALF_EXTENT` (2.5); shrink fans/arrows into that band; dark glyph stroke on overlays/labels; tip labels use perpendicular offset + edge anchoring.
- **Regression test added:** Manual screenshot review of defective / highlight / interpret beats.
- **General lesson / prevention rule:** Keep overlay Y anchors in the stage margin outside the teaching half-extent; never place center-anchored tip labels on the tip itself.
- **Status:** fixed

---

### 2026-07-20 — Guided overlay captions clipped at stage edges

- **Date:** 2026-07-20
- **Title:** Guided overlay captions clipped at stage edges
- **Symptom:** Long top/bottom Motion Canvas overlays (e.g. defective-matrix caption “Repeated λ — only one eigendirection…”) were cut off at the left/right of the guided canvas.
- **Mathematical expectation:** N/A (presentation). All learner-facing overlay text must remain fully readable inside the safe frame.
- **Root cause:** `makeOverlayLabel` drew single-line `Txt` nodes with no `width` / `textWrap`, so long strings extended past `SCENE_WIDTH` while still center-anchored at `LABEL_CENTER_X`.
- **Affected files:** `src/guided-scenes/scenes/sceneKit.ts`, `safeFrame.ts`, caption copy in eigen/determinant/linear-combination scenes
- **Fix:** Cap overlay width to `SAFE_WIDTH` with `textWrap: true`, increase `cachePadding`, nudge label band Y for wrapped lines, and shorten the longest captions.
- **Regression test added:** Manual Playwright screenshot review of long-caption beats (defective, derivation shift/solveV). No pixel CI assertion (per project convention).
- **General lesson / prevention rule:** Overlay captions must use `makeOverlayLabel` with a safe max width and wrapping; never rely on a single unwrapped line fitting the stage. Prefer shorter caption copy when a wrap would crowd geometry.
- **Status:** fixed

---

### 2026-07-19 — Transformed grid used the wrong matrix orientation or coordinate mapping

- **Date:** 2026-07-19
- **Title:** Transformed grid used the wrong matrix orientation or coordinate mapping
- **Symptom:** For \(A = [[1.8, 0], [1.8, 2.2]]\), the rendered explorer grid showed a horizontal-looking family instead of a vertical family aligned with \(A\mathbf{e}_2\). Basis arrows and \(A\mathbf{v}\) readouts could still look plausible because they did not use the same code path as the grid.
- **Mathematical expectation:**  
  \(A\mathbf{e}_1 = (1.8, 1.8)\), \(A\mathbf{e}_2 = (0, 2.2)\).  
  Therefore one transformed grid family (images of identity-space \(x = k\) lines) must be **vertical** (parallel to \((0, 2.2)\)), and the other parallel to \((1.8, 1.8)\).
- **Root cause:** `TransformedGrid` wrapped identity-space `Line.Segment`s in Mafs `<Transform matrix={toMafsMatrix(A)} />`. `toMafsMatrix` returned `[a11, a21, a12, a22, 0, 0]`. Mafs `vec.transform` interprets its 6-tuple as  
  \(x' = x\cdot m_0 + y\cdot m_1 + m_2\), \(y' = x\cdot m_3 + y\cdot m_4 + m_5\),  
  so that packing applied  
  \(x' = a_{11}x + a_{21}y\), \(y' = a_{12}x + a_{22}y\)  
  — **not** the project column-vector convention  
  \(x' = a_{11}x + a_{12}y\), \(y' = a_{21}x + a_{22}y\).  
  Correct Mafs packing would have been `[a11, a12, 0, a21, a22, 0]`; the explorer instead bypassed Mafs packing entirely. This was **not** intentional slope-from-rows logic, but an equivalent orientation/packing bug that desynced the grid from column-based basis vectors.
- **Affected files:**  
  `src/explorations/MatrixTransformationExplorer.tsx` (buggy `toMafsMatrix` + `<Transform>` path; removed).  
  Guided Motion Canvas grids in `sceneKit.ts` were already endpoint-correct via `matrixVectorMultiply`.
- **Fix:** Generate segments with `transformedGridSegments` / `matrixVectorMultiply` on both endpoints; draw those math-space endpoints directly. No independent slope derivation; no duplicated arithmetic in the renderer beyond calling the shared helper.
- **Regression test added:**  
  - `src/math/__tests__/matrices.test.ts` (formula + endpoint grid)  
  - `src/math/__tests__/invariants.test.ts` (`grid-bug-repro`, vertical family)  
  - `e2e/math-grid-correctness.spec.ts` (explorer readouts for the repro matrix)
- **General lesson / prevention rule:**  
  - Transform endpoints through `matrixVectorMultiply` / `transformedGridSegments`.  
  - Add grid-direction invariants (`assertGridDirectionMatchesBasis`).  
  - Test with asymmetric matrices (`diagnostic-asymmetric`, `grid-bug-repro`).  
  - Keep screen-coordinate conversion separate from the mathematical map.  
  - Do not trust third-party matrix layouts without a packing test against `matrixVectorMultiply`.
- **Status:** fixed

---

### 2026-07-19 — Eigen guided scene captioned λ reverse/collapse without showing scale

- **Date:** 2026-07-19
- **Title:** Eigen guided scene captioned λ reverse/collapse without showing scale
- **Symptom:** Lesson 4 Watch captions said “reverse” / “collapse” while eigen arrows stayed fixed length; λ = 0 still showed a long axis arrow. v vs Av were morphing in place with no labels, so newcomers could not see input vs output.
- **Mathematical expectation:** For an eigendirection, \(A\mathbf{v}=\lambda\mathbf{v}\). λ < 0 must reverse along the same line; λ = 0 must send the tip to the origin. Displayed geometry must match the captioned case.
- **Root cause:** Choreography morphing matrices while leaving eigendirection markers at constant length; apply beat reused one arrow tip instead of ghost \(\mathbf{v}\) + \(\mathbf{A}\mathbf{v}\).
- **Affected files:** `src/guided-scenes/scenes/eigenvectorsInvariantDirectionsScene.ts`, `sceneTimings.ts`, `sceneMeta.ts`
- **Fix:** Ghost \(\mathbf{v}\) + labeled \(\mathbf{A}\mathbf{v}\); held stretch / reverse / collapse demos on one line; majorSteps include lambdas and scalar; longer holds.
- **Regression test added:** Visual review via Playwright MCP screenshots of major beats (no pixel assertion). Existing Lesson 4 e2e still covers load/play/explorer.
- **General lesson / prevention rule:** When a caption names a geometric effect (flip, collapse, stretch), the same beat must animate tip length/direction accordingly — not only swap matrices or show fixed direction markers.
- **Status:** fixed
