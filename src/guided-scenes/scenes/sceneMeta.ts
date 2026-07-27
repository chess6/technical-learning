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
  CHANGE_OF_BASIS_SEGMENTS,
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
const CHANGE_OF_BASIS_STEPS = toSteps(CHANGE_OF_BASIS_SEGMENTS);

export const SCENE_META: Record<string, GuidedSceneMeta> = {
  "why-linear-algebra": {
    id: "why-linear-algebra",
    size: SCENE_SIZE,
    ariaLabel:
      "Chapter 0 animation: a small asymmetric multi-part craft on a coordinate grid is established first, then the standard basis vectors and one marked vertex are revealed together with a marker on the origin, then a live 2 by 2 matrix resets to the identity and animates into scaling, rotation, reflection, shear, and a projection that collapses the plane onto a line. The animation then pauses to let the learner predict whether any such rule could slide the craft off the origin, and shows the attempted slide as a dashed copy that travels away from the craft; no 2 by 2 matrix can follow it, because A times zero is zero pins the origin. The scene ends on the question of how four numbers move every vertex.",
    steps: CHAPTER0_STEPS,
    majorSteps: pickMajor(CHAPTER0_STEPS, [
      "establish",
      "reveal",
      "scale",
      "rotation",
      "reflection",
      "shear",
      "projection",
      "predict-translation",
      "translation",
      "mystery",
    ]),
  },
  "columns-rule-graphic": {
    id: "columns-rule-graphic",
    size: SCENE_SIZE,
    ariaLabel:
      "Lesson 2 callback animation: one vertex of the shared craft is marked and its standard coordinates a and b are read off. The decomposition is then constructed head-to-tail — a walk of a along e one followed by b along e two, ending exactly on the vertex. After a pause to predict where that walk will end once the basis moves, the matrix is applied: the same two component arrows swing onto the matrix columns and land on the moved vertex, showing that T of x equals a times T of e one plus b times T of e two with the same a and b. Finally every marked vertex shows its own head-to-tail walk on those same two columns, so the two columns reposition the whole craft — resolving Chapter 0's mystery.",
    steps: COLUMNS_RULE_GRAPHIC_STEPS,
    majorSteps: pickMajor(COLUMNS_RULE_GRAPHIC_STEPS, [
      "vertex",
      "decompose",
      "predict",
      "image",
      "all-vertices",
    ]),
  },
  "linear-systems": {
    id: "linear-systems",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for solving a 2 by 2 linear system: the same system is shown first as the row picture, two lines whose intersection is the solution, then regrouped into the column picture, where the target vector b is drawn in its own colour so it is never confused with the solution point. The learner predicts what the row picture's answer means for the columns before the combination is built, then the scene walks the three cases: a unique solution when the lines cross, infinitely many when the two lines slide onto each other, and none when b visibly travels off the dependent columns' line and the two lines become parallel. It closes by returning to the original system.",
    steps: SYSTEMS_STEPS,
    majorSteps: pickMajor(SYSTEMS_STEPS, [
      "equations",
      "row",
      "regroup",
      "predict-column",
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
      "Guided animation for one elementary row operation on a 2 by 2 system, done longhand and then watched happen to the picture. The two equations are packed into an augmented matrix; the pivot in row one and the leading entry of row two are marked as the entry the operation exists to turn into a zero. Row two itself then drops out of the bracket, leaving a translucent record of where it was, and a copy of row one lands beneath it and is doubled. The three columns are subtracted one at a time — two minus two is zero, minus one minus six is minus seven, five minus minus two is seven — with the cancelling column held longest, and the computed row travels back into the slot row two left. The frame then reframes: the matrix parks while the two original constraints appear as lines crossing at the point two, minus one. The learner predicts whether the operation can move that crossing, and row two\u2019s line rotates about it through the constraints the operation can reach, landing horizontal — a line whose equation no longer mentions x. The horizontal row gives y directly and back-substitution recovers x.",
    steps: ELIMINATION_STEPS,
    majorSteps: pickMajor(ELIMINATION_STEPS, [
      "system",
      "matrix",
      "aim",
      "detach",
      "scale",
      "double",
      "subtract",
      "promote",
      "plane",
      "predict",
      "pivot",
      "read",
    ]),
  },
  "solution-sets": {
    id: "solution-sets",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for the structure of the solution set of a 2 by 2 linear system, drawn in solution space. Two solutions of the same consistent system are marked, and the arrow between them then slides bodily to the origin, leaving a ghost where it started, so the same difference is seen to be a solution of the homogeneous system. The learner predicts what adding that difference back to a solution does before a third solution appears. All such differences fill the null space, a line through the origin, and the full solution set is that null line translated by one particular solution. A single point then sweeps that whole line off one parameter t, with the decomposition written beside it: the particular part never moves, the homogeneous part t times d is what varies, and their sum lands on the already-marked solutions at t equals one and t equals minus one. The three cases — empty, a single point, and a line — are then shown as three separate chapters.",
    steps: SOLUTION_SETS_STEPS,
    majorSteps: pickMajor(SOLUTION_SETS_STEPS, [
      "two-solutions",
      "difference",
      "predict-generate",
      "generate",
      "null-line",
      "translate",
      "parameterize",
      "case-empty",
      "case-point",
      "case-line",
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
      "predict-order",
      "order",
      "undo",
      "no-undo",
    ]),
  },
  "subspaces-rank": {
    id: "subspaces-rank",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for the column space, the null space, and rank, drawn as two labelled panels under an isometric projection. The left panel is the input space R three and the right is the output space R three. A copy of the unit cube appears in the output panel untouched and is then pushed through a rank two map, visibly flattening onto one plane. The columns of the map are then admitted one at a time: the first opens a line, the second points off that line so the reachable set grows to a plane and the rank grows with it, and the third, which equals two times the first plus three times the second, lands inside that plane and changes neither the reach nor the rank. The plane is then named the column space. Attention returns to the left panel, where a probe point travels a whole line of inputs while its image, computed through the same map, never leaves the output origin; that line is named the null space and is drawn in the input panel. The rank is counted, the learner predicts what a rank one map does to the null space, and then the plane is undeformed and re-deformed so the image collapses to a line while the null space grows to a plane.",
    steps: SUBSPACES_RANK_STEPS,
    majorSteps: pickMajor(SUBSPACES_RANK_STEPS, [
      "two-panels",
      "reach",
      "columns",
      "colspace",
      "crush",
      "nullspace",
      "count",
      "predict-rank-one",
      "rank-one",
    ]),
  },
  "rank-nullity": {
    id: "rank-nullity",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for the rank–nullity theorem, drawn as a ledger rather than as geometry. Three tokens representing the three input dimensions of a 3 by 3 map are counted out and then posted one at a time into one of two columns: survived, which counts the rank, or crushed, which counts the nullity. The running tally is computed from the tokens' own split, so its total is always the sum of the two counts. The learner predicts what degrading the map must do to the ledger before a token moves across it, changing the split while the total stays at three. Finally the shape changes to a 2 by 3 map: the surviving column has only two slots, a marked band shows the slot that cannot exist, and the scene concludes that no map from a bigger space to a smaller one can be one to one.",
    steps: RANK_NULLITY_STEPS,
    majorSteps: pickMajor(RANK_NULLITY_STEPS, [
      "budget",
      "post",
      "balance",
      "predict-degrade",
      "degrade",
      "ceiling",
      "forbidden",
    ]),
  },
  "change-of-basis": {
    id: "change-of-basis",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation for change of basis. A single arrow to the point (4, 1) is drawn once and never moves. It is first read against the standard square grid, then a second grid built from Lesson 1's basis fades in over the same arrow, with the two basis directions drawn in distinct colours. The learner predicts the point's coordinates against the new grid, and the reveal walks one step along the first basis vector and one along the second, landing exactly on the arrow's tip. Both readings are then relabelled with their basis subscripts. The scene switches subject from a point to a map: the unit square deforms under a matrix shown in standard coordinates, then returns to the identity and deforms again by the very same matrix over the eigenbasis, where two drawn directions only stretch and never turn — which is what makes that description diagonal.",
    steps: CHANGE_OF_BASIS_STEPS,
    majorSteps: pickMajor(CHANGE_OF_BASIS_STEPS, [
      "one-arrow",
      "swap-grid",
      "predict-readout",
      "new-readout",
      "hidden-subscript",
      "map-standard",
      "map-eigenbasis",
    ]),
  },
  "vectors-linear-combinations": {
    id: "vectors-linear-combinations",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation building linear combinations of two vectors. The second vector itself slides along the first until its tail sits on the first vector's tip, leaving a faint ghost where it started, so head-to-tail addition is a motion rather than a second arrow appearing. It then compares an independent span, the whole plane, with a dependent span, a single line, shows that a point on a dependent line has infinitely many representations, names an independent pair a basis, reads one fixed point in the standard basis, and lays the basis grid over it. The learner is asked to predict the point's coordinates in that basis before the same two arrows walk head-to-tail onto the point to reveal them; the point never moves.",
    steps: LINEAR_STEPS,
    majorSteps: pickMajor(LINEAR_STEPS, [
      "plane",
      "vector-v",
      "components",
      "vector-w",
      "addition",
      "scaling",
      "combination",
      "span-plane",
      "dependent",
      "dependent-inside",
      "basis",
      "read-standard",
      "predict-coordinates",
      "coordinates",
    ]),
  },
  "matrix-transformations": {
    id: "matrix-transformations",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation deriving the columns rule. Starting from the identity, each matrix column is moved in turn and the basis vector it carries moves with it while the coordinate grid visibly shears. A general vector is then drawn at its original position and written as one and a half times e one plus one half times e two. The animation pauses to let the learner predict the landing point from the two columns already on screen, and only then applies the transformation: the vector travels to the same combination of the transformed basis images, arriving at three and a half, one half, so the coefficients are seen to be unchanged. One gridline is then traced against its image to show that straight lines map to straight lines and the origin stays pinned, and the scene closes with a tour of scale, rotation, reflection, and a projection that collapses the plane, each reset to the identity before it is applied.",
    steps: MATRIX_STEPS,
    majorSteps: pickMajor(MATRIX_STEPS, [
      "identity",
      "col1",
      "col2",
      "sample",
      "predict-sample",
      "transform-sample",
      "grid",
      "compare",
      "presets",
      "summary",
    ]),
  },
  "determinant-area-scaling": {
    id: "determinant-area-scaling",
    size: SCENE_SIZE,
    ariaLabel:
      "Guided animation showing the unit square becoming a parallelogram, naming its area scale as the determinant with a readout computed live from the matrix so it never lags the shape, multiplying area in successive stretches on an announced diagonal digression, and collapsing through zero. An arc sweeping from the first column to the second shows orientation: the learner is asked to predict what a negative area factor can mean, and then the arc visibly reverses direction as the determinant passes below zero.",
    steps: DETERMINANT_STEPS,
    majorSteps: pickMajor(DETERMINANT_STEPS, [
      "identity",
      "basis",
      "parallelogram",
      "area",
      "expand",
      "collapse",
      "predict-negative",
      "negative",
      "sign",
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
      "stretch",
      "predict-reverse",
      "reverse",
      "collapse",
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
      "Guided derivation of the eigenvalues and eigenvectors, written out as a chain of equivalences on a page. Starting from A v equals lambda v, each line is produced by transforming the line above it and none is ever cleared, so the closing frame is the whole argument: lambda v moves across, v is factored out to give A minus lambda I times v equals zero, v is required to be nonzero, so A minus lambda I cannot be invertible, so its determinant is zero. Beside the chain a witness shows the one geometric fact licensing the line being written — A v and lambda v landing on the same point, their difference walking to the origin, and, only after the determinant condition has been written, the unit square flattening. The determinant is then computed from the entries, its roots are the eigenvalues, and each root is substituted back to read off its eigenspace one line at a time, because A minus lambda I kills exactly one of the two. Both eigendirections share the frame only in the closing state, under A itself.",
    steps: EIGEN_DERIVATION_STEPS,
    majorSteps: pickMajor(EIGEN_DERIVATION_STEPS, [
      "defining",
      "gather",
      "factor",
      "nonzero",
      "singular",
      "predict",
      "determinant",
      "expand",
      "roots",
      "eigenspaces",
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
      "Binary search trees: binary search probing a sorted array, a second search repeating the first probe, and then the probed cells lifted straight up into tree positions while a marked ruler shows that left-to-right order never changes. The ordering rule is read off the result. The keys are then re-inserted in increasing order, one at a time, each walking in turn to the far right to build a chain; the learner predicts that chain's worst-case comparison count before it is compared with the balanced shape's.",
    steps: BST_LIFT_STEPS,
    majorSteps: pickMajor(BST_LIFT_STEPS, [
      "establish",
      "probe-first",
      "probe-rest",
      "second-search",
      "lift",
      "read-the-rule",
      "interval-stays",
      "cost-is-depth",
      "degenerate",
      "predict-gap",
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
      "Karatsuba: reducing four multiplications to three. A weighted multiplication rectangle is split into four pieces, the two pieces sharing the middle place value have their labels travel together and merge into a single term, and a separate auxiliary rectangle is introduced. The learner predicts what remains once the two known corners are removed, and the corner tiles then slide out of the rectangle to leave the middle. Output carrying is shown with carry chips travelling between place-value columns, and the scene closes by counting out the leaf rows of a four-way and a three-way recurrence tree and drawing both counts as bars on one shared scale.",
    steps: KARATSUBA_STEPS,
    majorSteps: pickMajor(KARATSUBA_STEPS, [
      "setup",
      "foil",
      "weights",
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
