import { describe, expect, it } from "vitest";
import {
  assertEigenpair,
  assertGridDirectionMatchesBasis,
  assertPointMatchesMatrixTransform,
  assertTransformedBasisMatchesColumns,
  assertTransformedGridInvariants,
  assertUnitSquareAreaMatchesDeterminant,
  gridFamilyDirection,
} from "../invariants";
import {
  applyMatrixToUnitSquare,
  determinant2x2,
  matrixColumn,
  matrixVectorMultiply,
  transformedGridSegments,
} from "../matrices";
import { areParallel } from "../vectors";
import type { Matrix2x2 } from "../types";

/** Required coverage matrices from the math-correctness milestone. */
const MATRICES: { name: string; matrix: Matrix2x2 }[] = [
  { name: "identity", matrix: [[1, 0], [0, 1]] },
  { name: "nonuniform-scale", matrix: [[2, 0], [0, 3]] },
  { name: "diagnostic-asymmetric", matrix: [[1, 2], [3, 4]] },
  { name: "grid-bug-repro", matrix: [[1.8, 0], [1.8, 2.2]] },
  { name: "rotation", matrix: [[0, -1], [1, 0]] },
  { name: "reflection", matrix: [[-1, 0], [0, 1]] },
  { name: "singular", matrix: [[1, 2], [2, 4]] },
];

const SAMPLE_POINTS = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
  [2, -1],
  [-1.5, 0.5],
] as const;

describe("transformation invariants", () => {
  for (const { name, matrix } of MATRICES) {
    describe(name, () => {
      it("transformed basis matches columns", () => {
        assertTransformedBasisMatchesColumns(matrix);
        expect(matrixVectorMultiply(matrix, [1, 0])).toEqual(
          matrixColumn(matrix, 0),
        );
        expect(matrixVectorMultiply(matrix, [0, 1])).toEqual(
          matrixColumn(matrix, 1),
        );
      });

      it("grid families align with Ae1 / Ae2 and endpoints use matrixVectorMultiply", () => {
        assertTransformedGridInvariants(matrix, 3);
        const segments = transformedGridSegments(matrix, 3);
        assertGridDirectionMatchesBasis(matrix, segments);
        const e1 = matrixColumn(matrix, 0);
        const e2 = matrixColumn(matrix, 1);
        const dirH = gridFamilyDirection(segments, "horizontal");
        const dirV = gridFamilyDirection(segments, "vertical");
        if (dirH) expect(areParallel(dirH, e1)).toBe(true);
        if (dirV) expect(areParallel(dirV, e2)).toBe(true);
      });

      it("sample points match matrixVectorMultiply", () => {
        for (const p of SAMPLE_POINTS) {
          const image = matrixVectorMultiply(matrix, p);
          assertPointMatchesMatrixTransform(matrix, p, image);
        }
      });

      it("unit-square image and |det| area", () => {
        assertUnitSquareAreaMatchesDeterminant(matrix);
        const corners = applyMatrixToUnitSquare(matrix);
        expect(corners[0]).toEqual([0, 0]);
        expect(corners[1]).toEqual(matrixColumn(matrix, 0));
        expect(corners[3]).toEqual(matrixColumn(matrix, 1));
        const det = determinant2x2(matrix);
        if (name === "singular") {
          expect(Math.abs(det)).toBeLessThan(1e-9);
        }
      });
    });
  }

  it("grid-bug-repro: second grid family is vertical (parallel to Ae2)", () => {
    const matrix: Matrix2x2 = [
      [1.8, 0],
      [1.8, 2.2],
    ];
    expect(matrixColumn(matrix, 0)).toEqual([1.8, 1.8]);
    expect(matrixColumn(matrix, 1)).toEqual([0, 2.2]);
    expect(matrixVectorMultiply(matrix, [1, 1])).toEqual([1.8, 4]);

    const segments = transformedGridSegments(matrix, 4);
    const dirV = gridFamilyDirection(segments, "vertical");
    expect(dirV).not.toBeNull();
    // Ae2 = (0, 2.2) ⇒ vertical family has ~0 x-component.
    expect(Math.abs(dirV![0])).toBeLessThan(1e-9);
    expect(dirV![1]).not.toBe(0);
    expect(areParallel(dirV!, [0, 2.2])).toBe(true);

    const dirH = gridFamilyDirection(segments, "horizontal");
    expect(dirH).not.toBeNull();
    expect(areParallel(dirH!, [1.8, 1.8])).toBe(true);
  });

  it("assertEigenpair rejects the zero vector", () => {
    expect(() =>
      assertEigenpair(
        [
          [2, 0],
          [0, 2],
        ],
        2,
        [0, 0],
      ),
    ).toThrow(/zero vector/i);
  });

  it("assertEigenpair accepts a valid pair", () => {
    assertEigenpair(
      [
        [3, 1],
        [0, 2],
      ],
      3,
      [1, 0],
    );
  });
});
