import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { LoadOutcome } from "../persistence";
import type { ReactNode } from "react";
import { SCHEMA_VERSION, asExerciseId } from "../identity";
import {
  makeAttemptSet,
  makeScheduledSpacedReview,
  type AttemptItemSnapshot,
  type ScheduledSpacedReview,
} from "../learnerState";
import {
  dueAtFrom,
  SPACED_DELAY_DAYS,
  SPACED_ITEMS,
  SPACED_MODULE_ID,
} from "../spacedConfig";
import { STORAGE_KEY, loadLearnerState } from "../persistence";
import { LearnerStateProvider, useLearnerState, type SpacedReleaseOutcome } from "../useLearnerState";

afterEach(() => {
  localStorage.clear();
});

function wrapper({ children }: { children: ReactNode }) {
  return <LearnerStateProvider>{children}</LearnerStateProvider>;
}

const snapshot: AttemptItemSnapshot = {
  exerciseId: asExerciseId("sys-count-none"),
  capabilityId: "multiple-choice",
  answerSchemaVersion: 1,
  definition: { id: "sys-count-none", type: "multiple-choice" },
  requiresReview: false,
};

function newAttempt(id: string) {
  return makeAttemptSet({
    id,
    setId: "systems-elimination-review",
    setVersion: 1,
    moduleId: "systems-elimination",
    mode: "exam",
    items: [snapshot],
  });
}

describe("hydration", () => {
  it("becomes ready with empty state when nothing is stored", async () => {
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(result.current.readOnly).toBe(false);
    expect(result.current.state.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it("goes read-only for a newer, unsupported schema and never overwrites it", async () => {
    const newer = JSON.stringify({ schemaVersion: SCHEMA_VERSION + 5 });
    localStorage.setItem(STORAGE_KEY, newer);
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("read-only"));
    expect(result.current.readOnly).toBe(true);

    act(() => result.current.startAttemptSet(newAttempt("attempt-1")));
    // The newer bytes must be untouched — no empty overwrite.
    expect(localStorage.getItem(STORAGE_KEY)).toBe(newer);
  });
});

describe("critical transitions persist synchronously", () => {
  it("a submitted + released attempt survives an immediate reload", async () => {
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    act(() => result.current.startAttemptSet(newAttempt("attempt-1")));
    act(() => result.current.submitAttemptSet("attempt-1"));
    act(() =>
      result.current.releaseAttemptSet("attempt-1", {
        responses: [
          {
            exerciseId: asExerciseId("sys-count-none"),
            answer: { choice: 2 },
            auto: { kind: "graded", correct: true, feedback: "Correct." },
            at: "2026-07-21T00:00:00.000Z",
          },
        ],
        reviews: [],
      }),
    );

    // No waiting / debounce flush — read storage directly.
    const outcome = loadLearnerState();
    expect(outcome.kind).toBe("loaded");
    if (outcome.kind === "loaded") {
      const set = outcome.state.attemptSets["attempt-1"];
      expect(set?.status).toBe("released");
      expect(set?.responses[0]?.auto?.kind).toBe("graded");
    }
  });
});

describe("save failure surfaces a durable warning", () => {
  it("marks saveHealthy false when a critical save throws (quota/disabled)", async () => {
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    expect(result.current.saveHealthy).toBe(true);

    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    act(() => result.current.startAttemptSet(newAttempt("attempt-1")));
    await waitFor(() => expect(result.current.saveHealthy).toBe(false));

    // Sticky: an ordinary later (successful) save does not silently clear it.
    spy.mockRestore();
    act(() => result.current.putItemResponse("attempt-1", {
      exerciseId: asExerciseId("sys-count-none"),
      answer: { choice: 1 },
      at: "2026-07-21T00:00:00.000Z",
    }));
    expect(result.current.saveHealthy).toBe(false);
  });
});

describe("export captures the unsaved transition after a save failure", () => {
  it("serializes newer in-memory state, not the stale stored bytes", async () => {
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));

    // A first transition persists (storage now holds the OLD state).
    act(() => result.current.startAttemptSet(newAttempt("attempt-old")));
    const storedOld = localStorage.getItem(STORAGE_KEY)!;
    expect(storedOld).toContain("attempt-old");
    expect(storedOld).not.toContain("attempt-new");

    // Now storage rejects writes; a critical transition fails to persist.
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    act(() => result.current.startAttemptSet(newAttempt("attempt-new")));
    await waitFor(() => expect(result.current.saveHealthy).toBe(false));

    // Stored bytes are still the STALE ones; Export must carry the newer state.
    expect(localStorage.getItem(STORAGE_KEY)).toBe(storedOld);
    const exported = result.current.exportState();
    expect(exported).toContain("attempt-new");
    expect(exported).toContain("attempt-old");

    spy.mockRestore();
  });
});

describe("export / import recovery flow", () => {
  it("exports current state, resets, then imports it back", async () => {
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    act(() => result.current.startAttemptSet(newAttempt("attempt-1")));

    const exported = result.current.exportState();
    expect(exported).toContain("attempt-1");

    act(() => result.current.resetState());
    expect(result.current.state.attemptSets["attempt-1"]).toBeUndefined();

    let outcome: LoadOutcome | undefined;
    act(() => {
      outcome = result.current.importState(exported);
    });
    expect(outcome?.kind).toBe("loaded");
    expect(result.current.state.attemptSets["attempt-1"]).toBeTruthy();
    expect(result.current.saveHealthy).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Package H — atomic primary release + spaced completion.                      */
/* -------------------------------------------------------------------------- */

const R = "2026-01-01T00:00:00.000Z";

function seededOutcome(attemptId: string, releasedAt = R): SpacedReleaseOutcome {
  const occurrences: ScheduledSpacedReview[] = [];
  for (const { setId, exerciseId } of SPACED_ITEMS) {
    for (const delayDays of SPACED_DELAY_DAYS) {
      occurrences.push(
        makeScheduledSpacedReview({
          moduleId: SPACED_MODULE_ID,
          exerciseId: asExerciseId(exerciseId),
          delayDays,
          setId,
          originAttemptSetId: attemptId,
          anchorReleasedAt: releasedAt,
        }),
      );
    }
  }
  return { kind: "seeded", occurrences };
}

function primaryAttempt(id: string, setId = "systems-elimination-review") {
  return makeAttemptSet({
    id,
    setId,
    setVersion: 1,
    moduleId: SPACED_MODULE_ID,
    mode: "exam",
    items: [snapshot],
  });
}

const emptyPayload = { responses: [], reviews: [] };

describe("releasePrimaryAttempt — atomic release + cohort", () => {
  it("releases the primary AND seeds the cohort + six occurrences in one transition", async () => {
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    act(() => result.current.startAttemptSet(primaryAttempt("p1")));
    act(() => result.current.submitAttemptSet("p1"));
    act(() =>
      result.current.releasePrimaryAttempt("p1", SPACED_MODULE_ID, R, emptyPayload, seededOutcome("p1")),
    );

    // Invariant: released primary + a seeded cohort + six occurrences, persisted.
    const outcome = loadLearnerState();
    expect(outcome.kind).toBe("loaded");
    if (outcome.kind !== "loaded") return;
    const s = outcome.state;
    expect(s.attemptSets["p1"]?.status).toBe("released");
    expect(s.attemptSets["p1"]?.releasedAt).toBe(R);
    expect(s.spacedCohorts[SPACED_MODULE_ID]?.status).toBe("seeded");
    expect(s.spacedCohorts[SPACED_MODULE_ID]?.anchorReleasedAt).toBe(R);
    expect(Object.keys(s.spacedReviews)).toHaveLength(6);
    // Canonical timestamp alignment: every dueAt = R + delay.
    for (const occ of Object.values(s.spacedReviews)) {
      expect(occ.dueAt).toBe(dueAtFrom(R, occ.delayDays));
    }
  });

  it("a later primary release does NOT re-cohort (module-wide gate)", async () => {
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    act(() => result.current.startAttemptSet(primaryAttempt("p1")));
    act(() => result.current.submitAttemptSet("p1"));
    act(() =>
      result.current.releasePrimaryAttempt("p1", SPACED_MODULE_ID, R, emptyPayload, seededOutcome("p1")),
    );
    const anchorBefore = result.current.state.spacedCohorts[SPACED_MODULE_ID]?.anchorAttemptSetId;

    // A second primary set releases LATER — must not seed a second cohort.
    const R2 = "2026-02-01T00:00:00.000Z";
    act(() => result.current.startAttemptSet(primaryAttempt("p2", "systems-elimination-transfer")));
    act(() => result.current.submitAttemptSet("p2"));
    act(() =>
      result.current.releasePrimaryAttempt("p2", SPACED_MODULE_ID, R2, emptyPayload, seededOutcome("p2", R2)),
    );

    const s = result.current.state;
    expect(s.spacedCohorts[SPACED_MODULE_ID]?.anchorAttemptSetId).toBe(anchorBefore); // unchanged
    expect(s.spacedCohorts[SPACED_MODULE_ID]?.anchorReleasedAt).toBe(R); // dueAt anchored to FIRST
    expect(Object.keys(s.spacedReviews)).toHaveLength(6); // still six
    expect(s.attemptSets["p2"]?.status).toBe("released"); // but p2 still released
  });

  it("records a visible terminal FAILED cohort when the outcome is failed, never auto-retried", async () => {
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    act(() => result.current.startAttemptSet(primaryAttempt("p1")));
    act(() => result.current.submitAttemptSet("p1"));
    act(() =>
      result.current.releasePrimaryAttempt("p1", SPACED_MODULE_ID, R, emptyPayload, {
        kind: "failed",
        error: "compute threw",
      }),
    );
    expect(result.current.state.spacedCohorts[SPACED_MODULE_ID]?.status).toBe("failed");
    expect(result.current.state.spacedReviews).toEqual({});

    // A later release sees the terminal record and does not overwrite it.
    act(() => result.current.startAttemptSet(primaryAttempt("p2", "systems-elimination-transfer")));
    act(() => result.current.submitAttemptSet("p2"));
    act(() =>
      result.current.releasePrimaryAttempt("p2", SPACED_MODULE_ID, "2026-03-01T00:00:00.000Z", emptyPayload, seededOutcome("p2", "2026-03-01T00:00:00.000Z")),
    );
    expect(result.current.state.spacedCohorts[SPACED_MODULE_ID]?.status).toBe("failed"); // still failed
    expect(result.current.state.spacedReviews).toEqual({}); // no retry seeded
  });
});

describe("releaseSpacedAttempt — exact-occurrence completion", () => {
  const trichotomy = SPACED_ITEMS[0]!;
  const target = makeScheduledSpacedReview({
    moduleId: SPACED_MODULE_ID,
    exerciseId: asExerciseId(trichotomy.exerciseId),
    delayDays: 7,
    setId: trichotomy.setId,
    originAttemptSetId: "p1",
    anchorReleasedAt: R,
  }).id;

  async function seededHook() {
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    act(() => result.current.startAttemptSet(primaryAttempt("p1")));
    act(() => result.current.submitAttemptSet("p1"));
    act(() =>
      result.current.releasePrimaryAttempt("p1", SPACED_MODULE_ID, R, emptyPayload, seededOutcome("p1")),
    );
    return result;
  }

  function spacedAttempt(id: string) {
    return makeAttemptSet({
      id,
      setId: trichotomy.setId,
      setVersion: 1,
      moduleId: SPACED_MODULE_ID,
      mode: "exam",
      items: [snapshot],
      scheduledReviewId: target,
    });
  }

  it("completes the EXACT occurrence when released on/after its due date", async () => {
    const result = await seededHook();
    const doneAt = dueAtFrom(R, 7); // exactly due
    act(() => result.current.startAttemptSet(spacedAttempt("s1")));
    act(() => result.current.submitAttemptSet("s1"));
    act(() => result.current.releaseSpacedAttempt("s1", doneAt, emptyPayload));

    expect(result.current.state.spacedReviews[target]?.status).toBe("completed");
    expect(result.current.state.spacedReviews[target]?.completedInAttemptSetId).toBe("s1");
    // The 30-day occurrence of the same item is untouched — independent.
    const thirty = target.replace(":7", ":30");
    expect(result.current.state.spacedReviews[thirty]?.status).toBe("scheduled");
  });

  it("completes NOTHING (surfaces a mismatch) when released before the due date", async () => {
    const result = await seededHook();
    const early = "2026-01-02T00:00:00.000Z"; // before day-7 due
    act(() => result.current.startAttemptSet(spacedAttempt("s1")));
    act(() => result.current.submitAttemptSet("s1"));
    act(() => result.current.releaseSpacedAttempt("s1", early, emptyPayload));

    expect(result.current.state.attemptSets["s1"]?.status).toBe("released"); // attempt released
    expect(result.current.state.spacedReviews[target]?.status).toBe("scheduled"); // occurrence untouched
    expect(result.current.state.spacedReviews[target]?.completedInAttemptSetId).toBeUndefined();
  });
});

describe("scheduler emission is at-most-once", () => {
  it("claims exactly once and persists the marker", async () => {
    const { result } = renderHook(() => useLearnerState(), { wrapper });
    await waitFor(() => expect(result.current.phase).toBe("ready"));
    act(() => result.current.startAttemptSet(newAttempt("attempt-1")));

    let first = false;
    let second = false;
    act(() => {
      first = result.current.claimSchedulerEmission("attempt-1");
    });
    act(() => {
      second = result.current.claimSchedulerEmission("attempt-1");
    });
    expect(first).toBe(true);
    expect(second).toBe(false);

    // Marker persisted → a reload cannot re-claim.
    const outcome = loadLearnerState();
    if (outcome.kind === "loaded") {
      expect(outcome.state.attemptSets["attempt-1"]?.schedulerEmittedAt).toBeTruthy();
    }
  });
});
