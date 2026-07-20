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
