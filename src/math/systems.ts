import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import { determinant2x2, matrixColumn } from "./matrices";

/**
 * Solving a 2×2 linear system `A x = b`, treated as one object seen two ways:
 *
 * - **Row picture** — each row `a_i1 x + a_i2 y = b_i` is a line; a solution is
 *   a point on *both* lines (their intersection).
 * - **Column picture** — `A x = x·(col 1) + y·(col 2) = b`; a solution is a
 *   choice of coefficients that combines the columns to reach `b`.
 *
 * Both pictures agree on the same trichotomy, which this module is the single
 * source of truth for:
 *
 * | columns        | `b` reachable? | solutions        |
 * | -------------- | -------------- | ---------------- |
 * | independent    | always         | exactly one      |
 * | dependent      | `b` on the line| infinitely many  |
 * | dependent      | `b` off the line| none            |
 *
 * All linear algebra flows through the shared `src/math` helpers
 * (`determinant2x2`, `matrixColumn`) — this module never re-packs matrices or
 * reimplements the arithmetic. Coordinates stay in math space; any pixel /
 * y-flip mapping happens in the renderer, never here.
 */

export type LinearSystemKind = "unique" | "infinite" | "none";

export type LinearSystem2x2Classification = {
  /** Which branch of the trichotomy this system falls into. */
  kind: LinearSystemKind;
  /** `det(A)`. Zero (within tolerance) marks dependent columns / collapse. */
  determinant: number;
  /** `true` when the columns of `A` are linearly independent (det ≠ 0). */
  independentColumns: boolean;
  /** `true` when at least one solution exists (`b` lies in the column space). */
  consistent: boolean;
  /** The unique solution when `kind === "unique"`, otherwise `null`. */
  solution: Vector2 | null;
};

/** 2D scalar cross product; zero ⇔ the two vectors are parallel. */
function cross(a: Vector2, b: Vector2): number {
  return a[0] * b[1] - a[1] * b[0];
}

function isZeroVector(v: Vector2, tolerance: number): boolean {
  return Math.abs(v[0]) <= tolerance && Math.abs(v[1]) <= tolerance;
}

/**
 * The unique solution of `A x = b` when the columns are independent, else
 * `null`. Uses Cramer's rule on the shared determinant — no ad-hoc inverse.
 */
export function solveLinearSystem2x2(
  A: Matrix2x2,
  b: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): Vector2 | null {
  const det = determinant2x2(A);
  if (Math.abs(det) <= tolerance) return null;
  // Cramer: replace column i of A with b, divide by det(A).
  const col1 = matrixColumn(A, 0);
  const col2 = matrixColumn(A, 1);
  const x = cross(b, col2) / det;
  const y = cross(col1, b) / det;
  return [x, y];
}

/**
 * Classify `A x = b` into unique / infinitely-many / no solution, exposing the
 * facts both the row and column pictures depend on (determinant, independence,
 * consistency). Consistency for a dependent system is decided geometrically:
 * `b` is reachable exactly when it lies on the line (or point) that the
 * dependent columns span.
 */
export function classifyLinearSystem2x2(
  A: Matrix2x2,
  b: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): LinearSystem2x2Classification {
  const determinant = determinant2x2(A);
  const independentColumns = Math.abs(determinant) > tolerance;

  if (independentColumns) {
    // Column space is all of the plane: every b is reached exactly once.
    return {
      kind: "unique",
      determinant,
      independentColumns: true,
      consistent: true,
      solution: solveLinearSystem2x2(A, b, tolerance),
    };
  }

  // Dependent columns: the column space is a line through the origin (or just
  // the origin if A is the zero matrix). b is reachable iff it lies on it.
  const col1 = matrixColumn(A, 0);
  const col2 = matrixColumn(A, 1);
  const spanning = isZeroVector(col1, tolerance) ? col2 : col1;

  let consistent: boolean;
  if (isZeroVector(spanning, tolerance)) {
    // A = 0: column space is {0}. Only b = 0 is reachable (then every x works).
    consistent = isZeroVector(b, tolerance);
  } else {
    // b on the column line ⇔ b parallel to the spanning column.
    consistent = Math.abs(cross(spanning, b)) <= tolerance;
  }

  return {
    kind: consistent ? "infinite" : "none",
    determinant,
    independentColumns: false,
    consistent,
    solution: null,
  };
}
