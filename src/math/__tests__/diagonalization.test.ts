import { describe, expect, it } from "vitest";
import {
  approximatelyEqualMatrix,
  diagonalPower2x2,
  diagonalize2x2,
  eigenvalueMultiplicities2x2,
  inverse2x2,
  isDiagonal,
  isDiagonalizable2x2,
  matrixMatrixMultiply,
  matrixPower2x2,
  requireMatrixExample,
  verifiesEigenpair,
  type Matrix2x2,
} from "..";

/**
 * Diagonalization AND its limits.
 *
 * The lesson's honest half is that this often fails, so most of these tests are
 * about failure being reported precisely: a defective matrix and a rotation are
 * both "not diagonalizable", but for different reasons that the learner must be
 * able to tell apart.
 */

const DISTINCT = requireMatrixExample("eigen-distinct").matrix; // [[3,1],[0,2]]
const DEFECTIVE: Matrix2x2 = [
  [3, 1],
  [0, 3],
];
const SCALAR: Matrix2x2 = [
  [3, 0],
  [0, 3],
];
const ROTATION = requireMatrixExample("rotation").matrix; // [[0,-1],[1,0]]
const SINGULAR = requireMatrixExample("singular-collapse").matrix; // [[2,4],[1,2]]

describe("diagonalizable: A = P D P⁻¹", () => {
  it("produces a genuine diagonal D and a P that really conjugates", () => {
    for (const m of [DISTINCT, SCALAR, SINGULAR]) {
      const result = diagonalize2x2(m);
      expect(result.kind, JSON.stringify(m)).toBe("diagonalizable");
      if (result.kind !== "diagonalizable") continue;
      expect(isDiagonal(result.diagonal, 1e-9)).toBe(true);
      const pInverse = inverse2x2(result.p)!;
      // Reconstruct A from P D P⁻¹ — the claim, checked.
      const reconstructed = matrixMatrixMultiply(
        result.p,
        matrixMatrixMultiply(result.diagonal, pInverse),
      );
      expect(approximatelyEqualMatrix(reconstructed, m, 1e-8)).toBe(true);
    }
  });

  it("puts the eigenvalues on the diagonal, and P's columns are eigenvectors", () => {
    const result = diagonalize2x2(DISTINCT);
    if (result.kind !== "diagonalizable") throw new Error("expected diagonalizable");
    expect(result.diagonal[0][0]).toBeCloseTo(result.eigenvalues[0], 9);
    expect(result.diagonal[1][1]).toBeCloseTo(result.eigenvalues[1], 9);
    for (const [j, lambda] of result.eigenvalues.entries()) {
      const column: [number, number] = [result.p[0][j]!, result.p[1][j]!];
      expect(verifiesEigenpair(DISTINCT, lambda, column, 1e-8)).toBe(true);
    }
  });

  it("makes powers trivial: A^k = P D^k P⁻¹, checked against slow multiplication", () => {
    const result = diagonalize2x2(DISTINCT);
    if (result.kind !== "diagonalizable") throw new Error("expected diagonalizable");
    const pInverse = inverse2x2(result.p)!;
    for (const k of [0, 1, 2, 5, 8]) {
      const viaDiagonal = matrixMatrixMultiply(
        result.p,
        matrixMatrixMultiply(diagonalPower2x2(result.diagonal, k), pInverse),
      );
      expect(
        approximatelyEqualMatrix(viaDiagonal, matrixPower2x2(DISTINCT, k), 1e-6),
        `k=${k}`,
      ).toBe(true);
    }
  });

  it("treats a scalar matrix as already diagonal, with P = I", () => {
    const result = diagonalize2x2(SCALAR);
    if (result.kind !== "diagonalizable") throw new Error("expected diagonalizable");
    expect(result.diagonal).toEqual(SCALAR);
  });
});

describe("the limits — failure is reported precisely, not as a bare null", () => {
  it("names a DEFECTIVE matrix, with both multiplicities", () => {
    const result = diagonalize2x2(DEFECTIVE);
    expect(result.kind).toBe("defective");
    if (result.kind !== "defective") return;
    expect(result.eigenvalue).toBeCloseTo(3, 9);
    expect(result.algebraic).toBe(2);
    expect(result.geometric).toBe(1);
    // The gap between the two IS the defect.
    expect(result.geometric).toBeLessThan(result.algebraic);
  });

  it("names a rotation as having NO REAL eigenvalues — a different failure", () => {
    const result = diagonalize2x2(ROTATION);
    expect(result.kind).toBe("no-real-eigenvalues");
    if (result.kind !== "no-real-eigenvalues") return;
    expect(result.imaginaryMagnitude).toBeGreaterThan(0);
  });

  it("distinguishes the two failures rather than lumping them together", () => {
    expect(diagonalize2x2(DEFECTIVE).kind).not.toBe(
      diagonalize2x2(ROTATION).kind,
    );
    expect(isDiagonalizable2x2(DEFECTIVE)).toBe(false);
    expect(isDiagonalizable2x2(ROTATION)).toBe(false);
  });

  it("shows the same repeated eigenvalue succeeding or failing by geometric multiplicity alone", () => {
    // DEFECTIVE and SCALAR both have λ = 3 twice. Only the geometric
    // multiplicity separates them — the criterion Lesson 9 made computable.
    const defective = eigenvalueMultiplicities2x2(DEFECTIVE)[0]!;
    const scalar = eigenvalueMultiplicities2x2(SCALAR)[0]!;
    expect(defective.eigenvalue).toBeCloseTo(scalar.eigenvalue, 9);
    expect(defective.algebraic).toBe(scalar.algebraic);
    expect(defective.geometric).toBe(1);
    expect(scalar.geometric).toBe(2);
    expect(isDiagonalizable2x2(DEFECTIVE)).toBe(false);
    expect(isDiagonalizable2x2(SCALAR)).toBe(true);
  });

  it("keeps geometric ≤ algebraic for every example", () => {
    for (const m of [DISTINCT, DEFECTIVE, SCALAR, SINGULAR]) {
      for (const multiplicity of eigenvalueMultiplicities2x2(m)) {
        expect(multiplicity.geometric).toBeLessThanOrEqual(multiplicity.algebraic);
        expect(multiplicity.geometric).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("reports no real eigenvalues at all for the rotation", () => {
    expect(eigenvalueMultiplicities2x2(ROTATION)).toEqual([]);
  });

  it("diagonalizes a SINGULAR matrix — collapse and defect are unrelated", () => {
    // singular-collapse has eigenvalues 4 and 0: not invertible, yet perfectly
    // diagonalizable. The lesson stages this as a misconception.
    expect(isDiagonalizable2x2(SINGULAR)).toBe(true);
    const values = eigenvalueMultiplicities2x2(SINGULAR)
      .map((v) => v.eigenvalue)
      .sort((a, b) => a - b);
    expect(values[0]).toBeCloseTo(0, 8);
    expect(values[1]).toBeCloseTo(4, 8);
  });
});
