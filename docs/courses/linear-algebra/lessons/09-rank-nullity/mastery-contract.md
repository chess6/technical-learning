# Lesson Mastery Contract — Dimension & Rank–Nullity (L9)

Gate 5 for **L9 `rank-nullity`**, after [insight.md](insight.md) reached `PASS`.

## 1a. Placement & upstream links
- **Spine:** L9, unit `structure`, between L8 and L10.
- **Profile:** P2 primary with the module's **P3 override**. The theorem is
  **proved in the lesson body** (a P3 obligation the course can actually meet in
  prose); learner proof *construction* is offered as an unscored `self-check`
  surface, so — as in L8 — the P3 bar is **prepared, not claimed**. Gate 9 owns it.
- **Insight contract:** [insight.md](insight.md) — `PASS`.
- **Concepts introduced:** `dimension`, `nullity`, `rank-nullity`.
  **Reused:** `rank`, `column-space`, `null-space`, `basis`, `pivot`,
  `free-variable`, `consistency`, `invertibility`.

## 1b. Role, bridge, need
- **Role:** turns L8's observation into a law with a mechanism, and converts it
  into predictions — including the ones L11 will need.
- **Retrieve:** basis/span and basis extension (L1); free variables (L4);
  \(\operatorname{Col}\), \(\operatorname{Null}\), rank, and the pivot/free
  observation (L8).
- **Bridge from L8:** L8 closed by *observing* \(\operatorname{rank}+\operatorname{nullity}=n\)
  and promising a reason. L9 opens by pointing out that a fact about *how we write
  the matrix down* could not possibly forbid a map from existing — so the identity
  must be more than bookkeeping.
- **Motivating need:** *Can a map from \(\mathbb{R}^3\) to \(\mathbb{R}^2\) be
  one-to-one? Answer it without trying examples.*

## 1c. Content to teach
- **Definitions (D2):** \(\dim V\); **nullity**; one-to-one (injective) and onto
  (surjective) for a linear map, in the language of the two spaces.
- **Objects:** a basis of \(\operatorname{Null}(A)\) extended to a basis of
  \(\mathbb{R}^n\); the image basis \(\{A\mathbf{w}_j\}\); a wide map
  (\(2\times3\)) and a tall map (\(3\times2\)).
- **Procedures (D3):** produce one count from the other; produce
  \(\operatorname{rank}\) bounds from \(m,n\); compute a geometric multiplicity as
  \(n-\operatorname{rank}(A-\lambda I)\). Graded intermediates: the *nullity* and
  the *bound*, not only a final yes/no.
- **Results (D5):** the theorem, with proof; \(\operatorname{rank}\le\min(m,n)\);
  \(n>m\Rightarrow\) not one-to-one; \(n<m\Rightarrow\) not onto; square:
  one-to-one \(\iff\) onto \(\iff\) invertible. Stated-not-proved (`reference`):
  every basis of a space has the same size.
- **Proof depth (D6):** the theorem's proof is **shown in full** in a revealed
  layer, with both spanning and independence, and with the basis-extension choice
  flagged as a choice. Learner construction offered unscored.
- **Representations (D4):** ledger (visual), symbolic, numerical, verbal.
- **Translations:** ledger posting ↔ basis vector; \(m\) vs \(n\) ↔ ceiling vs
  budget; impossibility claim ↔ inequality.
- **Edge/degenerate cases (D7):** wide and tall maps (the whole point); the zero
  map (nullity \(n\)); an invertible square map (nullity 0); a square map that is
  neither one-to-one nor onto.
- **Misconceptions (D13):** (1) the total is \(m\); (2) one-to-one \(\iff\) onto
  in general; (3) \(\mathbb{R}^n\) decomposes into the two spaces; (4) "it is just
  counting columns, so it has no content".

## 1d. Outcomes with evidence

| Outcome | Dim | Owner | Level | Evidence | Attainment |
| --- | --- | --- | --- | --- | --- |
| State the law with \(n\) — the **input** dimension — on the right, and say why it is not \(m\) | D2/D13 | lesson | E3 | `rn-which-total`, `rn-wide-ledger` | independently demonstrated |
| Produce nullity from rank (and conversely) on fresh square **and** non-square maps | D3 | lesson | E3 | `rn-complete-ledger-fresh` (`exercise-sequence`) | independently demonstrated |
| Decide, with no computation, that a described map cannot be one-to-one / onto, and justify from the law | D9 | lesson | E4 | `rn-impossible-map` | independently demonstrated |
| Explain why one-to-one ⟺ onto holds for square maps and fails otherwise | D5/D13 | lesson | E3 | `rn-square-only` | independently demonstrated |
| Produce a geometric multiplicity as \(n - \operatorname{rank}(A-\lambda I)\) | D3/D10 | lesson | E3 | `rn-eigen-multiplicity` (`exercise-sequence`) | independently demonstrated |
| Reject the false decomposition claim | D13 | lesson | E3 | `rn-not-a-decomposition` | independently demonstrated |
| Construct the rank–nullity proof | D6 | lesson | E6 *(unscored)* | `rn-prove-theorem` (`self-check`) | **practiced**; P3 credit at Gate 9 |
| Integrate rank–nullity with determinants and eigen-multiplicity on a later mixed item | D10 | **module** | E5 | `structure` module set | Gate 9 |
| Retain "the total is \(n\)" under delayed retrieval | D12 | **module** | E3 | spaced retrieval | Gate 9 |

**Transfer:** the lesson owns exactly one D9 outcome (`rn-impossible-map`).

## 1e. Coverage status
Taught: all of §1c. Practiced: all lesson-owned outcomes. Independently
demonstrated: all except `rn-prove-theorem`, honestly recorded as *practiced*.

## 1f. Connections, assessment, retention
- **Cumulative (D10):** L3's trichotomy re-derived structurally; L6's equivalence
  list explained (and scoped to square); L8's observation proved;
  `rn-eigen-multiplicity` reaches forward into L11's material using only L8+L9.
- **Assessment:** 2 check, 4 drill, 4 transfer. Every graded item uses a matrix
  the scene does not animate; **at least three use non-square maps**, since the
  square case cannot exercise the law's real content.
- **Retention (D12):** "the total is \(n\)" and the square-only scope.
- **Forward:** L10 (change of basis preserves rank), L11 (geometric multiplicity),
  L13 (full column rank), L14 (rank = number of nonzero singular values).

## 1g. Correctness & scope
- **Correctness checks:** every rank/nullity in prose, scene, explorer and grading
  comes from `src/math` (`rankOf`, `nullityOf`, `rankNullityCount`). Property
  tests: the identity holds on a battery including wide, tall, square, zero and
  full-rank maps; \(\operatorname{rank}\le\min(m,n)\); the injective/surjective
  characterisations agree with the counts; geometric multiplicity of a curated
  defective matrix equals \(n-\operatorname{rank}(A-\lambda I)\) and is **less
  than** its algebraic multiplicity (the case L11 needs).
- **Scope exclusions:** well-definedness of dimension stated not proved; no
  quotient spaces or the first isomorphism theorem; \(\operatorname{rank}(AB)\)
  bounds mentioned only; no infinite dimensions.
- **Abstraction return:** already discharged by L8 (leaving \(\mathbb{R}^2\)); L9
  extends it to non-square maps, which is where the law has content. Remaining
  deferral: genuinely \(n\)-dimensional drill → `structure` module assessment.

## 6. Acceptance record (Gate 8)
- [x] Insight contract linked and `PASS`.
- [x] All §1 fields filled; upstream linked.
- [x] Outcomes operational, owner-marked, evidence-paired.
- [x] Lesson-owned core outcomes independently demonstrated, with the single
      recorded exception (proof construction).
- [x] Module-owned outcomes recorded as Gate-9 obligations.
- [x] Assessment matches §3c; recall capped; one transfer item for one D9 outcome;
      non-square maps used in graded items.
- [x] Backward bridge (L1/L4/L8) + forward edge (L10/L11/L13/L14).
- [x] Retention hook recorded.
- [x] Correctness gate passed (`src/math/__tests__/rankNullity.test.ts`).
- [x] No rejection condition; no guardrail tripped.
- [x] **Profile honesty:** P3 proof bar prepared, not claimed.
