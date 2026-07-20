import { DEFAULT_TOLERANCE } from "./types";
import {
  approximatelyEqualVector3,
  magnitude3,
  matrixShift3,
  matrixVectorMultiply3,
  normalizeVector3,
  scaleVector3,
  type Matrix3x3,
  type Vector3,
} from "./matrices3";

/**
 * Whether Av ≈ λv within tolerance.
 * The zero vector is never an eigenvector.
 */
export function verifiesEigenpair3(
  m: Matrix3x3,
  eigenvalue: number,
  eigenvector: Vector3,
  tolerance = 1e-6,
): boolean {
  if (magnitude3(eigenvector) <= tolerance) return false;
  const Av = matrixVectorMultiply3(m, eigenvector);
  const lambdaV = scaleVector3(eigenvector, eigenvalue);
  return approximatelyEqualVector3(Av, lambdaV, tolerance);
}

/**
 * Cross product — used to extract a nullspace direction from two independent rows.
 */
function cross(a: Vector3, b: Vector3): Vector3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * One safe-normalized nullspace direction of A − λI for a *declared* eigenvalue.
 *
 * This is not a general cubic eigen solver: the caller must supply λ that is
 * known to be an eigenvalue. Returns null when the nullspace is empty or
 * unexpectedly higher-dimensional (plane/full) and no unique line can be chosen
 * without inventing a second independent direction.
 *
 * Prefer the cross product of the two largest-magnitude independent rows so the
 * result is stable for rank-2 shifts (nullity 1).
 */
export function eigenDirectionForEigenvalue3(
  m: Matrix3x3,
  lambda: number,
  tolerance = Math.max(DEFAULT_TOLERANCE, 1e-8),
): Vector3 | null {
  const shifted = matrixShift3(m, lambda);
  const rows: Vector3[] = [
    [shifted[0][0], shifted[0][1], shifted[0][2]],
    [shifted[1][0], shifted[1][1], shifted[1][2]],
    [shifted[2][0], shifted[2][1], shifted[2][2]],
  ];

  // Sort rows by magnitude descending; pick the two strongest independent ones.
  const ordered = [...rows].sort(
    (a, b) => magnitude3(b) - magnitude3(a),
  );
  const strong = ordered.filter((row) => magnitude3(row) > tolerance);
  if (strong.length === 0) {
    // A − λI ≈ 0 → every direction is an eigendirection; refuse to invent one.
    return null;
  }

  let candidate: Vector3 | null = null;
  if (strong.length === 1) {
    // Rank 1: nullspace is a plane — refuse to invent a unique line.
    return null;
  }

  // Try pairs of strong rows; the first with a nonzero cross product wins.
  for (let i = 0; i < strong.length; i += 1) {
    for (let j = i + 1; j < strong.length; j += 1) {
      const c = cross(strong[i]!, strong[j]!);
      if (magnitude3(c) > tolerance) {
        candidate = c;
        break;
      }
    }
    if (candidate) break;
  }
  if (!candidate) return null;

  // Orient consistently: prefer positive first nonzero component.
  if (
    candidate[0] < -tolerance ||
    (Math.abs(candidate[0]) <= tolerance && candidate[1] < -tolerance) ||
    (Math.abs(candidate[0]) <= tolerance &&
      Math.abs(candidate[1]) <= tolerance &&
      candidate[2] < 0)
  ) {
    candidate = scaleVector3(candidate, -1);
  }

  return normalizeVector3(candidate, tolerance);
}
