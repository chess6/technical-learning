import {
  applyRowOperation,
  augmentedFromSystem,
  eliminationStepToClearX,
  satisfiesSystem,
  solveLinearSystem2x2,
  systemMatrix,
  type AugmentedRow,
  type AugmentedSystem,
  type Vector2 as MathVector2,
} from "../../math";
import { LINEAR_SYSTEM_EXAMPLE } from "../../lessons/exampleData";

/**
 * Motion-Canvas-free data for the elimination design experiment.
 *
 * Every candidate clip teaches the SAME row operation on the SAME system, so
 * the three can be compared as pedagogy rather than as arithmetic. That is only
 * true if they all read one source: the system, the operation, the scaled row,
 * the three column subtractions, and the result row are all derived here from
 * `src/math` and the shared lesson example, never typed into a scene.
 *
 * Scene modules import `@motion-canvas/2d` and cannot be resolved in jsdom, so
 * this module is where the experiment's mathematics can actually be tested.
 */

const EX = LINEAR_SYSTEM_EXAMPLE;

/** `x + 3y = −1`, `2x − y = 5`. Lesson 3's running system. */
export const START_SYSTEM: AugmentedSystem = augmentedFromSystem(EX.a, EX.b);

/** The unique crossing, from the shared solver — the invariant every clip keeps. */
export const SOLUTION: MathVector2 =
  solveLinearSystem2x2(systemMatrix(START_SYSTEM), EX.b) ?? [2, -1];

/**
 * `R₂ ← R₂ − 2·R₁`, chosen by the shared helper rather than written down: the
 * factor the clips display is the one the elimination step actually uses.
 */
const STEP = eliminationStepToClearX(START_SYSTEM);
if (!STEP || STEP.kind !== "add") {
  throw new Error("eliminationExperimentData: expected an add row-operation.");
}
export const OPERATION = STEP;

/** −2 here; the clips say "subtract 2·R₁", so they show its magnitude. */
export const FACTOR = OPERATION.factor;
export const MULTIPLIER = Math.abs(FACTOR);

export const END_SYSTEM: AugmentedSystem = applyRowOperation(
  START_SYSTEM,
  OPERATION,
);

export const R1: AugmentedRow = START_SYSTEM.rows[0];
export const R2: AugmentedRow = START_SYSTEM.rows[1];
export const NEW_R2: AugmentedRow = END_SYSTEM.rows[1];

/** `2·R₁` — the scratch row a longhand subtraction is written against. */
export const SCALED_R1: AugmentedRow = [
  MULTIPLIER * R1[0],
  MULTIPLIER * R1[1],
  MULTIPLIER * R1[2],
];

/**
 * One column of the longhand subtraction, with both operands and the result.
 *
 * The clips must make the ORIGIN of every result entry understandable, so each
 * column carries the numbers it was computed from — a scene can render
 * `5 − (−2) = 7` without re-deriving anything, and a test can check that the
 * three columns really do reconstruct the new row.
 */
export interface EliminationColumn {
  /** `x`, `y`, or the right-hand side. */
  id: "x" | "y" | "rhs";
  /** The entry of R₂ above the rule. */
  minuend: number;
  /** The entry of `2·R₁` below it. */
  subtrahend: number;
  /** Their difference — the corresponding entry of the new R₂. */
  result: number;
  /** True for the column the whole operation exists to zero. */
  isTarget: boolean;
}

export const COLUMNS: readonly EliminationColumn[] = (
  ["x", "y", "rhs"] as const
).map((id, index) => ({
  id,
  minuend: R2[index]!,
  subtrahend: SCALED_R1[index]!,
  result: NEW_R2[index]!,
  isTarget: index === 0,
}));

/**
 * The pencil of constraints reachable from R₂ by adding a multiple of R₁.
 *
 * Every member is a legal row operation's result, so every member passes
 * through the solution — which is exactly why a clip may animate the second
 * line sweeping continuously through them. `alpha = 0` is R₂ itself and
 * `alpha = FACTOR` is the eliminated row.
 */
export function rowAtAlpha(alpha: number): AugmentedRow {
  return [
    R2[0] + alpha * R1[0],
    R2[1] + alpha * R1[1],
    R2[2] + alpha * R1[2],
  ];
}

/** Integer stops a clip can typeset while searching for the multiplier. */
export const ALPHA_STOPS: readonly number[] = [0, -1, -2, -3];

/**
 * Correctness guard. Runs when the experiment module loads, so a clip can never
 * animate a subtraction whose columns disagree with the row it promotes.
 */
export function assertExperimentDataIsConsistent(): void {
  if (!satisfiesSystem(START_SYSTEM, SOLUTION)) {
    throw new Error("eliminationExperimentData: solution does not solve the start system.");
  }
  if (!satisfiesSystem(END_SYSTEM, SOLUTION)) {
    throw new Error("eliminationExperimentData: the row operation moved the solution.");
  }
  for (const [index, column] of COLUMNS.entries()) {
    if (Math.abs(column.minuend - column.subtrahend - column.result) > 1e-9) {
      throw new Error(`eliminationExperimentData: column ${column.id} does not subtract.`);
    }
    if (Math.abs(column.result - NEW_R2[index]!) > 1e-9) {
      throw new Error(`eliminationExperimentData: column ${column.id} != new R2 entry.`);
    }
  }
  if (Math.abs(NEW_R2[0]!) > 1e-9) {
    throw new Error("eliminationExperimentData: the leading entry was not eliminated.");
  }
  if (Math.abs(rowAtAlpha(FACTOR)[0]!) > 1e-9) {
    throw new Error("eliminationExperimentData: alpha sweep does not reach the eliminated row.");
  }
}
