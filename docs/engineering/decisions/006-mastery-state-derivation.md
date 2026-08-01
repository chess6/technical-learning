# ADR 006 — Mastery state is derived, never persisted

Status: Accepted (2026-08), package R6 of `feature/experience-architecture`

## Context

`docs/authoring/mastery-standard.md` §5 defines five states that must be kept
separate — exposure, completion, current performance, and retained mastery
(with transfer as a further distinction the redesign brief adds) — and its
anti-completion rule states plainly that "success at E1, watching an animation
to the end, or marking a lesson `completed` is not evidence of mastery and
must never be treated as such." `multi-domain-architecture.md` §3 sketches a
`LessonProgress { mastery: number }` field and explicitly defers it as
requiring empirical calibration this project does not have.

`LearnerState` (`src/platform/learnerState.ts`) already persists
`lessonProgress` (visited/completed), `exerciseAttempts` (per-attempt
correctness with timestamps), and `bookmarks` — fully typed, migrated across
`SCHEMA_VERSION` 1→2→3, and read by **no UI component**. The spaced scheduler
(`src/lessons/spacedSchedule.ts`) is real but hardcoded to one module, three
items, and fixed 7/30-day delays.

Adding a persisted `mastery: number` — as the long-term sketch proposes — would
require a new schema version, a decay/interval model this project has never
calibrated, and would directly contradict the anti-completion rule the moment
any single number is displayed as "mastery."

## Decision

**Mastery state is computed, not stored.** A new pure module,
`src/platform/mastery.ts`, exports `objectiveState(objective, learnerState,
now)` returning one of six labelled states — `unseen`, `exposed`, `completed`,
`performed`, `retained`, `transferred` — derived entirely from the *existing*
`LearnerState` fields (`lessonProgress`, `exerciseAttempts`) cross-referenced
against `ITEM_ASSESSMENT_META`'s evidence levels
(`src/lessons/assessmentManifest.ts`) and the objective's own claimed
`evidenceLevel` (ADR-004). No `SCHEMA_VERSION` bump; no new persisted field.

The derivation enforces the anti-completion rule structurally rather than by
convention: `completed` cannot produce `performed` (a completed lesson with no
graded attempt stays `completed`); `retained` requires a delayed attempt on a
non-identical instance (`freshExample.test.ts` already polices instance
freshness, so `retained` can lean on it rather than re-inventing a freshness
check); `transferred` requires E4+ on an instance the objective's own item
metadata marks fresh.

The generalized spaced scheduler (replacing the `SPACED_MODULE_ID` hardcoding)
is driven by `revisited-by` edges from the ADR-005 graph, once that graph
exists — R6 depends on R4 for this reason.

## Consequences

- `lessonProgress`, `exerciseAttempts`, and `bookmarks` go from
  "defined, migrated, read by nothing" to load-bearing, closing the gap
  `learnerState.ts` has carried since Package F/H shipped the attempt-set
  machinery without wiring the simpler per-lesson fields.
- No migration risk: existing stored state under `SCHEMA_VERSION = 3` is read
  as-is; `mastery.ts` is a pure function over data that already exists.
- The five/six states are always surfaced **by name** in any future UI
  (mastery-standard.md §6.3's honesty constraint) — never collapsed into a
  percentage or a single "mastery score." A future package that wants a single
  number for display purposes must get an explicit, separately-reviewed
  exception to this ADR, not a quiet addition to `mastery.ts`.
- Extending `ITEM_ASSESSMENT_META` coverage from module items only (its
  current scope) to lesson exercises is a prerequisite for `objectiveState` to
  work for `lesson-owned` objectives — tracked as part of R1's
  `objectiveCoverage.test.ts`, not deferred to R6.
