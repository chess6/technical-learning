import type { Matrix2x2, Vector2 } from "../../../math";
import { analyzeEigen2x2 } from "../../../math";
import { lerpHexColor } from "../../../guided-scenes/scenes/kitLayout";

/**
 * Pure data for the eigen-span-stretch replica: the example matrix, the two
 * eigen directions (verified against the shared math in tests), and the two
 * gradient vector fans. All geometry the scene draws derives from here.
 */

/** The running example transformation of the reference excerpt. */
export const EIGEN_BENCH_MATRIX: Matrix2x2 = [
  [3, 1],
  [0, 2],
];

/** Eigen direction with stretch factor 3 (the x-axis family). */
export const EIGEN_DIR_X: Vector2 = [1, 0];
/** Eigen direction with stretch factor 2 (the diagonal family). */
export const EIGEN_DIR_DIAG: Vector2 = [-1, 1];

/** The opening special vector (on the diagonal span, opposite orientation). */
export const OPENING_VECTOR: Vector2 = [1, -1];
/** The sneaky vector the label rides. */
export const SNEAKY_VECTOR: Vector2 = [-1, 1];
/** The counterexample vector that gets knocked off the y=x span. */
export const KNOCKED_VECTOR: Vector2 = [1, 1];

/** Verified in tests via analyzeEigen2x2; used directly by scene readouts. */
export const EIGEN_FACTORS = { xAxis: 3, diagonal: 2 } as const;

export function eigenAnalysisOfBenchMatrix() {
  return analyzeEigen2x2(EIGEN_BENCH_MATRIX);
}

export interface FanArrow {
  /** Math-space tip before the transform. */
  tip: Vector2;
  color: string;
}

/**
 * A family fan: one arrow per unit step along the direction, both ways,
 * coloured by a gradient so the family reads as one object. Skips the zero
 * vector.
 */
export function makeFanArrows(
  direction: Vector2,
  halfExtentUnits: number,
  colorNear: string,
  colorFar: string,
): FanArrow[] {
  const arrows: FanArrow[] = [];
  for (let k = -halfExtentUnits; k <= halfExtentUnits; k += 1) {
    if (k === 0) continue;
    arrows.push({
      tip: [direction[0] * k, direction[1] * k],
      color: lerpHexColor(colorNear, colorFar, Math.abs(k) / halfExtentUnits),
    });
  }
  return arrows;
}

/** Replica colour grammar for this benchmark (observation-derived roles). */
export const EIGEN_BENCH_COLORS = {
  staticGrid: "#2b3442",
  movingGrid: "#3fb6cf",
  axis: "#e8ecf4",
  basis1: "#7dba8a",
  basis2: "#e26d6d",
  eigenFamily: "#e8d44d",
  spanLine: "#c05f8a",
  spanFaded: "#7a3d3d",
  counterexample: "#d556c8",
  labelText: "#f2f5fa",
} as const;
