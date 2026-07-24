import { describe, expect, it } from "vitest";
import { dueSpacedReviews } from "../dueReviews";
import { asExerciseId } from "../../platform/identity";
import { makeScheduledSpacedReview, type ScheduledSpacedReview } from "../../platform/learnerState";
import { SPACED_MODULE_ID } from "../../platform/spacedConfig";

const R = "2026-01-01T00:00:00.000Z";

function occ(exerciseId: string, delayDays: number, over: Partial<ScheduledSpacedReview> = {}) {
  return {
    ...makeScheduledSpacedReview({
      moduleId: SPACED_MODULE_ID,
      exerciseId: asExerciseId(exerciseId),
      delayDays,
      setId: "systems-elimination-spaced-trichotomy",
      originAttemptSetId: "anchor",
      anchorReleasedAt: R,
    }),
    ...over,
  };
}

function stateOf(list: ScheduledSpacedReview[]) {
  return { spacedReviews: Object.fromEntries(list.map((o) => [o.id, o])) };
}

describe("dueSpacedReviews", () => {
  it("returns only scheduled occurrences due at/before now, earliest first", () => {
    const seven = occ("mod-spaced-trichotomy", 7); // due R+7
    const thirty = occ("mod-spaced-uniqueness", 30); // due R+30
    const state = stateOf([thirty, seven]);

    // Now = R+10 → only the 7-day is due.
    const at10 = new Date(Date.parse(R) + 10 * 86_400_000);
    expect(dueSpacedReviews(state, at10).map((o) => o.delayDays)).toEqual([7]);

    // Now = R+40 → both due, sorted by dueAt (7 before 30).
    const at40 = new Date(Date.parse(R) + 40 * 86_400_000);
    expect(dueSpacedReviews(state, at40).map((o) => o.delayDays)).toEqual([7, 30]);

    // Now = R+1 → nothing due yet.
    const at1 = new Date(Date.parse(R) + 1 * 86_400_000);
    expect(dueSpacedReviews(state, at1)).toEqual([]);
  });

  it("excludes already-completed occurrences even when past due", () => {
    const done = occ("mod-spaced-trichotomy", 7, {
      status: "completed",
      completedInAttemptSetId: "s1",
    });
    const at40 = new Date(Date.parse(R) + 40 * 86_400_000);
    expect(dueSpacedReviews(stateOf([done]), at40)).toEqual([]);
  });
});
