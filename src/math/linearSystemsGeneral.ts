/**
 * General (m×n) linear-system utilities — the source of truth for the Package G
 * concrete P2 applied slice (fresh 3×3 and rectangular systems). Deliberately
 * kept separate from the 2×2 helpers (`systems.ts`, `solutionSets.ts`) which stay
 * the source of truth for the lesson explorers/scenes.
 *
 * Everything here is pure, tolerance-aware, and reused by the `solution-set`
 * grading capability so no linear algebra is reimplemented in UI/grading code.
 * Scope is concrete finite systems: RREF, consistency, pivot/free-variable
 * identification, a particular solution, and a null-space basis — NOT a general
 * ℝⁿ rank–nullity theory surface (that stays owned by the future L8/L9 module).
 */

import { DEFAULT_TOLERANCE } from "./types";

export type Matrix = readonly (readonly number[])[];
export type Vec = readonly number[];

export interface GeneralLinearSolution {
  /** False iff elimination hits a contradiction row `[0 … 0 | c≠0]` ⇒ ∅. */
  consistent: boolean;
  /** rank(A) — number of pivot columns among the coefficient columns. */
  rank: number;
  /** n − rank when consistent; the number of free variables. */
  freeCount: number;
  /** Pivot coefficient-column indices (0-based, ascending). */
  pivotColumns: number[];
  /** Free coefficient-column indices (0-based, ascending). */
  freeColumns: number[];
  /** A particular solution (free variables set to 0); present iff consistent. */
  particular?: number[];
  /** A basis for Null(A) — length === `freeCount`; present iff consistent. */
  nullBasis?: number[][];
}

/** A × x for A (m×n) and x (length n). */
export function matVec(matrix: Matrix, x: Vec): number[] {
  return matrix.map((row) => row.reduce((sum, a, j) => sum + a * (x[j] ?? 0), 0));
}

/** Whether x solves A x = b within tolerance. */
export function solves(matrix: Matrix, rhs: Vec, x: Vec, tol = DEFAULT_TOLERANCE): boolean {
  const product = matVec(matrix, x);
  if (product.length !== rhs.length) return false;
  return product.every((value, i) => Math.abs(value - (rhs[i] ?? 0)) <= tol);
}

/** Whether v lies in Null(A): A v = 0 within tolerance. */
export function inNullSpace(matrix: Matrix, v: Vec, tol = DEFAULT_TOLERANCE): boolean {
  return matVec(matrix, v).every((value) => Math.abs(value) <= tol);
}

/** Euclidean length of an n-vector. */
export function magnitudeN(v: Vec): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

/**
 * Reduced row echelon form of an m×cols matrix (mutates a copy), returning the
 * reduced matrix and its pivot column indices (Gauss–Jordan, partial pivoting).
 */
export function rref(
  input: Matrix,
  tol = DEFAULT_TOLERANCE,
): { matrix: number[][]; pivotColumns: number[] } {
  const M = input.map((row) => [...row]);
  const rows = M.length;
  const cols = rows > 0 ? M[0]!.length : 0;
  const pivotColumns: number[] = [];
  let pivotRow = 0;
  for (let col = 0; col < cols && pivotRow < rows; col += 1) {
    // Choose the row with the largest magnitude entry in this column (stability).
    let best = pivotRow;
    for (let r = pivotRow + 1; r < rows; r += 1) {
      if (Math.abs(M[r]![col]!) > Math.abs(M[best]![col]!)) best = r;
    }
    if (Math.abs(M[best]![col]!) <= tol) continue; // no pivot in this column
    [M[pivotRow], M[best]] = [M[best]!, M[pivotRow]!];
    const pivotValue = M[pivotRow]![col]!;
    for (let j = 0; j < cols; j += 1) M[pivotRow]![j] = M[pivotRow]![j]! / pivotValue;
    for (let r = 0; r < rows; r += 1) {
      if (r === pivotRow) continue;
      const factor = M[r]![col]!;
      if (Math.abs(factor) > tol) {
        for (let j = 0; j < cols; j += 1) M[r]![j] = M[r]![j]! - factor * M[pivotRow]![j]!;
      }
    }
    pivotColumns.push(col);
    pivotRow += 1;
  }
  return { matrix: M, pivotColumns };
}

/**
 * Solve A x = b for a concrete m×n system. Consistency, pivot/free columns, a
 * particular solution (free vars = 0), and a null-space basis are all derived
 * from the RREF of the augmented matrix `[A | b]`.
 */
export function solveLinearSystem(
  matrix: Matrix,
  rhs: Vec,
  tol = DEFAULT_TOLERANCE,
): GeneralLinearSolution {
  const m = matrix.length;
  const n = m > 0 ? matrix[0]!.length : 0;
  const augmented = matrix.map((row, i) => [...row, rhs[i] ?? 0]);
  const { matrix: R, pivotColumns } = rref(augmented, tol);

  // A pivot in the augmented (last) column is a contradiction row ⇒ inconsistent.
  const augColumn = n;
  const consistent = !pivotColumns.includes(augColumn);
  const coeffPivots = pivotColumns.filter((c) => c < n);
  const rank = coeffPivots.length;
  const freeColumns: number[] = [];
  for (let c = 0; c < n; c += 1) if (!coeffPivots.includes(c)) freeColumns.push(c);
  const freeCount = n - rank;

  if (!consistent) {
    return { consistent, rank, freeCount, pivotColumns: coeffPivots, freeColumns };
  }

  // Pivot rows are the first `rank` rows of the RREF, in pivot-column order.
  const particular = new Array<number>(n).fill(0);
  for (let k = 0; k < rank; k += 1) particular[coeffPivots[k]!] = R[k]![augColumn]!;

  const nullBasis: number[][] = freeColumns.map((freeCol) => {
    const v = new Array<number>(n).fill(0);
    v[freeCol] = 1;
    for (let k = 0; k < rank; k += 1) v[coeffPivots[k]!] = -R[k]![freeCol]!;
    return v;
  });

  return {
    consistent,
    rank,
    freeCount,
    pivotColumns: coeffPivots,
    freeColumns,
    particular,
    nullBasis,
  };
}

/** The augmented matrix `[A | b]` (m×(n+1)). */
export function augmentedMatrix(matrix: Matrix, rhs: Vec): number[][] {
  return matrix.map((row, i) => [...row, rhs[i] ?? 0]);
}

/**
 * Two matrices of the same shape are row-equivalent iff they share the same RREF.
 * Used to accept ANY mathematically valid row reduction a learner produces (not
 * one canonical form).
 */
export function areRowEquivalent(a: Matrix, b: Matrix, tol = DEFAULT_TOLERANCE): boolean {
  if (a.length !== b.length) return false;
  if (a.length === 0) return true;
  const aCols = a[0]!.length;
  const bCols = b[0]!.length;
  if (aCols !== bCols) return false;
  const ra = rref(a, tol).matrix;
  const rb = rref(b, tol).matrix;
  const eps = 1e-6;
  for (let i = 0; i < ra.length; i += 1) {
    for (let j = 0; j < aCols; j += 1) {
      if (Math.abs(ra[i]![j]! - rb[i]![j]!) > eps) return false;
    }
  }
  return true;
}

/**
 * Row-echelon form (REF or RREF): every all-zero row sits below every nonzero
 * row, and each row's leading (leftmost nonzero) entry is strictly to the right
 * of the row above it. Echelon form is NOT unique — this accepts any valid one.
 */
export function isRowEchelonForm(matrix: Matrix, tol = DEFAULT_TOLERANCE): boolean {
  let lastLead = -1;
  let sawZeroRow = false;
  for (const row of matrix) {
    let lead = -1;
    for (let j = 0; j < row.length; j += 1) {
      if (Math.abs(row[j]!) > tol) {
        lead = j;
        break;
      }
    }
    if (lead === -1) {
      sawZeroRow = true;
      continue;
    }
    if (sawZeroRow) return false; // a nonzero row appears below a zero row
    if (lead <= lastLead) return false; // leading entry not strictly to the right
    lastLead = lead;
  }
  return true;
}

/**
 * Whether an augmented matrix (with `coeffCols` coefficient columns, so the last
 * column is the RHS) contains a contradiction row `[0 … 0 | c]` with `c ≠ 0`,
 * i.e. the row-reduced witness of inconsistency (⇒ ∅).
 */
export function hasContradictionRow(
  augmented: Matrix,
  coeffCols: number,
  tol = DEFAULT_TOLERANCE,
): boolean {
  return augmented.some((row) => {
    let coeffsAllZero = true;
    for (let j = 0; j < coeffCols; j += 1) {
      if (Math.abs(row[j] ?? 0) > tol) {
        coeffsAllZero = false;
        break;
      }
    }
    const rhsNonzero = Math.abs(row[coeffCols] ?? 0) > tol;
    return coeffsAllZero && rhsNonzero;
  });
}

/** Rank of a set of vectors (rows), via RREF pivot count. */
export function vectorSetRank(vectors: readonly Vec[], tol = DEFAULT_TOLERANCE): number {
  if (vectors.length === 0) return 0;
  return rref(vectors.map((v) => [...v]), tol).pivotColumns.length;
}

/** Whether a set of vectors is linearly independent. */
export function areLinearlyIndependent(vectors: readonly Vec[], tol = DEFAULT_TOLERANCE): boolean {
  return vectors.length > 0 && vectorSetRank(vectors, tol) === vectors.length;
}
