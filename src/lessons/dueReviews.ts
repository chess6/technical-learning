/**
 * Canonical due-query for spaced retrieval (Package H).
 *
 * `dueSpacedReviews` is THE query the UI uses — a pure function over
 * `LearnerState.spacedReviews`. The narrowed `SchedulerHook` deliberately has no
 * `dueReviews` method (it cannot see `LearnerState`), so nothing shadows this.
 * Comparison + ordering use parsed milliseconds, never lexical date-string order.
 */

import type { LearnerState, ScheduledSpacedReview } from "../platform/learnerState";

/** Occurrences that are `scheduled` and due at/before `now`, earliest `dueAt` first. */
export function dueSpacedReviews(
  state: Pick<LearnerState, "spacedReviews">,
  now: Date,
): ScheduledSpacedReview[] {
  const nowMs = now.getTime();
  return Object.values(state.spacedReviews)
    .filter((r) => r.status === "scheduled" && Date.parse(r.dueAt) <= nowMs)
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}
