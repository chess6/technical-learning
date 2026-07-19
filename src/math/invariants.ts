/**
 * Test-oriented mathematical invariants for visualizations.
 * Pure math only — no Mafs / Motion Canvas / DOM types.
 */
import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import {
  approximatelyEqualVector,
  areParallel,
  magnitude,
} from "./vectors";
import {
  applyMatrixToUnitSquare,
  determinant2x2,
  matrixColumn,
  matrixVectorMultiply,
  transformedGridSegments,
  type TransformedGridSegment,
  verifiesEigenpair,
} from "./matrices";

function fail(message: string): never {
  throw new Error(message);
}

function formatVec(v: Vector2): string {
  return `(${v[0]}, ${v[1]})`;
}

/** A e₁ / A e₂ must equal the matrix columns. */
export function assertTransformedBasisMatchesColumns(
  matrix: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): void {
  const ae1 = matrixVectorMultiply(matrix, [1, 0]);
  const ae2 = matrixVectorMultiply(matrix, [0, 1]);
  const c1 = matrixColumn(matrix, 0);
  const c2 = matrixColumn(matrix, 1);
  if (!approximatelyEqualVector(ae1, c1, tolerance)) {
    fail(`A e1 ${formatVec(ae1)} !== column1 ${formatVec(c1)}`);
  }
  if (!approximatelyEqualVector(ae2, c2, tolerance)) {
    fail(`A e2 ${formatVec(ae2)} !== column2 ${formatVec(c2)}`);
  }
}

/**
 * Identity-space x=k lines ("vertical" kind) → parallel to A e₂.
 * Identity-space y=k lines ("horizontal" kind) → parallel to A e₁.
 */
export function assertGridDirectionMatchesBasis(
  matrix: Matrix2x2,
  gridSegments: readonly TransformedGridSegment[],
  tolerance = DEFAULT_TOLERANCE,
): void {
  const e1 = matrixColumn(matrix, 0);
  const e2 = matrixColumn(matrix, 1);

  for (const seg of gridSegments) {
    const dir: Vector2 = [
      seg.point2[0] - seg.point1[0],
      seg.point2[1] - seg.point1[1],
    ];
    if (magnitude(dir) <= tolerance) {
      // Degenerate segment (e.g. total collapse) — skip direction check.
      continue;
    }
    const expected = seg.kind === "vertical" ? e2 : e1;
    if (magnitude(expected) <= tolerance) {
      // Basis collapsed; segment should also be near-zero (handled above) or
      // share that collapse — still require parallelism with the (near-)zero
      // column via cross product ≈ 0, which areParallel allows with zero.
    }
    if (!areParallel(dir, expected, tolerance)) {
      fail(
        `grid ${seg.kind} k=${seg.index} direction ${formatVec(dir)} ` +
          `is not parallel to ${seg.kind === "vertical" ? "A e2" : "A e1"} ` +
          `${formatVec(expected)}`,
      );
    }
  }
}

export function assertPointMatchesMatrixTransform(
  matrix: Matrix2x2,
  original: Vector2,
  transformed: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): void {
  const expected = matrixVectorMultiply(matrix, original);
  if (!approximatelyEqualVector(transformed, expected, tolerance)) {
    fail(
      `transform of ${formatVec(original)}: got ${formatVec(transformed)}, ` +
        `expected ${formatVec(expected)}`,
    );
  }
}

/** Transformed unit-square parallelogram area equals |det(A)|. */
export function assertUnitSquareAreaMatchesDeterminant(
  matrix: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): void {
  const corners = applyMatrixToUnitSquare(matrix);
  // Origin → e1 → e1+e2 → e2 (UNIT_SQUARE order).
  const e1 = corners[1];
  const e1PlusE2 = corners[2];
  const e2 = corners[3];
  const sum: Vector2 = [e1[0] + e2[0], e1[1] + e2[1]];
  if (!approximatelyEqualVector(e1PlusE2, sum, tolerance)) {
    fail(
      `unit-square image is not a parallelogram: e1+e2=${formatVec(sum)} ` +
        `but corner=${formatVec(e1PlusE2)}`,
    );
  }
  const area = Math.abs(e1[0] * e2[1] - e1[1] * e2[0]);
  const expected = Math.abs(determinant2x2(matrix));
  if (Math.abs(area - expected) > tolerance) {
    fail(`unit-square area ${area} !== |det| ${expected}`);
  }
}

export function assertEigenpair(
  matrix: Matrix2x2,
  eigenvalue: number,
  eigenvector: Vector2,
  tolerance = 1e-6,
): void {
  if (magnitude(eigenvector) <= DEFAULT_TOLERANCE) {
    fail("zero vector is never an eigenvector");
  }
  if (!verifiesEigenpair(matrix, eigenvalue, eigenvector, tolerance)) {
    const Av = matrixVectorMultiply(matrix, eigenvector);
    fail(
      `A v ≉ λ v: Av=${formatVec(Av)}, λv=${formatVec([
        eigenvalue * eigenvector[0],
        eigenvalue * eigenvector[1],
      ])}`,
    );
  }
}

/** Convenience: build segments and run basis + grid direction invariants. */
export function assertTransformedGridInvariants(
  matrix: Matrix2x2,
  halfExtent = 3,
  tolerance = DEFAULT_TOLERANCE,
): void {
  assertTransformedBasisMatchesColumns(matrix, tolerance);
  const segments = transformedGridSegments(matrix, halfExtent);
  assertGridDirectionMatchesBasis(matrix, segments, tolerance);
  for (const seg of segments) {
    const original1: Vector2 =
      seg.kind === "vertical"
        ? [seg.index, -halfExtent]
        : [-halfExtent, seg.index];
    const original2: Vector2 =
      seg.kind === "vertical"
        ? [seg.index, halfExtent]
        : [halfExtent, seg.index];
    assertPointMatchesMatrixTransform(matrix, original1, seg.point1, tolerance);
    assertPointMatchesMatrixTransform(matrix, original2, seg.point2, tolerance);
  }
  assertUnitSquareAreaMatchesDeterminant(matrix, tolerance);
}

/** Direction of a grid family (from first non-degenerate segment of that kind). */
export function gridFamilyDirection(
  segments: readonly TransformedGridSegment[],
  kind: "vertical" | "horizontal",
  tolerance = DEFAULT_TOLERANCE,
): Vector2 | null {
  for (const seg of segments) {
    if (seg.kind !== kind) continue;
    const dir: Vector2 = [
      seg.point2[0] - seg.point1[0],
      seg.point2[1] - seg.point1[1],
    ];
    if (magnitude(dir) > tolerance) return dir;
  }
  return null;
}
