/**
 * Spaced-retrieval scheduler (Package H) — the real `SchedulerHook`.
 *
 * `computeSpacedSchedule` is a PURE function of the release summary: it returns
 * the six occurrences (3 spaced items × {7d, 30d}) for the FIRST eligible primary
 * release, and `[]` for everything else. It reads only the release timestamp the
 * caller supplies (no ambient clock), so every occurrence's `dueAt` is anchored to
 * the single canonical `releasedAt`.
 *
 * The module-wide cohort gate ("only the first eligible release seeds") lives in
 * the provider (`releasePrimaryAttempt`); the runner additionally skips invoking
 * the hook once a cohort exists, so this function is only ever called for a
 * genuinely un-cohorted primary release.
 */

import { asExerciseId } from "../platform/identity";
import { makeScheduledSpacedReview, type ScheduledSpacedReview } from "../platform/learnerState";
import {
  isPrimarySetId,
  SPACED_DELAY_DAYS,
  SPACED_ITEMS,
  SPACED_MODULE_ID,
} from "../platform/spacedConfig";
import { registerScheduler, type AttemptReleaseSummary, type SchedulerHook } from "../platform/scheduler";

/**
 * The six occurrences seeded by an eligible primary release. Empty unless the
 * release is for `SPACED_MODULE_ID` and a primary set. Deterministic order.
 */
export function computeSpacedSchedule(summary: AttemptReleaseSummary): ScheduledSpacedReview[] {
  if (summary.moduleId !== SPACED_MODULE_ID) return [];
  if (!isPrimarySetId(summary.setId)) return [];
  const out: ScheduledSpacedReview[] = [];
  for (const { setId, exerciseId } of SPACED_ITEMS) {
    for (const delayDays of SPACED_DELAY_DAYS) {
      out.push(
        makeScheduledSpacedReview({
          moduleId: summary.moduleId,
          exerciseId: asExerciseId(exerciseId),
          delayDays,
          setId,
          originAttemptSetId: summary.attemptSetId,
          anchorReleasedAt: summary.releasedAt,
        }),
      );
    }
  }
  return out;
}

/** The real hook: compute the schedule at release. Pure; no `LearnerState` access. */
export const SPACED_RETRIEVAL_SCHEDULER: SchedulerHook = {
  onAttemptReleased(summary) {
    const scheduled = computeSpacedSchedule(summary);
    return scheduled.length > 0 ? { scheduled } : {};
  },
};

/** Install the real scheduler (called once at app boot). */
export function registerSpacedScheduler(): void {
  registerScheduler(SPACED_RETRIEVAL_SCHEDULER);
}
