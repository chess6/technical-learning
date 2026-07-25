import type { GuidedSceneChapter } from "../engine/types";
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
  SOLUTION_SETS_SEGMENTS,
  MATRIX_COMPOSITION_SEGMENTS,
  SUBSPACES_RANK_SEGMENTS,
  RANK_NULLITY_SEGMENTS,
  BST_LIFT_SEGMENTS,
  RED_BLACK_SEGMENTS,
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
  steps: GuidedSceneChapter[];
  /**
   * Major conceptual stages ("chapters") for Prev/Next idea controls,
   * timeline markers, and chapter jumps. A subset of {@link steps}; learner
   * UI should prefer these. Optional per-segment summaries are authored in
   * sceneTimings.ts beside the durations.
   */
  majorSteps: GuidedSceneChapter[];
}

function pickMajor(
  steps: GuidedSceneChapter[],
  ids: readonly string[],
): GuidedSceneChapter[] {
  return ids
    .map((id) => steps.find((step) => step.id === id))
    .filter((step): step is GuidedSceneChapter => Boolean(step));
}

const LINEAR_STEPS = toSteps(LINEAR_COMBINATION_SEGMENTS);
const MATRIX_STEPS = toSteps(MATRIX_TRANSFORMATION_SEGMENTS);
const SPIKE_STEPS = toSteps(SPIKE_SEGMENTS);
const DETERMINANT_STEPS = toSteps(DETERMINANT_SEGMENTS);
const EIGENVECTOR_STEPS = toSteps(EIGENVECTOR_SEGMENTS);
const EIGEN_DERIVATION_STEPS = toSteps(EIGEN_DERIVATION_SEGMENTS);
const KARATSUBA_STEPS = toSteps(KARATSUBA_SEGMENTS);
const BST_LIFT_STEPS = toSteps(BST_LIFT_SEGMENTS);
const RED_BLACK_STEPS = toSteps(RED_BLACK_SEGMENTS);
const CHAPTER0_STEPS = toSteps(CHAPTER0_SEGMENTS);
const COLUMNS_RULE_GRAPHIC_STEPS = toSteps(COLUMNS_RULE_GRAPHIC_SEGMENTS);
const SYSTEMS_STEPS = toSteps(SYSTEMS_SEGMENTS);
const ELIMINATION_STEPS = toSteps(ELIMINATION_SEGMENTS);
const SOLUTION_SETS_STEPS = toSteps(SOLUTION_SETS_SEGMENTS);
const MATRIX_COMPOSITION_STEPS = toSteps(MATRIX_COMPOSITION_SEGMENTS);
const SUBSPACES_RANK_STEPS = toSteps(SUBSPACES_RANK_SEGMENTS);
const RANK_NULLITY_STEPS = toSteps(RANK_NULLITY_SEGMENTS);

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
  "solution-sets": {
    id: "solution-sets",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for the structure of the solution set of a 2 by 2 linear system, drawn in solution space. Two solutions of the same consistent system are marked, then subtracted: their difference is a solution of the homogeneous system A x equals zero. Adding that difference back to a solution generates a third solution without solving again. All such differences fill the null space, a line through the origin. The full solution set is that null line translated by one particular solution — the null space carried off the origin, an affine line that does not pass through the origin unless b is zero — and it is empty when the system is inconsistent because no particular solution exists.",
    steps: SOLUTION_SETS_STEPS,
    majorSteps: pickMajor(SOLUTION_SETS_STEPS, [
      "two-solutions",
      "difference",
      "generate",
      "null-line",
      "translate",
      "cases",
    ]),
  },
  "matrix-composition": {
    id: "matrix-composition",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for composing two linear maps and undoing one. A shared craft and the two standard basis arrows are first rotated a quarter turn by R, then sheared by A, so each basis arrow traces a two-stage path. The plane is then reset and the single matrix A R is applied in one motion, landing the craft in exactly the same place. Dimming everything else shows that the endpoint of e one's path is column one of A R, which equals A applied to column one of R, and likewise for e two. The order is then swapped: R A lands the craft somewhere else, so the order of composition matters in general. Next, A's image is returned exactly onto the dashed original by A inverse, illustrating that A inverse times A is the identity. Finally a singular map squashes the plane onto a line and two distinct marked points merge into a single image point, so no map could choose which one to return to.",
    steps: MATRIX_COMPOSITION_STEPS,
    majorSteps: pickMajor(MATRIX_COMPOSITION_STEPS, [
      "apply-b",
      "apply-a",
      "one-map",
      "columns",
      "order",
      "undo",
      "no-undo",
    ]),
  },
  "subspaces-rank": {
    id: "subspaces-rank",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for the column space, the null space, and rank, drawn as two labelled panels under an isometric projection. The left panel is the input space R three and the right panel is the output space R three. The unit cube on the left is pushed through a rank two map and lands flat on the right: every output lies on one plane, which is named the column space and decides whether A x equals b is solvable. Attention then returns to the left panel, where a whole line of inputs is shown collapsing onto the single origin point on the right; that line is named the null space and is drawn in the input panel to make clear it is a different space from the column space. The rank is then counted: three dimensions in, two out. Finally a rank one map replaces it, and the image shrinks to a line while the null space grows to a plane, showing the two dimensions moving in opposite directions.",
    steps: SUBSPACES_RANK_STEPS,
    majorSteps: pickMajor(SUBSPACES_RANK_STEPS, [
      "two-panels",
      "reach",
      "colspace",
      "crush",
      "nullspace",
      "count",
      "rank-one",
    ]),
  },
  "rank-nullity": {
    id: "rank-nullity",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for the rank–nullity theorem, drawn as a ledger rather than as geometry. Three tokens representing the three input dimensions of a 3 by 3 map are posted one at a time into one of two columns: survived, which counts the rank, or crushed, which counts the nullity. Two survive and one is crushed, and the running tally reads two plus one equals three — the total being the input dimension. The map is then degraded so that only one direction survives, and a token moves across the ledger from one column to the other, changing the split while the total stays at three. Finally the shape changes to a 2 by 3 map: the surviving column now has only two slots because the output space is two dimensional, a greyed band marks the slot that cannot exist, and the scene concludes that no map from a bigger space to a smaller one can be one to one.",
    steps: RANK_NULLITY_STEPS,
    majorSteps: pickMajor(RANK_NULLITY_STEPS, [
      "budget",
      "post",
      "balance",
      "degrade",
      "ceiling",
      "forbidden",
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
  "bst-lift-from-array": {
    id: "bst-lift-from-array",
    size: SCENE_SIZE,
    ariaLabel:
      "Binary search trees: binary search probing a sorted array, its probes lifted into a tree, the ordering rule read off the result, and the cost of a balanced shape compared with the chain that sorted insertion produces.",
    steps: BST_LIFT_STEPS,
    majorSteps: pickMajor(BST_LIFT_STEPS, [
      "probe-first",
      "second-search",
      "lift",
      "read-the-rule",
      "interval-stays",
      "cost-is-depth",
      "degenerate",
      "the-gap",
    ]),
  },
  "red-black-encoding": {
    id: "red-black-encoding",
    size: SCENE_SIZE,
    ariaLabel:
      "Red-black trees: a 2-3-4 node drawn beside its binary encoding, gaining keys as red children, then overflowing. After a prediction prompt, the split is shown to be the colour flip that promotes the middle key — happening simultaneously in both panels while every node keeps its identity — the arriving key settles as a red child of its new neighbour, and the unchanged black height is read off before the violation is traced upward.",
    steps: RED_BLACK_STEPS,
    majorSteps: pickMajor(RED_BLACK_STEPS, [
      "establish",
      "encode-2node",
      "encode-3node",
      "encode-4node",
      "read-off-r2",
      "read-off-r3",
      "overflow",
      "split-is-recolour",
      "invariant-held",
      "violation-moves-up",
      "root-split",
    ]),
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
