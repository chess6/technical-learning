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
  plan must evidence **proof competence (P3)**, **applied \(\mathbb{R}^n\) fluency
  (P2)**, and **timed performance (S3)**, with enrichment kept off the exam bar.

## Module-owned outcomes to discharge here
Pulled from the lessons' mastery contracts (their **module-owned** rows:
[L3](../../lessons/03-systems/mastery-contract.md#1d-outcomes-each-paired-with-evidence),
[L4](../../lessons/04-elimination/mastery-contract.md#1d-outcomes-each-paired-with-evidence),
[L5](../../lessons/05-solution-sets/mastery-contract.md#1d-outcomes-each-paired-with-evidence)).

| Outcome (operational) | From lesson | Dimension | Target level | Assessment item | Result |
| --- | --- | --- | --- | --- | --- |
| Select rows / columns / elimination unprompted for a given system | L3, L4 | D8 | E3 | `mod-select-method` | planned |
| Given an unfamiliar system, classify none/one/∞ and justify from reachability × independence | L3 | D9 | E4 | `mod-transfer-classify` | planned |
| Solve a system by elimination, then express the full solution set (combine L4 + L5) | L4, L5 | D10 | E5 | `mod-cumulative-elim-solset` | planned |
| Prove row-op invariance **and** solution-set structure on a fresh statement | L4, L5 | D6 | E6 | `mod-proof-invariance`, `mod-proof-structure` | planned |
| Retrieve the trichotomy / uniqueness-≠-reachability after a delay | L3, L5 | D12 | E3 | `mod-spaced-*` (see below) | planned |
| Complete the module under time pressure with deferred feedback | all | D11 | E3–E5 | `mod-timed-mock` | planned |

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

- **Computational fluency (D3, P2).** Fresh-instance items with *different numbers*
  than the lessons' running example: (i) solve a \(2\times2\) system by elimination
  (grade the multiplier + triangular row, not just \((x,y)\)); (ii) write the full
  solution set of a fresh consistent dependent system; (iii) count free variables →
  dimension for a fresh \(A\). Items `mod-fluency-elim`, `mod-fluency-solset`,
  `mod-fluency-dim`.
- **Method selection (D8).** Problems that do **not** name the method: a mix where
  the efficient path is sometimes the column/reachability check (classify without
  solving), sometimes elimination. `mod-select-method` (interleaved).
- **Proof competence (D6, P3).** Learner-constructed proofs on fresh statements,
  self-check + model answer + rubric (human-scored in the pilot): row-op invariance
  (both directions, via reversibility) and solution-set structure (both inclusions,
  with the consistency hypothesis used). `mod-proof-invariance`, `mod-proof-structure`.
  A **missing-assumption** item: "which hypothesis makes
  \(\operatorname{Sol}=\mathbf{x}_p+\operatorname{Null}(A)\) hold?" `mod-proof-hyp`.
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
- **Module-owned outcomes discharged:** `0 / 6` with real evidence (**planned** — no
  assessment surface built yet).
- **Delayed-retention verified:** no (not yet administered).
- **Readiness claim supported (per [COURSE §6.2](../../../../authoring/mastery-standard.md#62-what-evidence-justifies-each-readiness-claim)):**
  **none yet.** The built module currently supports at most P1 S1–S3 in 2D
  ([gap summary](../../benchmark-matrix.md#3-course-level-gaps-summary)); P2 applied
  fluency, the P3 proof bar, and S3 timed performance are **not** yet evidenced. No
  "module mastered / exam ready / proof-ready" claim may be made until this plan is
  built and run.

Feeds the course-level benchmark validation (`validation.md` in this directory) /
Gate 10, to be created once real results exist.
