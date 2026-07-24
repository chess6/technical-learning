import { describe, expect, it } from "vitest";
import { asExerciseId, SCHEMA_VERSION } from "../identity";
import {
  makeAttemptSet,
  makeScheduledSpacedReview,
  makeSpacedCohort,
  migrateLearnerState,
  reconcileSpacedState,
  type AttemptSet,
  type ScheduledSpacedReview,
  type SpacedCohort,
} from "../learnerState";
import {
  deriveStableKey,
  dueAtFrom,
  SPACED_DELAY_DAYS,
  SPACED_ITEMS,
  SPACED_MODULE_ID,
} from "../spacedConfig";

const ANCHOR = "attempt-anchor";
const R = "2026-01-01T00:00:00.000Z"; // canonical release timestamp

/** A released, eligible primary anchor attempt. */
function anchorAttempt(releasedAt = R): AttemptSet {
  return {
    ...makeAttemptSet({
      id: ANCHOR,
      setId: "systems-elimination-review",
      setVersion: 1,
      moduleId: SPACED_MODULE_ID,
      mode: "exam",
      items: [],
    }),
    status: "released",
    submittedAt: releasedAt,
    releasedAt,
  };
}

/** The six correctly-derived occurrences off one anchor + release timestamp. */
function sixOccurrences(releasedAt = R): ScheduledSpacedReview[] {
  const out: ScheduledSpacedReview[] = [];
  for (const { exerciseId } of SPACED_ITEMS) {
    for (const delayDays of SPACED_DELAY_DAYS) {
      out.push(
        makeScheduledSpacedReview({
          moduleId: SPACED_MODULE_ID,
          exerciseId: asExerciseId(exerciseId),
          delayDays,
          setId: SPACED_ITEMS.find((s) => s.exerciseId === exerciseId)!.setId,
          originAttemptSetId: ANCHOR,
          anchorReleasedAt: releasedAt,
        }),
      );
    }
  }
  return out;
}

function seededCohort(releasedAt = R): SpacedCohort {
  return makeSpacedCohort({
    moduleId: SPACED_MODULE_ID,
    status: "seeded",
    anchorAttemptSetId: ANCHOR,
    anchorReleasedAt: releasedAt,
  });
}

function reviewMap(list: ScheduledSpacedReview[]): Record<string, ScheduledSpacedReview> {
  return Object.fromEntries(list.map((o) => [o.id, o]));
}

function fullValidState() {
  return {
    attemptSets: { [ANCHOR]: anchorAttempt() },
    spacedReviews: reviewMap(sixOccurrences()),
    spacedCohorts: { [SPACED_MODULE_ID]: seededCohort() },
  };
}

describe("makeScheduledSpacedReview", () => {
  it("produces a stable id and an exact dueAt = anchor + delay", () => {
    const occ = makeScheduledSpacedReview({
      moduleId: SPACED_MODULE_ID,
      exerciseId: asExerciseId("mod-spaced-trichotomy"),
      delayDays: 7,
      setId: "systems-elimination-spaced-trichotomy",
      originAttemptSetId: ANCHOR,
      anchorReleasedAt: R,
    });
    expect(occ.id).toBe(deriveStableKey(SPACED_MODULE_ID, "mod-spaced-trichotomy", 7));
    expect(occ.dueAt).toBe(dueAtFrom(R, 7));
    expect(Date.parse(occ.dueAt)).toBe(Date.parse(R) + 7 * 86_400_000);
    expect(occ.status).toBe("scheduled");
  });
});

describe("cross-record integrity — a fully valid seeded state survives normalization", () => {
  it("round-trips six occurrences + a seeded cohort through migrate", () => {
    const migrated = migrateLearnerState({ schemaVersion: SCHEMA_VERSION, ...fullValidState() });
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(Object.keys(migrated.spacedReviews).sort()).toEqual(
      sixOccurrences().map((o) => o.id).sort(),
    );
    expect(migrated.spacedCohorts[SPACED_MODULE_ID]?.status).toBe("seeded");
  });
});

describe("per-entry hardening drops malformed occurrences", () => {
  const base = fullValidState();
  const target = deriveStableKey(SPACED_MODULE_ID, "mod-spaced-trichotomy", 7);

  function withMutatedTarget(mutate: (o: ScheduledSpacedReview) => ScheduledSpacedReview) {
    const reviews = { ...base.spacedReviews };
    reviews[target] = mutate(reviews[target]!);
    // Mutating one of six invalidates cohort completeness ⇒ whole cohort demotes.
    const migrated = migrateLearnerState({
      schemaVersion: SCHEMA_VERSION,
      attemptSets: base.attemptSets,
      spacedReviews: reviews,
      spacedCohorts: base.spacedCohorts,
    });
    return migrated;
  }

  it("rejects a crossed setId ↔ exerciseId pairing", () => {
    const m = withMutatedTarget((o) => ({ ...o, setId: "systems-elimination-spaced-rowops" }));
    expect(m.spacedReviews[target]).toBeUndefined();
    expect(m.spacedCohorts[SPACED_MODULE_ID]?.status).toBe("failed");
  });

  it("rejects an out-of-range delay", () => {
    const m = withMutatedTarget((o) => ({
      ...o,
      delayDays: 14,
      id: deriveStableKey(SPACED_MODULE_ID, "mod-spaced-trichotomy", 14),
      dueAt: dueAtFrom(R, 14),
    }));
    expect(Object.keys(m.spacedReviews)).not.toContain(
      deriveStableKey(SPACED_MODULE_ID, "mod-spaced-trichotomy", 14),
    );
  });

  it("rejects a non-parseable dueAt", () => {
    const m = withMutatedTarget((o) => ({ ...o, dueAt: "not-a-date" }));
    expect(m.spacedReviews[target]).toBeUndefined();
  });

  it("rejects an id that is not the derived stable key", () => {
    const reviews = { ...base.spacedReviews };
    // Re-key under a wrong id; collection-level key===id also fails.
    delete reviews[target];
    reviews["spaced:wrong"] = { ...base.spacedReviews[target]!, id: "spaced:wrong" };
    const m = migrateLearnerState({
      schemaVersion: SCHEMA_VERSION,
      attemptSets: base.attemptSets,
      spacedReviews: reviews,
      spacedCohorts: base.spacedCohorts,
    });
    expect(m.spacedReviews["spaced:wrong"]).toBeUndefined();
  });

  it("rejects a scheduled occurrence carrying a completion pointer", () => {
    const m = withMutatedTarget((o) => ({
      ...o,
      status: "scheduled",
      completedInAttemptSetId: "x",
    }));
    expect(m.spacedReviews[target]).toBeUndefined();
  });
});

describe("cross-record integrity — origin & anchor references", () => {
  it("drops occurrences whose cohort is absent, and completes nothing", () => {
    const m = migrateLearnerState({
      schemaVersion: SCHEMA_VERSION,
      attemptSets: { [ANCHOR]: anchorAttempt() },
      spacedReviews: reviewMap(sixOccurrences()),
      spacedCohorts: {}, // no cohort
    });
    expect(Object.keys(m.spacedReviews)).toHaveLength(0);
  });

  it("drops occurrences whose origin attempt is not an eligible released primary", () => {
    const notPrimary: AttemptSet = { ...anchorAttempt(), setId: "systems-elimination-spaced-rowops" };
    const m = migrateLearnerState({
      schemaVersion: SCHEMA_VERSION,
      attemptSets: { [ANCHOR]: notPrimary },
      spacedReviews: reviewMap(sixOccurrences()),
      spacedCohorts: { [SPACED_MODULE_ID]: seededCohort() },
    });
    expect(Object.keys(m.spacedReviews)).toHaveLength(0);
    expect(m.spacedCohorts[SPACED_MODULE_ID]?.status).toBe("failed");
  });

  it("drops when the cohort anchor timestamp ≠ the origin attempt release time", () => {
    const cohort = makeSpacedCohort({
      moduleId: SPACED_MODULE_ID,
      status: "seeded",
      anchorAttemptSetId: ANCHOR,
      anchorReleasedAt: "2025-06-01T00:00:00.000Z", // mismatched anchor
    });
    const m = migrateLearnerState({
      schemaVersion: SCHEMA_VERSION,
      attemptSets: { [ANCHOR]: anchorAttempt() },
      spacedReviews: reviewMap(sixOccurrences()),
      spacedCohorts: { [SPACED_MODULE_ID]: cohort },
    });
    expect(Object.keys(m.spacedReviews)).toHaveLength(0);
  });

  it("demotes a seeded cohort with a partial (5-of-6) occurrence set", () => {
    const reviews = reviewMap(sixOccurrences());
    const dropId = deriveStableKey(SPACED_MODULE_ID, "mod-spaced-uniqueness", 30);
    delete reviews[dropId];
    const m = migrateLearnerState({
      schemaVersion: SCHEMA_VERSION,
      attemptSets: { [ANCHOR]: anchorAttempt() },
      spacedReviews: reviews,
      spacedCohorts: { [SPACED_MODULE_ID]: seededCohort() },
    });
    expect(m.spacedCohorts[SPACED_MODULE_ID]?.status).toBe("failed");
    expect(m.spacedCohorts[SPACED_MODULE_ID]?.error).toMatch(/incomplete/i);
    expect(Object.keys(m.spacedReviews)).toHaveLength(0);
  });
});

describe("cross-record integrity — completed occurrences", () => {
  const target = deriveStableKey(SPACED_MODULE_ID, "mod-spaced-trichotomy", 7);
  const spacedSetId = "systems-elimination-spaced-trichotomy";

  function completed(linkedAttempt: Partial<AttemptSet> & { id: string }) {
    const attempts = { [ANCHOR]: anchorAttempt() };
    const done: AttemptSet = {
      ...makeAttemptSet({
        id: linkedAttempt.id,
        setId: spacedSetId,
        setVersion: 1,
        moduleId: SPACED_MODULE_ID,
        mode: "exam",
        items: [],
        scheduledReviewId: target,
      }),
      status: "released",
      releasedAt: dueAtFrom(R, 7),
      ...linkedAttempt,
    };
    const reviews = reviewMap(sixOccurrences());
    reviews[target] = { ...reviews[target]!, status: "completed", completedInAttemptSetId: done.id };
    return migrateLearnerState({
      schemaVersion: SCHEMA_VERSION,
      attemptSets: { ...attempts, [done.id]: done },
      spacedReviews: reviews,
      spacedCohorts: { [SPACED_MODULE_ID]: seededCohort() },
    });
  }

  it("keeps a completion whose linked attempt matches (set, review id, released ≥ due, back-ref)", () => {
    const m = completed({ id: "spaced-done" });
    expect(m.spacedReviews[target]?.status).toBe("completed");
    expect(m.spacedReviews[target]?.completedInAttemptSetId).toBe("spaced-done");
    expect(m.spacedCohorts[SPACED_MODULE_ID]?.status).toBe("seeded");
  });

  it("drops a completion released BEFORE its due date", () => {
    const m = completed({ id: "spaced-early", releasedAt: "2026-01-02T00:00:00.000Z" }); // before due (day 7)
    expect(m.spacedReviews[target]).toBeUndefined();
    expect(m.spacedCohorts[SPACED_MODULE_ID]?.status).toBe("failed");
  });

  it("drops a completion whose linked attempt is on the wrong set", () => {
    const m = completed({ id: "spaced-wrongset", setId: "systems-elimination-spaced-rowops" });
    expect(m.spacedReviews[target]).toBeUndefined();
  });
});

describe("reconcileSpacedState — belt-and-suspenders completion", () => {
  it("completes a scheduled occurrence whose linked spaced attempt is released & due", () => {
    const target = deriveStableKey(SPACED_MODULE_ID, "mod-spaced-trichotomy", 7);
    const done: AttemptSet = {
      ...makeAttemptSet({
        id: "spaced-done",
        setId: "systems-elimination-spaced-trichotomy",
        setVersion: 1,
        moduleId: SPACED_MODULE_ID,
        mode: "exam",
        items: [],
        scheduledReviewId: target,
      }),
      status: "released",
      releasedAt: dueAtFrom(R, 7),
    };
    const out = reconcileSpacedState({
      attemptSets: { [ANCHOR]: anchorAttempt(), "spaced-done": done },
      spacedReviews: reviewMap(sixOccurrences()), // target still "scheduled"
      spacedCohorts: { [SPACED_MODULE_ID]: seededCohort() },
    });
    expect(out.spacedReviews[target]?.status).toBe("completed");
    expect(out.spacedReviews[target]?.completedInAttemptSetId).toBe("spaced-done");
    // Idempotent: running again changes nothing.
    const again = reconcileSpacedState({
      attemptSets: { [ANCHOR]: anchorAttempt(), "spaced-done": done },
      spacedReviews: out.spacedReviews,
      spacedCohorts: out.spacedCohorts,
    });
    expect(again.spacedReviews[target]?.status).toBe("completed");
  });
});
