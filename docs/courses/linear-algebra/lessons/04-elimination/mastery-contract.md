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
  answer + rubric. **This does not yet satisfy the P3 obligation:** `self-check` is
  self-marked, not scored (capabilities.ts), so it provides no proof evidence — E6
  requires human scoring, implementation-package item E.)*
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

Every core outcome's **required** level is *independently demonstrated* (E3+); the
**current honest level** is the runtime behavior audited against
[`src/lessons/capabilities.ts`](#evidence-audit-runtime-checked) — not the tier label.

Status key: ✅ built & verified; 🟡 proof *surface* built, E6 credit awaits human
scoring (Package F); ⬜ module-owned (Gate 9).

| Outcome (operational) | Dimension | Owner | Built item (type) | Current honest level | Required |
| --- | --- | --- | --- | --- | --- |
| Predict a legal row op leaves the solution fixed, and say why | D1/D13 | lesson | `elim-predict-fixed-point` (committed-prediction, **pre-Watch**) | **E1** — commit-before-reveal on the taught instance; kept **by design** as the pre-Watch prediction (testing effect), a learning event | E3 (evidenced via proof + fresh runs) |
| Run forward elimination + back-substitute, correct multiplier | D3 | lesson | ✅ `elim-sequence-forward-fresh` (exercise-sequence, **fresh**) + `elim-matrix-after-step-fresh` (matrix-entry, **fresh**) + the taught-number twins | **E3** — intermediates (multiplier, triangular row, back-sub) graded on a fresh system | E3 |
| Diagnose an illegal row op and explain why | D13 | lesson | `elim-diagnose-illegal` (multiple-choice) | **E1–E2** — recognition of a directly-taught fact (retained as support) | E4 |
| Construct a \(\mathbf{b}\) yielding a contradiction row | D3/D7 | lesson | ✅ `elim-construct-inconsistent` (construct-in-explorer, **fresh cols \((1,2),(3,6)\), hint removed**) | **E4** — genuinely graded construction, now unaided on a fresh instance | E4 |
| Prove invariance in both directions (reversibility) | D6 | lesson | 🟡 `elim-explain-invariance` (self-check + model answer + rubric) | **E6 surface** — learner writes the proof; `self-check` self-marks (capabilities.ts), so credit awaits human scoring | E6 (human-scored) |
| Select elimination vs another method unprompted | D8 | ⬜ **module** | module set (not built) | not built | E3 (Gate 9) |
| Use elimination in an unfamiliar/cumulative item (compute \(\mathbf{x}_p\), combine with L5) | D9/D10 | ⬜ **module** | module set (not built) | not built | E4/E5 (Gate 9) |

#### Evidence audit (runtime-checked)

`committed-prediction` is evidence only on a **fresh** instance (mastery-standard §5);
`elim-predict-fixed-point` stays on the taught example on purpose (it is the pre-Watch
prediction), so it is a learning event, not the D3 evidence. `self-check` self-marks and
is never scored in-app ⇒ an **E6 surface, not E6 evidence**. **Result for L4 after the
lesson-owned remediation (Packages B–E):** the procedural D3 outcome now reaches **E3**
via the fresh `elim-sequence-forward-fresh` / `elim-matrix-after-step-fresh`, and the
contradiction-row construction reaches **E4** (de-hinted, fresh columns). The invariance
**proof** is a genuine E6 *surface* whose credit is **blocked on human scoring**
(Package F). Fresh numbers verified in
[`freshExample.test.ts`](../../../../../src/lessons/__tests__/freshExample.test.ts).

### 1e. Coverage-status classification (required vs reached)
Honest ceiling **after Packages B–E**: procedural/construction outcomes reach **E3/E4**;
the D6 proof outcome reaches an **E6 surface** whose credit is blocked on human scoring.
- **Independently demonstrated (E3+) — now reached:** fresh forward elimination +
  back-sub (`elim-sequence-forward-fresh`, `elim-matrix-after-step-fresh`; E3); fresh,
  unaided contradiction-row construction (`elim-construct-inconsistent`; E4).
- **Learning event, by design:** `elim-predict-fixed-point` (pre-Watch prediction) — E1.
- **Recognition (support):** `elim-diagnose-illegal` (E1–E2).
- **Proof surface, credit pending (🟡):** `elim-explain-invariance` — model answer +
  rubric captured; the in-app self-mark is not E6 scoring (Package F).
- **Module-owned (planned Gate 9):** method selection (D8); cumulative use with L5.

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** fires L3's consistency (contradiction row = "no
  solution") and reuses the exact L3 system; feeds L5 (free variables, \(\mathbf{x}_p\)).
- **Assessment evidence (summary):** 1 committed-prediction pre-Watch Check (taught
  instance → E1, by design); Explore; Practice now includes **fresh** sequence + matrix
  entry (E3), error diagnosis (E1–E2, support), a **de-hinted fresh** construction (E4),
  and a `self-check` invariance **proof surface** (E6 credit pending human scoring).
  Honest ceiling now **E3–E4** for procedural/construction; proof captured but unscored
  (see the [evidence audit](#evidence-audit-runtime-checked)).
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

Status of the build **after the lesson-owned remediation (Packages B–E built)** under
the **P3 override**, against the runtime evidence audit
([§1d](#1d-outcomes-each-paired-with-evidence)):

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [x] Every **lesson-owned P1/P2 (procedural + construction)** outcome reaches
      **independently demonstrated (E3/E4)** — fresh graded elimination runs and a
      de-hinted fresh contradiction-row construction now exist.
- [ ] Every **lesson-owned P3 (proof)** outcome reaches independently demonstrated —
      **NOT YET**: `elim-explain-invariance` is a genuine E6 *surface*; `self-check` is
      self-marked, so E6 credit is **blocked on human scoring** (Package F).
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D8; D10).
- [x] Assessment set matches §3c for procedural/construction — fresh-instance E3 runs
      and an E4 construction now present.
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (lint + 202 unit tests green, incl. fresh-example math).
- [ ] No rejection condition holds — **#3 cleared** (fresh E3 exists); still **open on
      #5 for the P3 proof line only** until the invariance proof is human-scored.
- [ ] Profile-dependent items (D6 proof depth) match **P3** — **NOT YET** (proof
      surface built; human scoring pending).

**Verdict: Gate 8 PASS for the lesson-owned P1/P2 (procedural + construction) outcomes
at E3/E4; the P3 proof obligation (D6) is CONDITIONAL — the invariance proof surface is
built, but E6 credit awaits human scoring (Package F).** L4 remains the strongest lesson
operationally and now has fresh, unaided E3/E4 evidence; the one remaining lesson-relevant
gap is proof *scoring*, which is module-owned infrastructure (Package F).
