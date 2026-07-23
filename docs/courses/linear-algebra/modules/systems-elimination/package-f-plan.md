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
require it). Because `localStorage` is per-origin, **the runner and the reviewer are
both dev-gated on the same origin** so they share one store (a production runner cannot
rely on a dev-only reviewer); cross-origin transfer is via **Export/Import** only.
Packages **G–I and all assessment *content*** (module item authoring, spaced/timed
sets) are **out of scope**.

## 1. Domain model (introduced in F1, used by all slices)

New persisted types in `src/platform/learnerState.ts`, all JSON-safe, keyed by
canonical ids. Auto-graded and human-scored results are **separate fields** and never
merged. A released attempt is **self-contained and reproducible**: it snapshots the
set identity + version, the *ordered* items (each with the serialized definition and
the rubric/model answer it was reviewed against), and the released auto-feedback — so
review mode reproduces exactly what the learner saw even if the live lesson exercises
are later renamed, removed, or changed.

```
AttemptSet {
  id: string                 // uuid-ish, generated locally
  setId: string              // ModuleSet id (which cumulative set this is)
  setVersion: number         // ModuleSet content version at start (repro key)
  moduleId: string           // e.g. "systems-elimination"
  mode: "practice" | "exam"
  status: "in-progress" | "submitted" | "released"
  startedAt: string          // ISO-8601
  submittedAt?: string
  releasedAt?: string
  items: AttemptItemSnapshot[]    // ORDERED, frozen at start (the exam "form")
  responses: AttemptItemResponse[]
  schedulerEmittedAt?: string     // idempotency marker for the F4 release hook
  schedulerHint?: JsonValue       // opaque payload for the Package H hook (F4)
}

AttemptItemSnapshot {        // frozen copy of what the learner was shown
  exerciseId: ExerciseId     // canonical id (alias-resolved at snapshot time)
  capabilityId: string
  answerSchemaVersion: number // capability answer-schema version at snapshot time
  definition: JsonValue      // serialized ExerciseDefinition (render + grade source)
  requiresReview: boolean    // true for self-check / proof / reasoning
  rubric?: {                 // SNAPSHOT (embedded), not a live pointer
    rubricId: string
    rubricVersion: number
    rubricText: string
    modelAnswer?: string
  }
}

AttemptItemResponse {
  exerciseId: ExerciseId
  answer: JsonValue          // capability.serializeAnswer output
  auto?: AutoResult          // ONLY for auto-gradable capabilities
  reviewId?: string          // link to a ReviewRecord when requiresReview
  at: string
}

// Auto grading is a tagged state, not a bare boolean: graded / error / omitted are
// distinct and the released feedback needed by review mode is persisted with it.
AutoResult =
  | { kind: "graded"; correct: boolean; feedback: string; solutionReveal?: JsonValue }
  | { kind: "error";  message: string }   // grader threw on the stored answer
  | { kind: "omitted" }                    // no answer captured before submit

ReviewRecord {
  id: string
  attemptSetId: string
  exerciseId: ExerciseId
  state: "pending" | "scored"
  rubricId: string
  rubricVersion: number      // the version snapshotted on the item at release
  score?: number             // human score (rubric-defined scale)
  passed?: boolean           // rubric pass/fail verdict
  reviewer?: string          // free-text local reviewer label (no auth)
  feedback?: string
  scoredAt?: string
}
```

`LearnerState` gains two collections: `attemptSets: Record<string, AttemptSet>` and
`reviews: Record<string, ReviewRecord>` (existing `lessonProgress`,
`exerciseAttempts`, `bookmarks` unchanged).

### Reproducibility rules (rename / remove / change)
- **Rename:** `exerciseId` is stored alias-resolved (`resolveId`), so a later rename
  keeps the response attached; the snapshot's `definition` is the authoritative render
  source regardless.
- **Remove:** review mode renders from `AttemptItemSnapshot.definition` (never the live
  registry), so a deleted exercise still displays and re-grades identically.
- **Change:** grading at submit uses the **snapshot** definition + snapshotted
  `answerSchemaVersion`, not the current one, so editing the live exercise never
  retro-changes a released attempt. `setVersion` records which form was administered.
- **Rubric:** the rubric text + `modelAnswer` are **snapshotted into the item** at
  release. Reviewers always see the version the learner was assessed against. (If a
  shared rubric store is later preferred, it must be a *genuinely versioned registry
  that can resolve old versions* — a latest-only pointer is not acceptable; the
  snapshot approach is the F-scope default because it needs no new registry.)

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
- `src/platform/persistence.ts` **(new)** — `STORAGE_KEY`, `readRaw()` (raw string or
  `null`),   `loadLearnerState(): LoadOutcome` (parse + `migrateLearnerState`, classified
  — see below), `saveLearnerState(state)` (debounced, try/catch for quota),
  `clearLearnerState()`, and `exportRaw()` / `importRaw(json)` (JSON download/upload of
  the envelope — the only cross-origin transfer path; import runs through
  `migrateLearnerState` and refuses a newer schema). No network, one key.
  **`loadLearnerState` never returns a blank state for an unreadable-but-present blob**
  — it distinguishes the cases so the provider can refuse to save over data it could
  not parse.
- `src/platform/useLearnerState.tsx` **(new)** — a `LearnerStateProvider` +
  `useLearnerState()` hook wrapping a reducer over `LearnerState`. **Hydration is
  explicit and saves are gated on it** (see phases below). Actions: `startAttemptSet`,
  `putItemResponse`, `submitAttemptSet`, `releaseAttemptSet`, `upsertReview`.
- `src/components/layout/AppShell.tsx` **(edit)** — mount `LearnerStateProvider`;
  render children only once hydration resolves (or render a lightweight boot state).
- Tests: `src/platform/__tests__/learnerState.test.ts` **(extend)**;
  `src/platform/__tests__/persistence.test.ts` **(new)**;
  `src/platform/__tests__/useLearnerState.test.tsx` **(new)**.

### Load outcome & hydration model (safety-critical)
`loadLearnerState()` returns a **classified `LoadOutcome`**, never a bare state:

```
LoadOutcome =
  | { kind: "empty" }                                 // no stored blob → fresh state
  | { kind: "loaded"; state: LearnerState }           // parsed + migrated to current
  | { kind: "incompatible"; reason: "newer-schema" | "unmigratable"; raw: string }
  | { kind: "corrupt"; raw: string }                  // present but unparseable
```

The provider is a small state machine:

```
phase: "loading" → "ready"      (empty | loaded)   → saves ENABLED
phase: "loading" → "read-only"  (incompatible | corrupt) → saves DISABLED
```

- **Initialize before enabling saves.** The reducer starts in `phase: "loading"` with
  no persisted writes. Only after `loadLearnerState()` resolves does it transition to
  `"ready"` (and only then are debounced saves armed). This removes the mount-time race
  where an empty initial state could be flushed over good stored data.
- **Never overwrite a newer/unsupported schema.** `incompatible` (schema newer than
  the app, or a migration that cannot run) → `phase: "read-only"`: the in-memory state
  is the fresh empty envelope **but every save is a no-op** and the original `raw`
  bytes are left untouched in storage. The UI shows a non-blocking "progress saved with
  a newer version; not modified here" notice and offers **Export** (download `raw`) so
  the learner can move it to a compatible build. `corrupt` behaves the same (read-only,
  raw preserved) plus an explicit "reset & start fresh" affordance that is the *only*
  path that overwrites the bytes.

### Data flow & state transitions
- Boot: `AppShell` → provider (`phase:"loading"`) → `loadLearnerState()` →
  `"ready"` (empty/loaded) or `"read-only"` (incompatible/corrupt).
- In `"ready"`: any action → reducer → new immutable `LearnerState` → debounced
  `saveLearnerState`. In `"read-only"`: actions still update in-memory state for the
  session but **saves are suppressed**.
- `AttemptSet.status`: `in-progress → submitted → released` (monotonic; F1 only
  models it, F2 drives it). `ReviewRecord.state`: `pending → scored`.

### Migration / backward-compatibility
- A v1 blob (or none) upgrades to v2 by adding **empty** `attemptSets`/`reviews`;
  all existing collections are preserved and alias-resolved by the existing
  normalizers.
- A schema **newer** than the app is classified `incompatible` (the runner's existing
  downgrade-refusal throw is caught and mapped to the outcome) → **read-only, raw
  preserved** — it is *never* replaced with empty state.
- Because nothing persists today, adding persistence is purely additive; no lesson or
  existing test behavior changes.

### Acceptance criteria
- `migrateLearnerState(v1Fixture)` → v2 with empty new maps and **identical**
  `lessonProgress`/`exerciseAttempts`/`bookmarks` (alias-resolved).
- No save occurs before hydration resolves (a save armed during `"loading"` is a
  logic error the tests catch).
- A **newer-schema or corrupt** blob puts the provider in `"read-only"`, and **no
  write ever mutates the stored bytes** in that mode (verified by asserting the raw
  string is byte-identical after a session of actions).
- Corrupt JSON, absent storage, and quota-exceeded **never throw to the UI**.
- Builders emit JSON-safe records; `AutoResult` and `ReviewRecord` are distinct.

### Tests
- **Unit:** normalizers (drop malformed attempt/review, resolve ids); `0→2` and
  `1→2` migration; builders; `loadLearnerState` classification for each `LoadOutcome`
  variant; save guards (quota).
- **Integration (provider):**
  - hydrate-then-save ordering: no `setItem` fires until the load resolves;
  - `read-only` (newer schema) → session actions leave the stored raw **unchanged**;
  - `corrupt` → read-only + `raw` preserved; explicit reset is the only overwrite;
  - happy path: record an attempt set + response, remount, reload unchanged.

### Failure / recovery
- Absent storage / parse failure with **no** blob → `empty` → fresh state, saves on.
- Present-but-unparseable blob → `corrupt` → **read-only**, raw preserved, warn once,
  offer Export + explicit Reset.
- Newer/unmigratable schema → `incompatible` → **read-only**, raw preserved, offer
  Export.
- Quota exceeded on save → keep in-memory, non-blocking warning, retry next change.

## Slice F2 — module runner & deferred-feedback flow

### Files / components
- `src/lessons/moduleSets.ts` **(new, pure)** — `ModuleSet { id, version, moduleId,
  title, mode, itemIds: string[] }`, a `MODULE_SETS` registry, and
  `resolveModuleSet(id): { set: ModuleSet; items: ExerciseDefinition[] }` gathering
  items across L3–L5 via the lesson registry (no duplicated ids). `version` bumps
  whenever the item list/order changes, so a released attempt can record which form it
  administered. For F2 the set references **existing** lesson exercises only — real
  Class-A items are Package G (out of scope).
- `src/lessons/attemptSnapshot.ts` **(new, pure)** — `snapshotItem(def):
  AttemptItemSnapshot` (serialize the `ExerciseDefinition`, capture `capabilityId` +
  `answerSchemaVersion` + `requiresReview` + rubric snapshot) and
  `gradeSnapshot(snapshot, answer): AutoResult` (grade against the **snapshot**
  definition, wrapping `gradeExercise` in try/catch → `error` state, and mapping a
  missing answer → `omitted`). This keeps released attempts reproducible.
- `src/components/lesson/renderCapabilities.tsx` **(new; extract)** — move the
  capability *Body* registry out of `ExercisePanel.tsx` into a shared module so both
  `ExercisePanel` and `ModuleRunner` reuse identical rendering. `ExercisePanel`
  imports it (behavior-preserving refactor, covered by existing e2e).
- `src/components/lesson/ExercisePanel.tsx` **(edit)** — extend `CapabilityBodyProps`
  with `phase?: "immediate" | "capture" | "review"` (default `"immediate"`) and
  `onCapture?(answer: ExerciseAnswer)`. In `"capture"`, bodies collect input and call
  `onCapture` on submit **without** grading and **without** correct/incorrect visuals
  or reveals; in `"review"`, bodies render read-only from the stored answer plus the
  persisted released `AutoResult` (feedback + reveal), rendering the item from the
  **snapshot** `definition`, not the live registry. Default path is byte-for-byte
  today's behavior.
- `src/components/assessment/ModuleRunner.tsx` **(new)** + `ModuleRunner.css` —
  orchestrates one `AttemptSet` via `useLearnerState`.
- `src/pages/ModulePage.tsx` **(new)** + `src/app/LazyModuleRoute.tsx` **(new)** —
  resolve the set and render the runner inside `AppShell`.
- `src/app/routes.tsx` **(edit)** — add the runner as a **dev-gated** route
  (`dev/module/:moduleId`) inside the existing `devRoutes` block, **on the same origin
  as the reviewer** (see §"Origin & surface exposure"). No production route is added
  during the pilot.
- Tests: `src/lessons/__tests__/moduleSets.test.ts` **(new)**;
  `src/lessons/__tests__/attemptSnapshot.test.ts` **(new)**;
  `src/components/assessment/__tests__/ModuleRunner.test.tsx` **(new)**;
  `e2e/module-runner.spec.ts` **(new)**.

### Origin & surface exposure (resolves the origin contradiction)
The runner writes to `localStorage`, which is **per-origin**; the reviewer must read
the *same* origin or it sees nothing. For the pilot both surfaces are therefore
**dev-gated and served from the same origin** — `dev/module/:moduleId` (runner) and
`dev/review` (reviewer, F3) share one `localStorage`. No production learner surface is
shipped in Package F. To move an attempt to a *different* reviewer/origin, F1's
**Export/Import** (JSON download/upload of the learner-state envelope) is the supported
path; there is no server sync. (If a production learner runner is later wanted, the
reviewer must ship on that same origin or rely on Export/Import — recorded so the
contradiction cannot reappear.)

### Data flow & state transitions
- Mount: resume the open `AttemptSet` for `(setId, mode)`, or `startAttemptSet`, which
  **snapshots the ordered items** (`items: AttemptItemSnapshot[]`) and records
  `setVersion`.
- **Exam mode → phase `"capture"`:** each answer → `onCapture` → `putItemResponse`
  (serialized answer stored; **no** `auto`, **no** reveal). Free navigation and answer
  changes until submit.
- **Submit** → `submitAttemptSet` (status `submitted`) → runner grades every
  auto-gradable item via `gradeSnapshot` (writes a tagged `AutoResult` incl. the
  released feedback/reveal), creates a `pending` `ReviewRecord` for each
  `requiresReview` item (embedding the item's rubric snapshot) → `releaseAttemptSet`
  (status `released`).
- **Release → phase `"review"`:** read-only answers rendered from the snapshot with the
  persisted `AutoResult` feedback + reveal; human-scored items show **"Pending
  review"** until F3 scores them.
- **Practice mode → phase `"immediate"`:** reuse today's per-item reveal, but still
  record responses to the set (a non-exam cumulative runner).

### Migration / backward-compatibility
- Additive: lessons keep calling `ExercisePanel` with the default `"immediate"`
  phase; the registry extraction is behavior-preserving and guarded by the existing
  `e2e/lesson-*.spec.ts` suite.
- Released attempts are immune to later lesson edits/renames/removals via the snapshot
  (see §1 "Reproducibility rules").

### Acceptance criteria
- In exam mode **before submit**: the DOM shows **no** `data-state="correct|incorrect"`
  and **no** `SolutionReveal` for any item; answers are editable.
- **After submit**: auto items show grade + persisted reveal; `requiresReview` items
  show "Pending review"; the `AttemptSet` is `released` and immutable.
- Review mode renders from the snapshot: **deleting or editing** the live lesson
  exercise after release does not change the reviewed attempt.
- Mid-attempt reload **resumes** the same set with prior answers.

### Tests
- **Unit:** `resolveModuleSet` (right L3–L5 items, stable order, `version` present);
  `snapshotItem`/`gradeSnapshot` — graded/error/omitted states; grading uses the
  snapshot (mutating the live def after snapshot does not change the result).
- **Integration:** reducer flow capture → submit → release (tagged `AutoResult`
  written, reviews created with rubric snapshot, status transitions).
- **Browser/e2e:** enter answers, assert nothing revealed pre-submit; submit; assert
  reveal + pending; reload mid-attempt resumes; edit/remove the source exercise and
  confirm the released review is unchanged.

### Failure / recovery
- Submit with blanks → allowed; blanks recorded as `AutoResult { kind: "omitted" }`
  (no `ReviewRecord` for an omitted written item). Grading throw on a stored answer →
  `AutoResult { kind: "error" }` for that item; others unaffected. Storage failure
  mid-attempt → in-memory continues + warning (per F1 read-only/quota rules).

## Slice F3 — human-review & scoring workflow

### Files / components
- `src/lessons/capabilities.ts` **(edit)** — extend `SelfCheckConfig` with
  `rubricId?: string`, `rubricVersion?: number`, and `rubricText?: string` (keep
  `rubric?`, `modelAnswer`). Add pure helpers `requiresHumanScore(exercise): boolean`
  and `rubricSnapshotOf(exercise): AttemptItemSnapshot["rubric"] | undefined` (default
  `rubricId` = exercise id, `rubricVersion` = 1, `rubricText` from the config). No
  grading-behavior change for lessons. The snapshot is captured at attempt start
  (F2), so the reviewer never depends on a live rubric pointer.
- `src/lessons/reviewStatus.ts` **(new, pure)** — **conservative review reporting
  only, NOT a Gate 8 verdict.** `reviewStatus(state, attemptSet): ReviewStatus` where
  `ReviewStatus = "REVIEW_PENDING" | "REVIEW_COMPLETE" | "REVIEW_FAILED"`:
  `REVIEW_PENDING` while any required review is `pending`/absent; `REVIEW_FAILED` if
  all scored but any required review `!passed`; `REVIEW_COMPLETE` only when every
  required review is `scored` **and** `passed`. It reports the machine-readable
  **blocker**, and deliberately does **not** emit `PASSED`/Gate 8 — see the box below.
- `src/components/assessment/ReviewQueue.tsx` + `ReviewItem.tsx` **(new)** — list
  `pending` reviews across attempt sets; show the learner text plus the **snapshotted**
  rubric (`rubricId` + `rubricVersion` + `rubricText` + `modelAnswer`) taken from the
  item snapshot; inputs for `score`, `passed`, `feedback`, optional `reviewer` label →
  `upsertReview` sets `state: "scored"`, `scoredAt`, and records the snapshotted
  `rubricVersion`.
- `src/pages/ReviewPage.tsx` **(new)** + `src/app/routes.tsx` **(edit)** — add
  `dev/review` inside the existing `devRoutes` block (dev-gated; **no auth**, not in
  the production route tree; **same origin** as `dev/module/:moduleId`).
- Tests: `src/lessons/__tests__/reviewStatus.test.ts` **(new)**;
  `src/components/assessment/__tests__/ReviewQueue.test.tsx` **(new)**;
  `e2e/module-review.spec.ts` **(new, mandatory)**.

> **Gate 8 scope (corrected).** Package F **does not decide Gate 8.** A machine
> `PASSED` would require three artifacts this package does **not** define: (1) a
> canonical **outcome → evidence manifest** mapping each lesson-owned outcome to the
> item(s) that evidence it; (2) the **required evidence level** per outcome; and (3) a
> **retake / aggregation policy** (best-of vs latest vs must-pass-all across multiple
> attempt sets). Absent those, F reports only the conservative, machine-readable
> **`REVIEW_PENDING` / `REVIEW_COMPLETE` / `REVIEW_FAILED`** blocker for a given
> attempt set. **Substantive Gate 8 approval stays author-controlled**: an author reads
> the recorded results and updates the mastery contracts / `assessment-plan.md`.
> `REVIEW_COMPLETE` is a *necessary-not-sufficient* precondition, never an automatic
> pass.

### Data flow & state transitions
- Released set with `requiresReview` items → `pending` `ReviewRecord`s (each carrying
  the item's rubric snapshot) → reviewer opens `dev/review` → scores → `state:
  scored` (+ `score`, `passed`, `feedback`, `reviewer`, `scoredAt`, `rubricVersion`).
  `reviewStatus` recomputes purely from state; **nothing** mutates the mastery
  contracts automatically.

### Migration / backward-compatibility
- Rubric fields optional ⇒ existing `self-check`s still work (id-derived rubric
  snapshot, version defaults to 1). Additive; no lesson visual change.

### Acceptance criteria
- `reviewStatus` returns `REVIEW_PENDING` with any pending/absent required review,
  `REVIEW_FAILED` if all scored but any `!passed`, and `REVIEW_COMPLETE` only when all
  required reviews are `scored` + `passed`. It **never** returns a Gate 8 pass.
- Reviewer can move `pending → scored` capturing score, pass/fail, feedback,
  timestamp, reviewer, and the snapshotted rubric version.
- Automatic (`AutoResult`) and human (`ReviewRecord`) results are never merged.
- The reviewer surface is **dev-only** and on the **same origin** as the runner.

### Tests
- **Unit:** `reviewStatus` across pending / failed / complete; asserts it exposes no
  `PASSED` value; `requiresHumanScore` / `rubricSnapshotOf` defaults.
- **Integration:** submit exam → reviews `pending` → `reviewStatus =
  REVIEW_PENDING` → score pass → `REVIEW_COMPLETE`; the snapshotted `rubricVersion`
  survives a later live-config bump (reviewer still sees the administered version).
- **Browser/e2e (mandatory — `e2e/module-review.spec.ts`):** the **complete flow** —
  open `dev/module/:moduleId`, answer a written/self-check item, **submit**, confirm
  the item is **pending review** (no score), open `dev/review`, **score** it
  (pass + feedback), return and confirm the attempt shows **REVIEW_COMPLETE**, then
  **reload** and confirm the scored completion **persisted**.

### Failure / recovery
- Save without a score → blocked. Scoring a response whose live rubric later changed is
  unaffected: the reviewer scored the **snapshot**; `rubricVersion` records which. A
  stale/removed exercise still reviews from the snapshot. Single-user store ⇒
  last-write-wins (documented; multi-user is out of scope).

## Slice F4 — scheduler extension point, integration & verification

### Files / components
- `src/platform/scheduler.ts` **(new)** — `SchedulerHook` interface
  (`onAttemptReleased(summary): ScheduledReview[]`, `dueReviews(now): ScheduledReview[]`),
  a **no-op default**, and `registerScheduler` / `getScheduler`. A persisted
  `spacedOutcomes` stub may be recorded on release **without any scheduling logic or
  UI** — Package H implements the real hook and the experience.
- `src/components/assessment/ModuleRunner.tsx` **(edit)** — release emits the hook
  **idempotently**: the reducer's `releaseAttemptSet` sets `schedulerEmittedAt` and the
  hook is dispatched **only when that marker is unset**, keyed by `attemptSetId`. Wrap
  in try/catch (never blocks release). A rerender, a reload of an already-released set,
  or a repeated `releaseAttemptSet` dispatch must **not** re-emit. Store any returned
  hint on `AttemptSet.schedulerHint`.
- `src/app/routes.tsx` **(edit)** — both pilot surfaces are **dev-gated on the same
  origin**: `dev/module/:moduleId` (runner) and `dev/review` (reviewer). Add a minimal
  **dev-only** index (e.g. a `dev/assessment` links page, or entries on the existing
  dev routes) — no production learner entry point in Package F.
- Docs: update [implementation-package.md](implementation-package.md) status; note in
  [assessment-plan.md](assessment-plan.md) that the runner / human-scoring /
  scheduler seam now exists (Results still `planned` until G–I author content and it
  is run); add a dated entry to
  [lesson-correctness-checklist.md](../../../../quality/lesson-correctness-checklist.md);
  reflect the persistence non-goal change in
  [platform-contracts.md](../../../../engineering/platform-contracts.md).
- Tests: `src/platform/__tests__/scheduler.test.ts` **(new)**; full-suite run.

### Data flow & state transitions
- Release → if `schedulerEmittedAt` unset, runner invokes the scheduler hook (default
  no-op), stamps `schedulerEmittedAt`, and persists any `schedulerHint`. No due-date
  surfacing, no reminders (H owns that).

### Migration / backward-compatibility
- Default no-op hook ⇒ **zero behavior change** vs F3. `schedulerEmittedAt` /
  `schedulerHint` / `spacedOutcomes` are optional and additive; no version bump beyond
  F1's.

### Acceptance criteria
- The hook is invoked **exactly once per attempt set**, across component rerenders,
  a page reload of a released set, and repeated `releaseAttemptSet` dispatches
  (`schedulerEmittedAt` / `attemptSetId` idempotency).
- A thrown hook is isolated and never blocks release.
- **No scheduling experience** is implemented (no due list, no reminders).
- All prior slices integrated: both surfaces dev-only on one origin; full suite green
  (`tsc -b`, `oxlint`, `vitest`, e2e).

### Tests
- **Unit:** no-op hook returns nothing; a fake hook is invoked with the release
  summary; a throwing hook does not break release.
- **Idempotency (explicit):** a spied hook fires **once** under (a) repeated
  `releaseAttemptSet` dispatch, (b) runner **rerender**, and (c) **reload** of an
  already-released attempt set (marker already stamped ⇒ no re-emit).
- **Integration/e2e:** end-to-end exam → submit → release → (dev) review → status →
  `REVIEW_COMPLETE`, scheduler hook fired once (spied), all persisted across reload.
- **Full verification:** `tsc -b`, `npm run lint`, `npm run test`, and the assessment
  e2e specs (including the mandatory F3 review flow).

### Failure / recovery
- Scheduler throw → caught, logged, release proceeds; marker still stamped so a retry
  does not double-emit. Missing scheduler → no-op.

## Slice sequencing, size & seams

| Slice | Deliverable | Depends on | Size | Reuses |
| --- | --- | --- | --- | --- |
| **F1** | Domain model + hydration-safe persistence (store/provider/migration v2, Export/Import) | — | M | learner-state envelope, `runMigrations`, `resolveId`, `json.ts` |
| **F2** | Module-set model + snapshotting + runner + deferred-feedback phase (dev-origin) | F1 | L | capability registry, `gradeExercise`, `ExercisePanel` bodies, dev routing |
| **F3** | Human-review surface + conservative `reviewStatus` blocker (no Gate 8 pass) | F1, F2 | M | `self-check` config, dev-route pattern |
| **F4** | Idempotent scheduler seam + integration + full verification | F1–F3 | S | routing, `AppShell` |

## Explicit non-goals for Package F (kept out)

- **No assessment content** — no `mod-*` item authoring, no cumulative/timed/spaced
  *sets*; those are **Packages G / H / I**. F2 uses existing L3–L5 items only to
  exercise the runner.
- **No scheduling experience** — F4 ships the *seam* only (H owns spacing UX/logic).
- **No backend, authentication, or multi-user** review; single-user localStorage.
- **No mastery estimation / misconception inference / recommendations.**
- **No curriculum-model cutover** (navigation still driven by `curriculum.ts`).
- **No automatic Gate 8/Gate 9 decision** — `reviewStatus` reports only
  `REVIEW_PENDING/COMPLETE/FAILED`; substantive gate approval stays author-controlled
  (needs an outcome→evidence manifest + required levels + retake policy that F does not
  define). An author cites real results to update contracts and `assessment-plan.md`.
- **No production learner surface / no server sync** — both pilot surfaces are
  dev-gated on one origin; cross-origin transfer is via Export/Import only.

## Gate posture

Building F does **not** by itself pass any gate, and F **cannot** flip Gate 8 in code:
`reviewStatus` only reports `REVIEW_COMPLETE`, a *necessary-not-sufficient* precondition.
When F3 exists and the Package E proof/reasoning `self-check` surfaces are **actually
human-scored + passed** (`REVIEW_COMPLETE`), an **author** reviews the recorded results
and clears the lesson-owned Gate 8 obligations in the mastery contracts; only then does
the assessment plan's **Class B** become runnable, and only real **Gate 9** results
(Packages G–I administered) may support any "module mastered / exam-ready / proof-ready"
claim
([COURSE §6.2](../../../../authoring/mastery-standard.md#62-what-evidence-justifies-each-readiness-claim)).
Until an author records that, **Gate 8 remains NOT PASSED**.
