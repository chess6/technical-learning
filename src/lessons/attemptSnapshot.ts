/**
 * Attempt-item snapshots (Package F2) — make a released attempt reproducible.
 *
 * A module attempt freezes each item as an `AttemptItemSnapshot`: the serialized
 * `ExerciseDefinition` (the render + grade source), the capability id + answer
 * schema version, whether it needs human review, and the rubric it was reviewed
 * against. Grading a submitted attempt runs against the SNAPSHOT, never the live
 * lesson registry — so renaming, removing, or editing a lesson exercise later
 * cannot retro-change a released attempt.
 */

import { asExerciseId, resolveId } from "../platform/identity";
import { isJsonValue, type JsonValue } from "../platform/json";
import type { AttemptItemSnapshot, AutoResult } from "../platform/learnerState";
import {
  getGradingCapability,
  requiresHumanScore,
  resolveCapabilityId,
  rubricSnapshotOf,
} from "./capabilities";
import { gradeExercise } from "./grading";
import type { ExerciseDefinition } from "./types";

/** Serialize any JSON-safe object (dropping `undefined`) to a stored `JsonValue`. */
function toJsonValue(value: unknown): JsonValue {
  const cloned = JSON.parse(JSON.stringify(value)) as unknown;
  if (!isJsonValue(cloned)) {
    throw new Error("Value is not JSON-safe and cannot be snapshotted");
  }
  return cloned;
}

/** Freeze one exercise definition into a self-contained snapshot. */
export function snapshotItem(exercise: ExerciseDefinition): AttemptItemSnapshot {
  const capability = getGradingCapability(exercise);
  const snapshot: AttemptItemSnapshot = {
    exerciseId: asExerciseId(resolveId("exercise", exercise.id)),
    capabilityId: resolveCapabilityId(exercise),
    answerSchemaVersion: capability.answerSchemaVersion,
    definition: toJsonValue(exercise),
    requiresReview: requiresHumanScore(exercise),
  };
  const rubric = rubricSnapshotOf(exercise);
  if (rubric) snapshot.rubric = rubric;
  return snapshot;
}

/** Recover the frozen exercise definition from a snapshot for render/grade. */
export function definitionFromSnapshot(snapshot: AttemptItemSnapshot): ExerciseDefinition {
  return snapshot.definition as unknown as ExerciseDefinition;
}

/**
 * Auto-grade a captured answer against the SNAPSHOT definition. Returns a tagged
 * `AutoResult`: `omitted` when no answer was captured, `error` when the grader
 * throws on the stored answer, otherwise `graded` with the released feedback and
 * (optional) solution reveal that review mode replays.
 */
export function gradeSnapshot(
  snapshot: AttemptItemSnapshot,
  serializedAnswer: JsonValue | null,
): AutoResult {
  if (serializedAnswer === null) return { kind: "omitted" };
  const exercise = definitionFromSnapshot(snapshot);
  try {
    const capability = getGradingCapability(exercise);
    const answer = capability.parseAnswer(serializedAnswer);
    const result = gradeExercise(exercise, answer);
    const auto: AutoResult = {
      kind: "graded",
      correct: result.correct,
      feedback: result.feedback,
    };
    if (result.solutionReveal) auto.solutionReveal = toJsonValue(result.solutionReveal);
    return auto;
  } catch (error) {
    return {
      kind: "error",
      message: error instanceof Error ? error.message : "Could not grade this answer.",
    };
  }
}
