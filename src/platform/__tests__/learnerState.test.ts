import { describe, expect, it } from "vitest";
import { asExerciseId, asLessonId, registerAlias, SCHEMA_VERSION } from "../identity";
import {
  createEmptyLearnerState,
  makeAttempt,
  makeAttemptItemResponse,
  makeAttemptSet,
  makeReview,
  migrateLearnerState,
  normalizeLearnerState,
  type AttemptItemSnapshot,
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
    // v2 module-assessment collections.
    expect(state.attemptSets).toEqual({});
    expect(state.reviews).toEqual({});
  });
});

describe("migration to the current envelope", () => {
  it("normalizes an unknown / empty blob into a well-formed current envelope", () => {
    for (const raw of [undefined, null, {}, "garbage", 42]) {
      const state = migrateLearnerState(raw);
      expect(state.schemaVersion).toBe(SCHEMA_VERSION);
      expect(state.lessonProgress).toEqual({});
      expect(state.exerciseAttempts).toEqual({});
      expect(state.bookmarks).toEqual([]);
      expect(state.attemptSets).toEqual({});
      expect(state.reviews).toEqual({});
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
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.lessonProgress.vectors!.visited).toBe(true);
    expect(state.bookmarks).toHaveLength(1);
  });

  it("upgrades a v1 blob to v2 by adding the module-assessment collections", () => {
    const v1 = {
      schemaVersion: 1,
      lessonProgress: { systems: { lessonId: "systems", visited: true, completed: false } },
      exerciseAttempts: {},
      bookmarks: [],
      // no attemptSets / reviews yet
    };
    const state = migrateLearnerState(v1);
    expect(state.schemaVersion).toBe(2);
    expect(state.lessonProgress.systems!.visited).toBe(true);
    expect(state.attemptSets).toEqual({});
    expect(state.reviews).toEqual({});
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

describe("migration normalizes and repairs every version (not just v0)", () => {
  it("repairs an already-current but malformed envelope (missing collections)", () => {
    // Previously bypassed normalization and returned a malformed LearnerState.
    const state = migrateLearnerState({ schemaVersion: 2 });
    expect(state.schemaVersion).toBe(2);
    expect(state.lessonProgress).toEqual({});
    expect(state.exerciseAttempts).toEqual({});
    expect(state.bookmarks).toEqual([]);
    expect(state.attemptSets).toEqual({});
    expect(state.reviews).toEqual({});
  });

  it("drops malformed nested entries instead of trusting their shape", () => {
    const state = migrateLearnerState({
      schemaVersion: 2,
      lessonProgress: {
        vectors: "not-an-object",
        systems: { lessonId: "systems", visited: true },
      },
      exerciseAttempts: {
        "sys-solve-unique": [
          {
            exerciseId: "sys-solve-unique",
            capabilityId: "vector",
            answerSchemaVersion: 1,
            answer: [2, -1],
            at: "2026-07-21T00:00:00.000Z",
          },
          { capabilityId: "vector" }, // missing required fields -> dropped
          "garbage",
        ],
      },
      bookmarks: [
        { lessonId: "systems", createdAt: "2026-07-21T00:00:00.000Z" },
        { note: "no lesson id" }, // dropped
        5,
      ],
    });
    expect(Object.keys(state.lessonProgress)).toEqual(["systems"]);
    expect(state.lessonProgress.systems!.visited).toBe(true);
    expect(state.exerciseAttempts["sys-solve-unique"]).toHaveLength(1);
    expect(state.bookmarks).toHaveLength(1);
  });

  it("rejects a stored answer that is not JSON-safe", () => {
    const state = migrateLearnerState({
      schemaVersion: 1,
      exerciseAttempts: {
        "ex-1": [
          {
            exerciseId: "ex-1",
            capabilityId: "vector",
            answerSchemaVersion: 1,
            answer: [Number.NaN], // NaN is not JSON-safe -> attempt dropped
            at: "2026-07-21T00:00:00.000Z",
          },
        ],
      },
    });
    expect(state.exerciseAttempts["ex-1"]).toBeUndefined();
  });

  it("normalizeLearnerState is idempotent on a well-formed state", () => {
    const once = normalizeLearnerState({
      schemaVersion: 1,
      lessonProgress: { systems: { lessonId: "systems", visited: true, completed: true } },
      exerciseAttempts: {},
      bookmarks: [],
    });
    expect(normalizeLearnerState(once)).toEqual(once);
  });
});

describe("migration resolves aliases so a rename never orphans progress", () => {
  it("re-keys lesson/exercise progress and nested ids to the canonical id", () => {
    registerAlias("lesson", "x-old-systems", "systems");
    registerAlias("exercise", "x-old-solve", "sys-solve-unique");
    const state = migrateLearnerState({
      schemaVersion: 1,
      lessonProgress: {
        "x-old-systems": { lessonId: "x-old-systems", visited: true, completed: true },
      },
      exerciseAttempts: {
        "x-old-solve": [
          {
            exerciseId: "x-old-solve",
            capabilityId: "vector",
            answerSchemaVersion: 1,
            answer: [2, -1],
            correct: true,
            at: "2026-07-21T00:00:00.000Z",
          },
        ],
      },
      bookmarks: [{ lessonId: "x-old-systems", createdAt: "2026-07-21T00:00:00.000Z" }],
    });
    // Keyed by the canonical id, not the retired one.
    expect(state.lessonProgress.systems!.completed).toBe(true);
    expect(state.lessonProgress["x-old-systems"]).toBeUndefined();
    expect(state.exerciseAttempts["sys-solve-unique"]).toHaveLength(1);
    expect(state.exerciseAttempts["sys-solve-unique"]![0]!.exerciseId).toBe("sys-solve-unique");
    expect(state.exerciseAttempts["x-old-solve"]).toBeUndefined();
    expect(state.bookmarks[0]!.lessonId).toBe("systems");
  });

  it("re-keys an attempt under its nested canonical id, not a mismatched outer key", () => {
    // The record KEY and the nested exerciseId resolve to DIFFERENT canonical
    // ids. Previously the attempt was filed under the key's canonical id while
    // carrying the nested id — a silent mismatch. It must be re-keyed under the
    // nested canonical id so key === stored exerciseId.
    registerAlias("exercise", "x-nested-solve", "sys-solve-unique");
    const state = migrateLearnerState({
      schemaVersion: 1,
      exerciseAttempts: {
        // Outer key resolves to itself (a valid, unrelated id)…
        "elim-matrix-after-step": [
          {
            // …but the nested id aliases to a different canonical id.
            exerciseId: "x-nested-solve",
            capabilityId: "vector",
            answerSchemaVersion: 1,
            answer: [2, -1],
            at: "2026-07-21T00:00:00.000Z",
          },
        ],
      },
    });
    // Filed under the nested id's canonical id, not the outer key.
    expect(state.exerciseAttempts["sys-solve-unique"]).toHaveLength(1);
    expect(state.exerciseAttempts["sys-solve-unique"]![0]!.exerciseId).toBe(
      "sys-solve-unique",
    );
    expect(state.exerciseAttempts["elim-matrix-after-step"]).toBeUndefined();
    // Invariant: every record key equals the stored attempts' exerciseId.
    for (const [key, attempts] of Object.entries(state.exerciseAttempts)) {
      for (const attempt of attempts) {
        expect(attempt.exerciseId).toBe(key);
      }
    }
  });

  it("merges two aliased keys that collapse onto one canonical id", () => {
    registerAlias("lesson", "x-legacy-vectors", "vectors");
    const state = migrateLearnerState({
      schemaVersion: 1,
      lessonProgress: {
        "x-legacy-vectors": {
          lessonId: "x-legacy-vectors",
          visited: true,
          completed: false,
          lastVisitedAt: "2026-01-01T00:00:00.000Z",
        },
        vectors: {
          lessonId: "vectors",
          visited: false,
          completed: true,
          lastVisitedAt: "2026-02-01T00:00:00.000Z",
        },
      },
    });
    expect(Object.keys(state.lessonProgress)).toEqual(["vectors"]);
    const merged = state.lessonProgress.vectors!;
    expect(merged.visited).toBe(true); // OR across both keys
    expect(merged.completed).toBe(true);
    expect(merged.lastVisitedAt).toBe("2026-02-01T00:00:00.000Z"); // later timestamp wins
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

describe("module-assessment collections (v2)", () => {
  const snapshot: AttemptItemSnapshot = {
    exerciseId: asExerciseId("sys-count-none"),
    capabilityId: "multiple-choice",
    answerSchemaVersion: 1,
    definition: { id: "sys-count-none", type: "multiple-choice" },
    requiresReview: false,
  };

  it("builds an attempt set / response / review that round-trip as JSON", () => {
    const set = makeAttemptSet({
      setId: "systems-elimination-review",
      setVersion: 1,
      moduleId: "systems-elimination",
      mode: "exam",
      items: [snapshot],
      id: "attempt-1",
      startedAt: "2026-07-21T00:00:00.000Z",
    });
    const review = makeReview({
      attemptSetId: set.id,
      exerciseId: asExerciseId("sys-prove-trichotomy"),
      rubricId: "sys-prove-trichotomy",
      rubricVersion: 1,
      id: "review-1",
    });
    set.responses = [
      makeAttemptItemResponse({
        exerciseId: asExerciseId("sys-count-none"),
        answer: { choice: 2 },
        auto: { kind: "graded", correct: true, feedback: "Correct." },
        at: "2026-07-21T00:01:00.000Z",
      }),
    ];
    const state: LearnerState = {
      ...createEmptyLearnerState(),
      attemptSets: { [set.id]: set },
      reviews: { [review.id]: review },
    };
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });

  it("normalizes stored attempt sets and drops key/id mismatches + malformed reviews", () => {
    const state = migrateLearnerState({
      schemaVersion: 2,
      attemptSets: {
        "attempt-1": {
          id: "attempt-1",
          setId: "systems-elimination-review",
          setVersion: 1,
          moduleId: "systems-elimination",
          mode: "exam",
          status: "released",
          startedAt: "2026-07-21T00:00:00.000Z",
          items: [
            snapshot,
            { exerciseId: "sys-count-none" }, // malformed snapshot → dropped
          ],
          responses: [
            {
              exerciseId: "sys-count-none",
              answer: { choice: 2 },
              at: "2026-07-21T00:01:00.000Z",
            },
            "garbage",
          ],
        },
        // key !== stored id → dropped
        "wrong-key": {
          id: "attempt-2",
          setId: "s",
          setVersion: 1,
          moduleId: "m",
          mode: "exam",
          status: "in-progress",
          startedAt: "2026-07-21T00:00:00.000Z",
          items: [],
          responses: [],
        },
      },
      reviews: {
        "review-1": {
          id: "review-1",
          attemptSetId: "attempt-1",
          exerciseId: "sys-prove-trichotomy",
          state: "pending",
          rubricId: "sys-prove-trichotomy",
          rubricVersion: 1,
        },
        "bad-review": { id: "bad-review" }, // missing fields → dropped
      },
    });
    expect(Object.keys(state.attemptSets)).toEqual(["attempt-1"]);
    expect(state.attemptSets["attempt-1"]!.items).toHaveLength(1);
    expect(state.attemptSets["attempt-1"]!.responses).toHaveLength(1);
    expect(Object.keys(state.reviews)).toEqual(["review-1"]);
  });
});
