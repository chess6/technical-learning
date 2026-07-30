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
  /**
   * Closed sub-intervals on which `f` is **certified** monotone.
   *
   * Declared by the course from the derivative's sign, not inferred by sampling.
   * Sampling can only ever report what it happened to look at: a narrow turn
   * between two samples is invisible to it, so a sampled check may support an
   * *observation* and must never license a *guarantee*. `bracketReport` reads
   * this field and nothing else for its `guaranteed` flag, and
   * `assertCalculusFixturesAreConsistent` checks each declared interval densely,
   * so a wrong declaration fails the suite rather than reaching a learner.
   *
   * Absent means "not certified", which is not the same as "not monotone".
   */
  readonly monotoneIntervals?: readonly (readonly [number, number])[];
  /**
   * Interior points where `f` is **certified** to turn — the derivative is zero
   * and changes sign, declared from the derivative rather than inferred.
   *
   * This exists so the UI can distinguish two different reasons a bracket
   * guarantee can be absent: the interval genuinely straddles a known turn, or
   * the interval is merely uncertified (nothing declared either way). Without
   * this field, "not `guaranteed`" has only one honest reading — "not
   * certified" — and code that says more than that (e.g. "the rate turns
   * here") would be asserting a fact this fixture never declared.
   * `assertCalculusFixturesAreConsistent` checks each declared point against
   * the derivative, so a wrong declaration fails the suite.
   */
  readonly turningPoints?: readonly number[];
}

/**
 * The slope at a point, or the two one-sided slopes where there is none.
 *
 * A discriminated union rather than a `number`, because at a corner there is no
 * number to return and every previous caller invented one: the symmetric
 * `numericDerivative` reports `0` at the vertex of `|x|`, and that zero was
 * drawn as a tangent, offered as a linear estimate, and printed as `f'(0)`. A
 * type that cannot express "no slope" guarantees somebody will fabricate one.
 */
export type SlopeAt =
  | { readonly kind: "differentiable"; readonly slope: number }
  | { readonly kind: "corner"; readonly left: number; readonly right: number };

/**
 * Resolve the slope at `a`, consulting the fixture's **declared**
 * non-differentiable points first.
 *
 * Declared, not detected: whether a function has a corner is a mathematical fact
 * the course states, and a numerical test for it would be exactly the kind of
 * sampled inference this module refuses elsewhere.
 */
export function slopeAt(
  fixture: CalculusFixture,
  a: number,
  tolerance = 1e-9,
): SlopeAt {
  const corner = (fixture.nonDifferentiable ?? []).some(
    (p) => Math.abs(p - a) <= tolerance,
  );
  if (corner) {
    const d = 1e-5;
    return {
      kind: "corner",
      left: (fixture.f(a) - fixture.f(a - d)) / d,
      right: (fixture.f(a + d) - fixture.f(a)) / d,
    };
  }
  return {
    kind: "differentiable",
    slope: fixture.derivative ? fixture.derivative(a) : numericDerivative(fixture.f, a),
  };
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
 * The outcome of searching a finite ladder of candidate windows.
 *
 * The distinction between the two failure cases is the whole reason this is a
 * discriminated result rather than `number | null`. Exhausting a finite search
 * is **not** a proof that no window exists — on a continuous function a window
 * always exists, and the ladder can still run out for a tolerance small enough
 * relative to its resolution. Collapsing both cases to `null` let the explorer
 * report "continuous: yes" and "guarantee: cannot be met" on the same screen.
 */
export type WindowSearch =
  /** A window that demonstrably answers the tolerance, on the sampled evidence. */
  | { readonly kind: "found"; readonly delta: number }
  /** No candidate on the ladder worked. Says nothing about whether one exists. */
  | { readonly kind: "not-found" };

/**
 * The **largest** window on a geometric ladder for which every sampled output in
 * `0 < |x - a| < delta` lies within `epsilon` of `target`.
 *
 * Largest, not smallest: the ladder descends from `maxDelta` and returns the
 * first candidate that works, which is the widest one tested. A *smallest*
 * window is not a meaningful object anyway — any smaller window also works.
 *
 * This is a **witness**, not a proof, in both directions: `found` reports what a
 * finite sample shows, and `not-found` reports only that the search failed.
 */
export function largestWindowFound(
  f: RealFunction,
  a: number,
  target: number,
  epsilon: number,
  options: { readonly maxDelta?: number; readonly samples?: number; readonly steps?: number } = {},
): WindowSearch {
  const maxDelta = options.maxDelta ?? 1;
  const samples = options.samples ?? 64;
  const steps = options.steps ?? 40;
  for (let s = steps; s >= 1; s -= 1) {
    const delta = maxDelta * Math.pow(0.8, steps - s);
    if (windowHolds(f, a, target, epsilon, delta, samples)) {
      return { kind: "found", delta };
    }
  }
  return { kind: "not-found" };
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

/**
 * Left and right sums, and whether they actually bracket a value.
 *
 * The `brackets` flag is **computed, never assumed**. Left/right bracketing is a
 * consequence of monotonicity, not of being a Riemann sum, and `integral-accumulation`
 * shows the restriction rather than stating it: `EX_NON_MONOTONE` is in the
 * fixture list precisely so a test can require this to come back `false`.
 */
export interface BracketReport {
  readonly left: number;
  readonly right: number;
  readonly lo: number;
  readonly hi: number;
  readonly width: number;
  /**
   * Did the pair happen to straddle the value at THIS partition? An observation
   * about one `n`, and nothing more.
   */
  readonly straddles: boolean;
  /**
   * Does the guarantee apply — is `[a, b]` inside a **declared** monotone
   * interval of the fixture?
   *
   * These two are deliberately separate, because they come apart in exactly the
   * case the lesson is about. On a rate that rises and falls, the left and right
   * sums can still straddle the answer at some `n` **by luck**; reporting that as
   * a bracket would teach that left/right sums bracket in general, which is the
   * misconception the lesson's recognition item exists to catch. Only
   * `guaranteed` licenses the claim — and it comes from certified data rather
   * than from a sampled check, because a finite sample cannot prove monotonicity.
   */
  readonly guaranteed: boolean;
  /**
   * Does a **declared** turning point of the fixture lie strictly inside
   * `(a, b)`? This is the only thing that may license the stronger claim "the
   * rate turns here" — `!guaranteed` alone only ever means "not certified",
   * which is a weaker and different statement. See `CalculusFixture.turningPoints`.
   */
  readonly turnsWithin: boolean;
}

/**
 * Did `f` **look** monotone on `[a, b]` at this sampling resolution?
 *
 * An observation, and named as one. A finite sample cannot prove monotonicity —
 * a turn narrower than the spacing is invisible to it — so this must never
 * license the word "guaranteed" or the drawing of bracket bars. Use
 * `isCertifiedMonotoneOn` for that.
 */
export function looksMonotoneOn(
  f: RealFunction,
  a: number,
  b: number,
  samples = 512,
): boolean {
  let rising = false;
  let falling = false;
  let previous = f(a);
  for (let i = 1; i <= samples; i += 1) {
    const value = f(a + ((b - a) * i) / samples);
    if (value > previous + 1e-12) rising = true;
    if (value < previous - 1e-12) falling = true;
    if (rising && falling) return false;
    previous = value;
  }
  return true;
}

/**
 * Is `[a, b]` inside an interval the fixture **certifies** monotone?
 *
 * The only thing that may license the bracketing guarantee. A fixture that
 * declares no monotone intervals gets `false`, which says "not certified" rather
 * than "not monotone" — the honest reading of missing information.
 */
export function isCertifiedMonotoneOn(
  fixture: CalculusFixture,
  a: number,
  b: number,
  tolerance = 1e-9,
): boolean {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return (fixture.monotoneIntervals ?? []).some(
    ([start, end]) => lo >= start - tolerance && hi <= end + tolerance,
  );
}

/**
 * Does a **declared** turning point of `fixture` lie strictly inside `(a, b)`?
 *
 * Strictly, not inclusively: a turning point sitting exactly at an endpoint is
 * where two certified stretches meet, not a turn the selected interval crosses.
 */
export function turnsWithinInterval(
  fixture: CalculusFixture,
  a: number,
  b: number,
  tolerance = 1e-9,
): boolean {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return (fixture.turningPoints ?? []).some((t) => t > lo + tolerance && t < hi - tolerance);
}

export function bracketReport(
  fixture: CalculusFixture,
  a: number,
  b: number,
  n: number,
  value: number,
): BracketReport {
  const f = fixture.f;
  const left = riemannSum(f, a, b, n, "left");
  const right = riemannSum(f, a, b, n, "right");
  const lo = Math.min(left, right);
  const hi = Math.max(left, right);
  return {
    left,
    right,
    lo,
    hi,
    width: hi - lo,
    // A tolerance would hide the failure this exists to expose, so there is none.
    straddles: value >= lo && value <= hi,
    // Certified, not sampled. `looksMonotoneOn` would have been an inference
    // from 512 values dressed up as a theorem.
    guaranteed: isCertifiedMonotoneOn(fixture, a, b),
    turnsWithin: turnsWithinInterval(fixture, a, b),
  };
}

/** A short and a long-form message licensed by `report`, and nothing more. */
export interface BracketGuaranteeMessage {
  readonly headline: string;
  /** Longer explanatory prose, or `null` when the guarantee holds outright. */
  readonly note: string | null;
}

/**
 * What the certification state actually proves, in learner-facing words.
 *
 * Pure and separately tested so the wording is held to the same discipline as
 * the numbers: `!guaranteed` alone means only "not certified", and must not be
 * worded as "the rate turns here" unless `turnsWithin` — an independent,
 * declared fact — says so. Conflating the two would let an uncertified-but-
 * possibly-monotone interval be reported as a known turn.
 */
export function describeBracketGuarantee(report: BracketReport): BracketGuaranteeMessage {
  if (report.guaranteed) {
    return { headline: "yes — the rate is monotone on this interval", note: null };
  }
  if (report.turnsWithin) {
    return {
      headline: "no — the rate turns inside this interval, so any straddle is luck",
      note:
        "The rate **turns** on this interval, so the left and right sums guarantee nothing — even if they happen to land either side of the answer at this $n$, which they sometimes do. Bracketing is a consequence of the rate being *monotone*, not of the sum being a Riemann sum, which is why the picture shows no bars here. Narrow the interval to stop at the turn, where the rate only rises or only falls, and the guarantee returns.",
    };
  }
  return {
    headline: "no — not certified monotone on this interval",
    note:
      "This interval has not been **certified** monotone, so the left and right sums guarantee nothing here — even if they happen to land either side of the answer at this $n$. That is a gap in what has been declared about this rate, not a demonstration that it turns: an uncertified interval can still be genuinely monotone. Bracketing is a consequence of a *certified* guarantee, not of the sum being a Riemann sum, which is why the picture shows no bars here.",
  };
}

/** Riemann sums over a ladder of partition counts — the "it settles" table. */
export function refinementTable(
  f: RealFunction,
  a: number,
  b: number,
  counts: readonly number[],
  sample: SamplePoint = "right",
): readonly { readonly n: number; readonly sum: number }[] {
  return counts.map((n) => ({ n, sum: riemannSum(f, a, b, n, sample) }));
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

/* ---------------------------------------------------- generic cancellation */

/**
 * One signed contribution to a telescoping sum: `sign * value`, tagged by an
 * `id` shared with the OTHER contribution it cancels against.
 *
 * `telescopingTerms`/`cancellationReport` above assume the special case of a
 * single ordered chain over a 1D interval, where "cancelling pair" and
 * "shared interior partition point" are the same thing — the survivor count
 * is always the two ends because a chain always has exactly two ends. That
 * assumption is exactly what breaks for `greens-theorem` (L34): two adjacent
 * cells of a subdivided region share an INTERIOR EDGE, traversed once in each
 * orientation, and interior edges are not consecutive terms of any single 1D
 * order — the "chain" is a graph, not a line. `cancelContributions` makes no
 * assumption about order, arity, or what a "position" even is beyond "two
 * contributions sharing an id and summing to zero cancel" — the general
 * statement of what telescoping actually is, of which the interval case
 * (`intervalContributions`, below) is one instance among others.
 */
export interface SignedContribution {
  readonly id: string;
  readonly sign: 1 | -1;
  readonly value: number;
  /** Learner-facing label, e.g. `"F(x_2)"` or `"edge AB"`. */
  readonly label: string;
}

export interface GenericCancellationReport {
  readonly termCount: number;
  readonly cancellingCount: number;
  readonly survivors: readonly SignedContribution[];
}

/**
 * The magnitude tolerance `cancelContributions` uses to decide whether two
 * opposite-signed contributions are the SAME shared value (and therefore
 * genuinely cancel) or merely share an id by coincidence. The interval case
 * (`intervalContributions`) needs no slack at all — both occurrences call the
 * same pure `F` on the identical bit-pattern input, so they are `===`. This
 * default exists for the case the interval adapter doesn't hit: a future
 * shared-edge caller (`greens-theorem`) where each side of the edge is
 * computed independently (e.g. by two different cells' own quadrature), so
 * floating-point drift can make an honestly-equal pair only approximately
 * equal.
 */
export const CANCELLATION_MAGNITUDE_TOLERANCE = 1e-9;

/**
 * Cancel contributions by id, sign, AND magnitude — no interval, no order, no
 * notion of "adjacent". A contribution cancels iff exactly one other
 * contribution shares its id, their signs sum to zero, AND their `value`s
 * agree within `tolerance`. Everything else survives: an id that appears
 * once, three or more times, twice with the SAME sign (a bookkeeping error
 * the caller should see, not a silent cancellation), or twice with opposite
 * sign but DIFFERENT magnitude — the case a shared-edge/shared-face reuse
 * (`greens-theorem`, `stokes-theorem`, `divergence-theorem`) must not treat as
 * cancelling, since an edge traversed with unequal contributions from its two
 * sides is a real inconsistency, not a telescoping identity.
 */
export function cancelContributions(
  contributions: readonly SignedContribution[],
  tolerance = CANCELLATION_MAGNITUDE_TOLERANCE,
): GenericCancellationReport {
  if (contributions.length === 0) {
    throw new Error("cancelContributions: need at least one contribution.");
  }
  const byId = new Map<string, SignedContribution[]>();
  for (const c of contributions) {
    const group = byId.get(c.id);
    if (group) group.push(c);
    else byId.set(c.id, [c]);
  }
  const survivors: SignedContribution[] = [];
  let cancellingCount = 0;
  for (const group of byId.values()) {
    const net = group.reduce((sum, c) => sum + c.sign, 0);
    const magnitudesAgree =
      group.length === 2 &&
      Math.abs(group[0]!.value - group[1]!.value) <= tolerance;
    if (group.length === 2 && net === 0 && magnitudesAgree) {
      cancellingCount += 1;
    } else {
      survivors.push(...group);
    }
  }
  return { termCount: contributions.length, cancellingCount, survivors };
}

/**
 * The interval telescoping identity for `F(points[last]) - F(points[0])`,
 * expressed as generic contributions rather than as a hard-coded chain — the
 * adapter from THIS lesson's 1D case onto `cancelContributions`, so the same
 * engine that drives this lesson's picture is the one L34 re-runs over shared
 * interior edges instead of shared endpoints.
 */
export function intervalContributions(
  F: RealFunction,
  points: readonly number[],
): readonly SignedContribution[] {
  if (points.length < 2) {
    throw new Error("intervalContributions: need at least two points.");
  }
  const out: SignedContribution[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const lo = points[i]!;
    const hi = points[i + 1]!;
    out.push({ id: `x${i}`, sign: -1, value: F(lo), label: `F(x_{${i}})` });
    out.push({ id: `x${i + 1}`, sign: 1, value: F(hi), label: `F(x_{${i + 1}})` });
  }
  return out;
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

// v'(t) = 3.3 cos(0.55 t) - 0.35 vanishes TWICE on [0, 10]: once rising into the
// peak, once falling into the trough before the trace turns back up before the
// window closes. Exact expressions, not rounded decimals, so the two certified
// stretches this produces can share a boundary with the third instead of
// leaving an uncertified gap around the very points that matter most.
const EX_DRIVE_T1 = Math.acos(0.35 / 3.3) / 0.55;
const EX_DRIVE_T2 = (2 * Math.PI - Math.acos(0.35 / 3.3)) / 0.55;

export const EX_DRIVE: CalculusFixture = {
  id: "ex-drive",
  label: "A short drive",
  f: driveVelocity,
  domain: [0, 10],
  units: { input: "s", output: "m/s", accumulated: "m" },
  derivative: (t) => 6 * 0.55 * Math.cos(0.55 * t) - 0.35,
  antiderivative: drivePosition,
  modulus: { omega: (d) => (6 * 0.55 + 0.35) * d, label: "3.65\\delta" },
  // The second turn was missed on first writing and the fixture guard caught
  // it, which is the whole reason the declaration is checked rather than
  // trusted.
  monotoneIntervals: [
    [0, EX_DRIVE_T1],
    [EX_DRIVE_T1, EX_DRIVE_T2],
    [EX_DRIVE_T2, 10],
  ],
  turningPoints: [EX_DRIVE_T1, EX_DRIVE_T2],
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
  monotoneIntervals: [[0, 2]],
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
  // Falling to the vertex, rising away from it. Monotone on each side, and on
  // neither interval straddling zero.
  monotoneIntervals: [
    [-2, 0],
    [0, 2],
  ],
};

export const EX_CUBIC_INFLECTION: CalculusFixture = {
  id: "ex-cubic-inflection",
  label: "f(x) = x³",
  f: (x) => x * x * x,
  domain: [-1.5, 1.5],
  derivative: (x) => 3 * x * x,
  antiderivative: (x) => (x * x * x * x) / 4,
  monotone: true,
  monotoneIntervals: [[-1.5, 1.5]],
};

export const EX_DECAY: CalculusFixture = {
  id: "ex-decay",
  // Labels are shown to learners in preset buttons, which render plain text —
  // a LaTeX-looking label appeared verbatim as "e^{-t/τ}".
  label: "Exponential decay",
  f: (t) => Math.exp(-t / TAU_DECAY),
  domain: [0, 8],
  units: { input: "s", output: "V", accumulated: "V·s" },
  derivative: (t) => -Math.exp(-t / TAU_DECAY) / TAU_DECAY,
  antiderivative: (t) => -TAU_DECAY * Math.exp(-t / TAU_DECAY),
  modulus: { omega: (d) => d / TAU_DECAY, label: "\\delta/1.5" },
  monotone: true,
  monotoneIntervals: [[0, 8]],
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
  // A constant rate is monotone in the non-strict sense, and its left and right
  // sums agree: a bracket of width zero, degenerate but perfectly valid.
  monotoneIntervals: [[0, 4]],
};

/**
 * Non-monotone on its full domain — left/right sums do **not** bracket there.
 * Used to test the restriction. But it is monotone on each half, meeting at the
 * turn at pi/2, and both halves are certified: a narrowed interval inside one
 * must restore the guarantee, or the explorer's "narrow it and the guarantee
 * comes back" claim would be false for the one fixture built to exercise it.
 */
export const EX_NON_MONOTONE: CalculusFixture = {
  id: "ex-non-monotone",
  label: "A rate that rises and falls",
  f: (x) => Math.sin(x),
  domain: [0, Math.PI],
  derivative: Math.cos,
  antiderivative: (x) => -Math.cos(x),
  monotone: false,
  monotoneIntervals: [
    [0, Math.PI / 2],
    [Math.PI / 2, Math.PI],
  ],
  turningPoints: [Math.PI / 2],
};

// i'(t) = 1.92 cos(0.8 t) - 0.25 vanishes where cos(0.8 t) = 0.25 / 1.92, at two
// points on [0, 8]. Exact expressions, so the certified stretches meet exactly
// at the turn rather than leaving an uncertified gap around it.
const EX_CURRENT_T1 = Math.acos(0.25 / 1.92) / 0.8;
const EX_CURRENT_T2 = (2 * Math.PI - Math.acos(0.25 / 1.92)) / 0.8;

/** A current trace that goes negative — the transfer item's fixture. */
export const EX_CURRENT: CalculusFixture = {
  id: "ex-current",
  label: "Current against time",
  f: (t) => 2.4 * Math.sin(0.8 * t) - 0.25 * t,
  domain: [0, 8],
  units: { input: "s", output: "A", accumulated: "C" },
  antiderivative: (t) => (-2.4 / 0.8) * Math.cos(0.8 * t) - 0.125 * t * t + 3,
  monotoneIntervals: [
    [0, EX_CURRENT_T1],
    [EX_CURRENT_T1, EX_CURRENT_T2],
    [EX_CURRENT_T2, 8],
  ],
  turningPoints: [EX_CURRENT_T1, EX_CURRENT_T2],
};

// p'(t) = 18 cos(0.6 t) vanishes at 0.6 t = pi/2 and 3 pi/2, i.e. t = pi/1.2 and
// t = 2.5 pi exactly.
const EX_POWER_T1 = Math.PI / 1.2;
const EX_POWER_T2 = 2.5 * Math.PI;

export const EX_POWER: CalculusFixture = {
  id: "ex-power",
  label: "Power against time",
  f: (t) => 40 + 30 * Math.sin(0.6 * t),
  domain: [0, 8],
  units: { input: "s", output: "W", accumulated: "J" },
  antiderivative: (t) => 40 * t - (30 / 0.6) * Math.cos(0.6 * t) + 50,
  monotoneIntervals: [
    [0, EX_POWER_T1],
    [EX_POWER_T1, EX_POWER_T2],
    [EX_POWER_T2, 8],
  ],
  turningPoints: [EX_POWER_T1, EX_POWER_T2],
};

/**
 * The standing "no elementary antiderivative" counterexample (`fundamental-theorem`,
 * spine L4). The Fundamental Theorem still applies — `runningTotal`/`riemannSum`
 * compute \(\int_0^x e^{-t^2}\,dt\) numerically like any other fixture — but no
 * `antiderivative` is declared here, because none exists in closed form. That
 * absence is the content: the theorem promises existence, not a formula.
 */
export const EX_GAUSSIAN: CalculusFixture = {
  id: "ex-gaussian",
  label: "e^(-x²) — no elementary antiderivative",
  f: (x) => Math.exp(-x * x),
  domain: [0, 2],
  derivative: (x) => -2 * x * Math.exp(-x * x),
  // Strictly decreasing on [0, 2]: f'(x) = -2x e^{-x^2} < 0 for every x > 0, and
  // 0 only at the left endpoint, so the whole domain is one certified stretch.
  monotone: true,
  monotoneIntervals: [[0, 2]],
  modulus: { omega: (d) => d, label: "\\delta" },
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
  EX_GAUSSIAN,
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
    // A DECLARED monotone interval must actually be monotone. Densely sampled
    // here — not to prove the claim, which sampling cannot do, but to catch a
    // declaration that is simply wrong before it reaches a learner as a
    // "guarantee". A narrow turn this misses is a bug in the declaration; a
    // narrow turn a UI-time sample missed would be a false claim on screen.
    for (const [start, end] of fixture.monotoneIntervals ?? []) {
      if (!(start >= lo - 1e-9 && end <= hi + 1e-9 && end > start)) {
        throw new Error(
          `${fixture.id}: declared monotone interval [${start}, ${end}] is not a real sub-interval of the domain.`,
        );
      }
      if (!looksMonotoneOn(fixture.f, start, end, 4000)) {
        throw new Error(
          `${fixture.id}: declares [${start}, ${end}] monotone, and it is not.`,
        );
      }
    }
    // A DECLARED turning point must actually be one: interior to the domain,
    // numerically flat there, and a real sign change either side — otherwise
    // `describeBracketGuarantee` would tell a learner "the rate turns here" at
    // a point that does not.
    for (const t of fixture.turningPoints ?? []) {
      if (!(t > lo + 1e-9 && t < hi - 1e-9)) {
        throw new Error(`${fixture.id}: declared turning point ${t} is not interior to the domain.`);
      }
      const slope = numericDerivative(fixture.f, t);
      if (Math.abs(slope) > 1e-4) {
        throw new Error(`${fixture.id}: declared turning point ${t} has nonzero slope ${slope}.`);
      }
      const before = numericDerivative(fixture.f, t - 1e-3);
      const after = numericDerivative(fixture.f, t + 1e-3);
      if (!(before * after < 0)) {
        throw new Error(`${fixture.id}: declared turning point ${t} has no sign change either side.`);
      }
    }
    // Every declared turning point must be excluded from every declared
    // monotone interval's interior — a "certified monotone" stretch that
    // secretly contains a turn is the exact overclaim this module exists to
    // prevent.
    for (const t of fixture.turningPoints ?? []) {
      for (const [start, end] of fixture.monotoneIntervals ?? []) {
        if (t > start + 1e-9 && t < end - 1e-9) {
          throw new Error(
            `${fixture.id}: declared monotone interval [${start}, ${end}] contains turning point ${t}.`,
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
