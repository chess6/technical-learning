import { approximatelyEqualVector, type Vector2 } from "../math";
import type { ExerciseDefinition } from "./types";

export interface GradeResult {
  correct: boolean;
  /** Explanation shown to the learner — always says *why*. */
  feedback: string;
}

export type ExerciseAnswer =
  | { kind: "multiple-choice"; choice: number }
  | { kind: "numeric"; value: number }
  | { kind: "vector"; value: Vector2 }
  | { kind: "prediction" };

const DEFAULT_NUMERIC_TOLERANCE = 0.01;

function fmtVec(v: Vector2): string {
  return `(${v[0]}, ${v[1]})`;
}

/**
 * Grade one exercise deterministically. Feedback always explains the reasoning
 * so a wrong answer teaches rather than only marking incorrect.
 */
export function gradeExercise(
  exercise: ExerciseDefinition,
  answer: ExerciseAnswer,
): GradeResult {
  switch (exercise.type) {
    case "multiple-choice": {
      if (answer.kind !== "multiple-choice") {
        throw new Error("Expected a multiple-choice answer");
      }
      const correct = answer.choice === exercise.correctChoice;
      const correctText = exercise.choices[exercise.correctChoice];
      return {
        correct,
        feedback: correct
          ? `Correct. ${exercise.explanation}`
          : `Not quite — the answer is “${correctText}”. ${exercise.explanation}`,
      };
    }
    case "numeric": {
      if (answer.kind !== "numeric") {
        throw new Error("Expected a numeric answer");
      }
      const tolerance = exercise.tolerance ?? DEFAULT_NUMERIC_TOLERANCE;
      const correct = Math.abs(answer.value - exercise.expected) <= tolerance;
      return {
        correct,
        feedback: correct
          ? `Correct. ${exercise.explanation}`
          : `Not quite — the value is ${exercise.expected}. ${exercise.explanation}`,
      };
    }
    case "vector": {
      if (answer.kind !== "vector") {
        throw new Error("Expected a vector answer");
      }
      const tolerance = exercise.tolerance ?? DEFAULT_NUMERIC_TOLERANCE;
      const correct = approximatelyEqualVector(
        answer.value,
        exercise.expected,
        tolerance,
      );
      return {
        correct,
        feedback: correct
          ? `Correct. ${exercise.explanation}`
          : `Not quite — it lands at ${fmtVec(exercise.expected)}. ${exercise.explanation}`,
      };
    }
    case "prediction": {
      return { correct: true, feedback: exercise.reveal };
    }
  }
}
