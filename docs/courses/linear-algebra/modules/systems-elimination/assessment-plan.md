# Module assessment plan (Gate 9) — Systems & Elimination

The Gate 9 cumulative-assessment plan for the `systems-elimination` module. It
certifies *integration and delayed retention across the module* and **discharges the
module-owned outcomes** the three lessons deferred. Follows
[authoring/mastery-standard.md §6](../../../../authoring/mastery-standard.md#6-assessment-architecture)
and draws items from
[authoring/assessment-patterns.md](../../../../authoring/assessment-patterns.md).
References the lesson mastery contracts; does not restate them.

> **Status: PLANNED (not yet run).** No cumulative/interleaved/spaced/timed surface
> exists in the app yet (see the module
> [implementation package](implementation-package.md)). Every "Result" below is
> `planned` until the assessment system is built and administered. Per the mastery
> standard, **planned module evidence licenses no mastery/readiness claim** until it
> is verified here with real results.

## Module metadata
- **Module / section id:** `systems-elimination` (matches `src/lessons/curriculum.ts`).
- **Lessons in module:** L3 systems, L4 elimination, L5 solution-sets.
- **Profile target for this module:** **P3 override** (proof of solution-set
  structure and row-op invariance), on top of the course primary **P2** and the
  research-bridge overlay — from
  [course-spine §0](../../course-spine.md#0-declared-course-target-gate-1). So this
  plan must evidence **proof competence (P3)**; a **concrete multi-variable applied
  slice (P2)** — fresh 3×3 / rectangular elimination and complete parametric solution
  sets; and **timed performance (S3)**, with enrichment kept off the exam bar. It does
  **not** claim general \(\mathbb{R}^n\) null-space / rank–nullity fluency — that is
  owned by the **structure module (L8/L9)** and is only cross-referenced here.

## Outcomes handled here — two distinct ownership classes

The module assessment carries two kinds of outcome that must **not** be conflated:
they have different owners and different consequences for readiness. Pulled from the
lessons' mastery contracts
([L3](../../lessons/03-systems/mastery-contract.md#1d-outcomes-each-paired-with-evidence),
[L4](../../lessons/04-elimination/mastery-contract.md#1d-outcomes-each-paired-with-evidence),
[L5](../../lessons/05-solution-sets/mastery-contract.md#1d-outcomes-each-paired-with-evidence)).

### Class A — genuinely module-owned (deferred from lessons; the *module* is the owner)

Outcomes a single lesson cannot own. The lessons correctly defer them, and Gate 9
**discharges** them here with real evidence.

| Outcome (operational) | From lesson | Dimension | Target | Item | Result |
| --- | --- | --- | --- | --- | --- |
| Select rows / columns / elimination unprompted for a given system | L3, L4 | D8 | E3 | `mod-select-method` | planned |
| Classify an **unfamiliar** system none/one/∞ and justify (reachability × independence) | L3 | D9 | E4 | `mod-transfer-classify` | planned |
| Describe a **fresh** solution set via free-variable count (concrete dims) | L5 | D9 | E4 | `mod-transfer-solset-fresh` | planned |
| Combine elimination + solution-set structure across lessons | L4, L5 | D10 | E5 | `mod-cumulative-elim-solset` | planned |
| Complete the module under time pressure with deferred feedback | all | D11 | E3–E5 | `mod-timed-mock` | planned |
| *(enrichment, off the exam bar)* transfer "general = particular + homogeneous" to a new operator | — | D14 | E7 | `mod-enrich-ode` | planned |

Cross-reference (**not** dischargeable here): general \(\mathbb{R}^n\) null space &
rank–nullity is owned by the **structure module (L8/L9)** — see the L5 contract's
[deferral](../../lessons/05-solution-sets/mastery-contract.md#1g-correctness--scope).

### Class B — cumulative reassessment / retention of **lesson-owned** outcomes (ownership stays with the lesson)

These are **lesson-owned**. The module does **not** own them and **cannot substitute
for a lesson's Gate 8**: each must first be *independently demonstrated in-lesson*
(implementation-package items B–E). The module then reassesses them on fresh
instances, integrates them, provides the **human-scored** surface for proofs, and
re-fires them after a delay.

> **Status after the completed lesson-owned remediation.** The **P1/P2 fluency**,
> classification, characterization, diagnosis, and solution-set outcomes below now have
> genuine *in-lesson evidence*: fresh graded **production** (classification, column
> confirmation across both coordinates, complete parametric set, produced ∅-refusal) and
> in-lesson **E4 unfamiliar transfer** (L3 symbolic-parameter characterization, L4
> produced diagnosis + degenerate zero-pivot swap, L5 scored null-direction construction).
> All non-scoring lesson-owned interaction gaps are closed. **However, none of L3/L4/L5 has
> passed Gate 8** — Gate 8 is a single gate and each lesson still has produced
> reasoning/proof `self-check`s that are **unscored**. So this Class-B reassessment is
> blocked by the missing module runner / **human-scoring surface (Package F)**, which is
> also what clears the last lesson-owned obligation. Class B stays **not-yet-runnable**;
> the plan remains **PLANNED**.

| Lesson-owned outcome (reassessed here) | Owner | Dimension | Purpose at module | Item | Result |
| --- | --- | --- | --- | --- | --- |
| Elimination → triangular + back-sub on a fresh system | L4 | D3 | fresh reassessment + retention | `mod-fluency-elim` | lesson E3 ✅ → awaits F (runner) |
| Write a complete parametric solution set (fresh) | L5 | D3 | reassessment + integration | `mod-fluency-solset` | lesson E3 ✅ → awaits F (runner) |
| Read dimension from free-variable count (fresh) | L5 | D3/D4 | retention | `mod-fluency-dim` | awaits F (runner) |
| Prove row-op invariance (both directions) | L4 | D6 | human-scored proof surface | `mod-proof-invariance` | surface built 🟡 → awaits F (human scoring) |
| Prove solution-set structure (both inclusions) | L5 | D6 | human-scored proof surface | `mod-proof-structure` | surface built 🟡 → awaits F (human scoring) |
| Justify the trichotomy **without the determinant** | L3 | D6 | human-scored proof surface | `mod-proof-trichotomy` | surface built 🟡 → awaits F (human scoring) |
| Retrieve trichotomy / uniqueness-≠-reachability / row-op legality after a delay | L3–L5 | D12 | spaced retention | `mod-spaced-*` | awaits F (scheduler) |

## Abstraction-return deferrals discharged here
Any accountable abstraction-return whose **owner is this module**
([semantic-page-grammar §4.3](../../../../product/semantic-page-grammar.md#4-mathematical-object-and-representation-standard)).

| Deferred from | Destination (general case) | Item | Result |
| --- | --- | --- | --- |
| L5 solution-sets | operate on a null space via free-variable count in a **fresh** system (2D/3D-by-count) | `mod-transfer-solset-fresh` | planned |
| L5 solution-sets → **structure module** | full \(\mathbb{R}^n\) null space & rank–nullity | *(owned by the structure module L8/L9; not dischargeable here — cross-referenced only)* | out of module scope |

> The **full \(\mathbb{R}^n\)** null-space/rank–nullity return is owned by the future
> **structure module**, not this one; this module discharges only the fresh-system,
> free-variable-count level. Recorded so the deferral has an owner and destination.

## The assessment set (cumulative · interleaved · spaced)

Covers the seven areas the module must assess under the declared profile:

- **Computational fluency (D3, 2×2 baseline).** Fresh-instance items with *different
  numbers* than the lessons' running example: (i) solve a \(2\times2\) system by
  elimination (grade the multiplier + triangular row, not just \((x,y)\)); (ii) write
  the full solution set of a fresh consistent dependent system; (iii) count free
  variables → dimension for a fresh \(A\). Items `mod-fluency-elim`,
  `mod-fluency-solset`, `mod-fluency-dim`.
- **Applied multi-variable slice (D3, P2 — executable).** At least one **fresh 3×3 or
  rectangular** (e.g. 2×3 or 3×4) system: run elimination to reduced/triangular form,
  identify the pivot and **free** variables, and write the **complete parametric
  solution set** \(\{\mathbf{x}_p+\sum t_i\mathbf{v}_i\}\) — including an inconsistent
  variant that must terminate in a contradiction row. This makes the P2 applied claim
  *concrete and checkable*. Items `mod-p2-applied-3x3` (square) and
  `mod-p2-applied-rect` (rectangular). **Scope guard:** these exercise concrete
  multi-variable elimination and parameterization only; they do **not** evidence
  general \(\mathbb{R}^n\) null-space theory or rank–nullity, which stay owned by
  L8/L9.
- **Method selection (D8).** Problems that do **not** name the method: a mix where
  the efficient path is sometimes the column/reachability check (classify without
  solving), sometimes elimination. `mod-select-method` (interleaved).
- **Proof competence (D6, P3) — human-scored.** Learner-constructed proofs on fresh
  statements: row-op invariance (both directions, via reversibility), solution-set
  structure (both inclusions, consistency hypothesis used), and the trichotomy
  (independence/basis, **without** the determinant). `mod-proof-invariance`,
  `mod-proof-structure`, `mod-proof-trichotomy`. **The app's `self-check` is
  self-marked and does not score correctness** ([capabilities.ts](../../../../../src/lessons/capabilities.ts));
  E6 evidence therefore requires **human scoring** against the rubric (validation
  pilot / instructor), not the in-app self-mark. A **missing-assumption** item: "which
  hypothesis makes \(\operatorname{Sol}=\mathbf{x}_p+\operatorname{Null}(A)\) hold?"
  `mod-proof-hyp`.
- **Unfamiliar transfer (D9).** An untelegraphed system/setup the learner has not
  seen: classify + justify (`mod-transfer-classify`); describe a fresh solution set
  (`mod-transfer-solset-fresh`). *(Enrichment/overlay, off the exam bar:* the
  "general = particular + homogeneous" analogy to a linear ODE/recurrence,
  `mod-enrich-ode` — D14.)*
- **Cumulative integration (D10).** One problem that spans ≥2 lessons: eliminate to
  find \(\mathbf{x}_p\), identify the free variable, and write
  \(\mathbf{x}_p+\operatorname{Null}(A)\); plus an inconsistent variant surfaced as a
  contradiction row (L4) ⇒ ∅ (L5). `mod-cumulative-elim-solset`.
- **Delayed / spaced retrieval (D12).** After the module, re-fire the highest-value
  outcomes at spacing ~1 week and ~1 month: the trichotomy (L3),
  uniqueness-≠-reachability (L5), and legal-vs-illegal row ops (L4). `mod-spaced-trichotomy`,
  `mod-spaced-uniqueness`, `mod-spaced-rowops`. These also seed L7/L8/L9 prerequisite
  checks.
- **Timed / exam-mode set (D11, S3).** A short mock under time limit with **deferred
  feedback** (no per-item reveal), mixing computation + one proof + one classification.
  `mod-timed-mock`.
- **Error diagnosis (D13).** ≥1 "which step + why": a botched elimination (illegal
  \(0\)-scale or wrong-sign multiplier) or a decomposition written for an inconsistent
  system. `mod-error-diagnose`.

## Results & readiness
- **Class A (module-owned) discharged:** `0 / 5` core with real evidence (**planned** —
  no assessment surface built yet); enrichment `mod-enrich-ode` separate, off the bar.
- **Class B (lesson-owned reassessment):** `not yet runnable` — the owning-lesson outcomes
  now have **real in-lesson evidence**: fresh **produced** classification, both-coordinate
  column confirmation, complete parametric set, produced ∅-refusal (E3), and in-lesson
  **E4 unfamiliar transfer** (symbolic-parameter characterization, degenerate zero-pivot
  swap, scored null-direction construction). All non-scoring lesson-owned interaction gaps
  are closed, but **no lesson has passed Gate 8** (single gate; the produced
  reasoning/proof `self-check`s are still unscored). Reassessment is blocked by the missing
  **Package F** (module runner + human-scoring surface + scheduler), which is also what
  scores the last lesson-owned surfaces and lets the lessons clear Gate 8.
- **Delayed-retention verified:** no (not yet administered).
- **Readiness claim supported (per [COURSE §6.2](../../../../authoring/mastery-standard.md#62-what-evidence-justifies-each-readiness-claim)):**
  **none at the module level.** The built lessons now evidence **independent performance
  (E3)** and **in-lesson unfamiliar transfer (E4)** for the computational/procedural and
  characterization/diagnosis/solution-set outcomes, and provide produced proof/reasoning
  *surfaces*, but **Gate 8 is NOT PASSED** for L3/L4/L5 (those surfaces are unscored) and
  there is still **no module-level** cumulative, timed (S3), delayed-retention (D12),
  applied
  multi-variable (P2 module slice), or human-scored-proof (E6) evidence
  ([gap summary](../../benchmark-matrix.md#3-course-level-gaps-summary)). No "module
  mastered / exam ready / proof-ready" claim may be made until the lessons clear Gate 8
  and this plan is built (Package F onward) and run.

Feeds the course-level benchmark validation (`validation.md` in this directory) /
Gate 10, to be created once real results exist.
