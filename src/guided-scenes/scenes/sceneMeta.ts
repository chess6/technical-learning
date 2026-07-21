import type { GuidedSceneStep } from "../engine/types";
import {
  LINEAR_COMBINATION_SEGMENTS,
  MATRIX_TRANSFORMATION_SEGMENTS,
  SPIKE_SEGMENTS,
  DETERMINANT_SEGMENTS,
  EIGENVECTOR_SEGMENTS,
  EIGEN_DERIVATION_SEGMENTS,
  KARATSUBA_SEGMENTS,
  CHAPTER0_SEGMENTS,
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
const DETERMINANT_STEPS = toSteps(DETERMINANT_SEGMENTS);
const EIGENVECTOR_STEPS = toSteps(EIGENVECTOR_SEGMENTS);
const EIGEN_DERIVATION_STEPS = toSteps(EIGEN_DERIVATION_SEGMENTS);
const KARATSUBA_STEPS = toSteps(KARATSUBA_SEGMENTS);
const CHAPTER0_STEPS = toSteps(CHAPTER0_SEGMENTS);

export const SCENE_META: Record<string, GuidedSceneMeta> = {
  "why-linear-algebra": {
    id: "why-linear-algebra",
    size: SCENE_SIZE,
    ariaLabel:
      "Chapter 0 animation: a small asymmetric vector graphic on a coordinate grid is transformed by a live 2 by 2 matrix through scaling, rotation, reflection, shear, and a projection that collapses the plane onto a line, while the standard basis vectors, their images, and one highlighted vertex and its image track the change — ending on the question of how four numbers move every vertex.",
    steps: CHAPTER0_STEPS,
    majorSteps: pickMajor(CHAPTER0_STEPS, [
      "establish",
      "scale",
      "rotation",
      "reflection",
      "shear",
      "projection",
      "mystery",
    ]),
  },
  "vectors-linear-combinations": {
    id: "vectors-linear-combinations",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation building linear combinations of two vectors, comparing an independent span (the whole plane) with a dependent span (a single line), showing that a point inside a dependent line has infinitely many representations, naming an independent pair a basis, and reading one fixed point's coordinates in the standard basis and in that basis.",
    steps: LINEAR_STEPS,
    majorSteps: pickMajor(LINEAR_STEPS, [
      "vector-v",
      "addition",
      "scaling",
      "combination",
      "span-plane",
      "dependent",
      "dependent-inside",
      "basis",
      "coordinates",
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
  "determinant-area-scaling": {
    id: "determinant-area-scaling",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation showing the unit square becoming a parallelogram, naming its area scale as the determinant, multiplying area in successive stretches, collapsing through zero, and reversing orientation for a negative determinant.",
    steps: DETERMINANT_STEPS,
    majorSteps: pickMajor(DETERMINANT_STEPS, [
      "identity",
      "parallelogram",
      "area",
      "expand",
      "collapse",
      "negative",
      "summary",
    ]),
  },
  "eigenvectors-invariant-directions": {
    id: "eigenvectors-invariant-directions",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation showing the whole coordinate grid stretching and rotating under a matrix so that most vectors change direction while eigendirections stay on their line, covering stretch, shrink, reverse, collapse, scalar, defective, and no-real-eigenvector cases.",
    steps: EIGENVECTOR_STEPS,
    majorSteps: pickMajor(EIGENVECTOR_STEPS, [
      "fan",
      "apply",
      "highlight",
      "equation",
      "lambdas",
      "scalar",
      "defective",
      "rotation",
      "summary",
    ]),
  },
  "eigenvectors-derivation": {
    id: "eigenvectors-derivation",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided derivation computing eigenvalues and eigenvectors: from Av equals lambda v through A minus lambda I, the characteristic equation, solving for lambda, finding eigenspaces, and interpreting the asymmetric directions.",
    steps: EIGEN_DERIVATION_STEPS,
    majorSteps: pickMajor(EIGEN_DERIVATION_STEPS, [
      "recap",
      "shift",
      "charpoly",
      "solveLambda",
      "solveV",
      "interpret",
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
  "karatsuba-cross-terms": {
    id: "karatsuba-cross-terms",
    size: SCENE_SIZE,
    ariaLabel:
      "Karatsuba: reducing four multiplications to three via a weighted multiplication rectangle and a separate auxiliary coefficient rectangle, then comparing three-way and four-way conceptual recurrence trees.",
    steps: KARATSUBA_STEPS,
    majorSteps: pickMajor(KARATSUBA_STEPS, [
      "foil",
      "share",
      "aux-rect",
      "subtract",
      "reassemble",
      "carry-vs-width",
      "branch",
      "exponent",
    ]),
  },
};

/** Fallback used only when an explicit scene id requests the spike. */
export const SPIKE_SCENE_ID = "transform-spike";

/** @deprecated Prefer hasGuidedScene / getSceneMeta throwing — no silent fallback. */
export const FALLBACK_SCENE_ID = SPIKE_SCENE_ID;

export function hasGuidedScene(sceneId: string): boolean {
  return Object.prototype.hasOwnProperty.call(SCENE_META, sceneId);
}

/**
 * Resolve scene metadata. Unknown production ids throw — they must never
 * silently render the transform-spike scene.
 */
export function getSceneMeta(sceneId: string): GuidedSceneMeta {
  const meta = SCENE_META[sceneId];
  if (!meta) {
    throw new Error(
      `Unknown guided scene id: "${sceneId}". ` +
        `Register it in SCENE_META or use the explicit "${SPIKE_SCENE_ID}" id.`,
    );
  }
  return meta;
}
