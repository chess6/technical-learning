import type { GuidedSceneStep } from "../engine/types";

/**
 * Single source of truth for guided-scene timing.
 *
 * Each scene is defined as an ordered list of segments with explicit durations.
 * The Motion Canvas generator runs one body per segment id (so the animation
 * length always matches these numbers), and the step metadata below is derived
 * from the same durations (so step buttons and reduced-motion states line up
 * with the real timeline). This module is pure data — it imports no Motion
 * Canvas code, so engines and unit tests can read it freely.
 */

export interface SceneSegment {
  id: string;
  title: string;
  /** Seconds this segment occupies on the timeline. */
  duration: number;
}

export const LINEAR_COMBINATION_SEGMENTS: readonly SceneSegment[] = [
  { id: "plane", title: "Coordinate plane", duration: 2.4 },
  { id: "vector-v", title: "Vector v", duration: 3 },
  { id: "components", title: "Components of v", duration: 3.2 },
  { id: "vector-w", title: "Vector w", duration: 3 },
  { id: "addition", title: "Head-to-tail addition", duration: 4 },
  { id: "scaling", title: "Scalar multiples", duration: 5 },
  { id: "combination", title: "a·v + b·w", duration: 5 },
  { id: "span-plane", title: "Independent span: the plane", duration: 4 },
  { id: "dependent", title: "Dependent span: a line", duration: 4.6 },
];

export const MATRIX_TRANSFORMATION_SEGMENTS: readonly SceneSegment[] = [
  { id: "identity", title: "Identity grid", duration: 3 },
  { id: "col1", title: "First column → e₁", duration: 4 },
  { id: "col2", title: "Second column → e₂", duration: 4 },
  { id: "sample", title: "x·e₁ + y·e₂", duration: 4 },
  { id: "transform-sample", title: "Transform the sample", duration: 4 },
  { id: "grid", title: "Deform the grid", duration: 4 },
  { id: "compare", title: "Original vs transformed", duration: 3 },
  { id: "presets", title: "A tour of transformations", duration: 8 },
  { id: "summary", title: "Columns are the basis images", duration: 3 },
];

export const SPIKE_SEGMENTS: readonly SceneSegment[] = [
  { id: "identity", title: "Identity grid", duration: 0.4 },
  { id: "transform", title: "Apply the matrix", duration: 2 },
  { id: "result", title: "Transformed space", duration: 0.6 },
];

/** Total timeline length in seconds. */
export function totalDuration(segments: readonly SceneSegment[]): number {
  return segments.reduce((sum, segment) => sum + segment.duration, 0);
}

/** Derive normalized (0..1) step markers from segment durations. */
export function toSteps(segments: readonly SceneSegment[]): GuidedSceneStep[] {
  const total = totalDuration(segments);
  const steps: GuidedSceneStep[] = [];
  let elapsed = 0;
  for (const segment of segments) {
    steps.push({
      id: segment.id,
      title: segment.title,
      at: total > 0 ? elapsed / total : 0,
    });
    elapsed += segment.duration;
  }
  return steps;
}
