# Package H — implementation-ready plan (delayed / spaced retrieval, D12)

Canonical implementation plan for **Package H** of the `systems-elimination` mastery
pilot: three delayed-retrieval items re-firing the module's highest-value outcomes at
~1 week / ~1 month, a real `SchedulerHook` implementation on the Package F seam, and a
dev-gated surface for answering due reviews. Annex to the
[implementation package](implementation-package.md); **partially** discharges the D12 row of
the [assessment plan (Gate 9)](assessment-plan.md#the-assessment-set-cumulative--interleaved--spaced)
(the spaced items + scheduler; the L7/L8/L9 prerequisite-check wiring stays a tracked,
deferred D12 obligation — see §"Deferred D12 obligation").

> **Planning only.** No application code is modified by this document. Building any
> slice below is **Mode C** and requires explicit approval per
> [course-authoring-workflow](../../../../authoring/course-authoring-workflow.md) and
> `.cursor/rules/course-authoring.mdc`, per the same **Mode C boundary** recorded in
> [implementation-package.md](implementation-package.md#package-h--delayed--spaced-retrieval-d12).

## 0. Findings that constrain the design (inspected before choosing it)

- **The scheduler seam is a no-op today, and its `dueReviews` method is unusable as
  designed.** `src/platform/scheduler.ts` defines `SchedulerHook { onAttemptReleased,
  dueReviews }`, `NOOP_SCHEDULER`, and `registerScheduler`/`getScheduler`. It is documented
  as "Package H defines semantics." H supplies the first real implementation — but
  **narrows** the interface: the hook is registered at boot with **no access to
  `LearnerState`**, so `dueReviews(now)` structurally cannot answer "what is due" from
  persisted state. Shipping it as a bypassed no-op would be dishonest, so H **removes**
  `dueReviews` from the hook and makes a pure `dueSpacedReviews(state, now)` the canonical
  due-query (a deliberate F-seam contract change — see H3).
- **`commit(updater, immediate)` is a generic read-modify-write primitive over a
  synchronous `stateRef` mirror** (`src/platform/useLearnerState.tsx:141-170`), and the
  existing `claimSchedulerEmission` (`useLearnerState.tsx:259-280`) shows the double-check
  pattern (read `stateRef.current`, re-check the guard inside the updater against `prev`).
  This means an entire multi-field change — release a primary attempt **and** write the
  cohort record **and** seed occurrences — can be **one atomic transition** (a single
  `commit(updater, true)`), not the three separate transitions F4 used. H relies on this to
  guarantee "no released first-eligible primary without a cohort record."
- **`ModuleRunner` resumes an attempt by `setId` alone** (`ModuleRunner.tsx:78-81`: filter
  `state.attemptSets` on `setId`, sort by `startedAt` desc) and **drops the `scheduled`
  field the hook returns** (`ModuleRunner.tsx:158-181`: `const { hint } =
  getScheduler().onAttemptReleased(summary)`). The `setId`-only resume is an
  **occurrence-collision bug** for spacing: a 7-day and a 30-day attempt on the *same*
  one-item set would resume each other. H fixes both — the runner keys the attempt on a new
  `scheduledReviewId`, and the release path persists the schedule (see H1/H3). The provider
  allows two attempts to coexist for one `setId` as long as their ids differ
  (`startAttemptSet` stores a caller-built `AttemptSet` by its own `id`,
  `useLearnerState.tsx:172-180`).
- **No "prerequisite check" infrastructure exists anywhere in the app.** The term appears
  only in `mastery-standard.md §6.1` (a *layer definition*) and as a forward-looking note in
  `assessment-plan.md`. There is no existing UI affordance, route, or data model for it — it
  would be new production-surface engineering, not a reuse of F.
- **L8 (`subspaces-rank`) and L9 (`rank-nullity`) are `future` spine nodes — not yet
  authored** (`course-spine.md` line 116–117). Wiring a prerequisite check into a lesson that
  does not exist is impossible; the original Package H scope line ("wired as L7/L8/L9
  prerequisite checks") is **two-thirds unbuildable today** — hence it stays a tracked,
  deferred D12 obligation (§"Deferred D12 obligation"), not a built deliverable.
- **Every existing assessment surface (runner, reviewer, recovery) is deliberately dev-gated
  on one origin** — Package F's explicit non-goal is "No production learner surface / no
  server sync." L7 (`determinants`) is a **shipped production lesson**; linking it to a
  `dev/*`-only route would be inconsistent with that non-goal and would be the first
  production-facing assessment surface in the project. **This plan does not cross that line.**
- **Grading/content patterns to reuse verbatim:** `type: "multiple-choice"` is a first-class
  `ExerciseDefinition` variant (not a pluggable capability — no id constant, e.g.
  `vectors.ts`, `elim-diagnose-illegal` in `elimination.ts`), already auto-gradable by the
  existing runner/`gradeExercise` path with **zero** new capability code. `ModuleSet` /
  `MODULE_ITEMS` / `resolveModuleSet` (Package F2/G) are reused unchanged — H adds items and
  sets, not new registries.
- **Schema / normalizer facts:** `SCHEMA_VERSION` is `2` (`identity.ts`, bumped by F1);
  `buildLearnerState(raw, version)` stamps the version and rebuilds all collections, and
  `LEARNER_MIGRATIONS[N] = buildLearnerState(state, N)` (each step stamps exactly its own
  version — `runMigrations` asserts it). Existing normalizers drop-on-malformed, enforce
  `key === id`, resolve ids via `canonicalId("exercise", …)`, and only **string**-check
  timestamps. H introduces **two** first-class collections (`spacedReviews`, `spacedCohorts`)
  — for the same reasons F1 gave `attemptSets`/`reviews` first-class types instead of
  stuffing them into `AttemptSet.schedulerHint` (which is untyped, attempt-scoped, and not
  queryable/validatable on load).

**Constraints honored:** local-only persistence (no backend); dev-gated only (no new
production surface); reuse the F scheduler seam (narrowed), module-set/runner machinery, and
`multiple-choice` capability. **Out of scope:** Package I (timed mock), any L7/L8/L9
lesson-file edits, and general spacing UX (reminders, notifications, calendar views) beyond
a due-list surface.

## 1. Domain model addition (introduced in H2, used by H3)

Each **scheduled occurrence** is modeled explicitly and keyed by a **stable deterministic
id** — the id *is* the occurrence identity, so cohorting and dedup fall out for free:

```
ScheduledSpacedReview {
  id: string                 // STABLE: `spaced:${moduleId}:${exerciseId}:${delayDays}`
  moduleId: "systems-elimination"
  exerciseId: string         // one of the three mod-spaced-* ids
  delayDays: 7 | 30
  setId: string              // the one-item spaced ModuleSet used to render it
  originAttemptSetId: string // the primary-set release that seeded the cohort
  dueAt: string              // ISO-8601 = anchor releasedAt + delayDays
  status: "scheduled" | "completed"
  completedInAttemptSetId?: string  // present iff status === "completed"
}
```

The **module-wide terminal state** that gates seeding lives in a separate record, **not** on
any `AttemptSet`:

```
SpacedCohort {
  moduleId: string            // map key
  status: "seeded" | "failed"
  anchorAttemptSetId: string  // the first eligible primary release
  anchorReleasedAt: string    // the release that started the 7/30-day clock
  failedAt?: string           // present iff status === "failed"
  error?: string              // short human-readable reason (failed only)
}
```

`LearnerState` gains **two** collections: `spacedReviews: Record<string,
ScheduledSpacedReview>` (keyed by the stable id) and `spacedCohorts: Record<string /*moduleId*/,
SpacedCohort>` (existing `attemptSets`, `reviews`, `lessonProgress`, `exerciseAttempts`,
`bookmarks` unchanged). `AttemptSet` gains one optional field, **`scheduledReviewId?: string`**,
which links a one-item spaced attempt to the exact occurrence it answers. A full cohort is
**six** occurrences: 3 spaced items × {7d, 30d}, so retrieval happens **twice** per item —
matching "~1 week / ~1 month" in the assessment plan.

### Reproducibility / idempotency rules
- **Stable ids, deterministic.** `id = deriveStableKey(moduleId, exerciseId, delayDays)`;
  `localId` is used only for `AttemptSet` ids. The deterministic id guarantees uniqueness and
  makes a re-seed of the same occurrence a harmless overwrite of the same key.
- **Module-wide cohort gate (the authoritative decision).** The release path invokes the
  scheduler **only when `spacedCohorts[moduleId]` is absent**. The first eligible primary
  release writes the record (`seeded` on success, `failed` on a compute throw); from then on
  **every** later primary release — a retake, or a release of a *different* primary set —
  sees the record present and **does not invoke the scheduler at all**. This prevents both a
  retry after the first release failed and a false-failure/duplicate-seed after a cohort
  already exists.
- **`dueAt` is anchored to the first eligible release** (`spacedCohorts[moduleId].
  anchorReleasedAt` + `delayDays`); it never shifts on later releases.
- **Exact-occurrence resolution (never "oldest").** Completing a spaced attempt marks the
  **exact** occurrence named by `attempt.scheduledReviewId` `completed` (+
  `completedInAttemptSetId`), after validation — see H2. A due item never answered simply
  stays `scheduled` and keeps showing on the due list (no penalty, no auto-skip — D12's stakes
  are "Low" per `mastery-standard.md §6.1`).

## Slice H1 — three spaced content items + one-item sets

### Files / components
- `src/lessons/moduleItems.ts` **(edit)** — add three `type: "multiple-choice"`
  items, each retrieving one already-evidenced outcome on a **fresh** instance
  distinct from every existing fixture (`sys-*`, `elim-*`, `sol-*`, and every
  existing `mod-*` system): `mod-spaced-trichotomy` (none/one/infinite
  classification, retrieving the L3 trichotomy), `mod-spaced-uniqueness`
  (existence-vs-multiplicity distinction, retrieving L5), `mod-spaced-rowops`
  (identify the illegal operation among legal/illegal row-op options, retrieving
  L4). Exact numbers/distractors authored at build time and independently
  re-verified in the math test, per the existing `moduleItems.test.ts` pattern.
- `src/lessons/moduleSets.ts` **(edit)** — three new one-item `ModuleSet`s:
  `systems-elimination-spaced-trichotomy`, `-uniqueness`, `-rowops` (`mode: "exam"`).
  Their ids form the exported **`SPACED_SET_IDS`** allowlist (used by the generic-route
  rejection in H3 and the fixed `setId ↔ exerciseId` mapping in H2). A one-item set is not a
  special case in F2's model.
- Tests: extend `src/lessons/__tests__/moduleItems.test.ts` (fresh-fixture
  verification against `src/math/linearSystemsGeneral.ts`, distinctness from every
  prior fixture) and `src/lessons/__tests__/moduleSets.test.ts` (registration,
  version, single-item ordering, `SPACED_SET_IDS` correctness).

### Honest evidence target
Multiple-choice recognition is **E1–E2** per the project's evidence rules — the same
rule that keeps `sys-count-none` etc. at E1 (see `implementation-package.md`
"Corrected evidence audit"). That is **intentional here, not a regression**: D12's
job is a *retention* signal on outcomes that **already have E3/E4 evidence
elsewhere** (in-lesson production, Package G), not to manufacture new transfer
evidence at a delay. Record this explicitly in the assessment-plan D12 row so a
future reader does not mistake "spaced item" for "new E3+ evidence."

### Acceptance criteria
- Each spaced item's fresh system is independently re-verified (solves, consistency,
  pivot/free structure as applicable) and is **not** numerically identical to any
  existing lesson, Package G, or sibling spaced fixture.
- The three one-item sets resolve via `resolveModuleSet` and render through the
  existing runner (via the occurrence route) with no capture/grade change.

## Slice H2 — `spacedReviews` + `spacedCohorts` domain model & persistence (schema v2 → v3)

### Files / components
- `src/platform/identity.ts` **(edit)** — `SCHEMA_VERSION` `2 → 3`.
- `src/platform/learnerState.ts` **(edit)** — add the `ScheduledSpacedReview` and
  `SpacedCohort` types and the `AttemptSet.scheduledReviewId?` field (+ `makeAttemptSet`
  param + `normalizeAttemptSet` copy); add both collections to `LearnerState`,
  `createEmptyLearnerState`, and `buildLearnerState`; add the `3:` migration step
  (`buildLearnerState(state, 3)` — each step stamps exactly its version, so `1→2`/`2→3`
  stay correct); add the deterministic-id builder `makeScheduledSpacedReview` and
  `deriveStableKey(moduleId, exerciseId, delayDays)`.
- **Hardened per-entry normalizers.** `normalizeSpacedReview` goes **beyond** the existing
  string-only-timestamp house style, dropping any entry that fails: `id === deriveStableKey(…)`
  (plus collection-level `key === id`); `Number.isFinite(Date.parse(dueAt))`; `exerciseId`
  resolves via `canonicalId("exercise", …)` **and** ∈ `SPACED_EXERCISE_IDS`; `setId` ∈
  `SPACED_SET_IDS`; `delayDays ∈ {7, 30}`; `moduleId === "systems-elimination"`;
  status/completion consistency (`completed` ⟺ `completedInAttemptSetId` present; `scheduled`
  ⟺ absent). `normalizeSpacedCohort` validates `status ∈ {seeded, failed}`, string
  `anchorAttemptSetId`/`anchorReleasedAt`, and the `failed`⟺`failedAt` pairing.
- **Cross-record integrity pass (new, pure, total).** After `buildLearnerState` normalizes
  every collection, a second pass conservatively drops/quarantines occurrences (and demotes a
  `seeded` cohort to `failed`) that fail any of: `originAttemptSetId` references a **released,
  eligible primary** attempt (`status === "released"`, `setId ∈ PRIMARY_SET_IDS`,
  `moduleId === "systems-elimination"`); `dueAt === originReleasedAt + delayDays`; `setId`
  corresponds to `exerciseId` (the fixed `SPACED_SET_IDS ↔ SPACED_EXERCISE_IDS` mapping); a
  **`completed` occurrence's linked attempt** satisfies **all** of `attempt.setId ===
  occurrence.setId`, `attempt.scheduledReviewId === occurrence.id`, `attempt.status ===
  "released"` with `Date.parse(attempt.releasedAt) >= Date.parse(occurrence.dueAt)`, and the
  mutual back-reference `occurrence.completedInAttemptSetId === attempt.id`; and **cohort
  completeness** — a `seeded` `spacedCohorts[moduleId]` with fewer than all six valid
  occurrences is quarantined (partial occurrences dropped) and the record rewritten to
  `failed` (`failedAt` = normalization time, `error` = "incomplete cohort on import"). The
  pass never throws; it only drops/flags, so a corrupt import degrades to a smaller
  consistent state instead of a read-only refusal (it runs only on a blob that parsed +
  migrated cleanly — a newer-schema/unparseable blob still goes read-only via F1's
  `LoadOutcome` path).
- `src/platform/useLearnerState.tsx` **(edit)** — three new **critical, synchronous**
  reducer actions (each a single `commit(updater, true)` with the guard re-checked against
  `prev`):
  - **`releasePrimaryAttempt(primaryAttemptId, moduleId, { responses, reviews }, schedulerOutcome)`**
    — the whole primary release in ONE transition. `schedulerOutcome` is computed **purely,
    first** (by the runner, H3): `{ kind: "seeded", hint?, occurrences }`, `{ kind: "failed",
    error }`, or `null` when `spacedCohorts[moduleId]` already exists. The updater (1) marks
    the primary attempt `released` (merges `responses`/`reviews`, sets `releasedAt` + the
    `schedulerEmittedAt` rerender-guard); and (2) **iff `spacedCohorts[moduleId]` is still
    absent in `prev`**, writes **either** the `seeded` cohort record + all six occurrences (+
    `schedulerHint`) **or** the terminal `failed` cohort record — in the **same** new-state
    object. **Invariant:** never a released first-eligible primary attempt without a
    `seeded`-or-`failed` cohort record.
  - **`releaseSpacedAttempt(attemptId, { responses, reviews })`** — release a one-item spaced
    attempt AND complete its occurrence in ONE transition. The occurrence id is **derived**
    from `attempt.scheduledReviewId` (not a parameter) and validated: the occurrence must
    exist, have `setId === attempt.setId`, be `status: "scheduled"` and **due** (`dueAt <=
    now`), and not already be `completed`. Any failed check → **no-op that surfaces a mismatch
    notice**, never an inconsistent record.
  - **`reconcileSpacedReviews(state)`** — pure, idempotent, run on hydrate: completes any
    occurrence whose linked spaced attempt is `released` while the occurrence is still
    `scheduled` (belt-and-suspenders for a crash between the two writes).
- Tests: extend `src/platform/__tests__/learnerState.test.ts` (both normalizers; the
  cross-record pass drops/quarantines each failure class; `2→3` migration preserves all prior
  collections unchanged), `src/platform/__tests__/persistence.test.ts` (v3 round-trip),
  `src/platform/__tests__/useLearnerState.test.tsx` (atomic `releasePrimaryAttempt` leaves no
  released-primary-without-cohort; `releaseSpacedAttempt` derive+validate; reconcile; all
  survive reload).

### Migration / backward-compatibility
- A pre-v3 blob upgrades in place (adds empty `spacedReviews` + `spacedCohorts`); identical
  to F1's `1→2` precedent. Purely additive; no lesson or existing-attempt behavior changes.
- A newer-than-app schema or corrupt blob follows the **existing** F1 read-only /
  raw-preserved rules unchanged — H adds no new *load* failure mode (the cross-record pass
  runs post-migration and only prunes).

### Acceptance criteria
- `migrateLearnerState(v2Fixture)` → v3 with empty new collections and byte-for-byte
  unchanged `attemptSets`/`reviews`/`lessonProgress`/`exerciseAttempts`/`bookmarks`.
- After a first-eligible `releasePrimaryAttempt`, state has the released attempt **and** a
  `seeded`-or-`failed` `spacedCohorts[moduleId]` (six occurrences when `seeded`) — never one
  without the other.
- `releaseSpacedAttempt` resolves **only** the exact derived occurrence, and refuses (no-op)
  on setId-mismatch / not-due / already-completed.
- The cross-record pass rejects/quarantines each defect class and demotes a partial `seeded`
  cohort to `failed`.

## Slice H3 — the real `SchedulerHook` + occurrence route + due-review surface

### Files / components
- `src/lessons/spacedSchedule.ts` **(new, pure)** — `SPACED_DELAY_DAYS = [7, 30] as const`;
  `PRIMARY_SET_IDS` allowlist (`systems-elimination-review`, `-transfer`, `-applied`);
  `SPACED_EXERCISE_IDS`; the fixed `SPACED_SET_IDS ↔ SPACED_EXERCISE_IDS` mapping;
  `deriveStableKey`; `computeSpacedSchedule(summary: AttemptReleaseSummary):
  Omit<ScheduledSpacedReview, "status" | "completedInAttemptSetId">[]` — pure function of
  `summary.releasedAt`/`summary.setId`/`summary.moduleId`; returns `[]` unless `moduleId ===
  "systems-elimination"` **and** `setId ∈ PRIMARY_SET_IDS`; date math only (caller supplies
  `releasedAt`). Each returned occurrence carries its stable `id`, `originAttemptSetId`
  (origin), and `delayDays` (delay).
- `src/lessons/spacedScheduler.ts` **(new)** — `SPACED_RETRIEVAL_SCHEDULER: SchedulerHook`
  implementing the **narrowed** `onAttemptReleased` (delegates to `computeSpacedSchedule`,
  returns `{ hint?, scheduled }`). Registered once at boot via
  `registerScheduler(SPACED_RETRIEVAL_SCHEDULER)` — a one-line call in `AppShell.tsx`.
- `src/platform/scheduler.ts` **(edit — F-seam contract change)** — **narrow** `SchedulerHook`
  to `onAttemptReleased(summary) → { hint?; scheduled?: ScheduledOccurrence[] }`; **remove
  the bypassed `dueReviews()` method** (a permanent no-op consumers would bypass is
  dishonest). Replace the opaque `ScheduledReview { exerciseId, dueAt }` with the
  identity-preserving `ScheduledOccurrence` = `Omit<ScheduledSpacedReview, "status" |
  "completedInAttemptSetId">`. `NOOP_SCHEDULER` stays exported (returns `{}`) for tests.
  Update `scheduler.test.ts` for the narrowed shape.
- `src/lessons/dueReviews.ts` **(new, pure)** — `dueSpacedReviews(state: LearnerState, now:
  Date): ScheduledSpacedReview[]` (status `"scheduled"` and `dueAt <= now.toISOString()`,
  sorted by `dueAt`). **This is THE canonical due-query** — it reads
  `LearnerState.spacedReviews` directly; no hook method shadows it.
- `src/components/assessment/ModuleRunner.tsx` **(edit)** — widen props from `{ setId:
  string }` to `{ setId: string; scheduledReviewId?: string }`. Resume/create the attempt
  keyed on `scheduledReviewId` when present (fixes the `setId`-only collision). On submit,
  branch: **primary set** → compute `schedulerOutcome` first (guarding on
  `spacedCohorts[moduleId]` absence; the `try/catch` maps a compute throw to `{ kind:
  "failed", error }`) → `releasePrimaryAttempt(...)`; **spaced set** →
  `releaseSpacedAttempt(...)`. Surface a durable notice when `spacedCohorts[moduleId].status
  === "failed"`.
- `src/pages/DevSpacedRunnerPage.tsx` **(new)** — reads `:scheduledReviewId`, looks the
  occurrence up; if unknown → not-found state; if `Date.parse(dueAt) > now` → "not yet due"
  state and **mounts no runner** (blocks previewing/completing the 30-day URL early);
  otherwise renders `<ModuleRunner setId={occurrence.setId} scheduledReviewId={…} />`.
- `src/pages/DevModuleRunnerPage.tsx` **(edit)** — **reject `setId ∈ SPACED_SET_IDS`** on the
  generic `dev/module/:setId` route (render "not available here — spaced items open only when
  due, via the spaced-review list"; mount no runner), so a learner cannot preview a spaced
  item ahead of its due occurrence.
- `src/pages/DevSpacedReviewPage.tsx` **(new)** — dev-gated list of `dueSpacedReviews(state,
  new Date())`, each linking to `/dev/spaced/<occurrence id>` (the occurrence route, never the
  generic set route); empty state ("nothing due").
- `src/app/routes.tsx` **(edit)** — add `dev/spaced` (list) and `dev/spaced/:scheduledReviewId`
  (occurrence runner) inside the existing `devRoutes` block.
- `src/pages/DevAssessmentIndexPage.tsx` **(edit)** — add a `Spaced review` link (the three
  spaced sets themselves are **not** listed here).
- `src/components/layout/AppShell.tsx` **(edit)** — register the scheduler + run
  `reconcileSpacedReviews` on hydrate.
- Tests: `spacedSchedule.test.ts` (allowlist + delay math + identity fields);
  `dueReviews.test.ts` (due/not-due/status filtering); `scheduler.test.ts` (narrowed hook);
  `ModuleRunner.test.tsx` (primary release seeds one cohort + six occurrences atomically;
  later release doesn't invoke the scheduler; spaced release completes exactly its
  occurrence); `DevSpacedRunnerPage.test.tsx` + `DevModuleRunnerPage.test.tsx` (not-yet-due /
  not-found / spaced-set-rejected guards).

### Data flow & state transitions
- **First eligible primary release** → runner computes `schedulerOutcome` (cohort absent) →
  `releasePrimaryAttempt` atomically releases + writes the `seeded` cohort + six occurrences
  (or the `failed` cohort on a compute throw).
- **Later primary release / retake** → `spacedCohorts[moduleId]` present → `schedulerOutcome
  = null` → `releasePrimaryAttempt` just releases (no scheduler invocation).
- **Time passes** (real wall-clock) → learner opens `dev/spaced` → `dueSpacedReviews` filters
  to `dueAt <= now` → click through to `/dev/spaced/:id` → answer → submit →
  `releaseSpacedAttempt` completes the exact occurrence.
- A **spaced** set is excluded from `PRIMARY_SET_IDS`, so answering one never re-seeds.

### Migration / backward-compatibility
- Registering a real scheduler is the first behavior change on the F4 seam, but purely
  additive to already-released attempts: `NOOP_SCHEDULER` returned `{}` (no `scheduled`), so
  no prior release seeded anything to conflict with.
- Narrowing `SchedulerHook` (removing `dueReviews`) is a compile-time contract change with
  exactly one implementor (`NOOP_SCHEDULER`) and one test file to update — no runtime
  consumer relied on it (H introduces the first real consumer, and it uses `dueSpacedReviews`).

### Acceptance criteria
- Releasing a primary set once seeds exactly one cohort record + six occurrences; releasing
  any primary set again invokes the scheduler **zero** times (spy) and adds nothing.
- `dev/spaced` lists only `dueAt <= now`; answering one moves it out and marks it `completed`,
  persisted across reload.
- The generic `dev/module/:spaced-set-id` route renders "not available here" and mounts no
  runner; the not-yet-due occurrence URL renders "not yet due" and mounts no runner.
- A thrown `computeSpacedSchedule` yields a visible `failed` cohort and no partial seeds; no
  later release retries.
- `getScheduler().dueReviews` no longer exists (interface narrowed); `dueSpacedReviews` is the
  only due-query.

### Mandatory regressions
1. **Both delays independently:** the same item completed through **distinct 7-day and 30-day**
   attempts (two occurrences, two attempts, both complete independently).
2. **Generic route rejects spaced sets:** `dev/module/:spaced-set-id` renders "not available
   here" and mounts no runner (no preview/early completion); a non-linked generic attempt
   completes **no** occurrence.
3. **Two due occurrences for one item** both surface on the due list.
4. **Cohort uniqueness:** multiple primary releases (a retake, and a release of a *different*
   primary set) produce only **one** six-occurrence cohort, `dueAt` anchored to the first
   release, and the scheduler is invoked **zero** times once the cohort exists (spy).
5. **Atomic primary release + cohort:** after a first-eligible primary release, state always
   has both the released attempt **and** a `seeded`-or-`failed` `spacedCohorts[moduleId]`
   (six seeds when `seeded`) — never one without the other; plus `reconcileSpacedReviews`
   completes an occurrence whose spaced attempt released while it stayed `scheduled`.
6. **Reload persistence** of occurrences + completions; **malformed imports** dropped (one
   assertion per per-entry hardening rule).
7. **Not-yet-due direct access:** navigating straight to the 30-day
   `dev/spaced/:scheduledReviewId` URL while it is still future renders "not yet due" and
   creates **no** attempt / completes **nothing**.
8. **Mismatched completion refused:** `releaseSpacedAttempt` is a no-op that surfaces a
   mismatch when the derived occurrence has a wrong `setId`, is not yet due, or is already
   `completed`.
9. **Visible, non-retried, module-wide scheduler failure:** a thrown `computeSpacedSchedule`
   persists `spacedCohorts[moduleId] = { status: "failed" }` (surfaced in the UI); a
   subsequent primary release sees the terminal record and does **not** invoke the scheduler;
   no partial cohort is left behind.
10. **Import cross-record integrity:** reject/quarantine an occurrence with a
    dangling/non-primary `originAttemptSetId`, a `dueAt` ≠ origin release + delay, a crossed
    `setId`↔`exerciseId`, or a completion whose linked attempt fails any of setId-match /
    `scheduledReviewId`-match / `releasedAt ≥ dueAt` / mutual back-reference; and a `seeded`
    cohort over a **partial** six-occurrence set is demoted to `failed`.

### e2e
The mandatory `e2e/assessment-package-h.spec.ts`: since real 7-/30-day delays cannot elapse
in a test run, seed an **already-due** occurrence (+ its `seeded` cohort + origin attempt) via
the existing `dev/recovery` **Import** path (a hand-built learner-state fixture — the same
sanctioned cross-session entry point F1 built, not a test-only backdoor), then: open
`dev/spaced`, confirm the due item is listed, answer it via `/dev/spaced/:id`, confirm it
disappears from the due list and shows `completed` after reload, and confirm no console errors.

### Failure / recovery
- Scheduler compute throw → `try/catch` maps to `{ kind: "failed" }`, written atomically with
  the release; module-wide terminal, never auto-retried; surfaced in the UI.
- Storage failure while releasing/completing → existing `saveHealthy` durable-warning path.

## Slice H4 — docs, deferred-obligation recording, integration & verification

### Files / components (docs only)
- `implementation-package.md` **(edit)** — mark Package H **partially shipped** (spaced items
  + scheduler built; L7/L8/L9 wiring still owed); refresh the Package H box (occurrence model,
  module-wide atomic emission with a visible terminal failure state, operational-spacing-anchor
  cohort policy, narrowed scheduler contract, cross-record import integrity); reframe the
  L7/L8/L9 line from "non-goal" to a **tracked, deferred D12 obligation**.
- `assessment-plan.md` **(edit)** — D12 row: mark `mod-spaced-*` + scheduler **built +
  machinery-verified** (not administered, matching Package G's posture) and **partially
  discharged**; reframe "these also seed L7/L8/L9 prerequisite checks" as a tracked deferred
  obligation pointing at §"Deferred D12 obligation" (do **not** delete it from D12).
- `docs/quality/lesson-correctness-checklist.md` **(edit)** — dated entry, mirroring the F/G
  entries.
- Full verification: `npx tsc -b`, `npm run lint`, `npx vitest run` (targeted H suites plus
  the **full suite** — H touches shared persistence/migration code), the mandatory
  `e2e/assessment-package-h.spec.ts`, and a regression pass of the existing
  `e2e/assessment-runner.spec.ts` + `e2e/assessment-package-g.spec.ts` (schema bump +
  `ModuleRunner`/`scheduler` edits touch code those specs exercise).

### Deferred D12 obligation: L7/L8/L9 "prerequisite check" wiring
**Not built in Package H — a tracked, deferred D12 obligation, not a dropped one.** D12 is
therefore **partially discharged**: the spaced items + scheduler are built; the prerequisite
wiring remains owed. Reasons + reactivation path:
1. L8/L9 are `future` spine nodes — there is no lesson to wire into.
2. The only existing hook point (a shipped, non-dev-gated production lesson, L7) would require
   the *first* production-facing assessment surface in the project — a scope decision bigger
   than "three spaced items," which Package F's non-goals explicitly declined.
3. **Reactivation (no new engineering needed):** `dueSpacedReviews(state, now)` is a pure
   function of `LearnerState`; a future production surface (or L8/L9 when authored) can call it
   directly to show a "quick review" prompt. Building *that* surface is its own Mode A/B/C
   decision at that time.

### Acceptance criteria
- `implementation-package.md` and `assessment-plan.md` describe Package H as **partially
  shipped** and keep the L7/L8/L9 wiring as a tracked deferred D12 obligation (owner +
  reactivation path recorded) — **not** deleted, **not** claimed done.
- Full suite green; the new H e2e plus the regressed F/G e2e specs pass with no console errors.

## Slice sequencing, size & seams

| Slice | Deliverable | Depends on | Size | Reuses |
| --- | --- | --- | --- | --- |
| **H1** | Three fresh multiple-choice spaced items + one-item sets (+ `SPACED_SET_IDS`) | Package G patterns | S | `moduleItems.ts`/`moduleSets.ts` shape, `multiple-choice` type, existing runner |
| **H2** | `spacedReviews` + `spacedCohorts` model, schema v2→v3, atomic release/complete/reconcile actions, hardened + cross-record normalization | F1 | M–L | `learnerState.ts` normalizer/migration/builder pattern, `commit` primitive |
| **H3** | Narrowed `SchedulerHook`, occurrence route + guards, generic-route rejection, due-review surface, `ModuleRunner` integration | H1, H2, F4 seam | M–L | F4 seam, F2 runner, dev-route pattern |
| **H4** | Docs (partially-shipped + tracked deferral), integration, full verification | H1–H3 | S | — |

**Size estimate: medium** overall — the schema bump + cross-record integrity pass (H2) and
the atomic-release + occurrence-route + narrowing work (H3) are real engineering the original
"small–medium" one-liner did not anticipate (discovered by reading `useLearnerState.tsx` /
`ModuleRunner.tsx`, not from the plan-level description).

## Explicit non-goals for Package H (kept out)

- **Package I (timed mock)** — separate package, depends only on F, not H.
- **Spacing UX beyond a due list** — no notifications, no calendar, no "upcoming" view, no
  configurable intervals (fixed at 7/30 days per the assessment plan).
- **Adaptive/algorithmic spacing** (e.g. SM-2, difficulty-based intervals) — fixed delays
  only; no mastery estimation (unchanged from `mastery-standard.md §6.3`'s standing caution
  against unvalidated psychometrics).
- **Production (non-dev-gated) assessment surface** — unchanged from F's non-goal.
- **New capability types** — the three items reuse `multiple-choice` unmodified.

> The L7/L8/L9 prerequisite-check wiring is deliberately **not** in this list — it is a
> **tracked, deferred D12 obligation** (§"Deferred D12 obligation"), not a permanent non-goal.

## Gate posture

Building H does not by itself pass any gate. It **partially discharges the D12 row** of the
assessment plan (spaced items + scheduler) once **built**, but — matching Package G's posture
— remains **machinery-verified, not administered** until a real learner reaches a due date and
answers. Gate 9 stays **NOT PASSED** until genuinely administered; Gate 8 is unaffected by H
(it depends only on Package F's human-scoring of the Package E proof surfaces). **Package H is
"partially shipped":** the L7/L8/L9 prerequisite-check wiring stays a tracked, deferred D12
obligation with a recorded owner + reactivation path — not silently removed from D12.
