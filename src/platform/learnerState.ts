/**
 * Learner-state identity contract — the versioned progress envelope.
 *
 * This defines the SHAPE of persisted learner progress and the migration
 * behavior that keeps it safe across renames and schema changes. It is types +
 * a migration function only: there is NO storage wiring here (no localStorage,
 * no network). Persistence, mastery models, misconception inference, review
 * scheduling, and recommendations are explicitly out of scope until their own
 * models are proven.
 *
 * Design decisions:
 * - Entities are referenced by their canonical (alias-resolved) ids from
 *   `identity.ts`, so renaming an exercise never orphans its attempts.
 * - Attempts are JSON-safe, capability-aware serialized answer envelopes. Each
 *   carries the `capabilityId` and `answerSchemaVersion` that produced it, so a
 *   future migration can reinterpret a stored answer when a capability's answer
 *   shape evolves — without guessing which capability wrote it.
 */

import {
  runMigrations,
  SCHEMA_VERSION,
  type LessonId,
  type ExerciseId,
  type Migration,
  type VersionedState,
} from "./identity";
import type { JsonValue } from "./json";

/** Raw per-lesson progress — flags only; interpretation lives elsewhere. */
export interface LessonProgress {
  lessonId: LessonId;
  visited: boolean;
  completed: boolean;
  /** ISO-8601 timestamp of the most recent visit, if any. */
  lastVisitedAt?: string;
}

/**
 * A JSON-safe, capability-aware serialized answer envelope. `answer` is produced
 * by the owning capability's `serializeAnswer` and is guaranteed persistable.
 */
export interface ExerciseAttempt {
  exerciseId: ExerciseId;
  /** The capability that graded/serialized this answer (its type or custom id). */
  capabilityId: string;
  /** The capability's answer-schema version at write time. */
  answerSchemaVersion: number;
  /** Serialized answer (JSON-safe). */
  answer: JsonValue;
  /** Grading outcome when the interaction is auto-graded; omitted for reviewed. */
  correct?: boolean;
  /** ISO-8601 timestamp. */
  at: string;
}

export interface Bookmark {
  lessonId: LessonId;
  createdAt: string;
  note?: string;
}

/** The whole persisted envelope. `schemaVersion` gates migrations. */
export interface LearnerState {
  schemaVersion: number;
  /** Keyed by canonical lesson id. */
  lessonProgress: Record<string, LessonProgress>;
  /** Keyed by canonical exercise id; most-recent-last. */
  exerciseAttempts: Record<string, ExerciseAttempt[]>;
  bookmarks: Bookmark[];
}

export function createEmptyLearnerState(): LearnerState {
  return {
    schemaVersion: SCHEMA_VERSION,
    lessonProgress: {},
    exerciseAttempts: {},
    bookmarks: [],
  };
}

/**
 * Chained migrations for the learner-state envelope, keyed by the version they
 * PRODUCE. Injected into the shared `runMigrations` runner. The 0 -> 1 step
 * normalizes any pre-versioned/unknown blob into a well-formed v1 envelope.
 */
export const LEARNER_MIGRATIONS: Record<number, Migration> = {
  1: (state) => ({
    schemaVersion: 1,
    lessonProgress: asRecord(state.lessonProgress),
    exerciseAttempts: asRecord(state.exerciseAttempts),
    bookmarks: Array.isArray(state.bookmarks) ? (state.bookmarks as unknown[]) : [],
  }),
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Upgrade a raw persisted blob to the current `LearnerState`. Pure transform:
 * it applies chained migrations but performs no storage I/O. An input without a
 * numeric `schemaVersion` is treated as pre-v1 (version 0).
 */
export function migrateLearnerState(raw: unknown): LearnerState {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const versioned: VersionedState = {
    ...source,
    schemaVersion:
      typeof source.schemaVersion === "number" ? source.schemaVersion : 0,
  };
  return runMigrations(versioned, LEARNER_MIGRATIONS, SCHEMA_VERSION) as unknown as LearnerState;
}

/**
 * Build a JSON-safe attempt envelope. Callers pass the capability id and
 * answer-schema version (from the grading capability) plus the already-serialized
 * answer, so this module never needs to import the lesson/grading layer.
 */
export function makeAttempt(params: {
  exerciseId: ExerciseId;
  capabilityId: string;
  answerSchemaVersion: number;
  answer: JsonValue;
  correct?: boolean;
  at?: string;
}): ExerciseAttempt {
  const attempt: ExerciseAttempt = {
    exerciseId: params.exerciseId,
    capabilityId: params.capabilityId,
    answerSchemaVersion: params.answerSchemaVersion,
    answer: params.answer,
    at: params.at ?? new Date().toISOString(),
  };
  return params.correct === undefined
    ? attempt
    : { ...attempt, correct: params.correct };
}
