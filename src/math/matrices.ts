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
