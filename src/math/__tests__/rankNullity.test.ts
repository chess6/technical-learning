import { describe, expect, it } from "vitest";
import {
  geometricMultiplicity,
  isInjective,
  isSurjective,
  maxPossibleRank,
  nullityOf,
  rankNullityCount,
  rankOf,
  shiftByEigenvalue,
  type Matrix,
} from "..";

/**
 * The L9 invariants. The battery is deliberately weighted toward NON-SQUARE
 * maps: with m = n the law degenerates into "rank determines nullity", which L8
 * already had, and none of the impossibility results can even be stated.
 */

const WIDE: Matrix = [
  [1, 2, 3],
  [0, 1, 4],
]; // 2×3, rank 2 — onto, cannot be one-to-one
const TALL: Matrix = [
  [1, 2],
  [3, 4],
  [5, 6],
]; // 3×2, rank 2 — one-to-one, cannot be onto
const SQUARE_FULL: Matrix = [
  [1, 0, 2],
  [0, 1, 3],
  [0, 0, 1],
];
const SQUARE_RANK_TWO: Matrix = [
  [1, 0, 2],
  [0, 1, 3],
  [1, 1, 5],
];
const ZERO: Matrix = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
const WIDE_DEGENERATE: Matrix = [
  [1, 2, 3],
  [2, 4, 6],
]; // 2×3 but rank 1 — neither one-to-one nor onto

const BATTERY: readonly { name: string; m: Matrix }[] = [
  { name: "wide 2×3 rank 2", m: WIDE },
  { name: "tall 3×2 rank 2", m: TALL },
  { name: "square full rank", m: SQUARE_FULL },
  { name: "square rank 2", m: SQUARE_RANK_TWO },
  { name: "zero map", m: ZERO },
  { name: "wide rank 1", m: WIDE_DEGENERATE },
];

describe("the conservation law", () => {
  it("balances with n — the INPUT dimension — on the right, for every shape", () => {
    for (const { name, m } of BATTERY) {
      const count = rankNullityCount(m);
      const n = m[0]!.length;
      expect(count.rank + count.nullity, name).toBe(n);
      // The most common error is putting m on the right. Assert it is NOT m
      // wherever the two differ, so a regression toward that reading fails here.
      if (m.length !== n) {
        expect(count.rank + count.nullity, name).not.toBe(m.length);
      }
    }
  });

  it("never lets the rank exceed either dimension", () => {
    for (const { name, m } of BATTERY) {
      expect(rankOf(m), name).toBeLessThanOrEqual(maxPossibleRank(m.length, m[0]!.length));
    }
  });
});

describe("what the law forbids", () => {
  it("makes a map from a bigger space to a smaller one impossible to be one-to-one", () => {
    for (const m of [WIDE, WIDE_DEGENERATE]) {
      const n = m[0]!.length;
      expect(n).toBeGreaterThan(m.length);
      expect(nullityOf(m)).toBeGreaterThanOrEqual(n - m.length);
      expect(isInjective(m)).toBe(false);
    }
  });

  it("makes a map from a smaller space to a bigger one impossible to be onto", () => {
    const n = TALL[0]!.length;
    expect(n).toBeLessThan(TALL.length);
    expect(rankOf(TALL)).toBeLessThanOrEqual(n);
    expect(isSurjective(TALL)).toBe(false);
  });

  it("makes one-to-one and onto the SAME condition for square maps only", () => {
    for (const m of [SQUARE_FULL, SQUARE_RANK_TWO, ZERO]) {
      expect(isInjective(m)).toBe(isSurjective(m));
    }
    // …and genuinely different for non-square ones — the scope note, asserted.
    expect(isInjective(WIDE)).toBe(false);
    expect(isSurjective(WIDE)).toBe(true);
    expect(isInjective(TALL)).toBe(true);
    expect(isSurjective(TALL)).toBe(false);
  });

  it("allows a map to be neither, at any shape", () => {
    expect(isInjective(WIDE_DEGENERATE)).toBe(false);
    expect(isSurjective(WIDE_DEGENERATE)).toBe(false);
    expect(isInjective(SQUARE_RANK_TWO)).toBe(false);
    expect(isSurjective(SQUARE_RANK_TWO)).toBe(false);
  });
});

describe("geometric multiplicity — the law computing what Lesson 11 needs", () => {
  /** Defective: λ = 3 twice, but only ONE eigendirection. */
  const DEFECTIVE: Matrix = [
    [3, 1],
    [0, 3],
  ];
  /** Scalar: λ = 3 twice, and the WHOLE plane is the eigenspace. */
  const SCALAR: Matrix = [
    [3, 0],
    [0, 3],
  ];
  /** Distinct eigenvalues 3 and 2, one direction each. */
  const DISTINCT: Matrix = [
    [3, 1],
    [0, 2],
  ];

  it("equals n − rank(A − λI)", () => {
    for (const [m, lambda] of [
      [DEFECTIVE, 3],
      [SCALAR, 3],
      [DISTINCT, 3],
      [DISTINCT, 2],
    ] as const) {
      const shifted = shiftByEigenvalue(m, lambda);
      expect(geometricMultiplicity(m, lambda)).toBe(
        m[0]!.length - rankOf(shifted),
      );
    }
  });

  it("separates the defective case from the scalar case — same λ, different answer", () => {
    // This is exactly the distinction Lesson 11 names but cannot currently compute.
    expect(geometricMultiplicity(DEFECTIVE, 3)).toBe(1);
    expect(geometricMultiplicity(SCALAR, 3)).toBe(2);
  });

  it("is 1 for each of two distinct eigenvalues", () => {
    expect(geometricMultiplicity(DISTINCT, 3)).toBe(1);
    expect(geometricMultiplicity(DISTINCT, 2)).toBe(1);
  });

  it("is 0 for a number that is not an eigenvalue at all", () => {
    expect(geometricMultiplicity(DISTINCT, 5)).toBe(0);
    expect(geometricMultiplicity(DEFECTIVE, 0)).toBe(0);
  });

  it("never exceeds the algebraic multiplicity", () => {
    // DEFECTIVE has algebraic multiplicity 2 for λ = 3 but geometric 1 — the
    // inequality is strict, which is what "defective" means.
    expect(geometricMultiplicity(DEFECTIVE, 3)).toBeLessThan(2);
    expect(geometricMultiplicity(SCALAR, 3)).toBe(2);
  });

  it("shifts only the diagonal", () => {
    expect(shiftByEigenvalue(DISTINCT, 2)).toEqual([
      [1, 1],
      [0, 0],
    ]);
  });
});
