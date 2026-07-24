import { describe, expect, it } from "vitest";
import {
  areLinearlyIndependent,
  inNullSpace,
  matVec,
  rref,
  solveLinearSystem,
  solves,
  vectorSetRank,
} from "../linearSystemsGeneral";
import {
  SYS_APPLIED_3X3,
  SYS_APPLIED_RECT,
  SYS_CLASSIFY_FRESH,
  SYS_CUMULATIVE,
  SYS_METHOD_ELIMINATION,
  SYS_METHOD_REACHABILITY,
  SYS_SOLSET_FRESH,
} from "../../lessons/moduleItems";

/** Independently verify a returned solution actually solves the system. */
function assertSolutionValid(
  system: { matrix: readonly (readonly number[])[]; rhs: readonly number[] },
  expectedFree: number,
) {
  const sol = solveLinearSystem(system.matrix, system.rhs);
  expect(sol.consistent).toBe(true);
  expect(sol.freeCount).toBe(expectedFree);
  expect(sol.particular).toBeDefined();
  expect(sol.nullBasis).toBeDefined();
  // The particular solution truly solves A x = b.
  expect(solves(system.matrix, system.rhs, sol.particular!)).toBe(true);
  // Each returned null direction is nonzero and lies in Null(A).
  expect(sol.nullBasis!).toHaveLength(expectedFree);
  for (const dir of sol.nullBasis!) {
    expect(inNullSpace(system.matrix, dir)).toBe(true);
    expect(matVec(system.matrix, dir).every((c) => Math.abs(c) < 1e-9)).toBe(true);
  }
  if (expectedFree > 0) expect(areLinearlyIndependent(sol.nullBasis!)).toBe(true);
  return sol;
}

describe("general linear-system solver — RREF primitives", () => {
  it("reduces an invertible 2×2 to the identity with two pivots", () => {
    const { matrix, pivotColumns } = rref([
      [2, 1],
      [1, 3],
    ]);
    expect(pivotColumns).toEqual([0, 1]);
    expect(matrix[0]![0]).toBeCloseTo(1);
    expect(matrix[1]![1]).toBeCloseTo(1);
    expect(matrix[0]![1]).toBeCloseTo(0);
    expect(matrix[1]![0]).toBeCloseTo(0);
  });

  it("computes rank of a vector set", () => {
    expect(
      vectorSetRank([
        [1, 2],
        [2, 4],
      ]),
    ).toBe(1);
    expect(
      vectorSetRank([
        [1, 0],
        [0, 1],
      ]),
    ).toBe(2);
  });
});

describe("Package G systems — independently verified", () => {
  it("mod-transfer-solset-fresh: 2×3 consistent, 1 free variable", () => {
    const sol = assertSolutionValid(SYS_SOLSET_FRESH, 1);
    // A known valid parameterization the item's explanation states.
    expect(solves(SYS_SOLSET_FRESH.matrix, SYS_SOLSET_FRESH.rhs, [3, 0, -1])).toBe(true);
    expect(inNullSpace(SYS_SOLSET_FRESH.matrix, [-2, 1, 0])).toBe(true);
    expect(sol.pivotColumns.length).toBe(2);
  });

  it("mod-cumulative-elim-solset: 3×3 consistent, 1 free variable", () => {
    assertSolutionValid(SYS_CUMULATIVE, 1);
    expect(solves(SYS_CUMULATIVE.matrix, SYS_CUMULATIVE.rhs, [-2, 8, 0])).toBe(true);
    expect(inNullSpace(SYS_CUMULATIVE.matrix, [1, -2, 1])).toBe(true);
  });

  it("mod-p2-applied-3x3: 3×3 consistent, 1 free variable", () => {
    assertSolutionValid(SYS_APPLIED_3X3, 1);
    expect(solves(SYS_APPLIED_3X3.matrix, SYS_APPLIED_3X3.rhs, [2, -3, 0])).toBe(true);
    expect(inNullSpace(SYS_APPLIED_3X3.matrix, [-1, 3, 1])).toBe(true);
  });

  it("mod-p2-applied-rect: 3×2 rectangular is INCONSISTENT (contradiction row ⇒ ∅)", () => {
    const sol = solveLinearSystem(SYS_APPLIED_RECT.matrix, SYS_APPLIED_RECT.rhs);
    expect(sol.consistent).toBe(false);
    expect(sol.particular).toBeUndefined();
    // The unique candidate from the first two rows fails the third.
    expect(solves(SYS_APPLIED_RECT.matrix, SYS_APPLIED_RECT.rhs, [2, 1])).toBe(false);
  });

  it("mod-transfer-classify: 2×2 dependent columns, b unreachable ⇒ inconsistent", () => {
    const sol = solveLinearSystem(SYS_CLASSIFY_FRESH.matrix, SYS_CLASSIFY_FRESH.rhs);
    expect(sol.consistent).toBe(false);
    expect(sol.rank).toBe(1); // dependent columns
  });

  it("mod-select-method fixtures: P is infinite (dependent), Q is unique", () => {
    const p = solveLinearSystem(SYS_METHOD_REACHABILITY.matrix, SYS_METHOD_REACHABILITY.rhs);
    expect(p.consistent).toBe(true);
    expect(p.freeCount).toBe(1); // infinitely many
    const q = solveLinearSystem(SYS_METHOD_ELIMINATION.matrix, SYS_METHOD_ELIMINATION.rhs);
    expect(q.consistent).toBe(true);
    expect(q.freeCount).toBe(0); // unique
    expect(q.particular![0]).toBeCloseTo(1);
    expect(q.particular![1]).toBeCloseTo(3);
  });
});
