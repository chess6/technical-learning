/**
 * Module assessment sets (Package F2) — cumulative / interleaved item sets drawn
 * across a module's lessons. A `ModuleSet` is just an ordered list of existing
 * lesson-exercise ids plus a content `version` (bumped when the list/order
 * changes, so a released attempt records which form it administered).
 *
 * Package F wired the RUNNER against existing L3–L5 exercises. Package G adds the
 * real Class-A MODULE-OWNED items (`src/lessons/moduleItems.ts`: fresh 3×3,
 * rectangular, transfer, diagnosis, proof) and cumulative/interleaved sets over
 * them. Later packages register additional sets WITHOUT changing the routing
 * contract (routes identify a set id, not merely a module).
 */

import { MODULE_ITEMS } from "./moduleItems";
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

/**
 * Package G transfer/selection/diagnosis set — interleaves method selection,
 * unfamiliar classification, a fresh produced solution set, error diagnosis, and
 * the proof-hypothesis item. Deterministic order; auto and human-scored items
 * alternate so no run of one kind cues the other.
 */
const SYSTEMS_ELIMINATION_TRANSFER: ModuleSet = {
  id: "systems-elimination-transfer",
  version: 1,
  moduleId: "systems-elimination",
  title: "Systems & Elimination — transfer & selection",
  mode: "exam",
  itemIds: [
    "mod-select-method", // method selection (human)
    "mod-transfer-classify", // unfamiliar classification (human)
    "mod-transfer-solset-fresh", // fresh produced solution set (auto)
    "mod-error-diagnose", // error diagnosis (human)
    "mod-proof-hyp", // proof hypothesis (human)
  ],
};

/**
 * Package G cumulative / concrete P2 applied set — a fresh 3×3 with a free
 * variable, the cumulative L4+L5 problem, and the inconsistent rectangular case
 * (contradiction row ⇒ ∅). Together these interleave consistent parametric
 * solutions with an inconsistent ∅ outcome.
 */
const SYSTEMS_ELIMINATION_APPLIED: ModuleSet = {
  id: "systems-elimination-applied",
  version: 1,
  moduleId: "systems-elimination",
  title: "Systems & Elimination — cumulative & applied",
  mode: "exam",
  itemIds: [
    "mod-p2-applied-3x3", // fresh 3-variable, consistent (auto)
    "mod-cumulative-elim-solset", // cumulative L4+L5, consistent (auto)
    "mod-p2-applied-rect", // rectangular, inconsistent ∅ (auto)
  ],
};

export const MODULE_SETS: readonly ModuleSet[] = [
  SYSTEMS_ELIMINATION_REVIEW,
  SYSTEMS_ELIMINATION_TRANSFER,
  SYSTEMS_ELIMINATION_APPLIED,
];

const moduleSetById = new Map(MODULE_SETS.map((set) => [set.id, set]));

export function getModuleSet(id: string): ModuleSet | undefined {
  return moduleSetById.get(id);
}

export function listModuleSets(): readonly ModuleSet[] {
  return MODULE_SETS;
}

/**
 * Index every resolvable item by id: lesson exercises (Package F sets reference
 * these) PLUS module-owned Package G items. A duplicate id across the two sources
 * is a content bug and fails loudly at module load.
 */
const exerciseById = new Map<string, ExerciseDefinition>();
function registerExercise(exercise: ExerciseDefinition) {
  if (exerciseById.has(exercise.id)) {
    throw new Error(`Duplicate exercise id "${exercise.id}" across lessons/module items`);
  }
  exerciseById.set(exercise.id, exercise);
}
for (const lesson of lessons) {
  for (const exercise of lesson.exercises ?? []) {
    registerExercise(exercise);
  }
}
for (const item of MODULE_ITEMS) {
  registerExercise(item);
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
