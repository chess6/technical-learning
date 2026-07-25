# Lesson Mastery Contract — Eigenvectors, Eigenvalues & Diagonalization (L11)

Gate 5 artifact, written **retrospectively** for a lesson that was built before
the gate existed and has now been expanded from an intro to the full spine node.

## 0. Insight provenance (honest note)

There is no Stage 1–2 artifact for this lesson, and this contract does not invent
one. The lesson was built early, and its organizing insight — *some directions a
map only scales, and they are found by asking which \(\lambda\) makes
\(A - \lambda I\) collapse* — is inherited from the
[spine's L11 row](../../course-spine.md#2-the-spine-at-a-glance) and from the
built lesson itself. Both are already validated by the lesson's own guided
derivation.

What this expansion adds is **coverage the spine row always promised and the
lesson did not deliver**: the row reads "Eigenvectors **& diagonalization**", and
until now the lesson stopped before diagonalization. So this contract governs the
expansion, not a re-derivation of the insight. If the insight itself is ever
reopened, Gates 3–4 must be run properly rather than back-filled.

## 1a. Placement & upstream links
- **Spine:** L11, unit `spectra-geometry-data`; last built lesson of the course.
- **Profile:** P2. This unit carries **no P3 override**, so proof *construction*
  is not owed; derivations are shown for every stated result.
- **Concepts introduced:** `eigenvector`, `eigenvalue`, `eigenspace`,
  `diagonalization`. **Reused:** `linear-transformation`, `matrix-columns`,
  `determinant`, `null-space`, `rank`, `nullity`, `rank-nullity`, `basis`,
  `coordinates`, `change-of-basis`, `invertibility`, `matrix-composition`.

## 1b. Role, bridge, need
- **Role:** the payoff of the structural core. L8 gave the eigenspace an
  identity, L9 gave it a dimension, L10 gave the basis change — this lesson
  spends all three.
- **Retrieve:** \(\det = 0\) as collapse (L7); \(\operatorname{Null}(A-\lambda I)\)
  as a subspace (L8); geometric multiplicity via rank–nullity (L9);
  \([A]_B = P^{-1}AP\) (L10); \(P^{-1}P = I\) and associativity (L6).
- **Bridge from L10:** L10 closed on "in a basis of directions the map only
  scales, the description is diagonal — and finding those directions is the next
  lesson's business." This lesson is that hunt, and then the factorization.
- **Motivating need:** are there directions a map stretches without turning — and
  if you collect enough of them, what does the map look like in their language?

## 1c. Content to teach
- **Definitions (D2):** eigenvector (nonzero), eigenvalue, eigenspace as
  \(\operatorname{Null}(A-\lambda I)\); algebraic and geometric multiplicity;
  diagonalizable; defective.
- **Procedures (D3):** compute eigenvalues from the characteristic equation;
  compute an eigenspace; **assemble \(P\) and \(D\) and verify \(A = PDP^{-1}\)**;
  **compute \(A^k\) via \(PD^kP^{-1}\)**; **apply the criterion before factoring**.
  Graded intermediates: each eigenvector, the \((1,1)\) entry of \(D\) (which
  pins the column/diagonal pairing), and \(\operatorname{rank}(A-\lambda I)\).
- **Results (D5):** \(\lambda\) is an eigenvalue \(\iff \det(A-\lambda I)=0\);
  \(1 \le \text{geometric} \le \text{algebraic}\); diagonalizable \(\iff\)
  geometric multiplicities sum to \(n\), with distinct eigenvalues sufficing;
  \(A^k = PD^kP^{-1}\). Non-uniqueness of \(P, D\) stated as a trap.
- **Proof depth (D6, P2):** derivations shown for the characteristic equation
  (as a chain of already-proved equivalences), for \(AP = PD\), for the
  independence of eigenvectors with distinct eigenvalues, and for the cancellation
  in \(A^k\). No learner proof construction is demanded.
- **Edge/degenerate cases (D7):** distinct real; **defective** (repeated with a
  deficient eigenspace); **scalar** \(\lambda I\); **no real eigenvalues**
  (rotation); a **singular but diagonalizable** matrix; an **invertible but
  defective** matrix.
- **Misconceptions (D13):** (1) eigenvectors live on the axes; (2) same line
  means same direction; (3) a repeated eigenvalue gives two eigendirections;
  (4) a singular matrix cannot be diagonalized; (5) algebraic multiplicity *is*
  geometric multiplicity.

## 1d. Outcomes with evidence

| Outcome | Dim | Owner | Level | Evidence | Attainment |
| --- | --- | --- | --- | --- | --- |
| Compute eigenvalues and one eigenvector for a fresh matrix | D3 | lesson | E3 | `eigen-drill-lambdas`, `eigen-drill-vector`, `eigen-build-pd-fresh` | independently demonstrated |
| Compute a geometric multiplicity as \(n-\operatorname{rank}(A-\lambda I)\) | D3/D10 | lesson | E3 | `eigen-geometric-multiplicity` | independently demonstrated |
| Assemble \(P\) and \(D\) on a fresh matrix, with the column/diagonal pairing correct | D3 | lesson | E3 | `eigen-build-pd-fresh` (`exercise-sequence`) | independently demonstrated |
| Use \(A^k = PD^kP^{-1}\) | D3 | lesson | E3 | `eigen-power-shortcut` | independently demonstrated |
| Apply the criterion **before** attempting a factorization | D8/D9 | lesson | E4 | `eigen-criterion-before-factoring` (`exercise-sequence`) | independently demonstrated |
| Distinguish the two failure modes | D7/D13 | lesson | E3 | `eigen-two-failure-modes` | independently demonstrated |
| Separate diagonalizability from invertibility | D13 | lesson | E3 | `eigen-diagonalizable-vs-invertible` | independently demonstrated |
| Identify the diagonal description as a change of basis | D10 | lesson | E3 | `eigen-diagonalization-is-change-of-basis` | independently demonstrated |
| Interpret \(\lambda\) sign/magnitude geometrically | D1 | lesson | E1–E3 | `eigen-check-reverse`, `eigen-drag` | independently demonstrated |
| Integrate eigen-machinery with rank and determinants on a later mixed item | D10 | **module** | E5 | `spectra-geometry-data` module set | Gate 9 |
| Retain the criterion under delayed retrieval | D12 | **module** | E3 | spaced retrieval | Gate 9 |

**Transfer:** the lesson owns one D9 outcome (`eigen-criterion-before-factoring`).

## 1e. Coverage status
Taught: all of §1c. Practiced and **independently demonstrated**: every
lesson-owned outcome above. No outcome is left at "taught".

## 1f. Connections, assessment, retention
- **Cumulative (D10):** the characteristic equation is derived as a chain of L6,
  L7 and L8 equivalences; the geometric multiplicity is L9 applied to a shifted
  matrix; diagonalization is L10's \(P^{-1}AP\) with an adapted basis.
- **Assessment:** 3 check, 5 drill, 6 transfer (14 items). Recall capped at one.
  Fresh matrices are used for the diagonalization drill and the criterion item;
  the scene's matrix is reused only where the *point* is continuity.
- **Retention (D12):** the diagonalizability criterion and the
  algebraic-vs-geometric distinction.
- **Forward:** complex eigenvalues; near-diagonal normal forms for defective
  matrices; and the SVD, which applies to every matrix at the cost of two bases.
  All named in a `looking-ahead` layer, none claimed as taught.

## 1g. Correctness & scope
- **Correctness checks:** every eigenvalue, multiplicity, \(P\), \(D\), and power
  asserted in prose or grading is derived from `src/math`
  (`analyzeEigen2x2`, `eigenvalueMultiplicities2x2`, `diagonalize2x2`,
  `matrixPower2x2`). Property tests in
  `src/math/__tests__/diagonalization.test.ts` assert: \(PDP^{-1}\) reconstructs
  \(A\); \(P\)'s columns are genuine eigenpairs; \(A^k = PD^kP^{-1}\) agrees with
  repeated multiplication; failure is reported as **defective** vs **no real
  eigenvalues** rather than as a bare null; geometric \(\le\) algebraic
  throughout; and a singular matrix diagonalizes while a defective invertible one
  does not.
- **Scope exclusions:** no complex arithmetic (stated only); no Jordan form; no
  symmetric/orthogonal spectral theorem (needs L12); no \(3\times3\) hand
  computation beyond the existing curated extension; no numerical eigenvalue
  algorithms.
- **No new platform capability** is introduced; the expansion composes existing
  exercise capabilities only.

## 6. Acceptance record (Gate 8)
- [x] Insight provenance recorded honestly (§0) rather than back-filled.
- [x] Every §1 field filled.
- [x] Outcomes operational, owner-marked, evidence-paired.
- [x] Every lesson-owned core outcome independently demonstrated in-lesson.
- [x] Module-owned outcomes recorded as Gate-9 obligations.
- [x] Assessment matches §3c; recall capped; one transfer item per D9 outcome.
- [x] Backward bridges (L6–L10) + forward edge; ≥1 cumulative item.
- [x] Retention hook recorded.
- [x] Correctness gate passed.
- [x] No rejection condition; no anti-over-reaction guardrail tripped (P2 owes no
      proof construction, and none is demanded).
- [x] Pre-existing exercise ids preserved, so learner state is not orphaned.
