import { describe, expect, it } from "vitest";
import { asExerciseId, asLessonId, SCHEMA_VERSION } from "../identity";
import {
  createEmptyLearnerState,
  makeAttempt,
  migrateLearnerState,
  type ExerciseAttempt,
  type LearnerState,
} from "../learnerState";

describe("empty learner state", () => {
  it("starts at the current schema version with empty collections", () => {
    const state = createEmptyLearnerState();
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.lessonProgress).toEqual({});
    expect(state.exerciseAttempts).toEqual({});
    expect(state.bookmarks).toEqual([]);
  });
});

describe("migration to the current envelope", () => {
  it("normalizes an unknown / empty blob into a well-formed v1 envelope", () => {
    for (const raw of [undefined, null, {}, "garbage", 42]) {
      const state = migrateLearnerState(raw);
      expect(state.schemaVersion).toBe(1);
      expect(state.lessonProgress).toEqual({});
      expect(state.exerciseAttempts).toEqual({});
      expect(state.bookmarks).toEqual([]);
    }
  });

  it("upgrades a pre-versioned (v0) blob while preserving its data", () => {
    const legacy = {
      // no schemaVersion => treated as version 0
      lessonProgress: { vectors: { lessonId: "vectors", visited: true, completed: false } },
      exerciseAttempts: {},
      bookmarks: [{ lessonId: "vectors", createdAt: "2026-01-01T00:00:00.000Z" }],
    };
    const state = migrateLearnerState(legacy);
    expect(state.schemaVersion).toBe(1);
    expect(state.lessonProgress.vectors!.visited).toBe(true);
    expect(state.bookmarks).toHaveLength(1);
  });

  it("passes an already-current envelope through unchanged", () => {
    const current: LearnerState = createEmptyLearnerState();
    expect(migrateLearnerState(current)).toEqual(current);
  });

  it("refuses to downgrade a state newer than the app", () => {
    expect(() => migrateLearnerState({ schemaVersion: 999 })).toThrow(
      /newer than the app/,
    );
  });
});

describe("capability-aware attempt envelopes are JSON-safe", () => {
  it("builds an attempt carrying capability id + answer-schema version", () => {
    const attempt = makeAttempt({
      exerciseId: asExerciseId("sys-solve-unique"),
      capabilityId: "vector",
      answerSchemaVersion: 1,
      answer: [2, -1],
      correct: true,
      at: "2026-07-21T00:00:00.000Z",
    });
    expect(attempt.capabilityId).toBe("vector");
    expect(attempt.answerSchemaVersion).toBe(1);
    expect(attempt.answer).toEqual([2, -1]);
    expect(attempt.correct).toBe(true);
  });

  it("omits `correct` for reviewed (non-graded) interactions", () => {
    const attempt = makeAttempt({
      exerciseId: asExerciseId("predict-sign"),
      capabilityId: "committed-prediction",
      answerSchemaVersion: 1,
      answer: { committedIndex: 0 },
      at: "2026-07-21T00:00:00.000Z",
    });
    expect("correct" in attempt).toBe(false);
  });

  it("survives a JSON round-trip unchanged (persistable)", () => {
    const attempts: Record<string, ExerciseAttempt[]> = {
      "sys-solve-unique": [
        makeAttempt({
          exerciseId: asExerciseId("sys-solve-unique"),
          capabilityId: "vector",
          answerSchemaVersion: 1,
          answer: [2, -1],
          correct: true,
          at: "2026-07-21T00:00:00.000Z",
        }),
      ],
    };
    const state: LearnerState = {
      ...createEmptyLearnerState(),
      lessonProgress: {
        systems: { lessonId: asLessonId("systems"), visited: true, completed: true },
      },
      exerciseAttempts: attempts,
    };
    const roundTripped = JSON.parse(JSON.stringify(state));
    expect(roundTripped).toEqual(state);
  });
});
