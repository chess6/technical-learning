import {
  getGradingCapability,
  type ExerciseAnswer,
  type GradeResult,
} from "./capabilities";
import type { ExerciseDefinition } from "./types";

// Re-exported for backward compatibility: callers import these from grading.
export type { ExerciseAnswer, GradeResult } from "./capabilities";

/**
 * Grade one exercise deterministically by dispatching to its capability
 * (see `capabilities.ts`). Feedback always explains the reasoning so a wrong
 * answer teaches rather than only marking incorrect.
 *
 * This function is a thin dispatcher: there is no per-type switch here anymore.
 * New interactions register a capability instead of editing this file.
 */
export function gradeExercise(
  exercise: ExerciseDefinition,
  answer: ExerciseAnswer,
): GradeResult {
  const capability = getGradingCapability(exercise);
  const result = capability.grade(exercise, answer);
  // Preserve prior behavior: attach the exercise's solutionReveal when present.
  const reveal =
    result.solutionReveal ??
    ("solutionReveal" in exercise ? exercise.solutionReveal : undefined);
  return reveal ? { ...result, solutionReveal: reveal } : result;
}
