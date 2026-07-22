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
  { id: "dependent-inside", title: "One point, infinitely many (a, b)", duration: 5 },
  { id: "basis", title: "Independent pair → basis", duration: 4 },
  { id: "coordinates", title: "Coordinates in a basis", duration: 7 },
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

/**
 * Chapter 0 — "Why Linear Algebra?" A recognizable multi-part craft is the
 * visual subject: it is established first, then the basis vectors and one marked
 * vertex are revealed, then each canonical transform is shown by RESETTING to
 * the identity and animating I → A_preset (never morphing one unrelated preset
 * straight into another). A translation beat shows the one move a 2×2 matrix
 * cannot make, and the scene freezes on the central mystery. No
 * column/derivation teaching here (that is Lesson 2).
 */
export const CHAPTER0_SEGMENTS: readonly SceneSegment[] = [
  { id: "establish", title: "One craft on a grid", duration: 4 },
  { id: "reveal", title: "Axes and one marked vertex", duration: 4 },
  { id: "scale", title: "Scaling", duration: 5 },
  { id: "rotation", title: "Rotation", duration: 5 },
  { id: "reflection", title: "Reflection", duration: 5 },
  { id: "shear", title: "Shear", duration: 5 },
  { id: "projection", title: "Projection collapses the plane", duration: 5 },
  { id: "translation", title: "The one move a matrix can't make", duration: 5.5 },
  { id: "mystery", title: "Four numbers, every vertex", duration: 5 },
];

/**
 * Lesson 2 callback — a short "return to the graphic" animation shown AFTER the
 * columns rule is derived. It writes a vertex as x = a·e₁ + b·e₂, then shows the
 * image is a·T(e₁) + b·T(e₂), and applies that to several marked vertices of the
 * shared craft. Resolves Chapter 0's mystery with the derived rule.
 */
export const COLUMNS_RULE_GRAPHIC_SEGMENTS: readonly SceneSegment[] = [
  { id: "vertex", title: "One vertex as a·e₁ + b·e₂", duration: 5 },
  { id: "image", title: "Its image is a·T(e₁) + b·T(e₂)", duration: 5.5 },
  { id: "all-vertices", title: "Every vertex follows the two columns", duration: 5.5 },
];

/**
 * "Linear Systems" Watch scene — one system `A x = b`, shown as two pictures of
 * the same question and then the no / one / infinitely-many trichotomy. The
 * scene shows ONE picture at a time (one conceptual change at a time): first the
 * row picture (two lines meeting), then the column picture (combine the columns
 * to reach b), then walks the three cases in the row picture where they read
 * fastest. Reuses Lesson 1's numbers throughout.
 */
export const SYSTEMS_SEGMENTS: readonly SceneSegment[] = [
  { id: "equations", title: "One system, two equations", duration: 4 },
  { id: "row", title: "Row picture: lines meet", duration: 6 },
  { id: "regroup", title: "Regroup by columns", duration: 5 },
  { id: "column", title: "Column picture: combine to reach b", duration: 7 },
  { id: "unique", title: "One meeting point, one recipe", duration: 4 },
  { id: "infinite", title: "Same line: infinitely many", duration: 6 },
  { id: "none", title: "Parallel lines: no solution", duration: 5.5 },
  { id: "summary", title: "Two pictures, one question", duration: 4 },
];

/**
 * "Elimination" Watch scene — one row operation as reversible constraint
 * manipulation. Three synchronized views (written equations, augmented matrix,
 * the two constraint lines) stay in sync while R2 → R2 − 2·R1 pivots the second
 * line around the fixed intersection, ending on a triangular system read off by
 * back-substitution. Reuses Lesson 3's system A = [[1,3],[2,-1]], b = (−1,5).
 */
export const ELIMINATION_SEGMENTS: readonly SceneSegment[] = [
  { id: "setup", title: "One system, three views", duration: 5 },
  { id: "operation", title: "R2 → R2 − 2·R1", duration: 7 },
  { id: "triangular", title: "Triangular: read off y, back-substitute", duration: 6 },
  { id: "invariance", title: "The crossing never moved", duration: 5 },
  { id: "summary", title: "Same solutions, easier system", duration: 4 },
];

export const SPIKE_SEGMENTS: readonly SceneSegment[] = [
  { id: "identity", title: "Identity grid", duration: 0.4 },
  { id: "transform", title: "Apply the matrix", duration: 2 },
  { id: "result", title: "Transformed space", duration: 0.6 },
];

export const DETERMINANT_SEGMENTS: readonly SceneSegment[] = [
  { id: "identity", title: "Unit square area 1", duration: 3 },
  { id: "basis", title: "Columns land", duration: 3.5 },
  { id: "parallelogram", title: "Same square, new shape", duration: 3.5 },
  { id: "area", title: "Name the area factor", duration: 4 },
  // Successive diagonal stretches need held intermediate (×a then ×d).
  { id: "expand", title: "Area multiplies in stages", duration: 5.5 },
  { id: "collapse", title: "Factor → 0 collapse", duration: 4 },
  { id: "negative", title: "Past zero: flip", duration: 4.5 },
  { id: "sign", title: "Magnitude vs sign", duration: 3.5 },
  { id: "summary", title: "Signed area scaling", duration: 3 },
];

export const EIGENVECTOR_SEGMENTS: readonly SceneSegment[] = [
  { id: "fan", title: "A fan of directions", duration: 3.5 },
  { id: "apply", title: "Most directions turn", duration: 5 },
  { id: "highlight", title: "Some stay on their line", duration: 4.5 },
  { id: "equation", title: "Av = λv", duration: 3.5 },
  { id: "lambdas", title: "Stretch, reverse, collapse", duration: 11 },
  { id: "scalar", title: "Scalar: every direction", duration: 5 },
  { id: "defective", title: "Defective: only one line", duration: 5 },
  { id: "rotation", title: "No real eigenvectors", duration: 4.5 },
  { id: "summary", title: "Invariant directions", duration: 4 },
];

/**
 * Computational derivation ladder (embedded in the Lesson 4 worked example).
 * Teaches how to compute eigenvalues/eigenvectors — not a second Watch block.
 */
export const EIGEN_DERIVATION_SEGMENTS: readonly SceneSegment[] = [
  { id: "recap", title: "Av = λv", duration: 4 },
  { id: "shift", title: "(A − λI)v = 0", duration: 5.5 },
  { id: "charpoly", title: "det(A − λI) = 0", duration: 5.5 },
  { id: "solveLambda", title: "Solve for λ", duration: 4.5 },
  { id: "solveV", title: "Solve the eigenspaces", duration: 6 },
  { id: "interpret", title: "Interpret geometrically", duration: 4.5 },
];

/**
 * Karatsuba Watch scene — elementary place-value breakthrough.
 * No polynomial/`deeper` beat: that material stays in depth layers / explorer.
 * Total ~58s.
 */
export const KARATSUBA_SEGMENTS: readonly SceneSegment[] = [
  { id: "setup", title: "Two numbers, one rectangle", duration: 4 },
  { id: "foil", title: "Four pieces (FOIL)", duration: 5 },
  { id: "weights", title: "Place-value weights", duration: 5.5 },
  { id: "share", title: "The middle collapses", duration: 5.5 },
  { id: "aux-rect", title: "A different rectangle", duration: 5.5 },
  { id: "subtract", title: "Peel off the corners", duration: 6 },
  { id: "reassemble", title: "Rebuild the answer", duration: 5.5 },
  { id: "carry-vs-width", title: "Two kinds of too big", duration: 7 },
  { id: "branch", title: "Four calls or three?", duration: 7 },
  { id: "exponent", title: "The exponent bends", duration: 7 },
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
