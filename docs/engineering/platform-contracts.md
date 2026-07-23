# Platform contracts

Four small, expandable contracts that standardize the platform's **durable
identities, integration boundaries, mathematical truthfulness, and reusable
capabilities** — and nothing about pedagogy or lesson composition. Each contract
is a *registry + typed envelope + escape hatch*, mirroring the string-key
indirection the codebase already uses (explorer / guided-scene registries).

The governing principle: **protect, never reduce, lesson-level creative
freedom.** A lesson author remains free to choose whatever combination and
ordering of narrative, formalism, animation, exploration, proof, worked
examples, misconceptions, and problem-solving best teaches a concept. There are
no mandatory phases, exercise quotas, universal templates, or closed DSL.

## The four contracts

### 1. Identity & versioning — `src/platform/identity.ts`

- Entity-branded ids (`CourseId`, `UnitId`, `LessonId`, `ExerciseId`,
  `ConceptId`). Existing unnamespaced ids stay **canonical**; branding is a
  compile-time guard only.
- Renames go through **alias maps** + `resolveId`, so stored progress keyed by a
  retired id resolves forward instead of being silently erased.
- `SCHEMA_VERSION` + a tested, injectable `runMigrations` chain.
- **Escape hatch:** an experimental `x-` id namespace for content that may live
  outside the canonical curriculum tree. Experimental ids are **still** subject
  to syntax, uniqueness, referential-integrity, and alias checks — the prefix
  only exempts them from the "must appear in the curriculum" requirement.

### 2. Course container — `src/lessons/courseModel.ts`

- `Subject -> Course -> Unit -> Lesson ref` tree; Karatsuba modeled as its own
  algorithms course rather than a section of Linear Algebra.
- **Unitless-course convenience:** a course may list lessons directly; the
  adapter treats them as a single implicit default unit.
- A **compatibility adapter** projects the model onto today's sidebar shape and
  reproduces the current lesson order/numbering.
- **Coexistence:** the existing `curriculum.ts` `COURSE_SECTIONS` and the flat
  `registry.ts` `lessons[]` remain the **temporary authoritative source**. The
  model is a validated secondary representation; the live UI does not read it
  yet. "Render identically" is interpreted **semantically** (same sections,
  titles, items, order), not as byte-identical markup.

### 3. Exercise capabilities — `src/lessons/capabilities.ts` + `ExercisePanel`

- An interaction is a **capability** identified by one capability id, bundled but
  **split across layers**: grading + JSON-safe answer serialization live in the
  pure `src/lessons` layer (no React); rendering + typed draft live beside
  `ExercisePanel`, keyed by the same id.
- The five built-in types (`multiple-choice`, `numeric`, `vector`, `eigenvalue`,
  `prediction`) are registered as capabilities with **no behavioral change**.
- **Escape hatch:** a single `custom` union member names one `capabilityId`. New
  interactions register a capability reached this way — no new union member, no
  central switch edit. The **committed-prediction** pilot (commit before reveal)
  ships entirely through this path.

### 4. Learner-state envelope — `src/platform/learnerState.ts`

- A versioned `{ schemaVersion, lessonProgress, exerciseAttempts, bookmarks }`
  keyed by canonical (alias-resolved) ids.
- Attempts are **JSON-safe, capability-aware serialized answer envelopes**
  carrying `capabilityId` + `answerSchemaVersion`, so a future migration can
  reinterpret a stored answer when a capability's answer shape evolves.
- Types + migration only. **No persistence wiring.**

A related contract, the **mathematical-space conventions**, is documented
separately in [`engineering/math-space-conventions.md`](math-space-conventions.md): space
labels are semantic roles (distinct labels need not mean distinct vector spaces),
and semantically distinct spaces must be shown in separate or explicitly mapped
frames (labeled split screens allowed).

## Non-goals (explicit)

These are deliberately **out of scope**. Adding them prematurely would build
speculative machinery ahead of the lessons that would prove it out.

- **No pedagogy standardization.** No mandatory lesson phases, exercise quotas,
  universal templates, per-step worked-example schema, or closed instructional
  DSL. The lesson `route` block palette is untouched.
- **No persistence layer.** No localStorage / IndexedDB / network sync, no
  storage keys, no auto-save. The learner-state contract is types + migration
  only.
- **No mastery / inference / scheduling.** No mastery estimation, misconception
  inference, spaced-review scheduling, or recommendations.
- **No curriculum cutover.** The new course model does not drive navigation yet;
  no path-aware routing, no Prev/Next rewrite, no visible re-sectioning. Karatsuba
  stays where it renders today.
- **No concept graph** unless a lesson actually authors `ConceptId` references
  (none do yet), at which point a minimal resolving registry would be added.
- **No independently composable grader/renderer ids.** A `custom` exercise
  resolves exactly one bundled capability id — not a grader id plus a separate
  renderer id.
- **No new built-in exercise types** beyond the one pilot; further interactions
  arrive through the `custom` capability path.

## Verification

- `npm run lint`, `npm run test` (unit), and `npm run test:e2e` for the
  visible changes (systems captions, shared `ExercisePanel` refactor).
- The systems caption change and `ExercisePanel` refactor are **real UI
  changes**, covered by `e2e/lesson-systems.spec.ts` and
  `e2e/lesson-determinants.spec.ts`.
