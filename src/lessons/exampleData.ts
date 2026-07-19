import { requireMatrixExample, type MatrixExample, type Vector2 } from "../math";

/**
 * Shared, immutable lesson example data.
 *
 * This is the single source of truth for the concrete vectors, coefficients,
 * and matrices used by BOTH the guided Motion Canvas scenes and the interactive
 * Mafs explorations. Guided and interactive modes import from here so they can
 * never drift apart on the same numbers.
 */

export interface LinearCombinationExample {
  id: string;
  /** First direction. */
  v: Vector2;
  /** Second direction, independent from v (spans the plane with v). */
  wIndependent: Vector2;
  /** Second direction chosen parallel to v (collapses the span to a line). */
  wDependent: Vector2;
  initialA: number;
  initialB: number;
  /** Symmetric clamp bound for dragging and coefficient sliders. */
  bound: number;
}

/** wDependent = 2 * v, so v and wDependent are linearly dependent. */
export const LINEAR_COMBINATION_EXAMPLE: LinearCombinationExample = {
  id: "vectors-default",
  v: [1, 2],
  wIndependent: [3, -1],
  wDependent: [2, 4],
  initialA: 1,
  initialB: 1,
  bound: 6,
};

/**
 * The matrix-as-transformation lesson reuses the shared registry example
 * A = [[2, 1], [0, 1]] rather than redefining it.
 */
export const MATRIX_LESSON_EXAMPLE: MatrixExample =
  requireMatrixExample("shear-2-1");

/** Ordered transformation presets for the Lesson 2 exploration and guided cycle. */
export interface TransformPreset {
  id: string;
  label: string;
  exampleId: string;
}

export const TRANSFORM_LESSON_PRESETS: readonly TransformPreset[] = [
  { id: "identity", label: "Identity", exampleId: "identity" },
  { id: "scale", label: "Scale", exampleId: "uniform-scale" },
  { id: "shear", label: "Shear", exampleId: "shear-2-1" },
  { id: "rotation", label: "Rotation", exampleId: "rotation" },
  { id: "reflection", label: "Reflection", exampleId: "reflection" },
  { id: "singular", label: "Singular collapse", exampleId: "singular-collapse" },
];
