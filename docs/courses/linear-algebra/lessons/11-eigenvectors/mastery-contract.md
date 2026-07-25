# Lesson Mastery Contract — Eigenvectors, Eigenvalues & Diagonalization (L11)

Gate 5 artifact, written **retrospectively** for a lesson that was built before
the gate existed and has now been expanded from an intro to the full spine node.
Its Gates 3–4 are [insight-brief.md](insight-brief.md) and
[insight.md](insight.md) (`Gate result: PASS`), also run retrospectively — see
[§0](#0-insight-provenance-gates-34-now-run). **The Gate 8 acceptance record in
[§6](#6-acceptance-record-gate-8--corrected-not-passed) is NOT PASSED**; read it
before citing this lesson's evidence anywhere.

## 0. Insight provenance (Gates 3–4 now run)

**The Stage 1–2 debt this section used to record is discharged.** An earlier
version of this contract said "there is no Stage 1–2 artifact for this lesson";
Gates 3 and 4 have since been run properly, retrospectively and labelled as such:

- Stage 1 → [insight-brief.md](insight-brief.md) — the obstacle diagnosed, twelve
  leads, four candidate packages, and a ranking in which the spine's own one-liner
  competed as an **inherited hypothesis** rather than being assumed.
- Stage 2 → [insight.md](insight.md) — `Gate result: PASS`. The audit
  **ratifies** the built lesson's organizing insight (package PB: *a matrix's
  mixing is scaling in the wrong coordinates*, with the collapse search as its
  engine).

The audit was not a rubber stamp. It returned three findings, all carried into
this contract rather than left in the insight document:

| Finding | Where | Consequence here |
| --- | --- | --- |
| "\(n\) distinct real eigenvalues suffice" is derived for \(n=2\) and **stated** in general | [insight.md Audit A ch. 2](insight.md#mathematical-audit-audit-a) | §1c D6 no longer claims a derivation for every stated result |
| geometric \(\le\) algebraic is **stated with no derivation anywhere** | same | §1c D6 lists it as stated-not-derived |
| the abstraction return's transfer/symbolic steps are **prepared, not evidenced** | [insight.md §14 / Audit B6](insight.md#14-abstraction-return) | §1d evidence levels recalibrated; §6 acceptance record corrected |

The expansion this contract governs remains what it always was — the coverage the
spine row promised (diagonalization, multiplicities, powers, the criterion, the
two failure modes). What has changed is that the insight underneath it is now
gated instead of inherited, and that the evidence claims below are stated at the
level the built items actually support.

## 1a. Placement & upstream links
- **Spine:** L11, unit `spectra-geometry-data`; last built lesson of the course.
  **Not** part of the `structure` module (L8–L10), so its module-owned rows are
  discharged by `spectra-geometry-data`'s Gate 9, which does not yet exist.
- **Insight contract:** [insight.md](insight.md) — `PASS` (retrospective).
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
  cancellation in \(A^k\), and for the independence of eigenvectors with distinct
  eigenvalues **in the \(n=2\) case**. No learner proof construction is demanded.
  **Stated without derivation** (recorded rather than implied): geometric
  \(\le\) algebraic, and independence for distinct eigenvalues **beyond two
  vectors**. Both are legitimate P2 scope choices — P2 owes a derivation only
  where a proof is in scope — but the earlier wording ("derivations are shown for
  every stated result") was false and is withdrawn.
- **Edge/degenerate cases (D7):** distinct real; **defective** (repeated with a
  deficient eigenspace); **scalar** \(\lambda I\); **no real eigenvalues**
  (rotation); a **singular but diagonalizable** matrix; an **invertible but
  defective** matrix.
- **Misconceptions (D13):** (1) eigenvectors live on the axes; (2) same line
  means same direction; (3) a repeated eigenvalue gives two eigendirections;
  (4) a singular matrix cannot be diagonalized; (5) algebraic multiplicity *is*
  geometric multiplicity.

## 1d. Outcomes with evidence

**Recalibrated 2026-07-25.** The levels below are re-derived from two things the
earlier table ignored: the **capability evidence ceilings**
([`src/lessons/evidence.ts`](../../../../../src/lessons/evidence.ts) — a
multiple-choice picker records at most **E2** however it is authored; a scaffolded
`exercise-sequence` at most **E3**), and whether each item's instance is **fresh**
or a lesson fixture. "Independently demonstrated" means what the
[template](../../../../authoring/templates/lesson-mastery-contract.md#1e-coverage-status-classification)
says it means — *unaided, fresh-instance, E3+* — not "the learner answered
something about it".

| Outcome | Dim | Owner | Level (evidenced) | Evidence | Attainment |
| --- | --- | --- | --- | --- | --- |
| Produce an eigenvector for a **fresh** matrix by solving \((A-\lambda I)\mathbf{v}=\mathbf{0}\) | D3 | lesson | **E3** | `eigen-build-pd-fresh` steps 1–2 (`vector`, fresh \(\begin{bmatrix}4&2\\1&3\end{bmatrix}\)) | **independently demonstrated** *(λ supplied; first coordinate pinned)* |
| Pair \(D\)'s diagonal with \(P\)'s columns in the right order, on a fresh matrix | D3 | lesson | **E3** | `eigen-build-pd-fresh` step 3 (`numeric`, fresh) | **independently demonstrated** *(P is handed over; **assembling** P is not evidenced)* |
| Compute eigenvalues from \(\det(A-\lambda I)=0\) | D3 | lesson | **E2** | `eigen-drill-lambdas` — the lesson's **own** animated matrix | practiced |
| Compute a geometric multiplicity as \(n-\operatorname{rank}(A-\lambda I)\) | D3/D10 | lesson | **E2** | `eigen-geometric-multiplicity` — both matrices are lesson fixtures (`wex-defective`, the `algebraic-is-geometric` callout) | practiced |
| Use \(A^k = PD^kP^{-1}\) | D3 | lesson | **E2** | `eigen-power-shortcut` — lesson's own \(A\), with \(D\) supplied | practiced |
| Apply the criterion **before** attempting a factorization | D8/D9 | lesson | **E2** ~~E4~~ | `eigen-criterion-before-factoring` | practiced — **the E4 claim is withdrawn** (see below) |
| Distinguish the two failure modes | D7/D13 | lesson | **E2** | `eigen-two-failure-modes` (multiple-choice, lesson fixtures) | practiced |
| Separate diagonalizability from invertibility | D13 | lesson | **E2** | `eigen-diagonalizable-vs-invertible` (multiple-choice, callout matrices) | practiced |
| Identify the diagonal description as a change of basis | D10 | lesson | **E2** | `eigen-diagonalization-is-change-of-basis` (multiple-choice, lesson's own \(A\)) | practiced |
| Recognize that a rotation has no real eigendirection | D7 | lesson | **E2** | `eigen-transfer-real` (multiple-choice) | practiced |
| Interpret \(\lambda\) sign/magnitude geometrically | D1 | lesson | **E1–E2** | `eigen-check-reverse` (MC), `eigen-drag` (`prediction` — records no answer) | practiced |
| Integrate eigen-machinery with rank and determinants on a later mixed item | D10 | **module** | E5 | `spectra-geometry-data` module set | planned — Gate 9 |
| Retain the criterion under delayed retrieval | D12 | **module** | E3 | spaced retrieval | planned — Gate 9 |

### Why the E4 claim on `eigen-criterion-before-factoring` does not stand

The item was claimed as the lesson's one D9 transfer outcome at **E4** ("applies
the idea in an unfamiliar representation or context, technique unnamed"). Four
things independently contradict that:

1. **Capability ceiling.** It is an `exercise-sequence`, whose ceiling is **E3** —
   progressive reveal caps transfer by construction. An E4 claim was above the
   ceiling the repository's own model enforces on module items.
2. **The technique is named, twice.** The prompt supplies the characteristic
   polynomial \((7-\lambda)^2\) and then hands over \(A-7I\) already computed. The
   learner is not selecting a method; they are executing a named one.
3. **The decisive step is recognition.** The final step is multiple-choice, and
   the correct option *states the reasoning* ("the geometric multiplicity is
   \(2-1=1<2\), so there is no basis of eigenvectors"). Multiple choice is E2 at
   best, and it is never the right form for the decisive object.
4. **The instance is a near-copy.** \(\begin{bmatrix}7&1\\0&7\end{bmatrix}\) is
   `wex-defective`'s \(\begin{bmatrix}3&1\\0&3\end{bmatrix}\) with one number
   changed — the same shape, the same rank, the same answer.

Honest level: **E2**. The produced rank step is real work, but on a near-copy, and
the judgement it is supposed to evidence is handed to the learner as a menu.

### What is therefore owed, and by whom

- **The lesson owns no E4 evidence at all.** All five transfer-tier items are
  multiple-choice or scaffolded sequences; the lesson's ceiling as built is **E3**,
  reached on exactly two outcomes. Rejection condition
  [#8](../../../../authoring/templates/lesson-mastery-contract.md#5-rejection-conditions-the-mastery-gate)
  (a lesson-owned core outcome that never reaches "independently demonstrated")
  therefore fires for the seven rows marked *practiced*.
- **Owner and destination for the unmet D9 transfer obligation:** an unscaffolded
  item on an **unfamiliar** matrix that asks for the diagonalizability verdict and
  the failure mode **without** naming the criterion, supplying the polynomial, or
  offering choices. Two admissible routes: (a) a lesson revision (Mode C on L11 —
  needs explicit approval, since it changes the built surface), or (b) the
  `spectra-geometry-data` module's Gate 9 set, where it would be **module-owned**
  and would *not* repair the lesson's own Gate 8. Route (a) is the correct one;
  route (b) cannot substitute for it. **Neither is built.**
- **Not owed:** proof construction (P2, no P3 override on this unit) — the
  anti-over-reaction guardrail explicitly forbids demanding it here.

## 1e. Coverage status

**Taught:** all of §1c — every definition, procedure, result, edge case and
misconception in the content plan is presented in the lesson body, and nothing is
left at "taught" only.

**Practiced:** all eleven lesson-owned outcomes — each has ≥1 graded attempt with
feedback under commit-before-reveal.

**Independently demonstrated:** **2 of 11** (eigenvector production on a fresh
matrix; the column/diagonal pairing on a fresh matrix). The other nine stall at
*practiced* because their evidence is either a multiple-choice picker (E2 ceiling)
or a produced item on a matrix the lesson already animated.

The gap between the required level and the reached level is the finding, and it is
stated here rather than averaged away: **this is a coverage gap, not a wording
problem.** The instruction is not what is deficient — the lesson teaches all of
§1c well and its derivations are sound. What is deficient is the *evidence
ecology*: it leans on recognition items and on its own fixtures.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** the characteristic equation is derived as a chain of L6,
  L7 and L8 equivalences; the geometric multiplicity is L9 applied to a shifted
  matrix; diagonalization is L10's \(P^{-1}AP\) with an adapted basis.
- **Assessment (corrected count):** **12 graded exercises — 2 check, 5 drill,
  5 transfer** — plus 2 checkpoints and 4 worked examples. (The earlier "3 check,
  5 drill, 6 transfer (14 items)" counted the checkpoints as exercises and
  miscounted the transfer tier.) Exactly **one** item uses a fresh matrix
  (`eigen-build-pd-fresh`); the criterion item's matrix is a one-number variant of
  a worked example, and every other item reuses a lesson fixture. That
  concentration is what §1d's recalibration reflects, and it is close to rejection
  condition #7 (*assessment repeats instruction*) — it escapes only because the
  fresh-matrix drill exists.
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

## 6. Acceptance record (Gate 8) — **corrected: NOT PASSED**

This record previously showed every box ticked. Against the recalibrated §1d it
does not, and the honest state is recorded rather than the flattering one.

- [x] Insight provenance gated, not back-filled — Gates 3–4 run (§0).
- [x] Every §1 field filled.
- [x] Outcomes operational, owner-marked, evidence-paired.
- [ ] **Every lesson-owned core outcome independently demonstrated in-lesson** —
      **2 of 11** (§1e). Rejection condition #8 fires.
- [x] Module-owned outcomes recorded as Gate-9 obligations (and not counted here).
- [ ] **One transfer item per D9 outcome** — the lesson's single D9 outcome is
      evidenced at E2, not E4 (§1d). The obligation has an owner and a
      destination; it is not discharged.
- [x] Backward bridges (L6–L10) + forward edge; ≥1 cumulative item.
- [x] Retention hook recorded.
- [x] Correctness gate passed — every eigenvalue, multiplicity, \(P\), \(D\) and
      power re-verified against `src/math` and by hand during the Stage 2 audit.
- [ ] **No rejection condition** — #8 fires (above), and #7 (*assessment repeats
      instruction*) is narrowly avoided. No anti-over-reaction guardrail is
      tripped: P2 owes no proof construction and none is demanded, and the lesson
      is not being faulted for its representation or its scope.
- [x] Pre-existing exercise ids preserved, so learner state is not orphaned.

**Verdict: Gate 8 NOT PASSED for L11.** The lesson is *shipped, taught well, and
mathematically sound*; what it lacks is evidence at the level its outcomes
require. Clearing the gate needs unscaffolded, fresh-instance items for the seven
*practiced* outcomes and one genuine E4 transfer item — a **Mode C revision of a
built lesson, which requires explicit approval** and is deliberately not performed
under this recalibration.

**Downstream:** no "module mastered", "exam ready" or E4-transfer claim may cite
L11 until those items exist and are answered. The spine, benchmark matrix and the
`spectra-geometry-data` module inherit this status.
