import { describe, expect, it } from "vitest";
import { gradeExercise } from "../grading";
import type { ExerciseDefinition } from "../types";

const mc: Extract<ExerciseDefinition, { type: "multiple-choice" }> = {
  id: "mc",
  type: "multiple-choice",
  prompt: "?",
  choices: ["wrong", "right", "also wrong"],
  correctChoice: 1,
  explanation: "because reasons",
};

const numeric: Extract<ExerciseDefinition, { type: "numeric" }> = {
  id: "n",
  type: "numeric",
  prompt: "?",
  expected: 2,
  tolerance: 0.01,
  explanation: "det is 2",
};

const vector: Extract<ExerciseDefinition, { type: "vector" }> = {
  id: "v",
  type: "vector",
  prompt: "?",
  expected: [2, 0],
  tolerance: 0.01,
  explanation: "first column",
};

const prediction: Extract<ExerciseDefinition, { type: "prediction" }> = {
  id: "p",
  type: "prediction",
  prompt: "?",
  reveal: "the reveal text",
};

describe("gradeExercise", () => {
  it("grades a correct multiple-choice answer and explains why", () => {
    const result = gradeExercise(mc, { kind: "multiple-choice", choice: 1 });
    expect(result.correct).toBe(true);
    expect(result.feedback).toContain("because reasons");
  });

  it("grades an incorrect multiple-choice answer with the correct option and reason", () => {
    const result = gradeExercise(mc, { kind: "multiple-choice", choice: 0 });
    expect(result.correct).toBe(false);
    expect(result.feedback).toContain("right");
    expect(result.feedback).toContain("because reasons");
  });

  it("accepts numeric answers within tolerance", () => {
    expect(gradeExercise(numeric, { kind: "numeric", value: 2.005 }).correct).toBe(true);
    expect(gradeExercise(numeric, { kind: "numeric", value: 3 }).correct).toBe(false);
  });

  it("accepts vector answers within tolerance and explains a miss", () => {
    expect(gradeExercise(vector, { kind: "vector", value: [2, 0] }).correct).toBe(true);
    const miss = gradeExercise(vector, { kind: "vector", value: [0, 2] });
    expect(miss.correct).toBe(false);
    expect(miss.feedback).toContain("(2, 0)");
    expect(miss.feedback).toContain("first column");
  });

  it("always reveals a prediction", () => {
    const result = gradeExercise(prediction, { kind: "prediction" });
    expect(result.correct).toBe(true);
    expect(result.feedback).toBe("the reveal text");
  });
});
