import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import { approximatelyEqualVector } from "./vectors";

export const IDENTITY_MATRIX: Matrix2x2 = [
  [1, 0],
  [0, 1],
];

export function identityMatrix(): Matrix2x2 {
  return IDENTITY_MATRIX;
}

export function matrixVectorMultiply(m: Matrix2x2, v: Vector2): Vector2 {
  return [
    m[0][0] * v[0] + m[0][1] * v[1],
    m[1][0] * v[0] + m[1][1] * v[1],
  ];
}

/** Column `j` of A — equals A eⱼ₊₁ (j = 0 → A e₁, j = 1 → A e₂). */
export function matrixColumn(m: Matrix2x2, j: 0 | 1): Vector2 {
  return j === 0 ? [m[0][0], m[1][0]] : [m[0][1], m[1][1]];
}

export function matrixMatrixMultiply(a: Matrix2x2, b: Matrix2x2): Matrix2x2 {
  return [
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1],
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1],
    ],
  ];
}

export function determinant2x2(m: Matrix2x2): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

export function transpose2x2(m: Matrix2x2): Matrix2x2 {
  return [
    [m[0][0], m[1][0]],
    [m[0][1], m[1][1]],
  ];
}

export function applyMatrixToPoints(
  m: Matrix2x2,
  points: readonly Vector2[],
): Vector2[] {
  return points.map((point) => matrixVectorMultiply(m, point));
}

/** One grid line after mapping both endpoints through `m` (no slope derivation). */
export type TransformedGridSegment = {
  kind: "vertical" | "horizontal";
  index: number;
  point1: Vector2;
  point2: Vector2;
};

/**
 * Identity-space grid lines (x=k and y=k) with both endpoints transformed by
 * `matrixVectorMultiply`. Callers draw the segment between those images.
 */
export function transformedGridSegments(
  m: Matrix2x2,
  halfExtent: number,
): TransformedGridSegment[] {
  const segments: TransformedGridSegment[] = [];
  for (let k = -halfExtent; k <= halfExtent; k += 1) {
    segments.push({
      kind: "vertical",
      index: k,
      point1: matrixVectorMultiply(m, [k, -halfExtent]),
      point2: matrixVectorMultiply(m, [k, halfExtent]),
    });
    segments.push({
      kind: "horizontal",
      index: k,
      point1: matrixVectorMultiply(m, [-halfExtent, k]),
      point2: matrixVectorMultiply(m, [halfExtent, k]),
    });
  }
  return segments;
}

/** Corners of the unit square [0,1]×[0,1], in counterclockwise order from origin. */
export const UNIT_SQUARE: readonly Vector2[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

export function applyMatrixToUnitSquare(m: Matrix2x2): Vector2[] {
  return applyMatrixToPoints(m, UNIT_SQUARE);
}

export function approximatelyEqualMatrix(
  a: Matrix2x2,
  b: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  return (
    Math.abs(a[0][0] - b[0][0]) <= tolerance &&
    Math.abs(a[0][1] - b[0][1]) <= tolerance &&
    Math.abs(a[1][0] - b[1][0]) <= tolerance &&
    Math.abs(a[1][1] - b[1][1]) <= tolerance
  );
}

export function matrixTrace(m: Matrix2x2): number {
  return m[0][0] + m[1][1];
}

/** Whether Av ≈ λv within tolerance (used for eigenvector verification). */
export function verifiesEigenpair(
  m: Matrix2x2,
  eigenvalue: number,
  eigenvector: Vector2,
  tolerance = 1e-6,
): boolean {
  const Av = matrixVectorMultiply(m, eigenvector);
  const lambdaV: Vector2 = [
    eigenvalue * eigenvector[0],
    eigenvalue * eigenvector[1],
  ];
  return approximatelyEqualVector(Av, lambdaV, tolerance);
}
