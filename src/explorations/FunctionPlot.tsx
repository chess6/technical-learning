import { useMemo } from "react";
import { Circle, Line, Plot, Point, Text } from "mafs";
import { MafsSceneShell, type MafsViewBox } from "./MafsSceneShell";
import {
  differenceQuotient,
  linearModel,
  partitionPoints,
  samplingGap,
  type CalculusFixture,
} from "../math";
import "./FunctionPlot.css";

/**
 * The `function-plot` visualization family.
 *
 * Built once, parameterized, and reused by seven lessons of the
 * applied-mathematics course (see
 * `docs/courses/applied-mathematics/curriculum-architecture.md` §5). Every
 * overlay is opt-in, so a lesson asks for exactly the apparatus its insight
 * needs and nothing else:
 *
 * | Overlay | First used by | For |
 * | --- | --- | --- |
 * | `band` + `window` | `limits-continuity` | the tolerance guarantee |
 * | `punctured` | `limits-continuity` | "the point never votes" |
 * | `sampling` | `limits-continuity` | continuity is **local**: a grid, its polyline, and — only when a modulus is supplied — the guaranteed band |
 * | `secant` / `tangent` | `derivative-local-linearity` | rate = slope = approximation |
 * | `derivativePanel` | `derivative-local-linearity` | \(f'\) as a function |
 *
 * **Honesty rules this component enforces structurally**, because they are
 * learner-facing claims rather than styling:
 *
 *  1. The curve is always sampled from the fixture. There is no code path that
 *     substitutes a straight line for it, at any magnification.
 *  2. A punctured point is drawn as an open circle and the curve is split there,
 *     so the deleted value cannot be read off the stroke.
 *  3. The guaranteed sampling band is drawn **only** when the fixture declares a
 *     modulus of continuity. Continuity alone licenses no such band, and the
 *     component will not invent one.
 */

const CURVE_SAMPLES = 480;

export interface FunctionPlotProps {
  readonly fixture: CalculusFixture;
  /** Overrides the fixture's own domain, e.g. while zooming. */
  readonly viewBox?: MafsViewBox;
  readonly height?: number;
  readonly ariaLabel: string;

  /** The point under discussion. */
  readonly at?: number;

  /** Horizontal tolerance band of half-height `epsilon` about `target`. */
  readonly band?: { readonly target: number; readonly epsilon: number };
  /** Vertical input window of half-width `delta` about `at`. */
  readonly window?: { readonly delta: number };

  /** Secant through `(at, f(at))` and `(at + h, f(at + h))`. */
  readonly secant?: { readonly h: number };
  /** Tangent, or any comparison line, through `(at, f(at))`. */
  readonly tangent?: { readonly slope: number; readonly compare?: number };

  /**
   * Sampling overlay: a grid of the given spacing, the straight-line
   * interpolation through the samples, and the guaranteed band **iff** the
   * fixture declares a modulus.
   */
  readonly sampling?: { readonly spacing: number };

  readonly showCoordinates?: boolean;
}

const INK = "var(--role-intermediate, #9aa6b5)";
const CURVE = "var(--role-original, #7eb8d4)";
const BAND = "var(--role-selected, #e8d48a)";
const TANGENT = "var(--role-transformed, #d4a574)";
const SECANT = "var(--role-basis-2, #b89ad4)";
const COMPARE = "var(--role-violation, #f26e5c)";
const SAMPLE = "var(--role-target, #2fc7b8)";

/**
 * Contiguous stretches of the domain, split at every punctured point.
 *
 * Exported and pure so the "the curve is split at a hole" rule is testable in
 * jsdom, where Mafs measures a zero-width canvas and renders no SVG children.
 * The component has no other way to decide what to plot, so a test of this
 * function is a test of the rendering.
 */
export function curveSegments(
  fixture: CalculusFixture,
  lo: number,
  hi: number,
): readonly (readonly [number, number])[] {
  const holes = (fixture.punctured ?? [])
    .filter((p) => p > lo && p < hi)
    .slice()
    .sort((a, b) => a - b);
  if (holes.length === 0) return [[lo, hi]];
  const gap = (hi - lo) / CURVE_SAMPLES;
  const out: [number, number][] = [];
  let start = lo;
  for (const hole of holes) {
    out.push([start, hole - gap]);
    start = hole + gap;
  }
  out.push([start, hi]);
  return out.filter(([a, b]) => b > a);
}

export function FunctionPlot({
  fixture,
  viewBox,
  height = 320,
  ariaLabel,
  at,
  band,
  window: inputWindow,
  secant,
  tangent,
  sampling,
  showCoordinates = true,
}: FunctionPlotProps) {
  const [lo, hi] = viewBox?.x ?? fixture.domain;

  const pieces = useMemo(() => curveSegments(fixture, lo, hi), [fixture, lo, hi]);

  const overlay = useMemo(
    () => (sampling ? samplingOverlay(fixture, lo, hi, sampling.spacing) : null),
    [sampling, fixture, lo, hi],
  );
  const samplePoints = overlay?.samples ?? null;

  const y0 = at === undefined ? undefined : fixture.f(at);

  return (
    <MafsSceneShell
      ariaLabel={ariaLabel}
      height={height}
      viewBox={viewBox ?? { x: [lo, hi], padding: 0.35 }}
      showCoordinates={showCoordinates}
    >
      {/* The tolerance band: a horizontal strip the outputs must stay inside. */}
      {band && (
        <>
          <Line.Segment
            point1={[lo, band.target + band.epsilon]}
            point2={[hi, band.target + band.epsilon]}
            color={BAND}
            style="dashed"
          />
          <Line.Segment
            point1={[lo, band.target - band.epsilon]}
            point2={[hi, band.target - band.epsilon]}
            color={BAND}
            style="dashed"
          />
        </>
      )}

      {/* The input window: the region the definition is allowed to consult. */}
      {inputWindow && at !== undefined && (
        <>
          <Line.Segment
            point1={[at - inputWindow.delta, -1e4]}
            point2={[at - inputWindow.delta, 1e4]}
            color={BAND}
            opacity={0.5}
          />
          <Line.Segment
            point1={[at + inputWindow.delta, -1e4]}
            point2={[at + inputWindow.delta, 1e4]}
            color={BAND}
            opacity={0.5}
          />
        </>
      )}

      {/* The sampled polyline, and the guaranteed band only if one is earned. */}
      {samplePoints && (
        <>
          {samplePoints.slice(0, -1).map(([x, y], i) => {
            const next = samplePoints[i + 1]!;
            return (
              <Line.Segment
                key={`poly-${x}`}
                point1={[x, y]}
                point2={[next[0], next[1]]}
                color={SAMPLE}
                style="dashed"
                opacity={0.9}
              />
            );
          })}
          {samplePoints.map(([x, y]) => (
            <Point key={`sample-${x}`} x={x} y={y} color={SAMPLE} />
          ))}
          {overlay?.guaranteedBand !== null &&
            overlay !== null &&
            samplePoints.slice(0, -1).map(([x, y], i) => {
              const next = samplePoints[i + 1]!;
              const bound = overlay.guaranteedBand!;
              return (
                <g key={`guarantee-${x}`}>
                  <Line.Segment
                    point1={[x, y + bound]}
                    point2={[next[0], next[1] + bound]}
                    color={SAMPLE}
                    opacity={0.35}
                  />
                  <Line.Segment
                    point1={[x, y - bound]}
                    point2={[next[0], next[1] - bound]}
                    color={SAMPLE}
                    opacity={0.35}
                  />
                </g>
              );
            })}
        </>
      )}

      {/* The curve itself — always the real sampled fixture, split at holes. */}
      {pieces.map(([a, b]) => (
        <Plot.OfX
          key={`curve-${a}-${b}`}
          y={(x) => (x >= a && x <= b ? fixture.f(x) : NaN)}
          color={CURVE}
          minSamplingDepth={7}
        />
      ))}

      {/* A punctured point is an open circle, never a filled one. */}
      {(fixture.punctured ?? [])
        .filter((p) => p >= lo && p <= hi)
        .map((p) => (
          <Circle
            key={`hole-${p}`}
            center={[p, fixture.f(p)]}
            radius={(hi - lo) / 90}
            color={CURVE}
            fillOpacity={0}
            weight={2}
          />
        ))}

      {secant && at !== undefined && y0 !== undefined && secant.h !== 0 && (
        <Line.ThroughPoints
          point1={[at, y0]}
          point2={[at + secant.h, fixture.f(at + secant.h)]}
          color={SECANT}
          style="dashed"
        />
      )}

      {tangent && at !== undefined && y0 !== undefined && (
        <>
          <Line.ThroughPoints
            point1={[at, y0]}
            point2={[at + 1, linearModel(fixture.f, at, tangent.slope)(1)]}
            color={TANGENT}
          />
          {tangent.compare !== undefined && (
            <Line.ThroughPoints
              point1={[at, y0]}
              point2={[at + 1, linearModel(fixture.f, at, tangent.compare)(1)]}
              color={COMPARE}
              style="dashed"
              opacity={0.85}
            />
          )}
        </>
      )}

      {at !== undefined && y0 !== undefined && Number.isFinite(y0) && (
        <Point x={at} y={y0} color={INK} />
      )}

      {band && (
        <Text x={hi} y={band.target + band.epsilon} attach="nw" color={BAND} size={14}>
          ε
        </Text>
      )}
    </MafsSceneShell>
  );
}

export interface SamplingOverlay {
  readonly samples: readonly (readonly [number, number])[];
  /**
   * Half-height of the band the fixture's modulus guarantees over one grid
   * step, or **`null` when the fixture declares no modulus**.
   *
   * This null is the component's structural enforcement of the lesson's
   * continuity correction: continuity alone licenses no sampling claim, so
   * there is no code path by which a band can be drawn for a fixture that has
   * not earned one. The component reads this value and nothing else.
   */
  readonly guaranteedBand: number | null;
  /**
   * The worst true-vs-interpolated discrepancy on this grid — the number that
   * makes `ex-hidden-spike` a demonstration rather than an assertion.
   */
  readonly worstGap: number;
}

export function samplingOverlay(
  fixture: CalculusFixture,
  lo: number,
  hi: number,
  spacing: number,
): SamplingOverlay {
  if (!(spacing > 0)) {
    throw new Error(`samplingOverlay: spacing must be positive, got ${spacing}.`);
  }
  const count = Math.max(1, Math.round((hi - lo) / spacing));
  const samples = partitionPoints(lo, hi, count).map(
    (x) => [x, fixture.f(x)] as [number, number],
  );
  return {
    samples,
    guaranteedBand: fixture.modulus ? fixture.modulus.omega(spacing) : null,
    worstGap: samplingGap(fixture.f, [lo, hi], (hi - lo) / count),
  };
}

/**
 * The readouts a lesson displays beside the plot. Pure, so the numbers a learner
 * reads are testable without rendering.
 */
export interface FunctionPlotReadouts {
  readonly value: number | null;
  readonly secantSlope: number | null;
  readonly residual: number | null;
  readonly residualRatio: number | null;
}

export function functionPlotReadouts(
  fixture: CalculusFixture,
  at: number,
  options: { readonly h?: number; readonly slope?: number } = {},
): FunctionPlotReadouts {
  const punctured = (fixture.punctured ?? []).some(
    (p) => Math.abs(p - at) < 1e-12,
  );
  const value = punctured ? null : fixture.f(at);
  const h = options.h;
  const secantSlope =
    h === undefined || h === 0 ? null : differenceQuotient(fixture.f, at, h);
  const slope = options.slope;
  if (slope === undefined || h === undefined || h === 0 || value === null) {
    return { value, secantSlope, residual: null, residualRatio: null };
  }
  const e = fixture.f(at + h) - linearModel(fixture.f, at, slope)(h);
  return { value, secantSlope, residual: e, residualRatio: e / h };
}
