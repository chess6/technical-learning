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

| Outcome (operational) | Dimension | Owner | Built item (type) | Current honest level | Required |
| --- | --- | --- | --- | --- | --- |
| Classify none/one/∞ before solving | D1/D5 | lesson | `sys-count-infinite`, `sys-count-none` (multiple-choice) | **E1** — recognition on the lesson's *own* worked systems | E3 |
| Solve a 2×2 by rows + confirm by columns | D3 | lesson | `sys-solve-unique` (vector) | **E2** — graded production, but reuses the worked numbers (near-copy) | E3 |
| Translate a system to \(A,\mathbf{b}\); read the column meaning | D4 | lesson | `sys-translate-columns` (vector), `sys-column-reading` (MC) | **E2 / E1** — near-copy production / definition recognition | E3 |
| Characterize which \(\mathbf{b}\) are inconsistent (dependent cols) | D5/D7 | lesson | `sys-generalize-inconsistent` (MC); `sys-construct-inconsistent` (**prediction**) | **E1–E2** — MC recognition; the "construct" item is a **reveal-only `prediction`** (auto-"correct", no answer captured) | E4 |
| Justify consistency ⇔ \(\mathbf{b}\in\operatorname{Col}(A)\) | D6 | lesson | — (`sys-explain-dependent`, `sys-counterexample-uniqueness` are **prediction**) | **E1** — reveal-only exposure; no graded/scored justification | E6 |
| Prove the trichotomy | D6 | lesson | — | **none** — no proof item; a `self-check` would be self-marked, **not** proof evidence | E6 |
| Select rows-vs-columns unprompted | D8 | **module** | module set (not built) | not built | E3 (Gate 9) |
| Recognize \(A\mathbf{x}=\mathbf{b}\) in a cumulative item | D9/D10 | **module** | module set (not built) | not built | E4/E5 (Gate 9) |

#### Evidence audit (runtime-checked)

Rules applied (from [mastery-standard §5](../../../../authoring/mastery-standard.md#5-evidence-levels)):
ordinary `prediction` auto-returns `correct: true` and captures no answer → **E1
exposure, never demonstration**; same-example multiple-choice is **E1 recognition**;
near-copy graded production (worked numbers) is **E2 reproduction**; **E3+ requires a
fresh, unaided instance**; `self-check` is self-marked (not human-scored) → **not
proof evidence**. Result for L3: **highest genuine level is E2**; every item is
recognition-only, reveal-only, or near-copy. **No lesson-owned outcome is
independently demonstrated.**

### 1e. Coverage-status classification (required vs reached)

Honest ceiling under the runtime audit: **E1–E2. No lesson-owned core outcome
reaches "independently demonstrated" (E3+).**

- **Taught (level 1):** all listed content is presented.
- **Practiced (level 2) — the ceiling actually reached:** row-solve/column-check and
  translate, but only on the running numbers (E2 near-copy).
- **Reveal-only (not evidence):** `sys-construct-inconsistent`,
  `sys-counterexample-uniqueness`, `sys-explain-dependent` are `prediction` items
  (E1 exposure); previously mislabeled E3/E4.
- **Recognition-only:** classification and column-reading MC are E1 on the lesson's
  own examples.
- **No proof evidence:** the two D6 outcomes have no graded/scored justification;
  `self-check` cannot supply E6.
- **Module-owned (planned Gate 9):** method selection (D8); cumulative recognition.

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** fires L1 basis ⇔ unique coordinates as "unique
  solution for every \(\mathbf{b}\)"; fires L2 columns rule as the column picture.
- **Assessment evidence (summary):** 2 Check (same-example MC classify), Explore (drag
  \(\mathbf{b}\)), Practice = near-copy row-solve/translate (E2) + several **reveal-only
  `prediction`** items (E1). **Most of the surface either recognizes or re-runs the
  taught example** — the honest ceiling is E1–E2 (see the [evidence
  audit](#evidence-audit-runtime-checked)).
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

Gate 8 certifies **this lesson** on its **lesson-owned** outcomes. Honest status of
the current build under the **P3 override**, corrected against the runtime evidence
audit ([§1d](#1d-outcomes-each-paired-with-evidence)):

- [x] Insight Contract linked and `PASS` (trichotomy now derived without the
      determinant); primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [ ] Every **lesson-owned** core outcome reaches **independently demonstrated with
      real in-lesson evidence** — **FAILS**: the honest ceiling is **E2**. Every item
      is same-example recognition (E1), reveal-only `prediction` (E1), or near-copy
      production (E2). **No E3+ evidence exists.**
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D8; D10).
- [ ] Assessment set matches §3c — **FAILS**: no fresh-instance E3 item; no
      proof item; three of the "practice" items are reveal-only predictions.
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (built lesson has passing math/tests).
- [ ] No rejection condition holds — **trips #3 (near-copy / reveal-only practice,
      no fresh E3), #5 (theorems asserted; no justification evidence), #7 (graded
      items re-run instruction / are reveal-only), #8 (lesson-owned outcomes stall at
      E1–E2)**.
- [ ] Profile-dependent items (D6 proof depth) match the declared profile — **FAILS**
      (no proof evidence of any kind).

**Corrected verdict: Gate 8 NOT PASSED.** Earlier acceptance "for P1/P2 coverage" was
**inflated** — recognition/reveal/near-copy items do not evidence independent
demonstration at any profile. The lesson currently supports **exposure and
reproduction (E1–E2) only**. Remaining **lesson-owned** work → implementation-package
items **B–E** (fresh E3 production, transfer/construction, proof under human scoring,
and de-inflated Checks). Module-owned outcomes → Gate 9.
