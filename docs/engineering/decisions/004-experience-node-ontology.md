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
