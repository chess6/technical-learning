# Package F — implementation-ready plan (module assessment infrastructure)

Canonical implementation plan for **Package F** of the `systems-elimination` mastery
pilot: the smallest reusable infrastructure for a cumulative/interleaved module-set
runner, deferred-feedback (exam) mode, human-scoring capture for written
reasoning/proofs, and a scheduler extension point for Package H. Annex to the
[implementation package](implementation-package.md); referenced by the
[assessment plan (Gate 9)](assessment-plan.md).

> **Planning only.** No application code is modified by this document. Building any
> slice below is **Mode C** and requires explicit approval per
> [course-authoring-workflow](../../../../authoring/course-authoring-workflow.md) and
> `.cursor/rules/course-authoring.mdc`. **Gate 8 stays NOT PASSED** until the
> human-scored obligations are actually scored (F3).

## 0. Findings that constrain the design (inspected before choosing it)

Read from the live code so the plan reuses what exists instead of re-inventing it:

- **No persistence layer exists yet.** `src/platform/learnerState.ts` is *types +
  migration only* (`LearnerState`, `ExerciseAttempt`, `makeAttempt`,
  `migrateLearnerState`, `normalizeLearnerState`); it explicitly has **no storage
  wiring**, and [`platform-contracts.md`](../../../../engineering/platform-contracts.md)
  lists "No persistence layer" as a current non-goal. `ExercisePanel` keeps drafts +
  results in ephemeral React `useState`; nothing is saved. **F introduces the first
  real persistence** (local, single-user) and therefore *supersedes* that non-goal
  for the assessment surface — recorded here, to be reflected in `platform-contracts.md`
  when F is built.
- **Grading is a pure capability dispatch.** `gradeExercise(exercise, answer)` →
  `GradeResult { correct, feedback, solutionReveal? }` (`src/lessons/grading.ts`),
  delegating to the capability registry (`src/lessons/capabilities.ts`). Each
  capability owns `answerSchemaVersion`, `serializeAnswer`, `parseAnswer`. **Reuse
  verbatim.**
- **`self-check` is self-marked, never human-scored** (`SELF_CHECK_ID` in
  `capabilities.ts`): it stores `{ text, selfMark }` and mirrors the learner's mark.
  Every P3 proof/reasoning surface (Package E) is a `self-check`. **F3 adds the
  human-scoring layer these need.**
- **`ExercisePanel` couples capture and reveal.** Capability *Body* components call
  `setResult(gradeExercise(...))` inline and paint correct/incorrect states
  immediately (`src/components/lesson/ExercisePanel.tsx`). Deferred feedback needs a
  capture-only phase — **F2 adds a `phase` to the body contract** (default preserves
  today's behavior exactly).
- **Routing** is `createBrowserRouter` under `AppShell` with a lazy
  `lesson/:lessonId` route and a dev-only `devRoutes` block gated by
  `import.meta.env.DEV` (`src/app/routes.tsx`, `LazyLessonRoute.tsx`). **Reuse the
  lazy + dev-gate pattern** for the runner and the reviewer surface.
- **Identity + migration** (`src/platform/identity.ts`): `SCHEMA_VERSION = 1`, a
  tested `runMigrations` chain keyed by *produced* version, branded ids, and
  `resolveId` alias forwarding. Attempts are keyed by **canonical** ids. **Reuse the
  runner; bump the version once (F1).**
- **Module membership is already declared.** `COURSE_SECTIONS` in
  `src/lessons/curriculum.ts` has section `systems-elimination` = lessons `systems`,
  `elimination`, `solution-sets`. The runner's set draws its items from these via the
  lesson registry — no duplicate id lists.

**Constraints honored:** single-user, **local-only** (localStorage); **no backend,
no authentication, no multi-user** infrastructure (the existing architecture does not
require it — the reviewer is the same local user on a dev-gated surface). Packages
**G–I and all assessment *content*** (module item authoring, spaced/timed sets) are
**out of scope**.

## 1. Domain model (introduced in F1, used by all slices)

New persisted types in `src/platform/learnerState.ts`, all JSON-safe, keyed by
canonical ids. Auto-graded and human-scored results are **separate fields** and never
merged.

```
AttemptSet {
  id: string                 // uuid-ish, generated locally
  setId: string              // ModuleSet id (which cumulative set this is)
  moduleId: string           // e.g. "systems-elimination"
  mode: "practice" | "exam"
  status: "in-progress" | "submitted" | "released"
  startedAt: string          // ISO-8601
  submittedAt?: string
  releasedAt?: string
  responses: AttemptItemResponse[]
  schedulerHint?: JsonValue   // opaque payload for the Package H hook (F4)
}

AttemptItemResponse {
  exerciseId: ExerciseId
  capabilityId: string
  answerSchemaVersion: number
  answer: JsonValue           // capability.serializeAnswer output
  autoResult?: { correct: boolean }   // ONLY for auto-gradable capabilities
  requiresReview: boolean     // true for self-check / proof / reasoning
  reviewId?: string           // link to a ReviewRecord when requiresReview
  at: string
}

ReviewRecord {
  id: string
  attemptSetId: string
  exerciseId: ExerciseId
  state: "pending" | "scored"
  rubricId: string
  rubricVersion: number
  score?: number              // human score (rubric-defined scale)
  passed?: boolean            // rubric pass/fail verdict
  reviewer?: string           // free-text local reviewer label (no auth)
  feedback?: string
  scoredAt?: string
}
```

`LearnerState` gains two collections: `attemptSets: Record<string, AttemptSet>` and
`reviews: Record<string, ReviewRecord>` (existing `lessonProgress`,
`exerciseAttempts`, `bookmarks` unchanged).

## Slice F1 — attempt/set domain model & persistence

### Files / components
- `src/platform/learnerState.ts` **(edit)** — add the types above; add
  `attemptSets` + `reviews` to `LearnerState` and `createEmptyLearnerState`; add
  `normalizeAttemptSets` / `normalizeReviews` (drop/repair malformed entries, resolve
  ids via `canonicalId`); extend `normalizeLearnerState` to construct them; add
  builders `makeAttemptSet`, `makeAttemptItemResponse`, `makeReview`.
- `src/platform/identity.ts` **(edit)** — `SCHEMA_VERSION` `1 → 2`.
- `src/platform/learnerState.ts` `LEARNER_MIGRATIONS` **(edit)** — add step `2`.
  **Migration correctness (gotcha):** `normalizeLearnerState` currently hard-codes
  `schemaVersion: SCHEMA_VERSION`. With the bump, the existing `0→1` step must still
  *produce v1*. Refactor so normalization does not force the version: give
  `normalizeLearnerState` an explicit `version` argument (or split "normalize
  collections" from "stamp version"), then `1: s => stamp(normalize(s), 1)` and
  `2: s => stamp({ ...normalize(s), attemptSets: {}, reviews: {} }, 2)`. The runner's
  invariant (each step sets exactly its version) stays satisfied.
- `src/platform/persistence.ts` **(new)** — `STORAGE_KEY`, `loadLearnerState()`
  (read → `JSON.parse` in try/catch → `migrateLearnerState`), `saveLearnerState(state)`
  (debounced, try/catch for quota), `clearLearnerState()`. No network, one key.
- `src/platform/useLearnerState.tsx` **(new)** — a `LearnerStateProvider` +
  `useLearnerState()` hook wrapping a reducer over `LearnerState`; loads once on
  mount, saves (debounced) on change. Actions: `startAttemptSet`,
  `putItemResponse`, `submitAttemptSet`, `releaseAttemptSet`, `upsertReview`.
- `src/components/layout/AppShell.tsx` **(edit)** — mount `LearnerStateProvider`.
- Tests: `src/platform/__tests__/learnerState.test.ts` **(extend)**;
  `src/platform/__tests__/persistence.test.ts` **(new)**;
  `src/platform/__tests__/useLearnerState.test.tsx` **(new)**.

### Data flow & state transitions
- Boot: `AppShell` → provider → `loadLearnerState()` → `migrateLearnerState` → state.
- Any action → reducer → new immutable `LearnerState` → debounced
  `saveLearnerState`.
- `AttemptSet.status`: `in-progress → submitted → released` (monotonic; F1 only
  models it, F2 drives it). `ReviewRecord.state`: `pending → scored`.

### Migration / backward-compatibility
- A v1 blob (or none) upgrades to v2 by adding **empty** `attemptSets`/`reviews`;
  all existing collections are preserved and alias-resolved by the existing
  normalizers. A schema **newer** than the app still refuses to downgrade (existing
  runner throw), caught by `loadLearnerState` → empty state + one console warning.
- Because nothing persists today, adding persistence is purely additive; no lesson or
  existing test behavior changes.

### Acceptance criteria
- `migrateLearnerState(v1Fixture)` → v2 with empty new maps and **identical**
  `lessonProgress`/`exerciseAttempts`/`bookmarks` (alias-resolved).
- Corrupt JSON, absent storage, quota exceeded, or a newer schema **never throw to
  the UI** (fall back to empty state / keep in-memory).
- Builders emit JSON-safe records; `autoResult` and `ReviewRecord` are distinct.

### Tests
- **Unit:** normalizers (drop malformed attempt/review, resolve ids); `0→2` and
  `1→2` migration; builders; persistence guards (corrupt, quota, newer-version).
- **Integration:** provider records an attempt set + a response, remounts, and
  reloads them from storage unchanged.

### Failure / recovery
- Parse/loader failure → empty state (+ warn once). Save quota exceeded → keep
  in-memory, non-blocking warning, retry on next change. Newer schema → refuse +
  empty state.

## Slice F2 — module runner & deferred-feedback flow

### Files / components
- `src/lessons/moduleSets.ts` **(new, pure)** — `ModuleSet { id, moduleId, title,
  mode, itemIds: string[] }`, a `MODULE_SETS` registry, and
  `resolveModuleSet(id): ExerciseDefinition[]` that gathers items across L3–L5 via
  the lesson registry (no duplicated ids). For F2 the set references **existing**
  lesson exercises only — real Class-A items are Package G (out of scope).
- `src/components/lesson/renderCapabilities.tsx` **(new; extract)** — move the
  capability *Body* registry out of `ExercisePanel.tsx` into a shared module so both
  `ExercisePanel` and `ModuleRunner` reuse identical rendering. `ExercisePanel`
  imports it (behavior-preserving refactor, covered by existing e2e).
- `src/components/lesson/ExercisePanel.tsx` **(edit)** — extend `CapabilityBodyProps`
  with `phase?: "immediate" | "capture" | "review"` (default `"immediate"`) and
  `onCapture?(answer: ExerciseAnswer)`. In `"capture"`, bodies collect input and call
  `onCapture` on submit **without** grading and **without** correct/incorrect visuals
  or reveals; in `"review"`, bodies render read-only from a stored answer plus the
  released `GradeResult`. Default path is byte-for-byte today's behavior.
- `src/components/assessment/ModuleRunner.tsx` **(new)** + `ModuleRunner.css` —
  orchestrates one `AttemptSet` via `useLearnerState`.
- `src/pages/ModulePage.tsx` **(new)** + `src/app/LazyModuleRoute.tsx` **(new)** —
  resolve the set and render the runner inside `AppShell`.
- `src/app/routes.tsx` **(edit)** — add `module/:moduleId` (lazy).
- Tests: `src/lessons/__tests__/moduleSets.test.ts` **(new)**;
  `src/components/assessment/__tests__/ModuleRunner.test.tsx` **(new)**;
  `e2e/module-runner.spec.ts` **(new)**.

### Data flow & state transitions
- Mount: resume the open `AttemptSet` for `(setId, mode)` or `startAttemptSet`.
- **Exam mode → phase `"capture"`:** each answer → `onCapture` → `putItemResponse`
  (serialized answer stored; **no** `autoResult`, **no** reveal). Free navigation and
  answer changes until submit.
- **Submit** → `submitAttemptSet` (status `submitted`) → runner grades every
  auto-gradable item with `gradeExercise` (writes `autoResult`), creates a `pending`
  `ReviewRecord` for each `requiresReview` item → `releaseAttemptSet` (status
  `released`).
- **Release → phase `"review"`:** read-only answers with auto feedback + reveals;
  human-scored items show **"Pending review"** until F3 scores them.
- **Practice mode → phase `"immediate"`:** reuse today's per-item reveal, but still
  record responses to the set (a non-exam cumulative runner).

### Migration / backward-compatibility
- Additive: lessons keep calling `ExercisePanel` with the default `"immediate"`
  phase; the registry extraction is behavior-preserving and guarded by the existing
  `e2e/lesson-*.spec.ts` suite.

### Acceptance criteria
- In exam mode **before submit**: the DOM shows **no** `data-state="correct|incorrect"`
  and **no** `SolutionReveal` for any item; answers are editable.
- **After submit**: auto items show grade + reveal; `requiresReview` items show
  "Pending review"; the `AttemptSet` is `released` and immutable.
- Mid-attempt reload **resumes** the same set with prior answers.

### Tests
- **Unit:** `resolveModuleSet` (gathers the right L3–L5 items, stable order); a pure
  "capture suppresses grading" helper.
- **Integration:** reducer flow capture → submit → release (auto results written,
  reviews created, status transitions).
- **Browser/e2e:** enter answers, assert nothing revealed pre-submit; submit; assert
  reveal + pending; reload mid-attempt resumes.

### Failure / recovery
- Submit with blanks → allowed; blanks recorded as omitted (`autoResult.correct =
  false`, no reviewer for omitted written items). Grading throw on a malformed stored
  answer → that item flagged `errored`, others unaffected. Storage failure mid-attempt
  → in-memory continues + warning.

## Slice F3 — human-review & scoring workflow

### Files / components
- `src/lessons/capabilities.ts` **(edit)** — extend `SelfCheckConfig` with
  `rubricId?: string` and `rubricVersion?: number` (keep `rubric?`, `modelAnswer`).
  Add pure helpers `requiresHumanScore(exercise): boolean` and
  `rubricRef(exercise): { rubricId, rubricVersion } | null` (default id = exercise id,
  version = 1 when unset). No grading-behavior change for lessons.
- `src/lessons/moduleGate.ts` **(new, pure)** — `moduleGateStatus(state, setDef)` and
  `lessonGate8Status(state, requiredOutcomes)` returning
  `"NOT_PASSED" | "PASSED"`: **PASSED only when** every required auto item is
  `correct` **and** every required `ReviewRecord` is `scored` **and** `passed`; any
  `pending`/absent/`!passed` review ⇒ `NOT_PASSED`. This is the machine-checkable
  form of "Gate 8 must not pass while required responses remain unscored." Auto and
  human results stay distinct inputs.
- `src/components/assessment/ReviewQueue.tsx` + `ReviewItem.tsx` **(new)** — list
  `pending` reviews across attempt sets; show learner text, `modelAnswer`, and the
  rubric (`rubricId` + `rubricVersion` + `rubric` text); inputs for `score`,
  `passed`, `feedback`, optional `reviewer` label → `upsertReview` sets `state:
  "scored"`, `scoredAt`, and **snapshots** `rubricVersion`.
- `src/pages/ReviewPage.tsx` **(new)** + `src/app/routes.tsx` **(edit)** — add
  `dev/review` inside the existing `devRoutes` block (dev-gated; **no auth**, not in
  the production route tree).
- Tests: `src/lessons/__tests__/moduleGate.test.ts` **(new)**;
  `src/components/assessment/__tests__/ReviewQueue.test.tsx` **(new)**;
  optional `e2e/module-review.spec.ts` **(new)**.

### Data flow & state transitions
- Released set with `requiresReview` items → `pending` `ReviewRecord`s → reviewer
  opens `dev/review` → scores → `state: scored` (+ `score`, `passed`, `feedback`,
  `reviewer`, `scoredAt`, `rubricVersion`). `moduleGateStatus` recomputes purely from
  state; nothing mutates the mastery contracts automatically (they are updated by an
  author citing the recorded results).

### Migration / backward-compatibility
- Rubric fields optional ⇒ existing `self-check`s still work (id-derived rubric ref,
  version defaults to 1). Additive; no lesson visual change.

### Acceptance criteria
- Gate selector returns `NOT_PASSED` with any pending or failed required review, and
  `PASSED` only when all required auto items are correct **and** all required reviews
  are `scored` + `passed`.
- Reviewer can move `pending → scored` capturing score, pass/fail, feedback,
  timestamp, reviewer, and the rubric version.
- Automatic and human results are never merged (distinct fields/collections).
- The reviewer surface is **dev-only** (absent from production route/bundle).

### Tests
- **Unit:** gate selector across pending / failed / all-passed; `requiresHumanScore`
  / `rubricRef` defaults.
- **Integration:** submit exam → reviews pending → gate `NOT_PASSED` → score pass →
  gate `PASSED`; a `rubricVersion` snapshot survives a later config bump.
- **Browser (optional):** reviewer scores a self-check; a gate badge flips.

### Failure / recovery
- Save without a score → blocked. Scoring a response whose exercise/rubric changed →
  `rubricVersion` mismatch surfaced; review stays `pending` until re-reviewed.
  Single-user store ⇒ last-write-wins (documented; multi-user is out of scope).

## Slice F4 — scheduler extension point, integration & verification

### Files / components
- `src/platform/scheduler.ts` **(new)** — `SchedulerHook` interface
  (`onAttemptReleased(summary): ScheduledReview[]`, `dueReviews(now): ScheduledReview[]`),
  a **no-op default**, and `registerScheduler` / `getScheduler`. A persisted
  `spacedOutcomes` stub may be recorded on release **without any scheduling logic or
  UI** — Package H implements the real hook and the experience.
- `src/components/assessment/ModuleRunner.tsx` **(edit)** — on `releaseAttemptSet`,
  call `getScheduler().onAttemptReleased(...)` inside try/catch (never blocks
  release). Store any returned hint on `AttemptSet.schedulerHint`.
- `src/app/routes.tsx` **(edit)** — finalize `module/:moduleId` (prod) and
  `dev/review` (dev); add a **minimal** entry link to the runner (e.g. a "Module
  review set" CTA on the module section or `HomePage`).
- Docs: update [implementation-package.md](implementation-package.md) status; note in
  [assessment-plan.md](assessment-plan.md) that the runner / human-scoring /
  scheduler seam now exists (Results still `planned` until G–I author content and it
  is run); add a dated entry to
  [lesson-correctness-checklist.md](../../../../quality/lesson-correctness-checklist.md);
  reflect the persistence non-goal change in
  [platform-contracts.md](../../../../engineering/platform-contracts.md).
- Tests: `src/platform/__tests__/scheduler.test.ts` **(new)**; full-suite run.

### Data flow & state transitions
- Release → runner invokes the scheduler hook (default no-op) → optional
  `schedulerHint` persisted. No due-date surfacing, no reminders (H owns that).

### Migration / backward-compatibility
- Default no-op hook ⇒ **zero behavior change** vs F3. `schedulerHint`/`spacedOutcomes`
  are optional and additive; no version bump beyond F1's.

### Acceptance criteria
- The hook is invoked exactly once per release with a no-op default and no observable
  change; a thrown hook is isolated and never blocks release.
- **No scheduling experience** is implemented (no due list, no reminders).
- All prior slices integrated: runner reachable from a link; reviewer dev-only; full
  suite green (`tsc -b`, `oxlint`, `vitest`, e2e).

### Tests
- **Unit:** no-op hook returns nothing; a fake hook is invoked with the release
  summary; a throwing hook does not break release.
- **Integration/e2e:** end-to-end exam → submit → release → (dev) review → gate flips
  → scheduler hook fired (spied), all persisted across reload.
- **Full verification:** `tsc -b`, `npm run lint`, `npm run test`, and the assessment
  e2e specs.

### Failure / recovery
- Scheduler throw → caught, logged, release proceeds. Missing scheduler → no-op.

## Slice sequencing, size & seams

| Slice | Deliverable | Depends on | Size | Reuses |
| --- | --- | --- | --- | --- |
| **F1** | Domain model + real persistence (store/provider/migration v2) | — | M | learner-state envelope, `runMigrations`, `resolveId`, `json.ts` |
| **F2** | Module-set model + runner + deferred-feedback phase | F1 | L | capability registry, `gradeExercise`, `ExercisePanel` bodies, lazy routing |
| **F3** | Human-review surface + `moduleGateStatus` gate selector | F1, F2 | M | `self-check` config, dev-route pattern |
| **F4** | Scheduler seam + integration + full verification | F1–F3 | S | routing, `AppShell` |

## Explicit non-goals for Package F (kept out)

- **No assessment content** — no `mod-*` item authoring, no cumulative/timed/spaced
  *sets*; those are **Packages G / H / I**. F2 uses existing L3–L5 items only to
  exercise the runner.
- **No scheduling experience** — F4 ships the *seam* only (H owns spacing UX/logic).
- **No backend, authentication, or multi-user** review; single-user localStorage.
- **No mastery estimation / misconception inference / recommendations.**
- **No curriculum-model cutover** (navigation still driven by `curriculum.ts`).
- **No automatic contract mutation** — `moduleGateStatus` *reports*; an author cites
  real results to update contracts and `assessment-plan.md` (Gate 9).

## Gate posture

Building F does **not** by itself pass any gate. When F3 exists and the Package E
proof/reasoning `self-check` surfaces are **actually human-scored + passed**, the
lesson-owned Gate 8 obligations clear; only then does the assessment plan's **Class B**
become runnable, and only real **Gate 9** results (Packages G–I administered) may
support any "module mastered / exam-ready / proof-ready" claim
([COURSE §6.2](../../../../authoring/mastery-standard.md#62-what-evidence-justifies-each-readiness-claim)).
Until then **Gate 8 remains NOT PASSED**.
