import {
  DEFAULT_TOLERANCE,
  type EigenAnalysis2x2,
  type EigenPair,
  type Matrix2x2,
  type Vector2,
} from "./types";
import {
  approximatelyEqualMatrix,
  determinant2x2,
  matrixTrace,
} from "./matrices";
import { magnitude, normalizeVector } from "./vectors";

/**
 * Discriminant of the characteristic polynomial λ² − (tr)λ + det = 0:
 * Δ = tr² − 4 det.
 */
export function discriminant2x2(m: Matrix2x2): number {
  const tr = matrixTrace(m);
  return tr * tr - 4 * determinant2x2(m);
}

/**
 * Find one (or all, for scalar matrices) real eigenvector direction(s) for λ.
 * Returns an empty array only if the nullspace is unexpectedly empty given
 * floating-point noise — callers treat that as complex/failed.
 */
function nullspaceForEigenvalue(
  m: Matrix2x2,
  lambda: number,
  tolerance: number,
): Vector2[] {
  const a = m[0][0] - lambda;
  const b = m[0][1];
  const c = m[1][0];
  const d = m[1][1] - lambda;

  // If A − λI ≈ 0, every nonzero vector is an eigenvector.
  if (
    Math.abs(a) <= tolerance &&
    Math.abs(b) <= tolerance &&
    Math.abs(c) <= tolerance &&
    Math.abs(d) <= tolerance
  ) {
    return [
      [1, 0],
      [0, 1],
    ];
  }

  // Prefer the row with larger magnitude for numerical stability.
  const row1Mag = Math.hypot(a, b);
  const row2Mag = Math.hypot(c, d);

  let candidate: Vector2;
  if (row1Mag >= row2Mag && row1Mag > tolerance) {
    // a x + b y = 0 → direction (−b, a) or (b, −a)
    candidate = Math.abs(b) >= Math.abs(a) ? [-b, a] : [b, -a];
    if (magnitude(candidate) <= tolerance) {
      candidate = [-b, a];
    }
  } else if (row2Mag > tolerance) {
    candidate = Math.abs(d) >= Math.abs(c) ? [-d, c] : [d, -c];
    if (magnitude(candidate) <= tolerance) {
      candidate = [-d, c];
    }
  } else {
    return [];
  }

  // Orient consistently: prefer positive first component, else positive second.
  if (candidate[0] < -tolerance || (Math.abs(candidate[0]) <= tolerance && candidate[1] < 0)) {
    candidate = [-candidate[0], -candidate[1]];
  }

  const unit = normalizeVector(candidate, tolerance);
  return unit ? [unit] : [];
}

function distinctRealPairs(
  m: Matrix2x2,
  disc: number,
  tolerance: number,
): EigenPair[] {
  const tr = matrixTrace(m);
  const sqrtDisc = Math.sqrt(Math.max(0, disc));
  const lambda1 = (tr + sqrtDisc) / 2;
  const lambda2 = (tr - sqrtDisc) / 2;

  const v1 = nullspaceForEigenvalue(m, lambda1, tolerance)[0];
  const v2 = nullspaceForEigenvalue(m, lambda2, tolerance)[0];

  const pairs: EigenPair[] = [];
  if (v1) pairs.push({ eigenvalue: lambda1, eigenvector: v1 });
  if (v2) pairs.push({ eigenvalue: lambda2, eigenvector: v2 });
  return pairs;
}

/**
 * Real eigen analysis for a 2×2 matrix.
 *
 * - Distinct real: two eigenpairs (when both directions resolve).
 * - Repeated real: either A ≈ λI (diagonalizable, full-plane eigenspace) or
 *   defective (one eigendirection only — never invent a second independent vector).
 * - Complex: no real eigenvectors; reports real part and |Im(λ)|.
 */
export function analyzeEigen2x2(
  m: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): EigenAnalysis2x2 {
  const disc = discriminant2x2(m);
  const tr = matrixTrace(m);

  if (disc > tolerance) {
    const pairs = distinctRealPairs(m, disc, tolerance);
    if (pairs.length === 2) {
      return { kind: "distinct-real", pairs };
    }
    // Degenerate floating-point fallthrough: treat as repeated.
  }

  if (disc < -tolerance) {
    const imag = Math.sqrt(-disc) / 2;
    return {
      kind: "complex",
      realPart: tr / 2,
      imaginaryMagnitude: imag,
    };
  }

  // |disc| ≤ tolerance → repeated real eigenvalue λ = tr/2.
  // For 2×2 matrices, diagonalizable with repeated λ iff A = λI.
  const lambda = tr / 2;
  const scalar: Matrix2x2 = [
    [lambda, 0],
    [0, lambda],
  ];

  if (approximatelyEqualMatrix(m, scalar, Math.max(tolerance, 1e-8))) {
    return {
      kind: "repeated-real",
      eigenvalue: lambda,
      eigenspaceBasis: [
        [1, 0],
        [0, 1],
      ],
      diagonalizable: true,
    };
  }

  const basis = nullspaceForEigenvalue(m, lambda, Math.max(tolerance, 1e-8));
  return {
    kind: "repeated-real",
    eigenvalue: lambda,
    eigenspaceBasis: basis.length > 0 ? [basis[0]!] : [[1, 0]],
    diagonalizable: false,
  };
}

/** Convenience: real eigenvalues only, empty when complex. */
export function realEigenvalues(m: Matrix2x2, tolerance = DEFAULT_TOLERANCE): number[] {
  const analysis = analyzeEigen2x2(m, tolerance);
  switch (analysis.kind) {
    case "distinct-real":
      return analysis.pairs.map((pair) => pair.eigenvalue);
    case "repeated-real":
      return [analysis.eigenvalue];
    case "complex":
      return [];
  }
}
