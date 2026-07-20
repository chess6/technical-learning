import {
  DEFAULT_TOLERANCE,
  type EigenAnalysis2x2,
  type EigenPair,
  type Matrix2x2,
  type Subspace2D,
  type Vector2,
} from "./types";
import {
  approximatelyEqualMatrix,
  determinant2x2,
  matrixTrace,
} from "./matrices";
import { magnitude, normalizeVector } from "./vectors";

export type CharacteristicPolynomial2x2 = {
  readonly coefficients: {
    readonly a: number;
    readonly b: number;
    readonly c: number;
  };
  readonly trace: number;
  readonly determinant: number;
};

export type EigenDerivationStep2x2 = {
  readonly lambda: number;
  readonly shifted: Matrix2x2;
  readonly eigenspace: Subspace2D;
};

export type EigenDerivation2x2 = {
  readonly trace: number;
  readonly determinant: number;
  readonly charPoly: CharacteristicPolynomial2x2;
  readonly discriminant: number;
  readonly lambdas: readonly number[];
  readonly steps: readonly EigenDerivationStep2x2[];
  readonly kind: EigenAnalysis2x2["kind"];
};

/**
 * Discriminant of the characteristic polynomial λ² − (tr)λ + det = 0:
 * Δ = tr² − 4 det.
 */
export function discriminant2x2(m: Matrix2x2): number {
  const tr = matrixTrace(m);
  return tr * tr - 4 * determinant2x2(m);
}

/**
 * Structured coefficients of λ² − (tr)λ + det. No display/TeX — formatting
 * belongs in the presentation layer.
 */
export function characteristicPolynomial2x2(
  m: Matrix2x2,
): CharacteristicPolynomial2x2 {
  const trace = matrixTrace(m);
  const determinant = determinant2x2(m);
  return {
    coefficients: { a: 1, b: -trace, c: determinant },
    trace,
    determinant,
  };
}

/**
 * Real roots of the characteristic polynomial. Empty when complex.
 * Separates the "solve the quadratic" rung from full eigen analysis.
 */
export function characteristicRoots2x2(
  m: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): readonly number[] {
  const disc = discriminant2x2(m);
  const tr = matrixTrace(m);

  if (disc > tolerance) {
    const sqrtDisc = Math.sqrt(disc);
    return [(tr + sqrtDisc) / 2, (tr - sqrtDisc) / 2];
  }
  if (disc < -tolerance) {
    return [];
  }
  return [tr / 2];
}

/** A − λI as a structured matrix. */
export function matrixShift(m: Matrix2x2, lambda: number): Matrix2x2 {
  return [
    [m[0][0] - lambda, m[0][1]],
    [m[1][0], m[1][1] - lambda],
  ];
}

/**
 * Nullspace of a 2×2 matrix as an explicit subspace.
 * Prefer this over raw basis arrays so callers do not infer meaning from length.
 */
export function nullspaceBasis2x2(
  m: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): Subspace2D {
  const a = m[0][0];
  const b = m[0][1];
  const c = m[1][0];
  const d = m[1][1];

  // Full plane: matrix ≈ 0.
  if (
    Math.abs(a) <= tolerance &&
    Math.abs(b) <= tolerance &&
    Math.abs(c) <= tolerance &&
    Math.abs(d) <= tolerance
  ) {
    return {
      kind: "plane",
      basis: [
        [1, 0],
        [0, 1],
      ],
    };
  }

  // Prefer the row with larger magnitude for numerical stability.
  const row1Mag = Math.hypot(a, b);
  const row2Mag = Math.hypot(c, d);

  let candidate: Vector2;
  if (row1Mag >= row2Mag && row1Mag > tolerance) {
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
    // Both rows near zero but not fully zero — treat as plane fallback.
    return {
      kind: "plane",
      basis: [
        [1, 0],
        [0, 1],
      ],
    };
  }

  // Orient consistently: prefer positive first component, else positive second.
  if (
    candidate[0] < -tolerance ||
    (Math.abs(candidate[0]) <= tolerance && candidate[1] < 0)
  ) {
    candidate = [-candidate[0], -candidate[1]];
  }

  const unit = normalizeVector(candidate, tolerance);
  if (!unit) {
    return { kind: "zero" };
  }
  return { kind: "line", basis: unit };
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
  const space = nullspaceBasis2x2(matrixShift(m, lambda), tolerance);
  switch (space.kind) {
    case "zero":
      return [];
    case "line":
      return [space.basis];
    case "plane":
      return [space.basis[0], space.basis[1]];
  }
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

/**
 * Structured derivation ladder for a 2×2 matrix.
 * Returns numbers and mathematical structure only — no TeX or prose.
 * Shared spine for scenes, worked examples, static diagrams, and tests.
 */
export function eigenDerivation2x2(
  m: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): EigenDerivation2x2 {
  const charPoly = characteristicPolynomial2x2(m);
  const discriminant = discriminant2x2(m);
  const analysis = analyzeEigen2x2(m, tolerance);
  const lambdas = characteristicRoots2x2(m, tolerance);

  const steps: EigenDerivationStep2x2[] = lambdas.map((lambda) => {
    const shifted = matrixShift(m, lambda);
    const eigenspace = nullspaceBasis2x2(shifted, Math.max(tolerance, 1e-8));
    return { lambda, shifted, eigenspace };
  });

  return {
    trace: charPoly.trace,
    determinant: charPoly.determinant,
    charPoly,
    discriminant,
    lambdas,
    steps,
    kind: analysis.kind,
  };
}
