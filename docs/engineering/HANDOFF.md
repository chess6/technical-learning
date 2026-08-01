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

## Two real defects found and fixed during the work (not pre-existing)

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
      pedagogical, and architectural soundness.
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
