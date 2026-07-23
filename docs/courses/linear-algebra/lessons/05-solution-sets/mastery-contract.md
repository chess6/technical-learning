# Lesson Mastery Contract — Solution Sets & Homogeneous Systems (L5)

Per-lesson mastery gate (Gate 5/8), completed after the
[Approved Insight Contract](insight.md) (`PASS`). Template:
[authoring/templates/lesson-mastery-contract.md](../../../../authoring/templates/lesson-mastery-contract.md).

**Retrospective** for the built lesson (`src/lessons/solutionSets.ts`). This lesson
already had a `PASS` insight contract, brief, and
[lesson plan](lesson-plan.md); this contract completes the missing mastery artifact.
Acceptance record is filled honestly under the **P3 override**; open boxes feed the
module [implementation package](../../modules/systems-elimination/implementation-package.md).

---

## 1. The contract fields

### 1a. Placement & upstream links
- **Lesson / spine position:** L5 solution-sets ([spine](../../course-spine.md),
  module `systems-elimination`).
- **Core course profile in force:** **P3 override** on this module
  ([course-spine §0](../../course-spine.md#0-declared-course-target-gate-1)); course
  primary P2.
- **Research-bridge overlay?** yes (course-wide) — enrichment only (D14).
- **Approved Insight Contract:** [insight.md](insight.md) — `PASS`; primary insight
  linked, not copied.
- **Saved as:** `docs/courses/linear-algebra/lessons/05-solution-sets/mastery-contract.md`.
- **Concept ids introduced / reused:** homogeneous system, null space
  \(\operatorname{Null}(A)\), affine set vs subspace, free variable, particular
  solution \(\mathbf{x}_p\), nullity (reuses L3 consistency/trichotomy, L4 free
  variables via elimination, L1 subspace/span) — see
  [curriculum-architecture §3](../../curriculum-architecture.md).

### 1b. Role, bridge, and need
- **Lesson role:** pins down L3's "infinitely many" into one reusable structure
  \(\mathbf{x}_p+\operatorname{Null}(A)\), and seeds L8/L9 (column space vs null
  space, rank–nullity).
- **Prerequisite knowledge to retrieve:** L3's dependent system and its solutions;
  consistency = \(\mathbf{b}\) in the column span; L4 elimination → free variables;
  L1 subspace closure.
- **Bridge from previous lesson:** "Elimination (L4) exposed the free variable and
  \(\mathbf{x}_p\); now organize *all* the solutions those produce."
- **Motivating problem:** knowing one solution and finding a second, can you produce
  a third without solving — and describe the whole set?

### 1c. Content to teach (the coverage core)
- **Approved central insight:** *(link only)* [insight.md](insight.md).
- **Required definitions & notation (D2):** homogeneous system \(A\mathbf{x}=\mathbf{0}\);
  null space \(\operatorname{Null}(A)\); particular solution \(\mathbf{x}_p\); affine
  set vs subspace; free variable; nullity. *(Built: `def-homogeneous`.)*
- **Required mathematical objects:** \(\operatorname{Null}(A)\) as a subspace; the
  affine set \(\mathbf{x}_p+\operatorname{Null}(A)\); a null basis vector per free
  variable.
- **Procedures requiring fluency (D3):** generate a new solution from a known one +
  a null vector; write the complete solution set parametrically
  \(\{\mathbf{x}_p+\sum t_i\mathbf{v}_i\}\); count free variables → dimension.
  *(Built: `sol-generate-third`, `sol-whole-set`, `sol-free-variables-dimension`.)*
- **Theorems / propositions / corollaries (D5):** null space is a subspace;
  solution-set structure \(\operatorname{Sol}=\mathbf{x}_p+\operatorname{Null}(A)\)
  (∅ if inconsistent); uniqueness ⇔ trivial null space (≠ reachability). *(Built:
  `thm-null-subspace`, `thm-solution-structure`, `cor-uniqueness`.)*
- **Expected proof / justification depth (D6, P3):** **proof constructed** — the
  learner proves (a) null-space closure from linearity, and (b) the structure theorem
  in **both inclusions** (⊇ generate; ⊆ difference), stating where consistency is
  used. *(Built: both proofs are **presented** in `math-note` layers, but no learner
  proof-construction item — see gap below.)*
- **Required representations (D4):** symbolic (\(\mathbf{x}_p+\operatorname{Null}(A)\),
  parametric form), visual (two parallel sets: null line through origin, solution set
  through \(\mathbf{x}_p\); one slider per free variable), operational (subtract/add
  solutions). *(Built: guided scene + explorer.)*
- **Translations learners must perform (D4):** free-variable count ↔ dimension ↔
  picture; difference of solutions ↔ null vector; slider ↔ null basis direction.
- **Examples, nonexamples, edge cases (D7):** dependent \((1,2),(2,4)\), \(\mathbf{b}=(3,6)\)
  (affine line); the **nullity-2** case \(A=\mathbf{0}\) in the plane (one difference
  undercounts); inconsistent \(\mathbf{b}=(3,5)\) (∅, cannot write \(\mathbf{x}_p+\operatorname{Null}\)).
  *(Built: `sol-nullity-caveat`, `sol-inconsistent-empty`, callouts.)*
- **Misconceptions (D13 seed):** "∞ is shapeless"; "one difference gives the whole
  set"; "trivial null space ⇒ every \(\mathbf{b}\) solvable"; "solution set is a
  subspace." *(Built: three callouts + traps.)*

### 1d. Outcomes, each paired with evidence

Every core outcome's **required** level is *independently demonstrated* (E3+); the
**current honest level** is the runtime behavior audited against
[`src/lessons/capabilities.ts`](#evidence-audit-runtime-checked) — not the tier label.

| Outcome (operational) | Dimension | Owner | Built item (type) | Current honest level | Required |
| --- | --- | --- | --- | --- | --- |
| Show the difference of two solutions lies in \(\operatorname{Null}(A)\) | D5/D6 | lesson | `sol-difference-homogeneous` (multiple-choice) | **E1** — recognition | E3 |
| Generate a third solution without re-solving | D3 | lesson | `sol-generate-third` (vector) | **E2** — graded production, but reuses the worked numbers *and hands over the null vector* (near-copy) | E3 |
| Write the complete solution set parametrically; name direction & location | D3/D4 | lesson | `sol-whole-set` (**prediction**) | **E1** — reveal-only exposure (auto-"correct", no answer captured) | E3/E4 |
| Distinguish one-difference (≥ a line) from the whole null space | D5/D7 | lesson | `sol-nullity-caveat` (multiple-choice) | **E1–E2** — recognition (the \(A=\mathbf{0}\) scenario is fresh-ish but still MC) | E4 |
| Separate existence (reachability) from multiplicity (trivial null space) | D5 | lesson | `sol-existence-vs-multiplicity` (multiple-choice) | **E1** — recognition | E3 |
| Refuse the decomposition for an inconsistent system (∅) | D7 | lesson | `sol-inconsistent-empty` (**prediction**) | **E1** — reveal-only exposure | E4 |
| Read dimension off the free-variable count | D3/D4 | lesson | `sol-free-variables-dimension` (multiple-choice) | **E1–E2** — recognition | E3 |
| Prove the structure theorem (both inclusions) + null-space closure | D6 | lesson | — | **none** — proofs are *presented* only; no graded/scored item; `self-check` would be self-marked | E6 |
| Operate on a **general \(\mathbb{R}^n\)** null space / rank–nullity | D4/D9 | **module** | deferred → structure module L8/L9 (see §1g) | not built | E4/E5 (structure module) |
| Combine elimination (L4) + solution-set structure (mixed cumulative) | D10 | **module** | module set (not built) | not built | E5 (Gate 9) |
| Transfer "general = particular + homogeneous" to an unfamiliar operator | D9/D14 | **module** | module set (not built) | not built | E4 (Gate 9) / D14 enrichment |

#### Evidence audit (runtime-checked)

`prediction` items (`sol-whole-set`, `sol-inconsistent-empty`) auto-return `correct`
and capture no answer ⇒ **E1 exposure**, not the E3/E4 their tiers claimed. The
multiple-choice items are **E1 recognition**. `sol-generate-third` is the only graded
production and it is near-copy (worked numbers, null vector supplied) ⇒ **E2**. No
proof item exists; a `self-check` would be self-marked, not proof. **Result for L5:
honest ceiling E2; no lesson-owned outcome independently demonstrated; no proof
evidence.**

### 1e. Coverage-status classification (required vs reached)
Honest ceiling under the runtime audit: **E1–E2. No lesson-owned core outcome reaches
"independently demonstrated" (E3+).**
- **Practiced (level 2) — ceiling reached:** `sol-generate-third` only, and near-copy.
- **Reveal-only (not evidence):** `sol-whole-set`, `sol-inconsistent-empty`
  (`prediction`, E1) — previously mislabeled E3/E4.
- **Recognition-only:** the four multiple-choice items (E1–E2).
- **No proof evidence:** structure theorem + null-space closure are presented but
  never graded/scored.
- **Module-owned (planned):** general \(\mathbb{R}^n\) null space / rank–nullity
  (abstraction return, owner structure module); cumulative L4+L5; ODE/recurrence
  transfer (D14 enrichment).

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** sharpens L3's trichotomy (∞ ⇒
  \(\mathbf{x}_p+\operatorname{Null}(A)\)); uses L4 elimination for the free-variable
  basis; uses L1 subspace closure.
- **Assessment evidence (summary):** 1 Check (recognition, E1); Explore (sliders =
  null directions); Practice = one near-copy `generate` (E2) + four recognition MC
  (E1–E2) + two **reveal-only `prediction`** items (`sol-whole-set`,
  `sol-inconsistent-empty`, E1). Honest ceiling E2 (see the [evidence
  audit](#evidence-audit-runtime-checked)).
- **Delayed-retention requirement (D12):** \(\mathbf{x}_p+\operatorname{Null}(A)\),
  affine-vs-subspace, and uniqueness-≠-reachability must resurface in the module
  spaced set and again in L8 (column vs null space) and L9 (rank–nullity).
- **Connection to later lessons:** forward edge to L8/L9 — built `looking-ahead` in
  `free-variables` ("this becomes rank–nullity").

### 1g. Correctness & scope
- **Mathematical correctness checks:** \(A\mathbf{x}\), null vectors, and the
  parametric set from `src/math`/`exampleData`; the **nullity-2** degenerate case
  \(A=\mathbf{0}\) must be handled honestly (one difference undercounts); inconsistent
  case returns ∅. Link
  [engineering/math-correctness.md](../../../../engineering/math-correctness.md),
  [quality/lesson-correctness-checklist.md](../../../../quality/lesson-correctness-checklist.md).
- **Accountable abstraction-return deferral (SEMANTIC_PAGE_GRAMMAR §4.3):** full
  \(\mathbb{R}^n\) null space and rank–nullity are exercised only symbolically /
  via free-variable count here (2D visual language). **Owner:** the **structure
  module** (L8 subspaces & rank, L9 rank–nullity). **Destination:** general
  \(\mathbb{R}^n\) null space, \(\operatorname{rank}+\dim\operatorname{Null}=n\).
  **Evidence:** recorded in the module
  [assessment plan](../../modules/systems-elimination/assessment-plan.md#abstraction-return-deferrals-discharged-here)
  and discharged in the structure module's own assessment. Logged so the 2D
  restriction is not a silent trap (rejection #4 avoided).
- **Lesson-specific exclusions / scope boundaries:** rank–nullity stated as a preview,
  not proved here; 3-variable planes shown via free-variable count, not a full 3D
  scene.

---

## 6. Acceptance record (Gate 8)

Honest status of the current build under the **P3 override**, corrected against the
runtime evidence audit ([§1d](#1d-outcomes-each-paired-with-evidence)):

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [ ] Every **lesson-owned** core outcome reaches **independently demonstrated with
      real in-lesson evidence** — **FAILS**: honest ceiling **E2**. Two "transfer"
      items are reveal-only `prediction` (E1); the rest are MC recognition (E1) or one
      near-copy production (E2). **No E3+ evidence.**
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D10; ℝⁿ
      abstraction return; ODE transfer), not claimed mastered.
- [ ] Assessment set matches §3c — **FAILS** under P3: no proof item, no fresh-instance
      procedural item, and two Practice items are reveal-only predictions.
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (built lesson has passing math/tests, incl. nullity-2).
- [x] Abstraction return **accountably deferred** (owner/destination/evidence logged) — #4 not tripped.
- [ ] No rejection condition holds — **trips #3 (near-copy / reveal-only, no fresh E3),
      #5 (theorems asserted; no justification evidence), #7 (reveal-only items), #8
      (lesson-owned outcomes stall at E1–E2)**.
- [ ] Profile-dependent items (D6 proof depth) match P3 — **FAILS** (no proof evidence).

**Corrected verdict: Gate 8 NOT PASSED.** The lesson's *content* is rich and its
abstraction-return deferral is accountable, but its **evidence** is E1–E2 only: two
"transfer" items are reveal-only predictions, the rest recognition or near-copy, and
the proofs are presented but never scored. Remaining **lesson-owned** work →
implementation-package items **B** (fresh E3 production), **C** (de-inflate the
reveal-only Checks), **D** (fresh E4 transfer/construction), **E** (human-scored
proof). Module-owned outcomes (ℝⁿ return, cumulative, transfer) → Gate 9 / structure
module.
