/**
 * Pure math helpers and fixtures for `optimization-approximation` (spine L6,
 * `calculus-technique`). No React, Mafs, or Motion Canvas.
 *
 * A **coherent extension, kept separate from `calculus.ts`**: the lesson's
 * central object — the candidate set, its second-derivative classification, a
 * certified sufficient radius, and a linearization error bound — is a genuinely
 * new job (existence/location/decision over a whole fixture), not a new reading
 * of an existing helper, and `OptimizationFixture` needs fields (a second
 * derivative, analytically declared stationary points, open-endpoint flags)
 * that no other lesson's `CalculusFixture` consumer needs. Keeping it in its
 * own module means this file's own consistency check
 * (`assertOptimizationFixturesAreConsistent`) can run only over what this
 * lesson actually uses, without widening `calculus.ts`'s shared surface for
 * every other calculus lesson.
 *
 * **The three radii, kept distinct everywhere below** (the defect two rounds
 * of Mode B review found and fixed in the docs — see
 * `docs/courses/applied-mathematics/lessons/06-optimization-approximation/mastery-contract.md`
 * §1c): a `certifiedRadius` is a PROVEN sufficient radius, never claimed
 * maximal; `firstSampledDisagreement` is an OBSERVATION on one sampling grid,
 * distinct from the certified radius and free to disagree with it; and
 * `NO_DISAGREEMENT_IN_DOMAIN` is the real, honest report when a fixture (e.g.
 * a linear one, where the residual is identically zero) never disagrees at
 * all. No function in this file is named "threshold", and none should be —
 * that word is the exact defect being guarded against.
 *
 * **Dense sampling never certifies.** `denseScanExtremes` is corroboration
 * only (matching `looksMonotoneOn` in `calculus.ts`, which the same
 * discipline already governs) — every fixture's candidate set is read from
 * ANALYTICALLY DECLARED `stationaryPoints`/`singularPoints`, checked against
 * the fixture's own declared derivative by
 * `assertOptimizationFixturesAreConsistent`, never inferred by scanning.
 */

import { type RealFunction, numericDerivative } from "./calculus";

/* ------------------------------------------------------------------ types */

/**
 * A function plus everything this lesson's method needs to reason about it —
 * declared, not inferred, the same discipline `CalculusFixture.monotoneIntervals`
 * already uses and for the same reason: a narrow stationary point between two
 * samples is invisible to a scan, so a scan can support an observation and
 * must never license a completeness guarantee.
 */
export interface OptimizationFixture {
  readonly id: string;
  readonly label: string;
  readonly f: RealFunction;
  readonly domain: readonly [number, number];
  /**
   * `[leftOpen, rightOpen]`. Omitted (or both `false`) means the domain is
   * closed on both ends, the Extreme Value Theorem's hypothesis. A `true`
   * entry means that endpoint is NOT part of the domain — it is never an
   * eligible candidate, and existence is not guaranteed by EVT alone.
   */
  readonly domainOpen?: readonly [boolean, boolean];
  readonly derivative: RealFunction;
  /** Where available; required for classification and the error bound. */
  readonly derivative2?: RealFunction;
  /**
   * Analytically declared zeros of `derivative` inside the OPEN domain —
   * never inferred by sampling. `assertOptimizationFixturesAreConsistent`
   * checks each against `derivative` itself.
   */
  readonly stationaryPoints: readonly number[];
  /** Points where `f` is defined but `derivative` is not (a corner). */
  readonly singularPoints?: readonly number[];
  /**
   * Set true only for the degenerate case where EVERY point of the domain is
   * stationary (a constant function) — a case `stationaryPoints` cannot
   * represent as a finite array. `candidateSet` reads this flag before
   * `stationaryPoints` and reports a non-finite reduction.
   */
  readonly allPointsStationary?: boolean;
  /**
   * A PROVABLE upper bound on `|derivative2|` over `[center - radius, center +
   * radius] ∩ domain`, declared analytically per fixture (e.g. a closed form
   * from the fixture's own `derivative2`, exploiting monotonicity or a
   * triangle-inequality bound) — never a sampled maximum. Required for
   * `certifiedRadius` and `linearizationErrorBound`. A fixture with
   * `derivative2` identically zero (a linear function) declares the constant
   * bound `0`, which is what makes `certifiedRadius` correctly return "no
   * disagreement anywhere in the domain" for a straight line.
   */
  readonly secondDerivativeBound?: (center: number, radius: number) => number;
}

export type CandidateKind = "stationary" | "singular" | "endpoint";

export interface CandidatePoint {
  readonly x: number;
  readonly kind: CandidateKind;
  readonly value: number;
}

export type CandidateSetResult =
  | { readonly kind: "finite"; readonly points: readonly CandidatePoint[] }
  | { readonly kind: "not-finite"; readonly reason: string };

export type SecondDerivativeVerdict = "local-min" | "local-max" | "silent";

export interface GlobalExtremaResult {
  readonly existenceGuaranteed: boolean;
  readonly candidates: CandidateSetResult;
  /** Undefined when candidates are not finite, or existence is not guaranteed. */
  readonly max?: { readonly value: number; readonly at: readonly number[] };
  readonly min?: { readonly value: number; readonly at: readonly number[] };
}

/** Reported by `firstSampledDisagreement` when no disagreement was found in the domain. */
export const NO_DISAGREEMENT_IN_DOMAIN = "none-in-this-domain" as const;

export type SampledDisagreement =
  | { readonly kind: "found"; readonly h: number }
  | { readonly kind: typeof NO_DISAGREEMENT_IN_DOMAIN };

const TOL = 1e-9;

function inDomain(fixture: OptimizationFixture, x: number): boolean {
  const [lo, hi] = fixture.domain;
  const [leftOpen, rightOpen] = fixture.domainOpen ?? [false, false];
  if (x < lo - TOL || x > hi + TOL) return false;
  if (leftOpen && Math.abs(x - lo) <= TOL) return false;
  if (rightOpen && Math.abs(x - hi) <= TOL) return false;
  return true;
}

/* ------------------------------------------------------------- candidates */

/**
 * The candidate set: a REDUCTION to stationary points, singular points, and
 * eligible endpoints — never claimed finite in general (`allPointsStationary`
 * is the honest report for a constant function, where the reduction reduces
 * nothing). Every non-endpoint member is analytically declared on the
 * fixture, not discovered here.
 */
export function candidateSet(fixture: OptimizationFixture): CandidateSetResult {
  if (fixture.allPointsStationary) {
    return {
      kind: "not-finite",
      reason: `${fixture.id}: every point of the domain is stationary — not a reduction to a finite set.`,
    };
  }
  const points: CandidatePoint[] = [];
  const seen = new Set<number>();
  const add = (x: number, kind: CandidateKind) => {
    const key = Math.round(x * 1e9) / 1e9;
    if (seen.has(key)) return;
    seen.add(key);
    points.push({ x, kind, value: fixture.f(x) });
  };
  for (const x of fixture.stationaryPoints) {
    if (inDomain(fixture, x)) add(x, "stationary");
  }
  for (const x of fixture.singularPoints ?? []) {
    if (inDomain(fixture, x)) add(x, "singular");
  }
  const [lo, hi] = fixture.domain;
  const [leftOpen, rightOpen] = fixture.domainOpen ?? [false, false];
  if (!leftOpen) add(lo, "endpoint");
  if (!rightOpen) add(hi, "endpoint");
  points.sort((a, b) => a.x - b.x);
  return { kind: "finite", points };
}

/** EVT's hypothesis: continuous (assumed for every fixture here) on a closed, bounded interval. */
export function existenceGuaranteed(fixture: OptimizationFixture): boolean {
  const [leftOpen, rightOpen] = fixture.domainOpen ?? [false, false];
  return !leftOpen && !rightOpen;
}

/**
 * The three separable jobs, run together: existence (EVT, cited), location
 * (the candidate set), decision (compare). Returns an honest "no conclusion"
 * when either existence or a finite candidate set is unavailable — never a
 * fabricated extremum.
 */
export function globalExtrema(fixture: OptimizationFixture): GlobalExtremaResult {
  const candidates = candidateSet(fixture);
  const guaranteed = existenceGuaranteed(fixture);
  if (!guaranteed || candidates.kind !== "finite" || candidates.points.length === 0) {
    return { existenceGuaranteed: guaranteed, candidates };
  }
  let maxValue = -Infinity;
  let minValue = Infinity;
  for (const p of candidates.points) {
    if (p.value > maxValue) maxValue = p.value;
    if (p.value < minValue) minValue = p.value;
  }
  const maxAt = candidates.points.filter((p) => Math.abs(p.value - maxValue) <= 1e-9).map((p) => p.x);
  const minAt = candidates.points.filter((p) => Math.abs(p.value - minValue) <= 1e-9).map((p) => p.x);
  return {
    existenceGuaranteed: guaranteed,
    candidates,
    max: { value: maxValue, at: maxAt },
    min: { value: minValue, at: minAt },
  };
}

/**
 * Corroboration ONLY — a dense scan's argmax/argmin, for tests to check
 * against the declared candidate set. Never the completeness oracle: a narrow
 * extremum between samples is invisible to it, the same limitation
 * `looksMonotoneOn` names for monotonicity in `calculus.ts`.
 */
export function denseScanExtremes(
  fixture: OptimizationFixture,
  samples = 20000,
): { readonly argmax: number; readonly argmin: number } {
  const [lo, hi] = fixture.domain;
  const [leftOpen, rightOpen] = fixture.domainOpen ?? [false, false];
  let argmax = NaN;
  let argmin = NaN;
  let maxV = -Infinity;
  let minV = Infinity;
  for (let i = 0; i <= samples; i += 1) {
    const x = lo + ((hi - lo) * i) / samples;
    if (leftOpen && i === 0) continue;
    if (rightOpen && i === samples) continue;
    const v = fixture.f(x);
    if (!Number.isFinite(v)) continue;
    if (v > maxV) {
      maxV = v;
      argmax = x;
    }
    if (v < minV) {
      minV = v;
      argmin = x;
    }
  }
  return { argmax, argmin };
}

/* -------------------------------------------------------- classification */

/**
 * The second-derivative test, including its own honest silence. `"silent"`
 * covers BOTH `derivative2` unavailable and `derivative2(x) === 0` — a failed
 * sufficient condition is not a verdict (insight.md C14).
 */
export function classifyStationaryPoint(
  fixture: OptimizationFixture,
  x: number,
): SecondDerivativeVerdict {
  if (!fixture.derivative2) return "silent";
  const value = fixture.derivative2(x);
  if (Math.abs(value) <= 1e-9) return "silent";
  return value > 0 ? "local-min" : "local-max";
}

/* ------------------------------------------------------ certified radius */

/**
 * A PROVEN sufficient radius on which `sign(f(a+h)-f(a)) === sign(f'(a)*h)`
 * for every `0 < |h| < delta` — constructed exactly as insight.md's C3:
 * `|E(h)| <= (M/2)h^2 < |f'(a)h|` whenever `|h| < 2|f'(a)|/M`, where `M`
 * bounds `|f''|` on the search window via the fixture's own declared
 * `secondDerivativeBound`. NEVER claimed maximal — see the module docstring.
 *
 * `searchRadius` bounds the window `secondDerivativeBound` is asked to cover;
 * the returned radius is clamped to it (and to stay inside the domain), so
 * the result is always a radius the bound genuinely applies over.
 *
 * Returns `Infinity` exactly when `M === 0` (a linear fixture, whose residual
 * is identically zero) — the sign agreement never fails anywhere `f'(a) != 0`
 * makes the argument run at all, which is `NO_DISAGREEMENT_IN_DOMAIN`'s
 * mathematical cause, not a coincidence of this implementation.
 */
export function certifiedRadius(
  fixture: OptimizationFixture,
  a: number,
  searchRadius = 5,
): number {
  const m = fixture.derivative(a);
  if (Math.abs(m) <= 1e-12) {
    throw new Error(`certifiedRadius: f'(${a}) = 0 — the escape-route lemma needs a nonzero slope.`);
  }
  if (!fixture.secondDerivativeBound) {
    throw new Error(`${fixture.id}: no declared secondDerivativeBound — cannot certify a radius.`);
  }
  const bound = fixture.secondDerivativeBound(a, searchRadius);
  if (bound <= 0) return Infinity;
  const raw = (2 * Math.abs(m)) / bound;
  return Math.min(raw, searchRadius);
}

/**
 * An OBSERVATION, not a proof: samples `h` outward in both directions up to
 * `maxRadius` (clamped to the domain) and reports the first `h` — by absolute
 * value — where `sign(f(a+h)-f(a)) !== sign(f'(a)*h)`. Deliberately
 * independent of `certifiedRadius`: the two may disagree in either direction,
 * and for a fixture whose residual never grows enough to flip the sign inside
 * the domain (a linear fixture, or a nonlinear one on a small enough domain),
 * this returns `NO_DISAGREEMENT_IN_DOMAIN` — a real, honest report, not a
 * missing value.
 */
export function firstSampledDisagreement(
  fixture: OptimizationFixture,
  a: number,
  options: { readonly steps?: number; readonly maxRadius?: number } = {},
): SampledDisagreement {
  const m = fixture.derivative(a);
  if (Math.abs(m) <= 1e-12) {
    throw new Error(`firstSampledDisagreement: f'(${a}) = 0 — nothing to sample agreement against.`);
  }
  const steps = options.steps ?? 400;
  const [lo, hi] = fixture.domain;
  const maxRadius = Math.min(options.maxRadius ?? 5, a - lo, hi - a);
  if (maxRadius <= 0) return { kind: NO_DISAGREEMENT_IN_DOMAIN };
  const expectedSign = Math.sign(m);
  for (let i = 1; i <= steps; i += 1) {
    const h = (maxRadius * i) / steps;
    for (const signedH of [h, -h]) {
      if (!inDomain(fixture, a + signedH)) continue;
      const change = fixture.f(a + signedH) - fixture.f(a);
      const actualSign = Math.sign(change);
      const predictedSign = Math.sign(m * signedH);
      if (actualSign === 0) continue;
      if (predictedSign !== 0 && actualSign !== predictedSign) {
        return { kind: "found", h: signedH };
      }
      void expectedSign;
    }
  }
  return { kind: NO_DISAGREEMENT_IN_DOMAIN };
}

/* --------------------------------------------------------- linearization */

export interface LinearizationResult {
  readonly value: number;
  /** `f(a) + f'(a) h`. */
  readonly linearValue: number;
  readonly trueError: number;
  /** `(M/2) h^2`, `M` from the fixture's declared `secondDerivativeBound`. */
  readonly bound: number;
}

/**
 * `f(a+h)` alongside its linearization, the true error, and the declared
 * curvature bound `(M/2)h^2` — never claiming the bound is tight, only that it
 * is not violated (checked by property tests against dense sampling).
 */
export function linearize(
  fixture: OptimizationFixture,
  a: number,
  h: number,
): LinearizationResult {
  const value = fixture.f(a + h);
  const linearValue = fixture.f(a) + fixture.derivative(a) * h;
  const trueError = Math.abs(value - linearValue);
  const bound = linearizationErrorBound(fixture, a, h);
  return { value, linearValue, trueError, bound };
}

/** `(M/2) h^2`, with `M` a declared bound on `|f''|` over `[a-|h|, a+|h|]`. */
export function linearizationErrorBound(
  fixture: OptimizationFixture,
  a: number,
  h: number,
): number {
  if (!fixture.secondDerivativeBound) {
    throw new Error(`${fixture.id}: no declared secondDerivativeBound — cannot bound the linearization error.`);
  }
  const m = fixture.secondDerivativeBound(a, Math.abs(h));
  return (m / 2) * h * h;
}

export interface StepDecomposition {
  /** The linear term `f'(a) h` — the escape-route argument's prediction. */
  readonly mh: number;
  /** The residual `f(a+h) - f(a) - mh` — what the linear term leaves out. */
  readonly eh: number;
  /** `f(a+h) - f(a)`, the actual change. */
  readonly change: number;
  readonly predictedSign: number;
  readonly actualSign: number;
  /**
   * `true` whenever `predictedSign` is `0` (nothing to disagree with — the
   * `h = 0` case included, since `mh = 0` then) or the two signs match.
   */
  readonly signAgrees: boolean;
}

/**
 * The escape-route step, split into its linear part and residual — the SAME
 * decomposition `linearize`'s error bound is built from, computed once here
 * so the guided scene and the explorer report identical numbers instead of
 * each re-deriving `mh`/`E(h)`/sign agreement inline. Requires no declared
 * `secondDerivativeBound` (unlike `linearize`) — the decomposition itself
 * needs only `f` and `f'`, the bound is a separate claim about it.
 */
export function stepDecomposition(fixture: OptimizationFixture, a: number, h: number): StepDecomposition {
  const mh = fixture.derivative(a) * h;
  const change = fixture.f(a + h) - fixture.f(a);
  const eh = change - mh;
  const predictedSign = Math.sign(mh);
  const actualSign = Math.sign(change);
  const signAgrees = predictedSign === 0 || actualSign === predictedSign;
  return { mh, eh, change, predictedSign, actualSign, signAgrees };
}

/**
 * The largest radius `r` — never exceeding what `fixture`'s OWN DECLARED
 * DOMAIN allows from `a` — on which `linearizationErrorBound(fixture, a, r)
 * <= epsilon`. Solved by BISECTION on `r`, not by fixed-point iteration.
 *
 * **Two independent defects, found by review, fixed together:**
 *
 * 1. An earlier version iterated `r ↦ sqrt(2ε / M(a, r))`, calling it
 *    conservative because `M(a, r)` is non-decreasing in `r`. That reasoning
 *    was backwards: composing a non-decreasing `M` with `r ↦ sqrt(2ε/M)`
 *    produces a *decreasing* map, and fixed-point iteration on a decreasing
 *    map does not converge — it oscillates. For `OPT_QUARTIC` at `a = 0`,
 *    `epsilon = 0.01`, it alternated between `r ≈ 4×10^4` and `r ≈ 10^-6`
 *    forever, returning a value whose own declared error bound was `~10^19`,
 *    nowhere near `epsilon`.
 * 2. The first bisection fix replaced that iteration but started from an
 *    UNVERIFIED `lo = hi / 2` (with `hi` seeded at `1e-6` and doubled until
 *    infeasible) — feasible only by assumption, never checked. For a small
 *    enough `epsilon` the true root sits BELOW that unverified `lo`
 *    (regression: `OPT_QUARTIC`, `a = 0`, `epsilon = 1e-30` — the true root
 *    is `~2×10^-8`, smaller than the old `lo`'s `5×10^-7`), so bisection
 *    could only search a range that never reached it, and returned an
 *    infeasible radius. `lo = 0` is a fixed point that needs no such
 *    assumption: `linearizationErrorBound(fixture, a, 0)` is exactly `0`,
 *    which is `<= epsilon` for every `epsilon > 0` by definition.
 *
 * The map `r ↦ linearizationErrorBound(fixture, a, r)` is non-decreasing in
 * `r` for every fixture this file declares (`M(a, r)` is non-decreasing by
 * each fixture's own construction, and `r²` is increasing), which is exactly
 * the precondition bisection needs — monotone bisection on a monotone
 * function cannot oscillate, unlike the fixed-point map above.
 *
 * **Domain reconciliation.** `hi` starts at the fixture's own reach from `a`
 * — `min(a - domainLo, domainHi - a)` when both directions stay inside the
 * domain, or the ONE side that exists when `a` sits exactly at that domain's
 * edge (a one-sided guarantee is the honest claim there: the other direction
 * leaves the fixture's declared domain entirely, so no symmetric radius past
 * `0` could ever be claimed). If the error bound already holds at that reach,
 * the reach itself is the answer — there is no larger radius to report,
 * since anything past it would claim validity for a point `a ± h` outside
 * where the fixture says `f` is being considered. This replaces the earlier
 * unconditional `return Infinity` for a zero-curvature fixture (linear or
 * constant): that reported an unbounded radius for a fixture with a bounded
 * domain, overstating what it actually supports.
 */
export function trustRadius(
  fixture: OptimizationFixture,
  a: number,
  epsilon: number,
): number {
  if (!fixture.secondDerivativeBound) {
    throw new Error(`${fixture.id}: no declared secondDerivativeBound — cannot size a trust radius.`);
  }
  if (!(epsilon > 0)) {
    throw new Error(`trustRadius: epsilon must be positive, got ${epsilon}.`);
  }
  const [domainLo, domainHi] = fixture.domain;
  if (a < domainLo - TOL || a > domainHi + TOL) {
    throw new Error(`trustRadius: a=${a} is outside ${fixture.id}'s domain [${domainLo}, ${domainHi}].`);
  }
  const leftReach = a - domainLo;
  const rightReach = domainHi - a;
  const maxReach =
    leftReach <= TOL ? rightReach : rightReach <= TOL ? leftReach : Math.min(leftReach, rightReach);
  if (!(maxReach > 0)) {
    throw new Error(`trustRadius: ${fixture.id} has no room to step from a=${a} in either domain direction.`);
  }

  const errorBoundAt = (r: number): number => linearizationErrorBound(fixture, a, r);

  if (errorBoundAt(maxReach) <= epsilon) {
    return maxReach;
  }

  // lo = 0 is always feasible; maxReach is confirmed infeasible above — a
  // genuine bracket, not an assumed one.
  let lo = 0;
  let hi = maxReach;
  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    if (errorBoundAt(mid) <= epsilon) lo = mid;
    else hi = mid;
  }
  return lo;
}

/* --------------------------------------------------------------- fixtures */

const CUBIC_LABEL = "f(x) = x³ − 3x";

/**
 * The main worked example (insight.md §7): global max at the ENDPOINT x = 3
 * despite an interior local max at x = -1; global min -2 attained TWICE, at
 * x = 1 and x = -2. f''(x) = 6x, so `secondDerivativeBound` is the triangle
 * inequality |6x| <= 6(|center| + radius) on [center-radius, center+radius].
 */
export const OPT_MAIN_CUBIC: OptimizationFixture = {
  id: "opt-main-cubic",
  label: CUBIC_LABEL,
  f: (x) => x * x * x - 3 * x,
  domain: [-2, 3],
  derivative: (x) => 3 * x * x - 3,
  derivative2: (x) => 6 * x,
  stationaryPoints: [-1, 1],
  secondDerivativeBound: (center, radius) => 6 * (Math.abs(center) + radius),
};

/**
 * x³ at 0 — reused from L2/L4's `ex-cubic-inflection` in an INVERTED role:
 * there, a counterexample about what a tangent is; here, the survivor that is
 * not an extremum (insight.md C6).
 */
export const OPT_CUBIC_SURVIVOR: OptimizationFixture = {
  id: "opt-cubic-survivor",
  label: "f(x) = x³",
  f: (x) => x * x * x,
  domain: [-1.5, 1.5],
  derivative: (x) => 3 * x * x,
  derivative2: (x) => 6 * x,
  stationaryPoints: [0],
  secondDerivativeBound: (center, radius) => 6 * (Math.abs(center) + radius),
};

/**
 * |x| on [-2, 2] — reused from L2's `ex-abs` in an INVERTED role: there, the
 * corner the tangent zoom cannot straighten; here, the minimum the sweep's
 * derivative-refutation argument cannot examine, because no local model
 * exists at the candidate.
 */
export const OPT_ABS: OptimizationFixture = {
  id: "opt-abs",
  label: "f(x) = |x|",
  f: Math.abs,
  domain: [-2, 2],
  derivative: (x) => (x >= 0 ? 1 : -1),
  stationaryPoints: [],
  singularPoints: [0],
};

/** x⁴ at 0 — one of the second-derivative test's silence battery (f''(0) = 0). */
export const OPT_QUARTIC: OptimizationFixture = {
  id: "opt-quartic",
  label: "f(x) = x⁴",
  f: (x) => x * x * x * x,
  domain: [-1.5, 1.5],
  derivative: (x) => 4 * x * x * x,
  derivative2: (x) => 12 * x * x,
  stationaryPoints: [0],
  secondDerivativeBound: (center, radius) => 12 * Math.pow(Math.abs(center) + radius, 2),
};

/** -x⁴ at 0 — the silence battery's other side: same f''(0) = 0, opposite verdict shape. */
export const OPT_NEG_QUARTIC: OptimizationFixture = {
  id: "opt-neg-quartic",
  label: "f(x) = −x⁴",
  f: (x) => -(x * x * x * x),
  domain: [-1.5, 1.5],
  derivative: (x) => -4 * x * x * x,
  derivative2: (x) => -12 * x * x,
  stationaryPoints: [0],
  secondDerivativeBound: (center, radius) => 12 * Math.pow(Math.abs(center) + radius, 2),
};

/**
 * A linear fixture — f''(x) = 0 EXACTLY, so `secondDerivativeBound` declares
 * the constant 0. This is what makes `certifiedRadius` return `Infinity` and
 * `firstSampledDisagreement` return `NO_DISAGREEMENT_IN_DOMAIN`: the residual
 * is identically zero, not merely small, so the escape-route sign agreement
 * never fails anywhere in the domain.
 */
export const OPT_LINEAR: OptimizationFixture = {
  id: "opt-linear",
  label: "f(x) = 2x + 1",
  f: (x) => 2 * x + 1,
  domain: [-4, 4],
  derivative: () => 2,
  derivative2: () => 0,
  stationaryPoints: [],
  secondDerivativeBound: () => 0,
};

/** A constant function — every point stationary; `candidateSet` must refuse to finitize it. */
export const OPT_CONSTANT: OptimizationFixture = {
  id: "opt-constant",
  label: "f(x) = 5",
  f: () => 5,
  domain: [-3, 3],
  derivative: () => 0,
  derivative2: () => 0,
  stationaryPoints: [],
  allPointsStationary: true,
  secondDerivativeBound: () => 0,
};

/**
 * f(x) = x on the OPEN interval (0, 1) — empty candidate set (no stationary
 * point, no singular point, no eligible endpoint), and EVT's hypothesis fails
 * (not closed). `globalExtrema` must report "no conclusion", never a
 * fabricated max/min.
 */
export const OPT_OPEN_INTERVAL: OptimizationFixture = {
  id: "opt-open-interval",
  label: "f(x) = x on (0, 1)",
  f: (x) => x,
  domain: [0, 1],
  domainOpen: [true, true],
  derivative: () => 1,
  derivative2: () => 0,
  stationaryPoints: [],
  secondDerivativeBound: () => 0,
};

const TAU_DECAY = 1.5;

/**
 * `ex-decay`'s e^{-t/1.5} on [0, 8], reused for the approximation half.
 * f''(t) = e^{-t/1.5}/1.5², strictly DECREASING for t >= 0 (since e^{-t/1.5}
 * is decreasing), so its max on [max(0, center-radius), center+radius] is at
 * the window's left end — an exact, provable bound, not a sampled one.
 * Monotone decreasing on the domain, so its optimization answer sits entirely
 * at the endpoints (max at t=0, min at t=8).
 */
export const OPT_DECAY: OptimizationFixture = {
  id: "opt-decay",
  label: "f(t) = e^(−t/1.5)",
  f: (t) => Math.exp(-t / TAU_DECAY),
  domain: [0, 8],
  derivative: (t) => -Math.exp(-t / TAU_DECAY) / TAU_DECAY,
  derivative2: (t) => Math.exp(-t / TAU_DECAY) / (TAU_DECAY * TAU_DECAY),
  stationaryPoints: [],
  secondDerivativeBound: (center, radius) => {
    const left = Math.max(0, center - radius);
    return Math.exp(-left / TAU_DECAY) / (TAU_DECAY * TAU_DECAY);
  },
};

/**
 * The driving fixture, `ex-drive` — reused for its two ALREADY-declared
 * turning points (`calculus.ts`'s `EX_DRIVE`), giving "when was the car
 * fastest?" a physical reading the learner already has. Declared here rather
 * than imported, because `EX_DRIVE.derivative` differentiates the velocity's
 * own formula; this lesson's `f` is that SAME velocity trace, read now as the
 * function to optimize rather than the rate being accumulated (L1-L4's role
 * for it) — a genuinely different job for the same numbers, so the constants
 * are kept in sync with `calculus.ts`'s `EX_DRIVE` by the consistency check
 * below, not re-derived independently.
 */
// v'(t) = 3.3 cos(0.55 t) - 0.35 vanishes twice on [0, 10] — exact expressions,
// matching `calculus.ts`'s `EX_DRIVE_T1`/`EX_DRIVE_T2` precisely, not rounded.
const DRIVE_T1 = Math.acos(0.35 / 3.3) / 0.55;
const DRIVE_T2 = (2 * Math.PI - Math.acos(0.35 / 3.3)) / 0.55;
export const OPT_DRIVE: OptimizationFixture = {
  id: "opt-drive",
  label: "A short drive",
  f: (t) => 6 * Math.sin(0.55 * t) - 0.35 * t,
  domain: [0, 10],
  derivative: (t) => 6 * 0.55 * Math.cos(0.55 * t) - 0.35,
  derivative2: (t) => -6 * 0.55 * 0.55 * Math.sin(0.55 * t),
  stationaryPoints: [DRIVE_T1, DRIVE_T2],
  secondDerivativeBound: () => 6 * 0.55 * 0.55,
};

export const OPTIMIZATION_FIXTURES: readonly OptimizationFixture[] = [
  OPT_MAIN_CUBIC,
  OPT_CUBIC_SURVIVOR,
  OPT_ABS,
  OPT_QUARTIC,
  OPT_NEG_QUARTIC,
  OPT_LINEAR,
  OPT_CONSTANT,
  OPT_OPEN_INTERVAL,
  OPT_DECAY,
  OPT_DRIVE,
];

export function getOptimizationFixture(id: string): OptimizationFixture {
  const fixture = OPTIMIZATION_FIXTURES.find((entry) => entry.id === id);
  if (!fixture) throw new Error(`getOptimizationFixture: unknown fixture "${id}".`);
  return fixture;
}

/**
 * Correctness guard, run at module load (matching `calculus.ts`'s own
 * `assertCalculusFixturesAreConsistent`). Never fires for the shipped
 * fixtures; protects them if one is edited.
 */
export function assertOptimizationFixturesAreConsistent(): void {
  for (const fixture of OPTIMIZATION_FIXTURES) {
    const [lo, hi] = fixture.domain;
    if (!(hi > lo)) throw new Error(`${fixture.id}: empty domain.`);

    // The declared derivative must actually be the derivative, away from
    // declared singular points.
    for (let i = 1; i < 12; i += 1) {
      const x = lo + ((hi - lo) * i) / 12;
      if ((fixture.singularPoints ?? []).some((p) => Math.abs(p - x) < 0.15)) continue;
      const gap = Math.abs(fixture.derivative(x) - numericDerivative(fixture.f, x));
      if (gap > 1e-4) {
        throw new Error(`${fixture.id}: declared derivative disagrees at x = ${x} by ${gap}.`);
      }
    }

    // The declared second derivative, where present, must actually be one.
    if (fixture.derivative2) {
      for (let i = 1; i < 12; i += 1) {
        const x = lo + ((hi - lo) * i) / 12;
        if ((fixture.singularPoints ?? []).some((p) => Math.abs(p - x) < 0.15)) continue;
        const gap = Math.abs(fixture.derivative2(x) - numericDerivative(fixture.derivative, x));
        if (gap > 1e-3) {
          throw new Error(`${fixture.id}: declared second derivative disagrees at x = ${x} by ${gap}.`);
        }
      }
    }

    // Every declared stationary point must actually be one — derivative(x) ≈ 0.
    if (!fixture.allPointsStationary) {
      for (const x of fixture.stationaryPoints) {
        if (!inDomain(fixture, x)) {
          throw new Error(`${fixture.id}: declared stationary point ${x} is outside the domain.`);
        }
        const d = fixture.derivative(x);
        if (Math.abs(d) > 1e-6) {
          throw new Error(`${fixture.id}: declared stationary point ${x} has f'(x) = ${d}, not 0.`);
        }
      }
    }

    // A declared secondDerivativeBound must not be violated by the real f''
    // on a dense sample of its own claimed window — corroboration on the
    // BOUND's honesty, not a substitute for the analytic proof each bound's
    // comment states.
    if (fixture.derivative2 && fixture.secondDerivativeBound) {
      for (let i = 1; i < 12; i += 1) {
        const center = lo + ((hi - lo) * i) / 12;
        const radius = Math.min(2, (hi - lo) / 4);
        const bound = fixture.secondDerivativeBound(center, radius);
        for (let j = 0; j <= 10; j += 1) {
          const x = Math.max(lo, Math.min(hi, center - radius + (2 * radius * j) / 10));
          if ((fixture.singularPoints ?? []).some((p) => Math.abs(p - x) < 0.15)) continue;
          const actual = Math.abs(fixture.derivative2(x));
          if (actual > bound + 1e-6) {
            throw new Error(
              `${fixture.id}: secondDerivativeBound(${center}, ${radius}) = ${bound} is violated by |f''(${x})| = ${actual}.`,
            );
          }
        }
      }
    }
  }
}
