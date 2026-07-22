/**
 * Platform identity & versioning contract (the spine).
 *
 * This module standardizes the *durable identities* the platform depends on and
 * the *versioning/migration* behavior that keeps stored learner progress safe
 * across renames and schema changes. It governs load-bearing seams only — it
 * says nothing about pedagogy, lesson composition, or presentation.
 *
 * Key decisions (see docs/PLATFORM_CONTRACTS.md):
 * - Existing unnamespaced ids (e.g. "vectors", "vec-add-compute") remain
 *   CANONICAL. Branding below is a compile-time guard; it does not renamespace
 *   any id.
 * - Renaming an entity is forbidden. Instead, register an alias (old -> new) so
 *   stored progress keyed by the old id resolves to the current entity.
 * - Persisted shapes evolve through a chained migration runner, not ad-hoc
 *   reshaping at read time.
 *
 * No React, no storage, no side effects. Pure contract + helpers.
 */

/* --------------------------------------------------------------------------
 * Entity-specific branded ids
 *
 * Branding makes it a type error to pass a LessonId where an ExerciseId is
 * expected, without changing the runtime value (still a plain string). Author
 * data stays ergonomic; the guards below are the only place a raw string is
 * blessed into a branded id, and they validate syntax as they do so.
 * ------------------------------------------------------------------------ */

export type CourseId = string & { readonly __brand: "CourseId" };
export type UnitId = string & { readonly __brand: "UnitId" };
export type LessonId = string & { readonly __brand: "LessonId" };
export type ExerciseId = string & { readonly __brand: "ExerciseId" };
export type ConceptId = string & { readonly __brand: "ConceptId" };

export type EntityKind = "course" | "unit" | "lesson" | "exercise" | "concept";

export type AnyEntityId =
  | CourseId
  | UnitId
  | LessonId
  | ExerciseId
  | ConceptId;

/* --------------------------------------------------------------------------
 * ID syntax
 *
 * Lowercase slug: segments of [a-z0-9] joined by single hyphens. An optional
 * leading `x-` marks an EXPERIMENTAL id — content that may live outside the
 * canonical curriculum tree. Experimental ids are still ordinary ids for every
 * other purpose (syntax, uniqueness, referential integrity, alias resolution);
 * the prefix only exempts them from the "must appear in the curriculum" rule.
 * ------------------------------------------------------------------------ */

const ID_SYNTAX = /^(x-)?[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidIdSyntax(id: string): boolean {
  return ID_SYNTAX.test(id);
}

export function isExperimentalId(id: string): boolean {
  return id.startsWith("x-");
}

function assertSyntax(kind: EntityKind, id: string): void {
  if (!isValidIdSyntax(id)) {
    throw new Error(
      `Invalid ${kind} id "${id}": ids must be lowercase slugs ` +
        `(a-z, 0-9, hyphen-separated), optionally prefixed "x-" for experimental.`,
    );
  }
}

/* --------------------------------------------------------------------------
 * Guards: the only sanctioned way to turn a raw string into a branded id.
 * ------------------------------------------------------------------------ */

export function asCourseId(id: string): CourseId {
  assertSyntax("course", id);
  return id as CourseId;
}
export function asUnitId(id: string): UnitId {
  assertSyntax("unit", id);
  return id as UnitId;
}
export function asLessonId(id: string): LessonId {
  assertSyntax("lesson", id);
  return id as LessonId;
}
export function asExerciseId(id: string): ExerciseId {
  assertSyntax("exercise", id);
  return id as ExerciseId;
}
export function asConceptId(id: string): ConceptId {
  assertSyntax("concept", id);
  return id as ConceptId;
}

/* --------------------------------------------------------------------------
 * Alias maps (per entity)
 *
 * When an entity is renamed, add old -> new here. Learner progress keyed by the
 * retired id then resolves forward, so a rename never silently erases progress.
 * Empty today by design: no id has been retired yet.
 * ------------------------------------------------------------------------ */

export type AliasMap = Record<string, string>;

const ALIASES: Record<EntityKind, AliasMap> = {
  course: {},
  unit: {},
  lesson: {},
  exercise: {},
  concept: {},
};

/**
 * Follow the alias chain for an id within an entity kind to its current
 * canonical value. Terminates on cycles by detection rather than looping.
 */
export function resolveId(
  kind: EntityKind,
  id: string,
  aliases: Record<EntityKind, AliasMap> = ALIASES,
): string {
  const map = aliases[kind];
  const seen = new Set<string>();
  let current = id;
  while (Object.prototype.hasOwnProperty.call(map, current)) {
    if (seen.has(current)) {
      throw new Error(`Alias cycle detected for ${kind} id "${id}".`);
    }
    seen.add(current);
    current = map[current]!;
  }
  return current;
}

/** Test/authoring seam: register an alias without editing the module map. */
export function registerAlias(
  kind: EntityKind,
  from: string,
  to: string,
): void {
  ALIASES[kind][from] = to;
}

/* --------------------------------------------------------------------------
 * Uniqueness & referential integrity helpers (used by curriculum validation)
 * ------------------------------------------------------------------------ */

/** Throw if any id repeats. Returns the input for chaining. */
export function assertUniqueIds(kind: EntityKind, ids: readonly string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new Error(`Duplicate ${kind} id "${id}".`);
    }
    seen.add(id);
  }
}

/* --------------------------------------------------------------------------
 * Schema versioning + migration runner
 *
 * The persisted learner-state envelope carries a `schemaVersion`. The runner
 * applies chained migrations (each producing the next version) until the state
 * reaches the app's current SCHEMA_VERSION. We test the RUNNER end to end
 * rather than requiring every individual migration to be independently
 * idempotent.
 * ------------------------------------------------------------------------ */

export const SCHEMA_VERSION = 1 as const;

export type VersionedState = { schemaVersion: number } & Record<string, unknown>;

/** A migration takes a state at version N-1 and returns it at version N. */
export type Migration = (state: VersionedState) => VersionedState;

/** Migrations keyed by the version they PRODUCE. Empty at v1 (nothing to upgrade from yet). */
export const migrations: Record<number, Migration> = {};

const MIGRATION_STEP_LIMIT = 1000;

/**
 * Upgrade a versioned state to `targetVersion` by applying the chained
 * migrations from `registry`. Pure: never touches storage. Injectable registry
 * and target so the runner is testable without a real migration existing yet.
 */
export function runMigrations(
  input: VersionedState,
  registry: Record<number, Migration> = migrations,
  targetVersion: number = SCHEMA_VERSION,
): VersionedState {
  if (input.schemaVersion > targetVersion) {
    throw new Error(
      `Stored schema version ${input.schemaVersion} is newer than the app ` +
        `target ${targetVersion}; refusing to downgrade.`,
    );
  }

  let state = input;
  let steps = 0;
  while (state.schemaVersion < targetVersion) {
    const next = state.schemaVersion + 1;
    const migrate = registry[next];
    if (!migrate) {
      throw new Error(`No migration registered to reach schema version ${next}.`);
    }
    state = migrate(state);
    if (state.schemaVersion !== next) {
      throw new Error(
        `Migration to version ${next} must set schemaVersion to ${next} ` +
          `(got ${state.schemaVersion}).`,
      );
    }
    steps += 1;
    if (steps > MIGRATION_STEP_LIMIT) {
      throw new Error("Migration runner exceeded its step limit (possible loop).");
    }
  }
  return state;
}
