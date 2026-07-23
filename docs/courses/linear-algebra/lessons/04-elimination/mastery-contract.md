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

| Outcome (operational) | Dimension | Owner | Built item (type) | Current honest level | Required |
| --- | --- | --- | --- | --- | --- |
| Predict a legal row op leaves the solution fixed, and say why | D1/D13 | lesson | `elim-predict-fixed-point` (committed-prediction) | **E1** — commit-before-reveal, **but the lesson's own instance** ⇒ a learning event, not evidence (mastery-standard §5) | E3 |
| Run forward elimination + back-substitute, correct multiplier | D3 | lesson | `elim-sequence-forward` (exercise-sequence), `elim-matrix-after-step` (matrix-entry) | **E2** — intermediates genuinely graded, but on the worked numbers (near-copy) | E3 |
| Diagnose an illegal row op and explain why | D13 | lesson | `elim-diagnose-illegal` (multiple-choice) | **E1–E2** — recognition of a directly-taught fact | E4 |
| Construct a \(\mathbf{b}\) yielding a contradiction row | D3/D7 | lesson | `elim-construct-inconsistent` (construct-in-explorer) | **E2 (borderline E3)** — a *genuinely graded* construction (the module's only one), but same dependent columns **and a hint naming an answer** ⇒ scaffolded | E4 |
| Prove invariance in both directions (reversibility) | D6 | lesson | `elim-explain-invariance` (self-check) | **E1** — the model answer is *revealed* and the learner **self-marks**; `correct` mirrors the self-mark (capabilities.ts). **Not** human-scored ⇒ **not proof evidence** | E6 |
| Select elimination vs another method unprompted | D8 | **module** | module set (not built) | not built | E3 (Gate 9) |
| Use elimination in an unfamiliar/cumulative item (compute \(\mathbf{x}_p\), combine with L5) | D9/D10 | **module** | module set (not built) | not built | E4/E5 (Gate 9) |

#### Evidence audit (runtime-checked)

`committed-prediction` counts as evidence **only** when the learner commits before the
reveal **and the item is a fresh (non-lesson) instance** (mastery-standard §5); this
item uses the taught example ⇒ E1. `self-check` sets `correct` to the learner's own
`selfMark` and is never machine- or human-scored in-app ⇒ it **cannot** supply E6.
The one genuinely graded construction (`elim-construct-inconsistent`) is hinted and
reuses the taught columns ⇒ E2, not the E4 its tier claimed. **Result for L4: honest
ceiling E2 (one borderline-E3 construction); no valid proof evidence.** This is the
strongest lesson operationally, but its earlier "P3 met" verdict was **incorrect**.

### 1e. Coverage-status classification (required vs reached)
Honest ceiling under the runtime audit: **E1–E2. No lesson-owned core outcome reaches
"independently demonstrated" (E3+); P3 proof depth is *not* met.**
- **Practiced (level 2) — ceiling reached:** forward elimination + back-sub grade
  intermediates, but on the running numbers (E2 near-copy); the contradiction-row
  construction is graded but hinted (E2, borderline E3).
- **Learning events, not evidence:** `elim-predict-fixed-point` (commit-before-reveal
  on the *taught* instance) is E1.
- **No proof evidence:** `elim-explain-invariance` is self-marked; it exposes a model
  answer but proves nothing — the P3 obligation is unmet.
- **Module-owned (planned Gate 9):** method selection (D8); cumulative use with L5.

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** fires L3's consistency (contradiction row = "no
  solution") and reuses the exact L3 system; feeds L5 (free variables, \(\mathbf{x}_p\)).
- **Assessment evidence (summary):** 1 committed-prediction Check (on the *taught*
  instance → E1); Explore; Practice = sequence + matrix entry (near-copy, E2) + error
  diagnosis (E1–E2) + one genuinely-graded but hinted construction (E2, borderline E3)
  + a `self-check` "proof" that is **self-marked, not scored** (no proof evidence).
  Honest ceiling E2 (see the [evidence audit](#evidence-audit-runtime-checked)).
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

Honest status of the current build under the **P3 override**, corrected against the
runtime evidence audit ([§1d](#1d-outcomes-each-paired-with-evidence)):

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [ ] Every **lesson-owned** core outcome reaches **independently demonstrated with
      real in-lesson evidence** — **FAILS**: honest ceiling is **E2** (one
      borderline-E3 hinted construction). The commit-before-reveal item uses the taught
      instance (E1); the procedural runs are near-copy (E2); **no fresh E3 exists.**
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D8; D10).
- [ ] Assessment set matches §3c — **FAILS** under P3: the "proof" item is a
      self-marked `self-check` (not proof evidence); no fresh-instance procedural item.
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (built lesson has passing math/tests).
- [ ] No rejection condition holds — **trips #3 (near-copy, no fresh E3), #5 (theorem
      justification not evidenced — self-mark is not scoring), #8 (lesson-owned
      outcomes stall at E1–E2)**.
- [ ] Profile-dependent items (D6 proof depth) match P3 — **FAILS**: `self-check` is
      self-marked, so the P3 proof obligation is **not** met (correction of the
      earlier "P3 met" claim).

**Corrected verdict: Gate 8 NOT PASSED.** L4 is the strongest lesson operationally —
it has genuine graded intermediates and the module's only real graded construction —
but its earlier "P3 met" verdict was **wrong**: a self-marked `self-check` is not
proof evidence, and no item reaches a fresh, unaided E3. Remaining **lesson-owned**
work → implementation-package items **B** (fresh E3 run), **D** (de-hint the
construction / add a fresh E4), **E** (human-scored proof). Module-owned → Gate 9.
