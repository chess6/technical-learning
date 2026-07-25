# Lesson Mastery Contract — Subspaces, Column Space, Null Space, Rank (L8)

Gate 5 for spine node **L8 `subspaces-rank`**, against the
[template](../../../../authoring/templates/lesson-mastery-contract.md), after
[insight.md](insight.md) reached `Gate result: PASS`.

## 1a. Placement & upstream links

- **Spine position:** L8 `subspaces-rank`, unit `structure`, before L9.
- **Core profile:** the `structure` module carries a **P3 override**
  ([spine §0](../../course-spine.md#0-declared-course-target-gate-1)), so proof
  *construction* is in scope here — unlike L6/L7. Concretely: the learner is asked
  to construct the subspace proof, and it is offered as an unscored surface
  (`self-check` + rubric) because in-app proof grading does not exist and adding
  it would be assessment infrastructure. **The P3 bar is therefore NOT claimed
  attained by this lesson** — it is prepared, and Gate 9 must discharge it.
- **Research-bridge overlay?** No.
- **Insight contract:** [insight.md](insight.md) — `PASS`.
- **Concept ids introduced:** `subspace`, `column-space`, `null-space`, `rank`.
  **Reused:** `span`, `linear-independence`, `basis`, `dimension` (informally),
  `consistency`, `pivot`, `free-variable`, `solution-set`, `invertibility`,
  `determinant`.

## 1b. Role, bridge, and need

- **Role:** converts five lessons of informal usage into named objects, and turns
  L6/L7's binary "collapsed or not" into a count. It is the vocabulary L9, L11,
  L13 and L14 all spend.
- **Prerequisites to retrieve:** the column picture (L3); pivots and free
  variables (L4); \(\operatorname{Null}(A)\) and uniqueness (L5); invertibility
  (L6); \(\det \ne 0\) as collapse (L7).
- **Bridge from L7:** L7 closed on "\(\det = 0\) means a dimension was lost".
  L8 opens by asking *how many* — a question the plane was too small to answer.
- **Motivating need:** *You have asked two questions about every system since
  Lesson 3 — can this be solved, and is the answer unique? Why always those two,
  and never a third?*

## 1c. Content to teach

- **Definitions (D2):** subspace (with the geometric reading "flat through the
  origin"); \(\operatorname{Col}(A)\) with its ambient space \(\mathbb{R}^m\);
  \(\operatorname{Null}(A)\) with its ambient space \(\mathbb{R}^n\);
  \(\operatorname{rank}A=\dim\operatorname{Col}(A)\); pivot column; the image of
  the unit cube.
- **Objects:** a basis of \(\operatorname{Col}(A)\) **taken from \(A\)**; a basis
  of \(\operatorname{Null}(A)\) from the free variables; a rank-2 and a rank-1
  \(3\times3\) map.
- **Procedures (D3):** one row reduction, read three ways. Method-specific
  intermediates graded: the **pivot column indices**, the basis vectors *from the
  original columns*, and the free-variable basis of the null space.
- **Results (D5):** both sets are subspaces; consistency \(\iff \mathbf{b}\in\operatorname{Col}(A)\);
  uniqueness \(\iff \operatorname{Null}(A)=\{\mathbf{0}\}\); the pivot-basis
  proposition; invertible \(\iff \operatorname{rank}=n\). Stated-not-proved:
  row rank = column rank (`reference`).
- **Proof depth (D6):** P3 override in force — the subspace proof is **constructed**
  by the learner (unscored surface); the pivot-basis proposition is **derived** in a
  revealed layer; row rank = column rank is **stated** with its deferral named.
- **Representations (D4):** visual (two panels: input space with the crushed line,
  output space with the surviving plane, under a stated isometric projection),
  symbolic, numerical, verbal.
- **Translations (D4):** pivot count → image shape; row reduction → two bases;
  geometric collapse → \(\operatorname{rank} < n\); L6/L7's binary → the count.
- **Edge/degenerate cases (D7):** rank 3 (nothing collapses, null space is
  \(\{\mathbf 0\}\)); rank 1 (image is a line, null space is a *plane* — the two
  dimensions move in opposite directions); rank 0 (the zero map); the
  \(\mathbb{R}^2\) cases as the degenerate corner; a non-square \(2\times3\) map
  stated so "different spaces" is honest.
- **Misconceptions (D13):** (1) the two spaces live in the same place;
  (2) the column-space basis comes from the *reduced* matrix; (3) every flat is a
  subspace; (4) big null space ⇒ big column space; (5) a map has *only* these two
  subspaces — the lesson selects the two that decide solvability, and names the
  row space / \(\operatorname{Null}(A^{\mathsf T})\) as existing but out of scope
  (`ref-row-rank`'s `looking-ahead` layer), consistent with §1g's
  "no four-subspaces survey".

## 1d. Outcomes with evidence

| Outcome (operational) | Dim | Owner | Level | Evidence item | Attainment |
| --- | --- | --- | --- | --- | --- |
| Given a solvability question, name which of the two spaces decides it, and in which \(\mathbb{R}^k\) that space lives | D2/D4 | lesson | E3 | `rank-which-space`, `rank-where-it-lives` | independently demonstrated |
| Produce \(\operatorname{rank}A\) for a fresh \(3\times3\) map | D3 | lesson | E3 | `rank-count-fresh` | independently demonstrated |
| Produce a basis of \(\operatorname{Col}(A)\) **from \(A\)'s own columns** | D3/D13 | lesson | E3 | `rank-colspace-basis-fresh` (`matrix-entry`) | independently demonstrated |
| Produce a nonzero null vector of a singular map | D3 | lesson | E3 | `rank-null-witness` (`construct-in-explorer`, predicate-graded) | independently demonstrated |
| Predict the image's shape (solid/plane/line/point) from the pivot count | D1/D4 | lesson | E3 | `rank-image-shape` | independently demonstrated |
| Show the two dimensions move in **opposite** directions on a fresh rank-1 map | D7/D9 | lesson | E4 | `rank-opposite-directions` (`exercise-sequence`) | independently demonstrated |
| Restate invertibility / \(\det\ne0\) / unique solution as one statement about rank | D10 | lesson | E3 | `rank-restate-invertibility` | independently demonstrated |
| Construct the proof that \(\operatorname{Null}(A)\) and \(\operatorname{Col}(A)\) are subspaces | D6 | lesson | E6 *(unscored)* | `rank-prove-subspace` (`self-check` + rubric) | **practiced**; P3 credit deferred to Gate 9 → [`mod-struct-prove-subspace-inclusion`](../../modules/structure/assessment-plan.md), built, not administered |
| Integrate rank with elimination and determinants on a mixed later item | D10 | **module** | E5 | [`mod-struct-rank-nullity-ledger`](../../modules/structure/assessment-plan.md) | **built, not administered** — Gate 9 open |
| Retain the two-space distinction under delayed retrieval | D12 | **module** | E3 | [`mod-struct-retain-two-spaces`](../../modules/structure/assessment-plan.md) | **built at E1, not administered** — the module plan records why recognition falls short of this E3 request |

**Transfer obligation:** this lesson owns exactly one D9 outcome (the rank-1
opposite-directions item). It owes no second.

## 1e. Coverage status

Taught: all of §1c. Practiced: every lesson-owned outcome. **Independently
demonstrated:** all lesson-owned outcomes except `rank-prove-subspace`, which is
honestly recorded as *practiced* because no in-app proof grading exists.
Enrichment: none.

## 1f. Connections, assessment, retention

- **Cumulative (D10):** L3's reachability re-read as \(\operatorname{Col}(A)\);
  L4's pivots re-read as rank; L5's null space re-attributed to the map; L6/L7's
  binary restated as the extreme value of the count (`rank-restate-invertibility`).
- **Assessment:** 2 check, 4 drill, 4 transfer. Recall capped at one item. Every
  graded item uses a matrix the guided scene does **not** animate.
- **Retention (D12):** "which space decides which question" and "basis from \(A\),
  not \(R\)" must reappear in the `structure` module set.
- **Forward:** L9 (the count becomes a conservation law), L11 (eigenspace =
  \(\operatorname{Null}(A-\lambda I)\)), L13 (project onto \(\operatorname{Col}(A)\)).

## 1g. Correctness & scope

- **Correctness checks:** rank, both bases, and the image shape come from
  `src/math` (`rref` / `solveLinearSystem` / new `subspaces.ts`), never from a
  scene. Property tests required: every produced column-space basis vector is a
  column of \(A\) and the basis is independent and spans the same space; every
  null-basis vector satisfies \(A\mathbf{v}=\mathbf{0}\); rank + nullity = n on a
  battery including rank 3/2/1/0 and a non-square case; rank is invariant under
  row operations while the *column space itself* is not (the trap, tested);
  asymmetric matrix included.
- **Scope exclusions:** no orthogonality or complements (L12); no four-subspaces
  survey; no proof of row rank = column rank; rank–nullity is **observed here and
  proved in L9**; no general field theory or abstract vector spaces.
- **Abstraction return:** this lesson **is** the return owed by L6 and L7 — it
  leaves \(\mathbb{R}^2\) for \(\mathbb{R}^3\) and states the \(m\times n\) case.
  Remaining deferral: genuinely \(n\)-dimensional drill, owned by the `structure`
  module assessment.

## 6. Acceptance record (Gate 8)

- [x] Insight contract linked and `PASS`.
- [x] Every §1 field filled; upstream linked, not restated.
- [x] Every outcome operational, owner-marked, evidence-paired.
- [x] Every lesson-owned core outcome independently demonstrated in-lesson, with
      the single honest exception recorded in §1e (proof construction).
- [x] Module-owned outcomes recorded as Gate-9 obligations, not claimed.
- [x] Assessment matches §3c; recall capped; one transfer item for one D9 outcome.
- [x] Backward bridge (L3–L7) + forward edge (L9/L11/L13); ≥1 cumulative item.
- [x] Retention hook recorded.
- [x] Correctness gate passed (`src/math/__tests__/subspaces.test.ts`).
- [x] No rejection condition; no anti-over-reaction guardrail tripped.
- [x] **Profile honesty:** the P3 proof bar is *prepared, not claimed*. Recorded
      explicitly rather than checked off.
