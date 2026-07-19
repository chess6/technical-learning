import type { GuidedSceneStep } from "../engine/types";
import {
  requireMatrixExample,
  type Matrix2x2,
  type Vector2,
  lerpIdentityToMatrix,
  matrixVectorMultiply,
} from "../../math";

/**
 * Spike scene constants — drawn from the shared example registry so the guided
 * animation and interactive explorations never diverge on the same matrix.
 */

const spikeExample = requireMatrixExample("shear-2-1");

export const SPIKE_MATRIX: Matrix2x2 = spikeExample.matrix;

export const SAMPLE_VECTOR: Vector2 = spikeExample.inputVector ?? [1.5, 0.5];

export const SPIKE_SCENE_SIZE = { width: 960, height: 540 } as const;

export const SPIKE_STEPS: GuidedSceneStep[] = [
  { id: "identity", title: "Identity grid", at: 0 },
  { id: "transform", title: "Apply the matrix", at: 0.18 },
  { id: "result", title: "Transformed space", at: 0.92 },
];

/** @deprecated Prefer lerpIdentityToMatrix from src/math. Kept as a thin alias. */
export function lerpMatrix(t: number, target: Matrix2x2 = SPIKE_MATRIX): Matrix2x2 {
  return lerpIdentityToMatrix(target, t);
}

/** @deprecated Prefer matrixVectorMultiply from src/math. */
export function applyMatrix(m: Matrix2x2, point: Vector2): Vector2 {
  return matrixVectorMultiply(m, point);
}
