/**
 * Spaced-retrieval schedule contract (Package H) — referential-integrity config.
 *
 * This is the SINGLE SOURCE OF TRUTH for the delayed-retrieval (D12) schedule:
 * which cumulative sets are spacing anchors, which one-item sets render which
 * spaced exercises, the fixed delays, and the deterministic occurrence-id scheme.
 *
 * It lives in `platform/` (not `lessons/`) for the same reason `identity.ts`
 * does: the persistence-layer normalizer must validate spacing referential
 * integrity on load/import, and `platform/` must not import the `lessons/` layer
 * (the layering boundary is one-directional). These are stable string/number
 * literals with NO imports, so `lessons/moduleSets.ts` re-exports them downward
 * and there is exactly one definition. Pure data + pure helpers; no React, no I/O.
 */

/** The module the systems–elimination spacing cohort belongs to. */
export const SPACED_MODULE_ID = "systems-elimination";

/** Fixed retrieval delays (days): ~1 week and ~1 month. */
export const SPACED_DELAY_DAYS: readonly number[] = [7, 30];

const DAY_MS = 86_400_000;

/**
 * Primary (cumulative/interleaved) sets whose FIRST eligible release is the
 * operational spacing anchor that seeds the D12 cohort. A spaced one-item set is
 * NOT primary, so answering one never re-seeds.
 */
export const PRIMARY_SET_IDS: readonly string[] = [
  "systems-elimination-review",
  "systems-elimination-transfer",
  "systems-elimination-applied",
];

/**
 * The fixed spaced-exercise ↔ one-item-set mapping. Every scheduled occurrence's
 * `setId`/`exerciseId` pair MUST match a row here; the normalizer, the scheduler,
 * and the generic-route rejection all read from it.
 */
export const SPACED_ITEMS: readonly { setId: string; exerciseId: string }[] = [
  { setId: "systems-elimination-spaced-trichotomy", exerciseId: "mod-spaced-trichotomy" },
  { setId: "systems-elimination-spaced-uniqueness", exerciseId: "mod-spaced-uniqueness" },
  { setId: "systems-elimination-spaced-rowops", exerciseId: "mod-spaced-rowops" },
];

export const SPACED_SET_IDS: readonly string[] = SPACED_ITEMS.map((s) => s.setId);
export const SPACED_EXERCISE_IDS: readonly string[] = SPACED_ITEMS.map((s) => s.exerciseId);

/** The number of occurrences a full cohort seeds: items × delays. */
export const SPACED_COHORT_SIZE = SPACED_ITEMS.length * SPACED_DELAY_DAYS.length;

export function isPrimarySetId(setId: string): boolean {
  return PRIMARY_SET_IDS.includes(setId);
}
export function isSpacedSetId(setId: string): boolean {
  return SPACED_SET_IDS.includes(setId);
}
export function isSpacedExerciseId(exerciseId: string): boolean {
  return SPACED_EXERCISE_IDS.includes(exerciseId);
}
export function isSpacedDelay(delayDays: number): boolean {
  return SPACED_DELAY_DAYS.includes(delayDays);
}
/** The one-item set that renders a given spaced exercise, or `undefined`. */
export function spacedSetForExercise(exerciseId: string): string | undefined {
  return SPACED_ITEMS.find((s) => s.exerciseId === exerciseId)?.setId;
}
/** The spaced exercise a given one-item set renders, or `undefined`. */
export function spacedExerciseForSet(setId: string): string | undefined {
  return SPACED_ITEMS.find((s) => s.setId === setId)?.exerciseId;
}

/**
 * Deterministic occurrence id: the map key IS the occurrence identity, so a
 * re-seed of the same occurrence is a harmless overwrite and cohorting is free.
 * Release-date-INDEPENDENT (no timestamp), so later releases recognize the same
 * cohort rather than minting a second one.
 */
export function deriveStableKey(
  moduleId: string,
  exerciseId: string,
  delayDays: number,
): string {
  return `spaced:${moduleId}:${exerciseId}:${delayDays}`;
}

/**
 * The exact due timestamp for a delay off a canonical release timestamp. Both
 * sides are canonical ISO strings, so equality comparison is exact at ms — never
 * rely on lexical date-string ordering.
 */
export function dueAtFrom(releasedAt: string, delayDays: number): string {
  return new Date(Date.parse(releasedAt) + delayDays * DAY_MS).toISOString();
}
