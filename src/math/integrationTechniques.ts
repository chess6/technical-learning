/**
 * Pure math for `substitution-parts` (spine L7, `calculus-technique`).
 * No React, Mafs, or Motion Canvas.
 *
 * **The layer's one job: nothing displayed or graded is typed twice.** Every
 * fixture's integrand is COMPUTED from its declared structure (`f(g(x))·g'(x)`
 * for a substitution fixture, `u(x)·v'(x)` for parts) rather than re-typed
 * beside it, and every display/grading STRING is parsed by
 * `expression.ts` and checked against the computed closure by dense sampling
 * in `assertIntegrationFixturesAreConsistent` — so the string a learner sees
 * and the function the math runs on provably agree. (The L6 review history is
 * the reason: hand-typed twins drifted twice before that lesson shipped.)
 *
 * **Riemann sums are corroboration, never certification** — the discipline
 * `calculus.ts` already states for `riemannSum` (which never consults an
 * antiderivative; the two routes to an integral's value must stay independent
 * or L4's corroboration is circular). The parts identity and the ledger sums
 * below are checked numerically as corroboration of derivations the LESSON
 * proves from the product rule + FTC; the proof is the lesson's, the numbers
 * are the guard's.
 *
 * **The grader is the lesson's own discipline.** `differentiatesToTarget`
 * grades a produced antiderivative by symbolically differentiating it and
 * requiring the resulting expression to reduce exactly to the integrand —
 * insight.md §7(d): finding is search, checking is calculation. Numerical
 * differentiation is used only to produce a useful counterexample witness;
 * finite samples never authorize a pass. Answers containing the conventional
 * arbitrary constant `C` pass because dC/dx = 0, which is the mathematical
 * content of "+C", not a grading accident.
 */

import { derivative, simplify } from "mathjs";
import { numericDerivative, riemannSum, type RealFunction } from "./calculus";
import {
  evaluate,
  freeVariables,
  tryParseExpression,
  type ExprNode,
} from "./expression";

/* ------------------------------------------------------------------ types */

/**
 * An integrand with a declared elementary antiderivative — the generic shape
 * every graded "find an antiderivative" item consumes. `integrandSource` /
 * `antiderivativeSource` are friendly-infix strings (the `expression.ts`
 * grammar, NOT LaTeX): they are what exercises display and what graders parse,
 * and the consistency guard pins each to its closure.
 */
export interface AntiderivativePair {
  readonly id: string;
  readonly label: string;
  readonly integrand: RealFunction;
  readonly integrandSource: string;
  readonly antiderivative: RealFunction;
  readonly antiderivativeSource: string;
  /** The interval the antiderivative claim is made (and graded) on. */
  readonly domain: readonly [number, number];
}

/**
 * A chain-shape integrand with its recognition made explicit: the fixture
 * declares `f`, `F` (an antiderivative of `f`), `g`, and `g'`, and the
 * integrand is DERIVED as `f(g(x))·g'(x)` — the fixture cannot claim a
 * chain shape it does not have.
 */
export interface SubstitutionFixture {
  readonly id: string;
  readonly label: string;
  /** Outer function and its declared antiderivative (checked by the guard). */
  readonly f: RealFunction;
  readonly F: RealFunction;
  /** Inner function and its declared derivative (checked by the guard). */
  readonly g: RealFunction;
  readonly gPrime: RealFunction;
  /**
   * The x-window. `g` must be MONOTONE here — declared, then corroborated by
   * sampling in the guard — because the explorer's strip picture tiles
   * u-space with the images `[g(x_i), g(x_{i+1})]`, and only monotone `g`
   * makes those tiles non-overlapping. The substitution IDENTITY (insight.md
   * §7(b)) needs no monotonicity; the PICTURE does, so the picture's fixtures
   * carry the restriction rather than the theorem carrying a false caveat.
   */
  readonly domain: readonly [number, number];
  readonly integrandSource: string;
  /** `F(g(x))` as a source string, for grading feedback. */
  readonly antiderivativeSource: string;
  /** Display forms for the ledger: e.g. "u = x²", "du = 2x dx". */
  readonly uLabel: string;
  readonly duLabel: string;
}

/** The computed chain-shape integrand — the only definition of it that exists. */
export function substitutionIntegrand(fix: SubstitutionFixture): RealFunction {
  return (x) => fix.f(fix.g(x)) * fix.gPrime(x);
}

/**
 * A product-shape integrand `u(x)·v'(x)` with the trade's ingredients
 * declared. As above, the integrand and the traded integrand are computed
 * from the declared parts, never re-typed.
 */
export interface PartsFixture {
  readonly id: string;
  readonly label: string;
  readonly u: RealFunction;
  readonly uPrime: RealFunction;
  readonly v: RealFunction;
  readonly vPrime: RealFunction;
  readonly domain: readonly [number, number];
  readonly integrandSource: string;
  readonly antiderivativeSource: string;
  /** Which factor dies (or simplifies) under differentiation — the taught judgment. */
  readonly uChoiceRationale: string;
}

export function partsIntegrand(fix: PartsFixture): RealFunction {
  return (x) => fix.u(x) * fix.vPrime(x);
}

/** The integrand the trade leaves behind: `u'(x)·v(x)`. */
export function partsTradedIntegrand(fix: PartsFixture): RealFunction {
  return (x) => fix.uPrime(x) * fix.v(x);
}

/** `[uv]_a^b` — the FTC's boundary evaluation of the accumulated `(uv)'`. */
export function partsBoundaryTerm(fix: PartsFixture): number {
  const [a, b] = fix.domain;
  return fix.u(b) * fix.v(b) - fix.u(a) * fix.v(a);
}

/**
 * The honest failure case: an integrand whose antiderivative EXISTS (it is
 * continuous, so L4's accumulation function is one) but is provably not
 * elementary. There is deliberately no `antiderivativeSource` field to fill —
 * the type's shape is the honesty.
 */
export interface NonElementaryCase {
  readonly id: string;
  readonly label: string;
  readonly integrand: RealFunction;
  readonly integrandSource: string;
  readonly domain: readonly [number, number];
  /** Attribution for the non-elementarity claim — cited, never proved here. */
  readonly citation: string;
}

/* --------------------------------------------------- the ledger's picture */

export interface StripPair {
  /** Left edge and width of the x-strip. */
  readonly x: number;
  readonly xWidth: number;
  /** Left-sample height of the x-integrand `f(g(x))·g'(x)`. */
  readonly xHeight: number;
  /** Image strip in u: left edge `g(x)`, EXACT width `g(x+w) − g(x)`. */
  readonly u: number;
  readonly uWidth: number;
  /** Left-sample height of `f` at `u = g(x)`. */
  readonly uHeight: number;
  readonly xArea: number;
  readonly uArea: number;
}

/**
 * Strip `i` of `n` in the substitution ledger's two panels. The u-strip's
 * width is the EXACT image width `g(x_{i+1}) − g(x_i)` (so, for monotone `g`,
 * the u-strips tile `[g(a), g(b)]` with no gaps or overlaps), NOT the
 * first-order `g'(x)·w` — the picture must be a real partition of u-space,
 * with `du = g'(x)dx` appearing as the strips' width RATIO tending to `g'`,
 * which is the honest sense of the ledger entry.
 */
export function stripCorrespondence(fix: SubstitutionFixture, i: number, n: number): StripPair {
  if (!Number.isInteger(n) || n <= 0) throw new Error(`stripCorrespondence: n must be a positive integer, got ${n}.`);
  if (!Number.isInteger(i) || i < 0 || i >= n) throw new Error(`stripCorrespondence: strip ${i} of ${n} does not exist.`);
  const [a, b] = fix.domain;
  const w = (b - a) / n;
  const x = a + i * w;
  const xNext = a + (i + 1) * w;
  const u = fix.g(x);
  const uNext = fix.g(xNext);
  const xHeight = fix.f(fix.g(x)) * fix.gPrime(x);
  const uHeight = fix.f(u);
  return {
    x,
    xWidth: w,
    xHeight,
    u,
    uWidth: uNext - u,
    uHeight,
    xArea: xHeight * w,
    uArea: uHeight * (uNext - u),
  };
}

export interface LedgerSums {
  /** Left Riemann sum of `f(g(x))g'(x)` over the x-window. */
  readonly xSum: number;
  /** The corresponding sum over the image strips: `Σ f(g(x_i))·(g(x_{i+1})−g(x_i))`. */
  readonly uSum: number;
  /** `F(g(b)) − F(g(a))` — the value both sums converge to (insight.md §7(b)). */
  readonly exact: number;
}

/** The two panels' totals plus the proven common limit. Corroboration for the explorer. */
export function ledgerSums(fix: SubstitutionFixture, n: number): LedgerSums {
  if (!Number.isInteger(n) || n <= 0) throw new Error(`ledgerSums: n must be a positive integer, got ${n}.`);
  let xSum = 0;
  let uSum = 0;
  for (let i = 0; i < n; i += 1) {
    const strip = stripCorrespondence(fix, i, n);
    xSum += strip.xArea;
    uSum += strip.uArea;
  }
  const [a, b] = fix.domain;
  return { xSum, uSum, exact: fix.F(fix.g(b)) - fix.F(fix.g(a)) };
}

/* -------------------------------------------------------------- the grader */

export type AntiderivativeVerdict =
  | { readonly kind: "antiderivative"; readonly comparedAt: number }
  | {
      readonly kind: "not-antiderivative";
      readonly comparedAt: number;
      /** A point where the derivative of the candidate visibly disagrees with the integrand. */
      readonly witnessX: number;
      readonly derivativeThere: number;
      readonly integrandThere: number;
    }
  | { readonly kind: "undecided"; readonly comparedAt: number; readonly reason: string };

/** Deterministic interior sample points of `[lo, hi]`, margin kept for central differences. */
function sampleInterior(lo: number, hi: number, count: number, margin: number): number[] {
  const points: number[] = [];
  const innerLo = lo + margin;
  const innerHi = hi - margin;
  let state = 48271 >>> 0;
  for (let i = 0; i < count; i += 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    points.push(innerLo + (innerHi - innerLo) * (state / 0x100000000));
  }
  return points;
}

const DIFF_H = 1e-5;

/** Convert the learner grammar's AST to the equivalent mathjs expression. */
function toSymbolicSource(node: ExprNode): string {
  switch (node.kind) {
    case "number":
      return String(node.value);
    case "identifier":
      return node.name;
    case "unary":
      return `(-(${toSymbolicSource(node.operand)}))`;
    case "call": {
      // mathjs calls the natural logarithm `log`; the learner language calls
      // it `ln` and reserves `log` for base 10.
      const name = node.name === "ln" ? "log" : node.name === "log" ? "log10" : node.name;
      return `${name}(${toSymbolicSource(node.arg)})`;
    }
    case "binary": {
      // Normalize the learner spelling e^x to exp(x); mathjs differentiates
      // both but does not reduce e^x - exp(x) to zero afterwards.
      if (
        node.op === "^" &&
        node.left.kind === "identifier" &&
        node.left.name === "e"
      ) {
        return `exp(${toSymbolicSource(node.right)})`;
      }
      return `(${toSymbolicSource(node.left)}) ${node.op} (${toSymbolicSource(node.right)})`;
    }
  }
}

/**
 * Distribution is deliberately bounded to ordinary field algebra. The default
 * simplifier leaves forms such as `(2x + 1)/2 - 1/2 - x` unreduced, which
 * would reject a standard integration-by-parts answer. These rules expose the
 * cancellation; they do not introduce sampled or approximate identities.
 */
const EXACT_ALGEBRA_RULES = [
  { l: "(n1 + n2) / n3", r: "n1 / n3 + n2 / n3", repeat: true },
  { l: "n1 * (n2 + n3)", r: "n1 * n2 + n1 * n3", repeat: true },
  { l: "(n1 + n2) * n3", r: "n1 * n3 + n2 * n3", repeat: true },
] as const;

function derivativeIsExactlyIntegrand(
  candidate: ExprNode,
  integrand: ExprNode,
  variable: string,
): boolean {
  try {
    const candidateDerivative = derivative(toSymbolicSource(candidate), variable);
    const difference = `(${candidateDerivative.toString()}) - (${toSymbolicSource(integrand)})`;
    const distributed = simplify(difference, [...EXACT_ALGEBRA_RULES]);
    return simplify(distributed).toString() === "0";
  } catch {
    // Unsupported symbolic forms fail closed. The caller reports `undecided`,
    // never a pass, after attempting to find a concrete numeric witness.
    return false;
  }
}

/**
 * Is `candidateSource` an antiderivative of `integrandSource` on `domain`?
 * Decided by the lesson's own verification discipline (insight.md §7(d)):
 * symbolically differentiate the candidate and require exact reduction to the
 * integrand. Deterministic interior samples are diagnostic only: they can
 * provide a visible counterexample, but agreement on a finite grid never
 * authorizes a pass.
 *
 * Scoping the samples to the item's interval is the honest reading, not a
 * shortcut: the graded claim is "an antiderivative on this interval", and a
 * candidate that fails elsewhere but works here has answered the question
 * asked. Literal `+ C` is supported as the conventional arbitrary constant;
 * differentiation kills it.
 *
 * `undecided` is a real third verdict (unparseable candidate, or too few
 * points where both sides evaluate finitely) and MUST never be treated as a
 * pass by any caller.
 */
export function differentiatesToTarget(
  candidateSource: string,
  integrandSource: string,
  options: {
    readonly domain: readonly [number, number];
    readonly variable?: string;
    readonly samples?: number;
    readonly tolerance?: number;
  },
): AntiderivativeVerdict {
  const variable = options.variable ?? "x";
  const samples = options.samples ?? 40;
  const tolerance = options.tolerance ?? 1e-4;
  const [lo, hi] = options.domain;
  if (!(hi > lo)) throw new Error(`differentiatesToTarget: empty domain [${lo}, ${hi}].`);

  const candidate = tryParseExpression(candidateSource);
  if (!candidate.ok) {
    return { kind: "undecided", comparedAt: 0, reason: candidate.message };
  }
  const integrand = tryParseExpression(integrandSource);
  if (!integrand.ok) {
    // An authored integrand that does not parse is an authoring bug, not a learner verdict.
    throw new Error(`differentiatesToTarget: integrand "${integrandSource}" does not parse: ${integrand.message}`);
  }

  const candidateVariables = freeVariables(candidate.node);
  const strayCandidateVariables = candidateVariables.filter(
    (name) => name !== variable && name !== "C",
  );
  if (strayCandidateVariables.length > 0) {
    return {
      kind: "undecided",
      comparedAt: 0,
      reason: `uses variable(s) other than ${variable} or the arbitrary constant C: ${strayCandidateVariables.join(", ")}`,
    };
  }
  const strayIntegrandVariables = freeVariables(integrand.node).filter(
    (name) => name !== variable,
  );
  if (strayIntegrandVariables.length > 0) {
    throw new Error(
      `differentiatesToTarget: authored integrand uses variable(s) other than ${variable}: ${strayIntegrandVariables.join(", ")}`,
    );
  }

  if (derivativeIsExactlyIntegrand(candidate.node, integrand.node, variable)) {
    return { kind: "antiderivative", comparedAt: 0 };
  }

  const evalAt = (node: ExprNode, x: number): number => evaluate(node, { [variable]: x });
  const candidateF: RealFunction = (x) => evaluate(candidate.node, { [variable]: x, C: 0 });

  let compared = 0;
  for (const x of sampleInterior(lo, hi, samples, 4 * DIFF_H)) {
    const target = evalAt(integrand.node, x);
    const derivative = numericDerivative(candidateF, x, DIFF_H);
    if (!Number.isFinite(target) || !Number.isFinite(derivative)) continue;
    compared += 1;
    const scale = Math.max(1, Math.abs(target));
    if (Math.abs(derivative - target) > tolerance * scale) {
      return {
        kind: "not-antiderivative",
        comparedAt: compared,
        witnessX: x,
        derivativeThere: derivative,
        integrandThere: target,
      };
    }
  }
  if (compared < 8) {
    return {
      kind: "undecided",
      comparedAt: compared,
      reason: `only ${compared} sample point(s) had both the candidate's derivative and the integrand defined`,
    };
  }
  return {
    kind: "undecided",
    comparedAt: compared,
    reason: "symbolic differentiation did not establish exact equality to the integrand",
  };
}

/* --------------------------------------------------------------- fixtures */

/**
 * The witnessed manufacture (insight.md §12): d/dx sin(x²) = 2x·cos(x²),
 * run forward on screen before the integral is asked. Window kept to x ≥ 0
 * so g(x) = x² is monotone — the ledger picture's requirement, not the
 * identity's.
 */
export const SUB_MAIN_COS: SubstitutionFixture = {
  id: "sub-main-cos",
  label: "∫ 2x·cos(x²) dx",
  f: Math.cos,
  F: Math.sin,
  g: (x) => x * x,
  gPrime: (x) => 2 * x,
  domain: [0.2, 1.8],
  integrandSource: "2x cos(x^2)",
  antiderivativeSource: "sin(x^2)",
  uLabel: "u = x²",
  duLabel: "du = 2x dx",
};

/**
 * The constant-adjustment drill: ∫ x·e^{x²} dx. The chain-rule factor is 2x
 * but the integrand offers only x, so the ledger carries the honest ½.
 * Declared with f(u) = e^u/2 so the derived integrand is exactly x·e^{x²}.
 */
export const SUB_HALF_EXP: SubstitutionFixture = {
  id: "sub-half-exp",
  label: "∫ x·e^(x²) dx",
  f: (u) => Math.exp(u) / 2,
  F: (u) => Math.exp(u) / 2,
  g: (x) => x * x,
  gPrime: (x) => 2 * x,
  domain: [0.1, 1.2],
  integrandSource: "x exp(x^2)",
  antiderivativeSource: "exp(x^2)/2",
  uLabel: "u = x²",
  duLabel: "du = 2x dx  (so x dx = du/2)",
};

/** The simplest ledger — a linear inner function: ∫ cos(3x) dx = sin(3x)/3. */
export const SUB_LINEAR_INNER: SubstitutionFixture = {
  id: "sub-linear-inner",
  label: "∫ cos(3x) dx",
  f: (u) => Math.cos(u) / 3,
  F: (u) => Math.sin(u) / 3,
  g: (x) => 3 * x,
  gPrime: () => 3,
  domain: [0, 2],
  integrandSource: "cos(3x)",
  antiderivativeSource: "sin(3x)/3",
  uLabel: "u = 3x",
  duLabel: "du = 3 dx  (so dx = du/3)",
};

/** The canonical trade: ∫ x·eˣ dx — u = x dies under differentiation. */
export const PARTS_X_EXP: PartsFixture = {
  id: "parts-x-exp",
  label: "∫ x·eˣ dx",
  u: (x) => x,
  uPrime: () => 1,
  v: Math.exp,
  vPrime: Math.exp,
  domain: [0, 2],
  integrandSource: "x exp(x)",
  antiderivativeSource: "(x - 1) exp(x)",
  uChoiceRationale: "x dies under differentiation (x → 1); eˣ merely survives (eˣ → eˣ).",
};

/**
 * The transfer case: ∫ ln(x) dx, where the product shape is hidden — the
 * second factor is the invisible v' = 1. u = ln x simplifies to 1/x; v = x.
 */
export const PARTS_LN: PartsFixture = {
  id: "parts-ln",
  label: "∫ ln(x) dx",
  u: Math.log,
  uPrime: (x) => 1 / x,
  v: (x) => x,
  vPrime: () => 1,
  domain: [0.5, 3],
  integrandSource: "ln(x)",
  antiderivativeSource: "x ln(x) - x",
  uChoiceRationale: "ln(x) simplifies under differentiation (ln x → 1/x); the unseen v' = 1 integrates to x.",
};

/** A fresh trade for assessment: ∫ x·cos(x) dx = x·sin(x) + cos(x). */
export const PARTS_X_COS: PartsFixture = {
  id: "parts-x-cos",
  label: "∫ x·cos(x) dx",
  u: (x) => x,
  uPrime: () => 1,
  v: Math.sin,
  vPrime: Math.cos,
  domain: [0, 3],
  integrandSource: "x cos(x)",
  antiderivativeSource: "x sin(x) + cos(x)",
  uChoiceRationale: "x dies under differentiation; cos(x) only rotates through sines and cosines.",
};

/** The honest failure (insight.md §7(e)). */
export const GAUSS_NON_ELEMENTARY: NonElementaryCase = {
  id: "gauss-non-elementary",
  label: "∫ e^(−x²) dx",
  integrand: (x) => Math.exp(-(x * x)),
  integrandSource: "exp(-x^2)",
  domain: [-2, 2],
  citation:
    "Liouville (1835): no elementary function has derivative e^(−x²). The antiderivative EXISTS (the integrand is continuous — L4's accumulation function is one); it is not elementary. Cited, not proved — the proof is far beyond this course.",
};

export const SUBSTITUTION_FIXTURES: readonly SubstitutionFixture[] = [
  SUB_MAIN_COS,
  SUB_HALF_EXP,
  SUB_LINEAR_INNER,
];

export const PARTS_FIXTURES: readonly PartsFixture[] = [PARTS_X_EXP, PARTS_LN, PARTS_X_COS];

/**
 * Every graded "produce an antiderivative" item's fixture, in one list —
 * derived from the structured fixtures above (single source), plus the
 * stand-alone pairs no structure fits.
 */
export const ANTIDERIVATIVE_PAIRS: readonly AntiderivativePair[] = [
  ...SUBSTITUTION_FIXTURES.map((fix) => ({
    id: `${fix.id}-pair`,
    label: fix.label,
    integrand: substitutionIntegrand(fix),
    integrandSource: fix.integrandSource,
    antiderivative: (x: number) => fix.F(fix.g(x)),
    antiderivativeSource: fix.antiderivativeSource,
    domain: fix.domain,
  })),
  ...PARTS_FIXTURES.map((fix) => ({
    id: `${fix.id}-pair`,
    label: fix.label,
    integrand: partsIntegrand(fix),
    integrandSource: fix.integrandSource,
    // The closure IS the parsed source — one origin, and the guard checks
    // that its numeric derivative matches u·v', so the pair cannot claim an
    // antiderivative its own string does not deliver.
    antiderivative: parsedClosure(`${fix.id}-pair`, fix.antiderivativeSource),
    antiderivativeSource: fix.antiderivativeSource,
    domain: fix.domain,
  })),
];

/* -------------------------------------------------- classification battery */

/**
 * Method-selection data: fresh integrands the learner classifies as
 * chain-shape, product-shape, or neither. Every `chain` entry carries its
 * decomposition and every `product` entry its factors, so the guard can
 * verify the label mechanically; `neither` labels rest on cited
 * non-elementarity or on no-decomposition-in-scope and are authored
 * judgments — stated as such.
 */
export type IntegrandShape = "chain" | "product" | "neither";

export interface ClassificationEntry {
  readonly id: string;
  readonly integrandSource: string;
  readonly integrand: RealFunction;
  readonly shape: IntegrandShape;
  readonly why: string;
  /** For `chain`: the decomposition proving the label. */
  readonly chain?: { readonly f: RealFunction; readonly g: RealFunction; readonly gPrime: RealFunction };
  /** For `product`: the factors proving the label. */
  readonly product?: { readonly u: RealFunction; readonly vPrime: RealFunction };
  readonly domain: readonly [number, number];
}

export const CLASSIFICATION_BATTERY: readonly ClassificationEntry[] = [
  {
    id: "classify-chain-esin",
    integrandSource: "cos(x) exp(sin(x))",
    integrand: (x) => Math.cos(x) * Math.exp(Math.sin(x)),
    shape: "chain",
    why: "e^(sin x) with its manufacturing factor cos x alongside — the output of d/dx e^(sin x).",
    chain: { f: Math.exp, g: Math.sin, gPrime: Math.cos },
    domain: [0, 1.5],
  },
  {
    id: "classify-product-xcos",
    integrandSource: "x cos(x)",
    integrand: (x) => x * Math.cos(x),
    shape: "product",
    why: "Two unrelated factors — no inner function's derivative is standing beside a composition; but x dies under differentiation, so the parts trade improves it.",
    product: { u: (x) => x, vPrime: Math.cos },
    domain: [0, 3],
  },
  {
    id: "classify-neither-gauss",
    integrandSource: "exp(-x^2)",
    integrand: (x) => Math.exp(-(x * x)),
    shape: "neither",
    why: "The chain-rule factor −2x is missing and no trade simplifies it — and that is not a failure of cleverness: by Liouville's theorem (cited, not proved) no elementary antiderivative exists.",
    domain: [-2, 2],
  },
  {
    id: "classify-chain-2xcos",
    integrandSource: "2x cos(x^2)",
    integrand: (x) => 2 * x * Math.cos(x * x),
    shape: "chain",
    why: "cos(x²) next to exactly the factor 2x that d/dx x² produces.",
    chain: { f: Math.cos, g: (x) => x * x, gPrime: (x) => 2 * x },
    domain: [0.2, 1.8],
  },
  {
    id: "classify-product-lnx",
    integrandSource: "x ln(x)",
    integrand: (x) => x * Math.log(x),
    shape: "product",
    why: "ln x simplifies under differentiation; x integrates cleanly — the trade's two conditions.",
    product: { u: Math.log, vPrime: (x) => x },
    domain: [0.5, 3],
  },
];

/* ------------------------------------------------------------------ guard */

const GUARD_SAMPLES = 60;

function denseCheck(
  label: string,
  domain: readonly [number, number],
  actual: RealFunction,
  expected: RealFunction,
  tolerance: number,
): void {
  const [lo, hi] = domain;
  for (let i = 1; i < GUARD_SAMPLES; i += 1) {
    const x = lo + ((hi - lo) * i) / GUARD_SAMPLES;
    const a = actual(x);
    const e = expected(x);
    if (!Number.isFinite(a) || !Number.isFinite(e)) continue;
    const scale = Math.max(1, Math.abs(e));
    if (Math.abs(a - e) > tolerance * scale) {
      throw new Error(`${label}: disagreement at x = ${x} (${a} vs ${e}).`);
    }
  }
}

/** Parses a fixture's source string and returns its closure, or throws naming the fixture. */
function parsedClosure(id: string, source: string): RealFunction {
  const outcome = tryParseExpression(source);
  if (!outcome.ok) {
    throw new Error(`${id}: source "${source}" does not parse: ${outcome.message}`);
  }
  return (x) => evaluate(outcome.node, { x });
}

/**
 * Load-time consistency guard, in `calculus.ts`'s tradition. Checks, for
 * every fixture: declared derivatives really are derivatives; declared
 * antiderivatives really differentiate to the integrand; every SOURCE STRING
 * parses and matches its computed closure (the display-drift guard); `g` is
 * monotone on every substitution window (corroborated by sampling — the
 * declaration the strip picture depends on); and the parts identity holds
 * numerically as corroboration.
 */
export function assertIntegrationFixturesAreConsistent(): void {
  for (const fix of SUBSTITUTION_FIXTURES) {
    const [lo, hi] = fix.domain;
    if (!(hi > lo)) throw new Error(`${fix.id}: empty domain.`);
    // F' = f on the image window.
    const uLo = Math.min(fix.g(lo), fix.g(hi));
    const uHi = Math.max(fix.g(lo), fix.g(hi));
    denseCheck(`${fix.id}: F' vs f`, [uLo, uHi], (u) => numericDerivative(fix.F, u), fix.f, 1e-4);
    // g' really is g's derivative.
    denseCheck(`${fix.id}: g' vs numeric`, fix.domain, fix.gPrime, (x) => numericDerivative(fix.g, x), 1e-4);
    // Monotone g on the window — sampled corroboration of the declaration.
    const step = (hi - lo) / GUARD_SAMPLES;
    const direction = Math.sign(fix.g(lo + step) - fix.g(lo));
    for (let i = 1; i < GUARD_SAMPLES; i += 1) {
      const x = lo + i * step;
      const delta = fix.g(x + step) - fix.g(x);
      if (Math.sign(delta) !== direction || delta === 0) {
        throw new Error(`${fix.id}: g is not monotone on [${lo}, ${hi}] (sampled turn near x = ${x}).`);
      }
    }
    // Source strings match their computed twins.
    denseCheck(
      `${fix.id}: integrandSource vs computed f(g)·g'`,
      fix.domain,
      parsedClosure(fix.id, fix.integrandSource),
      substitutionIntegrand(fix),
      1e-9,
    );
    denseCheck(
      `${fix.id}: antiderivativeSource vs F∘g`,
      fix.domain,
      parsedClosure(fix.id, fix.antiderivativeSource),
      (x) => fix.F(fix.g(x)),
      1e-9,
    );
  }

  for (const fix of PARTS_FIXTURES) {
    const [a, b] = fix.domain;
    if (!(b > a)) throw new Error(`${fix.id}: empty domain.`);
    denseCheck(`${fix.id}: u' vs numeric`, fix.domain, fix.uPrime, (x) => numericDerivative(fix.u, x), 1e-4);
    denseCheck(`${fix.id}: v' vs numeric`, fix.domain, fix.vPrime, (x) => numericDerivative(fix.v, x), 1e-4);
    denseCheck(
      `${fix.id}: integrandSource vs u·v'`,
      fix.domain,
      parsedClosure(fix.id, fix.integrandSource),
      partsIntegrand(fix),
      1e-9,
    );
    // The declared antiderivative source really differentiates to u·v'.
    const declared = parsedClosure(fix.id, fix.antiderivativeSource);
    denseCheck(
      `${fix.id}: d/dx(antiderivativeSource) vs u·v'`,
      fix.domain,
      (x) => numericDerivative(declared, x),
      partsIntegrand(fix),
      1e-4,
    );
    // The parts identity, numerically — corroboration of the lesson's derivation.
    const lhs = riemannSum(partsIntegrand(fix), a, b, 4000, "mid");
    const rhs = partsBoundaryTerm(fix) - riemannSum(partsTradedIntegrand(fix), a, b, 4000, "mid");
    if (Math.abs(lhs - rhs) > 1e-3 * Math.max(1, Math.abs(lhs))) {
      throw new Error(`${fix.id}: parts identity fails numerically (${lhs} vs ${rhs}).`);
    }
  }

  for (const entry of CLASSIFICATION_BATTERY) {
    denseCheck(
      `${entry.id}: integrandSource vs closure`,
      entry.domain,
      parsedClosure(entry.id, entry.integrandSource),
      entry.integrand,
      1e-9,
    );
    if (entry.shape === "chain") {
      if (!entry.chain) throw new Error(`${entry.id}: labelled chain but carries no decomposition.`);
      const { f, g, gPrime } = entry.chain;
      denseCheck(`${entry.id}: chain label vs f(g)·g'`, entry.domain, (x) => f(g(x)) * gPrime(x), entry.integrand, 1e-9);
      denseCheck(`${entry.id}: chain g' vs numeric`, entry.domain, gPrime, (x) => numericDerivative(g, x), 1e-4);
    }
    if (entry.shape === "product") {
      if (!entry.product) throw new Error(`${entry.id}: labelled product but carries no factors.`);
      const { u, vPrime } = entry.product;
      denseCheck(`${entry.id}: product label vs u·v'`, entry.domain, (x) => u(x) * vPrime(x), entry.integrand, 1e-9);
    }
  }

  // The non-elementary case: only its source-vs-closure claim is checkable.
  denseCheck(
    `${GAUSS_NON_ELEMENTARY.id}: integrandSource vs closure`,
    GAUSS_NON_ELEMENTARY.domain,
    parsedClosure(GAUSS_NON_ELEMENTARY.id, GAUSS_NON_ELEMENTARY.integrandSource),
    GAUSS_NON_ELEMENTARY.integrand,
    1e-9,
  );
}
