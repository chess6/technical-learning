# Lesson Mastery Contract — Elimination (L4)

Per-lesson mastery gate (Gate 5/8), completed after the
[Approved Insight Contract](insight.md) (`PASS`). Template:
[authoring/templates/lesson-mastery-contract.md](../../../../authoring/templates/lesson-mastery-contract.md).

**Retrospective** for the built lesson (`src/lessons/elimination.ts`). Acceptance
record is filled honestly against the current build under the **P3 override**; open
boxes feed the module
[implementation package](../../modules/systems-elimination/implementation-package.md).

---

## 1. The contract fields

### 1a. Placement & upstream links
- **Lesson / spine position:** L4 elimination ([spine](../../course-spine.md), module
  `systems-elimination`).
- **Core course profile in force:** **P3 override** on this module
  ([course-spine §0](../../course-spine.md#0-declared-course-target-gate-1)); course
  primary P2.
- **Research-bridge overlay?** yes (course-wide) — enrichment only (D14).
- **Approved Insight Contract:** [insight.md](insight.md) — `PASS`; primary insight
  linked, not copied.
- **Saved as:** `docs/courses/linear-algebra/lessons/04-elimination/mastery-contract.md`.
- **Concept ids introduced / reused:** elementary row operation, equivalent systems,
  augmented matrix, triangular form, back-substitution, contradiction row (reuses L3
  trichotomy / consistency, L1 linear combination) — see
  [curriculum-architecture §3](../../curriculum-architecture.md).

### 1b. Role, bridge, and need
- **Lesson role:** turns L3's "what solving means" into a *trustworthy procedure* and
  supplies the machinery (pivots, free variables, contradiction rows) L5 organizes.
- **Prerequisite knowledge to retrieve:** L3's running system and its solution
  \((2,-1)\); consistency = \(\mathbf{b}\) in the column span; linear combinations (L1).
- **Bridge from previous lesson:** "You know the answer to this system is
  \((2,-1)\) — now *rewrite* the system instead of re-solving it, and prove the
  answer cannot change."
- **Motivating problem:** if you change the equations, how can you be sure you have
  not changed the answer?

### 1c. Content to teach (the coverage core)
- **Approved central insight:** *(link only)* [insight.md](insight.md).
- **Required definitions & notation (D2):** the three elementary row operations;
  augmented matrix \([A\mid\mathbf{b}]\); equivalent systems; triangular form.
  *(Built: `def-row-operation`.)*
- **Required mathematical objects:** the augmented matrix; a row operation; a
  triangular system; a contradiction row \(0=c\).
- **Procedures requiring fluency (D3):** forward elimination to triangular form
  (grade the multiplier and the resulting row, not just the final \((x,y)\)); back-
  substitution. *(Built: `elim-sequence-forward` grades intermediates;
  `elim-matrix-after-step` grades the resulting matrix.)*
- **Theorems / propositions (D5):** invariance — one elementary row operation
  preserves the solution set. *(Built: `thm-invariance` with a both-directions proof
  layer.)*
- **Expected proof / justification depth (D6, P3):** **proof constructed** — the
  learner argues invariance in *both directions* (nothing lost / nothing gained) and
  names **reversibility** as the reason for the ⊆ direction, and the \(k\neq0\)
  hypothesis for scaling. *(Built: `elim-explain-invariance` = `self-check` + model
  answer + rubric — satisfies P3 proof-construction for this lesson's theorem.)*
- **Required representations (D4):** symbolic (equations), tabular (augmented
  matrix), visual (two lines, the pivot picture). *(Built: three synchronized views.)*
- **Translations learners must perform (D4):** equations ↔ augmented matrix; a row
  operation ↔ its effect on the lines (pivot about the fixed point).
- **Examples, nonexamples, edge cases (D7):** legal ops (swap / scale \(k\neq0\) /
  add multiple); the illegal \(0\)-scaling; the contradiction row on dependent
  columns. *(Built: `elim-diagnose-illegal`, `elim-construct-inconsistent`.)*
- **Misconceptions (D13 seed):** "elimination is arithmetic tricks"; "\(0\)-scaling
  is fine"; "the triangular system is an approximation"; multiplier sign slip.
  *(Built: callout `elim-not-tricks`, trap in `elim-forward`, `elim-diagnose-illegal`.)*

### 1d. Outcomes, each paired with evidence

| Outcome (operational) | Dimension | Owner | Target level | Evidence item | Highest attainment required |
| --- | --- | --- | --- | --- | --- |
| Predict a legal row operation leaves the solution fixed, and say why | D1/D13 | lesson | E3 | `elim-predict-fixed-point` (built, committed-prediction) | independently demonstrated |
| Run forward elimination to triangular form + back-substitute, with correct multiplier | D3 | lesson | E3 | `elim-sequence-forward`, `elim-matrix-after-step` (built) — **reuse worked numbers**; needs a **fresh-instance** run | independently demonstrated |
| Diagnose an illegal row operation and explain why it can change the solution set | D13 | lesson | E4 | `elim-diagnose-illegal` (built) | independently demonstrated |
| Construct a \(\mathbf{b}\) yielding a contradiction row (no solution) | D3/D7 | lesson | E4 | `elim-construct-inconsistent` (built, construct-in-explorer) | independently demonstrated |
| Prove invariance of a row operation in both directions (reversibility) | D6 | lesson | E6 | `elim-explain-invariance` (built, self-check + model answer) | independently demonstrated |
| Select elimination vs another method unprompted on a mixed problem | D8 | **module** | E3 | module method-selection set (Gate 9) | independently demonstrated (Gate 9) |
| Use elimination inside an unfamiliar/cumulative item (e.g. compute \(\mathbf{x}_p\) then combine with L5) | D9/D10 | **module** | E4/E5 | module cumulative set (Gate 9) | independently demonstrated (Gate 9) |

### 1e. Coverage-status classification (required vs reached)
- **Independently demonstrated (built):** predict fixed point; diagnose illegal move;
  construct contradiction row; **prove invariance (self-check).** — P3 proof depth
  **met for this lesson's own theorem.**
- **Practiced but not on a fresh instance:** forward elimination + back-sub grade
  intermediates but reuse the running numbers — **reaches "practiced," required
  "independently demonstrated."** Gap (fresh-instance drill).
- **Module-owned (planned Gate 9):** method selection (D8); cumulative use with L5.

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** fires L3's consistency (contradiction row = "no
  solution") and reuses the exact L3 system; feeds L5 (free variables, \(\mathbf{x}_p\)).
- **Assessment evidence (summary):** 1 committed-prediction Check; Explore; Practice
  = sequence (intermediates) + matrix entry + error diagnosis + construct + self-check
  proof. Does not repeat instruction, **except** the procedural run reuses the worked
  numbers.
- **Delayed-retention requirement (D12):** the invariance theorem and the legal/illegal
  distinction must resurface in the module spaced set and when L7 studies the
  determinant's behavior under row operations.
- **Connection to later lessons:** forward edge to L5 (free variables / \(\mathbf{x}_p\))
  and L7 (row ops and \(\det\)) — built `whatThisUnlocksNext`.

### 1g. Correctness & scope
- **Mathematical correctness checks:** row-op arithmetic and the system's solution
  from `src/math`/`exampleData` (`systems-default`); asymmetric matrix covered;
  dependent-column contradiction-row case tested. Link
  [engineering/math-correctness.md](../../../../engineering/math-correctness.md),
  [quality/lesson-correctness-checklist.md](../../../../quality/lesson-correctness-checklist.md).
- **Lesson-specific exclusions / scope boundaries:** RREF not formalized; LU and
  elementary matrices previewed (owned later, L6/L8); \(\mathbb{R}^n\) elimination
  exercised generally later — accountable deferrals with named owners.

---

## 6. Acceptance record (Gate 8)

Honest status of the current build under the **P3 override**:

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [ ] Every **lesson-owned** core outcome reaches **independently demonstrated with
      real in-lesson evidence** — **NEARLY**: only the procedural run lacks a
      fresh-instance E3 item (proof, prediction, diagnosis, construction all met).
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D8; D10).
- [ ] Assessment set matches §3c — **NEARLY**: proof-construction present (satisfies
      P3), but the fresh-instance procedural item is missing.
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (built lesson has passing math/tests).
- [ ] No rejection condition holds — **currently trips #3 (near-copy procedural
      drill) only**; #5/#8 do **not** fire (invariance is proved by the learner).
- [x] Profile-dependent items (D6 proof depth) match P3 — **met** via `elim-explain-invariance`.

**Verdict:** the strongest lesson in the module — **P3 proof depth is met**. The only
remaining **lesson-owned** gap is a **fresh-instance procedural drill** (implementation
package item **C**). Module-owned outcomes → Gate 9.
