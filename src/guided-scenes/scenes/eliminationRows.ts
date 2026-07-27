import {
  applyRowOperation,
  augmentedFromSystem,
  eliminationStepToClearX,
  satisfiesSystem,
  solveLinearSystem2x2,
  systemMatrix,
  type AugmentedRow,
  type Vector2 as MathVector2,
} from "../../math";
import { LINEAR_SYSTEM_EXAMPLE } from "../../lessons/exampleData";

/**
 * The elimination scene's mathematics and the exact set of equations it is
 * allowed to typeset.
 *
 * Motion-Canvas-free on purpose (the same reason `sceneReadouts.ts` is): scene
 * modules import `@motion-canvas/2d` and cannot be resolved in jsdom, so
 * anything the clip DISPLAYS lives here where it can be held to the
 * mathematics.
 *
 * The load-bearing rule this module exists to enforce:
 *
 * > While R₂'s line sweeps through the pencil, the geometry is continuous but
 * > the ALGEBRA is not. The clip may only ever typeset a row from
 * > {@link ELIMINATION_DISPLAY_ROWS}.
 *
 * The sweep really does pass through rows like `1.5x − 2.5y = 3` — see
 * {@link rowAtAlpha} — and those are correct constraints, but no one writes
 * them, and a label that tracks them turns an honest geometric motion back into
 * the ticking-coefficient defect the whole clip was built to remove. So the
 * label reads through {@link displayedEquation}, which takes a STOP INDEX and
 * throws on anything between two stops. A label wired back to the continuous
 * parameter would throw at render time rather than quietly showing fractions.
 */

const EX = LINEAR_SYSTEM_EXAMPLE;

export const ELIMINATION_START = augmentedFromSystem(EX.a, EX.b);

const STEP = eliminationStepToClearX(ELIMINATION_START);
if (!STEP || STEP.kind !== "add") {
  throw new Error("eliminationRows: expected an add row-operation to clear x.");
}
export const ELIMINATION_OPERATION = STEP;
/** −2. The clip says "subtract 2·R₁", so it shows the magnitude. */
export const ELIMINATION_FACTOR = STEP.factor;
export const ELIMINATION_MULTIPLIER = Math.abs(STEP.factor);

export const ELIMINATION_END = applyRowOperation(ELIMINATION_START, STEP);

export const R1: AugmentedRow = ELIMINATION_START.rows[0];
export const R2: AugmentedRow = ELIMINATION_START.rows[1];
export const NEW_R2: AugmentedRow = ELIMINATION_END.rows[1];

/** `2·R₁` — the scratch row the longhand subtraction is written against. */
export const SCALED_R1: AugmentedRow = [
  ELIMINATION_MULTIPLIER * R1[0],
  ELIMINATION_MULTIPLIER * R1[1],
  ELIMINATION_MULTIPLIER * R1[2],
];

export const ELIMINATION_SOLUTION: MathVector2 =
  solveLinearSystem2x2(systemMatrix(ELIMINATION_START), EX.b) ?? [2, -1];

/** One column of the longhand subtraction, with both operands and the result. */
export interface EliminationColumn {
  minuend: number;
  subtrahend: number;
  result: number;
  /** True for the column the whole operation exists to zero. */
  isTarget: boolean;
}

export const ELIMINATION_COLUMNS: readonly EliminationColumn[] = (
  [0, 1, 2] as const
).map((index) => ({
  minuend: R2[index]!,
  subtrahend: SCALED_R1[index]!,
  result: NEW_R2[index]!,
  isTarget: index === 0,
}));

/**
 * The constraints reachable from R₂ by adding a multiple of R₁.
 *
 * Every member passes through the solution, which is what licenses drawing the
 * sweep as one continuous rotation. Intermediate members are genuine
 * constraints with fractional coefficients — true, and unwritable.
 */
export function rowAtAlpha(alpha: number): AugmentedRow {
  return [
    R2[0] + alpha * R1[0],
    R2[1] + alpha * R1[1],
    R2[2] + alpha * R1[2],
  ];
}

/**
 * Every row the clip is allowed to write down, in the order it writes them:
 * R₂ as it starts, and R₂ as the operation leaves it. Nothing between.
 */
export const ELIMINATION_DISPLAY_ROWS: readonly AugmentedRow[] = [R2, NEW_R2];

/** `x + 3y = -1` — LaTeX, the way a person writes the row. */
export function texEquation(row: AugmentedRow): string {
  const parts: string[] = [];
  const push = (value: number, symbol: string) => {
    if (Math.abs(value) < 1e-9) return;
    const magnitude = Math.abs(value);
    const body = magnitude === 1 ? symbol : `${texNumber(magnitude)}${symbol}`;
    parts.push(
      parts.length === 0
        ? `${value < 0 ? "-" : ""}${body}`
        : `${value < 0 ? "-" : "+"} ${body}`,
    );
  };
  push(row[0], "x");
  push(row[1], "y");
  return `${parts.length > 0 ? parts.join(" ") : "0"} = ${texNumber(row[2])}`;
}

/** A number as a frame shows it: never `-0`. */
export function texNumber(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/**
 * The equation at a stop of the sweep. **The only way the clip may typeset a
 * constraint.**
 *
 * Throws for a fractional stop rather than formatting it, so wiring the label
 * back to the continuously tweened parameter fails loudly at render time — and
 * the browser specs fail on console errors — instead of silently reintroducing
 * ticking coefficients.
 */
export function displayedEquation(stop: number): string {
  if (!Number.isInteger(stop) || stop < 0 || stop >= ELIMINATION_DISPLAY_ROWS.length) {
    throw new Error(
      `eliminationRows: displayedEquation received ${stop}. Only whole stops ` +
        `0…${ELIMINATION_DISPLAY_ROWS.length - 1} may be typeset; the sweep ` +
        `between them passes through rows nobody writes.`,
    );
  }
  return texEquation(ELIMINATION_DISPLAY_ROWS[stop]!);
}

/** The row drawn at a stop, so the label and the line it names cannot disagree. */
export function displayedRow(stop: number): AugmentedRow {
  if (!Number.isInteger(stop) || stop < 0 || stop >= ELIMINATION_DISPLAY_ROWS.length) {
    throw new Error(`eliminationRows: displayedRow received ${stop}.`);
  }
  return ELIMINATION_DISPLAY_ROWS[stop]!;
}

/** Correctness guard the scene runs before a frame renders. */
export function assertEliminationMathIsConsistent(): void {
  if (
    !satisfiesSystem(ELIMINATION_START, ELIMINATION_SOLUTION) ||
    !satisfiesSystem(ELIMINATION_END, ELIMINATION_SOLUTION)
  ) {
    throw new Error("eliminationRows: the row operation moved the solution.");
  }
  for (const [index, column] of ELIMINATION_COLUMNS.entries()) {
    if (Math.abs(column.minuend - column.subtrahend - column.result) > 1e-9) {
      throw new Error(`eliminationRows: column ${index} does not subtract.`);
    }
  }
  if (Math.abs(NEW_R2[0]) > 1e-9) {
    throw new Error("eliminationRows: the leading entry was not eliminated.");
  }
  if (Math.abs(rowAtAlpha(ELIMINATION_FACTOR)[0]) > 1e-9) {
    throw new Error("eliminationRows: the sweep does not reach the new row.");
  }
}
