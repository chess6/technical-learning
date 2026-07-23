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
  /**
   * Fixed target point used by the basis / coordinate material: p = v + w.
   * Its standard-basis coordinates are `target` itself; in B = (v, w) it is
   * `coordinatesInBasis`.
   */
  target: Vector2;
  /** Coordinates of `target` in the basis B = (v, w): [p]_B = (1, 1). */
  coordinatesInBasis: Vector2;
  /**
   * Undisclosed-coordinate task point q = (-1, 5) = 2v - w. Its coordinates in
   * B = (v, w) are (2, -1); in the swapped basis B' = (w, v) they are (-1, 2).
   */
  q: Vector2;
  coordinatesInBasisQ: Vector2;
  coordinatesInBasisPrimeQ: Vector2;
  /**
   * Inside-span target r = (3, 6) = 3v. With the dependent pair (v, wDependent),
   * a·v + b·wDependent = r reduces to a + 2b = 3 — infinitely many solutions.
   */
  r: Vector2;
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
  // p = v + w = (4, 1) in the standard basis; (1, 1) in B = (v, w).
  target: [4, 1],
  coordinatesInBasis: [1, 1],
  // q = 2v - w = (-1, 5); [q]_B = (2, -1); [q]_B' = (-1, 2) with B' = (w, v).
  q: [-1, 5],
  coordinatesInBasisQ: [2, -1],
  coordinatesInBasisPrimeQ: [-1, 2],
  // r = 3v = (3, 6): inside span(v) so the dependent pair reaches it infinitely
  // many ways (a + 2b = 3).
  r: [3, 6],
  bound: 6,
};

/**
 * Shared example for the "Linear Systems" lesson. Deliberately built from
 * Lesson 1's exact numbers so the systems lesson strengthens that edge rather
 * than introducing fresh data:
 *
 * - `A` has columns v = (1, 2) and w = (3, -1) — Lesson 1's independent basis.
 *   So `A x = b` with `b = q = (-1, 5)` is the very system Lesson 1 solved by
 *   hand (a·v + b·w = q), unique solution x = (2, -1).
 * - `aDependent` has columns (1, 2) and (2, 4) = 2·(1, 2) — Lesson 1's
 *   dependent pair. With `bInfinite = r = (3, 6)` (on the column line) the
 *   system has infinitely many solutions; with `bNone = (3, 5)` (off the line)
 *   it has none.
 *
 * Matrices are stored column-wise-by-construction: A = [[a11, a12], [a21, a22]]
 * so column 1 = (a11, a21) = v and column 2 = (a12, a22) = w.
 */
export interface LinearSystemExample {
  id: string;
  /** Independent-column matrix (columns are Lesson 1's v and w). */
  a: [[number, number], [number, number]];
  /** Dependent-column matrix (columns are Lesson 1's v and 2v). */
  aDependent: [[number, number], [number, number]];
  /** Target for the unique case (= Lesson 1's q). Solution is `solution`. */
  b: Vector2;
  solution: Vector2;
  /** Target on the dependent column line (= Lesson 1's r): infinitely many. */
  bInfinite: Vector2;
  /** Target off the dependent column line: no solution. */
  bNone: Vector2;
  /**
   * Nearly-dependent columns (2, 4.1) ≈ 2·(1, 2): still independent, so the
   * system is uniquely solvable, but `det = 0.1` is tiny — the solution is far
   * off-screen and extremely sensitive to `b`. An early seed for conditioning.
   */
  aNearSingular: [[number, number], [number, number]];
  /** Target used with `aNearSingular`; its unique solution is `solutionNearSingular`. */
  bNearSingular: Vector2;
  /** The far off-screen unique solution of the near-singular system. */
  solutionNearSingular: Vector2;
  /** Symmetric clamp bound for sliders and the draggable target. */
  bound: number;
}

export const LINEAR_SYSTEM_EXAMPLE: LinearSystemExample = {
  id: "systems-default",
  a: [
    [1, 3],
    [2, -1],
  ],
  aDependent: [
    [1, 2],
    [2, 4],
  ],
  b: [-1, 5],
  solution: [2, -1],
  bInfinite: [3, 6],
  bNone: [3, 5],
  // Columns (1, 2) and (2, 4.1): det = 1·4.1 − 2·2 = 0.1 (nearly singular).
  // With b = (3, 5) the unique solution is (23, −10) — far outside the view box.
  aNearSingular: [
    [1, 2],
    [2, 4.1],
  ],
  bNearSingular: [3, 5],
  solutionNearSingular: [23, -10],
  bound: 6,
};

/**
 * A SECOND, deliberately fresh system for the systems/elimination/solution-set
 * module — distinct numbers from `systems-default` so a drill cannot be passed by
 * recalling the worked answer. Used for the module's fresh-instance (E3) drills:
 *
 * - Independent `a` has columns (1, 3) and (2, 1) — det = -5 — so `A x = b` with
 *   `b = (4, -3)` has the unique solution `(-2, 3)`. Elimination on the row form
 *   `x + 2y = 4`, `3x + y = -3` uses multiplier 3 (R2 → R2 - 3R1), giving the
 *   triangular row `(0, -5 | -15)`, then `y = 3`, `x = -2`.
 * - Dependent `aDependent` has columns (1, 2) and (3, 6) = 3·(1, 2). With
 *   `bInfinite = (4, 8)` (on the column line) the system is consistent with
 *   particular solution `(4, 0)`, null direction `(3, -1)`, and a third solution
 *   `(7, -1)`. With `bNone = (4, 9)` (off the line) it has no solution.
 *
 * Every number here is verified against the shared `src/math` helpers in
 * `src/lessons/__tests__/freshExample.test.ts` (Cramer solve, classification,
 * particular solution, null space, generativity).
 */
export interface LinearSystemFreshExample {
  id: string;
  /** Independent-column matrix; columns (1, 3) and (2, 1); det = -5. */
  a: [[number, number], [number, number]];
  /** Target for the unique case. Its unique solution is `solution`. */
  b: Vector2;
  solution: Vector2;
  /** Dependent-column matrix; columns (1, 2) and (3, 6) = 3·(1, 2). */
  aDependent: [[number, number], [number, number]];
  /** Target on the dependent column line: infinitely many solutions. */
  bInfinite: Vector2;
  /** A particular solution `x_p` of the dependent consistent system. */
  particular: Vector2;
  /** A basis vector of `Null(aDependent)`. */
  nullDirection: Vector2;
  /** `particular + nullDirection` — a second solution made without re-solving. */
  thirdSolution: Vector2;
  /** Target off the dependent column line: no solution. */
  bNone: Vector2;
  /** Symmetric clamp bound for sliders and the draggable target. */
  bound: number;
}

export const LINEAR_SYSTEM_FRESH: LinearSystemFreshExample = {
  id: "systems-fresh",
  a: [
    [1, 2],
    [3, 1],
  ],
  b: [4, -3],
  solution: [-2, 3],
  aDependent: [
    [1, 3],
    [2, 6],
  ],
  bInfinite: [4, 8],
  particular: [4, 0],
  nullDirection: [3, -1],
  thirdSolution: [7, -1],
  bNone: [4, 9],
  bound: 9,
};

/**
 * The matrix-as-transformation lesson reuses the shared registry example
 * A = [[2, 1], [0, 1]] rather than redefining it.
 */
export const MATRIX_LESSON_EXAMPLE: MatrixExample =
  requireMatrixExample("shear-2-1");

/** Lesson 3 main example — positive expansion (same A as Lesson 2 for continuity). */
export const DETERMINANT_LESSON_EXAMPLE: MatrixExample =
  requireMatrixExample("shear-2-1");

/** Lesson 4 main example — two distinct real eigendirections. */
export const EIGEN_LESSON_EXAMPLE: MatrixExample =
  requireMatrixExample("eigen-distinct");

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
  { id: "projection", label: "Projection", exampleId: "projection-x" },
  { id: "singular", label: "Singular collapse", exampleId: "singular-collapse" },
];

export const DETERMINANT_LESSON_PRESETS: readonly TransformPreset[] = [
  { id: "identity", label: "Identity", exampleId: "identity" },
  { id: "expand", label: "Expand", exampleId: "uniform-scale" },
  { id: "contract", label: "Contract", exampleId: "contraction" },
  { id: "shear", label: "Shear", exampleId: "shear-2-1" },
  { id: "singular", label: "Collapse", exampleId: "singular-collapse" },
  { id: "near-singular", label: "Near-singular", exampleId: "near-singular" },
  { id: "negative", label: "Negative det", exampleId: "determinant-negative" },
  { id: "reflection", label: "Reflection", exampleId: "reflection" },
];

export const EIGEN_LESSON_PRESETS: readonly TransformPreset[] = [
  { id: "distinct", label: "Distinct real", exampleId: "eigen-distinct" },
  { id: "negative", label: "Negative λ", exampleId: "eigen-negative" },
  { id: "zero", label: "Zero λ", exampleId: "eigen-zero" },
  { id: "scalar", label: "Scalar (all directions)", exampleId: "eigen-repeated-diagonalizable" },
  { id: "defective", label: "Defective", exampleId: "eigen-repeated-defective" },
  { id: "rotation", label: "No real", exampleId: "eigen-no-real" },
];
