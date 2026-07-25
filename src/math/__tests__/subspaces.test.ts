import { describe, expect, it } from "vitest";
import {
  areLinearlyIndependent,
  columnSpaceBasis,
  imageShape,
  inNullSpace,
  isInColumnSpace,
  nullSpaceBasis,
  nullityOf,
  pivotColumnsOf,
  rankNullityCount,
  rankOf,
  rref,
  vectorSetRank,
  type Matrix,
} from "..";

/**
 * Every invariant listed in the L8 lesson plan.
 *
 * The load-bearing one is the staged trap: a basis of Col(A) must come from the
 * columns of A ITSELF. Row operations preserve rank and the null space but
 * change the column space, so a basis read off the reduced matrix is generally
 * wrong. Both halves of that are asserted below.
 */

/** rank 3 — nothing collapses. */
const FULL: Matrix = [
  [1, 0, 2],
  [0, 1, 3],
  [0, 0, 1],
];
/** rank 2 — row 3 = row 1 + row 2; the cube flattens onto a plane. */
const RANK_TWO: Matrix = [
  [1, 0, 2],
  [0, 1, 3],
  [1, 1, 5],
];
/** rank 1 — every row is a multiple of (1,2,3); the image is a line. */
const RANK_ONE: Matrix = [
  [1, 2, 3],
  [2, 4, 6],
  [3, 6, 9],
];
const ZERO_MAP: Matrix = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];
/** Non-square: 2 rows, 3 columns. Col(A) ⊆ R², Null(A) ⊆ R³. */
const WIDE: Matrix = [
  [1, 2, 3],
  [0, 1, 4],
];
/** Non-square the other way: 3 rows, 2 columns. */
const TALL: Matrix = [
  [1, 2],
  [3, 4],
  [5, 6],
];
/** Asymmetric 2×2 — the packing/transpose guard. */
const ASYMMETRIC: Matrix = [
  [1, 2],
  [3, 4],
];
/** The 2D case the learner already knows. */
const SINGULAR_2D: Matrix = [
  [2, 4],
  [1, 2],
];

const ALL: readonly { name: string; m: Matrix }[] = [
  { name: "full rank 3×3", m: FULL },
  { name: "rank 2", m: RANK_TWO },
  { name: "rank 1", m: RANK_ONE },
  { name: "zero map", m: ZERO_MAP },
  { name: "wide 2×3", m: WIDE },
  { name: "tall 3×2", m: TALL },
  { name: "asymmetric 2×2", m: ASYMMETRIC },
  { name: "singular 2×2", m: SINGULAR_2D },
];

describe("rank counts the surviving dimensions", () => {
  it("matches the pivot count and the known ranks", () => {
    expect(rankOf(FULL)).toBe(3);
    expect(rankOf(RANK_TWO)).toBe(2);
    expect(rankOf(RANK_ONE)).toBe(1);
    expect(rankOf(ZERO_MAP)).toBe(0);
    expect(rankOf(WIDE)).toBe(2);
    expect(rankOf(TALL)).toBe(2);
    expect(rankOf(ASYMMETRIC)).toBe(2);
    expect(rankOf(SINGULAR_2D)).toBe(1);
    for (const { name, m } of ALL) {
      expect(rankOf(m), name).toBe(pivotColumnsOf(m).length);
    }
  });

  it("reads the image shape off the rank alone", () => {
    expect(imageShape(rankOf(FULL))).toBe("solid");
    expect(imageShape(rankOf(RANK_TWO))).toBe("plane");
    expect(imageShape(rankOf(RANK_ONE))).toBe("line");
    expect(imageShape(rankOf(ZERO_MAP))).toBe("point");
  });
});

describe("the column-space basis comes from A, never from its reduced form", () => {
  it("returns vectors that are literally columns of A", () => {
    for (const { name, m } of ALL) {
      const { basis } = columnSpaceBasis(m);
      const columnsOfA = (m[0] ?? []).map((_, j) => m.map((row) => row[j]!));
      for (const vector of basis) {
        expect(
          columnsOfA.some((column) =>
            column.every((entry, i) => Math.abs(entry - vector[i]!) < 1e-12),
          ),
          `${name}: basis vector ${JSON.stringify(vector)} is not a column of A`,
        ).toBe(true);
      }
    }
  });

  it("produces an independent basis of the right size, in R^m", () => {
    for (const { name, m } of ALL) {
      const result = columnSpaceBasis(m);
      expect(result.dimension, name).toBe(rankOf(m));
      expect(result.ambientDimension, name).toBe(m.length);
      for (const vector of result.basis) {
        expect(vector.length, name).toBe(m.length);
      }
      if (result.basis.length > 0) {
        expect(areLinearlyIndependent(result.basis), name).toBe(true);
        expect(vectorSetRank(result.basis), name).toBe(result.dimension);
      }
    }
  });

  it("spans the same space as the full column set", () => {
    for (const { name, m } of ALL) {
      const columnsOfA = (m[0] ?? []).map((_, j) => m.map((row) => row[j]!));
      const { basis } = columnSpaceBasis(m);
      // Adding every original column to the basis must not raise the rank.
      expect(vectorSetRank([...basis, ...columnsOfA]), name).toBe(
        vectorSetRank(basis.length > 0 ? basis : [[]].slice(0, 0)),
      );
    }
  });

  it("PROVES the trap: row reduction preserves rank but changes the column space", () => {
    // RANK_TWO's reduced form has e₁ and e₂ as its pivot columns, which span the
    // xy-plane. The real column space contains (2,3,5) — not in that plane.
    const reduced = rref(RANK_TWO).matrix;
    expect(rankOf(reduced)).toBe(rankOf(RANK_TWO)); // rank survives…
    const reducedColumns = (reduced[0] ?? []).map((_, j) =>
      reduced.map((row) => row[j]!),
    );
    const trueBasis = columnSpaceBasis(RANK_TWO).basis;
    // …but the spaces differ: a true column-space vector is NOT in the span of
    // the reduced matrix's columns (adding it raises the rank).
    const witness = trueBasis[0]!;
    const reducedRank = vectorSetRank(reducedColumns);
    const withWitness = vectorSetRank([...reducedColumns, witness]);
    expect(reducedRank).toBe(2);
    expect(withWitness).toBe(3); // the witness escapes the reduced columns' span
  });
});

describe("the null-space basis lives in the INPUT space", () => {
  it("returns vectors A sends to zero, independent, of the right size", () => {
    for (const { name, m } of ALL) {
      const n = m[0]!.length;
      const result = nullSpaceBasis(m);
      expect(result.ambientDimension, name).toBe(n);
      expect(result.dimension, name).toBe(nullityOf(m));
      for (const vector of result.basis) {
        expect(vector.length, name).toBe(n);
        expect(inNullSpace(m, vector, 1e-9), `${name}: ${JSON.stringify(vector)}`).toBe(true);
      }
      if (result.basis.length > 0) {
        expect(areLinearlyIndependent(result.basis), name).toBe(true);
      }
    }
  });

  it("returns an EMPTY basis for a trivial null space, not a zero vector", () => {
    const result = nullSpaceBasis(FULL);
    expect(result.dimension).toBe(0);
    expect(result.basis).toEqual([]);
  });

  it("puts the two spaces in different ambient spaces for a non-square map", () => {
    const wideColumns = columnSpaceBasis(WIDE);
    const wideNull = nullSpaceBasis(WIDE);
    expect(wideColumns.ambientDimension).toBe(2); // outputs live in R²
    expect(wideNull.ambientDimension).toBe(3); // inputs live in R³
    expect(wideColumns.ambientDimension).not.toBe(wideNull.ambientDimension);
  });
});

describe("the two dimensions move in opposite directions", () => {
  it("balances rank + nullity = n on the whole battery", () => {
    for (const { name, m } of ALL) {
      const count = rankNullityCount(m);
      expect(count.balances, name).toBe(true);
      expect(count.rank + count.nullity, name).toBe(count.inputDimension);
      expect(count.rank, name).toBe(columnSpaceBasis(m).dimension);
      expect(count.nullity, name).toBe(nullSpaceBasis(m).dimension);
    }
  });

  it("shows rank falling exactly as nullity rises", () => {
    const counts = [FULL, RANK_TWO, RANK_ONE, ZERO_MAP].map((m) =>
      rankNullityCount(m),
    );
    expect(counts.map((c) => c.rank)).toEqual([3, 2, 1, 0]);
    expect(counts.map((c) => c.nullity)).toEqual([0, 1, 2, 3]);
  });
});

describe("membership in the column space IS the existence question", () => {
  it("agrees with solvability of A x = b", () => {
    // (2,3,5) is the third column of RANK_TWO, so it is reachable.
    expect(isInColumnSpace(RANK_TWO, [2, 3, 5])).toBe(true);
    // Its image plane is spanned by (1,0,1) and (0,1,1); (0,0,1) is off it.
    expect(isInColumnSpace(RANK_TWO, [0, 0, 1])).toBe(false);
    // A full-rank map reaches everything.
    for (const b of [[1, 0, 0], [0, 1, 0], [7, -2, 3]]) {
      expect(isInColumnSpace(FULL, b)).toBe(true);
    }
    // The zero map reaches only the origin.
    expect(isInColumnSpace(ZERO_MAP, [0, 0, 0])).toBe(true);
    expect(isInColumnSpace(ZERO_MAP, [1, 0, 0])).toBe(false);
  });
});
