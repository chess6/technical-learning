import type { GuidedSceneStep } from "../engine/types";
import {
  LINEAR_COMBINATION_SEGMENTS,
  MATRIX_TRANSFORMATION_SEGMENTS,
  SPIKE_SEGMENTS,
  toSteps,
} from "./sceneTimings";

/**
 * Scene metadata (size, accessible label, step markers) kept free of any
 * Motion Canvas import so both the Motion Canvas engine and the SVG fallback —
 * as well as unit tests — can consume it without pulling in the 2D runtime.
 */
export interface GuidedSceneMeta {
  id: string;
  size: { width: number; height: number };
  ariaLabel: string;
  steps: GuidedSceneStep[];
}

const SIZE = { width: 960, height: 600 } as const;

export const SCENE_META: Record<string, GuidedSceneMeta> = {
  "vectors-linear-combinations": {
    id: "vectors-linear-combinations",
    size: SIZE,
    ariaLabel:
      "Guided animation building linear combinations of two vectors and comparing an independent span (the whole plane) with a dependent span (a single line).",
    steps: toSteps(LINEAR_COMBINATION_SEGMENTS),
  },
  "matrix-transformations": {
    id: "matrix-transformations",
    size: SIZE,
    ariaLabel:
      "Guided animation showing a 2 by 2 matrix moving the basis vectors, deforming the coordinate grid, and touring scale, shear, rotation, reflection, and singular transformations.",
    steps: toSteps(MATRIX_TRANSFORMATION_SEGMENTS),
  },
  "transform-spike": {
    id: "transform-spike",
    size: SIZE,
    ariaLabel:
      "Development scene: a coordinate grid transforming from the identity to a shear matrix.",
    steps: toSteps(SPIKE_SEGMENTS),
  },
};

/** Fallback used for lessons whose scenes are not yet implemented. */
export const FALLBACK_SCENE_ID = "transform-spike";

export function getSceneMeta(sceneId: string): GuidedSceneMeta {
  return SCENE_META[sceneId] ?? SCENE_META[FALLBACK_SCENE_ID]!;
}
