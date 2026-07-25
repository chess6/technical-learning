import { describe, expect, it } from "vitest";
import { COMPOSITION_FRESH as EX } from "../exampleData";
import {
  approximatelyEqualMatrix,
  approximatelyEqualVector,
  determinant2x2,
  inverse2x2,
  matrixMatrixMultiply,
  matrixVectorMultiply,
  productColumn,
  type Matrix2x2,
} from "../../math";

/**
 * The Lesson 6 practice data is only trustworthy if every number in it is
 * DERIVED, not asserted. This test recomputes each field from `src/math`, so a
 * typo in `exampleData` fails here rather than shipping a wrong graded answer.
 *
 * It also pins the freshness requirement: the practice matrices must differ from
 * the matrices the guided scene animates, or a "drill" is really recall.
 */

const M = EX.productLeft as Matrix2x2;
const N = EX.productRight as Matrix2x2;
const K = EX.invertibleSource as Matrix2x2;
const S = EX.singularFresh as Matrix2x2;

describe("Lesson 6 fresh practice data is derived, not asserted", () => {
  it("computes the product and its reverse", () => {
    expect(matrixMatrixMultiply(M, N)).toEqual(EX.product);
    expect(matrixMatrixMultiply(N, M)).toEqual(EX.productReversed);
  });

  it("is a genuine non-commuting pair", () => {
    expect(approximatelyEqualMatrix(EX.product, EX.productReversed)).toBe(false);
  });

  it("has product columns equal to M applied to N's columns", () => {
    expect(productColumn(M, N, 0)).toEqual([EX.product[0][0], EX.product[1][0]]);
    expect(productColumn(M, N, 1)).toEqual([EX.product[0][1], EX.product[1][1]]);
  });

  it("inverts the invertible source exactly (det = 1 keeps it integral)", () => {
    expect(determinant2x2(K)).toBe(1);
    expect(inverse2x2(K)).toEqual(EX.inverseOfSource);
    // Each column of the inverse solves K x = e_j — the way the lesson builds it.
    expect(
      approximatelyEqualVector(
        matrixVectorMultiply(K, [EX.inverseOfSource[0][0], EX.inverseOfSource[1][0]]),
        [1, 0],
        1e-12,
      ),
    ).toBe(true);
    expect(
      approximatelyEqualVector(
        matrixVectorMultiply(K, [EX.inverseOfSource[0][1], EX.inverseOfSource[1][1]]),
        [0, 1],
        1e-12,
      ),
    ).toBe(true);
  });

  it("makes the parameterized matrix singular at exactly the stated k", () => {
    const at = (k: number): Matrix2x2 => [
      [EX.singularRow[0], EX.singularRow[1]],
      [1, k],
    ];
    expect(determinant2x2(at(EX.singularParameter))).toBe(0);
    expect(determinant2x2(at(EX.singularParameter + 1))).not.toBe(0);
    expect(inverse2x2(at(EX.singularParameter))).toBeNull();
  });

  it("gives a nonzero null direction for the fresh singular matrix", () => {
    expect(determinant2x2(S)).toBe(0);
    const direction = EX.singularNullDirection;
    expect(Math.hypot(direction[0], direction[1])).toBeGreaterThan(0);
    expect(
      approximatelyEqualVector(matrixVectorMultiply(S, direction), [0, 0], 1e-12),
    ).toBe(true);
  });

  it("stays FRESH: none of the practice matrices is the scene's A or R", () => {
    const sceneA: Matrix2x2 = [
      [2, 1],
      [0, 1],
    ];
    const sceneR: Matrix2x2 = [
      [0, -1],
      [1, 0],
    ];
    for (const practice of [M, N, K, S, EX.product as Matrix2x2]) {
      expect(approximatelyEqualMatrix(practice, sceneA)).toBe(false);
      expect(approximatelyEqualMatrix(practice, sceneR)).toBe(false);
    }
  });
});
