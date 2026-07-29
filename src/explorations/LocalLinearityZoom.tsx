import { useMemo } from "react";
import { FunctionPlot } from "./FunctionPlot";
import {
  differenceQuotient,
  numericDerivative,
  residual,
  type CalculusFixture,
} from "../math";

/**
 * The `local-linearity-zoom` visualization family.
 *
 * A magnified window on a fixture, with the tangent (and optionally a
 * deliberately wrong slope) drawn through the point. Built for
 * `derivative-local-linearity`; reused by `chain-rule` as two linked panels and
 * by `partial-derivatives-gradient` one dimension up.
 *
 * **The family's honesty rule, enforced structurally.** There is no code path
 * that substitutes a straight line for the curve: `zoomWindow` returns only a
 * *viewBox*, and the curve is always drawn by `FunctionPlot` from
 * `fixture.f`. A zoom that faked straightness would teach that the curve *is*
 * straight at high magnification — misconception M4, and the package's declared
 * principal risk (ledger check P3). The residual is a computed quantity that
 * callers are expected to display, and `zoomReadouts` never reports it as zero
 * for a curved fixture.
 */

/** How far the window is magnified, and what it therefore shows. */
export interface ZoomWindow {
  readonly x: readonly [number, number];
  readonly y: readonly [number, number];
  /** Half-width in input units — the honest measure of "how far in are we?". */
  readonly halfWidth: number;
}

/**
 * The viewBox for a magnification `m` about `a`.
 *
 * `m = 1` shows `baseHalfWidth` either side; each doubling halves it. The
 * vertical extent is derived from the horizontal one **through the fixture's own
 * slope**, so the curve keeps its true aspect and a steep function does not
 * flatten merely because the window narrowed.
 */
export function zoomWindow(
  fixture: CalculusFixture,
  a: number,
  magnification: number,
  baseHalfWidth = 1,
): ZoomWindow {
  if (!(magnification >= 1)) {
    throw new Error(`zoomWindow: magnification must be >= 1, got ${magnification}.`);
  }
  const halfWidth = baseHalfWidth / magnification;
  const slope = fixture.derivative
    ? fixture.derivative(a)
    : numericDerivative(fixture.f, a);
  // Enough vertical room for the tangent to traverse the window, plus headroom
  // so the residual is visible rather than pressed against the edge.
  const halfHeight = Math.max(Math.abs(slope) * halfWidth * 1.6, halfWidth * 0.6);
  const y0 = fixture.f(a);
  return {
    x: [a - halfWidth, a + halfWidth],
    y: [y0 - halfHeight, y0 + halfHeight],
    halfWidth,
  };
}

/**
 * The magnification beyond which the fixture's own sampling resolution would
 * start to lie, so a caller can cap the control **and say so on screen** rather
 * than silently clamping.
 */
export function magnificationCeiling(baseHalfWidth = 1, floor = 1e-4): number {
  return baseHalfWidth / floor;
}

export interface ZoomReadouts {
  readonly value: number;
  readonly slope: number;
  /** The secant slope over the current step, or `null` when the step is zero. */
  readonly secantSlope: number | null;
  /** The linear model's prediction a step ahead. */
  readonly estimate: number | null;
  /** The function's true value a step ahead. */
  readonly actual: number | null;
  /** `E(h)` — never reported as zero for a curved fixture. */
  readonly residual: number | null;
  /** `E(h)/h` — the readout that carries "vanishes faster than the step". */
  readonly residualRatio: number | null;
  /** The same, for a comparison slope the learner chose. */
  readonly comparisonResidualRatio: number | null;
}

export function zoomReadouts(
  fixture: CalculusFixture,
  a: number,
  h: number,
  comparisonSlope?: number,
): ZoomReadouts {
  const slope = fixture.derivative
    ? fixture.derivative(a)
    : numericDerivative(fixture.f, a);
  const value = fixture.f(a);
  if (h === 0) {
    return {
      value,
      slope,
      secantSlope: null,
      estimate: null,
      actual: null,
      residual: null,
      residualRatio: null,
      comparisonResidualRatio: null,
    };
  }
  const e = residual(fixture.f, a, slope, h);
  return {
    value,
    slope,
    secantSlope: differenceQuotient(fixture.f, a, h),
    estimate: value + slope * h,
    actual: fixture.f(a + h),
    residual: e,
    residualRatio: e / h,
    comparisonResidualRatio:
      comparisonSlope === undefined
        ? null
        : residual(fixture.f, a, comparisonSlope, h) / h,
  };
}

export interface LocalLinearityZoomProps {
  readonly fixture: CalculusFixture;
  readonly at: number;
  readonly magnification: number;
  /** Step used for the secant and the residual. */
  readonly h?: number;
  /** A deliberately wrong slope, drawn for comparison. */
  readonly comparisonSlope?: number;
  readonly showSecant?: boolean;
  readonly baseHalfWidth?: number;
  readonly height?: number;
  readonly ariaLabel: string;
}

export function LocalLinearityZoom({
  fixture,
  at,
  magnification,
  h,
  comparisonSlope,
  showSecant = false,
  baseHalfWidth = 1,
  height = 320,
  ariaLabel,
}: LocalLinearityZoomProps) {
  const win = useMemo(
    () => zoomWindow(fixture, at, magnification, baseHalfWidth),
    [fixture, at, magnification, baseHalfWidth],
  );
  const slope = useMemo(
    () =>
      fixture.derivative ? fixture.derivative(at) : numericDerivative(fixture.f, at),
    [fixture, at],
  );

  return (
    <FunctionPlot
      fixture={fixture}
      ariaLabel={ariaLabel}
      viewBox={{ x: [win.x[0], win.x[1]], y: [win.y[0], win.y[1]], padding: 0 }}
      at={at}
      tangent={{ slope, compare: comparisonSlope }}
      secant={showSecant && h !== undefined && h !== 0 ? { h } : undefined}
      height={height}
      showCoordinates={false}
    />
  );
}
