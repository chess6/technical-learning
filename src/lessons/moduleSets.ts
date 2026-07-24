/**
 * Module assessment sets (Package F2) — cumulative / interleaved item sets drawn
 * across a module's lessons. A `ModuleSet` is just an ordered list of existing
 * lesson-exercise ids plus a content `version` (bumped when the list/order
 * changes, so a released attempt records which form it administered).
 *
 * Package F wires the RUNNER; it references existing L3–L5 exercises only. The
 * real Class-A module items (fresh 3×3, timed mock, etc.) are Package G and are
 * out of scope here. Later packages register additional sets WITHOUT changing
 * the routing contract (routes identify a set id, not merely a module).
 */

import { lessons } from "./registry";
import type { ExerciseDefinition } from "./types";

export interface ModuleSet {
  id: string;
  /** Content version — bump when `itemIds` (membership or order) changes. */
  version: number;
  /** Owning module/section id (matches curriculum.ts). */
  moduleId: string;
  title: string;
  /** Deferred-feedback exam mode is the only supported mode (see AttemptSet.mode). */
  mode: "exam";
  /** Ordered exercise ids drawn from the module's lessons. */
  itemIds: readonly string[];
}

/**
 * The systems–elimination pilot review set: interleaved across L3/L4/L5, mixing
 * auto-graded classification/diagnosis items with the human-scored proof
 * surfaces that Gate 8 is waiting on. Deferred-feedback (exam) mode.
 */
const SYSTEMS_ELIMINATION_REVIEW: ModuleSet = {
  id: "systems-elimination-review",
  version: 1,
  moduleId: "systems-elimination",
  title: "Systems & Elimination — cumulative review",
  mode: "exam",
  itemIds: [
    "sys-count-none", // L3 · classify (auto)
    "elim-diagnose-illegal", // L4 · diagnose illegal op (auto)
    "sol-free-variables-dimension", // L5 · free vars → dimension (auto)
    "sys-prove-trichotomy", // L3 · proof (human-scored)
    "elim-explain-invariance", // L4 · proof (human-scored)
    "sol-prove-structure", // L5 · proof (human-scored)
  ],
};

export const MODULE_SETS: readonly ModuleSet[] = [SYSTEMS_ELIMINATION_REVIEW];

const moduleSetById = new Map(MODULE_SETS.map((set) => [set.id, set]));

export function getModuleSet(id: string): ModuleSet | undefined {
  return moduleSetById.get(id);
}

export function listModuleSets(): readonly ModuleSet[] {
  return MODULE_SETS;
}

/** Index of every lesson exercise by id (across all lessons). */
const exerciseById = new Map<string, ExerciseDefinition>();
for (const lesson of lessons) {
  for (const exercise of lesson.exercises ?? []) {
    exerciseById.set(exercise.id, exercise);
  }
}

export class ModuleSetResolutionError extends Error {}

/**
 * Resolve a set id to its `ModuleSet` and the ordered `ExerciseDefinition`s.
 * Throws if the set is unknown or references a missing exercise id (a content
 * bug that must fail loudly, not silently drop an exam item).
 */
export function resolveModuleSet(id: string): {
  set: ModuleSet;
  items: ExerciseDefinition[];
} {
  const set = getModuleSet(id);
  if (!set) throw new ModuleSetResolutionError(`Unknown module set "${id}"`);
  const items = set.itemIds.map((itemId) => {
    const exercise = exerciseById.get(itemId);
    if (!exercise) {
      throw new ModuleSetResolutionError(
        `Module set "${id}" references missing exercise "${itemId}"`,
      );
    }
    return exercise;
  });
  return { set, items };
}
