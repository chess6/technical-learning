import { describe, expect, it } from "vitest";
import { asExerciseId } from "../../platform/identity";
import {
  createEmptyLearnerState,
  type AttemptSet,
  type LearnerState,
  type ReviewRecord,
} from "../../platform/learnerState";
import { reviewStatus } from "../reviewStatus";

function releasedSet(): AttemptSet {
  return {
    id: "attempt-1",
    setId: "systems-elimination-review",
    setVersion: 1,
    moduleId: "systems-elimination",
    mode: "exam",
    status: "released",
    startedAt: "2026-07-21T00:00:00.000Z",
    releasedAt: "2026-07-21T00:05:00.000Z",
    items: [
      {
        exerciseId: asExerciseId("sys-count-none"),
        capabilityId: "multiple-choice",
        answerSchemaVersion: 1,
        definition: { id: "sys-count-none", type: "multiple-choice" },
        requiresReview: false,
      },
      {
        exerciseId: asExerciseId("sys-prove-trichotomy"),
        capabilityId: "self-check",
        answerSchemaVersion: 1,
        definition: { id: "sys-prove-trichotomy", type: "custom" },
        requiresReview: true,
      },
    ],
    responses: [],
  };
}

function withReview(state: LearnerState, review: ReviewRecord): LearnerState {
  return { ...state, reviews: { ...state.reviews, [review.id]: review } };
}

const baseReview: ReviewRecord = {
  id: "review-1",
  attemptSetId: "attempt-1",
  exerciseId: asExerciseId("sys-prove-trichotomy"),
  state: "pending",
  rubricId: "sys-prove-trichotomy",
  rubricVersion: 1,
};

describe("reviewStatus (conservative, never PASSED)", () => {
  it("is pending before the set is released", () => {
    const set = { ...releasedSet(), status: "submitted" as const };
    expect(reviewStatus(createEmptyLearnerState(), set)).toBe("REVIEW_PENDING");
  });

  it("is pending while a required review is unscored", () => {
    const state = withReview(createEmptyLearnerState(), baseReview);
    expect(reviewStatus(state, releasedSet())).toBe("REVIEW_PENDING");
  });

  it("is complete only when every required review is scored AND passed", () => {
    const state = withReview(createEmptyLearnerState(), {
      ...baseReview,
      state: "scored",
      passed: true,
    });
    expect(reviewStatus(state, releasedSet())).toBe("REVIEW_COMPLETE");
  });

  it("is failed when a required review is scored but did not pass", () => {
    const state = withReview(createEmptyLearnerState(), {
      ...baseReview,
      state: "scored",
      passed: false,
    });
    expect(reviewStatus(state, releasedSet())).toBe("REVIEW_FAILED");
  });

  it("never completes from an omission — even if `passed` is (adversarially) true", () => {
    // A blank required response recorded as an omission is not human evidence:
    // it can never contribute to REVIEW_COMPLETE, regardless of the passed flag.
    const state = withReview(createEmptyLearnerState(), {
      ...baseReview,
      state: "scored",
      passed: true,
      omitted: true,
    });
    expect(reviewStatus(state, releasedSet())).toBe("REVIEW_FAILED");
  });
});
