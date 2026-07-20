import type { CollapseDimension3, Matrix3x3, Vector3 } from "./matrices3";

/**
 * Curated 3×3 eigen example for the Lesson 4 "3D extension".
 *
 * A = 1.5 · P, where P is the cyclic-permutation matrix (120° rotation about
 * the main diagonal). Pedagogical rationale:
 *
 * - Exactly one real eigenvalue λ = 1.5, with eigendirection along the oblique
 *   axis n = (1,1,1)/√3 — not a coordinate axis, so spatial invariance is clear.
 * - The remaining eigenvalues form a complex-conjugate pair (negative quadratic
 *   discriminant of the curated characteristic polynomial).
 * - A single application of A rotates a generic vector 120° around the invariant
 *   axis and scales it by 1.5. (An outward spiral appears only under *repeated*
 *   application x, Ax, A²x, … — the initial 3D scene does not animate that.)
 * - Under A − λI the unit cube collapses to a plane (rank 2).
 *
 * Characteristic polynomial (authored as data, not solved numerically):
 *   χ_A(t) = (t − 1.5)(t² + 1.5 t + 2.25)
 * Quadratic discriminant: 1.5² − 4(2.25) = −6.75 < 0.
 */

/** Cyclic permutation: e₁ ↦ e₂ ↦ e₃ ↦ e₁ (120° rotation about (1,1,1)). */
export const CYCLIC_PERMUTATION_3: Matrix3x3 = [
  [0, 0, 1],
  [1, 0, 0],
  [0, 1, 0],
];

/** A = 1.5 · P — the single curated Lesson 4 3D-extension matrix. */
export const EIGEN_3D_EXTENSION_MATRIX: Matrix3x3 = [
  [0, 0, 1.5],
  [1.5, 0, 0],
  [0, 1.5, 0],
];

/**
 * Known factorization of χ_A(t) = det(A − t I).
 * Recorded so tests can prove "exactly one real eigenvalue" without a cubic solver.
 */
export type CuratedCharPoly3 = {
  /** Linear factor (t − λ). */
  readonly realRoot: number;
  /** Quadratic factor t² + b t + c with b² − 4c < 0. */
  readonly quadratic: {
    readonly b: number;
    readonly c: number;
  };
};

export const EIGEN_3D_EXTENSION_CHAR_POLY: CuratedCharPoly3 = {
  realRoot: 1.5,
  quadratic: { b: 1.5, c: 2.25 },
};

export type Eigen3DExtensionExample = {
  readonly id: "eigen-3d-cyclic-stretch";
  readonly title: string;
  readonly description: string;
  readonly matrix: Matrix3x3;
  readonly eigenvalue: number;
  /** Unit eigendirection along (1,1,1). */
  readonly eigendirection: Vector3;
  /** Collapse of the unit cube under A − λI. */
  readonly collapseUnderShift: CollapseDimension3;
  readonly charPoly: CuratedCharPoly3;
  /**
   * Ordinary sample vectors used in the 3D scene.
   * Under a *single* application of A each rotates 120° about the invariant
   * axis and scales by 1.5 — not a spiral.
   */
  readonly ordinaryVectors: readonly Vector3[];
};

const INV_SQRT3 = 1 / Math.sqrt(3);

export const EIGEN_3D_EXTENSION_EXAMPLE: Eigen3DExtensionExample = {
  id: "eigen-3d-cyclic-stretch",
  title: "Cyclic stretch about an oblique axis",
  description:
    "A = 1.5 P rotates ordinary vectors 120° about (1,1,1) and scales them by 1.5; the diagonal is the unique real eigendirection.",
  matrix: EIGEN_3D_EXTENSION_MATRIX,
  eigenvalue: 1.5,
  eigendirection: [INV_SQRT3, INV_SQRT3, INV_SQRT3],
  collapseUnderShift: "plane",
  charPoly: EIGEN_3D_EXTENSION_CHAR_POLY,
  ordinaryVectors: [
    [1, 0, 0],
    [0, 1, 0],
    [0.8, 0.3, 0],
  ],
};
