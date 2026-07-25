import { DEFAULT_TOLERANCE, type Matrix2x2, type Vector2 } from "./types";
import { IDENTITY_MATRIX, matrixMatrixMultiply } from "./matrices";
import { analyzeEigen2x2 } from "./eigen";
import { changeOfBasisMatrix, isDiagonal } from "./changeOfBasis";
import { inverse2x2 } from "./matrixComposition";
import { geometricMultiplicity } from "./subspaces";
import type { Matrix } from "./linearSystemsGeneral";

/**
 * Diagonalization and its limits — the math layer for the Lesson 11 sequel.
 *
 * The lesson's honest half is that diagonalization OFTEN FAILS, so this module
 * is built to report failure precisely rather than to succeed quietly:
 * `diagonalize2x2` returns a discriminated result naming *why* a matrix is not
 * diagonalizable (defective, or no real eigenvalues), not `null`.
 *
 * The criterion used is the one Lesson 9 made computable: a 2×2 matrix is
 * diagonalizable over R exactly when its geometric multiplicities sum to 2.
 * That is deliberately not a special-cased list of matrix shapes — it is the
 * general statement, evaluated.
 */

/** How often λ appears as a root of the characteristic polynomial. */
export function algebraicMultiplicity2x2(
  matrix: Matrix2x2,
  lambda: number,
  tolerance = 1e-8,
): number {
  const analysis = analyzeEigen2x2(matrix, tolerance);
  if (analysis.kind === "complex") return 0;
  if (analysis.kind === "repeated-real") {
    return Math.abs(analysis.eigenvalue - lambda) <= tolerance ? 2 : 0;
  }
  return analysis.pairs.filter(
    (pair) => Math.abs(pair.eigenvalue - lambda) <= tolerance,
  ).length;
}

/**
 * The real eigenvalues of `matrix`, each listed once, with both multiplicities.
 * `geometric <= algebraic` always; a strict inequality is what "defective"
 * means.
 */
export type EigenvalueMultiplicity = {
  readonly eigenvalue: number;
  readonly algebraic: number;
  readonly geometric: number;
};

export function eigenvalueMultiplicities2x2(
  matrix: Matrix2x2,
  tolerance = 1e-8,
): readonly EigenvalueMultiplicity[] {
  const analysis = analyzeEigen2x2(matrix, tolerance);
  if (analysis.kind === "complex") return [];
  const values =
    analysis.kind === "repeated-real"
      ? [analysis.eigenvalue]
      : analysis.pairs.map((pair) => pair.eigenvalue);
  return values.map((eigenvalue) => ({
    eigenvalue,
    algebraic: algebraicMultiplicity2x2(matrix, eigenvalue, tolerance),
    geometric: geometricMultiplicity(
      matrix as unknown as Matrix,
      eigenvalue,
      Math.max(tolerance, DEFAULT_TOLERANCE),
    ),
  }));
}

/**
 * The outcome of trying to diagonalize. Failure is NAMED, because the two ways
 * it fails are pedagogically different: a defective matrix has too few
 * eigendirections over R, while a rotation has none at all.
 */
export type Diagonalization2x2 =
  | {
      readonly kind: "diagonalizable";
      /** Columns are the eigenvectors, in the same order as `diagonal`. */
      readonly p: Matrix2x2;
      /** D = P⁻¹AP, with the eigenvalues on the diagonal. */
      readonly diagonal: Matrix2x2;
      readonly eigenvalues: readonly [number, number];
    }
  | {
      /** Real eigenvalues exist, but they supply too few directions. */
      readonly kind: "defective";
      readonly eigenvalue: number;
      readonly algebraic: number;
      readonly geometric: number;
    }
  | {
      /** No real eigenvalues at all — e.g. a rotation. */
      readonly kind: "no-real-eigenvalues";
      readonly realPart: number;
      readonly imaginaryMagnitude: number;
    };

export function diagonalize2x2(
  matrix: Matrix2x2,
  tolerance = 1e-8,
): Diagonalization2x2 {
  const analysis = analyzeEigen2x2(matrix, tolerance);

  if (analysis.kind === "complex") {
    return {
      kind: "no-real-eigenvalues",
      realPart: analysis.realPart,
      imaginaryMagnitude: analysis.imaginaryMagnitude,
    };
  }

  if (analysis.kind === "repeated-real") {
    const multiplicity = eigenvalueMultiplicities2x2(matrix, tolerance)[0]!;
    if (multiplicity.geometric < multiplicity.algebraic) {
      return {
        kind: "defective",
        eigenvalue: multiplicity.eigenvalue,
        algebraic: multiplicity.algebraic,
        geometric: multiplicity.geometric,
      };
    }
    // Geometric multiplicity 2 for a 2×2 means A = λI, already diagonal.
    return {
      kind: "diagonalizable",
      p: IDENTITY_MATRIX,
      diagonal: matrix,
      eigenvalues: [analysis.eigenvalue, analysis.eigenvalue],
    };
  }

  const [first, second] = analysis.pairs;
  const p = changeOfBasisMatrix(
    first!.eigenvector as Vector2,
    second!.eigenvector as Vector2,
  );
  const pInverse = inverse2x2(p, DEFAULT_TOLERANCE);
  if (!pInverse) {
    // Two distinct eigenvalues always give independent eigenvectors, so this is
    // unreachable for well-formed input; report defect rather than throw.
    return {
      kind: "defective",
      eigenvalue: first!.eigenvalue,
      algebraic: 1,
      geometric: 1,
    };
  }
  return {
    kind: "diagonalizable",
    p,
    diagonal: matrixMatrixMultiply(pInverse, matrixMatrixMultiply(matrix, p)),
    eigenvalues: [first!.eigenvalue, second!.eigenvalue],
  };
}

/** Convenience predicate. Diagonalizable over the REALS. */
export function isDiagonalizable2x2(
  matrix: Matrix2x2,
  tolerance = 1e-8,
): boolean {
  return diagonalize2x2(matrix, tolerance).kind === "diagonalizable";
}

/**
 * `A^k` computed the slow, honest way — repeated multiplication. Used to CHECK
 * the diagonalization shortcut rather than to replace it, so the lesson's claim
 * that `A^k = P D^k P⁻¹` is verified against something independent.
 */
export function matrixPower2x2(matrix: Matrix2x2, k: number): Matrix2x2 {
  if (k < 0 || !Number.isInteger(k)) {
    throw new Error("matrixPower2x2: k must be a non-negative integer");
  }
  let result: Matrix2x2 = IDENTITY_MATRIX;
  for (let i = 0; i < k; i += 1) {
    result = matrixMatrixMultiply(result, matrix);
  }
  return result;
}

/** `D^k` for a diagonal `D` — entrywise powers, which is the whole point. */
export function diagonalPower2x2(diagonal: Matrix2x2, k: number): Matrix2x2 {
  if (!isDiagonal(diagonal, 1e-9)) {
    throw new Error("diagonalPower2x2: matrix is not diagonal");
  }
  return [
    [diagonal[0][0] ** k, 0],
    [0, diagonal[1][1] ** k],
  ];
}
