import { describe, expect, it } from "vitest";
import { LINEAR_SYSTEM_EXAMPLE as EX } from "../../lessons/exampleData";
import { classifyLinearSystem2x2 } from "../systems";
import {
  applyRowOperation,
  assertRowOperationPreservesSolutions,
  augmentedFromSystem,
  canonicalizeRowOperation,
  classifyRowOperation,
  eliminationStepToClearX,
  haveSameSolutionSet,
  inverseRowOperation,
  isSolutionPreserving,
  numericalStabilityWarning,
  rowOperationSummary,
  satisfiesSystem,
  singleRowOperationBetween,
  systemMatrix,
  systemRhs,
  type AugmentedSystem,
  type RowOperation,
} from "../elimination";

/** The lesson's running system: A = [[1,3],[2,-1]], b = (-1,5), solution (2,-1). */
const uniqueSystem = augmentedFromSystem(EX.a, EX.b);
/** Dependent columns with b on the line: infinitely many solutions. */
const infiniteSystem = augmentedFromSystem(EX.aDependent, EX.bInfinite);
/** Dependent columns with b off the line: no solution. */
const noneSystem = augmentedFromSystem(EX.aDependent, EX.bNone);

const REVERSIBLE_OPS: RowOperation[] = [
  { kind: "swap" },
  { kind: "scale", row: 0, factor: 3 },
  { kind: "scale", row: 1, factor: -2 },
  { kind: "add", source: 0, target: 1, factor: -2 },
  { kind: "add", source: 1, target: 0, factor: 0.5 },
];

describe("augmented system round-trips with A and b", () => {
  it("extracts back the coefficient matrix and right-hand side", () => {
    expect(systemMatrix(uniqueSystem)).toEqual(EX.a);
    expect(systemRhs(uniqueSystem)).toEqual(EX.b);
  });
});

describe("reversible row operations preserve the solution set", () => {
  it.each(REVERSIBLE_OPS)("preserves the unique solution under %o", (op) => {
    // assertRowOperationPreservesSolutions checks kind, unique solution, and
    // that op then inverse restores the original system.
    expect(() => assertRowOperationPreservesSolutions(uniqueSystem, op)).not.toThrow();
    const after = applyRowOperation(uniqueSystem, op);
    const solution = classifyLinearSystem2x2(systemMatrix(after), systemRhs(after)).solution;
    expect(solution?.[0]).toBeCloseTo(EX.solution[0], 9);
    expect(solution?.[1]).toBeCloseTo(EX.solution[1], 9);
  });

  it("keeps an infinite system infinite and its solution line intact", () => {
    for (const op of REVERSIBLE_OPS) {
      expect(() => assertRowOperationPreservesSolutions(infiniteSystem, op)).not.toThrow();
      const after = applyRowOperation(infiniteSystem, op);
      // Every point on the original solution line x + 2y = 3 must still satisfy
      // the transformed system (probe several).
      for (const [x, y] of [
        [3, 0],
        [1, 1],
        [-1, 2],
      ] as const) {
        expect(satisfiesSystem(after, [x, y])).toBe(true);
      }
    }
  });

  it("keeps an inconsistent system inconsistent", () => {
    for (const op of REVERSIBLE_OPS) {
      expect(() => assertRowOperationPreservesSolutions(noneSystem, op)).not.toThrow();
      const after = applyRowOperation(noneSystem, op);
      expect(classifyLinearSystem2x2(systemMatrix(after), systemRhs(after)).kind).toBe("none");
    }
  });
});

describe("illegal operations are flagged and never asserted as preserving", () => {
  it("scale by 0 is irreversible and grows the solution set", () => {
    const op: RowOperation = { kind: "scale", row: 1, factor: 0 };
    expect(isSolutionPreserving(op)).toBe(false);
    expect(classifyRowOperation(op).reversible).toBe(false);
    expect(() => assertRowOperationPreservesSolutions(uniqueSystem, op)).toThrow(
      /not solution-preserving/,
    );
    // Zeroing row 2 (2x - y = 5) leaves only x + 3y = -1: a whole line of
    // solutions where there had been one — the unique solution was destroyed.
    const after = applyRowOperation(uniqueSystem, op);
    const kind = classifyLinearSystem2x2(systemMatrix(after), systemRhs(after)).kind;
    expect(kind).not.toBe("unique");
  });

  it("treats self-add R1 ← R1 + 2·R1 as the valid scaling R1 ← 3·R1", () => {
    // Self-addition is a disguised scaling, not an illegal fourth operation:
    // R1 + 2·R1 = 3·R1, a nonzero scale, so it preserves the solution set.
    const op: RowOperation = { kind: "add", source: 0, target: 0, factor: 2 };
    expect(canonicalizeRowOperation(op)).toEqual({ kind: "scale", row: 0, factor: 3 });
    expect(isSolutionPreserving(op)).toBe(true);
    expect(classifyRowOperation(op).reversible).toBe(true);
    // It genuinely scales row 0 by 3 (and never throws).
    const after = applyRowOperation(uniqueSystem, op);
    expect(after.rows[0]).toEqual([3, 9, -3]);
    expect(after.rows[1]).toEqual(uniqueSystem.rows[1]);
    expect(() => assertRowOperationPreservesSolutions(uniqueSystem, op)).not.toThrow();
  });

  it("flags self-add R1 ← R1 − R1 (scale by 0) as the only illegal self-add", () => {
    const op: RowOperation = { kind: "add", source: 0, target: 0, factor: -1 };
    expect(canonicalizeRowOperation(op)).toEqual({ kind: "scale", row: 0, factor: 0 });
    expect(isSolutionPreserving(op)).toBe(false);
    expect(classifyRowOperation(op).reversible).toBe(false);
    expect(() => inverseRowOperation(op)).toThrow(/no inverse/);
  });
});

describe("non-finite factors (NaN / ±Infinity) are rejected as invalid, not just nonzero", () => {
  const NON_FINITE: [string, number][] = [
    ["NaN", NaN],
    ["Infinity", Infinity],
    ["-Infinity", -Infinity],
  ];

  it.each(NON_FINITE)("rejects scale by %s", (_label, factor) => {
    const op: RowOperation = { kind: "scale", row: 1, factor };
    expect(isSolutionPreserving(op)).toBe(false);
    expect(classifyRowOperation(op).reversible).toBe(false);
    // A non-finite factor is an illegality, NOT a numerical-stability warning.
    expect(numericalStabilityWarning(op)).toBeNull();
    expect(() => inverseRowOperation(op)).toThrow(/no inverse/);
    expect(() => assertRowOperationPreservesSolutions(uniqueSystem, op)).toThrow(
      /not solution-preserving/,
    );
  });

  it.each(NON_FINITE)("rejects a distinct-row add with factor %s", (_label, factor) => {
    const op: RowOperation = { kind: "add", source: 0, target: 1, factor };
    expect(isSolutionPreserving(op)).toBe(false);
    expect(classifyRowOperation(op).reversible).toBe(false);
    expect(numericalStabilityWarning(op)).toBeNull();
    expect(() => inverseRowOperation(op)).toThrow(/no inverse/);
    expect(() => assertRowOperationPreservesSolutions(uniqueSystem, op)).toThrow(
      /not solution-preserving/,
    );
  });

  it.each(NON_FINITE)("rejects a self-add with factor %s (canonicalizes to a non-finite scale)", (_label, factor) => {
    const op: RowOperation = { kind: "add", source: 0, target: 0, factor };
    // Canonicalizes to scale by 1 + k, which is non-finite for a non-finite k.
    const canonical = canonicalizeRowOperation(op);
    expect(canonical.kind).toBe("scale");
    expect(Number.isFinite((canonical as { factor: number }).factor)).toBe(false);
    expect(isSolutionPreserving(op)).toBe(false);
    expect(classifyRowOperation(op).reversible).toBe(false);
    expect(numericalStabilityWarning(op)).toBeNull();
    expect(() => inverseRowOperation(op)).toThrow(/no inverse/);
    expect(() => assertRowOperationPreservesSolutions(uniqueSystem, op)).toThrow(
      /not solution-preserving/,
    );
  });

  it("still accepts an ordinary finite nonzero factor (guard did not over-reject)", () => {
    expect(isSolutionPreserving({ kind: "scale", row: 1, factor: -2 })).toBe(true);
    expect(isSolutionPreserving({ kind: "add", source: 0, target: 1, factor: 3 })).toBe(true);
    expect(isSolutionPreserving({ kind: "add", source: 0, target: 0, factor: 2 })).toBe(true);
  });
});

describe("validity is exact; tiny factors are a stability warning, not illegal", () => {
  it("accepts scaling by an arbitrarily small nonzero factor as solution-preserving", () => {
    // The formal statement says EVERY nonzero factor is valid. A factor far
    // below DEFAULT_TOLERANCE is still mathematically reversible — validity is
    // exact, not tolerance-gated. (The tolerance-based CLASSIFIER may fail to
    // certify such an extreme numerically; that is the stability concern below,
    // not an illegality — hence we assert validity directly here.)
    const tiny: RowOperation = { kind: "scale", row: 1, factor: 1e-12 };
    expect(isSolutionPreserving(tiny)).toBe(true);
    expect(classifyRowOperation(tiny).reversible).toBe(true);
    // The inverse is its reciprocal — an exact bijection on the rows.
    expect(inverseRowOperation(tiny)).toEqual({ kind: "scale", row: 1, factor: 1e12 });
  });

  it("separates the numerical-stability warning from validity", () => {
    // Tiny nonzero factor: valid but fragile -> a warning string.
    expect(numericalStabilityWarning({ kind: "scale", row: 1, factor: 1e-12 })).toMatch(
      /numerically fragile/,
    );
    // Ordinary factor: no warning.
    expect(numericalStabilityWarning({ kind: "scale", row: 1, factor: 3 })).toBeNull();
    // Exactly zero is an illegality (isSolutionPreserving handles it), not a warning.
    expect(numericalStabilityWarning({ kind: "scale", row: 1, factor: 0 })).toBeNull();
    // A self-add reducing to a tiny scale warns too (1 + (−1 + ε) ≈ ε).
    expect(
      numericalStabilityWarning({ kind: "add", source: 0, target: 0, factor: -1 + 1e-12 }),
    ).toMatch(/numerically fragile/);
    // A distinct-row add never carries a stability warning.
    expect(numericalStabilityWarning({ kind: "add", source: 0, target: 1, factor: -2 })).toBeNull();
  });
});

describe("elimination step and its inverse", () => {
  it("clears x from row 2 with the multiplier the worked example uses", () => {
    const op = eliminationStepToClearX(uniqueSystem);
    // Row 2 x-coefficient is 2, pivot is 1 -> factor -2.
    expect(op).toEqual({ kind: "add", source: 0, target: 1, factor: -2 });
    const after = applyRowOperation(uniqueSystem, op!);
    // R2 becomes (0, -7, 7): 0x - 7y = 7 -> y = -1.
    expect(after.rows[1]).toEqual([0, -7, 7]);
    // Solution is unchanged.
    expect(() => assertRowOperationPreservesSolutions(uniqueSystem, op!)).not.toThrow();
  });

  it("returns null when row 0 cannot be an x-pivot", () => {
    const noPivot: AugmentedSystem = { rows: [[0, 1, 2], [1, 0, 3]] };
    expect(eliminationStepToClearX(noPivot)).toBeNull();
  });

  it("inverse undoes each reversible operation", () => {
    for (const op of REVERSIBLE_OPS) {
      const restored = applyRowOperation(applyRowOperation(uniqueSystem, op), inverseRowOperation(op));
      expect(restored.rows[0]).toEqual(uniqueSystem.rows[0]);
      expect(restored.rows[1]).toEqual(uniqueSystem.rows[1]);
    }
  });
});

describe("haveSameSolutionSet compares solution sets case by case", () => {
  it("unique: equal iff the single solution points coincide", () => {
    const after = applyRowOperation(uniqueSystem, { kind: "add", source: 0, target: 1, factor: -2 });
    expect(haveSameSolutionSet(uniqueSystem, after)).toBe(true);
    // Scaling by 0 destroys row 2 -> now infinitely many, a different set.
    const broken = applyRowOperation(uniqueSystem, { kind: "scale", row: 1, factor: 0 });
    expect(haveSameSolutionSet(uniqueSystem, broken)).toBe(false);
  });

  it("infinite: equal iff the solution LINES coincide (not merely both infinite)", () => {
    // A legal op keeps the same solution line.
    const same = applyRowOperation(infiniteSystem, { kind: "scale", row: 0, factor: 3 });
    expect(haveSameSolutionSet(infiniteSystem, same)).toBe(true);
    // A different dependent system that is ALSO infinite but on another line:
    // x + 2y = 5 (parallel-shifted line, still dependent+consistent as a system).
    const otherLine: AugmentedSystem = { rows: [[1, 2, 5], [2, 4, 10]] };
    expect(classifyLinearSystem2x2(systemMatrix(otherLine), systemRhs(otherLine)).kind).toBe(
      "infinite",
    );
    expect(haveSameSolutionSet(infiniteSystem, otherLine)).toBe(false);
  });

  it("none: two empty solution sets are equal", () => {
    const after = applyRowOperation(noneSystem, { kind: "swap" });
    expect(haveSameSolutionSet(noneSystem, after)).toBe(true);
  });

  it("infinite: the whole-plane (all-zero) system equals itself", () => {
    // 0x + 0y = 0 twice: every point of the plane is a solution. The classifier
    // calls this `infinite`, but its solution set is the plane, not a line.
    const zeroSystem: AugmentedSystem = { rows: [[0, 0, 0], [0, 0, 0]] };
    expect(classifyLinearSystem2x2(systemMatrix(zeroSystem), systemRhs(zeroSystem)).kind).toBe(
      "infinite",
    );
    // Must compare equal to itself (the historical bug returned false here).
    expect(haveSameSolutionSet(zeroSystem, zeroSystem)).toBe(true);
    // A different all-zero encoding is still the whole plane, hence equal.
    const alsoZero: AugmentedSystem = { rows: [[0, 0, 0], [0, 0, 0]] };
    expect(haveSameSolutionSet(zeroSystem, alsoZero)).toBe(true);
  });

  it("infinite: a solution line and the whole plane are NOT equal (either order)", () => {
    const zeroSystem: AugmentedSystem = { rows: [[0, 0, 0], [0, 0, 0]] };
    // infiniteSystem is a genuine line (x + 2y = 3); the zero system is the plane.
    expect(haveSameSolutionSet(infiniteSystem, zeroSystem)).toBe(false);
    expect(haveSameSolutionSet(zeroSystem, infiniteSystem)).toBe(false);
  });

  it("different trichotomy kinds are never equal", () => {
    expect(haveSameSolutionSet(uniqueSystem, infiniteSystem)).toBe(false);
    expect(haveSameSolutionSet(infiniteSystem, noneSystem)).toBe(false);
  });
});

describe("row operation summaries name moves consistently", () => {
  it("formats each kind", () => {
    expect(rowOperationSummary({ kind: "swap" })).toBe("Swap R1 and R2");
    expect(rowOperationSummary({ kind: "scale", row: 1, factor: 3 })).toBe("Multiply R2 by 3");
    expect(rowOperationSummary({ kind: "add", source: 0, target: 1, factor: -2 })).toBe(
      "R2 → R2 − 2·R1",
    );
    expect(rowOperationSummary({ kind: "add", source: 1, target: 0, factor: 1 })).toBe(
      "R1 → R1 + R2",
    );
  });
});

describe("singleRowOperationBetween finds exactly-one-operation images (not same-solution)", () => {
  // A degenerate zero-pivot system: R1 = (0,1,4), R2 = (2,3,10); solution (-1, 4).
  const zeroPivot: AugmentedSystem = { rows: [[0, 1, 4], [2, 3, 10]] };
  const image = (op: RowOperation) => applyRowOperation(zeroPivot, op);

  it("identifies each single elementary operation and verifies it round-trips", () => {
    for (const op of REVERSIBLE_OPS) {
      const found = singleRowOperationBetween(zeroPivot, image(op));
      expect(found).not.toBeNull();
      // The found op reproduces the same image (it need not be structurally identical,
      // but it must map `from` to the same matrix).
      expect(applyRowOperation(zeroPivot, found!).rows).toEqual(image(op).rows);
    }
  });

  it("accepts the swap and R1 → R1 + k·R2 for any nonzero k", () => {
    expect(singleRowOperationBetween(zeroPivot, { rows: [[2, 3, 10], [0, 1, 4]] })).toEqual({
      kind: "swap",
    });
    for (const k of [1, 2, -3, 0.5]) {
      const to: AugmentedSystem = { rows: [[2 * k, 1 + 3 * k, 4 + 10 * k], [2, 3, 10]] };
      const op = singleRowOperationBetween(zeroPivot, to);
      expect(op).toEqual({ kind: "add", source: 1, target: 0, factor: k });
    }
  });

  it("rejects images that require more than one operation or are unrelated", () => {
    // Full RREF: shares the unique solution (-1, 4) but needs multiple operations.
    expect(singleRowOperationBetween(zeroPivot, { rows: [[1, 0, -1], [0, 1, 4]] })).toBeNull();
    // Unrelated system with the same unique solution, not a one-op image.
    expect(singleRowOperationBetween(zeroPivot, { rows: [[5, 1, -1], [1, 1, 3]] })).toBeNull();
    // A solution-changing matrix.
    expect(singleRowOperationBetween(zeroPivot, { rows: [[2, 3, 11], [0, 1, 4]] })).toBeNull();
  });

  it("does not treat 'same solution set' as 'one operation'", () => {
    const from = augmentedFromSystem(EX.a, EX.b);
    // Reduce twice: scale then add — the result shares the solution but is two ops.
    const twoOps = applyRowOperation(
      applyRowOperation(from, { kind: "scale", row: 0, factor: 2 }),
      { kind: "add", source: 0, target: 1, factor: 1 },
    );
    expect(haveSameSolutionSet(from, twoOps)).toBe(true);
    expect(singleRowOperationBetween(from, twoOps)).toBeNull();
  });
});
