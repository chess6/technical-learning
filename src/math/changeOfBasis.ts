import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import {
  IDENTITY_MATRIX,
  determinant2x2,
  matrixMatrixMultiply,
  matrixTrace,
  matrixVectorMultiply,
} from "./matrices";
import { inverse2x2 } from "./matrixComposition";

/**
 * Coordinates in a chosen basis, and a map's matrix in that basis — the math
 * layer for Lesson 10 (`change-of-basis`).
 *
 * The lesson's whole point is that a matrix is a *description* relative to a
 * basis, so this module never lets a caller forget which direction it is
 * converting. `changeOfBasisMatrix` builds P with the new basis vectors as its
 * columns **written in standard coordinates**, which is what fixes the
 * direction: P takes B-coordinates TO standard coordinates, and P⁻¹ goes back.
 * That is not a convention to remember — it is readable off the columns, and the
 * function names say it out loud.
 *
 * A dependent pair is not a basis. Every function that would need P⁻¹ returns
 * `null` in that case rather than producing `Infinity` entries, so a caller has
 * to handle "not a basis" explicitly.
 */

/** P = [b₁ b₂], columns in standard coordinates. Always defined. */
export function changeOfBasisMatrix(
  first: Vector2,
  second: Vector2,
): Matrix2x2 {
  return [
    [first[0], second[0]],
    [first[1], second[1]],
  ];
}

/** Whether the pair is actually a basis (independent ⇔ P invertible). */
export function isBasis(
  first: Vector2,
  second: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  return Math.abs(determinant2x2(changeOfBasisMatrix(first, second))) > tolerance;
}

/**
 * `[x]_B` — the coordinates of `x` in the basis (first, second), i.e. the
 * weights `c` with `c₁·first + c₂·second = x`. Computed as `P⁻¹x`.
 *
 * Returns `null` when the pair is not a basis, where the weights either fail to
 * exist or fail to be unique.
 */
export function coordinatesInBasis(
  first: Vector2,
  second: Vector2,
  vector: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): Vector2 | null {
  const inverse = inverse2x2(changeOfBasisMatrix(first, second), tolerance);
  if (!inverse) return null;
  return matrixVectorMultiply(inverse, vector);
}

/**
 * The inverse conversion: given `[x]_B`, rebuild `x` in standard coordinates.
 * This is just `P` applied to the coordinate vector — the direction P was built
 * to go.
 */
export function fromCoordinatesInBasis(
  first: Vector2,
  second: Vector2,
  coordinates: Vector2,
): Vector2 {
  return matrixVectorMultiply(changeOfBasisMatrix(first, second), coordinates);
}

/**
 * `[A]_B = P⁻¹AP` — the same map, described in the basis (first, second).
 *
 * Read right to left, as Lesson 6 established: P translates a B-coordinate
 * vector into standard coordinates, A acts there, and P⁻¹ translates the answer
 * back. Returns `null` when the pair is not a basis.
 */
export function matrixInBasis(
  matrix: Matrix2x2,
  first: Vector2,
  second: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): Matrix2x2 | null {
  const p = changeOfBasisMatrix(first, second);
  const inverse = inverse2x2(p, tolerance);
  if (!inverse) return null;
  return matrixMatrixMultiply(inverse, matrixMatrixMultiply(matrix, p));
}

/** Whether every off-diagonal entry vanishes. */
export function isDiagonal(
  matrix: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  return Math.abs(matrix[0][1]) <= tolerance && Math.abs(matrix[1][0]) <= tolerance;
}

/**
 * The quantities that survive a change of basis, so a caller can display them
 * side by side for `A` and `[A]_B` and see they agree.
 *
 * These are properties of the MAP; the entries are properties of the
 * description. Note this is deliberately not a similarity *test*: equal
 * invariants do not imply similar matrices, and Lesson 10 stages that converse
 * as a misconception.
 */
export type SimilarityInvariants = {
  readonly determinant: number;
  readonly trace: number;
};

export function similarityInvariants(matrix: Matrix2x2): SimilarityInvariants {
  return { determinant: determinant2x2(matrix), trace: matrixTrace(matrix) };
}

/** The standard basis, for the degenerate `B = E` case. */
export const STANDARD_BASIS: readonly [Vector2, Vector2] = [
  [1, 0],
  [0, 1],
];

/** `P = I` exactly when the chosen basis is the standard one. */
export function isStandardBasis(
  first: Vector2,
  second: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  const p = changeOfBasisMatrix(first, second);
  return (
    Math.abs(p[0][0] - IDENTITY_MATRIX[0][0]) <= tolerance &&
    Math.abs(p[0][1] - IDENTITY_MATRIX[0][1]) <= tolerance &&
    Math.abs(p[1][0] - IDENTITY_MATRIX[1][0]) <= tolerance &&
    Math.abs(p[1][1] - IDENTITY_MATRIX[1][1]) <= tolerance
  );
}
