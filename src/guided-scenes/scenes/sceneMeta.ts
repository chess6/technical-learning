import type { GuidedSceneStep } from "../engine/types";
import {
  LINEAR_COMBINATION_SEGMENTS,
  MATRIX_TRANSFORMATION_SEGMENTS,
  SPIKE_SEGMENTS,
  toSteps,
} from "./sceneTimings";
import { SCENE_SIZE } from "./safeFrame";

/**
 * Scene metadata (size, accessible label, step markers) kept free of any
 * Motion Canvas import so both the Motion Canvas engine and the SVG fallback —
 * as well as unit tests — can consume it without pulling in the 2D runtime.
 */
export interface GuidedSceneMeta {
  id: string;
  size: { width: number; height: number };
  ariaLabel: string;
  /** All timeline beats (scrubber / progress). */
  steps: GuidedSceneStep[];
  /**
   * Major conceptual stages for Prev/Next idea controls.
   * A subset of {@link steps}; learner UI should prefer these.
   */
  majorSteps: GuidedSceneStep[];
}

function pickMajor(
  steps: GuidedSceneStep[],
  ids: readonly string[],
): GuidedSceneStep[] {
  return ids
    .map((id) => steps.find((step) => step.id === id))
    .filter((step): step is GuidedSceneStep => Boolean(step));
}

const LINEAR_STEPS = toSteps(LINEAR_COMBINATION_SEGMENTS);
const MATRIX_STEPS = toSteps(MATRIX_TRANSFORMATION_SEGMENTS);
const SPIKE_STEPS = toSteps(SPIKE_SEGMENTS);

export const SCENE_META: Record<string, GuidedSceneMeta> = {
  "vectors-linear-combinations": {
    id: "vectors-linear-combinations",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation building linear combinations of two vectors and comparing an independent span (the whole plane) with a dependent span (a single line).",
    steps: LINEAR_STEPS,
    majorSteps: pickMajor(LINEAR_STEPS, [
      "vector-v",
      "addition",
      "scaling",
      "combination",
      "span-plane",
      "dependent",
    ]),
  },
  "matrix-transformations": {
    id: "matrix-transformations",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation showing a 2 by 2 matrix moving the basis vectors, deforming the coordinate grid, and touring scale, shear, rotation, reflection, and singular transformations.",
    steps: MATRIX_STEPS,
    majorSteps: pickMajor(MATRIX_STEPS, [
      "identity",
      "col1",
      "sample",
      "grid",
      "presets",
      "summary",
    ]),
  },
  "transform-spike": {
    id: "transform-spike",
    size: SCENE_SIZE,
    ariaLabel:
      "Development scene: a coordinate grid transforming from the identity to a shear matrix.",
    steps: SPIKE_STEPS,
    majorSteps: SPIKE_STEPS,
  },
};

/** Fallback used for lessons whose scenes are not yet implemented. */
export const FALLBACK_SCENE_ID = "transform-spike";

export function getSceneMeta(sceneId: string): GuidedSceneMeta {
  return SCENE_META[sceneId] ?? SCENE_META[FALLBACK_SCENE_ID]!;
}
