import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import { matrixColumn, matrixVectorMultiply } from "./matrices";
import {
  addVectors,
  dotProduct,
  magnitude,
  scaleVector,
  subtractVectors,
} from "./vectors";
import { classifyLinearSystem2x2 } from "./systems";
import { nullspaceBasis2x2 } from "./eigen";

/**
 * The structure of the solution set of `A x = b`, seen as one object:
 *
 *   Sol(A, b) = { x_p } + Null(A)   when the system is consistent,
 *   Sol(A, b) = ∅                   when it is inconsistent.
 *
 * This module is the single source of truth for that decomposition. It does NOT
 * reimplement any linear algebra — existence/independence come from
 * `classifyLinearSystem2x2`, and the homogeneous directions come from
 * `nullspaceBasis2x2`. Coordinates stay in math space; any pixel / y-flip
 * mapping happens in the renderer, never here.
 *
 * Correctness note (see docs/insights/solution-sets.md): `nullspaceBasis2x2`
 * returns a vector orthogonal to a row, which is the null space ONLY when `A` is
 * singular (rank ≤ 1). We therefore branch on column independence FIRST — an
 * independent (invertible) `A` has null space {0} and a single-point solution
 * set — and only consult `nullspaceBasis2x2` on the singular branch, where it is
 * valid.
 */
export type SolutionSet2x2 =
  /** Inconsistent: b is off the column space, so there is no particular solution. */
  | { readonly kind: "empty" }
  /** Trivial null space: exactly one solution, the particular solution. */
  | { readonly kind: "point"; readonly particular: Vector2 }
  /**
   * One free variable: the affine line `x_p + t·direction`. `direction` is a
   * unit basis vector of `Null(A)` (a homogeneous solution).
   */
  | { readonly kind: "line"; readonly particular: Vector2; readonly direction: Vector2 }
  /** Two free variables (A = 0): every point solves it — the whole plane. */
  | { readonly kind: "plane"; readonly particular: Vector2 };

/**
 * One particular solution `x_p` of `A x = b`, or `null` when the system is
 * inconsistent. For independent columns this is the unique solution; for
 * dependent-but-consistent columns it puts all the weight on the nonzero column
 * (`b` is guaranteed parallel to it by consistency), which is a genuine solution
 * `A x_p = b`.
 */
export function particularSolution2x2(
  A: Matrix2x2,
  b: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): Vector2 | null {
  const cls = classifyLinearSystem2x2(A, b, tolerance);
  if (!cls.consistent) return null;
  if (cls.independentColumns) return cls.solution; // unique solution

  // Dependent + consistent. If A = 0 then consistency forced b = 0, and every x
  // works — the canonical representative is the origin.
  const col1 = matrixColumn(A, 0);
  const col2 = matrixColumn(A, 1);
  const n1 = magnitude(col1);
  const n2 = magnitude(col2);
  if (n1 <= tolerance && n2 <= tolerance) return [0, 0];

  // Put all weight on a nonzero column e. Consistency means b = s0·e exactly, so
  // s0 = (b·e)/(e·e) and (s0, 0) [or (0, s0)] is a genuine particular solution.
  if (n1 > tolerance) {
    const s0 = dotProduct(b, col1) / dotProduct(col1, col1);
    return [s0, 0];
  }
  const s0 = dotProduct(b, col2) / dotProduct(col2, col2);
  return [0, s0];
}

/**
 * The full solution set of `A x = b` as a discriminated structure. Consistent
 * systems return `x_p + Null(A)`; inconsistent systems return `{ kind: "empty" }`.
 */
export function solutionSet2x2(
  A: Matrix2x2,
  b: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): SolutionSet2x2 {
  const particular = particularSolution2x2(A, b, tolerance);
  if (particular === null) return { kind: "empty" };

  const cls = classifyLinearSystem2x2(A, b, tolerance);
  // Independent columns ⇒ Null(A) = {0} ⇒ exactly one solution. Do NOT call
  // nullspaceBasis2x2 here (it assumes a singular matrix).
  if (cls.independentColumns) return { kind: "point", particular };

  // Singular A: nullspaceBasis2x2 is valid. A = 0 ⇒ plane; rank 1 ⇒ line.
  const nul = nullspaceBasis2x2(A, tolerance);
  if (nul.kind === "plane") return { kind: "plane", particular };
  if (nul.kind === "line") return { kind: "line", particular, direction: nul.basis };
  // Defensive: a singular 2×2 always has a nontrivial null space, so this is
  // unreachable — treat any degenerate result as a single point.
  return { kind: "point", particular };
}

/**
 * `true` when two vectors differ by a homogeneous solution — i.e. their
 * difference lies in `Null(A)`. This is the discovery engine: any two solutions
 * of the same consistent system satisfy it.
 */
export function differenceLiesInNullspace(
  A: Matrix2x2,
  x1: Vector2,
  x2: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  const image = matrixVectorMultiply(A, subtractVectors(x1, x2));
  return magnitude(image) <= tolerance;
}

/**
 * Generate a solution from a known one by sliding `t` along a null direction:
 * `x_p + t·direction`. When `direction ∈ Null(A)` and `A x_p = b`, the result is
 * again a solution of `A x = b` for every `t` (proven by linearity).
 */
export function generateSolution(
  particular: Vector2,
  direction: Vector2,
  t: number,
): Vector2 {
  return addVectors(particular, scaleVector(direction, t));
}
