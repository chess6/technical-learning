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
tier label the exercise carries. Canonical rule applied strictly:
**`multiple-choice` and committed `multiple-choice` (`committed-prediction`) are E1
recognition**; commit-before-reveal makes an item *valid* but not automatically E3.

Status key: ✅ lesson-owned outcome reaches its required scored level in-app;
🟡 produced *surface* built but the level (E3 reasoning / E6 proof) awaits human
scoring; 🔴 lesson-owned outcome still **below** its required level; ⬜ module-owned
(Gate 9).

| Outcome (operational) | Dimension | Owner | Built item (type) | Current honest level | Required |
| --- | --- | --- | --- | --- | --- |
| Classify none/one/∞ before solving | D1/D5 | lesson | 🔴 `sys-count-infinite`, `sys-count-none`, `sys-classify-fresh` (MC / committed-MC, incl. a **fresh** system) | **E1** — a three-way choice is recognition even when fresh & committed | E3 |
| Solve a 2×2 by rows + confirm by columns | D3 | lesson | ✅ `sys-solve-confirm-fresh` (**exercise-sequence**, fresh: produce \(x\), \(y\), **and** the column-combination check) + `sys-solve-unique` (E2) | **E3** — fresh unaided production of the *complete* outcome (rows **and** column confirmation) | E3 |
| Translate a system to \(A,\mathbf{b}\) (complete \([A\mid\mathbf{b}]\)) | D4 | lesson | ✅ `sys-translate-augmented-fresh` (**matrix-entry**, all six entries, fresh) + `sys-column-reading` (MC, E1) | **E3** — fresh production of the whole augmented matrix | E3 |
| Characterize which \(\mathbf{b}\) are inconsistent (dependent cols) | D5/D7 | lesson | 🟡 `sys-construct-inconsistent` (**construct-in-explorer**, fresh cols, checked by `classifyLinearSystem2x2`); `sys-generalize-inconsistent` (MC, E1) | **E3 construction** — genuine graded production, but *within the taught pattern*; the unfamiliar-transfer E4 variant is deferred to the module set | E4 |
| Reason about the dependent-count mechanism | D5 | lesson | 🟡 `sys-reason-dependent-count` (**self-check**, produced reasoning); `sys-counterexample-uniqueness` (committed-MC, E1) | **E6 surface, unscored** — reasoning is now *produced* (not chosen), but the self-mark is not scoring; recognition backup is E1 | E3 (scored) |
| Justify consistency ⇔ \(\mathbf{b}\in\operatorname{Col}(A)\) | D6 | lesson | 🟡 `sys-prove-consistency` (**self-check**, both directions) | **E6 surface, unscored** — learner writes the proof + model answer/rubric, but the self-mark is not scoring | E6 (human-scored) |
| Prove the trichotomy (no determinant) | D6 | lesson | 🟡 `sys-prove-trichotomy` (**self-check**, general nonzero null-relation \(\alpha\mathbf{a}_1+\beta\mathbf{a}_2=\mathbf{0}\), incl. zero column & zero matrix) | **E6 surface, unscored** — proof captured; credit pending human scoring | E6 (human-scored) |
| Select rows-vs-columns unprompted | D8 | ⬜ **module** | module set (not built) | not built | E3 (Gate 9) |
| Recognize \(A\mathbf{x}=\mathbf{b}\) in a cumulative item | D9/D10 | ⬜ **module** | module set (not built) | not built | E4/E5 (Gate 9) |

#### Evidence audit (runtime-checked)

Rules applied (from [mastery-standard §5](../../../../authoring/mastery-standard.md#5-evidence-levels)),
**stricter than the previous pass**:
`prediction` auto-returns `correct: true` → **E1 exposure**;
`multiple-choice` **and committed `multiple-choice`** are **E1 recognition**
(commit-before-reveal is *valid* evidence but does **not** by itself reach E3);
near-copy graded production (worked numbers) is **E2 reproduction**;
**E3 requires fresh, unaided production of the *complete* outcome**;
**E4 requires unfamiliar transfer/construction**, not a renamed recognition;
`self-check` is self-marked → an **unscored E6 surface**, not E6 (or E3-reasoning)
evidence. Result for L3: the **row-solve + column-confirmation** (D3) and the
**complete translation** (D4) now reach **E3** (fresh production); the inconsistency
**construction** (D5/D7) is a genuine graded production (E3, within the taught
pattern); but **classification stays E1** (a three-way choice), the **dependent-count
reasoning** is a produced-but-unscored surface, and the **two D6 proofs** are unscored
E6 surfaces. Several lesson-owned outcomes therefore remain below their required level,
so **Gate 8 is NOT PASSED** (see [§6](#6-acceptance-record-gate-8)). Fresh numbers and
each new item's correct/incorrect grading paths are verified in
[`freshExample.test.ts`](../../../../../src/lessons/__tests__/freshExample.test.ts) and
[`remediationExercises.test.ts`](../../../../../src/lessons/__tests__/remediationExercises.test.ts).

### 1e. Coverage-status classification (required vs reached)

Honest ceiling: the row-solve+confirm and complete-translation outcomes reach **E3**
(fresh production); the inconsistency construction is a fresh graded **E3** production;
**classification remains E1**; the dependent-count reasoning and both proofs are
**produced but unscored surfaces**.

- **Taught (level 1):** all listed content is presented.
- **Independently demonstrated (E3) — reached:** fresh row-solve **and** column
  confirmation (`sys-solve-confirm-fresh`); complete augmented-matrix translation
  (`sys-translate-augmented-fresh`); fresh graded construction of an inconsistent
  \(\mathbf{b}\) (`sys-construct-inconsistent`).
- **Recognition only (E1 — below required):** classification (`sys-count-*`,
  `sys-classify-fresh`), column-reading, generalize, invertibility-link, and the
  committed-MC counterexample item.
- **Produced but unscored surface (🟡):** `sys-reason-dependent-count` (reasoning),
  `sys-prove-consistency`, `sys-prove-trichotomy` (proofs) — the in-app `self-check`
  mark is **not** scoring; human scoring is owned by the module assessment (Package F).
- **Module-owned (planned Gate 9):** method selection (D8); cumulative recognition.

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** fires L1 basis ⇔ unique coordinates as "unique
  solution for every \(\mathbf{b}\)"; fires L2 columns rule as the column picture.
- **Assessment evidence (summary):** classification is recognition MC — including a
  *fresh* committed classification (`sys-classify-fresh`) that is still **E1**; Explore
  (drag \(\mathbf{b}\)); Practice includes **fresh-instance** production of the complete
  outcomes — row-solve **and** column-confirmation (`sys-solve-confirm-fresh`, E3) and
  the full augmented matrix (`sys-translate-augmented-fresh`, E3) — a **graded
  construction** on fresh columns (`sys-construct-inconsistent`, E3), a **produced**
  dependent-count reasoning surface (`sys-reason-dependent-count`, unscored), and two
  **learner-written proof surfaces** (unscored). Honest ceiling: **E3 for the two
  computational outcomes and the construction**; classification stays **E1**; reasoning
  and proofs are **produced but unscored**. See the
  [evidence audit](#evidence-audit-runtime-checked).
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

Gate 8 certifies **this lesson** on its **lesson-owned** outcomes. It is a **single
gate**: it cannot PASS while *any* lesson-owned outcome remains below its required level
or while proof evidence is unscored. Status of the build after the lesson-owned
remediation, under the **P3 override**, against the runtime audit
([§1d](#1d-outcomes-each-paired-with-evidence)):

- [x] Insight Contract linked and `PASS` (trichotomy derived without the determinant;
      general nonzero null-relation proof); primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [x] **Two computational outcomes reach E3:** row-solve **and** column confirmation
      (`sys-solve-confirm-fresh`) and the complete augmented-matrix translation
      (`sys-translate-augmented-fresh`) are fresh, unaided production of the full outcome.
- [ ] **Classification (D1/D5) reaches its required E3 — NOT YET.** All classification
      items (incl. the fresh `sys-classify-fresh`) are three-way choices → **E1
      recognition**. A fresh *production* of the none/one/∞ result is still missing.
- [ ] **Characterization (D5/D7) reaches its required E4 — NOT YET.** The construction
      is a genuine graded **E3**, but within the taught pattern; the unfamiliar-transfer
      E4 variant is deferred to the module set.
- [ ] **Dependent-count reasoning reaches scored E3 — NOT YET.** Now *produced*
      (`sys-reason-dependent-count`) rather than chosen, but the `self-check` mark is not
      scoring.
- [ ] **Every lesson-owned P3 (proof) outcome reaches independently demonstrated —
      NOT YET.** `sys-prove-consistency` / `sys-prove-trichotomy` are genuine E6
      *surfaces*, but `self-check` is self-marked, so **E6 credit is blocked on human
      scoring** (Package F / module assessment).
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D8; D10).
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (lint + unit tests green, incl. fresh-example and new-item
      grading tests).
- [ ] No rejection condition holds — **still open**: classification/characterization
      below level, and proof/reasoning evidence unscored.

**Verdict: Gate 8 NOT PASSED.** The remediation genuinely lifted two computational
outcomes to fresh E3 production and added a fresh graded construction, a produced
reasoning surface, and a corrected general proof surface — real progress over the
earlier exposure/reproduction build. But Gate 8 is a single gate and cannot pass while
(a) classification is still E1 recognition, (b) the characterization outcome's required
E4 unfamiliar-transfer is not yet built, and (c) the reasoning/proof surfaces are
unscored. Remaining lesson-owned gaps are enumerated in the module
[implementation package](../../modules/systems-elimination/implementation-package.md);
proof/reasoning *scoring* is module infrastructure (Package F).
