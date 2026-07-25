import { describe, expect, it } from "vitest";
import {
  IDENTITY_MATRIX,
  determinant2x2,
  determinant3x3,
  inverse2x2,
  isInvertible2x2,
  matrixMatrixMultiply,
  matrixMatrixMultiply3,
  requireMatrixExample,
  signedParallelogramArea,
  transpose2x2,
  type Matrix2x2,
  type Matrix3x3,
} from "..";

/**
 * Properties the Determinants lesson now TEACHES rather than merely mentions:
 * multiplicativity, the invertibility criterion, the row-operation rules, and
 * the fact that the sign is orientation rather than a negative area.
 *
 * The row-operation rules are tested the way the lesson derives them — as
 * corollaries of multiplicativity, by composing with an elementary matrix. That
 * keeps the lesson's claim ("these are not three more rules to memorize") from
 * drifting away from what the code actually guarantees.
 */

const SHEAR = requireMatrixExample("shear-2-1").matrix; // det 2
const ROTATION = requireMatrixExample("rotation").matrix; // det 1
const REFLECTION = requireMatrixExample("reflection").matrix; // det -1
const SINGULAR = requireMatrixExample("singular-collapse").matrix; // det 0
const ASYMMETRIC = requireMatrixExample("diagnostic-asymmetric").matrix; // det -2
const NEAR_SINGULAR = requireMatrixExample("near-singular").matrix; // det 0.01
const CONTRACTION = requireMatrixExample("contraction").matrix; // det 0.25
const PROJECTION = requireMatrixExample("projection-x").matrix; // det 0
const ZERO: Matrix2x2 = [
  [0, 0],
  [0, 0],
];

const ALL: readonly Matrix2x2[] = [
  SHEAR,
  ROTATION,
  REFLECTION,
  SINGULAR,
  ASYMMETRIC,
  NEAR_SINGULAR,
  CONTRACTION,
  PROJECTION,
  ZERO,
  IDENTITY_MATRIX,
];

/* Elementary matrices — a row operation IS composition with one of these. */
/** R₂ → R₂ + k·R₁ */
const addMultipleOfRow1ToRow2 = (k: number): Matrix2x2 => [
  [1, 0],
  [k, 1],
];
/** Swap R₁ and R₂ */
const SWAP: Matrix2x2 = [
  [0, 1],
  [1, 0],
];
/** R₁ → k·R₁ */
const scaleRow1 = (k: number): Matrix2x2 => [
  [k, 0],
  [0, 1],
];

describe("the determinant is multiplicative", () => {
  it("satisfies det(AB) = det(A)·det(B) for every pair, including singular ones", () => {
    for (const a of ALL) {
      for (const b of ALL) {
        const product = determinant2x2(matrixMatrixMultiply(a, b));
        const factors = determinant2x2(a) * determinant2x2(b);
        expect(Math.abs(product - factors)).toBeLessThan(1e-9);
      }
    }
  });

  it("makes a composite singular as soon as EITHER factor is singular", () => {
    for (const a of ALL) {
      expect(isInvertible2x2(matrixMatrixMultiply(a, SINGULAR))).toBe(false);
      expect(isInvertible2x2(matrixMatrixMultiply(SINGULAR, a))).toBe(false);
    }
  });

  it("gives det(A⁻¹) = 1/det(A)", () => {
    for (const m of ALL.filter((x) => isInvertible2x2(x))) {
      const det = determinant2x2(m);
      const inverseDet = determinant2x2(inverse2x2(m)!);
      expect(Math.abs(inverseDet - 1 / det)).toBeLessThan(1e-9);
    }
  });
});

describe("row operations, derived from multiplicativity", () => {
  it("leaves the determinant UNCHANGED when a multiple of one row is added to another", () => {
    // det of the elementary matrix is 1, so det(EA) = 1·det(A).
    for (const m of ALL) {
      for (const k of [-3, -0.5, 2, 7]) {
        const E = addMultipleOfRow1ToRow2(k);
        expect(determinant2x2(E)).toBe(1);
        expect(
          Math.abs(
            determinant2x2(matrixMatrixMultiply(E, m)) - determinant2x2(m),
          ),
        ).toBeLessThan(1e-9);
      }
    }
  });

  it("FLIPS THE SIGN on a row swap", () => {
    expect(determinant2x2(SWAP)).toBe(-1);
    for (const m of ALL) {
      expect(
        Math.abs(
          determinant2x2(matrixMatrixMultiply(SWAP, m)) + determinant2x2(m),
        ),
      ).toBeLessThan(1e-9);
    }
  });

  it("SCALES the determinant when a row is scaled", () => {
    for (const m of ALL) {
      for (const k of [-2, 0.5, 3]) {
        const E = scaleRow1(k);
        expect(determinant2x2(E)).toBe(k);
        expect(
          Math.abs(
            determinant2x2(matrixMatrixMultiply(E, m)) - k * determinant2x2(m),
          ),
        ).toBeLessThan(1e-9);
      }
    }
  });

  it("means elimination to triangular form preserves |det| up to the ops used", () => {
    // The lesson's worked example: eliminate [[1,3],[2,-1]] with R2 -> R2 - 2R1.
    const A: Matrix2x2 = [
      [1, 3],
      [2, -1],
    ];
    const eliminated = matrixMatrixMultiply(addMultipleOfRow1ToRow2(-2), A);
    expect(eliminated).toEqual([
      [1, 3],
      [0, -7],
    ]);
    // Determinant survives the operation, and a triangular matrix's determinant
    // is the product of its pivots.
    expect(determinant2x2(eliminated)).toBe(determinant2x2(A));
    expect(determinant2x2(eliminated)).toBe(1 * -7);
  });
});

describe("zero determinant is collapse, not a small matrix", () => {
  it("agrees exactly with non-invertibility", () => {
    for (const m of ALL) {
      expect(Math.abs(determinant2x2(m)) <= 1e-9).toBe(!isInvertible2x2(m));
      expect(inverse2x2(m) === null).toBe(Math.abs(determinant2x2(m)) <= 1e-9);
    }
  });

  it("does not require the matrix to be small or zero", () => {
    // singular-collapse has no zero entries at all.
    expect(determinant2x2(SINGULAR)).toBe(0);
    expect(SINGULAR.flat().every((entry) => entry !== 0)).toBe(true);
  });

  it("keeps a tiny determinant strictly invertible (conditioning ≠ collapse)", () => {
    expect(determinant2x2(NEAR_SINGULAR)).toBeCloseTo(0.01, 12);
    expect(isInvertible2x2(NEAR_SINGULAR)).toBe(true);
  });
});

describe("the sign is orientation, never a negative area", () => {
  it("keeps |det| as the area factor while the sign records handedness", () => {
    expect(determinant2x2(REFLECTION)).toBe(-1);
    expect(Math.abs(determinant2x2(REFLECTION))).toBe(1);
    // A reflection preserves area exactly; only the handedness changed.
    expect(Math.abs(signedParallelogramArea(REFLECTION))).toBe(1);
  });

  it("composes signs the way multiplicativity predicts: two flips restore handedness", () => {
    const twice = matrixMatrixMultiply(REFLECTION, REFLECTION);
    expect(determinant2x2(twice)).toBe(1);
    expect(twice).toEqual(IDENTITY_MATRIX);
  });

  it("is NOT additive — det(A + B) has no such rule", () => {
    const sum: Matrix2x2 = [
      [SHEAR[0][0] + ROTATION[0][0], SHEAR[0][1] + ROTATION[0][1]],
      [SHEAR[1][0] + ROTATION[1][0], SHEAR[1][1] + ROTATION[1][1]],
    ];
    expect(determinant2x2(sum)).not.toBe(
      determinant2x2(SHEAR) + determinant2x2(ROTATION),
    );
  });
});

describe("transpose and the row/column symmetry", () => {
  it("gives det(Aᵀ) = det(A), so row rules and column rules agree", () => {
    for (const m of ALL) {
      expect(
        Math.abs(determinant2x2(transpose2x2(m)) - determinant2x2(m)),
      ).toBeLessThan(1e-9);
    }
  });
});

describe("the same story one dimension up (the lesson's abstraction return)", () => {
  const DIAGONAL_3: Matrix3x3 = [
    [2, 0, 0],
    [0, 3, 0],
    [0, 0, 4],
  ];
  const COLLAPSING_3: Matrix3x3 = [
    // Third row is the sum of the first two, so the cube flattens onto a plane.
    [1, 0, 2],
    [0, 1, 3],
    [1, 1, 5],
  ];

  it("scales volume, so a diagonal map multiplies the stretch factors", () => {
    expect(determinant3x3(DIAGONAL_3)).toBe(24);
  });

  it("reports zero exactly when the unit cube is flattened", () => {
    expect(determinant3x3(COLLAPSING_3)).toBe(0);
  });

  it("is multiplicative in 3D too", () => {
    const product = matrixMatrixMultiply3(DIAGONAL_3, COLLAPSING_3);
    expect(
      Math.abs(
        determinant3x3(product) -
          determinant3x3(DIAGONAL_3) * determinant3x3(COLLAPSING_3),
      ),
    ).toBeLessThan(1e-9);
  });
});
