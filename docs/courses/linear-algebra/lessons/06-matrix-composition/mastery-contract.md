# Lesson Mastery Contract — Matrix Composition & Inverses (L6)

Gate 5 for spine node **L6 `matrix-composition`**. Completed against the
[Lesson Mastery Contract template](../../../../authoring/templates/lesson-mastery-contract.md)
after [insight.md](insight.md) reached `Gate result: PASS`.

---

## 1a. Placement & upstream links

- **Lesson / spine position:** L6 `matrix-composition` — see the
  [spine row](../../course-spine.md#2-the-spine-at-a-glance). Unit
  `maps-inverses-determinants`, immediately before L7 `determinants`.
- **Core course profile in force:** **P2 — demanding applied**
  ([Gate 1 declaration](../../course-spine.md#0-declared-course-target-gate-1)).
  No per-lesson override. The unit is **not** one of the two P3-override modules,
  so proof *construction* is not owed; derivations are.
- **Research-bridge overlay?** No enrichment item is authored for this lesson.
- **Approved Insight Contract:** [insight.md](insight.md) — `PASS` confirmed.
  Primary insight linked, not copied.
- **Saved as:** `docs/courses/linear-algebra/lessons/06-matrix-composition/mastery-contract.md`.
- **Concept ids introduced:** `matrix-composition`, `invertibility`
  ([catalog §3](../../curriculum-architecture.md#3-concept-id-catalog)).
  **Reused:** `linear-transformation`, `matrix-columns`, `linear-system`,
  `column-picture`, `linear-independence`, `consistency`, `elimination`,
  `homogeneous-system` (as `Null(A)`), `solution-set`.

## 1b. Role, bridge, and need

- **Lesson role in the course:** closes the course's first real gap. It turns the
  matrix product from a recipe into a derived consequence of L2, promotes L5's
  uniqueness corollary from "one system" to "the map", and hands L7 a determinant
  the learner already *wants* (the number whose vanishing blocks the undo).
- **Prerequisite knowledge to retrieve:** (i) a matrix is where the basis lands,
  \(A\mathbf{e}_j=\operatorname{col}_j(A)\) (L2); (ii) \(A\mathbf{x}=\mathbf{b}\)
  and the column picture (L3); (iii) elimination / back-substitution (L4);
  (iv) unique solution \(\iff \operatorname{Null}(A)=\{\mathbf{0}\}\) (L5).
  Each is fired as a backward-bridge event in the section that needs it.
- **Bridge from the previous lesson:** L5 closed on *"a trivial null space means
  every consistent system has exactly one solution."* L6 opens by asking what that
  says about the **map** rather than about one system — and the answer is: the map
  can be undone.
- **Motivating problem / mathematical need:** *You apply one transformation, then
  another. Is the result a transformation you could have done in one step — and if
  so, which four numbers describe it?* Followed by: *and can you get back?*

## 1c. Content to teach (the coverage core)

- **Approved central insight:** [insight.md §Gate result](insight.md#gate-result) *(link only)*.
- **Required definitions & notation (D2):**
  - **product / composite** \(AB\), defined by \(\operatorname{col}_j(AB)=A\operatorname{col}_j(B)\),
    with the entrywise form \((AB)_{ij}=\sum_k A_{ik}B_{kj}\) as a derived consequence;
  - **identity matrix** \(I\) as the composition identity;
  - **invertible matrix** and **inverse** \(A^{-1}\): \(A^{-1}A=AA^{-1}=I\);
  - **singular** = not invertible;
  - notation discipline: \(AB\) means *apply \(B\) first*; \(\operatorname{col}_j(M)=M\mathbf{e}_j\).
- **Required mathematical objects:** a product matrix built column by column; an
  inverse matrix built as the two solutions of \(A\mathbf{x}=\mathbf{e}_j\); a
  singular matrix together with a nonzero null vector witnessing its collapse; a
  commuting pair (to bound the "order always matters" overclaim).
- **Procedures requiring fluency (D3):**
  1. **Compute a product column.** Method-specific intermediate graded:
     \(\operatorname{col}_j(AB)=A\operatorname{col}_j(B)\) *as a vector*, before any
     full \(2\times2\) answer is requested.
  2. **Build an inverse.** Method-specific intermediates graded: the two solutions
     of \(A\mathbf{x}=\mathbf{e}_1\) and \(A\mathbf{x}=\mathbf{e}_2\) (i.e. the
     inverse's columns), then the verification product \(AA^{-1}=I\).
  3. **Solve \(A\mathbf{x}=\mathbf{b}\) as \(A^{-1}\mathbf{b}\)** and reconcile with
     the elimination answer.
- **Theorems / propositions / corollaries / invariants (D5):**
  - *Definition + consequence:* \((AB)\mathbf{x}=A(B\mathbf{x})\) holds by construction.
  - *Proposition (algebra of composition):* \((AB)C=A(BC)\); \(IM=MI=M\);
    \(AB\ne BA\) **in general** (hypothesis-free counterexample supplied; commuting
    families named).
  - *Proposition (uniqueness of the inverse).*
  - *Theorem (invertibility criterion, \(2\times2\)):* invertible \(\iff\) columns
    independent \(\iff \operatorname{Null}(A)=\{\mathbf{0}\}\) \(\iff\) exactly one
    solution for every \(\mathbf{b}\) \(\iff ad-bc\ne0\); with the formula.
  - *Corollary (reversal):* \((AB)^{-1}=B^{-1}A^{-1}\).
- **Expected proof / justification depth (D6) — P2:** *derivation / "why it works"*
  for all of the above, plus **one full short proof** where it is two lines and
  load-bearing (uniqueness of the inverse; the reversal corollary). Specifically:
  - product definition — **derived** in the body (§6c–d of the contract);
  - non-commutativity — **counterexample**, with the scope caveat stated;
  - associativity — **derived from function composition**, not verified entrywise;
  - invertibility criterion — **derivation of both directions in a `revealed`
    layer**, including where each hypothesis is used (independence is used to get
    existence *and* uniqueness of the preimages; \(ad-bc\ne0\) is used to divide);
  - reversal — **two-line proof shown**.
  P3 proof *construction* is **not owed** (this unit carries no P3 override); one
  unscored `self-check` reasoning surface is offered but is not on the exam bar.
- **Required representations (D4):** visual (two maps applied in sequence to a
  tracked object; the basis path), symbolic (\(\operatorname{col}_j(AB)=A\operatorname{col}_j(B)\),
  the entry recipe, \(A^{-1}\)), numerical (the built examples), verbal ("apply
  \(B\), then \(A\)"; "undo").
- **Translations learners must perform (D4):**
  - picture → symbol: read \(\operatorname{col}_1(AB)\) off the endpoint of
    \(\mathbf{e}_1\)'s path;
  - symbol → picture: predict from two matrices whether the composite depends on order;
  - geometry → algebra: read "the plane collapsed onto a line" as
    \(\operatorname{Null}(A)\ne\{\mathbf{0}\}\) and as \(ad-bc=0\);
  - algebra → algebra: the entry recipe as the expansion of the column definition.
- **Examples, nonexamples, edge & degenerate cases (D7):**
  - main: \(A=\)`shear-2-1`\(=\begin{bmatrix}2&1\\0&1\end{bmatrix}\) with
    \(R=\)`rotation`\(=\begin{bmatrix}0&-1\\1&0\end{bmatrix}\) — \(AR\ne RA\), both invertible;
  - **nonexample (singular):** `singular-collapse`\(=\begin{bmatrix}2&4\\1&2\end{bmatrix}\)
    — nonzero yet not invertible; null vector \((2,-1)\) exhibited;
  - **degenerate:** \(A=\mathbf{0}\) (covered in the criterion's converse);
  - **boundary of the overclaim:** a commuting pair (\(I\), \(cI\), or \(A\) with
    \(A^2\)) so "order matters" is not over-generalized;
  - **conditioning caution (named, not developed):** `near-singular`
    \(\begin{bmatrix}1&1\\0.99&1\end{bmatrix}\) — invertible, but the inverse has huge entries.
- **Misconceptions & likely errors (D13 seed)** — each staged elicit→confront→resolve
  as an authored callout, placed where it arises:
  1. *"Multiply entrywise."* — placed immediately after the recipe is derived.
  2. *"\(AB\) applies \(A\) first."* — placed at the order section.
  3. *"Every nonzero matrix has an inverse / \(A^{-1}=1/A\)."* — placed at the
     singular case.
  4. *"\((AB)^{-1}=A^{-1}B^{-1}\)."* — placed at the reversal corollary.

## 1d. Outcomes, each paired with evidence

| Outcome (operational) | Dimension | Owner | Target level | Evidence item | Highest attainment required |
| --- | --- | --- | --- | --- | --- |
| Given \(A,B\), produce \(\operatorname{col}_j(AB)\) **as a vector** on a fresh pair, and state that it is \(A\) applied to \(B\)'s column \(j\) | D2/D3 | lesson | E3 | `comp-column-fresh` (vector) + `comp-column-meaning` (MC) | independently demonstrated |
| Produce **all four entries** of \(AB\) for a fresh pair without being given the recipe in the prompt | D3 | lesson | E3 | `comp-product-entries-fresh` (`matrix-entry`) | independently demonstrated |
| State which map is applied first in \(AB\), and use it correctly in a computation | D2/D13 | lesson | E3 | `comp-order-first` (MC) + used by `comp-product-entries-fresh` | independently demonstrated |
| Produce a numerical counterexample to \(AB=BA\), **and** produce a matrix that *does* commute with a given \(A\) (bounding the overclaim) | D7/D9 | lesson | E4 | `comp-noncommute-and-commute` (`exercise-sequence`) | independently demonstrated |
| Construct \(A^{-1}\) for a fresh invertible \(A\) by solving \(A\mathbf{x}=\mathbf{e}_j\), and verify \(AA^{-1}=I\) | D3 | lesson | E3 | `comp-build-inverse-fresh` (`exercise-sequence`, grades both columns then the verification) | independently demonstrated |
| Decide invertibility of a fresh matrix from **independence/collapse**, and produce the null vector that witnesses non-invertibility | D5/D7 | lesson | E3–E4 | `comp-singular-witness` (`construct-in-explorer`, predicate-graded) | independently demonstrated |
| Find the value of a parameter that makes a matrix singular | D3/D5 | lesson | E3 | `comp-singular-parameter` (numeric, fresh) | independently demonstrated |
| Invert a composite in the correct order | D5/D13 | lesson | E3 | `comp-reversal` (MC, fresh pair) | independently demonstrated |
| Solve \(A\mathbf{x}=\mathbf{b}\) via \(A^{-1}\mathbf{b}\) and reconcile with the elimination answer (D10 backward link) | D3/D10 | lesson | E3 | `comp-solve-with-inverse` (vector, reuses L3's system) | independently demonstrated |
| Explain **why no function at all** can undo a collapsing map | D6 | lesson | E6 *(unscored surface)* | `comp-justify-collapse` (`self-check` + model answer) | practiced *(not on the exam bar — P2, no P3 override)* |
| Integrate composition with determinants and with elimination on a mixed, later item | D10 | **module** | E5 | `maps-inverses-determinants` module set (Gate 9) | independently demonstrated at **Gate 9** |
| Retain the invertibility criterion under delayed retrieval | D12 | **module** | E3 | spaced retrieval in the module set (Gate 9) | independently demonstrated at **Gate 9** |

**Note on the D9/transfer obligation.** This lesson owns exactly one transfer
outcome (the commute/non-commute boundary item). It does **not** owe a second,
per the template's anti-over-reaction guardrail.

## 1e. Coverage-status classification

- **Taught:** every item in §1c.
- **Practiced:** all lesson-owned outcomes above, each with in-lesson feedback.
- **Independently demonstrated (the must-demonstrate set):** every lesson-owned
  outcome in §1d except `comp-justify-collapse`, which is deliberately an unscored
  reasoning surface (P2 owes no proof construction).
- **Enrichment:** none authored.

## 1f. Connections, assessment, retention

- **Cumulative connections (D10):**
  - **L2 fired in a new context** — the columns rule is *reused as the derivation
    engine*, not merely recalled (`comp-column-meaning`, and the whole scene).
  - **L5 fired in a new context** — the trivial-null-space corollary becomes the
    invertibility criterion (`comp-singular-witness`).
  - **L3/L4 fired in a new context** — L3's system re-solved with \(A^{-1}\) and
    reconciled against L4's elimination answer (`comp-solve-with-inverse`).
- **Assessment evidence (summary):** 2 check-tier (MC), 5 drill-tier (vector,
  `matrix-entry`, `exercise-sequence`, numeric), 4 transfer-tier (`exercise-sequence`,
  `construct-in-explorer`, MC, `self-check`). Pure recall is capped at **one**
  item (`comp-order-first`). No graded item re-runs the instructional interaction:
  every graded item uses **fresh matrices**, not the scene's \(A\) and \(R\), except
  `comp-solve-with-inverse`, whose *point* is the reconciliation with L3/L4.
- **Delayed-retention requirement (D12):** the invertibility criterion and the
  reversal order must reappear in the `maps-inverses-determinants` module set,
  interleaved with determinants, roughly one module later.
- **Connection to later lessons (`looking-ahead`):** \(ad-bc\) → L7's determinant
  and \(\det(AB)=\det A\det B\); "the plane collapsed" → L8's rank/column space;
  \(P^{-1}AP\) → L10.

## 1g. Correctness & scope

- **Mathematical correctness checks:**
  - every product, inverse, and null vector shown in the scene, explorer, and
    lesson prose is computed by `src/math` (`matrixMatrixMultiply`, new
    `inverse2x2`, `nullspaceBasis2x2`), never reimplemented in a scene;
  - **property tests** required: \((AB)\mathbf{x}=A(B\mathbf{x})\);
    \(\operatorname{col}_j(AB)=A\operatorname{col}_j(B)\); \(AA^{-1}=A^{-1}A=I\);
    \((AB)^{-1}=B^{-1}A^{-1}\); \(\det=0\iff\) `inverse2x2` returns `null`;
    the closed formula agrees with a solve-based construction;
  - **asymmetric matrix** (`diagnostic-asymmetric` \(\begin{bmatrix}1&2\\3&4\end{bmatrix}\))
    must be in the product/inverse tests so a transpose/packing bug cannot hide;
  - **singular and near-singular** cases covered (`singular-collapse`,
    `near-singular`);
  - the scene asserts at build time that the composite matrix it draws equals
    `matrixMatrixMultiply(A, B)` and that its inverse beat returns the plane to the
    original outline.
- **Lesson-specific exclusions / scope boundaries:**
  - **determinant meaning is NOT taught here** — \(ad-bc\) appears only as the
    invertibility test; area/orientation is L7's job (spine §3 L7 note);
  - **no general \(m\times n\)**: shapes, non-square products, one-sided inverses,
    and the general shape rule are out of scope;
  - **no elementary matrices / LU**, no Gauss–Jordan inversion algorithm beyond
    "solve the two systems";
  - **no numerical linear algebra**: conditioning is *named* at `near-singular`,
    not developed;
  - **no new platform capability** is introduced; the lesson composes existing
    exercise capabilities only.
- **Accountable abstraction-return deferral (template §5 rejection 4).** The lesson
  teaches a general concept (composition/invertibility) while staying in
  \(\mathbb{R}^2\). The return to the general case is deferred with an owner:
  **owner** = L8 `subspaces-rank` (rank/collapse in \(\mathbb{R}^n\)) and the
  `structure` module assessment; **destination** = invertibility as
  \(\operatorname{rank}=n\); **evidence** = that module's Gate-9 items. Recorded
  here rather than silently left in 2D.

---

## 6. Acceptance record (Gate 8)

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [x] Every §1 field filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, owner-marked, paired with an evidence item at a
      stated level.
- [x] Every **lesson-owned** core outcome reaches *independently demonstrated* with
      real in-lesson evidence (the exercise ids in §1d exist in
      `src/lessons/matrixComposition.ts`).
- [x] Module-owned outcomes recorded as Gate-9 obligations, not claimed mastered.
- [x] Assessment set matches template §3c: 2 checks, woven Explore prediction,
      11 practice items across check/drill/transfer, recall capped at one, one
      transfer item (the lesson owns exactly one D9 outcome).
- [x] Backward bridge (L2/L3/L4/L5) + forward edge (L7/L8/L10); ≥1 cumulative
      connection.
- [x] Delayed-retention hook recorded (D12 → module set).
- [x] Correctness gate passed: `src/math/__tests__/matrixComposition.test.ts`
      covers every invariant in §1g including the asymmetric and singular cases.
- [x] No rejection condition holds; no anti-over-reaction guardrail tripped
      (no proof-construction demanded at P2; no unneeded second transfer item).
- [x] Profile-dependent items match P2 — derivations shown, proof construction
      offered only as an unscored surface.
