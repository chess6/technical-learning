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

/* --------------------------------------------------------------------------
 * Package F — module-assessment attempt/set model (schema v2)
 *
 * A released attempt is SELF-CONTAINED and REPRODUCIBLE: it snapshots the set
 * identity + version, the ordered items (each with the serialized exercise
 * definition and the rubric it was reviewed against), and the released auto
 * feedback. Review mode renders from these snapshots, never the live lesson
 * registry, so a later rename / removal / edit of a lesson exercise cannot
 * retro-change a released attempt. Auto grading and human review are stored in
 * SEPARATE fields (`AttemptItemResponse.auto` vs `ReviewRecord`) and never
 * merged.
 * ------------------------------------------------------------------------ */

/** Frozen copy of one exam item as the learner was shown it. */
export interface AttemptItemSnapshot {
  /** Canonical (alias-resolved) exercise id. */
  exerciseId: ExerciseId;
  capabilityId: string;
  /** The capability's answer-schema version at snapshot time. */
  answerSchemaVersion: number;
  /** Serialized `ExerciseDefinition` — the render + grade source in review. */
  definition: JsonValue;
  /** True for self-check / proof / reasoning items that need human scoring. */
  requiresReview: boolean;
  /** Rubric SNAPSHOT (embedded), not a live pointer. Present for reviewed items. */
  rubric?: {
    rubricId: string;
    rubricVersion: number;
    rubricText: string;
    modelAnswer?: string;
  };
}

/**
 * The auto-grading outcome for one item — a tagged state, not a bare boolean.
 * The released feedback needed by review mode is persisted with it.
 */
export type AutoResult =
  | { kind: "graded"; correct: boolean; feedback: string; solutionReveal?: JsonValue }
  | { kind: "error"; message: string }
  | { kind: "omitted" };

export interface AttemptItemResponse {
  exerciseId: ExerciseId;
  /** Serialized answer (JSON-safe), produced by the capability. */
  answer: JsonValue;
  /** Auto grading state — present only for auto-gradable capabilities. */
  auto?: AutoResult;
  /** Link to a `ReviewRecord` when the item requires human scoring. */
  reviewId?: string;
  /** ISO-8601 timestamp of the last write. */
  at: string;
}

export type AttemptSetStatus = "in-progress" | "submitted" | "released";

export interface AttemptSet {
  id: string;
  /** Which cumulative/interleaved set this is (a `ModuleSet` id). */
  setId: string;
  /** The set's content version at start (reproducibility key). */
  setVersion: number;
  /** Owning module/section id (e.g. "systems-elimination"). */
  moduleId: string;
  /**
   * Deferred-feedback exam mode is the only supported mode. (Immediate-feedback
   * "practice" was removed from the F model — lessons already provide per-item
   * immediate feedback via `ExercisePanel`; the module surface is exam-only.)
   */
  mode: "exam";
  status: AttemptSetStatus;
  startedAt: string;
  submittedAt?: string;
  releasedAt?: string;
  /** Ordered, frozen at start — the administered "form". */
  items: AttemptItemSnapshot[];
  responses: AttemptItemResponse[];
  /** Idempotency marker: set once the F4 scheduler hook has been dispatched. */
  schedulerEmittedAt?: string;
  /** Opaque payload returned by the scheduler hook (Package H owns semantics). */
  schedulerHint?: JsonValue;
}

export type ReviewState = "pending" | "scored";

export interface ReviewRecord {
  id: string;
  attemptSetId: string;
  exerciseId: ExerciseId;
  state: ReviewState;
  rubricId: string;
  /** The rubric version snapshotted on the item at release. */
  rubricVersion: number;
  score?: number;
  passed?: boolean;
  /** Free-text local reviewer label (no auth / multi-user). */
  reviewer?: string;
  feedback?: string;
  scoredAt?: string;
  /**
   * System-recorded omission: the required written response was blank at
   * submission. An omitted review is NOT passable human evidence — it is scored
   * `passed: false` automatically and can never contribute to `REVIEW_COMPLETE`.
   */
  omitted?: boolean;
}

/** The whole persisted envelope. `schemaVersion` gates migrations. */
export interface LearnerState {
  schemaVersion: number;
  /** Keyed by canonical lesson id. */
  lessonProgress: Record<string, LessonProgress>;
  /** Keyed by canonical exercise id; most-recent-last. */
  exerciseAttempts: Record<string, ExerciseAttempt[]>;
  bookmarks: Bookmark[];
  /** (v2) Module-assessment attempt sets, keyed by AttemptSet id. */
  attemptSets: Record<string, AttemptSet>;
  /** (v2) Human-review records, keyed by ReviewRecord id. */
  reviews: Record<string, ReviewRecord>;
  /**
   * Open index so `LearnerState` is a subtype of `VersionedState`
   * (`{ schemaVersion } & Record<string, unknown>`). Migration steps may introduce
   * transient keys; named fields above keep their precise types on access.
   */
  [key: string]: unknown;
}

export function createEmptyLearnerState(): LearnerState {
  return {
    schemaVersion: SCHEMA_VERSION,
    lessonProgress: {},
    exerciseAttempts: {},
    bookmarks: [],
    attemptSets: {},
    reviews: {},
  };
}

/**
 * Chained migrations for the learner-state envelope, keyed by the version they
 * PRODUCE. Injected into the shared `runMigrations` runner.
 *
 * Each step stamps EXACTLY its version (the runner asserts this). `buildLearnerState`
 * validates + alias-resolves + repairs every collection; the empty v2 collections
 * (`attemptSets`, `reviews`) are added when a pre-v2 blob is upgraded, without
 * disturbing the existing v1 collections.
 * - 0 -> 1: normalize any pre-versioned/unknown blob into a well-formed envelope.
 * - 1 -> 2: add the module-assessment collections (idempotent via the builder).
 */
export const LEARNER_MIGRATIONS: Record<number, Migration> = {
  1: (state) => buildLearnerState(state, 1),
  2: (state) => buildLearnerState(state, 2),
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
    const keyCanonical = canonicalId("exercise", key);
    if (!keyCanonical) continue;
    for (const item of value) {
      // `normalizeAttempt` resolves the nested `exerciseId` (falling back to the
      // key's canonical id only when absent/invalid). We then re-key under that
      // resolved id, so the record KEY and the stored attempt's `exerciseId` can
      // never disagree — e.g. an attempt whose nested id aliases to a different
      // canonical id than the key is filed under its own canonical id, not the
      // key's. This forwards renamed attempts instead of orphaning or mis-keying.
      const attempt = normalizeAttempt(item, keyCanonical);
      if (!attempt) continue;
      (out[attempt.exerciseId] ??= []).push(attempt);
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

function normalizeAutoResult(raw: unknown): AutoResult | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const a = raw as Record<string, unknown>;
  if (a.kind === "omitted") return { kind: "omitted" };
  if (a.kind === "error") {
    return { kind: "error", message: typeof a.message === "string" ? a.message : "grading error" };
  }
  if (a.kind === "graded" && typeof a.correct === "boolean") {
    const result: AutoResult = {
      kind: "graded",
      correct: a.correct,
      feedback: typeof a.feedback === "string" ? a.feedback : "",
    };
    if (isJsonValue(a.solutionReveal)) result.solutionReveal = a.solutionReveal;
    return result;
  }
  return undefined;
}

function normalizeItemSnapshot(raw: unknown): AttemptItemSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const exerciseId = canonicalId("exercise", s.exerciseId);
  if (!exerciseId) return null;
  if (typeof s.capabilityId !== "string") return null;
  if (typeof s.answerSchemaVersion !== "number" || !Number.isFinite(s.answerSchemaVersion)) {
    return null;
  }
  if (!isJsonValue(s.definition)) return null;
  const snapshot: AttemptItemSnapshot = {
    exerciseId: exerciseId as ExerciseId,
    capabilityId: s.capabilityId,
    answerSchemaVersion: s.answerSchemaVersion,
    definition: s.definition,
    requiresReview: s.requiresReview === true,
  };
  if (s.rubric && typeof s.rubric === "object") {
    const r = s.rubric as Record<string, unknown>;
    if (
      typeof r.rubricId === "string" &&
      typeof r.rubricVersion === "number" &&
      typeof r.rubricText === "string"
    ) {
      snapshot.rubric = {
        rubricId: r.rubricId,
        rubricVersion: r.rubricVersion,
        rubricText: r.rubricText,
      };
      if (typeof r.modelAnswer === "string") snapshot.rubric.modelAnswer = r.modelAnswer;
    }
  }
  return snapshot;
}

function normalizeItemResponse(raw: unknown): AttemptItemResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const exerciseId = canonicalId("exercise", r.exerciseId);
  if (!exerciseId) return null;
  if (!isJsonValue(r.answer)) return null;
  if (typeof r.at !== "string") return null;
  const response: AttemptItemResponse = {
    exerciseId: exerciseId as ExerciseId,
    answer: r.answer,
    at: r.at,
  };
  const auto = normalizeAutoResult(r.auto);
  if (auto) response.auto = auto;
  if (typeof r.reviewId === "string") response.reviewId = r.reviewId;
  return response;
}

function normalizeAttemptSet(raw: unknown): AttemptSet | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  if (typeof a.id !== "string") return null;
  if (typeof a.setId !== "string") return null;
  if (typeof a.moduleId !== "string") return null;
  if (a.mode !== "exam") return null;
  if (a.status !== "in-progress" && a.status !== "submitted" && a.status !== "released") {
    return null;
  }
  if (typeof a.startedAt !== "string") return null;
  const items = Array.isArray(a.items)
    ? a.items.map(normalizeItemSnapshot).filter((x): x is AttemptItemSnapshot => x !== null)
    : [];
  const responses = Array.isArray(a.responses)
    ? a.responses.map(normalizeItemResponse).filter((x): x is AttemptItemResponse => x !== null)
    : [];
  const set: AttemptSet = {
    id: a.id,
    setId: a.setId,
    setVersion: typeof a.setVersion === "number" && Number.isFinite(a.setVersion) ? a.setVersion : 1,
    moduleId: a.moduleId,
    mode: a.mode,
    status: a.status,
    startedAt: a.startedAt,
    items,
    responses,
  };
  if (typeof a.submittedAt === "string") set.submittedAt = a.submittedAt;
  if (typeof a.releasedAt === "string") set.releasedAt = a.releasedAt;
  if (typeof a.schedulerEmittedAt === "string") set.schedulerEmittedAt = a.schedulerEmittedAt;
  if (isJsonValue(a.schedulerHint)) set.schedulerHint = a.schedulerHint;
  return set;
}

function normalizeAttemptSets(raw: unknown): Record<string, AttemptSet> {
  const out: Record<string, AttemptSet> = {};
  for (const [key, value] of Object.entries(asRecord(raw))) {
    const set = normalizeAttemptSet(value);
    if (set && set.id === key) out[key] = set;
  }
  return out;
}

function normalizeReview(raw: unknown): ReviewRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string") return null;
  if (typeof r.attemptSetId !== "string") return null;
  const exerciseId = canonicalId("exercise", r.exerciseId);
  if (!exerciseId) return null;
  if (r.state !== "pending" && r.state !== "scored") return null;
  if (typeof r.rubricId !== "string") return null;
  if (typeof r.rubricVersion !== "number" || !Number.isFinite(r.rubricVersion)) return null;
  const review: ReviewRecord = {
    id: r.id,
    attemptSetId: r.attemptSetId,
    exerciseId: exerciseId as ExerciseId,
    state: r.state,
    rubricId: r.rubricId,
    rubricVersion: r.rubricVersion,
  };
  if (typeof r.score === "number" && Number.isFinite(r.score)) review.score = r.score;
  if (typeof r.passed === "boolean") review.passed = r.passed;
  if (typeof r.reviewer === "string") review.reviewer = r.reviewer;
  if (typeof r.feedback === "string") review.feedback = r.feedback;
  if (typeof r.scoredAt === "string") review.scoredAt = r.scoredAt;
  if (r.omitted === true) review.omitted = true;
  return review;
}

function normalizeReviews(raw: unknown): Record<string, ReviewRecord> {
  const out: Record<string, ReviewRecord> = {};
  for (const [key, value] of Object.entries(asRecord(raw))) {
    const review = normalizeReview(value);
    if (review && review.id === key) out[key] = review;
  }
  return out;
}

/**
 * Construct a well-formed `LearnerState` at an EXPLICIT schema version. Unlike a
 * shallow cast this:
 * - resolves both record keys and nested entity ids through `resolveId` (so a
 *   renamed lesson/exercise keeps its progress);
 * - drops or repairs malformed nested entries rather than trusting their shape;
 * - guarantees every collection exists even for an already-versioned but
 *   otherwise malformed input (e.g. `{ schemaVersion: 1 }`).
 *
 * The explicit `version` argument is what lets the migration chain stamp each
 * step's own version (the runner requires migration N to produce version N),
 * while `normalizeLearnerState` normalizes to the current `SCHEMA_VERSION`.
 */
function buildLearnerState(raw: unknown, version: number): LearnerState {
  const source = asRecord(raw);
  return {
    schemaVersion: version,
    lessonProgress: normalizeLessonProgress(source.lessonProgress),
    exerciseAttempts: normalizeExerciseAttempts(source.exerciseAttempts),
    bookmarks: normalizeBookmarks(source.bookmarks),
    attemptSets: normalizeAttemptSets(source.attemptSets),
    reviews: normalizeReviews(source.reviews),
  };
}

/**
 * Validate, alias-resolve, and repair ANY blob into a well-formed `LearnerState`
 * at the current schema version. Performs no unchecked `as LearnerState` cast —
 * it constructs the envelope.
 */
export function normalizeLearnerState(raw: unknown): LearnerState {
  return buildLearnerState(raw, SCHEMA_VERSION);
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

/* --------------------------------------------------------------------------
 * Package F builders (v2)
 * ------------------------------------------------------------------------ */

/** Generate a locally-unique id (no server, single user). */
export function localId(prefix: string): string {
  const rand =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`;
}

export function makeAttemptSet(params: {
  setId: string;
  setVersion: number;
  moduleId: string;
  mode: "exam";
  items: AttemptItemSnapshot[];
  id?: string;
  startedAt?: string;
}): AttemptSet {
  return {
    id: params.id ?? localId("attempt"),
    setId: params.setId,
    setVersion: params.setVersion,
    moduleId: params.moduleId,
    mode: params.mode,
    status: "in-progress",
    startedAt: params.startedAt ?? new Date().toISOString(),
    items: params.items,
    responses: [],
  };
}

export function makeAttemptItemResponse(params: {
  exerciseId: ExerciseId;
  answer: JsonValue;
  auto?: AutoResult;
  reviewId?: string;
  at?: string;
}): AttemptItemResponse {
  const response: AttemptItemResponse = {
    exerciseId: params.exerciseId,
    answer: params.answer,
    at: params.at ?? new Date().toISOString(),
  };
  if (params.auto) response.auto = params.auto;
  if (params.reviewId) response.reviewId = params.reviewId;
  return response;
}

export function makeReview(params: {
  attemptSetId: string;
  exerciseId: ExerciseId;
  rubricId: string;
  rubricVersion: number;
  id?: string;
}): ReviewRecord {
  return {
    id: params.id ?? localId("review"),
    attemptSetId: params.attemptSetId,
    exerciseId: params.exerciseId,
    state: "pending",
    rubricId: params.rubricId,
    rubricVersion: params.rubricVersion,
  };
}
