import { describe, expect, it } from "vitest";
import { computeSpacedSchedule, SPACED_RETRIEVAL_SCHEDULER } from "../spacedSchedule";
import {
  deriveStableKey,
  dueAtFrom,
  SPACED_COHORT_SIZE,
  SPACED_DELAY_DAYS,
  SPACED_MODULE_ID,
  spacedSetForExercise,
} from "../../platform/spacedConfig";
import type { AttemptReleaseSummary } from "../../platform/scheduler";

const R = "2026-01-01T00:00:00.000Z";

function summary(over: Partial<AttemptReleaseSummary> = {}): AttemptReleaseSummary {
  return {
    attemptSetId: "anchor",
    setId: "systems-elimination-review",
    moduleId: SPACED_MODULE_ID,
    releasedAt: R,
    outcomes: [],
    ...over,
  };
}

describe("computeSpacedSchedule", () => {
  it("returns the six occurrences for an eligible primary release", () => {
    const occ = computeSpacedSchedule(summary());
    expect(occ).toHaveLength(SPACED_COHORT_SIZE);
    // Every occurrence: stable id, correct mapping, exact dueAt off the ONE anchor.
    for (const o of occ) {
      expect(o.moduleId).toBe(SPACED_MODULE_ID);
      expect(o.originAttemptSetId).toBe("anchor");
      expect(o.id).toBe(deriveStableKey(o.moduleId, o.exerciseId, o.delayDays));
      expect(o.setId).toBe(spacedSetForExercise(o.exerciseId));
      expect(SPACED_DELAY_DAYS).toContain(o.delayDays);
      expect(o.dueAt).toBe(dueAtFrom(R, o.delayDays));
      expect(o.status).toBe("scheduled");
    }
    // Ids are unique (3 items × 2 delays).
    expect(new Set(occ.map((o) => o.id)).size).toBe(SPACED_COHORT_SIZE);
  });

  it("returns [] for a non-primary set (a spaced set never re-seeds)", () => {
    expect(computeSpacedSchedule(summary({ setId: "systems-elimination-spaced-trichotomy" }))).toEqual([]);
  });

  it("returns [] for a different module", () => {
    expect(computeSpacedSchedule(summary({ moduleId: "some-other-module" }))).toEqual([]);
  });

  it("the registered hook wraps compute and returns {} when nothing is scheduled", () => {
    expect(SPACED_RETRIEVAL_SCHEDULER.onAttemptReleased(summary()).scheduled).toHaveLength(
      SPACED_COHORT_SIZE,
    );
    expect(SPACED_RETRIEVAL_SCHEDULER.onAttemptReleased(summary({ setId: "x" }))).toEqual({});
  });
});
