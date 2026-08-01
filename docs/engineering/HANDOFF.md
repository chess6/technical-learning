# Session handoff — `feature/experience-architecture`

**Active goal.** Implement the pedagogical & product-architecture redesign
plan (major redesign request, 2026-08-01): a flexible experience model
replacing the implicit universal lesson grammar, a curriculum graph, and a
learner model — landed incrementally as packages R0–R7+, each independently
verified. This session completed the **first vertical slice, R0–R3**, exactly
as the plan's roadmap scoped it, and stopped at the slice's own review gate.

## What is built (R0–R3, all committed on this branch)

- **R0** — Pedagogical constitution as doctrine amendments (`vision.md` §0,
  `lesson-design.md`'s extended block palette, ADR-004/005/006). Docs only.
- **R1** — The experience model: `guidedSceneId`/`explorationId` optional on
  `LessonDefinition`; `LessonObjective` (evidence-typed, additive alongside
  `learningObjectives`); three new route blocks — `callout`, `proof`,
  `composed` (+ a `blockComponents.tsx` lazy registry). Verified: all 19
  existing lessons render byte-identically, full e2e suite unchanged.
- **R2** — Karatsuba rebuilt as the historical-breakthrough archetype: the
  field's O(n²) belief and its 1960 break are `callout` blocks in the
  argument (not a depth-layer aside); a new `composed` block
  (`KaratsubaThreeEvaluationsLab`) makes the already-approved "three
  evaluations of a quadratic" connection concrete; the lesson ends on an
  open question (Toom-Cook → FFT), not a generic summary.
- **R3** — `workshop`/`assessment` `UnitItem` kinds (courseModel.ts), reusing
  two existing `systems-elimination` module sets with zero new items; a
  production route `/set/:setId` (`ModuleSetPage`, beta-labeled); one
  theorem (`rank-nullity`) retrofitted to a `proof` route block.

**Package status ledger:** see the commit messages on this branch (`git log
feature/experience-architecture`) — each of the four packages above is its
own commit with a detailed message serving as that package's record; no
separate ledger file was created for this (small, single-agent) slice.

## Slice self-review pass (after R3, before requesting independent review)

A critical re-read of the whole R0–R3 diff found **four more real defects**,
all fixed in that pass (full write-up in
[quality/lesson-correctness-checklist.md](../quality/lesson-correctness-checklist.md)'s
"Slice review pass" section):

1. **`objectives` had no consumer** — `objectiveCoverage.test.ts` asserted
   nothing, because no lesson declared `objectives`. R1's acceptance criterion
   "objective coverage is validated from data" was not actually met, and this
   contradicted the reasoning used to defer the `review` node kind. Fixed by
   migrating `karatsuba`; two of its six objectives are honestly
   `course-owned` (evidence exists only in the checkpoint/scene, and
   Algorithmic Thinking has no module set) — a real coverage gap the model
   now surfaces instead of hiding.
2. **ADR-006 claimed an `ITEM_ASSESSMENT_META` extension that never happened.**
   Corrected, including the real R6 consequence: `transferred` cannot be
   derived without `evidenceBasis`, so extending the manifest is R6 work.
3. **The `proof` block render was asserted nowhere** — verified only by a
   manual screenshot. Added a dedicated e2e spec.
4. **No global anchor-uniqueness check** — `callout-`/`proof-` anchors are
   content-keyed, so double-placement silently emits duplicate DOM ids. Added
   a repo-wide validator.

Both new validators were **proven to bite** (deliberately broken, observed to
fail with a precise message, then reverted) rather than merely observed to
pass.

## Two real defects found and fixed during the original R2/R3 work

1. `FormalStatement`'s first `proof`-variant design repeated the entire
   theorem statement/interpretation/trap-layer verbatim before the proof —
   caught by manual browser screenshot review, not by any test. Redesigned:
   `variant="proof"` now renders a distinct, minimal block.
2. Two `**bold**` spans wrapping inline `$...$` math silently lost their
   markers (`ProseWithMath` extracts math before emphasis). Fixed in
   `rankNullity.ts`; documented as a new `known-failure-modes.md` entry.
   **Five more pre-existing occurrences were found in unrelated lessons**
   (`determinants.ts`, `matrixComposition.ts`, `redBlackTrees.ts`,
   `structureModuleItems.ts`, `subspacesRank.ts`) and are recorded there,
   **not fixed** — outside this slice's scope; each is its own
   narrow-correction commit.

## Test state

`./check.sh --e2e` and the full unit suite (2140 tests) are green as of the
R3 commit, with exactly two pre-existing, already-documented, formally-waived
failures present (`solution-sets` text-clipping flake,
`ftc-accumulate-then-measure` seek-determinism) — both reproduced identically
against the pre-R1 baseline, confirmed unrelated to this branch's changes.
Do not trust a summary older than the R3 commit over live test output.

## What is NOT done — the actual next step

Per the plan (see the "Slice review gate" row in the roadmap): **an
independent Opus package-level semantic review of R0–R3, before any R4+ work
begins.** This was deliberately not self-certified in this session — the
same agent that builds a package should not also tick its own review box
(the precedent is ADR-002's self-certification gap, applied identically in
the `calculus-foundations` package ledger). Concretely, still open:

- [ ] Independent semantic review of R0–R3 (constitution, experience model,
      Karatsuba rebuild, node types/routes/proof retrofit) — mathematical,
      pedagogical, and architectural soundness. A **self**-review pass has run
      (see above) and found four real defects; that is not a substitute for
      independent review, and specifically does not discharge the
      self-certification gap ADR-002 names.
- [ ] Known-but-unfixed, recorded in the checklist's "reviewed and
      deliberately left alone" list: the named `explore`/`explorationId` path
      has no render test, and the ToC/layout divergence for unresolvable named
      targets is mirrored from `visual` rather than fixed. Neither is
      triggered by any current lesson.
- [ ] Five pre-existing `**bold**`-straddling-math occurrences in unrelated
      lessons (see `known-failure-modes.md`) remain unfixed by design — each
      is its own narrow-correction commit.
- [ ] User sign-off on the two things this session decided that deviate from
      the original plan text, both reasoned through in-session and recorded
      in code comments / ADRs, but not separately re-confirmed:
      - `review` (cumulative spaced retrieval) as a `UnitItem` kind is
        **deferred to R6**, not built in R3 — no per-module scheduler data
        exists yet to back it (ADR-004/005 "no consumer" rule).
      - Karatsuba's ending is an **open-question section**, not a `handoff`
        block — no built lesson exists yet to hand off to (the Fourier/FFT
        lesson is unbuilt), and a `handoff.to` must resolve to a real lesson.

**Not started:** R4 (curriculum graph as data), R5 (course split + `/map`
page), R6 (mastery derivation), R7+ (content expansion). Per the plan, none
of these should begin before the slice review gate above passes.

## Coordination with `feature/l5-chain-rule`

That branch (separate worktree, `../technical-learning-l5-chain-rule`) was
not touched by this session. Overlap risk is confined to `moduleSets.ts`
(this branch widened nothing there — R3 only *added* two nodes referencing
*existing* sets) and `capabilities.ts`/`assessmentManifest.ts` (untouched
here). Check `git log master..feature/l5-chain-rule` for its current state
before merging either branch.
