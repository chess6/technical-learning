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
  *(Built: `sol-generate-third[-fresh]`; `sol-produce-parametric-fresh` — the learner
  **produces** \(\mathbf{x}_p\), a null direction, and an instantiation, replacing the
  reveal/choice `sol-whole-set`; `sol-free-variables-dimension` (MC) +
  `sol-freevars-dimension-fresh` (produced counts).)*
- **Theorems / propositions / corollaries (D5):** null space is a subspace;
  solution-set structure \(\operatorname{Sol}=\mathbf{x}_p+\operatorname{Null}(A)\)
  (∅ if inconsistent); uniqueness ⇔ trivial null space (≠ reachability). *(Built:
  `thm-null-subspace`, `thm-solution-structure`, `cor-uniqueness`.)*
- **Expected proof / justification depth (D6, P3):** **proof constructed** — the
  learner proves (a) null-space closure from linearity, and (b) the structure theorem
  in **both inclusions** (⊇ generate; ⊆ difference), stating where consistency is
  used. *(Built: both proofs are presented in `math-note` layers **and** now have
  learner proof-construction items — `sol-prove-null-subspace`, `sol-prove-structure`
  (`self-check` + model answer + rubric). These are E6 **surfaces**: `self-check` is
  self-marked, so E6 **credit** awaits human scoring, implementation-package Package F.)*
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
Canonical rule applied strictly: **committed `multiple-choice` is E1 recognition**;
displayed/parametric formulas the learner only *chooses* are not production.

Status key: ✅ lesson-owned outcome reaches its required scored level in-app;
🟡 produced surface built but level awaits human scoring; 🔴 lesson-owned outcome still
below its required level; ⬜ module-owned.

| Outcome (operational) | Dimension | Owner | Built item (type) | Current honest level | Required |
| --- | --- | --- | --- | --- | --- |
| Show the difference of two solutions lies in \(\operatorname{Null}(A)\) | D5/D6 | lesson | 🔴 `sol-difference-homogeneous` (multiple-choice) | **E1** — recognition | E3 |
| Generate a third solution without re-solving | D3 | lesson | ✅ `sol-generate-third-fresh` (vector, **fresh**) + `sol-generate-third` | **E3** — fresh, unaided production graded against `src/math` | E3 |
| **Produce** the complete parametric solution set (\(\mathbf{x}_p\), direction, instantiation) | D3/D4 | lesson | ✅ `sol-produce-parametric-fresh` (**exercise-sequence**, fresh: learner produces \(\mathbf{x}_p\), a null direction, and a point at \(t=2\)) | **E3** — fresh production of the whole set (not a chosen formula) | E3 |
| Distinguish one-difference (≥ a line) from the whole null space | D5/D7 | lesson | 🟡 `sol-justify-one-direction` (**self-check**, produced reasoning + nullity-2 counterexample); `sol-nullity-caveat` (MC, E1) | **E6 surface, unscored** for the produced justification; recognition backup E1 | E4 |
| Separate existence (reachability) from multiplicity (trivial null space) | D5 | lesson | 🟡 `sol-justify-existence-multiplicity` (**self-check**, produced reasoning); `sol-existence-vs-multiplicity` (MC, E1) | **E6 surface, unscored** for the produced justification; recognition backup E1 | E3 (scored) |
| Refuse the decomposition for an inconsistent system (∅) | D7 | lesson | 🔴 `sol-inconsistent-empty` (**committed-prediction** = committed-MC, fresh target) | **E1** — committed choice is recognition, not construction | E4 |
| Read dimension off the free-variable count | D3/D4 | lesson | ✅ `sol-freevars-dimension-fresh` (**exercise-sequence**, fresh: produce #free variables + dimension) + `sol-free-variables-dimension` (MC, E1) | **E3** — fresh production of the counts (shallow but unaided) | E3 |
| Prove the structure theorem (both inclusions) + null-space closure | D6 | lesson | 🟡 `sol-prove-structure`, `sol-prove-null-subspace` (**self-check** + model answer + rubric) | **E6 surface, unscored** — learner writes both proofs; self-mark is not scoring | E6 (human-scored) |
| Operate on a **general \(\mathbb{R}^n\)** null space / rank–nullity | D4/D9 | ⬜ **module** | deferred → structure module L8/L9 (see §1g) | not built | E4/E5 (structure module) |
| Combine elimination (L4) + solution-set structure (mixed cumulative) | D10 | ⬜ **module** | module set (not built) | not built | E5 (Gate 9) |
| Transfer "general = particular + homogeneous" to an unfamiliar operator | D9/D14 | ⬜ **module** | module set (not built) | not built | E4 (Gate 9) / D14 enrichment |

#### Evidence audit (runtime-checked)

Applied strictly: **committed `multiple-choice` (`committed-prediction`) is E1
recognition** — so `sol-inconsistent-empty` is **E1**, not E3, and the old `sol-whole-set`
(a choice among displayed formulas) was recognition, now **replaced** by a produced
sequence. `self-check` self-marks and is never scored in-app ⇒ every proof/justification
self-check is an **unscored E6 surface**. **Result for L5:** generativity
(`sol-generate-third-fresh`), the **produced** parametric set
(`sol-produce-parametric-fresh`), and the **produced** free-variable/dimension counts
(`sol-freevars-dimension-fresh`) reach **E3**. The one-difference and existence-vs-
multiplicity outcomes now have *produced* reasoning surfaces (`sol-justify-one-direction`,
`sol-justify-existence-multiplicity`) but they are **unscored**, and their recognition
backups are E1; the inconsistency-refusal outcome is **E1** (committed-MC); the two D6
proofs are unscored E6 surfaces. Several lesson-owned outcomes remain below required, so
**Gate 8 is NOT PASSED**. Fresh numbers and each new item's grading paths are verified in
[`freshExample.test.ts`](../../../../../src/lessons/__tests__/freshExample.test.ts) and
[`remediationExercises.test.ts`](../../../../../src/lessons/__tests__/remediationExercises.test.ts).

### 1e. Coverage-status classification (required vs reached)
Honest ceiling: generativity, the produced parametric set, and the produced
free-variable/dimension counts reach **E3**; the one-difference / existence-multiplicity
justifications and both proofs are **produced but unscored surfaces**; the
inconsistency-refusal outcome is **E1 recognition**. (Genuine **E4 transfer** — ℝⁿ /
unfamiliar-operator — remains **module-owned**, Gate 9 / structure module.)
- **Independently demonstrated (E3) — reached:** fresh generate-a-third
  (`sol-generate-third-fresh`); **produced** parametric set
  (`sol-produce-parametric-fresh`); **produced** free-variable/dimension counts
  (`sol-freevars-dimension-fresh`).
- **Produced but unscored surface (🟡):** `sol-justify-one-direction`,
  `sol-justify-existence-multiplicity` (reasoning); `sol-prove-structure`,
  `sol-prove-null-subspace` (proofs) — captured against a model answer + rubric; the
  in-app self-mark is not scoring (Package F).
- **Recognition only (E1 — below required):** `sol-difference-homogeneous`,
  `sol-inconsistent-empty`, and the MC backups.
- **Module-owned (planned):** general \(\mathbb{R}^n\) null space / rank–nullity
  (abstraction return, owner structure module); cumulative L4+L5; ODE/recurrence
  transfer (D14 enrichment).

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** sharpens L3's trichotomy (∞ ⇒
  \(\mathbf{x}_p+\operatorname{Null}(A)\)); uses L4 elimination for the free-variable
  basis; uses L1 subspace closure.
- **Assessment evidence (summary):** 1 Check (recognition, E1); Explore (sliders =
  null directions); Practice includes a **fresh** generate-a-third (E3), a **produced**
  parametric-set sequence (E3), a **produced** free-variable/dimension sequence (E3),
  recognition MC backups (E1), a committed-MC inconsistency-refusal (E1), two **produced
  reasoning surfaces** (existence-vs-multiplicity, one-direction; unscored), and two
  **learner-written proof surfaces** (unscored). Honest ceiling **E3** for generativity,
  the produced parametric set, and the produced counts; the justifications/proofs are
  produced but unscored; inconsistency-refusal is E1 (see the
  [evidence audit](#evidence-audit-runtime-checked)).
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

Gate 8 is a **single gate** and cannot PASS while any lesson-owned outcome is below its
required level or proof evidence is unscored. Status after the lesson-owned remediation,
under the **P3 override**, against the runtime audit
([§1d](#1d-outcomes-each-paired-with-evidence)):

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [x] **Generativity, the produced parametric set, and the produced
      free-variable/dimension counts reach E3** — fresh graded production
      (`sol-generate-third-fresh`, `sol-produce-parametric-fresh`,
      `sol-freevars-dimension-fresh`).
- [ ] **Inconsistency-refusal (D7) reaches its required E4 — NOT YET.**
      `sol-inconsistent-empty` is committed-MC → **E1 recognition**, not construction.
- [ ] **One-difference-vs-whole-null-space (D5/D7) reaches E4 — NOT YET.** Now a
      *produced* justification (`sol-justify-one-direction`) plus an E1 MC, but the
      justification is unscored.
- [ ] **Existence-vs-multiplicity (D5) reaches scored E3 — NOT YET.** Now *produced*
      (`sol-justify-existence-multiplicity`) rather than chosen, but unscored.
- [ ] **Lesson-owned P3 (proof) reaches independently demonstrated — NOT YET.**
      `sol-prove-structure` / `sol-prove-null-subspace` are genuine E6 *surfaces*;
      `self-check` is self-marked, so E6 credit is **blocked on human scoring** (Package F).
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D10; ℝⁿ
      abstraction return; ODE transfer), not claimed mastered.
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (lint + unit tests green, incl. nullity-2, fresh-example,
      and new-item grading tests).
- [x] Abstraction return **accountably deferred** (owner/destination/evidence logged) — #4 not tripped.
- [ ] No rejection condition holds — **still open**: inconsistency-refusal /
      one-difference below E4, existence-multiplicity reasoning unscored, proofs unscored.

**Verdict: Gate 8 NOT PASSED.** The remediation replaced the choose-a-formula item with a
learner-**produced** parametric set, added produced free-variable/dimension counts, and
turned the two conceptual distinctions into *produced* (not chosen) reasoning surfaces —
genuine progress. But Gate 8 is a single gate and cannot pass while the
inconsistency-refusal outcome is only E1 (committed-MC), the one-difference outcome is
below its required E4, and the reasoning/proof surfaces are unscored. Remaining
lesson-owned gaps are enumerated in the module
[implementation package](../../modules/systems-elimination/implementation-package.md);
genuine E4 transfer (ℝⁿ / unfamiliar operator) and proof/reasoning *scoring* remain
module-owned (Gate 9 / structure module / Package F).
