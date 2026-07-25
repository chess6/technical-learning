# Module assessment plan (Gate 9) — Structure of Linear Maps

The Gate 9 cumulative-assessment plan for the `structure` module. It certifies
*integration and delayed retention across the module* and **discharges the
module-owned outcomes** L8, L9 and L10 deferred. Follows
[authoring/mastery-standard.md §6](../../../../authoring/mastery-standard.md#6-assessment-architecture)
and draws items from
[authoring/assessment-patterns.md](../../../../authoring/assessment-patterns.md).
References the lesson mastery contracts; does not restate them.

> **Status: BUILT, NOT ADMINISTERED — Gate 9 NOT PASSED.** All eleven items are
> authored, registered in three sets, and machinery-verified (pure-math
> re-derivation, grading contracts with the adversarial reject battery, capability
> + registration + evidence-ceiling conformance). **That is not learner evidence.**
> The tests exercise the capture/grade/review path with *synthetic* answers. Per
> the mastery standard, **built-but-unadministered module evidence licenses no
> mastery or readiness claim**, so every "Result" below reads
> `built · not administered` and no readiness claim is made in
> [§Results](#results--readiness).

## Module metadata
- **Module / unit id:** `structure` (matches the unit id in `src/lessons/courseModel.ts`).
- **Lessons in module:** L8 `subspaces-rank`, L9 `rank-nullity`, L10 `change-of-basis`.
- **Profile target for this module:** **P3 override** (subspace and rank–nullity
  proofs) on top of the course primary **P2** and the research-bridge overlay —
  from [course-spine §0](../../course-spine.md#0-declared-course-target-gate-1).
  So this plan must evidence **proof construction and counterexample (P3)**, a
  **concrete multi-dimensional applied slice (P2)** in \(\mathbb{R}^3\)–\(\mathbb{R}^4\)
  including non-square shapes, and **delayed retention (D12)** — with enrichment
  off the exam bar.
- **Out of module scope:** orthogonality and the row / left-null space (L12, L14);
  abstract vector spaces and general fields (P3's full bar, not reachable from
  concrete \(\mathbb{R}^n\)); eigen-*theory* — L11 belongs to
  `spectra-geometry-data`, and only the eigenspace's identity as a null space is
  exercised here, as L9's own contract requires.

## Outcomes handled here — two ownership classes

### Class A — genuinely module-owned (deferred from the lessons; the *module* is the owner)

Pulled from the lessons' mastery contracts
([L8](../../lessons/08-subspaces-rank/mastery-contract.md#1d-outcomes-with-evidence),
[L9](../../lessons/09-rank-nullity/mastery-contract.md#1d-outcomes-with-evidence),
[L10](../../lessons/10-change-of-basis/mastery-contract.md#1d-outcomes-with-evidence)).

| Outcome (operational) | From | Dim | Target | Item | Result |
| --- | --- | --- | --- | --- | --- |
| Integrate rank with elimination and the two spaces on a mixed item | L8 | D10 | E5 | `mod-struct-rank-nullity-ledger` | built · not administered |
| Integrate rank–nullity with determinants and eigen-multiplicity | L9 | D10 | E5 | `mod-struct-eigen-shift` | built · not administered |
| Integrate change of basis with rank and determinants | L10 | D10 | E5 | `mod-struct-cob-matrix-fresh` (produced) + `mod-struct-derive-similarity` (reasoned) | built · not administered |
| Retain the two-space distinction under delayed retrieval | L8 | D12 | E3 → **E1** | `mod-struct-retain-two-spaces` | built · not administered · **see the level note** |
| Retain "the total is \(n\)" under delayed retrieval | L9 | D12 | E3 → **E1** | `mod-struct-retain-total-n` | built · not administered · **see the level note** |
| Retain the \(P\)-direction convention under delayed retrieval | L10 | D12 | E3 → **E1** | `mod-struct-retain-p-direction` | built · not administered · **see the level note** |
| Construct the subspace argument, scored | L8 | D6 | E5 claim / **E6 target** | `mod-struct-prove-subspace-inclusion` | built · not administered |
| Construct the rank–nullity argument, scored | L9 | D6 | E5 claim / **E6 target** | `mod-struct-prove-rank-nullity` | built · not administered |
| Derive the similarity invariants, scored | L10 | D6 | E5 claim / **E6 target** | `mod-struct-derive-similarity` | built · not administered |
| Select the method unprompted across the module | L8–L10 | D8 | E3 | `mod-struct-select-method` | built · not administered |
| Diagnose the module's signature error | L8 | D13 | E4 | `mod-struct-diagnose-colspace` | built · not administered |

**Level note on the D12 rows (a deliberate downgrade, not an oversight).** The
three lesson contracts each ask for **E3** under delayed retrieval. These items
are **multiple-choice, and therefore E1** — recognition is all a picker can
record ([`evidence.ts`](../../../../../src/lessons/evidence.ts) caps
`multiple-choice` at E2). That is the right form *for a retention check* on
outcomes that already carry produced evidence in-lesson, and it is the form the
`systems-elimination` module used for the same purpose. But it does **not** meet
the letter of the contracts' E3 request, so the D12 rows are **partially**
discharged: retention is measurable, retention *at E3* is not. Closing it means a
produced delayed item (a second ledger, a second \([A]_B\)), which is a
straightforward addition once the module has ever been administered.

**Level note on the three proof rows.** The manifest's `evidenceTarget` tops out
at **E5** ([`assessmentManifest.ts`](../../../../../src/lessons/assessmentManifest.ts)),
so E5 is what these items *declare*. The competence they target is **E6
(justification)** — and E6 is only real once a human scores the writing against
the snapshotted rubric. The app's `self-check` is self-marked and does not score
correctness; the module runner routes these to the human-scoring review queue
precisely so that self-marking cannot be mistaken for evidence.

### Class B — cumulative reassessment of **lesson-owned** outcomes (ownership stays with the lesson)

These remain the lessons' to demonstrate; the module only re-fires them on fresh
instances and integrates them. **The module cannot substitute for a lesson's
Gate 8.** All three lessons report their lesson-owned outcomes as independently
demonstrated in-lesson, so unlike `systems-elimination` this module inherits no
blocked Gate 8 — with one honest exception, recorded below.

| Lesson-owned outcome (re-fired here) | Owner | Purpose at module | Item |
| --- | --- | --- | --- |
| Produce \(\operatorname{rank}A\) and a basis of \(\operatorname{Null}(A)\) from one reduction | L8 | fresh, non-square reassessment | `mod-struct-rank-nullity-ledger` |
| Take the column-space basis from \(A\), never from its reduced form | L8 | the signature error, staged as a diagnosis | `mod-struct-diagnose-colspace` |
| Produce nullity from rank on a non-square map | L9 | fresh reassessment at \(n = 4\) | `mod-struct-rank-nullity-ledger` |
| Compute a geometric multiplicity as \(n-\operatorname{rank}(A-\lambda I)\) | L9 | the same computation, on a matrix the learner must shift themselves | `mod-struct-eigen-shift` |
| Produce \([A]_B = P^{-1}AP\) for a fresh basis | L10 | fresh reassessment on a *non-adapted* basis | `mod-struct-cob-matrix-fresh` |
| State which quantities survive a change of basis | L10 | derived rather than recalled | `mod-struct-derive-similarity` |

> **Honest exception.** L8/L9/L10 each record their proof outcome as
> "**practiced**; P3 credit deferred to Gate 9" — i.e. the *lessons* did not claim
> it. That deferral is what the three proof items above discharge, and it stays
> undischarged until they are administered and scored.

## Abstraction-return deferrals discharged here

| Deferred from | Destination (general case) | Item | Result |
| --- | --- | --- | --- |
| L8 `subspaces-rank` | genuinely \(n\)-dimensional drill beyond the \(3\times3\) visual | `mod-struct-rank-nullity-ledger` (\(3\times4\), \(n=4\)) | built · not administered |
| L5 `solution-sets` → structure module | full \(\mathbb{R}^n\) null space & rank–nullity — the deferral the [systems–elimination plan](../systems-elimination/assessment-plan.md#abstraction-return-deferrals-discharged-here) routed here | `mod-struct-rank-nullity-ledger` (null space of a non-square map, produced in full) | built · not administered |

**Not discharged, and honestly so:** the ceiling is now \(n = 4\), not general
\(n\). Abstract vector spaces remain untouched — that is a P3 gap this module
cannot close from concrete \(\mathbb{R}^n\), and it is recorded in
[validation.md](validation.md) rather than papered over.

## The assessment set (cumulative · interleaved · spaced)

Three sets with **disjoint membership**, so no item is ever administered twice
and a later set cannot measure recall of an earlier one.

### `structure-review` — cumulative & interleaved (5 items)
Auto-graded production and human-scored writing **alternate**, so no run of one
kind cues the next, and the two produced-elimination items sit either side of a
change-of-basis computation — the learner must decide what each asks for rather
than repeating a rhythm.

1. **`mod-struct-rank-nullity-ledger`** (D10, E5, auto) — a \(3\times4\) map with
   a target. One reduction must answer four questions: is \(\mathbf{b}\) reachable
   (L8 existence), how many pivots (rank), how many free variables (nullity), and
   what spans \(\operatorname{Null}(A)\). The shape is deliberately non-square so
   the conservation law cannot be satisfied by reading the wrong total — the exact
   failure L9's contract names.
2. **`mod-struct-select-method`** (D8, E3, human) — two questions: one settled by
   a counting argument with **no arithmetic at all** (can a map \(\mathbb{R}^4\to\mathbb{R}^2\)
   be one-to-one?), one that cannot be answered without computing. The prompt names
   neither method; `cueLint.test.ts` enforces that.
3. **`mod-struct-cob-matrix-fresh`** (D10, E3, auto) — \([A]_B = P^{-1}AP\) on a
   fresh basis deliberately **not** adapted to the map, on a matrix that has no
   real eigenvalues at all, so no basis could make it diagonal. The learner's own
   check is the invariants.
4. **`mod-struct-diagnose-colspace`** (D13, E4, human) — the module's signature
   error, staged so the student's **reduction is correct** and only the extraction
   is wrong. The learner must locate the step precisely and produce the witness
   showing the wrong basis vector is not in \(\operatorname{Col}(A)\) at all.
5. **`mod-struct-eigen-shift`** (D10, E5, auto) — the learner forms \(A-\lambda I\)
   themselves and solves the homogeneous system; the free-variable count they
   produce **is** the geometric multiplicity. Chosen so geometric = algebraic (a
   whole plane of eigendirections), the case a defective example would hide.

### `structure-proof` — P3 proof & counterexample (3 items, all human-scored)
Every statement is **fresh**: none re-runs the proof its own lesson displays, so
this measures construction, not recall of a shown argument.

- **`mod-struct-prove-subspace-inclusion`** — prove \(\operatorname{Col}(AB)\subseteq\operatorname{Col}(A)\)
  from what membership means, naming the witnessing input; then **exhibit a strict
  case**; then conclude \(\operatorname{rank}(AB)\le\operatorname{rank}(A)\) and say
  why the strict case matters to that conclusion. (Proof **and** counterexample —
  both halves the "proof-ready" bar in
  [§6.2](../../../../authoring/mastery-standard.md#62-what-evidence-justifies-each-readiness-claim)
  requires.)
- **`mod-struct-prove-rank-nullity`** — prove the load-bearing step of rank–nullity
  (that the images of the extension vectors are independent) **and state exactly
  where the null-basis hypothesis is used**; then use the theorem to prove no
  \(\mathbb{R}^5\to\mathbb{R}^3\) map is one-to-one, and identify the step that
  fails in the reversed shape. Asking for the displayed proof back would have been
  recall; this asks for the one step a learner typically cannot reconstruct, plus
  a use and a boundary.
- **`mod-struct-derive-similarity`** — derive rank/nullity invariance from
  invertibility of \(P\) alone (not from a quoted formula), then kill the converse
  with an explicit pair matching in determinant, trace **and** rank that is
  provably not similar.

### `structure-retention` — delayed retrieval (3 items, D12)
The two-space distinction (L8), the total being \(n\) and not \(m\) (L9), and the
\(P\)-direction convention (L10), each on **fresh** dimensions. Recognition items
by design (see the level note above).

> **Platform limit, stated rather than worked around.** The spacing scheduler is
> hard-scoped to a single `SPACED_MODULE_ID`
> ([`src/platform/spacedConfig.ts`](../../../../../src/platform/spacedConfig.ts) =
> `systems-elimination`), so **nothing auto-schedules these**, and they are
> registered as an ordinary set rather than as platform "spaced" sets. Until the
> scheduler is generalized to a set of modules, `structure-retention` must be
> **administered manually** at roughly +7 and +30 days after the first
> `structure-review` release. Generalizing it is a small, well-bounded change
> (`SPACED_MODULE_ID` → a lookup, plus the persistence normalizer's referential
> check), but it is **platform work and deliberately out of this plan's scope**.
> Consequence: until it lands, these items are also visible on the dev assessment
> index, so an administrator must not open them early.

### Not covered by this module — a timed set (D11 / S3)
`systems-elimination` carries the course's only timed mock. This module authors
**no** timed set, because a mock must use instances distinct from the practice
set and all eleven items here are committed to the three sets above. The S3 claim
for this module is therefore **unsupported**, and it is recorded as a follow-up in
[validation.md](validation.md) rather than implied by the sets that do exist.

## Correctness

Every matrix here is verified independently of the item definitions in
[`structureModuleItems.test.ts`](../../../../../src/lessons/__tests__/structureModuleItems.test.ts):
the ledger's rank/nullity/particular/null basis against `solveLinearSystem`, the
eigen-shift as genuinely \(A - I\) with its basis vectors confirmed as
eigenvectors of \(A\), \([A]_B\) recomputed as \(P^{-1}AP\) with trace and
determinant preserved and the discriminant shown negative, the diagnosis fixture
shown to be a real trap (the student's span is a *different* plane), and every
fixture asserted distinct from all L8/L9/L10 and systems–elimination matrices.
Each auto item additionally carries a `describeGradingContract` battery in
[`gradingContract.test.ts`](../../../../../src/lessons/__tests__/gradingContract.test.ts)
whose rejects pin the recurring defect classes: blank-as-zero (sharpest on the
homogeneous item, where every true value **is** zero), zero-filled blanks,
incomplete-object credit, an unreduced or non-row-equivalent matrix, the wrong
total (\(n-m\) instead of \(n-\operatorname{rank}\)), a null-space point offered
as the particular solution, dependent "basis" directions, and the change-of-basis
conversion run backwards.

## Results & readiness

- **Class A (module-owned) discharged with real evidence:** **0 / 11.** All eleven
  items are **built** and machinery-verified; none has been administered.
- **Delayed-retention verified:** **no** — and it cannot be automatic for this
  module until the scheduler is generalized (above).
- **Proof competence (P3) evidenced:** **no.** Three human-scored surfaces exist;
  no learner has written into them and no author has scored one.
- **Readiness claim supported** (per
  [§6.2](../../../../authoring/mastery-standard.md#62-what-evidence-justifies-each-readiness-claim)):
  **none at the module level.** "Module mastered" needs E3–E5 across the
  must-demonstrate outcomes on a cumulative set **plus one delayed retrieval
  success** — this module has neither result. "Exam ready" additionally needs
  timed exam-mode performance, which this module does not even offer.
  "Proof-ready" needs scored E6, which requires administration. The three
  lessons' own Gate 8 acceptances stand on their **lesson-owned** evidence and are
  unaffected by this; what remains undischarged is exactly what they deferred.
- **Gate 9: NOT PASSED.**

Feeds [validation.md](validation.md) (Gate 10, module scope).
