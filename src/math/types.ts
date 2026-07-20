/** Pure mathematical types — no React, Mafs, Motion Canvas, or DOM. */

export type Vector2 = readonly [number, number];

export type Matrix2x2 = readonly [
  readonly [number, number],
  readonly [number, number],
];

export type MatrixExample = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly matrix: Matrix2x2;
  readonly inputVector?: Vector2;
};

export type EigenPair = {
  readonly eigenvalue: number;
  readonly eigenvector: Vector2;
};

/**
 * Discriminated 2D subspace — preferred over raw basis arrays so callers
 * do not infer meaning from length alone.
 */
export type Subspace2D =
  | { readonly kind: "zero" }
  | { readonly kind: "line"; readonly basis: Vector2 }
  | { readonly kind: "plane"; readonly basis: readonly [Vector2, Vector2] };

/**
 * Explicit 2×2 eigen analysis. Edge cases are named kinds rather than
 * ambiguous empty/partial arrays.
 */
export type EigenAnalysis2x2 =
  | {
      readonly kind: "distinct-real";
      readonly pairs: readonly EigenPair[];
    }
  | {
      readonly kind: "repeated-real";
      readonly eigenvalue: number;
      /** One vector if defective; two orthonormal basis vectors if A = λI. */
      readonly eigenspaceBasis: readonly Vector2[];
      readonly diagonalizable: boolean;
    }
  | {
      readonly kind: "complex";
      readonly realPart: number;
      readonly imaginaryMagnitude: number;
    };

export const DEFAULT_TOLERANCE = 1e-9;
