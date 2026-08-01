# Module assessment plan (Gate 9) — Calculus Foundations

The Gate 9 cumulative-assessment plan for the `calculus-foundations` module.
It certifies *integration and delayed retention across the module* and
**discharges the module-owned outcomes** L1–L4 deferred. Follows
[authoring/mastery-standard.md §6](../../../../authoring/mastery-standard.md#6-assessment-architecture)
and draws items from
[authoring/assessment-patterns.md](../../../../authoring/assessment-patterns.md).
References the lesson mastery contracts; does not restate them.

> **Status: BUILT, NOT ADMINISTERED — Gate 9 NOT PASSED.** All thirteen items
> are authored, registered in three sets, and machinery-verified (pure-math
> re-derivation, grading contracts with the adversarial reject battery,
> capability + registration + evidence-ceiling conformance, cue-lint). **That
> is not learner evidence.** The tests exercise the capture/grade/review path
> with *synthetic* answers. Per the mastery standard, **built-but-unadministered
> module evidence licenses no mastery or readiness claim**, so every "Result"
> below reads `built · not administered` and no readiness claim is made in
> [§Results](#results--readiness).

## Module metadata
- **Module / unit id:** `calculus-foundations` (matches the unit id in
  `src/lessons/courseModel.ts`).
- **Lessons in module:** L1 `limits-continuity`, L2 `derivative-local-linearity`,
  L3 `integral-accumulation`, L4 `fundamental-theorem`.
- **Profile target for this module:** **P2 primary**, no P3 override (from
  [course-spine §0](../../course-spine.md#0-declared-course-target-gate-1)).
  No proof set is required or claimed here — that budget goes to a **timed set
  (D11)** instead, since without it this module would offer no timed surface at
  all.
- **Out of module scope:** the chain rule and every technique beyond FTC
  (Package B); any module-assessment item that would require an elementary
  antiderivative outside the four lessons' own fixture family.

## Outcomes handled here — two ownership classes

### Class A — genuinely module-owned (deferred from the lessons; the *module* is the owner)

Pulled from the lessons' mastery contracts
([L1](../../lessons/01-limits-continuity/mastery-contract.md#1d-outcomes-with-evidence),
[L2](../../lessons/02-derivative-local-linearity/mastery-contract.md#1d-outcomes-with-evidence),
[L3](../../lessons/03-integral-accumulation/mastery-contract.md#1d-outcomes-with-evidence),
[L4](../../lessons/04-fundamental-theorem/mastery-contract.md#1d-outcomes-with-evidence)),
plus three dimensions no lesson contract names at all — D8, D9, D13 — added
here because Gate 9's own rejection conditions list "no method-selection
items" and [mastery-standard §4](../../../../authoring/mastery-standard.md#4-dimension-ownership)
makes D9/D13 module-mandatory.

| Outcome (operational) | From | Dim | Target | Item | Result |
| --- | --- | --- | --- | --- | --- |
| Integrate limits with the derivative | L1 | D10 | E5 → **E3** | `mod-calcfound-limit-in-derivative` | built · not administered · **see the level note** |
| Integrate the derivative with limits and accumulation | L2+L3 | D10 | E5 → **E3** | `mod-calcfound-mixed-rate-total` | built · not administered · **see the level note** |
| Integrate the FTC with the derivative and the Riemann sum | L2+L3+L4 | D10 | E5 | `mod-calcfound-mixed-ftc` | built · not administered |
| Retain "the point value is irrelevant" | L1 | D12 | E3 → **E1** | `mod-calcfound-retain-point-value` | built · not administered · **see the level note** |
| Retain "differentiable ⇒ continuous, not conversely" | L2 | D12 | E3 → **E1** | `mod-calcfound-retain-diff-cont` | built · not administered · **see the level note** |
| Retain "the integral is signed" | L3 | D12 | E3 → **E1** | `mod-calcfound-retain-signed` | built · not administered · **see the level note** |
| Retain "the theorem gives existence, not a formula" | L4 | D12 | E3 → **E1** | `mod-calcfound-retain-existence` | built · not administered · **see the level note** |
| Select the route unprompted across the module | L1–L4 | D8 | E3 | `mod-calcfound-select-method` | built · not administered |
| Transfer the bracketing restriction to a fresh rate, produced | L2+L3 | D9 | E4 | `mod-calcfound-transfer-bracket-window` | built · not administered |
| Diagnose the module's signature error | L3+L4 | D13 | E4 | `mod-calcfound-diagnose-signed-split` | built · not administered |
| Perform under a time limit on fresh instances | L1–L4 | D11 | E3 | `mod-calcfound-mock-*` (3 items) | built · not administered |

**Level note on the two D10 rows that land at E3.** L1's and L2+L3's contracts
each request **E5**. `mod-calcfound-limit-in-derivative` uses `vector`
(ceiling E3); `mod-calcfound-mixed-rate-total` uses `matrix-entry` (ceiling
E3) — see
[`evidence.ts`](../../../../../src/lessons/evidence.ts). Neither
`solution-set` nor `elimination-solution` (the only other E5-ceiling
capabilities) fit calculus-shaped content; they are linear-algebra-shaped.
The honest options were a human-scored E5 surface or a new capability. This
module spends its **one** E5 slot on `mod-calcfound-mixed-ftc` (L4's own
outcome, the strongest integration case) and declares these two rows
**partially discharged**: integration is measurable, integration *at E5* is
not, for the capabilities this module's content can use.

**Level note on the D12 rows (a deliberate downgrade, not an oversight).**
The four lesson contracts each ask for **E3** under delayed retrieval. These
items are **multiple-choice, and therefore E1** — recognition is all a
picker can record. That is the right form *for a retention check* on
outcomes that already carry produced evidence in-lesson, matching the
`structure` and `systems-elimination` modules' own precedent. The D12 rows
are **partially** discharged: retention is measurable, retention *at E3* is
not.

### Class B — cumulative reassessment of **lesson-owned** outcomes (ownership stays with the lesson)

These remain the lessons' to demonstrate; the module only re-fires them on
fresh instances and integrates them. **The module cannot substitute for a
lesson's Gate 8.** All four lessons report their lesson-owned outcomes as
independently demonstrated in-lesson — with one honest exception below.

| Lesson-owned outcome (re-fired here) | Owner | Purpose at module | Item |
| --- | --- | --- | --- |
| Evaluate a fresh 0/0 by exhibiting an agreeing expression | L1 | prerequisite of a derivative, not a standalone drill | `mod-calcfound-limit-in-derivative` |
| Alter/delete the value at the point, limit unchanged | L1 | fired after a delay | `mod-calcfound-retain-point-value` |
| Answer a rate question with a slope and vice versa | L2 | "falling fastest" inside an accumulation question | `mod-calcfound-mixed-rate-total` |
| Estimate an integral by partitioning, and say whether the bracket proves anything | L3 | on a rate where the straddle is genuine luck | `mod-calcfound-mixed-ftc` |
| Identify where left/right bracketing fails | L3 | **produced**, not recognized — raised from L3's own E2 recognition item to E4 | `mod-calcfound-transfer-bracket-window` |
| Predict the sign of an integral from the rate | L3 | staged as a diagnosis, and again after a delay | `mod-calcfound-diagnose-signed-split`, `mod-calcfound-retain-signed` |
| Evaluate a definite integral via a **verified** antiderivative | L4 | verification demanded, not assumed | `mod-calcfound-mixed-ftc` |
| Differentiate an integral with a variable upper limit | L4 | fresh rate, and again under time | `mod-calcfound-mixed-ftc`, `mod-calcfound-mock-slope-of-total` |
| Reconcile two independent computations | L4 | fresh rate rather than the shared `8/3` | `mod-calcfound-mixed-ftc` |
| State what the theorem does not promise | L4 | `sin(x)/x` rather than `e^{-x^2}`, after a delay | `mod-calcfound-retain-existence` |

> **Honest exception.** After the 2026-07-30 evidence-level reconciliation
> (see the [package ledger](implementation-package.md) §1 per-slice notes),
> several lesson-owned outcomes across L1–L4 were converted to
> `multiple-choice` and recorded at **E2 recognition** rather than the higher
> levels originally claimed. The module does not discharge those — it is not
> their owner — but the consequence is real: the course's own produced-transfer
> evidence outside `mod-calcfound-transfer-bracket-window` is thin, so that
> one item carries more weight than its single table row suggests.

## Abstraction-return deferrals discharged here

**None.** All four lessons discharge their own abstraction return in-lesson
(L1's closing exercise, L2's `der-tangent-crosses`, L3's `int-units-fresh`,
L4's `ftc-telescope-transfer`) — unlike `structure`, this module inherits no
abstraction-return obligation from its lessons.

## The assessment set (cumulative · interleaved · spaced · timed)

Three sets with **disjoint membership**, so no item is ever administered
twice and a later set cannot measure recall of an earlier one. Five distinct
polynomial fixtures across the review and mock sets (`mod-ex-coolant`,
`mod-ex-furnace`, `mod-ex-turbine`, `mod-ex-dialysis`, `mod-ex-reactor`), so
no item's answer is a stepping stone to another's inside one sitting.

### `calculus-foundations-review` — cumulative & interleaved (6 items)
Auto-graded production and human-scored writing **strictly alternate**, so no
run of one kind cues the next.

1. **`mod-calcfound-limit-in-derivative`** (D10, E3, auto) — a cubic quotient
   undefined at its removable point; the forced continuity value feeds
   directly into the derivative asked for next, so L1's repair is a genuine
   precondition of L2's question, not a preamble.
2. **`mod-calcfound-select-method`** (D8, E3, human) — one question settled by
   an odd-symmetry pairing argument with **no formula available at all**; one
   that genuinely requires an antiderivative. The prompt names neither route;
   `cueLint.test.ts` enforces that (patterns extended for this module — see
   Correctness).
3. **`mod-calcfound-transfer-bracket-window`** (D9, E4, auto) — the learner
   must locate a fresh rate's turn themselves (an L2 computation) and
   construct a narrow interval straddling it (an L3 restriction), via a new
   `interval-without-bracket-guarantee` predicate.
4. **`mod-calcfound-diagnose-signed-split`** (D13, E4, human) — the module's
   signature error, staged so the student's antiderivative, split point, and
   all three piece evaluations are correct and only the final sign-flip is
   wrong. The learner must pinpoint the exact step and produce a witness.
5. **`mod-calcfound-mixed-rate-total`** (D10, E3, auto) — a one-row "answers"
   matrix on a fresh rate: net change, argmax time, argmax value, and where
   the rate itself falls fastest — four questions one reduction cannot fake.
6. **`mod-calcfound-mixed-ftc`** (D10/D9, **E5**, human) — the module's one
   E5 item. Two independent routes to the same number, a bracket that
   straddles by luck (and the learner must say why that proves nothing), and
   `A'(4)` obtained from the theorem's first half without computing `A`.

### `calculus-foundations-mock` — timed set (3 items, D11, all auto)
A short exam-mode set under a 10-minute limit, all auto-graded — a
deferred-feedback timed set with a human in the loop returns nothing in time
to be a mock. The profile is P2 with no P3 override, so this is where that
budget goes instead of a proof set; otherwise the course would have no timed
surface at all. The 600-second figure is an authored guess requiring
empirical calibration, not a measured norm.

- **`mod-calcfound-mock-limit`** — a reciprocal's derivative from the limit
  definition (fresh; L1–L4 never differentiate `1/x`).
- **`mod-calcfound-mock-total`** — net accumulation on a fresh linear rate,
  the same area-model trap as `mod-calcfound-retain-signed` but on a formula
  under time pressure.
- **`mod-calcfound-mock-slope-of-total`** — `(A(4), A'(4))` on the same
  fixture, pinning the theorem's first half against the temptation to
  differentiate a computed `A`.

### `calculus-foundations-retention` — delayed retrieval (4 items, D12)
The point-value irrelevance (L1), the corner/differentiability distinction
(L2), signed accumulation (L3), and existence-not-a-formula (L4), each on
fresh functions. Recognition items by design (see the level note above).

> **Platform limit, stated rather than worked around.** The spacing
> scheduler is hard-scoped to a single `SPACED_MODULE_ID`
> ([`src/platform/spacedConfig.ts`](../../../../../src/platform/spacedConfig.ts)
> = `systems-elimination`), so **nothing auto-schedules these**, and they are
> registered as an ordinary set rather than as platform "spaced" sets. Until
> the scheduler is generalized, `calculus-foundations-retention` must be
> **administered manually** at roughly +7 and +30 days after the first
> `calculus-foundations-review` release — the same gap `structure` and
> `systems-elimination` record, not re-solved here. The same four items fire
> at both delays, so the second wave measures retention of a proposition
> already answered once, not a parallel form — an honest limitation, not a
> hidden one. Consequence: until the scheduler lands, these items are also
> visible on the dev assessment index, so an administrator must not open them
> early.

## Correctness

Every fixture here is verified independently of the item definitions in
[`calculusFoundationsModuleItems.test.ts`](../../../../../src/lessons/__tests__/calculusFoundationsModuleItems.test.ts):
each antiderivative checked against its rate by numerical differentiation,
the Riemann-sum route checked against the closed form, the turning points
confirmed by sign change, and every fixture asserted distinct from every
lesson `CalculusFixture` by sampled value comparison over any shared domain.
Each auto item additionally carries a `describeGradingContract` battery in
[`gradingContract.test.ts`](../../../../../src/lessons/__tests__/gradingContract.test.ts)
whose rejects pin the module's recurring defect classes: the area-model sign
error, a rate's turn confused with its zero, a time-of-max confused with a
time-of-zero, dropping the starting value, a reversed or over-wide interval,
and a turn sitting at an interval's endpoint rather than strictly inside it.

**Two supporting code changes landed with this module, both required, not
incidental:**
- **`cueLint.test.ts`**: `METHOD_CUE_PATTERNS` was entirely linear-algebra
  terms, so `mod-calcfound-select-method` would have passed its forward check
  vacuously; extended with calculus cues (antiderivative, Riemann, FTC,
  telescoping, symmetry, partition, bracket, substitution). Its inverse guard
  was hard-coded to `/eliminat/`, which would have hard-failed this item;
  generalized to "names at least one candidate method from the same pattern
  list" — a strict generalization that keeps every existing linear-algebra
  assertion true.
- **`capabilities.ts`**: added `interval-without-bracket-guarantee`, a new
  `ConstructCheck` kind, because without it the module had no auto-graded E4
  item at all (nothing else in the capability set predicate-grades a
  constructed *interval*).

## Results & readiness

- **Class A (module-owned) discharged with real evidence:** **0 / 13.** All
  thirteen items are **built** and machinery-verified; none has been
  administered.
- **Delayed-retention verified:** **no** — and it cannot be automatic for
  this module until the scheduler is generalized (above).
- **Timed performance evidenced:** **no.** The mock set exists and is
  auto-gradable; no learner has attempted it under time.
- **Readiness claim supported** (per
  [§6.2](../../../../authoring/mastery-standard.md#62-what-evidence-justifies-each-readiness-claim)):
  **none at the module level.** "Module mastered" needs E3–E5 across the
  must-demonstrate outcomes on a cumulative set **plus one delayed retrieval
  success** — this module has neither result. "Exam ready" additionally needs
  timed exam-mode performance under real conditions, which the mock set has
  never provided. "Proof-ready" is not claimed and not applicable — no P3
  override at launch. The four lessons' own Gate 8 acceptances stand on
  their **lesson-owned** evidence and are unaffected by this; what remains
  undischarged is exactly what they deferred.
- **Gate 9: NOT PASSED.**

Feeds a course-level Gate 10 validation for `calculus-foundations`, not yet
opened.
