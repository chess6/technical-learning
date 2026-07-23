# Lesson Mastery Contract — Linear Systems (L3)

Per-lesson mastery gate (Gate 5/8), completed after the
[Approved Insight Contract](insight.md) (`PASS`) and referencing — not restating —
the upstream artifacts. Template:
[authoring/templates/lesson-mastery-contract.md](../../../../authoring/templates/lesson-mastery-contract.md).

**Retrospective**: authored for the already-built lesson (`src/lessons/systems.ts`)
to bring the `systems-elimination` module into the canonical workflow. The
acceptance record ([§6](#6-acceptance-record-gate-8)) is filled **honestly against
the current build under the declared P3 override** — open boxes are the input to the
module [implementation package](../../modules/systems-elimination/implementation-package.md).

---

## 1. The contract fields

### 1a. Placement & upstream links
- **Lesson / spine position:** L3 systems ([spine](../../course-spine.md), module
  `systems-elimination`).
- **Core course profile in force:** **P3 (proof/honors) override** on this module
  (per [course-spine §0](../../course-spine.md#0-declared-course-target-gate-1));
  the course primary is P2. So proof depth is P3 for this lesson's own theorems.
- **Research-bridge overlay?** yes (course-wide) — enrichment only, excluded from
  the exam bar (D14).
- **Approved Insight Contract:** [insight.md](insight.md) — `PASS` confirmed;
  primary-insight sentence linked, not copied.
- **Saved as:** `docs/courses/linear-algebra/lessons/03-systems/mastery-contract.md`.
- **Concept ids introduced / reused:** matrix equation \(A\mathbf{x}=\mathbf{b}\),
  row/column pictures, column space, consistency, trichotomy, invertibility preview
  (reuses L1 span/independence/basis, L2 columns rule) — see
  [curriculum-architecture §3](../../curriculum-architecture.md).

### 1b. Role, bridge, and need
- **Lesson role:** the keystone that fuses L1 (span/independence/coordinates) and L2
  (columns rule) into one solving question and sets up L4 elimination and L7
  determinant.
- **Prerequisite knowledge to retrieve:** linear combination & span; independence;
  basis ⇔ unique coordinates (L1); \(A\mathbf{x}=x\mathbf{a}_1+y\mathbf{a}_2\) (L2).
- **Bridge from previous lesson:** "You blended columns to reach a target in L2 —
  now ask which blend, and whether it exists and is unique."
- **Motivating problem:** are "find the point on both lines" and "find the blend of
  columns reaching \(\mathbf{b}\)" the same question, and does the answer always
  exist and stay unique?

### 1c. Content to teach (the coverage core)
- **Approved central insight:** *(link only)* [insight.md](insight.md).
- **Required definitions & notation (D2):** matrix equation and its readings (rows /
  lines / vector equation / column combination); column space
  \(\operatorname{Col}(A)=\operatorname{span}\{\mathbf{a}_i\}\); consistent /
  inconsistent. *(Built: `def-matrix-equation`, `thm-consistency`.)*
- **Required mathematical objects:** columns of \(A\); the two constraint lines; the
  column span; the target \(\mathbf{b}\).
- **Procedures requiring fluency (D3):** (i) solve a \(2\times2\) system by rows
  (grade the elimination/substitution intermediate, not just \((x,y)\)); (ii) verify
  by the column blend \(x\mathbf{a}_1+y\mathbf{a}_2\); (iii) translate a system to
  \(A,\mathbf{b}\) (read columns down).
- **Theorems / propositions (D5):** consistency ⇔ \(\mathbf{b}\in\operatorname{Col}(A)\);
  trichotomy (independent ⇒ one for every \(\mathbf{b}\); dependent ⇒ none or ∞,
  never exactly one/two).
- **Expected proof / justification depth (D6, P3):** **proof constructed** —
  (a) consistency ⇔ span (immediate from the columns rule); (b) trichotomy: prove
  independent ⇒ unique for every \(\mathbf{b}\) (existence + uniqueness from basis),
  and dependent ⇒ none/∞, stating *where independence is used*. *(The "∞ is exactly
  an affine line" step is proved in L5; here the ∞ branch is justified via the
  dependency, deferral owned by L5.)*
- **Required representations (D4):** symbolic (\(A\mathbf{x}=\mathbf{b}\), vector
  equation), visual (lines + column arrows), verbal (existence/uniqueness).
- **Translations learners must perform (D4):** system ↔ \((A,\mathbf{b})\); row
  intersection ↔ column blend ↔ solution \((x,y)\); "dependent columns" ↔ "column
  span is a line."
- **Examples, nonexamples, edge cases (D7):** independent \((1,2),(3,-1)\) (one
  solution); dependent \((1,2),(2,4)\) with \(\mathbf{b}=(3,6)\) (∞) and
  \(\mathbf{b}=(3,5)\) (none). Degenerate: parallel vs coincident lines.
- **Misconceptions (D13 seed):** "two equations ⇒ one solution"; "row & column
  pictures are different problems"; "no solution = my arithmetic slipped."
  *(Built: callouts `count-vs-independence`, `two-pictures-one-problem`, trap in
  `sys-none`.)*

### 1d. Outcomes, each paired with evidence

Every core outcome's **required** level is *independently demonstrated* (E3+). The
**current honest level** is the runtime behavior of the built item, audited against
[`src/lessons/capabilities.ts`](#evidence-audit-runtime-checked) below — **not** the
tier label the exercise carries.

Status key: ✅ built & verified in-app; 🟡 proof *surface* built but E6 credit awaits
human scoring (Package F); ⬜ module-owned (Gate 9).

| Outcome (operational) | Dimension | Owner | Built item (type) | Current honest level | Required |
| --- | --- | --- | --- | --- | --- |
| Classify none/one/∞ before solving | D1/D5 | lesson | `sys-count-infinite`, `sys-count-none` (multiple-choice) | **E1** — recognition on the lesson's *own* systems (retained as low-stakes Checks) | E3 |
| Solve a 2×2 by rows + confirm by columns | D3 | lesson | ✅ `sys-solve-unique-fresh` (vector, **fresh** `systems-fresh` numbers) + `sys-solve-unique` | **E3** — fresh, unaided production graded against `src/math` | E3 |
| Translate a system to \(A,\mathbf{b}\); read the column meaning | D4 | lesson | ✅ `sys-translate-columns-fresh` (vector, **fresh**) + `sys-column-reading` (MC) | **E3** — fresh production; recognition retained as support | E3 |
| Characterize which \(\mathbf{b}\) are inconsistent (dependent cols) | D5/D7 | lesson | ✅ `sys-construct-inconsistent` (**construct-in-explorer**, fresh cols \((1,2),(3,6)\), checked by `classifyLinearSystem2x2`); `sys-generalize-inconsistent` (MC) | **E4** — genuinely graded construction on a fresh instance | E4 |
| Reason about the dependent-count mechanism (commit-before-reveal) | D5 | lesson | ✅ `sys-counterexample-uniqueness`, `sys-explain-dependent` (**committed-prediction**, fresh scenarios) | **E3** — committed choice before reveal on fresh cases | E3 |
| Justify consistency ⇔ \(\mathbf{b}\in\operatorname{Col}(A)\) | D6 | lesson | 🟡 `sys-prove-consistency` (**self-check**, both directions) | **E6 surface** — learner writes the proof + model answer/rubric, but the self-mark is not scoring | E6 (human-scored) |
| Prove the trichotomy (no determinant) | D6 | lesson | 🟡 `sys-prove-trichotomy` (**self-check**, independence/basis derivation) | **E6 surface** — proof captured; credit pending human scoring | E6 (human-scored) |
| Select rows-vs-columns unprompted | D8 | ⬜ **module** | module set (not built) | not built | E3 (Gate 9) |
| Recognize \(A\mathbf{x}=\mathbf{b}\) in a cumulative item | D9/D10 | ⬜ **module** | module set (not built) | not built | E4/E5 (Gate 9) |

#### Evidence audit (runtime-checked)

Rules applied (from [mastery-standard §5](../../../../authoring/mastery-standard.md#5-evidence-levels)):
ordinary `prediction` auto-returns `correct: true` and captures no answer → **E1
exposure**; same-example multiple-choice is **E1 recognition**; near-copy graded
production (worked numbers) is **E2 reproduction**; **E3+ requires a fresh, unaided
instance**; `committed-prediction` on a **fresh** case is genuine commit-before-reveal
(**E3**); `construct-in-explorer` checked by an `src/math` predicate on a fresh
instance is **E4**; `self-check` is self-marked (not human-scored) → an **E6 surface,
not E6 evidence**. Result for L3 **after the lesson-owned remediation (Packages
B–E)**: computational (D3/D4) and characterization (D5/D7) outcomes now reach **E3/E4
with fresh, graded, in-lesson evidence**; the two **D6 proof** outcomes have genuine
learner-constructed proof *surfaces* but their **E6 credit is blocked on human
scoring** (module [assessment plan](../../modules/systems-elimination/assessment-plan.md)
/ implementation-package **Package F**). Fresh numbers verified in
[`freshExample.test.ts`](../../../../../src/lessons/__tests__/freshExample.test.ts).

### 1e. Coverage-status classification (required vs reached)

Honest ceiling **after Packages B–E**: computational/characterization outcomes reach
**E3–E4** (fresh, graded, in-lesson); the **D6 proof** outcomes reach an **E6 surface**
whose credit is blocked on human scoring.

- **Taught (level 1):** all listed content is presented.
- **Independently demonstrated (E3+) — now reached:** fresh row-solve
  (`sys-solve-unique-fresh`) and translate (`sys-translate-columns-fresh`); the
  commit-before-reveal mechanism items on fresh cases; fresh graded construction of an
  inconsistent \(\mathbf{b}\) (`sys-construct-inconsistent`, **E4**).
- **Recognition (retained as support, not the evidence relied on):** classification and
  column-reading MC (E1) on the lesson's own examples.
- **Proof surface, credit pending (🟡):** `sys-prove-consistency`,
  `sys-prove-trichotomy` capture the learner's proof against a model answer + rubric;
  the in-app `self-check` mark is **not** E6 scoring — human scoring is owned by the
  module assessment (Package F).
- **Module-owned (planned Gate 9):** method selection (D8); cumulative recognition.

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** fires L1 basis ⇔ unique coordinates as "unique
  solution for every \(\mathbf{b}\)"; fires L2 columns rule as the column picture.
- **Assessment evidence (summary):** 2 Check (same-example MC classify, retained),
  Explore (drag \(\mathbf{b}\)), Practice now includes **fresh-instance** graded
  production (`sys-solve-unique-fresh`, `sys-translate-columns-fresh`; E3), a **graded
  construction** on fresh columns (`sys-construct-inconsistent`; E4), **committed
  prediction** on fresh mechanism cases (E3), and two **learner-written proof surfaces**
  (E6 credit pending human scoring). The honest ceiling is now **E3–E4 for
  computational/characterization outcomes**; proofs are captured but not yet scored (see
  the [evidence audit](#evidence-audit-runtime-checked)).
- **Delayed-retention requirement (D12):** the trichotomy and consistency⇔span must
  resurface in the module spaced set and again when L7 (determinant) and L8 (column
  space) build on them.
- **Connection to later lessons:** forward edge to L4 (elimination *computes* the
  solving) and L7 (determinant detects the independence switch) — built
  `looking-ahead` in `prop-trichotomy`.

### 1g. Correctness & scope
- **Mathematical correctness checks:** all quantities from `src/math` (columns rule,
  span/independence); asymmetric matrix \((1,3;2,-1)\) covered; dependent/degenerate
  cases tested. Link
  [engineering/math-correctness.md](../../../../engineering/math-correctness.md),
  [quality/lesson-correctness-checklist.md](../../../../quality/lesson-correctness-checklist.md).
- **Lesson-specific exclusions / scope boundaries:** determinant not defined
  (previewed, owned by L7); "∞ solutions is an affine line" proved in L5 (accountable
  deferral, owner L5); general \(m\times n\) column-space exercised in L8.

---

## 6. Acceptance record (Gate 8)

Gate 8 certifies **this lesson** on its **lesson-owned** outcomes. Status of the build
**after the lesson-owned remediation (Packages B–E built)** under the **P3 override**,
against the runtime evidence audit ([§1d](#1d-outcomes-each-paired-with-evidence)):

- [x] Insight Contract linked and `PASS` (trichotomy now derived without the
      determinant); primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [x] Every **lesson-owned P1/P2 (computational + characterization) outcome** reaches
      **independently demonstrated (E3/E4) with real in-lesson evidence** — fresh graded
      production and a fresh graded construction now exist.
- [ ] Every **lesson-owned P3 (proof) outcome** reaches independently demonstrated —
      **NOT YET**: `sys-prove-consistency` / `sys-prove-trichotomy` are genuine
      E6 *surfaces* (learner writes the proof), but `self-check` is self-marked, so the
      **E6 credit is blocked on human scoring** (Package F / module assessment).
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D8; D10).
- [x] Assessment set matches §3c for computational/characterization — fresh-instance E3
      production, E4 construction, and commit-before-reveal now present.
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (lint + 202 unit tests green, incl. fresh-example math).
- [ ] No rejection condition holds — **#3/#7 cleared** (fresh E3/E4, no reveal-only
      practice remains); still **open on #5/#8 for the P3 proof line only** until proofs
      are human-scored.
- [ ] Profile-dependent items (D6 proof depth) match the declared **P3** profile —
      **NOT YET** (proof surfaces exist; human scoring pending).

**Verdict: Gate 8 PASS for the lesson-owned P1/P2 (computational + characterization)
outcomes at E3/E4; the P3 proof obligation (D6) is CONDITIONAL — proof surfaces are
built, but E6 credit awaits human scoring in the module assessment (Package F).** The
lesson no longer supports only exposure/reproduction: it now produces fresh, graded
E3/E4 evidence. The one remaining lesson-relevant gap is proof *scoring*, which is
structurally module-owned infrastructure (Package F), not more lesson content.
