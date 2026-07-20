import { DEFAULT_TOLERANCE } from "./types";

/** Pure 3D types — no React, Three.js, or DOM. */
export type Vector3 = readonly [number, number, number];

export type Matrix3x3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

/**
 * Image dimension of a singular 3×3 map (rank of the matrix).
 * Used to describe how the unit cube collapses under A − λI:
 * plane (rank 2), line (rank 1), or origin (rank 0).
 */
export type CollapseDimension3 = "plane" | "line" | "origin";

export const IDENTITY_MATRIX_3: Matrix3x3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

export function matrixVectorMultiply3(m: Matrix3x3, v: Vector3): Vector3 {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

export function matrixMatrixMultiply3(a: Matrix3x3, b: Matrix3x3): Matrix3x3 {
  const col = (j: 0 | 1 | 2): Vector3 =>
    matrixVectorMultiply3(a, [b[0][j], b[1][j], b[2][j]]);
  const c0 = col(0);
  const c1 = col(1);
  const c2 = col(2);
  return [
    [c0[0], c1[0], c2[0]],
    [c0[1], c1[1], c2[1]],
    [c0[2], c1[2], c2[2]],
  ];
}

export function scaleMatrix3(m: Matrix3x3, scalar: number): Matrix3x3 {
  return [
    [m[0][0] * scalar, m[0][1] * scalar, m[0][2] * scalar],
    [m[1][0] * scalar, m[1][1] * scalar, m[1][2] * scalar],
    [m[2][0] * scalar, m[2][1] * scalar, m[2][2] * scalar],
  ];
}

export function addMatrices3(a: Matrix3x3, b: Matrix3x3): Matrix3x3 {
  return [
    [a[0][0] + b[0][0], a[0][1] + b[0][1], a[0][2] + b[0][2]],
    [a[1][0] + b[1][0], a[1][1] + b[1][1], a[1][2] + b[1][2]],
    [a[2][0] + b[2][0], a[2][1] + b[2][1], a[2][2] + b[2][2]],
  ];
}

/** det(A) via the standard 3×3 expansion. */
export function determinant3x3(m: Matrix3x3): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

/** A − λI. */
export function matrixShift3(m: Matrix3x3, lambda: number): Matrix3x3 {
  return [
    [m[0][0] - lambda, m[0][1], m[0][2]],
    [m[1][0], m[1][1] - lambda, m[1][2]],
    [m[2][0], m[2][1], m[2][2] - lambda],
  ];
}

export function magnitude3(v: Vector3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

export function scaleVector3(v: Vector3, scalar: number): Vector3 {
  return [v[0] * scalar, v[1] * scalar, v[2] * scalar];
}

export function approximatelyEqualVector3(
  a: Vector3,
  b: Vector3,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance
  );
}

export function approximatelyEqualMatrix3(
  a: Matrix3x3,
  b: Matrix3x3,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      if (Math.abs(a[i]![j]! - b[i]![j]!) > tolerance) return false;
    }
  }
  return true;
}

/**
 * Normalize a 3D vector to unit length.
 * Returns null for the zero vector (no well-defined direction).
 */
export function normalizeVector3(
  v: Vector3,
  tolerance = DEFAULT_TOLERANCE,
): Vector3 | null {
  const mag = magnitude3(v);
  if (mag <= tolerance) return null;
  return [v[0] / mag, v[1] / mag, v[2] / mag];
}

/**
 * Numerical rank of a 3×3 matrix via Gaussian elimination with partial pivoting.
 * Tolerance is absolute on pivot size after row swaps.
 */
export function rank3x3(m: Matrix3x3, tolerance = 1e-8): number {
  const a: number[][] = [
    [m[0][0], m[0][1], m[0][2]],
    [m[1][0], m[1][1], m[1][2]],
    [m[2][0], m[2][1], m[2][2]],
  ];
  let rank = 0;
  const usedCols = new Set<number>();

  for (let row = 0; row < 3; row += 1) {
    let pivotRow = -1;
    let pivotCol = -1;
    let best = tolerance;
    for (let i = row; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        if (usedCols.has(j)) continue;
        const abs = Math.abs(a[i]![j]!);
        if (abs > best) {
          best = abs;
          pivotRow = i;
          pivotCol = j;
        }
      }
    }
    if (pivotRow < 0 || pivotCol < 0) break;

    if (pivotRow !== row) {
      const tmp = a[row]!;
      a[row] = a[pivotRow]!;
      a[pivotRow] = tmp;
    }
    usedCols.add(pivotCol);
    rank += 1;

    const pivot = a[row]![pivotCol]!;
    for (let j = 0; j < 3; j += 1) {
      a[row]![j]! /= pivot;
    }
    for (let i = 0; i < 3; i += 1) {
      if (i === row) continue;
      const factor = a[i]![pivotCol]!;
      for (let j = 0; j < 3; j += 1) {
        a[i]![j]! -= factor * a[row]![j]!;
      }
    }
  }
  return rank;
}

/** Nullity = 3 − rank. */
export function nullity3x3(m: Matrix3x3, tolerance = 1e-8): number {
  return 3 - rank3x3(m, tolerance);
}

/**
 * Collapse dimension of the image of the unit cube under a singular map:
 * rank 2 → plane, rank 1 → line, rank 0 → origin.
 * Returns null when the map is full rank (no volume collapse).
 */
export function collapseDimension3(
  m: Matrix3x3,
  tolerance = 1e-8,
): CollapseDimension3 | null {
  const rank = rank3x3(m, tolerance);
  if (rank === 3) return null;
  if (rank === 2) return "plane";
  if (rank === 1) return "line";
  return "origin";
}

/** Corners of the unit cube [0,1]³. */
export const UNIT_CUBE: readonly Vector3[] = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1],
];

export function applyMatrixToPoints3(
  m: Matrix3x3,
  points: readonly Vector3[],
): Vector3[] {
  return points.map((point) => matrixVectorMultiply3(m, point));
}

export function applyMatrixToUnitCube(m: Matrix3x3): Vector3[] {
  return applyMatrixToPoints3(m, UNIT_CUBE);
}
