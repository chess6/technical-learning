import { describe, expect, it } from "vitest";
import {
  AnswerDecodeError,
  COMMITTED_PREDICTION_ID,
  CONSTRUCT_IN_EXPLORER_ID,
  EXERCISE_SEQUENCE_ID,
  MATRIX_ENTRY_ID,
  SELF_CHECK_ID,
  evaluateConstructCheck,
  gradeSequenceStep,
  gradingCapabilities,
  getGradingCapability,
  resolveCapabilityId,
  type ExerciseAnswer,
  type JsonValue,
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

describe("matrix-entry capability (custom escape hatch)", () => {
  const exercise: ExerciseDefinition = {
    id: "me",
    type: "custom",
    capabilityId: MATRIX_ENTRY_ID,
    prompt: "Enter the shear matrix.",
    config: {
      rows: 2,
      cols: 2,
      expected: [
        [1, 1],
        [0, 1],
      ],
      explanation: "A shear keeps e_1 fixed and sends e_2 to (1, 1).",
      matrixName: "A",
    },
  };

  it("grades a correct matrix entry-wise", () => {
    const result = gradeExercise(exercise, {
      kind: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      value: { entries: [[1, 1], [0, 1]] },
    });
    expect(result.correct).toBe(true);
    expect(result.feedback).toContain("Correct");
  });

  it("rejects an entry outside tolerance and reveals the expected matrix", () => {
    const result = gradeExercise(exercise, {
      kind: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      value: { entries: [[1, 0], [0, 1]] },
    });
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("Not quite");
    // Learner-facing matrix rendered as KaTeX bmatrix.
    expect(result.feedback).toContain("\\begin{bmatrix}");
  });

  it("respects a configured tolerance", () => {
    const loose: ExerciseDefinition = {
      ...exercise,
      config: { ...(exercise as { config: object }).config, tolerance: 0.5 },
    };
    const result = gradeExercise(loose, {
      kind: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      value: { entries: [[1.3, 0.7], [0.2, 1.2]] },
    });
    expect(result.correct).toBe(true);
  });
});

describe("construct-in-explorer capability (pure predicate over a committed vector)", () => {
  const inconsistent: ExerciseDefinition = {
    id: "cie-none",
    type: "custom",
    capabilityId: CONSTRUCT_IN_EXPLORER_ID,
    prompt: "Pick a b that makes the system inconsistent.",
    config: {
      target: "vector2",
      check: {
        kind: "system-classification",
        matrix: [
          [1, 2],
          [2, 4],
        ],
        expect: "none",
      },
      reveal: "That b lies off the columns' line, so there is no solution.",
    },
  };

  it("passes a b off the dependent columns' line (no solution)", () => {
    const result = gradeExercise(inconsistent, {
      kind: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      value: { vector: [1, 0] },
    });
    expect(result.correct).toBe(true);
    expect(result.feedback).toContain("no solution");
  });

  it("fails a b on the columns' line (infinitely many solutions)", () => {
    const result = gradeExercise(inconsistent, {
      kind: "custom",
      capabilityId: CONSTRUCT_IN_EXPLORER_ID,
      value: { vector: [1, 2] },
    });
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("Not quite");
  });

  it("evaluates the eigenvector predicate against src/math", () => {
    const check = {
      kind: "eigenvector" as const,
      matrix: [
        [2, 0],
        [0, 3],
      ],
      eigenvalue: 2,
    };
    // (1, 0) is an eigenvector for λ = 2; (1, 1) is not.
    expect(evaluateConstructCheck(check, [1, 0]).pass).toBe(true);
    expect(evaluateConstructCheck(check, [1, 1]).pass).toBe(false);
    // The zero vector is never an eigenvector.
    expect(evaluateConstructCheck(check, [0, 0]).pass).toBe(false);
  });

  it("evaluates off-line / on-line predicates", () => {
    const spanning = [1, 1] as const;
    expect(evaluateConstructCheck({ kind: "vector-off-line", spanning }, [1, -1]).pass).toBe(true);
    expect(evaluateConstructCheck({ kind: "vector-off-line", spanning }, [2, 2]).pass).toBe(false);
    expect(evaluateConstructCheck({ kind: "vector-on-line", spanning }, [3, 3]).pass).toBe(true);
    expect(evaluateConstructCheck({ kind: "vector-on-line", spanning }, [0, 0]).pass).toBe(false);
  });
});

describe("self-check capability (free-text + self-mark)", () => {
  const exercise: ExerciseDefinition = {
    id: "sc",
    type: "custom",
    capabilityId: SELF_CHECK_ID,
    prompt: "Explain why the determinant measures area scaling.",
    config: {
      modelAnswer: "The determinant is the signed area of the unit square's image.",
    },
  };

  it("reads 'understood' as correct and includes the model answer", () => {
    const result = gradeExercise(exercise, {
      kind: "custom",
      capabilityId: SELF_CHECK_ID,
      value: { text: "It scales areas.", selfMark: "understood" },
    });
    expect(result.correct).toBe(true);
    expect(result.feedback).toContain("signed area");
  });

  it("reads 'not-yet' as not correct but still reveals the model answer", () => {
    const result = gradeExercise(exercise, {
      kind: "custom",
      capabilityId: SELF_CHECK_ID,
      value: { text: "unsure", selfMark: "not-yet" },
    });
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("signed area");
  });
});

describe("exercise-sequence capability (scaffolded sub-steps)", () => {
  const exercise: ExerciseDefinition = {
    id: "seq",
    type: "custom",
    capabilityId: EXERCISE_SEQUENCE_ID,
    prompt: "Compute A v step by step.",
    config: {
      steps: [
        {
          kind: "numeric",
          prompt: "First component of A v?",
          expected: 4,
          explanation: "Row 1 dot v = 2·1 + 1·2 = 4.",
        },
        {
          kind: "multiple-choice",
          prompt: "Which column stayed fixed?",
          choices: ["e_1", "e_2"],
          correctChoice: 0,
          explanation: "The shear fixes e_1.",
        },
      ],
    },
  };

  it("grades a single step through the exported helper", () => {
    const right = gradeSequenceStep(
      { kind: "numeric", prompt: "", expected: 4, explanation: "" },
      { kind: "numeric", value: 4 },
    );
    expect(right.correct).toBe(true);
    const wrong = gradeSequenceStep(
      { kind: "numeric", prompt: "", expected: 4, explanation: "" },
      { kind: "numeric", value: 5 },
    );
    expect(wrong.correct).toBe(false);
  });

  it("is correct only when every step is correct", () => {
    const all = gradeExercise(exercise, {
      kind: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      value: {
        responses: [
          { kind: "numeric", value: 4 },
          { kind: "multiple-choice", choice: 0 },
        ],
      },
    });
    expect(all.correct).toBe(true);
    expect(all.feedback).toContain("All 2 steps");

    const partial = gradeExercise(exercise, {
      kind: "custom",
      capabilityId: EXERCISE_SEQUENCE_ID,
      value: {
        responses: [
          { kind: "numeric", value: 4 },
          { kind: "multiple-choice", choice: 1 },
        ],
      },
    });
    expect(partial.correct).toBe(false);
    expect(partial.feedback).toContain("1 of 2 steps");
  });
});

describe("capability-id agreement + validated decoding (safety)", () => {
  const matrixExercise: ExerciseDefinition = {
    id: "me-safe",
    type: "custom",
    capabilityId: MATRIX_ENTRY_ID,
    prompt: "Enter the identity.",
    config: { rows: 2, cols: 2, expected: [[1, 0], [0, 1]], explanation: "It is I." },
  };

  it("refuses an answer whose capabilityId does not match the exercise", () => {
    // A self-check-shaped answer must not be graded by matrix-entry.
    expect(() =>
      gradeExercise(matrixExercise, {
        kind: "custom",
        capabilityId: SELF_CHECK_ID,
        value: { text: "unrelated", selfMark: "understood" },
      }),
    ).toThrow(/does not match/);
  });

  it("still grades a correctly-addressed custom answer", () => {
    const result = gradeExercise(matrixExercise, {
      kind: "custom",
      capabilityId: MATRIX_ENTRY_ID,
      value: { entries: [[1, 0], [0, 1]] },
    });
    expect(result.correct).toBe(true);
  });

  it("raises a controlled AnswerDecodeError for a malformed persisted answer", () => {
    const cap = gradingCapabilities[MATRIX_ENTRY_ID]!;
    expect(() => cap.parseAnswer({ entries: "not-a-grid" } as unknown as JsonValue)).toThrow(
      AnswerDecodeError,
    );
    expect(() => cap.parseAnswer(null)).toThrow(AnswerDecodeError);
    expect(() => cap.parseAnswer({ entries: [[1, "x"]] } as unknown as JsonValue)).toThrow(
      AnswerDecodeError,
    );
  });

  it("rejects a self-check answer with an invalid self-mark", () => {
    const cap = gradingCapabilities[SELF_CHECK_ID]!;
    expect(() =>
      cap.parseAnswer({ text: "x", selfMark: "maybe" } as unknown as JsonValue),
    ).toThrow(/selfMark/);
  });

  it("rejects a non-finite numeric answer on decode", () => {
    const cap = gradingCapabilities.numeric!;
    expect(() => cap.parseAnswer({ value: Number.NaN } as unknown as JsonValue)).toThrow(
      AnswerDecodeError,
    );
  });

  it("rejects a vector answer of the wrong arity on decode", () => {
    const cap = gradingCapabilities.vector!;
    expect(() => cap.parseAnswer([1, 2, 3] as unknown as JsonValue)).toThrow(AnswerDecodeError);
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
    {
      id: MATRIX_ENTRY_ID,
      answer: {
        kind: "custom",
        capabilityId: MATRIX_ENTRY_ID,
        value: { entries: [[1, 1], [0, 1]] },
      },
    },
    {
      id: CONSTRUCT_IN_EXPLORER_ID,
      answer: {
        kind: "custom",
        capabilityId: CONSTRUCT_IN_EXPLORER_ID,
        value: { vector: [1, -2] },
      },
    },
    {
      id: SELF_CHECK_ID,
      answer: {
        kind: "custom",
        capabilityId: SELF_CHECK_ID,
        value: { text: "my reason", selfMark: "understood" },
      },
    },
    {
      id: EXERCISE_SEQUENCE_ID,
      answer: {
        kind: "custom",
        capabilityId: EXERCISE_SEQUENCE_ID,
        value: {
          responses: [
            { kind: "numeric", value: 4 },
            { kind: "multiple-choice", choice: 0 },
          ],
        },
      },
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
