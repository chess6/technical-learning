import { describe, expect, it } from "vitest";
import {
  applyMatrixToUnitSquare,
  approximatelyEqualMatrix,
  determinant2x2,
  identityMatrix,
  matrixMatrixMultiply,
  matrixVectorMultiply,
  transpose2x2,
} from "../matrices";

describe("matrix utilities", () => {
  const A = [
    [2, 1],
    [0, 1],
  ] as const;

  it("multiplies matrix by vector", () => {
    expect(matrixVectorMultiply(A, [1, 0])).toEqual([2, 0]);
    expect(matrixVectorMultiply(A, [0, 1])).toEqual([1, 1]);
    expect(matrixVectorMultiply(A, [1.5, 0.5])).toEqual([3.5, 0.5]);
  });

  it("multiplies matrices", () => {
    const B = [
      [1, 2],
      [3, 4],
    ] as const;
    expect(matrixMatrixMultiply(A, B)).toEqual([
      [5, 8],
      [3, 4],
    ]);
    expect(matrixMatrixMultiply(A, identityMatrix())).toEqual([
      [2, 1],
      [0, 1],
    ]);
  });

  it("computes determinant", () => {
    expect(determinant2x2(A)).toBe(2);
    expect(
      determinant2x2([
        [2, 4],
        [1, 2],
      ]),
    ).toBe(0);
    expect(
      determinant2x2([
        [1, 0],
        [0, -1],
      ]),
    ).toBe(-1);
  });

  it("transforms the unit square", () => {
    const corners = applyMatrixToUnitSquare(A);
    expect(corners).toEqual([
      [0, 0],
      [2, 0],
      [3, 1],
      [1, 1],
    ]);
  });

  it("transposes and compares approximately", () => {
    expect(transpose2x2(A)).toEqual([
      [2, 0],
      [1, 1],
    ]);
    expect(
      approximatelyEqualMatrix(A, [
        [2, 1 + 1e-12],
        [0, 1],
      ]),
    ).toBe(true);
    expect(
      approximatelyEqualMatrix(A, [
        [2, 1.01],
        [0, 1],
      ]),
    ).toBe(false);
  });
});
