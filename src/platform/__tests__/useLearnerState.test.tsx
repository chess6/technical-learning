import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { SCHEMA_VERSION, asExerciseId } from "../identity";
import { makeAttemptSet, type AttemptItemSnapshot } from "../learnerState";
import { STORAGE_KEY, loadLearnerState } from "../persistence";
import { LearnerStateProvider, useLearnerState } from "../useLearnerState";

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
