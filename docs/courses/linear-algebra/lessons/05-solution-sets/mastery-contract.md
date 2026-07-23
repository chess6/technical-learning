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

| Outcome (operational) | Dimension | Owner | Target level | Evidence item | Highest attainment required |
| --- | --- | --- | --- | --- | --- |
| Show the difference of two solutions lies in \(\operatorname{Null}(A)\) | D5/D6 | lesson | E3 | `sol-difference-homogeneous` (built) | independently demonstrated |
| Generate a third solution from a known one without re-solving | D3 | lesson | E3 | `sol-generate-third` (built) — **reuses worked numbers**; needs a **fresh-instance** item | independently demonstrated |
| Write the complete solution set parametrically; name where direction & location come from | D3/D4 | lesson | E3/E4 | `sol-whole-set` (built, prediction) | independently demonstrated |
| Distinguish one-difference (≥ a line) from whole null space (full shape/dimension) | D5/D7 | lesson | E4 | `sol-nullity-caveat` (built) | independently demonstrated |
| Separate existence (reachability) from multiplicity (trivial null space) | D5 | lesson | E3 | `sol-existence-vs-multiplicity` (built) | independently demonstrated |
| Refuse the decomposition for an inconsistent system (∅) | D7 | lesson | E4 | `sol-inconsistent-empty` (built, prediction) | independently demonstrated |
| Read dimension off the free-variable count | D3/D4 | lesson | E3 | `sol-free-variables-dimension` (built) | independently demonstrated |
| Prove the structure theorem (both inclusions) and null-space closure | D6 | lesson | E6 | **gap** — proofs are presented, no learner proof-construction (`self-check`) item | independently demonstrated |
| Operate on a **general \(\mathbb{R}^n\)** null space / rank–nullity (abstraction return beyond 2D) | D4/D9 | **module** | E4/E5 | deferred — owner **structure module** L8/L9 (see §1g) | independently demonstrated (Gate 9 / structure module) |
| Combine elimination (L4) + solution-set structure on a mixed cumulative item | D10 | **module** | E5 | module cumulative set (Gate 9) | independently demonstrated (Gate 9) |
| Transfer the "general = particular + homogeneous" pattern to an unfamiliar operator (e.g. linear ODE/recurrence) | D9 | **module** | E4 | module transfer/enrichment item | independently demonstrated (Gate 9) / D14 if enrichment |

### 1e. Coverage-status classification (required vs reached)
- **Independently demonstrated (built):** difference→null; whole set parametrically;
  nullity caveat; existence-vs-multiplicity; inconsistent → ∅; free-variable
  dimension.
- **Practiced but not on a fresh instance:** generate-third and the parametric write
  reuse the running numbers — **required "independently demonstrated"** needs a
  fresh-instance item. Gap.
- **Taught only (P3 proof depth not demonstrated by learner):** structure theorem
  (both inclusions) and null-space closure are *presented* but have no learner
  proof-construction item — **reaches "taught," required "independently
  demonstrated"** under P3. Gap (rejection #5/#8).
- **Module-owned (planned):** general \(\mathbb{R}^n\) null space / rank–nullity
  (abstraction return); cumulative L4+L5; ODE/recurrence transfer (may be D14
  enrichment).

### 1f. Connections, assessment, retention
- **Cumulative connections (D10):** sharpens L3's trichotomy (∞ ⇒
  \(\mathbf{x}_p+\operatorname{Null}(A)\)); uses L4 elimination for the free-variable
  basis; uses L1 subspace closure.
- **Assessment evidence (summary):** 1 Check; Explore (sliders = null directions);
  Practice = generate / describe / caveat / existence-vs-multiplicity / inconsistent /
  dimension. Does not repeat instruction, **except** procedural items reuse the
  running numbers.
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

Honest status of the current build under the **P3 override**:

- [x] Insight Contract linked and `PASS`; primary insight preserved in meaning.
- [x] Every field in §1 filled; upstream artifacts linked, not restated.
- [x] Every outcome operational, marked lesson/module-owned, paired with evidence.
- [ ] Every **lesson-owned** core outcome reaches **independently demonstrated with
      real in-lesson evidence** — **NOT YET**: (i) procedural items lack a fresh
      instance; (ii) the D6 proof outcome has no learner proof-construction item.
- [x] Every **module-owned** core outcome recorded as a Gate-9 obligation (D10; ℝⁿ
      abstraction return; ODE transfer), not claimed mastered.
- [ ] Assessment set matches §3c — **NOT YET** under P3: missing a proof-construction
      item and a fresh-instance procedural item.
- [x] Backward bridge + forward edge present; ≥1 cumulative connection (D10).
- [x] Delayed-retention hook (D12) recorded.
- [x] Correctness gate passed (built lesson has passing math/tests, incl. nullity-2).
- [x] Abstraction return **accountably deferred** (owner/destination/evidence logged) — #4 not tripped.
- [ ] No rejection condition holds — **currently trips #3 (near-copy drills),
      #5/#8 (proof outcome at "taught" under P3)**.
- [ ] Profile-dependent items (D6 proof depth) match P3 — **NOT YET**.

**Verdict:** rich coverage and an accountable abstraction-return deferral, but **does
not yet meet the P3 override**. Remaining **lesson-owned** gaps → implementation
package items **B (proof construction)** and **C (fresh drills)**. Module-owned
outcomes (ℝⁿ return, cumulative, transfer) → Gate 9 / structure module.
