import { DEFAULT_TOLERANCE } from "./types";
import {
  rref,
  solveLinearSystem,
  type Matrix,
  type Vec,
} from "./linearSystemsGeneral";

/**
 * The two subspaces a linear map carries, and the count that measures them —
 * the math layer for Lesson 8 (`subspaces-rank`) and Lesson 9 (`rank-nullity`).
 *
 * The lesson's whole point is that these are TWO spaces living in DIFFERENT
 * ambient spaces, so this module keeps that explicit: `columnSpaceBasis` reports
 * `ambientDimension = m` (rows) and `nullSpaceBasis` reports `ambientDimension =
 * n` (columns). A caller that conflates them has to do so deliberately.
 *
 * The subtlest correctness point, and the lesson's staged trap: a basis of
 * `Col(A)` must be taken from the columns of **A itself**, never from its
 * reduced form. Row operations preserve the row space and the null space but
 * CHANGE the column space, so the reduced matrix's columns generally span
 * something else. `columnSpaceBasis` therefore indexes back into the original
 * matrix, and a property test asserts every returned vector is literally a
 * column of `A`.
 *
 * Nothing here reimplements elimination: rank, pivots and the null basis all
 * come from the shared `rref` / `solveLinearSystem`.
 */

/** Shape of the image of the unit cube/square under a map of rank `r`. */
export type ImageShape = "point" | "line" | "plane" | "solid";

export type SubspaceBasis = {
  /** Basis vectors, each of length `ambientDimension`. */
  readonly basis: readonly Vec[];
  /** Dimension of the subspace (= basis.length). */
  readonly dimension: number;
  /** Which R^k this subspace sits inside. */
  readonly ambientDimension: number;
};

function columnCount(matrix: Matrix): number {
  return matrix.length > 0 ? matrix[0]!.length : 0;
}

function zeros(length: number): number[] {
  return new Array<number>(length).fill(0);
}

/** Number of independent output directions — the pivot count. */
export function rankOf(matrix: Matrix, tolerance = DEFAULT_TOLERANCE): number {
  return rref(matrix, tolerance).pivotColumns.length;
}

/** `n − rank`, the number of free variables. */
export function nullityOf(matrix: Matrix, tolerance = DEFAULT_TOLERANCE): number {
  return columnCount(matrix) - rankOf(matrix, tolerance);
}

/** Indices of the pivot columns of `matrix`, in increasing order. */
export function pivotColumnsOf(
  matrix: Matrix,
  tolerance = DEFAULT_TOLERANCE,
): readonly number[] {
  return rref(matrix, tolerance).pivotColumns;
}

/**
 * A basis of `Col(A)`, taken from the **original** columns of `A` at the pivot
 * positions — never from the reduced matrix. Lives in R^m (m = row count).
 */
export function columnSpaceBasis(
  matrix: Matrix,
  tolerance = DEFAULT_TOLERANCE,
): SubspaceBasis {
  const rows = matrix.length;
  const pivots = pivotColumnsOf(matrix, tolerance);
  const basis = pivots.map((column) =>
    Array.from({ length: rows }, (_, row) => matrix[row]![column]!),
  );
  return { basis, dimension: basis.length, ambientDimension: rows };
}

/**
 * A basis of `Null(A)`, one vector per free variable. Lives in R^n (n = column
 * count). The zero subspace returns an empty basis with dimension 0 — not a
 * basis containing the zero vector, which would be linearly dependent.
 */
export function nullSpaceBasis(
  matrix: Matrix,
  tolerance = DEFAULT_TOLERANCE,
): SubspaceBasis {
  const n = columnCount(matrix);
  const solution = solveLinearSystem(matrix, zeros(matrix.length), tolerance);
  // A homogeneous system is always consistent, so `nullBasis` is always present;
  // fall back to the empty basis rather than assuming it.
  const basis = solution.nullBasis ?? [];
  return { basis, dimension: basis.length, ambientDimension: n };
}

/**
 * What the image of the unit cube/square looks like, given the rank. This is the
 * lesson's "collapse has degrees" reading, and it is deliberately a function of
 * rank ALONE — the shape does not depend on which particular directions survived.
 */
export function imageShape(rank: number): ImageShape {
  if (rank <= 0) return "point";
  if (rank === 1) return "line";
  if (rank === 2) return "plane";
  return "solid";
}

/**
 * Whether `vector` lies in `Col(A)` — i.e. whether `A x = vector` is solvable.
 * This is the existence question, phrased as membership in a subspace.
 */
export function isInColumnSpace(
  matrix: Matrix,
  vector: Vec,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  return solveLinearSystem(matrix, vector, tolerance).consistent;
}

/**
 * The rank–nullity accounting for one matrix: what went in, what survived, what
 * was crushed. Lesson 8 displays this as an observation; Lesson 9 makes it the
 * theorem. Kept as one object so the two lessons cannot drift apart.
 */
export type RankNullityCount = {
  /** Input dimension n (columns) — what the map is given. */
  readonly inputDimension: number;
  /** Output ambient dimension m (rows) — where the image lives. */
  readonly outputDimension: number;
  /** Dimensions that survived into the output. */
  readonly rank: number;
  /** Dimensions crushed to zero. */
  readonly nullity: number;
  /** rank + nullity, which must equal inputDimension. */
  readonly total: number;
  /** Whether the accounting balances (always true; a guard, not a question). */
  readonly balances: boolean;
};

export function rankNullityCount(
  matrix: Matrix,
  tolerance = DEFAULT_TOLERANCE,
): RankNullityCount {
  const inputDimension = columnCount(matrix);
  const rank = rankOf(matrix, tolerance);
  const nullity = inputDimension - rank;
  const total = rank + nullity;
  return {
    inputDimension,
    outputDimension: matrix.length,
    rank,
    nullity,
    total,
    balances: total === inputDimension,
  };
}
