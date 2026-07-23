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

Status key: ✅ built & verified; 🟡 proof *surface* built, E6 credit awaits human
scoring (Package F); ⬜ module-owned.

| Outcome (operational) | Dimension | Owner | Built item (type) | Current honest level | Required |
| --- | --- | --- | --- | --- | --- |
| Show the difference of two solutions lies in \(\operatorname{Null}(A)\) | D5/D6 | lesson | `sol-difference-homogeneous` (multiple-choice) | **E1** — recognition (retained as support) | E3 |
| Generate a third solution without re-solving | D3 | lesson | ✅ `sol-generate-third-fresh` (vector, **fresh** `systems-fresh` numbers) + `sol-generate-third` | **E3** — fresh, unaided production graded against `src/math` | E3 |
| Write the complete solution set parametrically; name direction & location | D3/D4 | lesson | ✅ `sol-whole-set` (**committed-prediction**, fresh system) | **E3** — commit-before-reveal choice of the correct affine set on a fresh instance | E3/E4 |
| Distinguish one-difference (≥ a line) from the whole null space | D5/D7 | lesson | `sol-nullity-caveat` (multiple-choice) | **E1–E2** — recognition (\(A=\mathbf{0}\) scenario; retained as support) | E4 |
| Separate existence (reachability) from multiplicity (trivial null space) | D5 | lesson | `sol-existence-vs-multiplicity` (multiple-choice) | **E1** — recognition (support) | E3 |
| Refuse the decomposition for an inconsistent system (∅) | D7 | lesson | ✅ `sol-inconsistent-empty` (**committed-prediction**, fresh inconsistent target) | **E3** — commit-before-reveal on a fresh case | E4 |
| Read dimension off the free-variable count | D3/D4 | lesson | `sol-free-variables-dimension` (multiple-choice) | **E1–E2** — recognition (support) | E3 |
| Prove the structure theorem (both inclusions) + null-space closure | D6 | lesson | 🟡 `sol-prove-structure`, `sol-prove-null-subspace` (**self-check** + model answer + rubric) | **E6 surface** — learner writes both proofs; self-mark is not scoring | E6 (human-scored) |
| Operate on a **general \(\mathbb{R}^n\)** null space / rank–nullity | D4/D9 | ⬜ **module** | deferred → structure module L8/L9 (see §1g) | not built | E4/E5 (structure module) |
| Combine elimination (L4) + solution-set structure (mixed cumulative) | D10 | ⬜ **module** | module set (not built) | not built | E5 (Gate 9) |
| Transfer "general = particular + homogeneous" to an unfamiliar operator | D9/D14 | ⬜ **module** | module set (not built) | not built | E4 (Gate 9) / D14 enrichment |

#### Evidence audit (runtime-checked)

`committed-prediction` on a **fresh** instance is genuine commit-before-reveal (**E3**);
`sol-whole-set` and `sol-inconsistent-empty` were reveal-only `prediction`s and are now
fresh committed choices. `sol-generate-third-fresh` is fresh graded production (**E3**).
`self-check` self-marks and is never scored in-app ⇒ the two proof items are **E6
surfaces, not E6 evidence**. **Result for L5 after the lesson-owned remediation
(Packages B–E):** the parametric-set, generativity, and inconsistency outcomes reach
**E3** with fresh graded in-lesson evidence; the two D6 **proof** outcomes have genuine
learner-constructed surfaces whose **E6 credit is blocked on human scoring** (Package F).
Fresh numbers verified in
[`freshExample.test.ts`](../../../../../src/lessons/__tests__/freshExample.test.ts).

### 1e. Coverage-status classification (required vs reached)
Honest ceiling **after Packages B–E**: the generativity / parametric-set / inconsistency
outcomes reach **E3**; the D6 proof outcomes reach an **E6 surface** whose credit is
blocked on human scoring. (Genuine **E4 transfer** — e.g. the ℝⁿ / unfamiliar-operator
transfer — remains **module-owned**, Gate 9 / structure module.)
- **Independently demonstrated (E3) — now reached:** fresh generate-a-third
  (`sol-generate-third-fresh`); fresh committed choice of the parametric set
  (`sol-whole-set`) and of the empty inconsistent case (`sol-inconsistent-empty`).
- **Recognition (support):** the four multiple-choice items (E1–E2).
- **Proof surface, credit pending (🟡):** `sol-prove-structure`,
  `sol-prove-null-subspace` — both proofs captured against a model answer + rubric; the
  in-app self-mark is not E6 scoring (Package F).
- **Module-owned (planned):** general \(\mathbb{R}^n\) null space / rank–nullity
  (abstraction return, owner structure module); cumulative L4+L5; ODE/recurrence
  transfer (D14 enrichment).

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** sharpens L3's trichotomy (∞ ⇒
  \(\mathbf{x}_p+\operatorname{Null}(A)\)); uses L4 elimination for the free-variable
  basis; uses L1 subspace closure.
- **Assessment evidence (summary):** 1 Check (recognition, E1); Explore (sliders =
  null directions); Practice now includes a **fresh** generate-a-third (E3), four
  recognition MC (E1–E2, support), two **committed-prediction** items on fresh
  parametric / inconsistent cases (E3), and two **learner-written proof surfaces**
  (E6 credit pending human scoring). Honest ceiling now **E3** for the
  generativity/parametric/inconsistency outcomes; proofs captured but unscored (see the
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

Status of the build **after the lesson-owned remediation (Packages B–E built)** under
the **P3 override**, against the runtime evidence audit
([§1d](#1d-outcomes-each-paired-with-evidence)):

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [x] Every **lesson-owned P1/P2** outcome reaches **independently demonstrated (E3)** —
      fresh graded production and fresh commit-before-reveal now exist for generativity,
      the parametric set, and the inconsistent (∅) case.
- [ ] Every **lesson-owned P3 (proof)** outcome reaches independently demonstrated —
      **NOT YET**: `sol-prove-structure` / `sol-prove-null-subspace` are genuine E6
      *surfaces*; `self-check` is self-marked, so E6 credit is **blocked on human
      scoring** (Package F).
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D10; ℝⁿ
      abstraction return; ODE transfer), not claimed mastered. **Genuine E4 transfer
      stays module-owned** (Gate 9 / structure module).
- [x] Assessment set matches §3c for the lesson-owned E3 outcomes — fresh-instance
      production and committed-prediction now present.
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (lint + 202 unit tests green, incl. nullity-2 and the
      fresh-example math).
- [x] Abstraction return **accountably deferred** (owner/destination/evidence logged) — #4 not tripped.
- [ ] No rejection condition holds — **#3/#7 cleared** (fresh E3, no reveal-only practice
      remains); still **open on #5 for the P3 proof line only** until proofs are
      human-scored.
- [ ] Profile-dependent items (D6 proof depth) match **P3** — **NOT YET** (proof
      surfaces built; human scoring pending).

**Verdict: Gate 8 PASS for the lesson-owned P1/P2 (generativity, parametric set,
inconsistency) outcomes at E3; the P3 proof obligation (D6) is CONDITIONAL — both proof
surfaces are built, but E6 credit awaits human scoring (Package F).** The lesson no
longer relies on reveal-only or near-copy items. Genuine E4 transfer (ℝⁿ / unfamiliar
operator) and proof *scoring* remain module-owned (Gate 9 / structure module / Package F),
not additional lesson content.
