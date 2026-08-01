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
  /** Owning module id (matches a `courseModel.ts` unit id). */
  moduleId: string;
  title: string;
  /** Deferred-feedback exam mode is the only supported mode (see AttemptSet.mode). */
  mode: "exam";
  /** Ordered exercise ids drawn from the module's lessons. */
  itemIds: readonly string[];
  /**
   * (Package I) When present, this set is TIME-BOXED: the runner shows a countdown
   * and auto-submits at `startedAt + timeLimitSec`. Absent ⇒ untimed (F/G/H behavior).
   */
  timeLimitSec?: number;
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

/**
 * Package H — three one-item spaced-retrieval sets (D12). Each renders a single
 * `mod-spaced-*` item through the existing runner, reached ONLY when its scheduled
 * occurrence is due (via the `dev/spaced/:scheduledReviewId` route). They are
 * deliberately NOT listed on the dev assessment index and are rejected on the
 * generic `dev/module/:setId` route so a learner cannot preview them early.
 */
const SYSTEMS_ELIMINATION_SPACED_TRICHOTOMY: ModuleSet = {
  id: "systems-elimination-spaced-trichotomy",
  version: 1,
  moduleId: "systems-elimination",
  title: "Systems & Elimination — spaced retrieval: trichotomy",
  mode: "exam",
  itemIds: ["mod-spaced-trichotomy"],
};
const SYSTEMS_ELIMINATION_SPACED_UNIQUENESS: ModuleSet = {
  id: "systems-elimination-spaced-uniqueness",
  version: 1,
  moduleId: "systems-elimination",
  title: "Systems & Elimination — spaced retrieval: uniqueness",
  mode: "exam",
  itemIds: ["mod-spaced-uniqueness"],
};
const SYSTEMS_ELIMINATION_SPACED_ROWOPS: ModuleSet = {
  id: "systems-elimination-spaced-rowops",
  version: 1,
  moduleId: "systems-elimination",
  title: "Systems & Elimination — spaced retrieval: row operations",
  mode: "exam",
  itemIds: ["mod-spaced-rowops"],
};

/**
 * Package I — the timed mock: a short exam-mode set under a time limit. Fresh
 * computation + fresh inconsistent classification + one proof, deferred feedback.
 * NOT a primary spacing set and NOT a spaced set, so it neither seeds nor answers
 * a spaced cohort; it is administered from the assessment index like any set.
 */
const SYSTEMS_ELIMINATION_MOCK: ModuleSet = {
  id: "systems-elimination-mock",
  version: 1,
  moduleId: "systems-elimination",
  title: "Systems & Elimination — timed mock",
  mode: "exam",
  timeLimitSec: 1200, // 20 minutes for three items
  itemIds: ["mod-mock-compute", "mod-mock-classify", "mod-mock-proof"],
};

/* -------------------------------------------------------------------------- */
/* The `structure` module (L8 subspaces & rank, L9 rank–nullity, L10 change of  */
/* basis) — Gate 9. Three sets, with DISJOINT membership so no item is          */
/* administered twice: a cumulative/interleaved review, the P3 proof surfaces,  */
/* and the delayed-retention set.                                              */
/* -------------------------------------------------------------------------- */

/**
 * Cumulative & interleaved across L8/L9/L10. Auto-graded produced items and
 * human-scored written items alternate, so no run of one kind cues the other,
 * and the two shapes (a non-square ledger, a shifted matrix) sit either side of
 * a change-of-basis computation — the learner must decide what each asks for.
 */
const STRUCTURE_REVIEW: ModuleSet = {
  id: "structure-review",
  version: 1,
  moduleId: "structure",
  title: "Structure of Linear Maps — cumulative review",
  mode: "exam",
  itemIds: [
    "mod-struct-rank-nullity-ledger", // L8+L9 · non-square ledger (auto)
    "mod-struct-select-method", // D8 · method selection (human)
    "mod-struct-cob-matrix-fresh", // L10 · [A]_B on a fresh basis (auto)
    "mod-struct-diagnose-colspace", // D13 · error diagnosis (human)
    "mod-struct-eigen-shift", // L7+L8+L9 · eigenspace as a null space (auto)
  ],
};

/**
 * The P3 override's proof surfaces, all human-scored against versioned rubrics.
 * Every statement is FRESH — none re-runs the proof its own lesson displays — so
 * this measures construction rather than recall.
 */
const STRUCTURE_PROOF: ModuleSet = {
  id: "structure-proof",
  version: 1,
  moduleId: "structure",
  title: "Structure of Linear Maps — proof & counterexample (P3)",
  mode: "exam",
  itemIds: [
    "mod-struct-prove-subspace-inclusion", // L8 · subspace reasoning + strict case
    "mod-struct-prove-rank-nullity", // L9 · the independence step + a use
    "mod-struct-derive-similarity", // L10 · invariance derived + converse killed
  ],
};

/**
 * Delayed retention (D12). NOT a platform "spaced set": the scheduler is scoped
 * to a single `SPACED_MODULE_ID` (see `platform/spacedConfig.ts`), so nothing
 * seeds these automatically and they are administered manually after a delay.
 * Registered as an ordinary set for exactly that reason — generalizing the
 * scheduler is tracked in the module's assessment plan, not faked here.
 */
const STRUCTURE_RETENTION: ModuleSet = {
  id: "structure-retention",
  version: 1,
  moduleId: "structure",
  title: "Structure of Linear Maps — delayed retention",
  mode: "exam",
  itemIds: [
    "mod-struct-retain-two-spaces", // L8 · which space, which ambient R^k
    "mod-struct-retain-total-n", // L9 · the total is n, not m
    "mod-struct-retain-p-direction", // L10 · P's direction, from its columns
  ],
};

/* -------------------------------------------------------------------------- */
/* The `calculus-foundations` module (L1 limits-continuity, L2                 */
/* derivative-local-linearity, L3 integral-accumulation, L4                    */
/* fundamental-theorem) — Gate 9. Three sets, DISJOINT membership: a           */
/* cumulative/interleaved review, a delayed-retention set, and a timed mock.   */
/* -------------------------------------------------------------------------- */

/**
 * Cumulative & interleaved across L1-L4. Auto-graded and human-scored items
 * STRICTLY ALTERNATE, so no run of one kind cues the next. Four distinct
 * rate fixtures across the set, so no item's answer is a stepping stone to
 * another's inside one sitting.
 */
const CALCULUS_FOUNDATIONS_REVIEW: ModuleSet = {
  id: "calculus-foundations-review",
  version: 1,
  moduleId: "calculus-foundations",
  title: "Calculus Foundations — cumulative review",
  mode: "exam",
  itemIds: [
    "mod-calcfound-limit-in-derivative", // L1+L2 · limit repair -> derivative (auto)
    "mod-calcfound-select-method", // D8 · method selection (human)
    "mod-calcfound-transfer-bracket-window", // D9 · produced bracket-failure interval (auto)
    "mod-calcfound-diagnose-signed-split", // D13 · error diagnosis (human)
    "mod-calcfound-mixed-rate-total", // L2+L3 · rate/total mixed questions (auto)
    "mod-calcfound-mixed-ftc", // L2+L3+L4 · two routes + bracket + FTC (human)
  ],
};

/**
 * Delayed retention (D12). NOT a platform "spaced set": the scheduler is
 * scoped to a single `SPACED_MODULE_ID` (`platform/spacedConfig.ts`), so
 * nothing seeds these automatically — administered manually after a delay,
 * a tracked gap recorded in the module's assessment plan, not faked here.
 */
const CALCULUS_FOUNDATIONS_RETENTION: ModuleSet = {
  id: "calculus-foundations-retention",
  version: 1,
  moduleId: "calculus-foundations",
  title: "Calculus Foundations — delayed retention",
  mode: "exam",
  itemIds: [
    "mod-calcfound-retain-point-value", // L1 · the declared value never moves the limit
    "mod-calcfound-retain-diff-cont", // L2 · differentiable ⇒ continuous, not conversely
    "mod-calcfound-retain-signed", // L3 · net change is signed, not the area model
    "mod-calcfound-retain-existence", // L4 · existence, not a formula
  ],
};

/**
 * The timed mock (D11): a short exam-mode set under a time limit, all
 * auto-graded — a deferred-feedback timed set with a human in the loop
 * returns nothing in time to be a mock. The profile is P2 with no P3
 * override (course-spine.md §0), so no proof set is required, and this is
 * where that budget goes instead — otherwise the course would have no timed
 * surface at all.
 */
const CALCULUS_FOUNDATIONS_MOCK: ModuleSet = {
  id: "calculus-foundations-mock",
  version: 1,
  moduleId: "calculus-foundations",
  title: "Calculus Foundations — timed mock",
  mode: "exam",
  timeLimitSec: 600, // 10 minutes for three items — an authored guess, not a measured norm
  itemIds: ["mod-calcfound-mock-limit", "mod-calcfound-mock-total", "mod-calcfound-mock-slope-of-total"],
};

export const MODULE_SETS: readonly ModuleSet[] = [
  SYSTEMS_ELIMINATION_REVIEW,
  SYSTEMS_ELIMINATION_TRANSFER,
  SYSTEMS_ELIMINATION_APPLIED,
  SYSTEMS_ELIMINATION_SPACED_TRICHOTOMY,
  SYSTEMS_ELIMINATION_SPACED_UNIQUENESS,
  SYSTEMS_ELIMINATION_SPACED_ROWOPS,
  SYSTEMS_ELIMINATION_MOCK,
  STRUCTURE_REVIEW,
  STRUCTURE_PROOF,
  STRUCTURE_RETENTION,
  CALCULUS_FOUNDATIONS_REVIEW,
  CALCULUS_FOUNDATIONS_RETENTION,
  CALCULUS_FOUNDATIONS_MOCK,
];

/* -------------------------------------------------------------------------- */
/* Package H — spacing set-id groupings.                                        */
/*                                                                              */
/* The referential-integrity constants live in `platform/spacedConfig.ts` (the  */
/* single source of truth, so the persistence-layer normalizer can validate     */
/* without an upward platform→lessons import). Re-exported here for the lessons/ */
/* component consumers (scheduler, dev routes) that already import moduleSets.   */
/* -------------------------------------------------------------------------- */

export {
  SPACED_MODULE_ID,
  PRIMARY_SET_IDS,
  SPACED_ITEMS,
  SPACED_SET_IDS,
  SPACED_EXERCISE_IDS,
  isPrimarySetId,
  isSpacedSetId,
  spacedSetForExercise,
  spacedExerciseForSet,
} from "../platform/spacedConfig";

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
