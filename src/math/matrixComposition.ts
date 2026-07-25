import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import {
  IDENTITY_MATRIX,
  approximatelyEqualMatrix,
  determinant2x2,
  matrixColumn,
  matrixMatrixMultiply,
  matrixVectorMultiply,
} from "./matrices";
import { solveLinearSystem2x2 } from "./systems";

/**
 * Composition and inversion of 2×2 maps — the math layer for Lesson 6
 * (`matrix-composition`).
 *
 * The lesson's insight is that the product is not a fresh recipe but the columns
 * rule fired twice: **column `j` of `AB` is `A` applied to column `j` of `B`**
 * (docs/courses/linear-algebra/lessons/06-matrix-composition/insight.md §6c).
 * This module keeps that identity as a first-class, testable function
 * (`productColumn`) rather than leaving it implicit inside
 * `matrixMatrixMultiply`, so the scene, the explorer, and the worked example all
 * read the *intermediate* the lesson actually teaches.
 *
 * Inversion is likewise exposed twice, deliberately:
 *
 *  - `inverseColumns` builds `A⁻¹` the way the lesson derives it — by solving
 *    `A x = e₁` and `A x = e₂` (§6h);
 *  - `inverse2x2` returns the closed form `1/(ad−bc) · [[d, −b], [−c, a]]` (§6j).
 *
 * A property test asserts the two agree, which is what makes the derivation
 * honest rather than asserted. Both return `null` on a singular matrix — never
 * `Infinity` or `NaN` — so callers must handle collapse explicitly.
 *
 * No pixel/y-flip mapping happens here; coordinates stay in math space.
 */

/**
 * Column `j` of `AB`, computed as `A · col_j(B)` — the lesson's method-specific
 * intermediate, not a shortcut for the whole product.
 */
export function productColumn(
  a: Matrix2x2,
  b: Matrix2x2,
  j: 0 | 1,
): Vector2 {
  return matrixVectorMultiply(a, matrixColumn(b, j));
}

/**
 * Whether `A` can be undone. True exactly when the columns are independent —
 * equivalently `Null(A) = {0}`, equivalently `ad − bc ≠ 0`. The tolerance guards
 * a slider-driven explorer from flickering across an exact zero.
 */
export function isInvertible2x2(
  m: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  return Math.abs(determinant2x2(m)) > tolerance;
}

/**
 * The two columns of `A⁻¹`, derived the way the lesson derives them: column `j`
 * is the solution of `A x = e_j`. Returns `null` when `A` is singular, i.e. when
 * at least one of those systems has no unique solution.
 *
 * This is the *constructive* inverse. `inverse2x2` is the closed form; a
 * property test pins them together.
 */
export function inverseColumns(
  m: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): { readonly first: Vector2; readonly second: Vector2 } | null {
  const first = solveLinearSystem2x2(m, [1, 0], tolerance);
  const second = solveLinearSystem2x2(m, [0, 1], tolerance);
  if (!first || !second) return null;
  return { first, second };
}

/**
 * `A⁻¹` in closed form, or `null` when `A` is singular.
 *
 * Deliberately NOT `1/det` times an adjugate computed inline by a caller: the
 * singular case must be a `null` the type system forces callers to handle, not a
 * matrix full of `Infinity`.
 */
export function inverse2x2(
  m: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): Matrix2x2 | null {
  const det = determinant2x2(m);
  if (Math.abs(det) <= tolerance) return null;
  const [[a, b], [c, d]] = m;
  return [
    [unsigned(d / det), unsigned(-b / det)],
    [unsigned(-c / det), unsigned(a / det)],
  ];
}

/**
 * Collapse `-0` to `0`. The adjugate negates two entries, so a zero entry comes
 * back as `-0` — arithmetically identical but rendered as "−0" in a matrix
 * readout, which reads as a sign error to a learner. Normalize at the source
 * rather than in each renderer.
 */
function unsigned(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

/** Whether `AB = BA` within tolerance — used to bound "order always matters". */
export function commutes(
  a: Matrix2x2,
  b: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  return approximatelyEqualMatrix(
    matrixMatrixMultiply(a, b),
    matrixMatrixMultiply(b, a),
    tolerance,
  );
}

/**
 * A nonzero vector that a singular `A` sends to `0` — the witness that two
 * distinct inputs share an output, so no function can undo the map. Returns
 * `null` when `A` is invertible (its null space is `{0}`, which has no nonzero
 * witness) and when `A = 0` is handled by returning `e₁`, which `A` does kill.
 *
 * For `A = [[a, b], [c, d]]` with `ad − bc = 0`, both `(−b, a)` and `(d, −c)`
 * lie in the null space; at least one is nonzero unless `A = 0`.
 */
export function collapseWitness2x2(
  m: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): Vector2 | null {
  if (isInvertible2x2(m, tolerance)) return null;
  const [[a, b], [c, d]] = m;
  const candidates: readonly Vector2[] = [
    [-b, a],
    [d, -c],
    [1, 0],
  ];
  for (const candidate of candidates) {
    if (Math.hypot(candidate[0], candidate[1]) <= tolerance) continue;
    const image = matrixVectorMultiply(m, candidate);
    if (Math.hypot(image[0], image[1]) <= tolerance) return candidate;
  }
  // Unreachable for a singular 2×2: `A = 0` is caught by the `(1, 0)` candidate.
  return null;
}

/**
 * Compose maps in **application order**: `composeInOrder([B, A])` is "apply `B`,
 * then `A`", which is the matrix `AB`. Named for the order the learner *acts* in,
 * because the notation runs the other way and that reversal is exactly the
 * lesson's staged misconception.
 */
export function composeInOrder(
  applicationOrder: readonly Matrix2x2[],
): Matrix2x2 {
  return applicationOrder.reduce<Matrix2x2>(
    (accumulated, next) => matrixMatrixMultiply(next, accumulated),
    IDENTITY_MATRIX,
  );
}
