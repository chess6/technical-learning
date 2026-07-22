import { describe, expect, it } from "vitest";
import {
  COMMITTED_PREDICTION_ID,
  gradingCapabilities,
  getGradingCapability,
  resolveCapabilityId,
  type ExerciseAnswer,
} from "../capabilities";
import { gradeExercise } from "../grading";
import { lessons } from "../registry";
import type { ExerciseDefinition } from "../types";

const BUILT_IN_TYPES = [
  "multiple-choice",
  "numeric",
  "vector",
  "eigenvalue",
  "prediction",
] as const;

describe("capability registry completeness", () => {
  it("registers a grading capability for every built-in exercise type", () => {
    for (const type of BUILT_IN_TYPES) {
      expect(gradingCapabilities[type], `capability for ${type}`).toBeDefined();
      expect(gradingCapabilities[type]!.answerSchemaVersion).toBeGreaterThanOrEqual(1);
    }
  });

  it("resolves the capability id from the exercise type, or the custom id", () => {
    const numeric = { id: "n", type: "numeric", prompt: "?", expected: 1, explanation: "" } as ExerciseDefinition;
    expect(resolveCapabilityId(numeric)).toBe("numeric");
    const custom = {
      id: "c",
      type: "custom",
      capabilityId: COMMITTED_PREDICTION_ID,
      prompt: "?",
    } as ExerciseDefinition;
    expect(resolveCapabilityId(custom)).toBe(COMMITTED_PREDICTION_ID);
  });

  it("throws for an exercise whose capability is not registered", () => {
    const orphan = {
      id: "x",
      type: "custom",
      capabilityId: "does-not-exist",
      prompt: "?",
    } as ExerciseDefinition;
    expect(() => getGradingCapability(orphan)).toThrow(/No grading capability/);
  });

  it("every registered lesson exercise resolves to a registered capability", () => {
    for (const lesson of lessons) {
      for (const exercise of lesson.exercises ?? []) {
        expect(() => getGradingCapability(exercise)).not.toThrow();
      }
    }
  });
});

describe("committed prediction pilot (reached via the custom escape hatch)", () => {
  const graded: ExerciseDefinition = {
    id: "cp-graded",
    type: "custom",
    capabilityId: COMMITTED_PREDICTION_ID,
    prompt: "Which two pieces share the tens column?",
    config: { options: ["AC & BD", "AD & BC", "AC & AD"], correctIndex: 1, reveal: "AD and BC both land on the tens column." },
  };

  const reviewed: ExerciseDefinition = {
    id: "cp-reviewed",
    type: "custom",
    capabilityId: COMMITTED_PREDICTION_ID,
    prompt: "Predict the sign of the determinant.",
    config: { options: ["positive", "negative"], reveal: "It is negative — orientation flips." },
  };

  it("proves extension without a new union member: it is a custom exercise", () => {
    expect(graded.type).toBe("custom");
  });

  it("grades a committed choice when a correctIndex is configured", () => {
    const right = gradeExercise(graded, {
      kind: "custom",
      capabilityId: COMMITTED_PREDICTION_ID,
      value: { committedIndex: 1 },
    });
    expect(right.correct).toBe(true);
    expect(right.feedback).toContain("AD and BC");

    const wrong = gradeExercise(graded, {
      kind: "custom",
      capabilityId: COMMITTED_PREDICTION_ID,
      value: { committedIndex: 0 },
    });
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toContain("Not quite");
  });

  it("treats a config without correctIndex as a reviewed prediction", () => {
    const result = gradeExercise(reviewed, {
      kind: "custom",
      capabilityId: COMMITTED_PREDICTION_ID,
      value: { committedIndex: 0 },
    });
    expect(result.correct).toBe(true);
    expect(result.feedback).toContain("orientation flips");
  });
});

describe("JSON-safe answer serialization round-trips", () => {
  const cases: Array<{ id: string; answer: ExerciseAnswer }> = [
    { id: "multiple-choice", answer: { kind: "multiple-choice", choice: 2 } },
    { id: "numeric", answer: { kind: "numeric", value: 3.5 } },
    { id: "vector", answer: { kind: "vector", value: [2, -1] } },
    { id: "eigenvalue", answer: { kind: "eigenvalue", value: [2, 3] } },
    {
      id: COMMITTED_PREDICTION_ID,
      answer: { kind: "custom", capabilityId: COMMITTED_PREDICTION_ID, value: { committedIndex: 1 } },
    },
  ];

  for (const { id, answer } of cases) {
    it(`serializes and re-parses ${id} through JSON`, () => {
      const capability = gradingCapabilities[id]!;
      const serialized = capability.serializeAnswer(answer);
      // Must survive a JSON round-trip unchanged (persistable).
      const throughJson = JSON.parse(JSON.stringify(serialized));
      expect(throughJson).toEqual(serialized);
      const parsed = capability.parseAnswer(throughJson);
      expect(parsed).toEqual(answer);
    });
  }
});
