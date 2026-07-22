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
  isValidIdSyntax,
  resolveId,
  runMigrations,
  SCHEMA_VERSION,
  type EntityKind,
  type LessonId,
  type ExerciseId,
  type Migration,
  type VersionedState,
} from "./identity";
import { isJsonValue, type JsonValue } from "./json";

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
 * normalizes any pre-versioned/unknown blob into a well-formed v1 envelope by
 * delegating to `normalizeLearnerState` (validate + alias-resolve + repair).
 */
export const LEARNER_MIGRATIONS: Record<number, Migration> = {
  1: (state) => normalizeLearnerState(state),
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Resolve a raw id through its alias chain to the current canonical id, or
 * `null` when the value is not a syntactically valid id. Both the record KEY
 * and any nested id are run through this, so a rename registered in
 * `identity.ts` forwards stored progress instead of orphaning it.
 */
function canonicalId(kind: EntityKind, id: unknown): string | null {
  if (typeof id !== "string" || !isValidIdSyntax(id)) return null;
  const resolved = resolveId(kind, id);
  return isValidIdSyntax(resolved) ? resolved : null;
}

/** Later of two ISO-8601 timestamps (lexical compare is valid for UTC ISO). */
function laterIso(a: string | undefined, b: string | undefined): string | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  return b > a ? b : a;
}

function normalizeLessonProgress(raw: unknown): Record<string, LessonProgress> {
  const out: Record<string, LessonProgress> = {};
  for (const [key, value] of Object.entries(asRecord(raw))) {
    if (!value || typeof value !== "object") continue;
    const entry = value as Record<string, unknown>;
    // Prefer the nested id, fall back to the key; resolve both through aliases.
    const canonical = canonicalId("lesson", entry.lessonId) ?? canonicalId("lesson", key);
    if (!canonical) continue; // drop entries whose id is unusable
    const prior = out[canonical];
    const lastVisitedAt = laterIso(
      prior?.lastVisitedAt,
      typeof entry.lastVisitedAt === "string" ? entry.lastVisitedAt : undefined,
    );
    // Merge when two aliased keys collapse onto one canonical id.
    const merged: LessonProgress = {
      lessonId: canonical as LessonId,
      visited: (prior?.visited ?? false) || entry.visited === true,
      completed: (prior?.completed ?? false) || entry.completed === true,
    };
    if (lastVisitedAt !== undefined) merged.lastVisitedAt = lastVisitedAt;
    out[canonical] = merged;
  }
  return out;
}

function normalizeAttempt(raw: unknown, fallbackId: string): ExerciseAttempt | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  if (typeof a.capabilityId !== "string") return null;
  if (typeof a.answerSchemaVersion !== "number" || !Number.isFinite(a.answerSchemaVersion)) {
    return null;
  }
  if (!isJsonValue(a.answer)) return null; // reject non-serializable stored answers
  if (typeof a.at !== "string") return null;
  const exerciseId = canonicalId("exercise", a.exerciseId) ?? fallbackId;
  const attempt: ExerciseAttempt = {
    exerciseId: exerciseId as ExerciseId,
    capabilityId: a.capabilityId,
    answerSchemaVersion: a.answerSchemaVersion,
    answer: a.answer,
    at: a.at,
  };
  if (typeof a.correct === "boolean") attempt.correct = a.correct;
  return attempt;
}

function normalizeExerciseAttempts(raw: unknown): Record<string, ExerciseAttempt[]> {
  const out: Record<string, ExerciseAttempt[]> = {};
  for (const [key, value] of Object.entries(asRecord(raw))) {
    if (!Array.isArray(value)) continue;
    const canonical = canonicalId("exercise", key);
    if (!canonical) continue;
    for (const item of value) {
      const attempt = normalizeAttempt(item, canonical);
      if (!attempt) continue;
      (out[canonical] ??= []).push(attempt);
    }
  }
  return out;
}

function normalizeBookmarks(raw: unknown): Bookmark[] {
  if (!Array.isArray(raw)) return [];
  const out: Bookmark[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const b = item as Record<string, unknown>;
    const lessonId = canonicalId("lesson", b.lessonId);
    if (!lessonId || typeof b.createdAt !== "string") continue;
    const bookmark: Bookmark = { lessonId: lessonId as LessonId, createdAt: b.createdAt };
    if (typeof b.note === "string") bookmark.note = b.note;
    out.push(bookmark);
  }
  return out;
}

/**
 * Validate, alias-resolve, and repair ANY blob into a well-formed
 * `LearnerState` at the current schema version. Unlike a shallow cast this:
 * - resolves both record keys and nested entity ids through `resolveId` (so a
 *   renamed lesson/exercise keeps its progress);
 * - drops or repairs malformed nested entries rather than trusting their shape;
 * - guarantees the three collections exist even for an already-versioned but
 *   otherwise malformed input (e.g. `{ schemaVersion: 1 }`).
 * It performs no unchecked `as LearnerState` cast — it constructs the envelope.
 */
export function normalizeLearnerState(raw: unknown): LearnerState {
  const source = asRecord(raw);
  return {
    schemaVersion: SCHEMA_VERSION,
    lessonProgress: normalizeLessonProgress(source.lessonProgress),
    exerciseAttempts: normalizeExerciseAttempts(source.exerciseAttempts),
    bookmarks: normalizeBookmarks(source.bookmarks),
  };
}

/**
 * Upgrade a raw persisted blob to the current `LearnerState`. Pure transform:
 * it applies chained migrations but performs no storage I/O. An input without a
 * numeric `schemaVersion` is treated as pre-v1 (version 0). Every version —
 * including an already-current but malformed blob — is passed through
 * `normalizeLearnerState`, so the result is always a valid, alias-resolved
 * envelope with no unchecked cast.
 */
export function migrateLearnerState(raw: unknown): LearnerState {
  const source = asRecord(raw);
  const versioned: VersionedState = {
    ...source,
    schemaVersion:
      typeof source.schemaVersion === "number" ? source.schemaVersion : 0,
  };
  const migrated = runMigrations(versioned, LEARNER_MIGRATIONS, SCHEMA_VERSION);
  return normalizeLearnerState(migrated);
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
