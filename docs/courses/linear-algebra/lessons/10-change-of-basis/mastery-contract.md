# Lesson Mastery Contract — Change of Basis (L10)

Gate 5 for **L10 `change-of-basis`**, after [insight.md](insight.md) reached `PASS`.

## 1a. Placement & upstream links
- **Spine:** L10, unit `structure`, last before L11 `eigenvectors`.
- **Profile:** P2 primary, `structure` module **P3 override**. The similarity
  theorem is **derived in the body**; learner proof construction is offered as an
  unscored `self-check`. As in L8/L9 the P3 bar is **prepared, not claimed** —
  Gate 9 owns it.
- **Insight contract:** [insight.md](insight.md) — `PASS`.
- **Concepts introduced:** `change-of-basis`. **Reused:** `basis`, `coordinates`,
  `linear-transformation`, `matrix-columns`, `invertibility`, `determinant`,
  `rank`, `nullity`.

## 1b. Role, bridge, need
- **Role:** pays off L1's "coordinates are a choice" and hands L11 the machinery
  for diagonalization. It is the last lesson before eigenvectors and exists
  largely to make that lesson's payoff sayable.
- **Retrieve:** unique coordinates in a basis (L1); columns rule (L2); solving
  `P c = x` (L3/L4); inverses and right-to-left composition (L6);
  `det(AB) = det A det B` (L7); invariance of rank under invertible maps (L8/L9).
- **Bridge from L9:** L9 showed rank and nullity are properties of the *map*, not
  of how it is written. L10 asks the obvious next question — if those survive
  rewriting, what exactly is being rewritten?
- **Motivating need:** *Lesson 1 said coordinates are a choice. Every matrix
  since has been written without saying which choice. Which one was it, and what
  changes if you pick another?*

## 1c. Content to teach
- **Definitions (D2):** coordinate vector `[x]_B`; change-of-basis matrix `P`
  (columns = new basis vectors in standard coordinates); matrix of a map in a
  basis `[A]_B`; similar matrices.
- **Objects:** `P` and `P⁻¹` for L1's basis; `[A]_B` for the eigenbasis of
  `eigen-distinct`; a non-orthogonal, non-unit basis (so neither is assumed).
- **Procedures (D3):** convert both directions; build `[A]_B = P⁻¹AP`. Graded
  intermediates: the coordinate vector itself and the reconstruction check
  `P[x]_B = x`, not only a final matrix.
- **Results (D5):** `x = P[x]_B` and `[x]_B = P⁻¹x`; the similarity theorem
  (derived); invariance of det, rank, nullity, trace (trace stated only); the
  diagonal corollary. **Explicitly denied:** the converse — equal det/trace does
  **not** imply similarity, and the lesson must supply a counterexample.
- **Proof depth (D6):** similarity theorem derived in a revealed layer;
  determinant invariance derived from L7; trace invariance stated. Learner proof
  construction offered unscored.
- **Representations (D4):** two grids over one unmoved arrow (visual); `[x]_B`
  and `P⁻¹AP` (symbolic); numeric; verbal ("same object, different name").
- **Translations:** arrow ↔ vector; grid ↔ basis; readout ↔ coordinates;
  identical deformation + different matrix ↔ similarity.
- **Edge/degenerate cases (D7):** `B = E` (P = I, nothing changes); a basis that
  is neither orthogonal nor unit length (the default case, used deliberately);
  the eigenbasis (diagonal result); two matrices with equal determinant that are
  **not** similar (the denied converse).
- **Misconceptions (D13):** (1) the vector changes; (2) `[A]_B = PAP⁻¹`;
  (3) equal det/trace ⇒ similar; (4) the new basis must be orthonormal.

## 1d. Outcomes with evidence

| Outcome | Dim | Owner | Level | Evidence | Attainment |
| --- | --- | --- | --- | --- | --- |
| Produce `[x]_B` for a fresh vector and basis, and verify by rebuilding `x` | D3/D4 | lesson | E3 | `cob-coordinates-fresh` (`exercise-sequence`) | independently demonstrated |
| Say which of `P`, `P⁻¹` converts in which direction, justified from `P`'s columns rather than recalled | D2/D13 | lesson | E3 | `cob-direction` | independently demonstrated |
| Produce `[A]_B = P⁻¹AP` for a fresh basis | D3 | lesson | E3 | `cob-matrix-in-basis-fresh` (`matrix-entry`) | independently demonstrated |
| Show the diagonal result in an eigenbasis, and read off what it means | D4/D10 | lesson | E3 | `cob-diagonalizes` (`exercise-sequence`) | independently demonstrated |
| State which quantities survive a change of basis, and which do not | D5 | lesson | E3 | `cob-invariants` | independently demonstrated |
| Reject the converse: equal determinant does not imply similar | D7/D13 | lesson | E4 | `cob-converse-false` | independently demonstrated |
| Explain that the vector does not move | D13 | lesson | E3 | `cob-vector-unmoved` | independently demonstrated |
| Derive `[A]_B = P⁻¹AP` | D6 | lesson | E6 *(unscored)* | `cob-derive-similarity` (`self-check`) | **practiced**; P3 credit at Gate 9 → [`mod-struct-derive-similarity`](../../modules/structure/assessment-plan.md), built, not administered |
| Integrate change of basis with rank and determinants on a later mixed item | D10 | **module** | E5 | [`mod-struct-cob-matrix-fresh` + `mod-struct-derive-similarity`](../../modules/structure/assessment-plan.md) | **built, not administered** — Gate 9 open |
| Retain the direction convention under delayed retrieval | D12 | **module** | E3 | [`mod-struct-retain-p-direction`](../../modules/structure/assessment-plan.md) | **built at E1, not administered** |

**Transfer:** the lesson owns one D9 outcome (`cob-converse-false`).

## 1e. Coverage status
Taught: all of §1c. Practiced: every lesson-owned outcome. Independently
demonstrated: all except `cob-derive-similarity`, recorded honestly as *practiced*.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** L1's exact numbers reused so the arithmetic is familiar
  and only the interpretation is new; L6's inverse and composition order reused
  to read the sandwich; L7's multiplicativity used to prove det invariance;
  L9's rank invariance cited.
- **Assessment:** 2 check, 4 drill, 4 transfer; recall capped at one; every graded
  item uses a basis or matrix the scene does not animate, except the
  diagonalization item, whose *point* is that it is L11's matrix.
- **Retention (D12):** the direction convention and the denied converse.
- **Forward:** L11 (diagonalization; eigenvalues are basis-independent by §6g),
  L14 (SVD as two basis changes around a diagonal action).

## 1g. Correctness & scope
- **Correctness checks:** every coordinate vector, `P`, `P⁻¹`, and `[A]_B` comes
  from `src/math/changeOfBasis.ts`. Property tests: `P[x]_B = x` round-trips;
  `[A]_B [x]_B = [A x]_B` on random vectors; `det`, `rank`, `nullity` and trace
  are invariant under similarity; the eigenbasis really does diagonalize; a
  **non-similar pair with equal determinant** exists (the denied converse,
  asserted); `B = E` gives `P = I`; a singular "basis" is rejected rather than
  silently inverted.
- **Scope exclusions:** orthonormal bases and `P⁻¹ = Pᵀ` (L12); abstract vector
  spaces; Jordan form; the decision of *whether* a matrix is diagonalizable (set
  up here, decided in L11 using L9's geometric multiplicity).
- **Abstraction return:** the R² examples are deliberate continuity with L1, and
  this lesson's content is basis choice rather than dimension, so no new
  dimensional deferral is incurred. The `structure` module assessment still owns
  n-dimensional drill.

## 6. Acceptance record (Gate 8)
- [x] Insight contract linked and `PASS`.
- [x] All §1 fields filled; upstream linked, not restated.
- [x] Outcomes operational, owner-marked, evidence-paired.
- [x] Lesson-owned core outcomes independently demonstrated, with the recorded
      exception (proof construction).
- [x] Module-owned outcomes recorded as Gate-9 obligations.
- [x] Assessment matches §3c; recall capped; one transfer item for one D9 outcome.
- [x] Backward bridge (L1/L6/L7/L9) + forward edge (L11/L14).
- [x] Retention hook recorded.
- [x] Correctness gate passed (`src/math/__tests__/changeOfBasis.test.ts`).
- [x] No rejection condition; no guardrail tripped.
- [x] **Profile honesty:** P3 proof bar prepared, not claimed.
