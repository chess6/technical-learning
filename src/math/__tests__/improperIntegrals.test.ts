import { describe, expect, it } from "vitest";
import {
  IMP_GAUSS, IMP_P_ONE, IMP_P_TWO, IMP_RIGHT_SQRT_SING, IMP_SCANDAL,
  IMP_SIN, IMP_X_EXP, PAIR_GAUSS_EXP, accumulation,
  assertImproperFixturesAreConsistent, findTailCounterexample,
  minimumCForCubicMajorant, octaveContribution, octaveRatio, pLadderVerdict,
  singularAccumulation, tailInequalityHolds,
} from "../improperIntegrals";

function nextDown(value: number): number {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  let bits = view.getBigUint64(0);
  bits -= 1n;
  view.setBigUint64(0, bits);
  return view.getFloat64(0);
}

describe("finite accumulations and fixtures", () => {
  it("passes the source consistency guard", () => {
    expect(() => assertImproperFixturesAreConsistent()).not.toThrow();
  });
  it("keeps the Gaussian value unowned and quadrature inexact", () => {
    expect(IMP_GAUSS.verdict).toEqual({ kind: "converges" });
    expect(IMP_GAUSS.F).toBeUndefined();
    expect(accumulation(IMP_GAUSS, 5).exact).toBe(false);
  });
  it("rejects a truncation before the start", () => {
    expect(() => accumulation(IMP_P_ONE, 0.5)).toThrow(/before/);
  });
  it("distinguishes unbounded and oscillatory divergence", () => {
    expect(IMP_P_ONE.verdict).toEqual({ kind: "diverges", mode: "unbounded" });
    expect(IMP_SIN.verdict).toEqual({ kind: "diverges", mode: "oscillates" });
  });
});

describe("p ladder and octave mechanism", () => {
  it("classifies both edges with exact values", () => {
    expect(pLadderVerdict(3, "infinity")).toEqual({ kind: "converges", value: 0.5 });
    expect(pLadderVerdict(1, "infinity").kind).toBe("diverges");
    expect(pLadderVerdict(0.5, "zero")).toEqual({ kind: "converges", value: 2 });
    expect(pLadderVerdict(1, "zero").kind).toBe("diverges");
  });
  it("makes the equal-rent and geometric mechanisms exact", () => {
    expect(octaveContribution(1, 17)).toBeCloseTo(Math.log(2), 12);
    expect(octaveRatio(2)).toBe(0.5);
    expect(octaveContribution(2, 6) / octaveContribution(2, 5)).toBeCloseTo(0.5, 12);
  });
});

describe("Type-II orientation", () => {
  it("left-edge scandal grows positively", () => {
    expect(singularAccumulation(IMP_SCANDAL, 0.01).value).toBeCloseTo(99, 10);
  });
  it("right-edge singularity preserves ordinary orientation", () => {
    expect(singularAccumulation(IMP_RIGHT_SQRT_SING, 1e-12).value).toBeCloseTo(1.8, 5);
  });
  it("rejects epsilon at or below zero", () => {
    expect(() => singularAccumulation(IMP_SCANDAL, 0)).toThrow(/positive/);
  });
  it.each([
    [IMP_SCANDAL, 1], [IMP_SCANDAL, 2],
    [IMP_RIGHT_SQRT_SING, 0.81], [IMP_RIGHT_SQRT_SING, 2],
  ])("rejects equality and overrun for %s", (fixture, epsilon) => {
    expect(() => singularAccumulation(fixture, epsilon)).toThrow(/strictly inside/);
  });
});

describe("analytic comparison certificates", () => {
  it.each([
    [0.5, 1.5], [0.5, 2], [minimumCForCubicMajorant(2.5) as number, 2.5], [1, 3],
  ])("accepts cubic majorant C=%s, p=%s", (C, p) => {
    expect(tailInequalityHolds(
      "cubic-convergent-majorant", C, p, "target-lte-comparator",
    )).toEqual({ kind: "holds", certificate: "analytic" });
  });
  it("rejects invalid cubic boundary classes", () => {
    for (const [C, p] of [[1, 1], [1, 3.000001], [0.499999, 2], [Infinity, 2]]) {
      expect(tailInequalityHolds(
        "cubic-convergent-majorant", C, p, "target-lte-comparator",
      ).kind).toBe("fails");
    }
  });
  it("accepts every sampled curved threshold and rejects its next representable neighbor below", () => {
    for (let i = 1; i < 100; i += 1) {
      const p = 2 + i / 100;
      const boundary = minimumCForCubicMajorant(p)!;
      expect(tailInequalityHolds(
        "cubic-convergent-majorant", boundary, p, "target-lte-comparator",
      ).kind, `boundary p=${p}`).toBe("holds");
      expect(tailInequalityHolds(
        "cubic-convergent-majorant", nextDown(boundary), p, "target-lte-comparator",
      ).kind, `nextDown p=${p}`).toBe("fails");
    }
  });
  it.each([[1, 0.5], [0.25, 0.75], [1, 1]])(
    "accepts divergent minorant C=%s, p=%s", (C, p) => {
      expect(tailInequalityHolds(
        "sqrt-divergent-minorant", C, p, "comparator-lte-target",
      ).kind).toBe("holds");
    },
  );
  it("rejects wrong direction and invalid minorant boundaries", () => {
    for (const [C, p] of [[1.000001, 1], [1, 0.499999], [1, 1.000001]]) {
      expect(tailInequalityHolds(
        "sqrt-divergent-minorant", C, p, "comparator-lte-target",
      ).kind).toBe("fails");
    }
    expect(tailInequalityHolds(
      "sqrt-divergent-minorant", 1, 1, "target-lte-comparator",
    ).kind).toBe("fails");
  });
  it("uses samples only for certain rejection witnesses", () => {
    expect(findTailCounterexample(
      PAIR_GAUSS_EXP.larger, PAIR_GAUSS_EXP.smaller, 1,
    )).toBeDefined();
  });
});

describe("parts boundary", () => {
  it("keeps R e^-R inside the finite accumulation", () => {
    for (const R of [5, 20, 60]) {
      expect(accumulation(IMP_X_EXP, R).value)
        .toBeCloseTo(1 - (R + 1) * Math.exp(-R), 12);
    }
    expect(accumulation(IMP_P_TWO, 1e6).value).toBeCloseTo(1, 5);
  });
});
