# ADR 004 — Experience node ontology (optional media, objectives-with-evidence, five node kinds)

Status: Accepted (2026-08), package R0–R3 of `feature/experience-architecture`

## Context

`LessonDefinition` (`src/lessons/types.ts`) requires `guidedSceneId` and
`explorationId` as non-optional strings, and `lessonWiring.test.ts` asserts both
resolve for every registered lesson. This is the mechanism that forces every
concept through the same Motion Canvas + Mafs media pair regardless of whether
the mathematics needs either — a historical breakthrough, a proof-oriented
argument, and a pure synthesis experience are all unrepresentable today for
that reason alone, not because of block ordering (the block palette is already
explicitly non-sequential; see vision.md §0 and lesson-design.md's "no default
spine to deviate from").

Separately, `UnitItem` (`src/lessons/courseModel.ts`) has exactly one content
kind (`lesson`, plus the stub `future`). Workshops (`ModuleRunner.tsx`) and
assessments (`moduleSets.ts`) exist and work, but have no curriculum
representation and are reachable only through `dev/*` routes — the "lesson"
node is asked to be experience, workshop, and assessment at once, which is the
same over-loading problem the redesign brief names for presentation.

Finally, "at least two exercises and a checkpoint" (`lessonWiring.test.ts`) is
a quota, not a correctness condition: it neither guarantees every learning
objective has evidence nor permits an experience whose objectives are entirely
`module-owned` to have zero exercises of its own.

## Decision

1. **`guidedSceneId` and `explorationId` become optional.** A lesson registers
   either when its route actually contains a `watch`/`visual` or `explore`
   block; `lessonWiring.test.ts`'s two blanket assertions become "resolves *for
   every lesson that declares one*." This is the single change that makes
   media optionality real rather than aspirational.
2. **`objectives: LessonObjective[]` is added**, each objective naming an
   `evidence: "lesson-owned" | "module-owned" | "course-owned"` owner, a
   claimed `evidenceLevel` (E1–E5, `src/lessons/evidence.ts`), and optionally
   the `itemIds` that discharge it. `learningObjectives: string[]` stays valid
   and required until every lesson migrates — this is additive, not a
   breaking rename. A new `objectiveCoverage.test.ts` replaces the exercise
   quota: every `lesson-owned` objective must resolve to at least one item at
   or above its claimed level; nothing is orphaned.
3. **The route palette gains three block kinds**: `callout` (explicit
   placement, replacing the position heuristic in `LessonPage.tsx`), `proof`
   (a proof as the main line, not a `FormalBlock`'s collapsed justification),
   and `composed` (an escape-hatch registry, `blockComponents.tsx`, modeled on
   the existing `lessonVisuals.tsx` / `explorations/registry.tsx` lazy-registry
   pattern). `practice` gains an optional `scaffold` field; `explore` gains an
   optional named `explorationId` (mirroring `visual`'s named `sceneId`).
4. **`UnitItem` gains three node kinds**: `workshop`, `assessment`, `review`,
   each resolving a `ModuleSet` (whose `mode` widens from `"exam"` to
   `"exam" | "practice"`). Every `courseModel.ts` helper already filters on
   `item.kind === "lesson"`, so this widening does not change any existing
   helper's behavior.

## Accepted target vs. implemented subset (amended 2026-08-01)

Item 4 above describes the **accepted target architecture**. Read on its own it
overstated what exists, so the split is recorded explicitly here. A reader
should be able to tell, without running the code, which half they are getting.

| Element | Status |
| --- | --- |
| `workshop` node kind | **Implemented.** Placed in `courseModel.ts`, reachable at `/set/:setId`. |
| `assessment` node kind | **Implemented**, same surface. |
| `review` node kind | **Deferred — not implemented.** No `UnitItem` variant exists. It needs a per-module spaced scheduler, and the scheduler is still hardcoded to one module with fixed `[7, 30]` delays. Scheduled with R6, driven by `revisited-by` edges. |
| `ModuleSet.mode: "practice"` | **Deferred — not implemented.** `mode` is still `"exam"` only, and every registered set declares it. |
| Distinct workshop grading | **Does not exist.** Both node kinds run the same `ModuleRunner` with the same deferred-feedback capture. |

**The distinction between a workshop and an assessment is therefore curriculum
framing, not behavior** — what the node is *for*, not how it is graded. Surfaces
may say which one a learner is on; they must not imply different engines.
`courseModel.ts#setNodeKind` exists for exactly that framing and says so.

This had a learner-visible consequence, now fixed: `ModuleRunner` rendered the
fixed label *"Exam mode · feedback after submit"* for **both** kinds, telling
someone working through a low-stakes workshop that they were sitting an exam.
It now describes behavior instead — *"Answers are recorded as you go · feedback
after you submit"* — which is true of both and claims nothing about a mode that
does not exist.

### Human review is local, and cannot certify independent mastery

The runner marks written responses `requiresReview` and shows "awaiting
review". That promise had **no production fulfilment** until `/review` shipped:
`ReviewQueue` was reachable only from `dev/review`, which a production build
eliminates, so every written response stayed pending forever.

`/review` now hosts the queue in production. What it is **not**: authenticated,
multi-user, remote, or automatic. Responses live in one browser's local
storage; nobody is notified; a human has to open the page on that device and
score them. Because there is no reviewer identity, **a pass recorded this way
is a self-administered judgment, not independently certified mastery** — the
page says so to the learner, and evidence language elsewhere must not claim
otherwise (`mastery-standard.md` §6.3's honesty constraint). `objectiveCoverage`
enforces the matching half in code: an item whose `evidenceBasis` is
`self-marked` cannot cover a lesson-owned objective.

## Consequences

- All 19 existing lessons compile and render unchanged: every field above is
  additive or a relaxation, never a narrowing. This is verified structurally —
  R1's acceptance gate is that the full e2e suite passes with **zero spec
  edits**.
- `LessonPage.tsx`'s callout auto-attachment heuristic is not removed in R1; it
  stays as the behavior for lessons that don't yet author an explicit
  `callout` block, and is deprecated once every lesson migrates (see the
  redesign plan's migration strategy).
- The `composed` escape hatch is deliberately constrained: a registered
  component requires tests and an accessible label (`blockComponents.test.ts`),
  the same bar the `custom` exercise-capability escape hatch already meets —
  this is chosen specifically to avoid re-fragmenting the design the way an
  unconstrained slot would.
- `ExperienceKind` (`"concept" | "historical" | "technique" | ...`) is added as
  catalog/authoring metadata only; a test asserts no renderer branches on it.
  It exists so authoring guidance and the future map page (R5) can talk about
  a form without that form ever selecting a layout.
- This ADR does not implement the curriculum graph (ADR-005) or mastery
  derivation (ADR-006); it is the node/experience layer those build on.
