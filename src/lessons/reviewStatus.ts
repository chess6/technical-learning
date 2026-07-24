/**
 * Review status (Package F3) — a CONSERVATIVE, machine-readable blocker.
 *
 * This intentionally does NOT decide Gate 8. A machine `PASSED` would require a
 * canonical outcome→evidence manifest, required evidence levels per outcome, and
 * a retake/aggregation policy — none of which Package F defines. So this reports
 * only whether the human-scored obligations of one attempt set are done:
 *   REVIEW_PENDING  — a released set has ≥1 required review not yet scored;
 *   REVIEW_FAILED   — all required reviews scored, but ≥1 did not pass;
 *   REVIEW_COMPLETE — every required review scored AND passed.
 * `REVIEW_COMPLETE` is a NECESSARY-not-sufficient precondition for an author to
 * clear Gate 8; it is never an automatic pass.
 */

import type { AttemptSet, LearnerState, ReviewRecord } from "../platform/learnerState";

export type ReviewStatus = "REVIEW_PENDING" | "REVIEW_COMPLETE" | "REVIEW_FAILED";

/** Every review record belonging to an attempt set. */
export function reviewsForAttempt(
  state: Pick<LearnerState, "reviews">,
  attemptSetId: string,
): ReviewRecord[] {
  return Object.values(state.reviews).filter((r) => r.attemptSetId === attemptSetId);
}

/** Reviews still awaiting a score across the whole state (for the review queue). */
export function pendingReviews(state: Pick<LearnerState, "reviews">): ReviewRecord[] {
  return Object.values(state.reviews).filter((r) => r.state === "pending");
}

/** A string that parses as a real timestamp (non-empty, `Date.parse`-able). */
function isValidTimestamp(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "" && !Number.isNaN(Date.parse(value));
}

/**
 * A review that may count toward `REVIEW_COMPLETE`: it must be a fully-formed,
 * PASSING human score. An omitted, incomplete, or malformed/imported record —
 * missing a boolean `passed`, a finite `score`, or a valid `scoredAt` timestamp —
 * is never completable, so a hand-edited or partially-imported blob can never
 * masquerade as a clean pass.
 */
export function isValidScoredPass(review: ReviewRecord): boolean {
  return (
    review.state === "scored" &&
    review.omitted !== true &&
    typeof review.passed === "boolean" &&
    review.passed === true &&
    typeof review.score === "number" &&
    Number.isFinite(review.score) &&
    isValidTimestamp(review.scoredAt)
  );
}

export function reviewStatus(
  state: Pick<LearnerState, "reviews">,
  set: AttemptSet,
): ReviewStatus {
  // Human scoring is only meaningful once feedback has been released.
  if (set.status !== "released") return "REVIEW_PENDING";

  const requiredExerciseIds = set.items
    .filter((item) => item.requiresReview)
    .map((item) => item.exerciseId);
  if (requiredExerciseIds.length === 0) return "REVIEW_COMPLETE";

  const byExercise = new Map<string, ReviewRecord>();
  for (const review of reviewsForAttempt(state, set.id)) {
    byExercise.set(review.exerciseId, review);
  }

  let anyFailed = false;
  for (const exerciseId of requiredExerciseIds) {
    const review = byExercise.get(exerciseId);
    // Not yet acted on → conservatively pending.
    if (!review || review.state !== "scored") return "REVIEW_PENDING";
    // Scored but not a valid PASSING record (omitted, failed, or malformed/
    // imported) → this attempt can never be REVIEW_COMPLETE.
    if (!isValidScoredPass(review)) anyFailed = true;
  }
  return anyFailed ? "REVIEW_FAILED" : "REVIEW_COMPLETE";
}
