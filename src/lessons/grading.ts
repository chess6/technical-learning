import {
  approximatelyEqualVector,
  type Vector2,
} from "../math";
import type { ExerciseDefinition, SolutionReveal } from "./types";

export interface GradeResult {
  correct: boolean;
  /** Explanation shown to the learner — always says *why*. */
  feedback: string;
  /** Optional richer reveal when the exercise defines one. */
  solutionReveal?: SolutionReveal;
}

export type ExerciseAnswer =
  | { kind: "multiple-choice"; choice: number }
  | { kind: "numeric"; value: number }
  | { kind: "vector"; value: Vector2 }
  | { kind: "eigenvalue"; value: number | readonly number[] }
  | { kind: "prediction" };

const DEFAULT_NUMERIC_TOLERANCE = 0.01;

function fmtVec(v: Vector2): string {
  return `(${v[0]}, ${v[1]})`;
}

function normalizeExpectedLambdas(
  expected: number | readonly number[],
): number[] {
  return (Array.isArray(expected) ? [...expected] : [expected as number]).sort(
    (a, b) => a - b,
  );
}

function gradeEigenvalues(
  expected: number | readonly number[],
  given: number | readonly number[],
  tolerance: number,
): boolean {
  const want = normalizeExpectedLambdas(expected);
  const got = normalizeExpectedLambdas(given);
  if (want.length !== got.length) return false;
  return want.every((value, index) => Math.abs(value - got[index]!) <= tolerance);
}

/**
 * Grade one exercise deterministically. Feedback always explains the reasoning
 * so a wrong answer teaches rather than only marking incorrect.
 */
export function gradeExercise(
  exercise: ExerciseDefinition,
  answer: ExerciseAnswer,
): GradeResult {
  const reveal = "solutionReveal" in exercise ? exercise.solutionReveal : undefined;

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
        solutionReveal: reveal,
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
        solutionReveal: reveal,
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
        solutionReveal: reveal,
      };
    }
    case "eigenvalue": {
      if (answer.kind !== "eigenvalue") {
        throw new Error("Expected an eigenvalue answer");
      }
      const tolerance = exercise.tolerance ?? DEFAULT_NUMERIC_TOLERANCE;
      const correct = gradeEigenvalues(exercise.expected, answer.value, tolerance);
      const expectedList = normalizeExpectedLambdas(exercise.expected).join(", ");
      return {
        correct,
        feedback: correct
          ? `Correct. ${exercise.explanation}`
          : `Not quite — the eigenvalue(s) are ${expectedList}. ${exercise.explanation}`,
        solutionReveal: reveal,
      };
    }
    case "prediction": {
      return {
        correct: true,
        feedback: exercise.reveal,
        solutionReveal: reveal,
      };
    }
  }
}
