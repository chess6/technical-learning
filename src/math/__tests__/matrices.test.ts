import { describe, expect, it } from "vitest";
import {
  applyMatrixToUnitSquare,
  approximatelyEqualMatrix,
  determinant2x2,
  identityMatrix,
  matrixMatrixMultiply,
  matrixVectorMultiply,
  transformedGridSegments,
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

  it("maps every point with x' = a11·x + a12·y, y' = a21·x + a22·y", () => {
    const M = [
      [1.8, 0],
      [1.8, 2.2],
    ] as const;
    const [a11, a12] = M[0];
    const [a21, a22] = M[1];
    for (const [x, y] of [
      [1, 1],
      [1, 0],
      [0, 1],
      [2, -1],
      [-3, 4],
    ] as const) {
      expect(matrixVectorMultiply(M, [x, y])).toEqual([
        a11 * x + a12 * y,
        a21 * x + a22 * y,
      ]);
    }
    expect(matrixVectorMultiply(M, [1, 1])).toEqual([1.8, 4]);
  });

  it("builds grid lines by transforming endpoints, not from matrix-row slopes", () => {
    const M = [
      [1.8, 0],
      [1.8, 2.2],
    ] as const;
    const e1 = matrixVectorMultiply(M, [1, 0]);
    const e2 = matrixVectorMultiply(M, [0, 1]);
    const half = 4;
    const segments = transformedGridSegments(M, half);

    const vertical = segments.find((s) => s.kind === "vertical" && s.index === 1);
    expect(vertical).toBeDefined();
    expect(vertical!.point1).toEqual(matrixVectorMultiply(M, [1, -half]));
    expect(vertical!.point2).toEqual(matrixVectorMultiply(M, [1, half]));
    // Constant-x lines become parallels of e₂ (column 2).
    const span = 2 * half;
    const vDir: [number, number] = [
      vertical!.point2[0] - vertical!.point1[0],
      vertical!.point2[1] - vertical!.point1[1],
    ];
    expect(vDir[0]).toBeCloseTo(span * e2[0]);
    expect(vDir[1]).toBeCloseTo(span * e2[1]);

    const horizontal = segments.find(
      (s) => s.kind === "horizontal" && s.index === 1,
    );
    expect(horizontal).toBeDefined();
    expect(horizontal!.point1).toEqual(matrixVectorMultiply(M, [-half, 1]));
    expect(horizontal!.point2).toEqual(matrixVectorMultiply(M, [half, 1]));
    // Constant-y lines become parallels of e₁ (column 1).
    const hDir: [number, number] = [
      horizontal!.point2[0] - horizontal!.point1[0],
      horizontal!.point2[1] - horizontal!.point1[1],
    ];
    expect(hDir[0]).toBeCloseTo(span * e1[0]);
    expect(hDir[1]).toBeCloseTo(span * e1[1]);
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
