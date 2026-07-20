# M5 — Lessons 3 and 4

Milestone delivering the remaining POC lessons:

3. **Determinants as Signed Area Scaling** (`/lesson/determinants`)
4. **Eigenvectors and Eigenvalues** (`/lesson/eigenvectors`)

Both follow the redesigned six-phase educational system established for Lessons 1–2
([visual-design-refinement.md](./visual-design-refinement.md),
[LESSON_DESIGN.md](./LESSON_DESIGN.md)).

---

## Teaching flow

### Lesson 3 — Determinants

| Phase | Learner title | Content |
| --- | --- | --- |
| Motivate | Think about it | Stretch vs compress → what happens to area? |
| Watch | Watch the idea | Unit square → parallelogram; area = \|det\|; collapse through 0; negative det flips orientation (dashed edge cue) |
| Check | Quick check | If det = 0, what happened geometrically? |
| Explore | Try it yourself | `DeterminantExplorer` — matrix entries, presets, square/parallelogram, det / \|det\|, natural-language summary |
| Practice | Practice | Compute det; interpret \|det\|; singular det = 0; negative orientation |
| Summarize | Remember this | Magnitude = area factor; zero = collapse; sign = orientation |

**Main shared example:** `shear-2-1` (`DETERMINANT_LESSON_EXAMPLE`).

### Lesson 4 — Eigenvectors

| Phase | Learner title | Content |
| --- | --- | --- |
| Motivate | Think about it | Directions A can stretch without turning? |
| Watch | Watch the idea | Fan of vectors; most turn; eigendirections stay; Av=λv; λ stretch/shrink/reverse/collapse; scalar; defective; rotation (no real) |
| Check | Quick check | Opposite direction but same line → still eigenvector (λ < 0) |
| Worked | Worked computation | Derivation scene (`eigenvectors-derivation`) + notebook ladder; faded second example; misconception callouts |
| Explore | Try it yourself | `EigenvectorExplorer` — drag/numeric v, Av, line angle, exact eigendirections from `analyzeEigen2x2`, zero-vector rejection |
| Practice | Practice | Tiered check/drill/transfer: reverse λ; compute eigenvalues; off-axis eigenvector; rotation transfer |
| Summarize | Remember this | Nonzero preserved direction; λ = signed scale; compute via det(A−λI)=0 |

**Main shared example:** `eigen-distinct` (`EIGEN_LESSON_EXAMPLE`) — deliberately asymmetric: λ=3 → (1,0), λ=2 → (−1,1).

---

## Architecture

| Registration | Id |
| --- | --- |
| Guided scene L3 | `determinant-area-scaling` |
| Guided scene L4 (concept) | `eigenvectors-invariant-directions` |
| Guided scene L4 (derivation, embedded in worked example) | `eigenvectors-derivation` |
| Explorer L3 | `determinant-area-scaling` → `DeterminantExplorer` |
| Explorer L4 | `eigenvectors-invariant-directions` → `EigenvectorExplorer` |

No per-lesson branching in `LessonPage`. Shared math from `src/math`; examples from
`src/math/examples.ts` + `src/lessons/exampleData.ts`.

### Preliminary cleanup

- Unknown production scene ids **throw** — they no longer silently render `transform-spike`.
- Spike remains available by **explicit** id `transform-spike` and route `/dev/transform-spike`.

### New math helpers

- `classifyDeterminant` / `signedParallelogramArea`
- `classifyEigenCandidate` / `summarizeEigenAnalysis` / `lineAngleBetweenVectors` / `stabilizeDirection`
- Derivation spine: `characteristicPolynomial2x2`, `characteristicRoots2x2`, `matrixShift`, `nullspaceBasis2x2` (`Subspace2D`), `eigenDerivation2x2`

---

## Mathematical edge cases validated

**Determinants:** expansion, contraction, preserve (|det|≈1), singular collapse, near-singular, negative orientation, asymmetric diagnostic area = |det|.

**Eigen:** zero-vector rejection; distinct-real pairs verify Av≈λv; scalar-repeated; defective (one direction); complex/no-real (no fabricated directions); parallel/antiparallel line angle 0; λ=0 collapse.

---

## Tests

- Unit: `m5-classify.test.ts`, explorer component tests, `unknownSceneIds.test.ts`, expanded `lessonWiring.test.ts`
- E2E: `lesson-determinants.spec.ts`, `lesson-eigenvectors.spec.ts`
- Existing suites (grid correctness, lifecycle, L1/L2) remain green

---

## Documentation / checklist

Complete [LESSON_CORRECTNESS_CHECKLIST.md](./LESSON_CORRECTNESS_CHECKLIST.md) entries below for both lessons when shipping.
