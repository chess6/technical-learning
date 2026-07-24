# Package I — implementation-ready plan (timed mock / exam-mode set, D11 · S3)

Canonical implementation plan for **Package I** of the `systems-elimination` mastery
pilot: a short **timed mock** (`systems-elimination-mock`) — a fresh computation item,
a fresh classification item, and one proof item, administered under a **time limit**
with deferred feedback on the Package F runner. Closes obligation **D11** (timed
performance) and enables the **S3** readiness claim. Annex to the
[implementation package](implementation-package.md).

> **Planning only (Mode B).** No application code is modified by this document.
> Building any slice below is **Mode C** and requires explicit approval, per
> [course-authoring-workflow](../../../../authoring/course-authoring-workflow.md) and
> the [approval boundaries](../../../../../AGENTS.md#approval-boundaries-stop-and-ask).
> This plan is authored **contract-table-first** per ADR-002
> ([workflow redesign](../../../engineering/decisions/002-package-workflow-redesign.md)):
> the grading-semantics contract table (§2) is the artifact to review **before** any
> code, and every new auto-graded item ships with a `describeGradingContract` spec.

> **Anti-collision (ADR-002 rule).** Before starting Mode C: confirm no branch/worktree
> is already building Package I and that the ledger still shows it `PLANNED`; do the work
> on a single `package-i` branch; mark the ledger `IN PROGRESS` on the first commit.

## 0. Findings that constrain the design (inspected before choosing it)

- **The F runner already administers a deferred-feedback exam, but has NO time
  limit.** `ModuleSet` (`src/lessons/moduleSets.ts`) is `{ id, version, moduleId,
  title, mode: "exam", itemIds }` — no time field. `AttemptSet`
  (`src/platform/learnerState.ts`) already carries `startedAt` / `submittedAt` /
  `releasedAt`, so *elapsed time is already recoverable* from `startedAt`; the mock
  needs a **deadline** (`startedAt + limit`) and **auto-submit on expiry**, not a new
  clock model. This is the only real engineering; grading is entirely reused.
- **Grading reuses existing capabilities with ZERO new capability code.** Computation →
  `elimination-solution`; classification → `elimination-solution` (inconsistent path,
  typed verdict) or `self-check`; proof → `self-check` (human-scored). All are in
  `SUPPORTED_CAPTURE_KINDS` and already carry evidence ceilings
  (`src/lessons/evidence.ts`) and, for the auto ones, a conformance harness
  (`src/lessons/__tests__/gradingContract.ts`).
- **A mock must use FRESH instances**, distinct from every lesson, Package G, and
  Package H fixture — otherwise it measures recall of the practice set, not timed
  transfer. Fresh systems are re-verified against `src/math/linearSystemsGeneral.ts`
  in the item test, exactly as Package G/H items are.
- **Deferred feedback is non-negotiable and already enforced** by the shared
  `captureRenderers` (exam capture cannot paint correctness). The timer must not change
  that: no per-item reveal before the whole set is submitted (manually or at the deadline).
- **Honesty constraint (evidence integrity).** A mock that ran **over time**, or was
  auto-submitted with blank required items, must not silently read as a clean pass. The
  attempt must record whether it was **auto-submitted at the deadline**, and blank
  required items stay omissions (the F rule), so `reviewStatus` can never reach
  `REVIEW_COMPLETE` off a timed-out blank.

**Constraints honored:** local-only, dev-gated (no new production surface); reuse the F
runner, module-set machinery, and existing grading capabilities; no spacing/scheduler
interaction (Package I depends on F only, not H). **Out of scope:** any new grading
capability, production administration, and the `mod-enrich-ode` D14 enrichment.

## 1. Domain model addition (introduced in I2)

`ModuleSet` gains one optional field:

```
timeLimitSec?: number   // when present, this set is time-boxed; absent ⇒ untimed (F/G/H behavior)
```

`AttemptSet` gains one optional field:

```
autoSubmittedAt?: string  // ISO-8601; present iff the set was submitted by the deadline, not the learner
```

The **deadline is derived, never stored** as an absolute time the client could tamper
with cheaply: `deadline = Date.parse(attempt.startedAt) + timeLimitSec*1000`. Elapsed
and remaining time are pure functions of `startedAt` + the set's `timeLimitSec` + now.
Persistence is purely additive (schema stays at the current version — `autoSubmittedAt`
is an optional field on an existing collection, no migration, per the F1 precedent for
optional attempt fields).

## 2. Grading-semantics contract table (REVIEW THIS BEFORE CODE)

`systems-elimination-mock` administers three fresh items. Exact numbers are authored in
I1 and independently re-verified in the math test; the **accept/reject semantics** below
are what the contract locks in (`gradingContract.test.ts`).

| Item | Capability | Evidence (target · basis) | mustAccept | mustReject (adversarial battery) | Cue ban |
| --- | --- | --- | --- | --- | --- |
| `mod-mock-compute` (fresh consistent 3×3, one free var) | `elimination-solution` | E4 · fresh-instance / transfer / integrated / none / auto | canonical echelon + pivots + freeCount + particular + null direction | all-blank; **blank a true-0 cell** (blank ≠ 0); zero-fill; pivot off-by-one; non-echelon `reduced`; null direction ∉ Null(A); superset extra direction; flipped consistency | prompt states the task, not the method |
| `mod-mock-classify` (fresh inconsistent rectangular) | `elimination-solution` | E4 · fresh-instance / transfer / single-outcome / none / auto | echelon with contradiction row + typed `inconsistent`/`none`/`∅` | bare toggle (no typed verdict); typed verdict but reduction lacks the contradiction row; **superset text** ("the answer is none"); related-wrong ("not empty"); wrong verdict (claims consistent) | — |
| `mod-mock-proof` (one proof: why consistency is required for `x_p + Null(A)`) | `self-check` (human-scored) | E5 · fresh-instance / transfer / integrated / none / human-scored | — (human-scored; exempt from the auto contract) | blank required response → recorded omission, never `REVIEW_COMPLETE` | — |

Notes for the reviewer:
- The two auto items reuse the **elimination-solution** contract patterns already proven
  in `gradingContract.test.ts` (the Package G items), so the harness cost is ~one spec
  each; the proof item is human-scored and therefore exempt (coverage meta-test skips it).
- Each item gets an `ITEM_ASSESSMENT_META` entry (evidence target + `evidenceBasis`);
  `evidenceCeiling.test.ts` then confirms E4/E5 is not self-contradicted, and no claim
  exceeds the `elimination-solution` (E5) / `self-check` (E5) ceilings.
- **Fresh-instance requirement is testable:** the mock systems must be numerically
  distinct from every existing `SYS_*` fixture (asserted in `moduleItems.test.ts`).

## Slice I1 — three fresh mock items + the timed set (+ contracts)

### Files / components
- `src/lessons/moduleItems.ts` **(edit)** — add `mod-mock-compute`, `mod-mock-classify`
  (`elimination-solution`) and `mod-mock-proof` (`self-check`), on fresh systems
  re-verified against `src/math`. Export the fresh systems for the math test.
- `src/lessons/moduleSets.ts` **(edit)** — add `systems-elimination-mock`
  (`mode: "exam"`, `timeLimitSec: <proposed 1200 = 20 min>`, three itemIds). It is a
  PRIMARY set for the runner but is **not** in `SPACED_SET_IDS` and **not** a spaced set,
  so it never seeds or answers a spaced cohort.
- `src/lessons/assessmentManifest.ts` **(edit)** — `ITEM_ASSESSMENT_META` for the three
  items (evidence target + basis + `methodSelection: false`).
- Tests: `moduleItems.test.ts` (fresh-fixture verification + distinctness);
  `gradingContract.test.ts` specs for `mod-mock-compute` + `mod-mock-classify`;
  `evidenceCeiling.test.ts` / `cueLint.test.ts` extend automatically (manifest-driven).

### Acceptance criteria
- Each mock system is independently re-verified (solves / consistency / pivot structure)
  and is **not** numerically identical to any lesson, Package G, or Package H fixture.
- The two auto items pass their `describeGradingContract` adversarial batteries; the
  coverage meta-test sees a contract for every non-human-scored mock item.

## Slice I2 — the time-box: countdown, auto-submit, honest recording

### Files / components
- `src/platform/learnerState.ts` **(edit)** — add optional `AttemptSet.autoSubmittedAt`
  (+ `normalizeAttemptSet` copy). No schema-version bump (additive optional field).
- `src/lessons/timeBox.ts` **(new, pure)** — `deadlineFor(startedAt, timeLimitSec)`,
  `remainingSec(startedAt, timeLimitSec, now)`, `isExpired(startedAt, timeLimitSec, now)`.
  Pure date math; unit-tested in isolation.
- `src/components/assessment/ModuleRunner.tsx` **(edit)** — when the resolved set has
  `timeLimitSec`: render a live countdown (`remainingSec`), and **auto-submit** exactly
  once when `isExpired` (reusing the existing `submit` path, tagging the attempt
  `autoSubmittedAt`). On mount/reload, if already expired and not released, auto-submit
  immediately (elapsed time is honest via `startedAt`). Untimed sets are unchanged.
- `src/platform/useLearnerState.tsx` **(edit)** — a small `autoSubmitAttemptSet(id)` (or a
  flag on the existing release path) that stamps `autoSubmittedAt` atomically with the
  release, so a reload can never double-submit or lose the marker.
- Review view surfaces "submitted automatically at the time limit" when `autoSubmittedAt`
  is set (honesty; does not change the grade).
- Tests: `timeBox.test.ts` (deadline/remaining/expired incl. boundary + past-deadline);
  `ModuleRunner.test.tsx` (countdown renders; auto-submit at expiry grades captured
  answers and marks `autoSubmittedAt`; a reload past the deadline auto-submits once;
  blank required item stays an omission — never `REVIEW_COMPLETE`).

### Mandatory regressions
1. **Auto-submit at the deadline** grades whatever was captured and sets `autoSubmittedAt`;
   no per-item correctness was revealed before submit.
2. **Reload past the deadline** on an un-released timed attempt auto-submits exactly once
   (idempotent; the release guard prevents a second submit), and the marker persists.
3. **Manual submit before the deadline** leaves `autoSubmittedAt` unset (honest signal).
4. **Blank required proof under time-out** is a recorded omission → `reviewStatus` can
   never reach `REVIEW_COMPLETE`.
5. **Untimed sets (F/G/H) are byte-unchanged** — no countdown, no auto-submit, no marker.

## Slice I3 — docs, integration & verification

- `implementation-package.md` / `assessment-plan.md` **(edit)** — mark Package I
  **built + machinery-verified, not administered** (matching G/H posture); D11 row →
  `systems-elimination-mock` built; **Gate 9 stays NOT PASSED** until administered.
- `docs/quality/lesson-correctness-checklist.md` **(edit)** — dated entry.
- Verify at package tier: `./check.sh` (lint + tsc + full unit incl. the new contract +
  time-box suites); `./check.sh --e2e` and a mandatory `e2e/assessment-mock.spec.ts`
  (seed a near-deadline attempt via the recovery Import path; confirm the countdown, the
  auto-submit, and the "submitted automatically" notice; assert no per-item reveal before
  submit and no console errors) — since `ModuleRunner` is touched, also regress the
  existing runner / Package G e2e specs.

## Slice sequencing, size & seams

| Slice | Deliverable | Depends on | Size | Reuses |
| --- | --- | --- | --- | --- |
| **I1** | Three fresh mock items + timed set + contracts | Package G items/contracts, the kit | S | `elimination-solution`/`self-check`, moduleItems/moduleSets shape, `gradingContract` harness |
| **I2** | `timeLimitSec` + `autoSubmittedAt` + countdown/auto-submit + honest recording | F2 runner, F1 persistence | S–M | F runner submit/release path, `captureRenderers`, `reviewStatus` |
| **I3** | Docs (built, not administered) + verification | I1–I2 | S | — |

**Size: small–medium.** The only non-trivial engineering is I2's time-box on the runner;
everything else is content + contracts on proven seams.

## Model routing (per ADR-002)

- **Faster model:** I1 (fresh content + contract specs from this approved table) and I3
  (docs/verification).
- **Opus:** I2 — the runner auto-submit/reload-recovery and the `autoSubmittedAt`
  persistence honesty (a state-transition + recovery surface), and this plan's contract
  table review before any code.

## Open decisions for review (resolve before I1)

1. **Time limit.** Proposed **20 min (1200 s)** for three items. Confirm or set.
2. **Classification capability.** `elimination-solution` (produces the contradiction-row
   witness + typed verdict — recommended, matches `mod-p2-applied-rect`) vs `self-check`.
3. **Proof reuse.** Fresh proof prompt (recommended, a mock should be fresh) vs reusing
   `mod-proof-hyp`'s rubric pattern.
4. **Over-time policy.** Auto-submit at the deadline (recommended; honest, matches
   deferred-feedback) vs a soft grace period. No adaptive/penalty scoring (out of scope).

## Gate posture

Building I does not by itself pass any gate. It **discharges D11** (timed performance)
once **built**, but — matching Package G/H — remains **machinery-verified, not
administered** until a real learner runs it under time. Gate 9 stays **NOT PASSED** until
genuinely administered; enables the **S3** readiness claim only after real administration.
