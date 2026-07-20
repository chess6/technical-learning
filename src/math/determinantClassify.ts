/**
 * Determinant geometry classification for Lesson 3 readouts.
 * Pure math — no React / Mafs / Motion Canvas.
 */
import { DEFAULT_TOLERANCE, type Matrix2x2 } from "./types";
import { determinant2x2 } from "./matrices";

/** How |det(A)| relates to unit area. */
export type AreaScaleEffect =
  | "expands"
  | "preserves"
  | "contracts"
  | "collapses";

export type DeterminantClassification = {
  readonly det: number;
  readonly absDet: number;
  readonly areaEffect: AreaScaleEffect;
  readonly reversesOrientation: boolean;
  /** Learner-facing one-sentence summary. */
  readonly summary: string;
};

/**
 * Classify the geometric meaning of det(A).
 * Tolerances: |det| ≈ 0 → collapse; |det| ≈ 1 → preserve magnitude.
 */
export function classifyDeterminant(
  matrix: Matrix2x2,
  tolerance = DEFAULT_TOLERANCE,
): DeterminantClassification {
  const det = determinant2x2(matrix);
  const absDet = Math.abs(det);
  const reversesOrientation = det < -tolerance;

  let areaEffect: AreaScaleEffect;
  if (absDet <= tolerance) {
    areaEffect = "collapses";
  } else if (Math.abs(absDet - 1) <= 1e-6) {
    areaEffect = "preserves";
  } else if (absDet > 1) {
    areaEffect = "expands";
  } else {
    areaEffect = "contracts";
  }

  const summary = buildSummary(areaEffect, reversesOrientation, absDet);
  return { det, absDet, areaEffect, reversesOrientation, summary };
}

function buildSummary(
  areaEffect: AreaScaleEffect,
  reverses: boolean,
  absDet: number,
): string {
  const rounded = Math.round(absDet * 100) / 100;
  if (areaEffect === "collapses") {
    return "det(A) ≈ 0 — the unit square collapses onto a line (dimensional collapse).";
  }
  const areaPart =
    areaEffect === "expands"
      ? `expands area by about ${rounded}`
      : areaEffect === "contracts"
        ? `contracts area by about ${rounded}`
        : "preserves area magnitude (|det| ≈ 1)";
  if (reverses) {
    return `This transformation ${areaPart} and reverses orientation (det < 0).`;
  }
  return `This transformation ${areaPart} and preserves orientation (det > 0).`;
}

/** Signed area of the parallelogram spanned by two columns (= det). */
export function signedParallelogramArea(matrix: Matrix2x2): number {
  return determinant2x2(matrix);
}
