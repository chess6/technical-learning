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
  add multiple); the illegal \(0\)-scaling; a wrong-sign multiplier; the contradiction
  row \(0=c\) on dependent columns; the \(0=0\) collapse. *(Built: `elim-diagnose-illegal`
  (MC), `elim-diagnose-repair-fresh` (fresh diagnosis + repair), `elim-contradiction-row-fresh`
  (elimination → contradiction row), `elim-construct-infinite` (construction, ∞ case).
  The former `elim-construct-inconsistent` **duplicated L3's columns \((1,2),(3,6)\) and
  is removed**.)*
- **Misconceptions (D13 seed):** "elimination is arithmetic tricks"; "\(0\)-scaling
  is fine"; "the triangular system is an approximation"; multiplier sign slip.
  *(Built: callout `elim-not-tricks`, trap in `elim-forward`, `elim-diagnose-illegal`.)*

### 1d. Outcomes, each paired with evidence

Every core outcome's **required** level is *independently demonstrated* (E3+); the
**current honest level** is the runtime behavior audited against
[`src/lessons/capabilities.ts`](#evidence-audit-runtime-checked) — not the tier label.
Canonical rule applied strictly: **MC and committed-MC are E1 recognition**.

Status key: ✅ lesson-owned outcome reaches its required scored level in-app;
🟡 produced surface built but level awaits human scoring; 🔴 lesson-owned outcome still
below its required level; ⬜ module-owned (Gate 9).

| Outcome (operational) | Dimension | Owner | Built item (type) | Current honest level | Required |
| --- | --- | --- | --- | --- | --- |
| Predict a legal row op leaves the solution fixed, and say why | D1/D13 | lesson | `elim-predict-fixed-point` (committed-prediction, **pre-Watch**) | **E1** — commit-before-reveal on the taught instance; kept **by design** as the pre-Watch prediction (a learning event, not the evidence) | E3 |
| Run forward elimination + back-substitute, correct multiplier | D3 | lesson | ✅ `elim-sequence-forward-fresh` (exercise-sequence, **fresh**) + `elim-matrix-after-step-fresh` (matrix-entry, **fresh**) + taught-number twins | **E3** — intermediates (multiplier, triangular row, back-sub) graded on a fresh system | E3 |
| Diagnose an illegal/erroneous row op **and repair it** | D13 | lesson | 🟡 `elim-diagnose-repair-fresh` (exercise-sequence: MC identify + numeric **repair**, fresh); `elim-diagnose-illegal` (MC, E1) | **E3** for the *repair* (fresh production); the *identify/explain* half is E1 recognition — a fully produced explanation is not yet captured | E4 |
| Certify "no solution" via an elimination contradiction row | D3/D7 | lesson | ✅ `elim-contradiction-row-fresh` (matrix-entry, **run elimination** on a fresh inconsistent system → \(0=c\) row) | **E3** — fresh production of the contradiction row | E3 |
| Construct a \(\mathbf{b}\) forcing a degenerate outcome | D3/D7 | lesson | 🟡 `elim-construct-infinite` (construct-in-explorer, distinct cols, **∞ case**) | **E3 construction** — genuine graded production, within the taught pattern; the unfamiliar-transfer E4 variant is deferred to the module set | E4 |
| Prove invariance in both directions (reversibility) | D6 | lesson | 🟡 `elim-explain-invariance` (self-check + model answer + rubric) | **E6 surface, unscored** — learner writes the proof; `self-check` self-marks, so credit awaits human scoring | E6 (human-scored) |
| Select elimination vs another method unprompted | D8 | ⬜ **module** | module set (not built) | not built | E3 (Gate 9) |
| Use elimination in an unfamiliar/cumulative item (compute \(\mathbf{x}_p\), combine with L5) | D9/D10 | ⬜ **module** | module set (not built) | not built | E4/E5 (Gate 9) |

#### Evidence audit (runtime-checked)

`committed-prediction` is committed **multiple-choice** → **E1 recognition**;
`elim-predict-fixed-point` also stays on the taught example on purpose (pre-Watch
prediction), so it is a learning event, not D3 evidence. `self-check` self-marks and is
never scored in-app ⇒ an **unscored E6 surface**. **Result for L4:** the procedural D3
outcome reaches **E3** (fresh `elim-sequence-forward-fresh` / `elim-matrix-after-step-fresh`);
certifying "no solution" reaches **E3** via a fresh elimination-to-contradiction-row
production (`elim-contradiction-row-fresh`, which *replaces* the item that duplicated
L3's construction); the diagnosis outcome now includes a **fresh repair** (E3 production)
but its explanation half is still recognition, and the degenerate-case construction is a
genuine **E3** production within the taught pattern — **neither reaches the required E4
unfamiliar-transfer yet**. The invariance **proof** is an unscored E6 surface. Several
lesson-owned outcomes remain below required, so **Gate 8 is NOT PASSED**. Fresh numbers
and each new item's grading paths are verified in
[`freshExample.test.ts`](../../../../../src/lessons/__tests__/freshExample.test.ts) and
[`remediationExercises.test.ts`](../../../../../src/lessons/__tests__/remediationExercises.test.ts).

### 1e. Coverage-status classification (required vs reached)
Honest ceiling: procedural + contradiction-row outcomes reach **E3** (fresh production);
diagnosis (repair) and the degenerate construction are **E3** but below their required
**E4**; the D6 proof is an **unscored E6 surface**.
- **Independently demonstrated (E3) — reached:** fresh forward elimination + back-sub
  (`elim-sequence-forward-fresh`, `elim-matrix-after-step-fresh`); fresh
  elimination-to-contradiction-row (`elim-contradiction-row-fresh`); fresh repair of a
  botched step (`elim-diagnose-repair-fresh`).
- **Below required E4:** the diagnosis *explanation* half (still recognition) and the
  `elim-construct-infinite` construction (within-pattern) — the unfamiliar-transfer E4
  variants are module-set work.
- **Learning event, by design:** `elim-predict-fixed-point` (pre-Watch) — E1.
- **Recognition (support):** `elim-diagnose-illegal` (E1).
- **Proof surface, unscored (🟡):** `elim-explain-invariance` — model answer + rubric
  captured; the in-app self-mark is not E6 scoring (Package F).
- **Module-owned (planned Gate 9):** method selection (D8); cumulative use with L5.

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** fires L3's consistency (contradiction row = "no
  solution") and reuses the exact L3 system; feeds L5 (free variables, \(\mathbf{x}_p\)).
- **Assessment evidence (summary):** 1 committed-prediction pre-Watch Check (taught
  instance → E1, by design); Explore; Practice includes **fresh** elimination sequence +
  matrix entry (E3), a **fresh diagnosis + repair** sequence (repair is E3 production;
  identify is E1), a **fresh elimination-to-contradiction-row** matrix entry (E3), a
  fresh construction of the ∞ case (E3, within pattern), a recognition diagnosis MC (E1,
  support), and a `self-check` invariance **proof surface** (unscored). Honest ceiling
  **E3** for the produced procedural/contradiction outcomes; diagnosis-explanation and
  the construction sit below their required E4; proof captured but unscored (see the
  [evidence audit](#evidence-audit-runtime-checked)).
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

Gate 8 is a **single gate** and cannot PASS while any lesson-owned outcome is below its
required level or proof evidence is unscored. Status of the build after the lesson-owned
remediation, under the **P3 override**, against the runtime audit
([§1d](#1d-outcomes-each-paired-with-evidence)):

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [x] **Procedural D3 reaches E3:** fresh graded elimination + back-substitution.
- [x] **Certifying "no solution" reaches E3:** a fresh elimination-to-contradiction-row
      production replaces the item that duplicated L3's construction.
- [ ] **Diagnosis (D13) reaches its required E4 — NOT YET.** A *fresh repair* (E3
      production) now exists, but the *explanation* half is still recognition; a fully
      produced diagnosis+explanation at unfamiliar-transfer level is not built.
- [ ] **Degenerate-case construction reaches E4 — NOT YET.** `elim-construct-infinite`
      is a genuine E3 production within the taught pattern; the E4 unfamiliar-transfer
      variant is module-set work.
- [ ] **Lesson-owned P3 (proof) reaches independently demonstrated — NOT YET.**
      `elim-explain-invariance` is a genuine E6 *surface*; `self-check` is self-marked,
      so E6 credit is **blocked on human scoring** (Package F).
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D8; D10).
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (lint + unit tests green, incl. fresh-example and new-item
      grading tests).
- [ ] No rejection condition holds — **still open**: diagnosis/construction below E4,
      proof unscored.

**Verdict: Gate 8 NOT PASSED.** L4 remains the strongest lesson operationally: the
procedural and contradiction-row outcomes now have fresh E3 production, the former
duplicate construction is replaced by a genuine elimination-to-contradiction-row item,
and a fresh diagnosis+repair is added. But Gate 8 is a single gate and cannot pass while
the diagnosis/construction outcomes sit below their required E4 (unfamiliar transfer) and
the invariance proof surface is unscored. Remaining lesson-owned gaps are enumerated in
the module [implementation package](../../modules/systems-elimination/implementation-package.md);
proof *scoring* is module infrastructure (Package F).
