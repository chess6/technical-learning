/**
 * Eigenvector candidate checks for Lesson 4 explorers.
 * Pure math — no React / Mafs / Motion Canvas.
 */
import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import {
  areParallel,
  magnitude,
  normalizeVector,
  scaleVector,
} from "./vectors";
import { matrixVectorMultiply, verifiesEigenpair } from "./matrices";
import { analyzeEigen2x2 } from "./eigen";

/**
 * Smallest angle between the *lines* spanned by a and b, in [0, π/2].
 * Parallel and antiparallel both yield 0. Returns null if either is near zero.
 */
export function lineAngleBetweenVectors(
  a: Vector2,
  b: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): number | null {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA <= tolerance || magB <= tolerance) return null;
  const cos = Math.max(
    -1,
    Math.min(1, Math.abs((a[0] * b[0] + a[1] * b[1]) / (magA * magB))),
  );
  return Math.acos(cos);
}

export type EigenCandidateResult =
  | {
      readonly kind: "zero-vector";
      readonly summary: string;
    }
  | {
      readonly kind: "eigen-direction";
      readonly lambda: number;
      readonly lineAngleRadians: number;
      readonly summary: string;
    }
  | {
      readonly kind: "not-eigen";
      readonly lineAngleRadians: number;
      readonly Av: Vector2;
      readonly summary: string;
    };

/**
 * Classify whether a candidate vector lies on an eigendirection of A.
 * Never treats the zero vector as an eigenvector.
 */
export function classifyEigenCandidate(
  matrix: Matrix2x2,
  candidate: Vector2,
  tolerance = 1e-4,
): EigenCandidateResult {
  if (magnitude(candidate) <= DEFAULT_TOLERANCE) {
    return {
      kind: "zero-vector",
      summary:
        "The zero vector is never an eigenvector — pick a nonzero direction.",
    };
  }

  const Av = matrixVectorMultiply(matrix, candidate);
  const lineAngle = lineAngleBetweenVectors(candidate, Av, DEFAULT_TOLERANCE);

  // Collapse: Av ≈ 0 means λ = 0 along this direction (if parallel — always true with zero).
  if (magnitude(Av) <= tolerance) {
    return {
      kind: "eigen-direction",
      lambda: 0,
      lineAngleRadians: 0,
      summary:
        "Av ≈ 0 — this direction collapses to the origin (eigenvalue λ = 0).",
    };
  }

  if (lineAngle === null) {
    return {
      kind: "zero-vector",
      summary:
        "The zero vector is never an eigenvector — pick a nonzero direction.",
    };
  }

  if (areParallel(candidate, Av, tolerance)) {
    // λ ≈ (v · Av) / (v · v)
    const vv =
      candidate[0] * candidate[0] + candidate[1] * candidate[1];
    const lambda =
      (candidate[0] * Av[0] + candidate[1] * Av[1]) / vv;
    if (verifiesEigenpair(matrix, lambda, candidate, Math.max(tolerance, 1e-5))) {
      return {
        kind: "eigen-direction",
        lambda,
        lineAngleRadians: lineAngle,
        summary: describeLambda(lambda),
      };
    }
  }

  return {
    kind: "not-eigen",
    lineAngleRadians: lineAngle,
    Av,
    summary:
      "Av leaves this line — most directions change under A. Keep adjusting toward an eigendirection.",
  };
}

function describeLambda(lambda: number): string {
  const r = Math.round(lambda * 100) / 100;
  if (Math.abs(lambda) <= DEFAULT_TOLERANCE) {
    return "Eigen-direction with λ ≈ 0 (collapse along this line).";
  }
  if (lambda < -DEFAULT_TOLERANCE) {
    return `Eigen-direction: λ ≈ ${r} reverses and scales along this line.`;
  }
  if (lambda > 1 + 1e-6) {
    return `Eigen-direction: λ ≈ ${r} stretches along this line.`;
  }
  if (lambda < 1 - 1e-6) {
    return `Eigen-direction: λ ≈ ${r} shrinks along this line.`;
  }
  return `Eigen-direction: λ ≈ ${r} (length preserved along this line).`;
}

export type EigenAnalysisSummary = {
  readonly kind: string;
  readonly summary: string;
  /** Normalized directions to draw (empty for complex). */
  readonly directions: readonly Vector2[];
  readonly lambdas: readonly number[];
};

/** Learner-facing summary of analyzeEigen2x2, with stable unit directions. */
export function summarizeEigenAnalysis(
  matrix: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): EigenAnalysisSummary {
  const analysis = analyzeEigen2x2(matrix, tolerance);

  if (analysis.kind === "complex") {
    return {
      kind: "complex",
      summary:
        "No real eigendirections — every nonzero vector changes direction (complex eigenvalues may still exist).",
      directions: [],
      lambdas: [],
    };
  }

  if (analysis.kind === "distinct-real") {
    const directions = analysis.pairs
      .map((p) => normalizeVector(p.eigenvector))
      .filter((v): v is Vector2 => v !== null)
      .map(stabilizeDirection);
    return {
      kind: "distinct-real",
      summary: `Two distinct real eigendirections (λ ≈ ${fmt(analysis.pairs[0]!.eigenvalue)}, ${fmt(analysis.pairs[1]!.eigenvalue)}).`,
      directions,
      lambdas: analysis.pairs.map((p) => p.eigenvalue),
    };
  }

  // repeated-real
  const directions = analysis.eigenspaceBasis
    .map((v) => normalizeVector(v))
    .filter((v): v is Vector2 => v !== null)
    .map(stabilizeDirection);

  if (analysis.diagonalizable) {
    return {
      kind: "scalar-repeated",
      summary: `Scalar matrix A = λI with λ ≈ ${fmt(analysis.eigenvalue)} — every nonzero direction is an eigenvector.`,
      directions,
      lambdas: [analysis.eigenvalue],
    };
  }

  return {
    kind: "defective-repeated",
    summary: `Repeated eigenvalue λ ≈ ${fmt(analysis.eigenvalue)} with only one eigendirection (defective — do not invent a second).`,
    directions,
    lambdas: [analysis.eigenvalue],
  };
}

/** Prefer a consistent hemisphere so arrows do not flip frame-to-frame. */
export function stabilizeDirection(v: Vector2): Vector2 {
  if (v[0] < -DEFAULT_TOLERANCE || (Math.abs(v[0]) <= DEFAULT_TOLERANCE && v[1] < 0)) {
    return scaleVector(v, -1);
  }
  return v;
}

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}
