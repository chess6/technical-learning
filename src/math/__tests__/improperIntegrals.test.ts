import { describe, expect, it } from "vitest";
import {
  COMPARISON_PAIRS,
  IMP_ARCTAN,
  IMP_EXP,
  IMP_GAUSS,
  IMP_P_ONE,
  IMP_P_TWO,
  IMP_SCANDAL,
  IMP_SIN,
  IMP_SQRT_SING,
  IMP_X_EXP,
  PAIR_GAUSS_EXP,
  accumulation,
  assertImproperFixturesAreConsistent,
  octaveContribution,
  octaveRatio,
  pLadderVerdict,
  singularAccumulation,
  tailInequalityHolds,
} from "../improperIntegrals";

/**
 * L8's correctness layer. Blocks mirror the insight contract's §7: the
 * accumulation (the honest object), the p-ladder with its octave mechanism,
 * the scandal's dissection, comparison with hypotheses, divergence modes,
 * and the boundary-term case.
 */

describe("fixtures", () => {
  it("passes the load-time consistency guard", () => {
    expect(() => assertImproperFixturesAreConsistent()).not.toThrow();
  });

  it("the accumulation is exact where F is declared, and says so where it is not", () => {
    expect(accumulation(IMP_EXP, 5).exact).toBe(true);
    expect(accumulation(IMP_EXP, 5).value).toBeCloseTo(1 - Math.exp(-5), 12);
    // The Gaussian has no elementary F (L7's theorem) — corroboration only.
    expect(accumulation(IMP_GAUSS, 5).exact).toBe(false);
  });

  it("A(a) = 0 exactly — nothing has accumulated at the start", () => {
    expect(accumulation(IMP_P_TWO, IMP_P_TWO.a)).toEqual({ value: 0, exact: true });
  });

  it("rejects R before the start rather than fabricating a signed area", () => {
    expect(() => accumulation(IMP_P_ONE, 0.5)).toThrow(/before/);
  });
});

describe("the confrontation — both die, only one settles (§7e)", () => {
  it("1/x² levels off at its declared value; 1/x crosses any named bound", () => {
    expect(accumulation(IMP_P_TWO, 1e6).value).toBeCloseTo(1, 5);
    // The challenge game: name M = 20; R = e^21 defeats it.
    const M = 20;
    expect(accumulation(IMP_P_ONE, Math.exp(M + 1)).value).toBeGreaterThan(M);
  });

  it("the p-ladder converges iff p > 1 at infinity, iff p < 1 at zero — with the declared values", () => {
    expect(pLadderVerdict(2, "infinity")).toEqual({ kind: "converges", value: 1 });
    expect(pLadderVerdict(3, "infinity")).toEqual({ kind: "converges", value: 0.5 });
    expect(pLadderVerdict(1, "infinity").kind).toBe("diverges");
    expect(pLadderVerdict(0.5, "infinity").kind).toBe("diverges");
    expect(pLadderVerdict(0.5, "zero")).toEqual({ kind: "converges", value: 2 });
    expect(pLadderVerdict(1, "zero").kind).toBe("diverges");
    expect(pLadderVerdict(2, "zero").kind).toBe("diverges");
  });

  it("the octave mechanism: equal rent forever at p = 1, geometric ratio 2^(1-p) otherwise", () => {
    for (const k of [0, 3, 10, 20]) {
      expect(octaveContribution(1, k)).toBeCloseTo(Math.log(2), 12);
    }
    expect(octaveRatio(2)).toBeCloseTo(0.5, 12);
    expect(octaveContribution(2, 6) / octaveContribution(2, 5)).toBeCloseTo(0.5, 9);
    // p < 1: rents GROW — divergence by the same mechanism, mirrored.
    expect(octaveRatio(0.5)).toBeGreaterThan(1);
  });
});

describe("the scandal (§7d) and the survived singularity", () => {
  it("each ε-truncation of ∫₀¹ x⁻² is honest and they grow without bound", () => {
    expect(singularAccumulation(IMP_SCANDAL, 0.01).value).toBeCloseTo(99, 6);
    expect(singularAccumulation(IMP_SCANDAL, 1e-6).value).toBeGreaterThan(999998);
  });

  it("1/√x survives its singularity: the truncations settle at 2", () => {
    expect(singularAccumulation(IMP_SQRT_SING, 1e-8).value).toBeCloseTo(2, 3);
  });

  it("rejects a non-positive ε rather than touching the singularity", () => {
    expect(() => singularAccumulation(IMP_SCANDAL, 0)).toThrow(/positive/);
  });
});

describe("comparison — the hypotheses are checked, not assumed (§7g)", () => {
  it("every shipped pair's tail inequality is corroborated", () => {
    for (const pair of COMPARISON_PAIRS) {
      expect(tailInequalityHolds(pair.smaller, pair.larger, pair.tailStart).kind, pair.id).toBe("holds");
    }
  });

  it("a FALSE comparator is refuted with a witness — the certain direction", () => {
    // Claim e^{-x} ≤ e^{-x²} on [1, ∞): false (the inequality runs the other way).
    const verdict = tailInequalityHolds(PAIR_GAUSS_EXP.larger, PAIR_GAUSS_EXP.smaller, 1);
    expect(verdict.kind).toBe("fails");
    if (verdict.kind === "fails") {
      expect(verdict.smallerThere).toBeGreaterThan(verdict.largerThere);
    }
  });

  it("a negative integrand fails the 0 ≤ f hypothesis, with a witness", () => {
    const verdict = tailInequalityHolds(Math.sin, (x) => 1 / x, 1);
    expect(verdict.kind).toBe("fails");
  });

  it("the redemption: the Gaussian's verdict is owned by its comparison pair, not by an antiderivative", () => {
    expect(IMP_GAUSS.F).toBeUndefined();
    expect(IMP_GAUSS.decidedBy).toBe("gauss-vs-exp");
    expect(PAIR_GAUSS_EXP.largerTailValue).toBeCloseTo(Math.exp(-1), 12);
  });
});

describe("divergence modes are distinct claims (§7h, §7i)", () => {
  it("sin's accumulation is bounded and never settles — diverges-oscillates, not infinite", () => {
    expect(IMP_SIN.verdict).toEqual({ kind: "diverges", mode: "oscillates" });
    for (const R of [10, 100, 1000]) {
      const v = accumulation(IMP_SIN, R).value;
      expect(v).toBeGreaterThanOrEqual(-0.001);
      expect(v).toBeLessThanOrEqual(2.001);
    }
  });

  it("1/x's mode is unbounded — the two failures are not the same claim", () => {
    expect(IMP_P_ONE.verdict).toEqual({ kind: "diverges", mode: "unbounded" });
  });
});

describe("the boundary term at infinity (§7j)", () => {
  it("∫₀^R x·e⁻ˣ = 1 − (R+1)e⁻ᴿ — the [uv] entry is a limit, and it converges to 1", () => {
    for (const R of [5, 20, 60]) {
      expect(accumulation(IMP_X_EXP, R).value).toBeCloseTo(1 - (R + 1) * Math.exp(-R), 10);
    }
    expect(accumulation(IMP_X_EXP, 60).value).toBeCloseTo(1, 9);
  });

  it("arctan: the shorthand done right — ruler and ritual agree at π/2", () => {
    expect(accumulation(IMP_ARCTAN, 1e7).value).toBeCloseTo(Math.PI / 2, 6);
  });
});
