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

export const COMPOSITION_LESSON_PRESETS: readonly TransformPreset[] = [
  { id: "identity", label: "Identity", exampleId: "identity" },
  { id: "shear", label: "Shear", exampleId: "shear-2-1" },
  { id: "rotation", label: "Rotation", exampleId: "rotation" },
  { id: "reflection", label: "Reflection", exampleId: "reflection" },
  { id: "scale", label: "Scale", exampleId: "uniform-scale" },
  { id: "singular", label: "Collapse", exampleId: "singular-collapse" },
  { id: "near-singular", label: "Near-singular", exampleId: "near-singular" },
];

/**
 * Lesson 6 (`matrix-composition`) practice data — deliberately FRESH numbers,
 * distinct from the scene's `A = shear-2-1` and `R = rotation`, so a drill
 * cannot be passed by recalling what was animated.
 *
 * Every value below is verified against `src/math` in
 * `src/lessons/__tests__/compositionExample.test.ts` (product, product columns,
 * inverse, singular parameter, null direction) — nothing here is hand-computed
 * and trusted.
 *
 * - `productLeft` M and `productRight` N: `MN = [[7,4],[0,8]]` while
 *   `NM = [[6,2],[-1,9]]`, so the pair is a genuine non-commuting counterexample
 *   with clean integer entries in both orders.
 * - `invertibleSource` K has `det = 1`, so `K⁻¹ = [[1,-1],[-2,3]]` is integral —
 *   the learner can build it by solving `K x = e_j` without fractions.
 * - `singularRow` with `singularParameter = 3` makes `[[2,6],[1,k]]` singular.
 * - `singularFresh` collapses the plane; `singularNullDirection` is a nonzero
 *   vector it sends to `0` (the witness that two inputs share an output).
 */
export interface CompositionFreshExample {
  id: string;
  /** Left factor M — applied SECOND in the product MN. */
  productLeft: [[number, number], [number, number]];
  /** Right factor N — applied FIRST in the product MN. */
  productRight: [[number, number], [number, number]];
  /** MN, the composite "apply N, then M". */
  product: [[number, number], [number, number]];
  /** NM — the other order, which differs. */
  productReversed: [[number, number], [number, number]];
  /** An invertible matrix with det = 1, so its inverse has integer entries. */
  invertibleSource: [[number, number], [number, number]];
  /** The inverse of `invertibleSource`. */
  inverseOfSource: [[number, number], [number, number]];
  /** Fixed entries of the parameterized matrix `[[2,6],[1,k]]`. */
  singularRow: [number, number];
  /** The value of `k` that makes `[[2,6],[1,k]]` singular. */
  singularParameter: number;
  /** A fresh singular matrix, for the collapse-witness construction. */
  singularFresh: [[number, number], [number, number]];
  /** A nonzero vector `singularFresh` sends to zero. */
  singularNullDirection: Vector2;
}

export const COMPOSITION_FRESH: CompositionFreshExample = {
  id: "composition-fresh",
  productLeft: [
    [3, 1],
    [-1, 2],
  ],
  productRight: [
    [2, 0],
    [1, 4],
  ],
  product: [
    [7, 4],
    [0, 8],
  ],
  productReversed: [
    [6, 2],
    [-1, 9],
  ],
  invertibleSource: [
    [3, 1],
    [2, 1],
  ],
  inverseOfSource: [
    [1, -1],
    [-2, 3],
  ],
  singularRow: [2, 6],
  singularParameter: 3,
  singularFresh: [
    [3, 6],
    [1, 2],
  ],
  singularNullDirection: [2, -1],
};

/**
 * Lesson 8 / 9 (`subspaces-rank`, `rank-nullity`) 3×3 examples.
 *
 * R^3 is the smallest space in which rank is a non-degenerate count: a map can
 * send the unit cube to a solid, a plane, a line, or a point, so "collapse" stops
 * being binary. Each preset's rank is VERIFIED against `src/math` in
 * `src/lessons/__tests__/subspaceExample.test.ts` — the labels below are claims
 * the tests hold, not comments.
 *
 * `rank-two-3d` is the scene's main map: row 3 = row 1 + row 2. `rank-one-3d`
 * has every row a multiple of (1,2,3), so its image is a line and its null space
 * is a plane — the pair that shows the two dimensions moving in opposite
 * directions.
 */
export interface SubspacePreset {
  id: string;
  label: string;
  matrix: readonly [
    readonly [number, number, number],
    readonly [number, number, number],
    readonly [number, number, number],
  ];
  /** Rank, asserted by test — never trusted from this literal alone. */
  rank: number;
}

export const SUBSPACE_PRESETS: readonly SubspacePreset[] = [
  {
    id: "full-rank-3d",
    label: "Rank 3 (solid)",
    matrix: [
      [1, 0, 2],
      [0, 1, 3],
      [0, 0, 1],
    ],
    rank: 3,
  },
  {
    id: "rank-two-3d",
    label: "Rank 2 (plane)",
    matrix: [
      [1, 0, 2],
      [0, 1, 3],
      [1, 1, 5],
    ],
    rank: 2,
  },
  {
    id: "rank-one-3d",
    label: "Rank 1 (line)",
    matrix: [
      [1, 2, 3],
      [2, 4, 6],
      [3, 6, 9],
    ],
    rank: 1,
  },
  {
    id: "rank-zero-3d",
    label: "Rank 0 (point)",
    matrix: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    rank: 0,
  },
];

/**
 * FRESH 3×3 maps for L8/L9 practice — different numbers from every preset above,
 * so a drill cannot be passed by recalling what the scene animated. Verified in
 * the same test.
 */
export const SUBSPACE_FRESH = {
  /** Rank 2: row 3 = 2·row 1 − row 2. Pivot columns 0 and 1. */
  rankTwo: [
    [2, 1, 0],
    [0, 3, 1],
    [4, -1, -1],
  ] as const,
  /** Rank 1: every row is a multiple of (1, -1, 2). Null space is a plane. */
  rankOne: [
    [1, -1, 2],
    [3, -3, 6],
    [-2, 2, -4],
  ] as const,
  /** Wide 2×3: Col(A) lives in R², Null(A) lives in R³. */
  wide: [
    [1, 2, 3],
    [0, 1, 4],
  ] as const,
} as const;

export const EIGEN_LESSON_PRESETS: readonly TransformPreset[] = [
  { id: "distinct", label: "Distinct real", exampleId: "eigen-distinct" },
  { id: "negative", label: "Negative λ", exampleId: "eigen-negative" },
  { id: "zero", label: "Zero λ", exampleId: "eigen-zero" },
  { id: "scalar", label: "Scalar (all directions)", exampleId: "eigen-repeated-diagonalizable" },
  { id: "defective", label: "Defective", exampleId: "eigen-repeated-defective" },
  { id: "rotation", label: "No real", exampleId: "eigen-no-real" },
];

/* --------------------------------------------------------------------------
 * Binary search trees (Algorithmic Thinking · data structures)
 *
 * One source of truth for every key set the BST lesson uses. The guided scene,
 * the explorer, the worked examples, and the exercises all read from here, so a
 * number can never drift between what is animated and what is graded.
 * ------------------------------------------------------------------------ */

export interface BstKeySetExample {
  id: string;
  /** Keys in ASCENDING order — the array the bridge runs binary search on. */
  sorted: readonly number[];
  /** Optional insertion order when the example is about a specific shape. */
  order?: readonly number[];
  /** The key the scene or an exercise searches for. */
  target?: number;
}

/**
 * The scene's and the explorer's shared key set. Seven keys so the balanced
 * shape is a full tree of height 2 and the sorted order degenerates to a
 * seven-node chain — the two extremes are both clean at this size.
 */
export const BST_SEVEN: BstKeySetExample = {
  id: "bst-seven",
  sorted: [4, 8, 15, 16, 23, 42, 50],
  target: 23,
};

/** Deliberately unseen in the scene: the fresh instance outcome O1 grades. */
export const BST_FRESH_TRACE: BstKeySetExample = {
  id: "bst-fresh-trace",
  sorted: [7, 12, 20, 31, 39, 47, 55],
  order: [31, 12, 47, 7, 20, 39, 55],
  target: 20,
};

/** The Check and outcome O2: one key set, two orders, very different cost. */
export const BST_ORDERS_PAIR = {
  id: "bst-orders-pair",
  sorted: [2, 5, 9, 11, 14, 18, 25] as const,
  medianFirst: [11, 5, 2, 9, 18, 14, 25] as const,
  sorted_order: [2, 5, 9, 11, 14, 18, 25] as const,
} as const;

/**
 * The counterexample carrying supporting insight C: 20 sits in 25's RIGHT
 * subtree, where only keys above 25 may live — yet every parent–child pair is
 * ordered correctly, so the naive local check accepts it.
 */
export const BST_INVALID_LOCAL = {
  id: "bst-invalid-local",
  offendingKey: 20,
  interval: { lo: 25, hi: 30 },
} as const;

/* --------------------------------------------------------------------------
 * Red–black trees (Algorithmic Thinking · data structures)
 *
 * Concrete instances shared by the scene, the explorer, and the exercises. Every
 * derived fact (shape, arity, repair kind, black heights) is COMPUTED from
 * `src/math/redBlackTrees`, never written down here — these are only the inputs.
 * ------------------------------------------------------------------------ */

export const RBT_CANONICAL = {
  id: "rbt-canonical",
  /** Sorted insertion — the order that destroys a plain BST and not this one. */
  order: [10, 20, 30, 40, 50, 60, 70] as const,
} as const;

/** A standalone full 4-node, and the key that forces it to split. */
export const RBT_FOUR_NODE = {
  id: "rbt-four-node",
  keys: [20, 30, 40] as const,
  arriving: 35,
  /** Promoting the middle leaves exactly two 2-nodes. */
  promoted: 30,
} as const;

/** Deliberately unseen in the scene: the fresh instance outcome O2 grades. */
export const RBT_FRESH_CLASSIFY = {
  id: "rbt-fresh-classify",
  order: [8, 3, 11, 1, 6, 14, 4] as const,
  arriving: 13,
} as const;

/** The bare-rotation counterexample: rotate left at 20, with no recolour. */
export const RBT_BARE_ROTATION = {
  id: "rbt-bare-rotation",
  at: 20,
  direction: "left" as const,
  /** The leaf whose root→nil path gains a black node. */
  brokenPathLeaf: 10,
} as const;

/** A B-tree node of a branching order the lesson never draws (O7 transfer). */
export const RBT_BTREE_WIDE = {
  id: "rbt-btree-wide",
  keys: [5, 9, 14, 21, 30] as const,
  promoted: 14,
  keysPerHalf: 2,
} as const;
