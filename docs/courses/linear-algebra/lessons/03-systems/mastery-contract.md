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

| Outcome (operational) | Dimension | Owner | Target level | Evidence item | Highest attainment required |
| --- | --- | --- | --- | --- | --- |
| Classify none/one/∞ for a given \(2\times2\) system *before* solving, from (reachable?)×(independent?) | D1/D5 | lesson | E3 | `sys-count-infinite`, `sys-count-none` (built) | independently demonstrated |
| Solve a \(2\times2\) system by rows and confirm by the column blend | D3 | lesson | E3 | `sys-solve-unique` (built) — **but reuses worked numbers**; needs a **fresh-instance** drill | independently demonstrated |
| Translate a system to \(A,\mathbf{b}\) and read the column-picture meaning | D4 | lesson | E3 | `sys-translate-columns`, `sys-column-reading` (built) | independently demonstrated |
| State & justify: consistency ⇔ \(\mathbf{b}\in\operatorname{Col}(A)\) | D6 | lesson | E6 | **gap** — no proof-construction item (needs `self-check`) | independently demonstrated |
| Prove the trichotomy (independent ⇒ unique ∀\(\mathbf{b}\); dependent ⇒ none/∞) | D6 | lesson | E6 | **gap** — `sys-explain-dependent` is an informal `prediction`, not a P3 proof-construction item | independently demonstrated |
| Given dependent columns, characterize exactly which \(\mathbf{b}\) are inconsistent | D5/D7 | lesson | E4 | `sys-construct-inconsistent`, `sys-generalize-inconsistent` (built) | independently demonstrated |
| Select rows-vs-columns unprompted on a mixed problem | D8 | **module** | E3 | module method-selection set (Gate 9) | independently demonstrated (Gate 9) |
| Recognize \(A\mathbf{x}=\mathbf{b}\) structure inside an unfamiliar cumulative item | D9/D10 | **module** | E4/E5 | module cumulative set (Gate 9) | independently demonstrated (Gate 9) |

### 1e. Coverage-status classification (required vs reached)

- **Independently demonstrated (built):** classification of the count; translate to
  \(A,\mathbf{b}\); characterize inconsistent \(\mathbf{b}\).
- **Practiced but not yet on a fresh instance:** row-solve + column-check (drills
  reuse the running numbers) — **reaches "practiced," required "independently
  demonstrated."** Gap.
- **Taught only (P3 proof depth not yet demonstrated by learner):** the two proof
  outcomes (consistency⇔span; trichotomy) are *presented* with "why" layers but have
  no learner proof-construction item — **reaches "taught," required "independently
  demonstrated."** Gap (rejection #5/#8 under P3).
- **Module-owned (planned Gate 9):** method selection (D8); cumulative recognition.

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** fires L1 basis ⇔ unique coordinates as "unique
  solution for every \(\mathbf{b}\)"; fires L2 columns rule as the column picture.
- **Assessment evidence (summary):** 2 Check (MC classify), Explore (drag
  \(\mathbf{b}\)), Practice drills + transfer/prediction items. Does not merely
  repeat instruction, **except** the row-solve drill reuses the worked numbers.
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
the current build under the **P3 override**:

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [ ] Every **lesson-owned** core outcome reaches **independently demonstrated with
      real in-lesson evidence** — **NOT YET**: (i) row-solve/column-check has no
      fresh-instance E3 drill; (ii) the two D6 proof outcomes have no learner
      proof-construction item required by P3.
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D8
      selection; D10 cumulative), not claimed mastered.
- [ ] Assessment set matches §3c — **NOT YET** under P3: missing a proof-construction
      item; the fresh-instance procedural item is missing.
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (built lesson has passing math/tests).
- [ ] No rejection condition holds — **currently trips #3 (near-copy drill),
      #5/#8 (asserted theorem / lesson-owned proof outcome at "taught" under P3)**.
- [ ] Profile-dependent items (D6 proof depth) match the declared profile — **NOT
      YET** (P3 proof construction absent).

**Verdict:** the lesson is **accepted for P1/P2 content coverage** but **does not yet
meet the P3 override**. Remaining **lesson-owned** gaps → implementation package
items **B (proof construction)** and **C (fresh drills)**. Module-owned outcomes → Gate 9.
