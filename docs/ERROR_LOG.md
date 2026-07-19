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
