import { describe, expect, it } from "vitest";
import {
  IDENTITY_MATRIX,
  approximatelyEqualMatrix,
  approximatelyEqualVector,
  determinant2x2,
  matrixColumn,
  matrixMatrixMultiply,
  matrixVectorMultiply,
  requireMatrixExample,
  type Matrix2x2,
  type Vector2,
} from "..";
import {
  collapseWitness2x2,
  commutes,
  composeInOrder,
  inverse2x2,
  inverseColumns,
  isInvertible2x2,
  productColumn,
} from "../matrixComposition";

/**
 * Property tests for Lesson 6's math layer.
 *
 * Every invariant listed in
 * `docs/courses/linear-algebra/lessons/06-matrix-composition/lesson-plan.md`
 * ("Mathematical invariants to assert") has a test here. The matrix set below
 * deliberately includes the ASYMMETRIC diagnostic matrix (rows ≠ columns, so a
 * transpose/packing bug is visible), a SINGULAR matrix, a NEAR-SINGULAR matrix,
 * and the zero matrix (the degenerate case in the invertibility criterion's
 * converse).
 */

const SHEAR = requireMatrixExample("shear-2-1").matrix; // [[2,1],[0,1]]
const ROTATION = requireMatrixExample("rotation").matrix; // [[0,-1],[1,0]]
const SINGULAR = requireMatrixExample("singular-collapse").matrix; // [[2,4],[1,2]]
const ASYMMETRIC = requireMatrixExample("diagnostic-asymmetric").matrix; // [[1,2],[3,4]]
const NEAR_SINGULAR = requireMatrixExample("near-singular").matrix; // [[1,1],[0.99,1]]
const ZERO: Matrix2x2 = [
  [0, 0],
  [0, 0],
];
const PROJECTION = requireMatrixExample("projection-x").matrix; // [[1,0],[0,0]]

const ALL: readonly Matrix2x2[] = [
  SHEAR,
  ROTATION,
  SINGULAR,
  ASYMMETRIC,
  NEAR_SINGULAR,
  ZERO,
  PROJECTION,
  IDENTITY_MATRIX,
];

const INVERTIBLE: readonly Matrix2x2[] = ALL.filter((m) => isInvertible2x2(m));

/** 1e-9 scaled by the largest entry, so badly-conditioned cases stay testable. */
function relativeTolerance(m: Matrix2x2): number {
  return 1e-9 * Math.max(1, ...m.flat().map(Math.abs));
}

const PROBES: readonly Vector2[] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [-2, 3],
  [0.5, -1.25],
];

describe("the product IS composition (col_j(AB) = A col_j(B))", () => {
  it("agrees with matrixMatrixMultiply on every column of every pair", () => {
    for (const a of ALL) {
      for (const b of ALL) {
        const product = matrixMatrixMultiply(a, b);
        for (const j of [0, 1] as const) {
          expect(productColumn(a, b, j)).toEqual(matrixColumn(product, j));
        }
      }
    }
  });

  it("satisfies (AB)x = A(Bx) for every pair and probe", () => {
    for (const a of ALL) {
      for (const b of ALL) {
        const product = matrixMatrixMultiply(a, b);
        for (const x of PROBES) {
          const direct = matrixVectorMultiply(product, x);
          const staged = matrixVectorMultiply(a, matrixVectorMultiply(b, x));
          expect(approximatelyEqualVector(direct, staged, 1e-12)).toBe(true);
        }
      }
    }
  });

  it("is NOT entrywise multiplication (the staged misconception)", () => {
    const product = matrixMatrixMultiply(SHEAR, ASYMMETRIC);
    expect(product[0][0]).not.toBe(SHEAR[0][0] * ASYMMETRIC[0][0]);
    // [[2,1],[0,1]] · [[1,2],[3,4]] = [[5,8],[3,4]]
    expect(product).toEqual([
      [5, 8],
      [3, 4],
    ]);
  });

  it("keeps the asymmetric diagnostic matrix honest under both orders", () => {
    // A packing/transpose bug would make these two agree.
    const ab = matrixMatrixMultiply(ASYMMETRIC, SHEAR);
    const ba = matrixMatrixMultiply(SHEAR, ASYMMETRIC);
    expect(ab).toEqual([
      [2, 3],
      [6, 7],
    ]);
    expect(ba).toEqual([
      [5, 8],
      [3, 4],
    ]);
    expect(approximatelyEqualMatrix(ab, ba)).toBe(false);
  });
});

describe("order matters in general, but not always", () => {
  it("gives the lesson's worked counterexample AR != RA", () => {
    expect(matrixMatrixMultiply(SHEAR, ROTATION)).toEqual([
      [1, -2],
      [1, 0],
    ]);
    expect(matrixMatrixMultiply(ROTATION, SHEAR)).toEqual([
      [0, -1],
      [2, 1],
    ]);
    expect(commutes(SHEAR, ROTATION)).toBe(false);
  });

  it("bounds the overclaim: identity, scalar multiples, and powers commute", () => {
    for (const m of ALL) {
      expect(commutes(m, IDENTITY_MATRIX)).toBe(true);
      const scaled: Matrix2x2 = [
        [3, 0],
        [0, 3],
      ];
      expect(commutes(m, scaled)).toBe(true);
      expect(commutes(m, matrixMatrixMultiply(m, m))).toBe(true);
    }
  });
});

describe("composition is associative, with I as the identity", () => {
  it("(AB)C = A(BC) for every triple drawn from the example set", () => {
    for (const a of ALL) {
      for (const b of ALL) {
        for (const c of ALL) {
          const left = matrixMatrixMultiply(matrixMatrixMultiply(a, b), c);
          const right = matrixMatrixMultiply(a, matrixMatrixMultiply(b, c));
          expect(approximatelyEqualMatrix(left, right, 1e-12)).toBe(true);
        }
      }
    }
  });

  it("composeInOrder takes APPLICATION order, so [B, A] is the matrix AB", () => {
    expect(composeInOrder([ROTATION, SHEAR])).toEqual(
      matrixMatrixMultiply(SHEAR, ROTATION),
    );
    expect(composeInOrder([])).toEqual(IDENTITY_MATRIX);
    expect(composeInOrder([SHEAR])).toEqual(SHEAR);
  });
});

describe("the inverse sends the basis back", () => {
  it("returns null exactly when ad - bc = 0", () => {
    for (const m of ALL) {
      const singular = Math.abs(determinant2x2(m)) <= 1e-9;
      expect(inverse2x2(m) === null).toBe(singular);
      expect(inverseColumns(m) === null).toBe(singular);
      expect(isInvertible2x2(m)).toBe(!singular);
    }
    expect(inverse2x2(SINGULAR)).toBeNull();
    expect(inverse2x2(ZERO)).toBeNull();
    expect(inverse2x2(PROJECTION)).toBeNull();
  });

  it("satisfies A A^-1 = A^-1 A = I for every invertible example", () => {
    for (const m of INVERTIBLE) {
      const inverse = inverse2x2(m)!;
      expect(
        approximatelyEqualMatrix(
          matrixMatrixMultiply(m, inverse),
          IDENTITY_MATRIX,
          1e-9,
        ),
      ).toBe(true);
      expect(
        approximatelyEqualMatrix(
          matrixMatrixMultiply(inverse, m),
          IDENTITY_MATRIX,
          1e-9,
        ),
      ).toBe(true);
    }
  });

  it("derives the same inverse by solving A x = e_j as by the closed formula", () => {
    // This is the test that makes the lesson's DERIVATION honest: the columns of
    // A^-1 really are the solutions of A x = e_1 and A x = e_2.
    for (const m of INVERTIBLE) {
      const constructed = inverseColumns(m)!;
      const closed = inverse2x2(m)!;
      expect(
        approximatelyEqualVector(constructed.first, matrixColumn(closed, 0), 1e-9),
      ).toBe(true);
      expect(
        approximatelyEqualVector(constructed.second, matrixColumn(closed, 1), 1e-9),
      ).toBe(true);
      // …and each really solves its system.
      expect(
        approximatelyEqualVector(
          matrixVectorMultiply(m, constructed.first),
          [1, 0],
          1e-9,
        ),
      ).toBe(true);
      expect(
        approximatelyEqualVector(
          matrixVectorMultiply(m, constructed.second),
          [0, 1],
          1e-9,
        ),
      ).toBe(true);
    }
  });

  it("gives the lesson's worked inverse of the shear", () => {
    expect(inverse2x2(SHEAR)).toEqual([
      [0.5, -0.5],
      [0, 1],
    ]);
  });

  it("reverses the order when inverting a composite", () => {
    for (const a of INVERTIBLE) {
      for (const b of INVERTIBLE) {
        const product = matrixMatrixMultiply(a, b);
        const expected = inverse2x2(product)!;
        const reversed = matrixMatrixMultiply(inverse2x2(b)!, inverse2x2(a)!);
        // Relative tolerance: the near-singular pair composes to det ≈ 1e-4, so
        // its inverse entries are ~1e4 and a fixed 1e-9 absolute bound would be
        // below float resolution. Scale by the largest entry instead of
        // dropping the badly-conditioned case, which is exactly the case worth
        // testing.
        expect(
          approximatelyEqualMatrix(expected, reversed, relativeTolerance(expected)),
        ).toBe(true);
      }
    }
  });

  it("shows the reversed order is not a notational nicety: A^-1 B^-1 differs", () => {
    const wrong = matrixMatrixMultiply(inverse2x2(SHEAR)!, inverse2x2(ROTATION)!);
    const right = matrixMatrixMultiply(inverse2x2(ROTATION)!, inverse2x2(SHEAR)!);
    expect(approximatelyEqualMatrix(wrong, right)).toBe(false);
    expect(
      approximatelyEqualMatrix(
        inverse2x2(matrixMatrixMultiply(SHEAR, ROTATION))!,
        right,
        1e-9,
      ),
    ).toBe(true);
  });

  it("keeps the near-singular matrix invertible, with large inverse entries", () => {
    // Invertible, but badly conditioned: the lesson names this, and the explorer
    // must not treat "large" as "singular".
    expect(isInvertible2x2(NEAR_SINGULAR)).toBe(true);
    const inverse = inverse2x2(NEAR_SINGULAR)!;
    const largest = Math.max(...inverse.flat().map(Math.abs));
    expect(largest).toBeGreaterThan(50);
  });
});

describe("a collapse witness explains why the undo cannot exist", () => {
  it("produces a nonzero null vector for every singular example", () => {
    for (const m of ALL) {
      const witness = collapseWitness2x2(m);
      if (isInvertible2x2(m)) {
        expect(witness).toBeNull();
        continue;
      }
      expect(witness).not.toBeNull();
      expect(Math.hypot(witness![0], witness![1])).toBeGreaterThan(1e-9);
      const image = matrixVectorMultiply(m, witness!);
      expect(Math.hypot(image[0], image[1])).toBeLessThan(1e-9);
    }
  });

  it("shows two distinct inputs sharing one output (non-injectivity)", () => {
    const witness = collapseWitness2x2(SINGULAR)!;
    const u: Vector2 = [1, 1];
    const v: Vector2 = [u[0] + witness[0], u[1] + witness[1]];
    expect(approximatelyEqualVector(u, v, 1e-9)).toBe(false);
    expect(
      approximatelyEqualVector(
        matrixVectorMultiply(SINGULAR, u),
        matrixVectorMultiply(SINGULAR, v),
        1e-9,
      ),
    ).toBe(true);
  });

  it("handles the zero matrix, where every vector is a witness", () => {
    const witness = collapseWitness2x2(ZERO)!;
    expect(Math.hypot(witness[0], witness[1])).toBeGreaterThan(0);
  });
});
