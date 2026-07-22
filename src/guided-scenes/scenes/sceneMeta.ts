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
  COLUMNS_RULE_GRAPHIC_SEGMENTS,
  SYSTEMS_SEGMENTS,
  ELIMINATION_SEGMENTS,
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
const COLUMNS_RULE_GRAPHIC_STEPS = toSteps(COLUMNS_RULE_GRAPHIC_SEGMENTS);
const SYSTEMS_STEPS = toSteps(SYSTEMS_SEGMENTS);
const ELIMINATION_STEPS = toSteps(ELIMINATION_SEGMENTS);

export const SCENE_META: Record<string, GuidedSceneMeta> = {
  "why-linear-algebra": {
    id: "why-linear-algebra",
    size: SCENE_SIZE,
    ariaLabel:
      "Chapter 0 animation: a small asymmetric multi-part craft on a coordinate grid is established first, then the standard basis vectors and one marked vertex are revealed, then a live 2 by 2 matrix resets to the identity and animates into scaling, rotation, reflection, shear, and a projection that collapses the plane onto a line; a translation beat shows that no 2 by 2 matrix can slide the craft because the origin is pinned, and the scene ends on the question of how four numbers move every vertex.",
    steps: CHAPTER0_STEPS,
    majorSteps: pickMajor(CHAPTER0_STEPS, [
      "establish",
      "reveal",
      "scale",
      "rotation",
      "reflection",
      "shear",
      "projection",
      "translation",
      "mystery",
    ]),
  },
  "columns-rule-graphic": {
    id: "columns-rule-graphic",
    size: SCENE_SIZE,
    ariaLabel:
      "Lesson 2 callback animation: one vertex of the shared craft is written as a times e one plus b times e two, its image is shown to be a times T of e one plus b times T of e two, and the same rule is then applied to every marked vertex so the two matrix columns reposition the whole craft — resolving Chapter 0's mystery.",
    steps: COLUMNS_RULE_GRAPHIC_STEPS,
    majorSteps: pickMajor(COLUMNS_RULE_GRAPHIC_STEPS, [
      "vertex",
      "image",
      "all-vertices",
    ]),
  },
  "linear-systems": {
    id: "linear-systems",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for solving a 2 by 2 linear system: the same system is shown first as the row picture, two lines whose intersection is the solution, then as the column picture, combining the two matrix columns to reach the target vector b with the same coefficients; the scene then walks the three cases — a unique solution when the lines cross and the columns are independent, infinitely many when the two lines coincide and b lies on the dependent column line, and none when the lines are parallel and b lies off that line.",
    steps: SYSTEMS_STEPS,
    majorSteps: pickMajor(SYSTEMS_STEPS, [
      "equations",
      "row",
      "column",
      "unique",
      "infinite",
      "none",
      "summary",
    ]),
  },
  elimination: {
    id: "elimination",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for Gaussian elimination on a 2 by 2 system, shown as three synchronized views: the written equations, the augmented matrix, and the two constraint lines. One elementary row operation, replacing row two with row two minus twice row one, rewrites the equations and the matrix while the second line pivots around the fixed intersection point, which never moves; the system becomes triangular so the solution is read off by back-substitution, illustrating that a row operation replaces the constraints with different constraints having exactly the same solution set.",
    steps: ELIMINATION_STEPS,
    majorSteps: pickMajor(ELIMINATION_STEPS, [
      "setup",
      "operation",
      "triangular",
      "invariance",
      "summary",
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
