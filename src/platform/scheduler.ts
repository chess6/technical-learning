/**
 * Spacing/scheduler extension point (Package F4) — the SEAM only.
 *
 * Package H owns the real spacing logic and the review experience. Package F
 * ships a pluggable hook with a NO-OP default so releasing an attempt has an
 * extension point without any scheduling behavior or UI. The runner dispatches
 * the hook AT MOST ONCE per attempt set (idempotency is enforced by the
 * `schedulerEmittedAt` marker claimed before dispatch — see `useLearnerState`).
 */

import type { JsonValue } from "./json";

/** A minimal, opaque scheduled-review descriptor (Package H defines semantics). */
export interface ScheduledReview {
  exerciseId: string;
  /** ISO-8601 due time. */
  dueAt: string;
}

/** What the runner hands the hook when an attempt is released. */
export interface AttemptReleaseSummary {
  attemptSetId: string;
  setId: string;
  moduleId: string;
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
   * Called once per released attempt set. May return scheduled reviews and/or an
   * opaque hint to persist on the attempt (`schedulerHint`). Must be pure enough
   * to be safe if it throws — the runner isolates and does NOT auto-retry.
   */
  onAttemptReleased(summary: AttemptReleaseSummary): {
    scheduled?: ScheduledReview[];
    hint?: JsonValue;
  };
  /** Reviews due at/before `now` (Package H surfaces these; F never does). */
  dueReviews(now: Date): ScheduledReview[];
}

/** The default hook: does nothing. Zero behavior change until Package H. */
export const NOOP_SCHEDULER: SchedulerHook = {
  onAttemptReleased() {
    return {};
  },
  dueReviews() {
    return [];
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
