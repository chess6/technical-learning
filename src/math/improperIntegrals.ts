/**
 * Pure mathematics for L8. Exports finite accumulations and analytic
 * verdicts; there is deliberately no improper-integral value object.
 * Quadrature corroborates fixtures but never certifies a universal claim.
 */
import { boundaryAwareDerivative, riemannSum, type RealFunction } from "./calculus";
import { evaluate, tryParseExpression } from "./expression";

export type DivergenceMode = "unbounded" | "oscillates";
export type ImproperVerdict =
  | { readonly kind: "converges"; readonly value?: number }
  | { readonly kind: "diverges"; readonly mode: DivergenceMode };

export interface TailFixture {
  readonly id: string;
  readonly label: string;
  readonly integrand: RealFunction;
  readonly integrandSource: string;
  readonly a: number;
  readonly F?: RealFunction;
  /** Analytic limit of the declared F at infinity; owns the tail verdict. */
  readonly antiderivativeLimit?:
    | { readonly kind: "finite"; readonly value: number }
    | { readonly kind: "unbounded" }
    | { readonly kind: "oscillates" };
  readonly verdict: ImproperVerdict;
  readonly decidedBy?: string;
}

export interface SingularFixture {
  readonly id: string;
  readonly label: string;
  readonly integrand: RealFunction;
  readonly integrandSource: string;
  readonly s: number;
  readonly b: number;
  readonly F?: RealFunction;
  readonly verdict: ImproperVerdict;
}

export function accumulation(
  fixture: TailFixture,
  R: number,
): { readonly value: number; readonly exact: boolean } {
  if (!Number.isFinite(R) || R < fixture.a) {
    throw new Error("accumulation: R is before " + fixture.id + "'s start.");
  }
  if (R === fixture.a) return { value: 0, exact: true };
  if (fixture.F) return { value: fixture.F(R) - fixture.F(fixture.a), exact: true };
  return { value: riemannSum(fixture.integrand, fixture.a, R, 4000, "mid"), exact: false };
}

/** Positively oriented finite truncation, for either singular endpoint. */
export function singularAccumulation(
  fixture: SingularFixture,
  epsilon: number,
): { readonly value: number; readonly exact: boolean } {
  if (!Number.isFinite(epsilon) || epsilon <= 0) {
    throw new Error("singularAccumulation: epsilon must be positive.");
  }
  if (epsilon >= Math.abs(fixture.s - fixture.b)) {
    throw new Error("singularAccumulation: epsilon must stay strictly inside the interval.");
  }
  const truncated = fixture.s < fixture.b
    ? fixture.s + epsilon
    : fixture.s - epsilon;
  const lo = Math.min(truncated, fixture.b);
  const hi = Math.max(truncated, fixture.b);
  if (!(hi > lo)) throw new Error("singularAccumulation: epsilon swallows the interval.");
  if (fixture.F) return { value: fixture.F(hi) - fixture.F(lo), exact: true };
  return { value: riemannSum(fixture.integrand, lo, hi, 4000, "mid"), exact: false };
}

export function pLadderVerdict(
  p: number,
  edge: "infinity" | "zero",
): ImproperVerdict {
  if (!Number.isFinite(p)) throw new Error("p must be finite.");
  if (edge === "infinity") {
    return p > 1
      ? { kind: "converges", value: 1 / (p - 1) }
      : { kind: "diverges", mode: "unbounded" };
  }
  return p < 1
    ? { kind: "converges", value: 1 / (1 - p) }
    : { kind: "diverges", mode: "unbounded" };
}

export function octaveContribution(p: number, k: number): number {
  const lo = 2 ** k;
  const hi = 2 ** (k + 1);
  return p === 1
    ? Math.log(2)
    : (hi ** (1 - p) - lo ** (1 - p)) / (1 - p);
}

export function octaveRatio(p: number): number {
  return 2 ** (1 - p);
}

export type ComparisonTarget =
  | "cubic-convergent-majorant"
  | "sqrt-divergent-minorant";
export type ComparisonDirection =
  | "target-lte-comparator"
  | "comparator-lte-target";
export type TailInequalityVerdict =
  | { readonly kind: "holds"; readonly certificate: "analytic" }
  | { readonly kind: "fails"; readonly reason: string };

export function minimumCForCubicMajorant(p: number): number | undefined {
  if (!Number.isFinite(p) || p <= 1 || p > 3) return undefined;
  if (p <= 2) return 0.5;
  if (p === 3) return 1;
  return ((3 - p) / 2) * (((p - 1) / (3 - p)) ** ((p - 1) / 2));
}

/** Exact certificates for the two declared C/x^p families. */
export function tailInequalityHolds(
  target: ComparisonTarget,
  C: number,
  p: number,
  direction: ComparisonDirection,
): TailInequalityVerdict {
  if (!Number.isFinite(C) || !Number.isFinite(p) || C <= 0) {
    return { kind: "fails", reason: "C and p must be finite, with C positive." };
  }
  if (target === "cubic-convergent-majorant") {
    if (direction !== "target-lte-comparator") {
      return { kind: "fails", reason: "Convergence needs a majorant above the target." };
    }
    const minimum = minimumCForCubicMajorant(p);
    if (minimum === undefined) {
      return { kind: "fails", reason: "A convergent comparator requires 1 < p <= 3." };
    }
    return C >= minimum
      ? { kind: "holds", certificate: "analytic" }
      : { kind: "fails", reason: "Increase C to cover the whole tail." };
  }
  if (direction !== "comparator-lte-target") {
    return { kind: "fails", reason: "Divergence needs a minorant below the target." };
  }
  return p >= 0.5 && p <= 1 && C <= 1
    ? { kind: "holds", certificate: "analytic" }
    : { kind: "fails", reason: "Requires 1/2 <= p <= 1 and 0 < C <= 1." };
}

/** Sampling has only a one-sided role: a returned witness certainly refutes. */
export function findTailCounterexample(
  smaller: RealFunction,
  larger: RealFunction,
  tailStart: number,
  span = 60,
  samples = 600,
): { readonly x: number; readonly smallerThere: number; readonly largerThere: number } | undefined {
  for (let i = 0; i <= samples; i += 1) {
    const x = tailStart + (span * i) / samples;
    const f = smaller(x);
    const g = larger(x);
    if (Number.isFinite(f) && Number.isFinite(g) && (f < 0 || f > g)) {
      return { x, smallerThere: f, largerThere: g };
    }
  }
  return undefined;
}

export const IMP_EXP: TailFixture = {
  id: "imp-exp", label: "∫₀^∞ e^(−x) dx", integrand: (x) => Math.exp(-x),
  integrandSource: "exp(-x)", a: 0, F: (x) => -Math.exp(-x),
  antiderivativeLimit: { kind: "finite", value: 0 },
  verdict: { kind: "converges", value: 1 },
};
export const IMP_P_ONE: TailFixture = {
  id: "imp-p-one", label: "∫₁^∞ dx/x", integrand: (x) => 1 / x,
  integrandSource: "1/x", a: 1, F: Math.log,
  antiderivativeLimit: { kind: "unbounded" },
  verdict: { kind: "diverges", mode: "unbounded" },
};
export const IMP_P_TWO: TailFixture = {
  id: "imp-p-two", label: "∫₁^∞ dx/x²", integrand: (x) => 1 / (x * x),
  integrandSource: "1/x^2", a: 1, F: (x) => -1 / x,
  antiderivativeLimit: { kind: "finite", value: 0 },
  verdict: { kind: "converges", value: 1 },
};
export const IMP_ARCTAN: TailFixture = {
  id: "imp-arctan", label: "∫₀^∞ dx/(1+x²)",
  integrand: (x) => 1 / (1 + x * x), integrandSource: "1/(1+x^2)",
  a: 0, F: Math.atan, verdict: { kind: "converges", value: Math.PI / 2 },
  antiderivativeLimit: { kind: "finite", value: Math.PI / 2 },
};
export const IMP_SIN: TailFixture = {
  id: "imp-sin", label: "∫₀^∞ sin(x) dx", integrand: Math.sin,
  integrandSource: "sin(x)", a: 0, F: (x) => -Math.cos(x),
  antiderivativeLimit: { kind: "oscillates" },
  verdict: { kind: "diverges", mode: "oscillates" },
};
export const IMP_X_EXP: TailFixture = {
  id: "imp-x-exp", label: "∫₀^∞ x e^(−x) dx",
  integrand: (x) => x * Math.exp(-x), integrandSource: "x*exp(-x)", a: 0,
  F: (x) => -(x + 1) * Math.exp(-x),
  antiderivativeLimit: { kind: "finite", value: 0 },
  verdict: { kind: "converges", value: 1 },
};
export const IMP_GAUSS: TailFixture = {
  id: "imp-gauss", label: "∫₀^∞ e^(−x²) dx",
  integrand: (x) => Math.exp(-(x * x)), integrandSource: "exp(-x^2)", a: 0,
  verdict: { kind: "converges" }, decidedBy: "gauss-vs-exp",
};
export const IMP_SCANDAL: SingularFixture = {
  id: "imp-scandal", label: "∫₀¹ dx/x²", integrand: (x) => 1 / (x * x),
  integrandSource: "1/x^2", s: 0, b: 1, F: (x) => -1 / x,
  verdict: { kind: "diverges", mode: "unbounded" },
};
export const IMP_SQRT_SING: SingularFixture = {
  id: "imp-sqrt-sing", label: "∫₀¹ dx/√x", integrand: (x) => 1 / Math.sqrt(x),
  integrandSource: "1/sqrt(x)", s: 0, b: 1, F: (x) => 2 * Math.sqrt(x),
  verdict: { kind: "converges", value: 2 },
};
export const IMP_RIGHT_SQRT_SING: SingularFixture = {
  id: "imp-right-sqrt-sing", label: "∫₀.₁₉¹ dx/√(1−x)",
  integrand: (x) => 1 / Math.sqrt(1 - x), integrandSource: "1/sqrt(1-x)",
  s: 1, b: 0.19, F: (x) => -2 * Math.sqrt(1 - x),
  verdict: { kind: "converges", value: 1.8 },
};

export const PAIR_GAUSS_EXP = {
  id: "gauss-vs-exp", smaller: (x: number) => Math.exp(-(x * x)),
  larger: (x: number) => Math.exp(-x), tailStart: 1,
  analyticCertificate: {
    kind: "ordered-exponents", domain: "x>=1", fact: "x^2>=x",
    monotonicity: "exp(-t)-decreases",
  },
} as const;

function parsedClosure(id: string, source: string): RealFunction {
  const parsed = tryParseExpression(source);
  if (!parsed.ok) throw new Error(id + ": source does not parse.");
  return (x) => evaluate(parsed.node, { x });
}

function agree(label: string, a: RealFunction, b: RealFunction, lo: number, hi: number): void {
  for (let i = 0; i <= 40; i += 1) {
    const x = lo + ((hi - lo) * i) / 40;
    const delta = Math.abs(a(x) - b(x));
    if (Number.isFinite(delta) && delta > 1e-8 * Math.max(1, Math.abs(b(x)))) {
      throw new Error(label + ": mismatch.");
    }
  }
}

function antiderivativeAgrees(
  label: string,
  F: RealFunction,
  integrand: RealFunction,
  lo: number,
  hi: number,
): void {
  for (let i = 1; i < 40; i += 1) {
    const x = lo + ((hi - lo) * i) / 40;
    const derivative = boundaryAwareDerivative(F, x, [lo, hi], (hi - lo) * 1e-5);
    if (Math.abs(derivative - integrand(x)) > 2e-5 * Math.max(1, Math.abs(integrand(x)))) {
      throw new Error(label + ": declared antiderivative does not differentiate to its integrand.");
    }
  }
}

export function assertTailFixtureVerdictIsOwned(fixture: TailFixture): void {
  if (!fixture.F) {
    if (!fixture.decidedBy) throw new Error(fixture.id + ": verdict has no owner.");
    return;
  }
  if (!fixture.antiderivativeLimit) {
    throw new Error(fixture.id + ": antiderivative has no analytic limit owner.");
  }
  const limit = fixture.antiderivativeLimit;
  if (limit.kind === "finite") {
    const expectedValue = limit.value - fixture.F(fixture.a);
    if (fixture.verdict.kind !== "converges" || fixture.verdict.value === undefined ||
        !Object.is(fixture.verdict.value, expectedValue)) {
      throw new Error(fixture.id + ": declared value disagrees with the analytic F limit.");
    }
    return;
  }
  const expectedMode = limit.kind === "unbounded" ? "unbounded" : "oscillates";
  if (fixture.verdict.kind !== "diverges" || fixture.verdict.mode !== expectedMode) {
    throw new Error(fixture.id + ": declared divergence disagrees with the analytic F limit.");
  }
}

export function assertImproperFixturesAreConsistent(): void {
  const tails = [IMP_EXP, IMP_P_ONE, IMP_P_TWO, IMP_ARCTAN, IMP_SIN, IMP_X_EXP, IMP_GAUSS];
  for (const fixture of tails) {
    agree(fixture.id, parsedClosure(fixture.id, fixture.integrandSource),
      fixture.integrand, fixture.a + 0.01, fixture.a + 20);
    assertTailFixtureVerdictIsOwned(fixture);
    if (fixture.F) {
      antiderivativeAgrees(fixture.id, fixture.F, fixture.integrand,
        fixture.a + 0.01, fixture.a + 20);
    }
  }
  const singulars = [IMP_SCANDAL, IMP_SQRT_SING, IMP_RIGHT_SQRT_SING];
  for (const fixture of singulars) {
    agree(fixture.id, parsedClosure(fixture.id, fixture.integrandSource),
      fixture.integrand, Math.min(fixture.s, fixture.b) + 0.01,
      Math.max(fixture.s, fixture.b) - 0.01);
    if (fixture.F) {
      antiderivativeAgrees(fixture.id, fixture.F, fixture.integrand,
        Math.min(fixture.s, fixture.b) + 0.01,
        Math.max(fixture.s, fixture.b) - 0.01);
    }
    if (fixture.verdict.kind === "converges" && fixture.verdict.value !== undefined) {
      const actual = singularAccumulation(fixture, 1e-8).value;
      if (Math.abs(actual - fixture.verdict.value) > 1e-3) {
        throw new Error(fixture.id + ": declared limit is not corroborated.");
      }
    }
  }
  const certificate = PAIR_GAUSS_EXP.analyticCertificate;
  if (PAIR_GAUSS_EXP.tailStart !== 1 || certificate.kind !== "ordered-exponents" ||
      certificate.domain !== "x>=1" || certificate.fact !== "x^2>=x" ||
      certificate.monotonicity !== "exp(-t)-decreases" ||
      IMP_GAUSS.decidedBy !== PAIR_GAUSS_EXP.id || IMP_GAUSS.verdict.kind !== "converges") {
    throw new Error("gauss-vs-exp: analytic comparison ownership is incomplete.");
  }
}
