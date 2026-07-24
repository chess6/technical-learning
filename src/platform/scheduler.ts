/**
 * Spacing/scheduler extension point — the release-time SEAM.
 *
 * Package F shipped this as a no-op; Package H supplies the first real
 * implementation (`SPACED_RETRIEVAL_SCHEDULER` in `lessons/spacedSchedule.ts`).
 *
 * NARROWED in Package H: the hook is registered at boot with NO access to
 * `LearnerState`, so it structurally cannot answer "what is due" from persisted
 * state. The old `dueReviews()` method was therefore removed rather than shipped
 * as a bypassed no-op — the canonical due-query is the pure
 * `dueSpacedReviews(state, now)` (`lessons/dueReviews.ts`), which reads
 * `LearnerState.spacedReviews` directly. The hook's sole job is to COMPUTE the
 * schedule at release, returning full occurrences (identity-preserving) that the
 * runner writes atomically with the release.
 */

import type { JsonValue } from "./json";
import type { ScheduledSpacedReview } from "./learnerState";

/** What the runner hands the hook when an attempt is released. */
export interface AttemptReleaseSummary {
  attemptSetId: string;
  setId: string;
  moduleId: string;
  /** The SINGLE canonical release timestamp (also the attempt/cohort/dueAt anchor). */
  releasedAt: string;
  outcomes: {
    exerciseId: string;
    /** `auto` for machine-graded items, `review` for human-scored ones. */
    kind: "auto" | "review";
    correct?: boolean;
  }[];
}

export interface SchedulerHook {
  /**
   * Called once per released attempt. PURE: computes the spaced-retrieval
   * occurrences (each carrying its stable id, origin, and delay) plus an optional
   * opaque hint. Returns `{}` when this release seeds nothing. Must be safe if it
   * throws — the runner isolates it and records a visible terminal FAILED cohort
   * (never an auto-retry).
   */
  onAttemptReleased(summary: AttemptReleaseSummary): {
    scheduled?: ScheduledSpacedReview[];
    hint?: JsonValue;
  };
}

/** The default hook: does nothing. Zero behavior change until a real one registers. */
export const NOOP_SCHEDULER: SchedulerHook = {
  onAttemptReleased() {
    return {};
  },
};

let activeScheduler: SchedulerHook = NOOP_SCHEDULER;

/** Register a scheduler implementation (Package H). */
export function registerScheduler(hook: SchedulerHook): void {
  activeScheduler = hook;
}

/** Reset to the no-op default (used by tests). */
export function resetScheduler(): void {
  activeScheduler = NOOP_SCHEDULER;
}

export function getScheduler(): SchedulerHook {
  return activeScheduler;
}
