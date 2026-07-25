import { describe, expect, it } from "vitest";
import {
  IDENTITY_MATRIX,
  approximatelyEqualMatrix,
  approximatelyEqualVector,
  changeOfBasisMatrix,
  coordinatesInBasis,
  determinant2x2,
  fromCoordinatesInBasis,
  isBasis,
  isDiagonal,
  isStandardBasis,
  matrixInBasis,
  matrixTrace,
  matrixVectorMultiply,
  rankOf,
  similarityInvariants,
  type Matrix,
  type Matrix2x2,
  type Vector2,
} from "..";

/**
 * Every invariant in the L10 lesson plan.
 *
 * The most important negative result is the DENIED CONVERSE: equal determinant
 * and equal trace do not make two matrices similar. The lesson stages that as a
 * misconception, so a test pins the counterexample — otherwise "the invariants
 * agree" could quietly be read as "so they are the same map".
 */

/** Lesson 1's basis, reused verbatim by the lesson. */
const B1: Vector2 = [1, 2];
const B2: Vector2 = [3, -1];
/** Lesson 1's points, with the coordinates Lesson 1 worked out by hand. */
const P_POINT: Vector2 = [4, 1];
const P_COORDS: Vector2 = [1, 1];
const Q_POINT: Vector2 = [-1, 5];
const Q_COORDS: Vector2 = [2, -1];

/** Lesson 11's matrix, and its eigenbasis. */
const A: Matrix2x2 = [
  [3, 1],
  [0, 2],
];
const E1: Vector2 = [1, 0];
const E2: Vector2 = [-1, 1];

const PROBES: readonly Vector2[] = [
  [1, 0],
  [0, 1],
  [2, -3],
  [-1.5, 0.5],
  [4, 1],
];

describe("P converts B-coordinates TO standard coordinates", () => {
  it("puts the basis vectors in as columns, in standard coordinates", () => {
    expect(changeOfBasisMatrix(B1, B2)).toEqual([
      [1, 3],
      [2, -1],
    ]);
    // Feeding P the B-coordinates of b₁ (namely e₁) returns b₁ itself — which is
    // what fixes the direction, without any convention to remember.
    expect(matrixVectorMultiply(changeOfBasisMatrix(B1, B2), [1, 0])).toEqual(B1);
    expect(matrixVectorMultiply(changeOfBasisMatrix(B1, B2), [0, 1])).toEqual(B2);
  });

  it("reproduces Lesson 1's hand-worked coordinates exactly", () => {
    expect(
      approximatelyEqualVector(coordinatesInBasis(B1, B2, P_POINT)!, P_COORDS, 1e-9),
    ).toBe(true);
    expect(
      approximatelyEqualVector(coordinatesInBasis(B1, B2, Q_POINT)!, Q_COORDS, 1e-9),
    ).toBe(true);
  });

  it("round-trips: P [x]_B = x for every probe", () => {
    for (const x of PROBES) {
      const coords = coordinatesInBasis(B1, B2, x)!;
      expect(
        approximatelyEqualVector(fromCoordinatesInBasis(B1, B2, coords), x, 1e-9),
        JSON.stringify(x),
      ).toBe(true);
    }
  });

  it("refuses a dependent pair instead of inverting it", () => {
    const dependent: Vector2 = [2, 4]; // = 2·B1
    expect(isBasis(B1, dependent)).toBe(false);
    expect(coordinatesInBasis(B1, dependent, P_POINT)).toBeNull();
    expect(matrixInBasis(A, B1, dependent)).toBeNull();
  });
});

describe("[A]_B describes the same map in the new basis", () => {
  it("satisfies [A]_B [x]_B = [A x]_B for every probe", () => {
    const inBasis = matrixInBasis(A, B1, B2)!;
    for (const x of PROBES) {
      const coords = coordinatesInBasis(B1, B2, x)!;
      const viaBasis = matrixVectorMultiply(inBasis, coords);
      const viaStandard = coordinatesInBasis(B1, B2, matrixVectorMultiply(A, x))!;
      expect(
        approximatelyEqualVector(viaBasis, viaStandard, 1e-9),
        JSON.stringify(x),
      ).toBe(true);
    }
  });

  it("becomes DIAGONAL in the eigenbasis — the payoff Lesson 11 needs", () => {
    const inEigenbasis = matrixInBasis(A, E1, E2)!;
    expect(isDiagonal(inEigenbasis, 1e-9)).toBe(true);
    expect(
      approximatelyEqualMatrix(
        inEigenbasis,
        [
          [3, 0],
          [0, 2],
        ],
        1e-9,
      ),
    ).toBe(true);
  });

  it("changes nothing when the basis is the standard one", () => {
    expect(isStandardBasis([1, 0], [0, 1])).toBe(true);
    expect(changeOfBasisMatrix([1, 0], [0, 1])).toEqual(IDENTITY_MATRIX);
    expect(
      approximatelyEqualMatrix(matrixInBasis(A, [1, 0], [0, 1])!, A, 1e-12),
    ).toBe(true);
    expect(isStandardBasis(B1, B2)).toBe(false);
  });

  it("uses a basis that is neither orthogonal nor unit length", () => {
    // The lesson leans on this: nothing here requires orthonormality, and the
    // default example deliberately has neither property.
    const dot = B1[0] * B2[0] + B1[1] * B2[1];
    expect(dot).not.toBe(0);
    expect(Math.hypot(...B1)).not.toBeCloseTo(1, 6);
  });
});

describe("what survives a change of basis", () => {
  const BASES: readonly (readonly [Vector2, Vector2])[] = [
    [B1, B2],
    [E1, E2],
    [
      [2, 1],
      [1, 3],
    ],
    [
      [0, 1],
      [1, 0],
    ],
  ];

  it("preserves determinant and trace for every basis", () => {
    const original = similarityInvariants(A);
    for (const [first, second] of BASES) {
      const described = similarityInvariants(matrixInBasis(A, first, second)!);
      expect(Math.abs(described.determinant - original.determinant)).toBeLessThan(1e-9);
      expect(Math.abs(described.trace - original.trace)).toBeLessThan(1e-9);
    }
  });

  it("preserves rank and nullity for every basis", () => {
    const singular: Matrix2x2 = [
      [2, 4],
      [1, 2],
    ];
    for (const source of [A, singular]) {
      for (const [first, second] of BASES) {
        const described = matrixInBasis(source, first, second)!;
        expect(rankOf(described as unknown as Matrix)).toBe(
          rankOf(source as unknown as Matrix),
        );
      }
    }
  });

  it("does NOT preserve the entries — that is the whole point", () => {
    const inEigenbasis = matrixInBasis(A, E1, E2)!;
    expect(approximatelyEqualMatrix(inEigenbasis, A)).toBe(false);
  });

  it("DENIES the converse: equal determinant AND trace, yet not similar", () => {
    const identity: Matrix2x2 = [
      [1, 0],
      [0, 1],
    ];
    const shear: Matrix2x2 = [
      [1, 1],
      [0, 1],
    ];
    expect(determinant2x2(identity)).toBe(determinant2x2(shear));
    expect(matrixTrace(identity)).toBe(matrixTrace(shear));
    // They cannot be similar: P⁻¹IP = I for EVERY invertible P, so the only
    // matrix similar to the identity is the identity itself.
    for (const [first, second] of BASES) {
      expect(
        approximatelyEqualMatrix(matrixInBasis(identity, first, second)!, identity, 1e-9),
        "the identity is similar only to itself",
      ).toBe(true);
    }
    expect(approximatelyEqualMatrix(identity, shear)).toBe(false);
  });
});
