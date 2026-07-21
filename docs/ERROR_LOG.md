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
