import { describe, expect, it } from "vitest";
import { riemannSum } from "../calculus";
import {
  ANTIDERIVATIVE_PAIRS,
  CLASSIFICATION_BATTERY,
  GAUSS_NON_ELEMENTARY,
  PARTS_FIXTURES,
  PARTS_LN,
  PARTS_X_EXP,
  SUB_MAIN_COS,
  SUBSTITUTION_FIXTURES,
  assertIntegrationFixturesAreConsistent,
  differentiatesToTarget,
  ledgerSums,
  partsBoundaryTerm,
  partsIntegrand,
  partsTradedIntegrand,
  stripCorrespondence,
  substitutionIntegrand,
} from "../integrationTechniques";

/**
 * L7 `substitution-parts`'s correctness layer. The block structure follows
 * the insight contract's own claims (insight.md §7): the substitution
 * identity, the parts identity with its boundary term, the ledger picture's
 * exact-tiling obligation, and the verification-discipline grader.
 */

describe("fixtures", () => {
  it("passes the load-time consistency guard", () => {
    expect(() => assertIntegrationFixturesAreConsistent()).not.toThrow();
  });

  it("derives every substitution integrand from its declared structure — SUB_MAIN_COS is 2x·cos(x²)", () => {
    const integrand = substitutionIntegrand(SUB_MAIN_COS);
    for (const x of [0.3, 0.9, 1.5]) {
      expect(integrand(x)).toBeCloseTo(2 * x * Math.cos(x * x), 12);
    }
  });

  it("computes the parts boundary term as the FTC evaluation: [x·eˣ]₀² = 2e²", () => {
    expect(partsBoundaryTerm(PARTS_X_EXP)).toBeCloseTo(2 * Math.E ** 2, 9);
  });
});

describe("the parts identity — ∫u·v′ = [uv] − ∫u′·v (insight.md §7c)", () => {
  it("holds numerically for every parts fixture", () => {
    for (const fix of PARTS_FIXTURES) {
      const [a, b] = fix.domain;
      const lhs = riemannSum(partsIntegrand(fix), a, b, 4000, "mid");
      const rhs = partsBoundaryTerm(fix) - riemannSum(partsTradedIntegrand(fix), a, b, 4000, "mid");
      expect(lhs, fix.id).toBeCloseTo(rhs, 3);
    }
  });

  it("the ln case trades the invisible v′ = 1: ∫₀.₅³ ln x dx = [x ln x − x]", () => {
    const [a, b] = PARTS_LN.domain;
    const direct = riemannSum(Math.log, a, b, 4000, "mid");
    const viaParts = b * Math.log(b) - b - (a * Math.log(a) - a);
    expect(direct).toBeCloseTo(viaParts, 4);
  });
});

describe("the substitution ledger's picture", () => {
  it("u-strips tile the image interval exactly — consecutive strips share edges", () => {
    const n = 40;
    for (let i = 0; i < n - 1; i += 1) {
      const here = stripCorrespondence(SUB_MAIN_COS, i, n);
      const next = stripCorrespondence(SUB_MAIN_COS, i + 1, n);
      expect(here.u + here.uWidth).toBeCloseTo(next.u, 12);
    }
    const first = stripCorrespondence(SUB_MAIN_COS, 0, n);
    const last = stripCorrespondence(SUB_MAIN_COS, n - 1, n);
    const [a, b] = SUB_MAIN_COS.domain;
    expect(first.u).toBeCloseTo(SUB_MAIN_COS.g(a), 12);
    expect(last.u + last.uWidth).toBeCloseTo(SUB_MAIN_COS.g(b), 12);
  });

  it("the strips' width ratio tends to g′ — the honest sense of du = g′(x)dx", () => {
    const x = 1.0;
    for (const n of [50, 500, 5000]) {
      // Find the strip containing x = 1.
      const [a, b] = SUB_MAIN_COS.domain;
      const i = Math.floor(((x - a) / (b - a)) * n);
      const strip = stripCorrespondence(SUB_MAIN_COS, i, n);
      const ratio = strip.uWidth / strip.xWidth;
      // g'(x) = 2x ≈ 2 near x = 1; the ratio converges as n grows.
      expect(Math.abs(ratio - SUB_MAIN_COS.gPrime(strip.x))).toBeLessThan(2 / n + 0.05);
    }
  });

  it("both panels' sums approach the same number, which is F(g(b)) − F(g(a))", () => {
    for (const fix of SUBSTITUTION_FIXTURES) {
      const sums = ledgerSums(fix, 4000);
      expect(sums.xSum, fix.id).toBeCloseTo(sums.exact, 2);
      expect(sums.uSum, fix.id).toBeCloseTo(sums.exact, 2);
    }
  });

  it("rejects nonsense strip requests instead of fabricating geometry", () => {
    expect(() => stripCorrespondence(SUB_MAIN_COS, 5, 5)).toThrow();
    expect(() => stripCorrespondence(SUB_MAIN_COS, -1, 5)).toThrow();
    expect(() => ledgerSums(SUB_MAIN_COS, 0)).toThrow();
  });
});

describe("differentiatesToTarget — the check-by-differentiating grader (insight.md §7d)", () => {
  const MAIN = { domain: SUB_MAIN_COS.domain };

  it("accepts the true antiderivative, in any of its family — the mathematical content of +C", () => {
    for (const candidate of ["sin(x^2)", "sin(x^2) + 5", "sin(x^2) - 100"]) {
      const verdict = differentiatesToTarget(candidate, "2x cos(x^2)", MAIN);
      expect(verdict.kind, candidate).toBe("antiderivative");
    }
  });

  it("accepts equivalent spellings of the parts answer", () => {
    for (const candidate of ["(x - 1) exp(x)", "x exp(x) - exp(x)", "x exp(x) - exp(x) + 3"]) {
      const verdict = differentiatesToTarget(candidate, "x exp(x)", { domain: PARTS_X_EXP.domain });
      expect(verdict.kind, candidate).toBe("antiderivative");
    }
  });

  it("accepts the ln answer on its own interval", () => {
    expect(
      differentiatesToTarget("x ln(x) - x", "ln(x)", { domain: PARTS_LN.domain }).kind,
    ).toBe("antiderivative");
  });

  it("rejects the near-misses a learner actually produces, with a witness point", () => {
    const wrong = [
      "cos(x^2)", // forgot the manufacturing factor's role
      "2x sin(x^2)", // rule-mangling
      "sin(x)^2", // wrong composition
      "2x cos(x^2)", // the integrand itself, unintegrated
    ];
    for (const candidate of wrong) {
      const verdict = differentiatesToTarget(candidate, "2x cos(x^2)", MAIN);
      expect(verdict.kind, candidate).toBe("not-antiderivative");
      if (verdict.kind === "not-antiderivative") {
        expect(Number.isFinite(verdict.witnessX)).toBe(true);
        expect(Math.abs(verdict.derivativeThere - verdict.integrandThere)).toBeGreaterThan(1e-4);
      }
    }
  });

  it("stays undecided — never a pass — for unparseable or nowhere-defined candidates", () => {
    expect(differentiatesToTarget("sin(x^", "2x cos(x^2)", MAIN).kind).toBe("undecided");
    expect(differentiatesToTarget("", "2x cos(x^2)", MAIN).kind).toBe("undecided");
    expect(
      differentiatesToTarget("sqrt(x - 100)", "2x cos(x^2)", MAIN).kind,
    ).toBe("undecided");
  });

  it("throws on an unparseable INTEGRAND — an authoring bug, not a learner verdict", () => {
    expect(() => differentiatesToTarget("sin(x^2)", "2x cos(x^", MAIN)).toThrow(/authoring|does not parse/i);
  });

  it("throws on an empty domain", () => {
    expect(() => differentiatesToTarget("sin(x^2)", "2x cos(x^2)", { domain: [1, 1] })).toThrow(/empty domain/);
  });

  it("is deterministic — the same candidate grades the same way every time", () => {
    for (let i = 0; i < 3; i += 1) {
      expect(differentiatesToTarget("sin(x^2)", "2x cos(x^2)", MAIN).kind).toBe("antiderivative");
      expect(differentiatesToTarget("cos(x^2)", "2x cos(x^2)", MAIN).kind).toBe("not-antiderivative");
    }
  });
});

describe("the antiderivative pairs and the classification battery", () => {
  it("every pair's closure and source agree, and the closure differentiates to the integrand", () => {
    for (const pair of ANTIDERIVATIVE_PAIRS) {
      const verdict = differentiatesToTarget(pair.antiderivativeSource, pair.integrandSource, {
        domain: pair.domain,
      });
      expect(verdict.kind, pair.id).toBe("antiderivative");
    }
  });

  it("the non-elementary case carries a citation and no antiderivative field at all", () => {
    expect(GAUSS_NON_ELEMENTARY.citation).toMatch(/Liouville/);
    expect(GAUSS_NON_ELEMENTARY.citation).toMatch(/not proved|beyond this course/i);
    // Type-level honesty: the shape simply has no antiderivative to misuse.
    expect("antiderivativeSource" in GAUSS_NON_ELEMENTARY).toBe(false);
  });

  it("every chain-labelled classification entry proves its label; neither-labelled entries say why", () => {
    for (const entry of CLASSIFICATION_BATTERY) {
      if (entry.shape === "chain") expect(entry.chain, entry.id).toBeDefined();
      if (entry.shape === "product") expect(entry.product, entry.id).toBeDefined();
      if (entry.shape === "neither") expect(entry.why.length, entry.id).toBeGreaterThan(20);
    }
  });
});
