/**
 * Pure math for `improper-integrals` (spine L8, `calculus-technique`).
 * No React, Mafs, or Motion Canvas.
 *
 * **The demotion, enforced by shape.** There is no "improper integral" object
 * in this file — only ACCUMULATIONS \(A(R) = \int_a^R f\) (computed from a
 * declared antiderivative, corroborated against `riemannSum`) and declared
 * VERDICTS about whether they settle. A fixture whose verdict is `converges`
 * carries the value its accumulation settles to; a divergent fixture carries
 * the WAY it fails (`unbounded` vs `oscillates` — the lesson grades those as
 * distinct claims). Nothing here evaluates anything "at infinity".
 *
 * **Sampling corroborates, never certifies** (the standing discipline):
 * verdicts are ANALYTICALLY DECLARED, and the guard checks each declaration's
 * numeric shadow — a convergent accumulation approaches its declared value at
 * large R, an unbounded one crosses growing bounds, an oscillating one keeps
 * moving — as corroboration of closed forms the lesson derives, not as proof.
 *
 * **Comparisons carry their hypotheses.** A `ComparisonPair` declares the
 * tail `[c, ∞)`, the inequality `0 ≤ f ≤ g`, and the majorant's convergence
 * data; the guard samples the inequality densely on a long window. The pair
 * is the graded object (produce the comparator, state the direction) — the
 * grader checks the tail inequality, not one blessed witness.
 */

import { riemannSum, type RealFunction } from "./calculus";
import { evaluate, tryParseExpression } from "./expression";

/* ------------------------------------------------------------------ types */

export type DivergenceMode = "unbounded" | "oscillates";

export type ImproperVerdict =
  | { readonly kind: "converges"; readonly value: number }
  | { readonly kind: "diverges"; readonly mode: DivergenceMode };

/**
 * A Type I fixture: `f` on `[a, ∞)`, integrable on every `[a, R]`. The
 * antiderivative, where declared, powers the exact accumulation; a fixture
 * without one (the Gaussian tail) still has an accumulation — computed by
 * `riemannSum`, labelled corroboration — and its verdict rests on a declared
 * `comparator` instead, exactly the lesson's own logic.
 */
export interface TailFixture {
  readonly id: string;
  readonly label: string;
  readonly integrand: RealFunction;
  readonly integrandSource: string;
  readonly a: number;
  /** Exact antiderivative on [a, ∞), where the course states one. */
  readonly F?: RealFunction;
  readonly verdict: ImproperVerdict;
  /**
   * For a fixture whose verdict is NOT reachable by its own antiderivative
   * (none declared): the majorant tail that decides it, as a ComparisonPair id.
   */
  readonly decidedBy?: string;
}

/** A Type II fixture: `f` on `(s, b]` (or `[b, s)`), unbounded near the singular endpoint `s`. */
export interface SingularFixture {
  readonly id: string;
  readonly label: string;
  readonly integrand: RealFunction;
  readonly integrandSource: string;
  /** The singular endpoint. */
  readonly s: number;
  /** The good endpoint. */
  readonly b: number;
  readonly F?: RealFunction;
  readonly verdict: ImproperVerdict;
}

export interface ComparisonPair {
  readonly id: string;
  /** The smaller, undecidable-by-antiderivative integrand (0 ≤ f). */
  readonly smaller: RealFunction;
  readonly smallerSource: string;
  /** The majorant with known convergent tail. */
  readonly larger: RealFunction;
  readonly largerSource: string;
  /** The tail on which 0 ≤ smaller ≤ larger holds (checked by the guard). */
  readonly tailStart: number;
  /** The majorant's tail value ∫_{tailStart}^∞ larger, exact. */
  readonly largerTailValue: number;
}

/* ------------------------------------------------------------ accumulation */

/**
 * The honest object: `A(R) = ∫_a^R f`, exact when `F` is declared, a
 * mid-sampled Riemann corroboration otherwise (labelled so by the return).
 */
export function accumulation(
  fixture: TailFixture,
  R: number,
): { readonly value: number; readonly exact: boolean } {
  if (!(R >= fixture.a)) {
    throw new Error(`accumulation: R=${R} is before ${fixture.id}'s start a=${fixture.a}.`);
  }
  if (R === fixture.a) return { value: 0, exact: true };
  if (fixture.F) return { value: fixture.F(R) - fixture.F(fixture.a), exact: true };
  return { value: riemannSum(fixture.integrand, fixture.a, R, 4000, "mid"), exact: false };
}

/** Type II: `∫_{s+ε}^{b}` (or mirrored), exact via F where declared. */
export function singularAccumulation(
  fixture: SingularFixture,
  epsilon: number,
): { readonly value: number; readonly exact: boolean } {
  if (!(epsilon > 0)) throw new Error(`singularAccumulation: epsilon must be positive, got ${epsilon}.`);
  const from = fixture.s < fixture.b ? fixture.s + epsilon : fixture.s - epsilon;
  const [lo, hi] = from < fixture.b ? [from, fixture.b] : [fixture.b, from];
  if (!(hi > lo)) throw new Error(`singularAccumulation: epsilon=${epsilon} swallows ${fixture.id}'s window.`);
  if (fixture.F) {
    const signed = fixture.F(fixture.b) - fixture.F(from);
    return { value: signed, exact: true };
  }
  return { value: riemannSum(fixture.integrand, lo, hi, 4000, "mid"), exact: false };
}

/* ---------------------------------------------------------- the p-ladder */

/**
 * The calibration family, both edges, closed-form: exactly insight.md §7(e).
 * `edge: "infinity"` is ∫_1^∞ x^{-p}; `edge: "zero"` is ∫_0^1 x^{-p}.
 */
export function pLadderVerdict(p: number, edge: "infinity" | "zero"): ImproperVerdict {
  if (edge === "infinity") {
    return p > 1
      ? { kind: "converges", value: 1 / (p - 1) }
      : { kind: "diverges", mode: "unbounded" };
  }
  return p < 1
    ? { kind: "converges", value: 1 / (1 - p) }
    : { kind: "diverges", mode: "unbounded" };
}

/**
 * The octave rent: `∫_{2^k}^{2^{k+1}} x^{-p} dx`, closed form. For p = 1 it
 * is ln 2 for EVERY k (equal rent forever — the divergence mechanism); for
 * p > 1 consecutive rents have ratio 2^{1-p} < 1 (geometric, trapped).
 */
export function octaveContribution(p: number, k: number): number {
  const lo = Math.pow(2, k);
  const hi = Math.pow(2, k + 1);
  if (p === 1) return Math.log(2);
  return (Math.pow(hi, 1 - p) - Math.pow(lo, 1 - p)) / (1 - p);
}

/** Consecutive-octave ratio, closed form — the geometric mechanism made explicit. */
export function octaveRatio(p: number): number {
  return Math.pow(2, 1 - p);
}

/* ------------------------------------------------------------- comparison */

export type TailInequalityVerdict =
  | { readonly kind: "holds"; readonly checkedAt: number }
  | { readonly kind: "fails"; readonly witnessX: number; readonly smallerThere: number; readonly largerThere: number }
  | { readonly kind: "undecided"; readonly reason: string };

/**
 * Does `0 ≤ smaller ≤ larger` hold on `[tailStart, tailStart + span]`, sampled
 * densely? An OBSERVATION corroborating a declared inequality (the lesson
 * proves each shipped pair's inequality symbolically; the learner's produced
 * comparator is graded by this check plus the majorant's known verdict). A
 * `fails` verdict carries its witness — that half is certain.
 */
export function tailInequalityHolds(
  smaller: RealFunction,
  larger: RealFunction,
  tailStart: number,
  span = 60,
  samples = 600,
): TailInequalityVerdict {
  let checked = 0;
  for (let i = 0; i <= samples; i += 1) {
    const x = tailStart + (span * i) / samples;
    const f = smaller(x);
    const g = larger(x);
    if (!Number.isFinite(f) || !Number.isFinite(g)) continue;
    checked += 1;
    if (f < -1e-12) {
      return { kind: "fails", witnessX: x, smallerThere: f, largerThere: g };
    }
    if (f > g + 1e-12) {
      return { kind: "fails", witnessX: x, smallerThere: f, largerThere: g };
    }
  }
  if (checked < samples / 2) {
    return { kind: "undecided", reason: `only ${checked} of ${samples + 1} sample points were defined` };
  }
  return { kind: "holds", checkedAt: checked };
}

/* --------------------------------------------------------------- fixtures */

/** ∫_0^∞ e^{-x} dx = 1 — the first honest settle, watched live. */
export const IMP_EXP: TailFixture = {
  id: "imp-exp",
  label: "∫₀^∞ e^(−x) dx",
  integrand: (x) => Math.exp(-x),
  integrandSource: "exp(-x)",
  a: 0,
  F: (x) => -Math.exp(-x),
  verdict: { kind: "converges", value: 1 },
};

/** The confrontation's creeper: ∫_1^∞ dx/x diverges, ever more slowly. */
export const IMP_P_ONE: TailFixture = {
  id: "imp-p-one",
  label: "∫₁^∞ dx/x",
  integrand: (x) => 1 / x,
  integrandSource: "1/x",
  a: 1,
  F: Math.log,
  verdict: { kind: "diverges", mode: "unbounded" },
};

/** The confrontation's settler: ∫_1^∞ dx/x² = 1. */
export const IMP_P_TWO: TailFixture = {
  id: "imp-p-two",
  label: "∫₁^∞ dx/x²",
  integrand: (x) => 1 / (x * x),
  integrandSource: "1/x^2",
  a: 1,
  F: (x) => -1 / x,
  verdict: { kind: "converges", value: 1 },
};

/** The shorthand done right: ∫_0^∞ dx/(1+x²) = π/2 — arctan exists, ruler and ritual agree. */
export const IMP_ARCTAN: TailFixture = {
  id: "imp-arctan",
  label: "∫₀^∞ dx/(1+x²)",
  integrand: (x) => 1 / (1 + x * x),
  integrandSource: "1/(1 + x^2)",
  a: 0,
  F: Math.atan,
  verdict: { kind: "converges", value: Math.PI / 2 },
};

/** Divergence without infinity: A(R) = 1 − cos R oscillates in [0, 2] forever. */
export const IMP_SIN: TailFixture = {
  id: "imp-sin",
  label: "∫₀^∞ sin(x) dx",
  integrand: Math.sin,
  integrandSource: "sin(x)",
  a: 0,
  F: (x) => -Math.cos(x),
  verdict: { kind: "diverges", mode: "oscillates" },
};

/** The boundary term at infinity: ∫_0^∞ x·e^{-x} dx = 1 via parts on [0, R]. */
export const IMP_X_EXP: TailFixture = {
  id: "imp-x-exp",
  label: "∫₀^∞ x·e^(−x) dx",
  integrand: (x) => x * Math.exp(-x),
  integrandSource: "x exp(-x)",
  a: 0,
  F: (x) => -(x + 1) * Math.exp(-x),
  verdict: { kind: "converges", value: 1 },
};

/**
 * The redemption: no antiderivative is declared BECAUSE none is elementary
 * (L7's cited theorem) — the verdict rests on the comparison pair below,
 * which is the lesson's own argument shape. `accumulation` for this fixture
 * is Riemann corroboration, labelled inexact.
 */
export const IMP_GAUSS: TailFixture = {
  id: "imp-gauss",
  label: "∫₀^∞ e^(−x²) dx",
  integrand: (x) => Math.exp(-(x * x)),
  integrandSource: "exp(-x^2)",
  a: 0,
  verdict: { kind: "converges", value: Math.sqrt(Math.PI) / 2 },
  decidedBy: "gauss-vs-exp",
};

/** The scandal: x^{-2} with a singularity at 0 — each half diverges. */
export const IMP_SCANDAL: SingularFixture = {
  id: "imp-scandal",
  label: "∫₀¹ dx/x² (the scandal's right half)",
  integrand: (x) => 1 / (x * x),
  integrandSource: "1/x^2",
  s: 0,
  b: 1,
  F: (x) => -1 / x,
  verdict: { kind: "diverges", mode: "unbounded" },
};

/** Type II convergent: ∫_0^1 dx/√x = 2 — a singularity survived. */
export const IMP_SQRT_SING: SingularFixture = {
  id: "imp-sqrt-sing",
  label: "∫₀¹ dx/√x",
  integrand: (x) => 1 / Math.sqrt(x),
  integrandSource: "1/sqrt(x)",
  s: 0,
  b: 1,
  F: (x) => 2 * Math.sqrt(x),
  verdict: { kind: "converges", value: 2 },
};

/** e^{-x²} ≤ e^{-x} on [1, ∞); ∫_1^∞ e^{-x} = e^{-1}. The redemption's engine. */
export const PAIR_GAUSS_EXP: ComparisonPair = {
  id: "gauss-vs-exp",
  smaller: (x) => Math.exp(-(x * x)),
  smallerSource: "exp(-x^2)",
  larger: (x) => Math.exp(-x),
  largerSource: "exp(-x)",
  tailStart: 1,
  largerTailValue: Math.exp(-1),
};

/** 1/(x³+x) ≤ 1/x³ on [1, ∞); ∫_1^∞ x^{-3} = 1/2. A fresh graded pair. */
export const PAIR_CUBIC: ComparisonPair = {
  id: "cubic-vs-p3",
  smaller: (x) => 1 / (x * x * x + x),
  smallerSource: "1/(x^3 + x)",
  larger: (x) => 1 / (x * x * x),
  largerSource: "1/x^3",
  tailStart: 1,
  largerTailValue: 1 / 2,
};

export const TAIL_FIXTURES: readonly TailFixture[] = [
  IMP_EXP,
  IMP_P_ONE,
  IMP_P_TWO,
  IMP_ARCTAN,
  IMP_SIN,
  IMP_X_EXP,
  IMP_GAUSS,
];

export const SINGULAR_FIXTURES: readonly SingularFixture[] = [IMP_SCANDAL, IMP_SQRT_SING];

export const COMPARISON_PAIRS: readonly ComparisonPair[] = [PAIR_GAUSS_EXP, PAIR_CUBIC];

/* ------------------------------------------------------------------ guard */

const numericDerivativeLocal = (f: RealFunction, x: number, h = 1e-5): number =>
  (f(x + h) - f(x - h)) / (2 * h);

function parsedClosure(id: string, source: string): RealFunction {
  const outcome = tryParseExpression(source);
  if (!outcome.ok) throw new Error(`${id}: source "${source}" does not parse: ${outcome.message}`);
  return (x) => evaluate(outcome.node, { x });
}

/**
 * Load-time guard. For every fixture: the declared F really differentiates
 * to the integrand on the working window; the source string matches its
 * closure; and the declared verdict's numeric shadow is corroborated —
 * a convergent accumulation sits near its declared value at large R, an
 * unbounded one crosses growing bounds, an oscillating one is still moving.
 * Corroboration of derived closed forms, never proof.
 */
export function assertImproperFixturesAreConsistent(): void {
  for (const fixture of TAIL_FIXTURES) {
    denseAgree(
      `${fixture.id}: integrandSource vs closure`,
      parsedClosure(fixture.id, fixture.integrandSource),
      fixture.integrand,
      fixture.a + 0.01,
      fixture.a + 20,
    );
    if (fixture.F) {
      denseAgree(
        `${fixture.id}: F' vs integrand`,
        (x) => numericDerivativeLocal(fixture.F!, x),
        fixture.integrand,
        fixture.a + 0.01,
        fixture.a + 20,
        1e-4,
      );
    }
    const verdict = fixture.verdict;
    if (verdict.kind === "converges") {
      // A convergent accumulation must be APPROACHING its declared value —
      // checked far out where the closed form is cheap (exact fixtures), or
      // nearby with a loose band where only Riemann corroboration exists
      // (the first guard draft checked A(a+60) against a tight band and
      // failed on 1/x², whose tail closes like 1/R — slower than the band).
      const probe = fixture.F ? fixture.a + 1e6 : fixture.a + 60;
      const far = accumulation(fixture, probe);
      const tol = far.exact ? 1e-3 : 2e-2;
      if (Math.abs(far.value - verdict.value) > tol * Math.max(1, Math.abs(verdict.value))) {
        throw new Error(
          `${fixture.id}: declared limit ${verdict.value} not corroborated (A(a+${probe - fixture.a}) = ${far.value}).`,
        );
      }
      // And it must be getting CLOSER, not merely near: |A(far) - L| <= |A(near) - L|.
      const near = accumulation(fixture, fixture.a + 5);
      if (Math.abs(far.value - verdict.value) > Math.abs(near.value - verdict.value) + 1e-9) {
        throw new Error(`${fixture.id}: accumulation is not approaching its declared limit.`);
      }
    } else if (verdict.mode === "unbounded") {
      const near = accumulation(fixture, fixture.a + 10).value;
      const far = accumulation(fixture, fixture.a + 10000).value;
      if (!(far > near + 1)) {
        throw new Error(`${fixture.id}: declared unbounded but A barely grew (${near} → ${far}).`);
      }
    } else {
      // Oscillates: still moving at large R — sample a window's spread.
      let lo = Infinity;
      let hi = -Infinity;
      for (let i = 0; i < 20; i += 1) {
        const v = accumulation(fixture, fixture.a + 1000 + i).value;
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
      if (hi - lo < 0.5) {
        throw new Error(`${fixture.id}: declared oscillating but A looks settled (spread ${hi - lo}).`);
      }
    }
    if (!fixture.F && !fixture.decidedBy) {
      throw new Error(`${fixture.id}: no antiderivative AND no deciding comparison — the verdict has no owner.`);
    }
    if (fixture.decidedBy && !COMPARISON_PAIRS.some((p) => p.id === fixture.decidedBy)) {
      throw new Error(`${fixture.id}: decidedBy "${fixture.decidedBy}" names no shipped comparison pair.`);
    }
  }

  for (const fixture of SINGULAR_FIXTURES) {
    denseAgree(
      `${fixture.id}: integrandSource vs closure`,
      parsedClosure(fixture.id, fixture.integrandSource),
      fixture.integrand,
      Math.min(fixture.s, fixture.b) + 0.01,
      Math.max(fixture.s, fixture.b) - 0.001,
    );
    if (fixture.verdict.kind === "converges") {
      const near = singularAccumulation(fixture, 1e-7);
      if (Math.abs(near.value - fixture.verdict.value) > 1e-2 * Math.max(1, fixture.verdict.value)) {
        throw new Error(`${fixture.id}: declared limit not corroborated (${near.value}).`);
      }
    } else {
      const a1 = singularAccumulation(fixture, 1e-2).value;
      const a2 = singularAccumulation(fixture, 1e-6).value;
      if (!(a2 > a1 + 1)) {
        throw new Error(`${fixture.id}: declared unbounded near the singularity but barely grew.`);
      }
    }
  }

  for (const pair of COMPARISON_PAIRS) {
    denseAgree(`${pair.id}: smallerSource vs closure`, parsedClosure(pair.id, pair.smallerSource), pair.smaller, pair.tailStart, pair.tailStart + 40);
    denseAgree(`${pair.id}: largerSource vs closure`, parsedClosure(pair.id, pair.largerSource), pair.larger, pair.tailStart, pair.tailStart + 40);
    const holds = tailInequalityHolds(pair.smaller, pair.larger, pair.tailStart);
    if (holds.kind !== "holds") {
      throw new Error(`${pair.id}: declared tail inequality is not corroborated (${JSON.stringify(holds)}).`);
    }
  }

  // The p-ladder's closed forms agree with direct accumulation on both edges.
  for (const p of [0.5, 1, 1.5, 2, 3]) {
    const atInfinity = pLadderVerdict(p, "infinity");
    if (atInfinity.kind === "converges") {
      const direct = riemannSum((x) => Math.pow(x, -p), 1, 2000, 200000, "mid");
      if (Math.abs(direct - atInfinity.value) > 5e-2 * Math.max(1, atInfinity.value)) {
        throw new Error(`p-ladder(∞, p=${p}): closed form ${atInfinity.value} vs direct ${direct}.`);
      }
    }
    // Octave rents: closed form vs direct, and the geometric ratio.
    const rent0 = riemannSum((x) => Math.pow(x, -p), 1, 2, 4000, "mid");
    if (Math.abs(rent0 - octaveContribution(p, 0)) > 1e-3) {
      throw new Error(`octaveContribution(p=${p}, k=0) disagrees with direct integration.`);
    }
    if (p !== 1) {
      const ratio = octaveContribution(p, 5) / octaveContribution(p, 4);
      if (Math.abs(ratio - octaveRatio(p)) > 1e-9) {
        throw new Error(`octaveRatio(p=${p}) is not the consecutive-rent ratio.`);
      }
    }
  }
}

function denseAgree(
  label: string,
  actual: RealFunction,
  expected: RealFunction,
  lo: number,
  hi: number,
  tolerance = 1e-9,
): void {
  for (let i = 0; i <= 40; i += 1) {
    const x = lo + ((hi - lo) * i) / 40;
    const a = actual(x);
    const e = expected(x);
    if (!Number.isFinite(a) || !Number.isFinite(e)) continue;
    if (Math.abs(a - e) > tolerance * Math.max(1, Math.abs(e))) {
      throw new Error(`${label}: disagreement at x = ${x} (${a} vs ${e}).`);
    }
  }
}
