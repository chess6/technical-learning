/**
 * Pure calculus helpers and fixtures for the applied-mathematics course's
 * `calculus-foundations` unit (Package A). No React, Mafs, Motion Canvas, or DOM.
 *
 * Everything the four lessons *display* is computed here, so it can be held to
 * the mathematics by tests that run in jsdom — scene modules import
 * `@motion-canvas/2d` and cannot be resolved there.
 *
 * Design notes that are load-bearing rather than stylistic:
 *
 *  - **Fixtures carry their own axis units.** `integral-accumulation`'s whole
 *    insight is that an integral of a rate has the units of the total, so the
 *    units are data, never a hard-coded caption.
 *  - **Fixtures may declare a modulus of continuity.** `limits-continuity`
 *    teaches that continuity alone does not license a sampling grid; the
 *    modulus is the object that does, and `fundamental-theorem` cites it for
 *    the uniformity of its error bound.
 *  - **`riemannSum` never consults an antiderivative.** The two routes to
 *    \int_0^2 x^2 must stay independent or L4's corroboration is circular.
 */

import { DEFAULT_TOLERANCE } from "./types";

/* ------------------------------------------------------------------ types */

export type RealFunction = (x: number) => number;

/** How a limit can fail at a point — the catalogue `limits-continuity` teaches. */
export type LimitFailure = "jump" | "removable" | "oscillation" | "blow-up";

export type SamplePoint = "left" | "right" | "mid";

export interface AxisUnits {
  /** e.g. "s" — the input axis. */
  readonly input: string;
  /** e.g. "m/s" — the output axis, usually a rate. */
  readonly output: string;
  /**
   * What an integral of this fixture accumulates, e.g. "m". Present only when
   * the fixture is a rate; the product `output × input` must equal it.
   */
  readonly accumulated?: string;
}

/**
 * A modulus of continuity: a bound on how far `f` can move over a step of size
 * `delta`, valid across the whole declared interval.
 *
 * This is the **quantitative** control that continuity alone does not supply.
 * A fixture without one is not thereby discontinuous — it simply has no bound
 * declared, and no sampling claim may be made about it.
 */
export interface Modulus {
  /** `|f(x) - f(y)| <= omega(|x - y|)` for x, y in the fixture's domain. */
  readonly omega: (delta: number) => number;
  /** Human-readable form, e.g. "3\\delta". */
  readonly label: string;
}

export interface CalculusFixture {
  readonly id: string;
  readonly label: string;
  readonly f: RealFunction;
  readonly domain: readonly [number, number];
  readonly units?: AxisUnits;
  /** Exact derivative, where the course states one. */
  readonly derivative?: RealFunction;
  /** Exact antiderivative, where the course states one. **Never used by `riemannSum`.** */
  readonly antiderivative?: RealFunction;
  /** Points at which `f` is deliberately undefined (a punctured graph). */
  readonly punctured?: readonly number[];
  /** Points at which `f` is defined but not continuous, with the failure mode. */
  readonly discontinuities?: readonly { readonly at: number; readonly failure: LimitFailure }[];
  /** Points at which `f` is continuous but not differentiable. */
  readonly nonDifferentiable?: readonly number[];
  /** Declared modulus of continuity on `domain`, when the course supplies one. */
  readonly modulus?: Modulus;
  /** True when `f` is monotone on `domain` — the precondition for left/right bracketing. */
  readonly monotone?: boolean;
}

/* ------------------------------------------------------- limits & continuity */

/**
 * The difference quotient. Undefined at `h = 0` **by design**: that is the
 * `0/0` the lesson is about, and returning a fabricated value there would erase
 * the point.
 */
export function differenceQuotient(
  f: RealFunction,
  a: number,
  h: number,
): number {
  if (h === 0) {
    throw new Error(
      "differenceQuotient: h = 0 is the 0/0 the limit is about. " +
        "Ask for the limit, not the value.",
    );
  }
  return (f(a + h) - f(a)) / h;
}

/** A table of difference quotients over shrinking steps — the "it settles" beat. */
export function shrinkingQuotients(
  f: RealFunction,
  a: number,
  steps: readonly number[],
): readonly { readonly h: number; readonly quotient: number }[] {
  return steps.map((h) => ({ h, quotient: differenceQuotient(f, a, h) }));
}

/**
 * The smallest step size, searched on a grid, for which every sampled output in
 * `0 < |x - a| < delta` lies within `epsilon` of `target`.
 *
 * Returns `null` when no tested window works — which is how the explorer
 * reports "the guarantee cannot be met" for `ex-oscillate` and `ex-blowup`.
 * This is a **witness**, not a proof: it reports what a finite sample shows.
 */
export function smallestWindow(
  f: RealFunction,
  a: number,
  target: number,
  epsilon: number,
  options: { readonly maxDelta?: number; readonly samples?: number; readonly steps?: number } = {},
): number | null {
  const maxDelta = options.maxDelta ?? 1;
  const samples = options.samples ?? 64;
  const steps = options.steps ?? 40;
  for (let s = steps; s >= 1; s -= 1) {
    // Geometric ladder from maxDelta downward; the first (largest) delta that
    // works is the honest answer to "how wide may the window be?".
    const delta = maxDelta * Math.pow(0.8, steps - s);
    if (windowHolds(f, a, target, epsilon, delta, samples)) return delta;
  }
  return null;
}

function windowHolds(
  f: RealFunction,
  a: number,
  target: number,
  epsilon: number,
  delta: number,
  samples: number,
): boolean {
  for (let i = 1; i <= samples; i += 1) {
    const offset = (delta * i) / samples;
    for (const x of [a - offset, a + offset]) {
      const y = f(x);
      if (!Number.isFinite(y) || Math.abs(y - target) >= epsilon) return false;
    }
  }
  return true;
}

/**
 * The three-part continuity test, as the lesson states it: the value exists,
 * the limit exists, and they agree.
 */
export interface ContinuityVerdict {
  readonly valueExists: boolean;
  readonly limitExists: boolean;
  readonly agree: boolean;
  readonly continuous: boolean;
}

export function continuityAt(
  fixture: CalculusFixture,
  a: number,
  tolerance = DEFAULT_TOLERANCE,
): ContinuityVerdict {
  const valueExists =
    !(fixture.punctured ?? []).some((p) => Math.abs(p - a) < tolerance) &&
    Number.isFinite(fixture.f(a));
  const failure = limitFailureAt(fixture, a, tolerance);
  const limitExists = failure === null;
  const agree =
    valueExists &&
    limitExists &&
    Math.abs(fixture.f(a) - oneSidedLimit(fixture.f, a, +1)) < 1e-6;
  return { valueExists, limitExists, agree, continuous: valueExists && limitExists && agree };
}

/** Which failure the fixture declares at `a`, or `null` when the limit exists. */
export function limitFailureAt(
  fixture: CalculusFixture,
  a: number,
  tolerance = DEFAULT_TOLERANCE,
): LimitFailure | null {
  const declared = (fixture.discontinuities ?? []).find(
    (d) => Math.abs(d.at - a) < tolerance,
  );
  if (!declared) return null;
  // A removable discontinuity still HAS a limit — that is what makes it
  // removable, and it is the distinction `lim-limit-not-continuity` grades.
  return declared.failure === "removable" ? null : declared.failure;
}

/** A one-sided limit, estimated by approach. `side` is +1 (right) or -1 (left). */
export function oneSidedLimit(
  f: RealFunction,
  a: number,
  side: 1 | -1,
  start = 1e-2,
): number {
  let h = start;
  let last = f(a + side * h);
  for (let i = 0; i < 24; i += 1) {
    h /= 2;
    last = f(a + side * h);
  }
  return last;
}

/* -------------------------------------------------- modulus of continuity */

/**
 * **A** grid spacing whose guaranteed variation stays within `tolerance`, found
 * on a shrinking ladder — not necessarily the largest such spacing.
 *
 * The distinction matters and is why this is not used to grade anything: for a
 * modulus with a closed form the exact supremum is available (for
 * `omega(d) = 3d` and a tolerance of 0.06 it is exactly 0.02), and letting a
 * search ladder's granularity decide a graded answer would be arbitrary. This
 * helper exists for the explorer, where the learner may supply any modulus and a
 * sufficient spacing is what is wanted.
 *
 * Returns `null` when no tested spacing meets the tolerance.
 */
export function spacingForTolerance(
  modulus: Modulus,
  tolerance: number,
  options: { readonly maxSpacing?: number; readonly steps?: number } = {},
): number | null {
  const maxSpacing = options.maxSpacing ?? 1;
  const steps = options.steps ?? 200;
  for (let i = 0; i <= steps; i += 1) {
    const delta = maxSpacing * (1 - i / (steps + 1));
    if (modulus.omega(delta) <= tolerance) return delta;
  }
  return null;
}

/**
 * The worst gap, on a sample, between the true function and the straight-line
 * interpolation of a grid — the number that makes `ex-hidden-spike` a
 * demonstration rather than an assertion.
 */
export function samplingGap(
  f: RealFunction,
  domain: readonly [number, number],
  spacing: number,
  probesPerCell = 64,
): number {
  const [lo, hi] = domain;
  let worst = 0;
  for (let x = lo; x < hi - 1e-12; x += spacing) {
    const right = Math.min(x + spacing, hi);
    const y0 = f(x);
    const y1 = f(right);
    for (let k = 1; k < probesPerCell; k += 1) {
      const t = k / probesPerCell;
      const px = x + (right - x) * t;
      const interpolated = y0 + (y1 - y0) * t;
      worst = Math.max(worst, Math.abs(f(px) - interpolated));
    }
  }
  return worst;
}

/* ------------------------------------------------------------- derivative */

/** Symmetric numeric derivative — used only to *check* declared derivatives. */
export function numericDerivative(f: RealFunction, x: number, h = 1e-5): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** The local linear model at `a`: `h => f(a) + slope * h`. */
export function linearModel(
  f: RealFunction,
  a: number,
  slope: number,
): RealFunction {
  const base = f(a);
  return (h: number) => base + slope * h;
}

/**
 * The residual `E(h) = f(a + h) - (f(a) + slope * h)`.
 *
 * The lesson's central invariant: for the true derivative `E(h)/h -> 0`; for any
 * other slope the ratio tends to a nonzero constant. Rendering must show this as
 * a nonzero labelled quantity, never zero it out.
 */
export function residual(
  f: RealFunction,
  a: number,
  slope: number,
  h: number,
): number {
  return f(a + h) - linearModel(f, a, slope)(h);
}

export function residualRatio(
  f: RealFunction,
  a: number,
  slope: number,
  h: number,
): number {
  if (h === 0) throw new Error("residualRatio: undefined at h = 0.");
  return residual(f, a, slope, h) / h;
}

/* ------------------------------------------------------------ accumulation */

/**
 * Partition points for `[a, b]`.
 *
 * `unequal` produces a deliberately irregular partition — the telescoping
 * identity holds for **any** partition, and L4 demonstrates it on an unequal one
 * so that "the pieces must be equal" is never implied. The jitter is a fixed
 * deterministic sequence, not a random one, so every frame and test agrees.
 */
export function partitionPoints(
  a: number,
  b: number,
  n: number,
  kind: "equal" | "unequal" = "equal",
): readonly number[] {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`partitionPoints: n must be a positive integer, got ${n}.`);
  }
  if (kind === "equal") {
    return Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
  }
  const points = [a];
  // A fixed irrational-ish stride keeps the widths visibly different while
  // staying strictly increasing and summing to exactly (b - a).
  const weights = Array.from(
    { length: n },
    (_, i) => 1 + 0.6 * Math.sin(1.7 * (i + 1)),
  );
  const total = weights.reduce((s, w) => s + w, 0);
  let acc = a;
  for (let i = 0; i < n; i += 1) {
    acc += ((b - a) * weights[i]!) / total;
    points.push(i === n - 1 ? b : acc);
  }
  return points;
}

/**
 * A Riemann sum. **Consults no antiderivative** — the independence of this route
 * from the Fundamental Theorem is what makes L4's corroboration real evidence.
 */
export function riemannSum(
  f: RealFunction,
  a: number,
  b: number,
  n: number,
  sample: SamplePoint = "right",
  kind: "equal" | "unequal" = "equal",
): number {
  const points = partitionPoints(a, b, n, kind);
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const lo = points[i]!;
    const hi = points[i + 1]!;
    const at = sample === "left" ? lo : sample === "right" ? hi : (lo + hi) / 2;
    total += f(at) * (hi - lo);
  }
  return total;
}

/** The running total `A(x) = \int_a^x f`, evaluated at each partition point. */
export function runningTotal(
  f: RealFunction,
  a: number,
  b: number,
  n: number,
  sample: SamplePoint = "mid",
): readonly { readonly x: number; readonly total: number }[] {
  const points = partitionPoints(a, b, n);
  const out: { x: number; total: number }[] = [{ x: a, total: 0 }];
  let acc = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const lo = points[i]!;
    const hi = points[i + 1]!;
    const at = sample === "left" ? lo : sample === "right" ? hi : (lo + hi) / 2;
    acc += f(at) * (hi - lo);
    out.push({ x: hi, total: acc });
  }
  return out;
}

/** The right-endpoint sum for `x^2` on `[0, 2]`, in closed form. */
export function parabolaRightSum(n: number): number {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`parabolaRightSum: n must be a positive integer, got ${n}.`);
  }
  return (4 / 3) * (((n + 1) * (2 * n + 1)) / (n * n));
}

/** The units an integral of this fixture carries, derived rather than captioned. */
export function accumulatedUnits(fixture: CalculusFixture): string {
  const units = fixture.units;
  if (!units) {
    throw new Error(
      `accumulatedUnits: fixture "${fixture.id}" declares no axis units, so no ` +
        "unit claim may be displayed for its integral.",
    );
  }
  return units.accumulated ?? `${units.output}·${units.input}`;
}

/* ------------------------------------------------------------ telescoping */

export interface TelescopingTerm {
  readonly from: number;
  readonly to: number;
  readonly change: number;
}

/**
 * The telescoping decomposition of `F(b) - F(a)` over a partition.
 *
 * Deliberately expressed over an arbitrary point list rather than an interval,
 * because `telescoping-cancellation` — the visual family this feeds — is re-run
 * in `greens-theorem`, `stokes-theorem`, and `divergence-theorem` with shared
 * interior edges and faces instead of shared endpoints.
 */
export function telescopingTerms(
  F: RealFunction,
  points: readonly number[],
): readonly TelescopingTerm[] {
  if (points.length < 2) {
    throw new Error("telescopingTerms: need at least two points.");
  }
  return points.slice(0, -1).map((from, i) => {
    const to = points[i + 1]!;
    return { from, to, change: F(to) - F(from) };
  });
}

/**
 * Which evaluations cancel, and which survive.
 *
 * `cancelling` pairs an index with the two terms it appears in, once positively
 * and once negatively. `survivors` are the boundary evaluations — for an
 * interval, exactly two.
 */
export interface CancellationReport {
  readonly termCount: number;
  readonly cancellingCount: number;
  readonly survivors: readonly number[];
}

export function cancellationReport(
  points: readonly number[],
): CancellationReport {
  if (points.length < 2) {
    throw new Error("cancellationReport: need at least two points.");
  }
  return {
    termCount: points.length - 1,
    cancellingCount: points.length - 2,
    survivors: [points[0]!, points[points.length - 1]!],
  };
}

/* ---------------------------------------------------------------- fixtures */

const TAU_DECAY = 1.5;

/**
 * A velocity trace with an exactly matching position trace.
 *
 * Piecewise-smooth by construction so that the position really is the integral
 * of the velocity: accelerate, cruise, brake through zero into a reverse, then
 * settle. The reversing segment puts the signed case in the *main* example
 * rather than in an afterthought.
 */
const driveVelocity: RealFunction = (t) =>
  6 * Math.sin(0.55 * t) - 0.35 * t;

const drivePosition: RealFunction = (t) =>
  // Exact antiderivative of the above, normalized to A(0) = 0.
  (-6 / 0.55) * Math.cos(0.55 * t) - 0.175 * t * t + 6 / 0.55;

export const EX_DRIVE: CalculusFixture = {
  id: "ex-drive",
  label: "A short drive",
  f: driveVelocity,
  domain: [0, 10],
  units: { input: "s", output: "m/s", accumulated: "m" },
  derivative: (t) => 6 * 0.55 * Math.cos(0.55 * t) - 0.35,
  antiderivative: drivePosition,
  modulus: { omega: (d) => (6 * 0.55 + 0.35) * d, label: "3.65\\delta" },
};

export const EX_PARABOLA: CalculusFixture = {
  id: "ex-parabola",
  label: "f(x) = x²",
  f: (x) => x * x,
  domain: [0, 2],
  derivative: (x) => 2 * x,
  antiderivative: (x) => (x * x * x) / 3,
  modulus: { omega: (d) => 4 * d, label: "4\\delta" },
  monotone: true,
};

/** `ex-parabola` with the point at x = 3 deleted — the puncture beat. */
export const EX_PARABOLA_PUNCTURED: CalculusFixture = {
  id: "ex-parabola-punctured",
  label: "f(x) = x², with x = 3 deleted",
  f: (x) => x * x,
  domain: [1, 5],
  punctured: [3],
  discontinuities: [{ at: 3, failure: "removable" }],
  derivative: (x) => 2 * x,
};

export const EX_ABS: CalculusFixture = {
  id: "ex-abs",
  label: "f(x) = |x|",
  f: Math.abs,
  domain: [-2, 2],
  nonDifferentiable: [0],
  modulus: { omega: (d) => d, label: "\\delta" },
};

export const EX_CUBIC_INFLECTION: CalculusFixture = {
  id: "ex-cubic-inflection",
  label: "f(x) = x³",
  f: (x) => x * x * x,
  domain: [-1.5, 1.5],
  derivative: (x) => 3 * x * x,
  antiderivative: (x) => (x * x * x * x) / 4,
  monotone: true,
};

export const EX_DECAY: CalculusFixture = {
  id: "ex-decay",
  label: "e^{-t/τ}",
  f: (t) => Math.exp(-t / TAU_DECAY),
  domain: [0, 8],
  units: { input: "s", output: "V", accumulated: "V·s" },
  derivative: (t) => -Math.exp(-t / TAU_DECAY) / TAU_DECAY,
  antiderivative: (t) => -TAU_DECAY * Math.exp(-t / TAU_DECAY),
  modulus: { omega: (d) => d / TAU_DECAY, label: "\\delta/1.5" },
  monotone: true,
};

export const EX_JUMP: CalculusFixture = {
  id: "ex-jump",
  label: "A step at x = 1",
  f: (x) => (x < 1 ? 0 : 2),
  domain: [-1, 3],
  discontinuities: [{ at: 1, failure: "jump" }],
};

export const EX_OSCILLATE: CalculusFixture = {
  id: "ex-oscillate",
  label: "sin(1/x)",
  f: (x) => (x === 0 ? 0 : Math.sin(1 / x)),
  domain: [-0.6, 0.6],
  discontinuities: [{ at: 0, failure: "oscillation" }],
};

export const EX_BLOWUP: CalculusFixture = {
  id: "ex-blowup",
  label: "1/x²",
  f: (x) => (x === 0 ? Number.POSITIVE_INFINITY : 1 / (x * x)),
  domain: [-2, 2],
  discontinuities: [{ at: 0, failure: "blow-up" }],
};

/**
 * Continuous everywhere, yet a tall narrow spike sits entirely between two
 * adjacent samples of the declared coarse grid.
 *
 * This fixture is the lesson's *proof* that continuity alone does not license a
 * sampling grid. It is continuous (a squared-cosine bump, zero outside its
 * support), its value at every integer is exactly 0, and its maximum is 1.
 */
export const HIDDEN_SPIKE_GRID = 1;
export const HIDDEN_SPIKE_CENTRE = 4.5;
const HIDDEN_SPIKE_HALF_WIDTH = 0.22;

export const EX_HIDDEN_SPIKE: CalculusFixture = {
  id: "ex-hidden-spike",
  label: "Continuous, with a spike between the samples",
  f: (x) => {
    const d = Math.abs(x - HIDDEN_SPIKE_CENTRE);
    if (d >= HIDDEN_SPIKE_HALF_WIDTH) return 0;
    const c = Math.cos((Math.PI * d) / (2 * HIDDEN_SPIKE_HALF_WIDTH));
    return c * c;
  },
  domain: [0, 10],
  // No modulus is declared on purpose: the point is that a sampling claim needs
  // one, and this fixture is where the learner discovers that it is missing.
};

export const EX_CONSTANT_RATE: CalculusFixture = {
  id: "ex-constant-rate",
  label: "A constant rate",
  f: () => 3,
  domain: [0, 4],
  units: { input: "s", output: "m/s", accumulated: "m" },
  derivative: () => 0,
  antiderivative: (t) => 3 * t,
  modulus: { omega: () => 0, label: "0" },
  monotone: true,
};

/** Non-monotone: left/right sums do **not** bracket. Used to test the restriction. */
export const EX_NON_MONOTONE: CalculusFixture = {
  id: "ex-non-monotone",
  label: "A rate that rises and falls",
  f: (x) => Math.sin(x),
  domain: [0, Math.PI],
  derivative: Math.cos,
  antiderivative: (x) => -Math.cos(x),
  monotone: false,
};

/** A current trace that goes negative — the transfer item's fixture. */
export const EX_CURRENT: CalculusFixture = {
  id: "ex-current",
  label: "Current against time",
  f: (t) => 2.4 * Math.sin(0.8 * t) - 0.25 * t,
  domain: [0, 8],
  units: { input: "s", output: "A", accumulated: "C" },
  antiderivative: (t) => (-2.4 / 0.8) * Math.cos(0.8 * t) - 0.125 * t * t + 3,
};

export const EX_POWER: CalculusFixture = {
  id: "ex-power",
  label: "Power against time",
  f: (t) => 40 + 30 * Math.sin(0.6 * t),
  domain: [0, 8],
  units: { input: "s", output: "W", accumulated: "J" },
  antiderivative: (t) => 40 * t - (30 / 0.6) * Math.cos(0.6 * t) + 50,
};

export const CALCULUS_FIXTURES: readonly CalculusFixture[] = [
  EX_DRIVE,
  EX_PARABOLA,
  EX_PARABOLA_PUNCTURED,
  EX_ABS,
  EX_CUBIC_INFLECTION,
  EX_DECAY,
  EX_JUMP,
  EX_OSCILLATE,
  EX_BLOWUP,
  EX_HIDDEN_SPIKE,
  EX_CONSTANT_RATE,
  EX_NON_MONOTONE,
  EX_CURRENT,
  EX_POWER,
];

export function getCalculusFixture(id: string): CalculusFixture {
  const fixture = CALCULUS_FIXTURES.find((entry) => entry.id === id);
  if (!fixture) {
    throw new Error(`getCalculusFixture: unknown fixture "${id}".`);
  }
  return fixture;
}

/**
 * Correctness guard the lessons run before rendering. It never fires for the
 * shipped fixtures; it protects them if one is edited.
 */
export function assertCalculusFixturesAreConsistent(): void {
  for (const fixture of CALCULUS_FIXTURES) {
    const [lo, hi] = fixture.domain;
    if (!(hi > lo)) {
      throw new Error(`${fixture.id}: empty domain.`);
    }
    if (fixture.units && fixture.units.accumulated === undefined) {
      throw new Error(`${fixture.id}: declares axis units but no accumulated unit.`);
    }
    // A declared derivative must actually be the derivative, away from the
    // points where the fixture says it is not differentiable.
    if (fixture.derivative) {
      for (let i = 1; i < 12; i += 1) {
        const x = lo + ((hi - lo) * i) / 12;
        if ((fixture.nonDifferentiable ?? []).some((p) => Math.abs(p - x) < 0.2)) continue;
        const gap = Math.abs(fixture.derivative(x) - numericDerivative(fixture.f, x));
        if (gap > 1e-4) {
          throw new Error(
            `${fixture.id}: declared derivative disagrees at x = ${x} by ${gap}.`,
          );
        }
      }
    }
    // A declared antiderivative must actually be one.
    if (fixture.antiderivative) {
      for (let i = 1; i < 12; i += 1) {
        const x = lo + ((hi - lo) * i) / 12;
        const gap = Math.abs(
          numericDerivative(fixture.antiderivative, x) - fixture.f(x),
        );
        if (gap > 1e-4) {
          throw new Error(
            `${fixture.id}: declared antiderivative disagrees at x = ${x} by ${gap}.`,
          );
        }
      }
    }
    // A declared modulus must actually bound the variation.
    if (fixture.modulus) {
      for (let i = 0; i < 200; i += 1) {
        const x = lo + ((hi - lo) * (i % 20)) / 20;
        const y = lo + ((hi - lo) * ((i * 7) % 20)) / 20;
        const bound = fixture.modulus.omega(Math.abs(x - y));
        if (Math.abs(fixture.f(x) - fixture.f(y)) > bound + 1e-9) {
          throw new Error(
            `${fixture.id}: declared modulus does not bound |f(${x}) - f(${y})|.`,
          );
        }
      }
    }
  }
}
