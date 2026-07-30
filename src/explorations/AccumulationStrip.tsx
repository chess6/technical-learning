import { useMemo } from "react";
import { Line, MovablePoint, Plot, Polygon, Point, Text } from "mafs";
import { MafsSceneShell, niceStep, type MafsViewBox } from "./MafsSceneShell";
import {
  accumulatedUnits,
  bracketReport,
  partitionPoints,
  runningTotal,
  type CalculusFixture,
  type SamplePoint,
} from "../math";
import "./AccumulationStrip.css";

/**
 * The `accumulation-strip` visualization family.
 *
 * Built once, parameterized, and reused by `integral-accumulation` (which
 * creates it), `fundamental-theorem`, `integration-technique`, `improper-and-numerical`,
 * and `line-integrals` — see
 * `docs/courses/applied-mathematics/curriculum-architecture.md` §5.
 *
 * **The honesty rules it enforces structurally**, because each is a claim made
 * to a learner rather than a styling choice:
 *
 *  1. **Every rectangle is a product, and says so.** Its height is a sampled
 *     value of the rate and its width is a duration; `stripLabel` composes the
 *     unit string from the fixture's own declared axes, so a rectangle can never
 *     be captioned in units the fixture did not declare. A fixture with no
 *     declared units gets no unit label rather than a guessed one.
 *  2. **Negative contributions are drawn below the axis in the violation role**,
 *     never mirrored into a positive bar. "The integral is signed" is the
 *     lesson's retained result; a picture that hid the sign would contradict it.
 *  3. **Left/right bracketing is drawn only when it is true.** `brackets` is
 *     computed from the sums, not assumed from being a Riemann sum, so on a
 *     non-monotone rate the bracket bars are simply absent.
 *  4. **The running total is the partial sums**, from `runningTotal` — never a
 *     closed-form antiderivative. `integral-accumulation` ships before the
 *     Fundamental Theorem exists, and the independence of the two routes is what
 *     makes the next lesson's corroboration real evidence.
 */

export interface AccumulationStripProps {
  readonly fixture: CalculusFixture;
  /** The interval being accumulated over. Defaults to the fixture's domain. */
  readonly interval?: readonly [number, number];
  readonly n: number;
  readonly sample?: SamplePoint;
  /** Equal-width pieces by default; `"unequal"` for `fundamental-theorem`'s toggle. */
  readonly partitionKind?: "equal" | "unequal";

  readonly viewBox?: MafsViewBox;
  readonly height?: number;
  readonly ariaLabel: string;

  /** Draw the running total A(x) as a second trace on the same axes. */
  readonly showRunningTotal?: boolean;
  /** Mark A at this input — the "current right endpoint" readout's companion. */
  readonly runningAt?: number;
  /** Drag the right endpoint of the running total. */
  readonly onDragRightEndpoint?: (x: number) => void;
  /**
   * Drag the interval's own ends, on the axis.
   *
   * Without an interactive element the plot is a picture, and a learner who
   * clicks it — the obvious thing to do with a graph — gets no response and
   * concludes the explorer is broken. The handles are constrained to the axis
   * and to the fixture's domain, so dragging can only ever choose an interval.
   */
  readonly onDragInterval?: (which: "a" | "b", x: number) => void;
  /** The fixture domain the interval handles are clamped to. */
  readonly domain?: readonly [number, number];

  /**
   * Draw the left and right sums as horizontal bars — but only where the
   * bracketing GUARANTEE applies, i.e. where the rate is monotone. A pair that
   * happens to straddle on a rate that turns is luck, and drawing it would teach
   * that left/right sums bracket in general.
   */
  readonly bracket?: { readonly value: number };
  /**
   * Label at most this many rectangles with their product (0 = none).
   *
   * Two adjacent labels do not fit: a product like "(-7.62 m/s)(2.5 s) = -19.06 m"
   * is wider than the rectangle it belongs to at any partition worth drawing, and
   * four of them overprinted into an unreadable band. The explorer's readout
   * carries the rest, where there is room for them.
   */
  readonly labelStrips?: number;
}

const CURVE = "var(--role-original, #7eb8d4)";
const RESULT = "var(--role-result, #7fd4a8)";
const VIOLATION = "var(--role-violation, #f26e5c)";
const TOTAL = "var(--role-transformed, #d4a574)";
const INK = "var(--role-intermediate, #9aa6b5)";
const HANDLE = "var(--role-selected, #ecd484)";

export interface Strip {
  readonly lo: number;
  readonly hi: number;
  readonly at: number;
  readonly height: number;
  readonly width: number;
  readonly contribution: number;
}

/**
 * The rectangles, as data.
 *
 * Exported and pure because jsdom renders no Mafs children (the canvas measures
 * zero width), so a test of this function is the only test of what gets drawn.
 */
export function strips(
  fixture: CalculusFixture,
  a: number,
  b: number,
  n: number,
  sample: SamplePoint = "right",
  partitionKind: "equal" | "unequal" = "equal",
): readonly Strip[] {
  const points = partitionPoints(a, b, n, partitionKind);
  const out: Strip[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const lo = points[i]!;
    const hi = points[i + 1]!;
    const at = sample === "left" ? lo : sample === "right" ? hi : (lo + hi) / 2;
    const height = fixture.f(at);
    out.push({ lo, hi, at, height, width: hi - lo, contribution: height * (hi - lo) });
  }
  return out;
}

/**
 * The product label for one rectangle: `(height)(width) = contribution`, with
 * units taken from the fixture's own declared axes.
 *
 * Returns `null` when the fixture declares no units — a rectangle with invented
 * units would be a false claim, and the whole lesson turns on the units being
 * real.
 */
export function stripLabel(fixture: CalculusFixture, strip: Strip): string | null {
  const units = fixture.units;
  if (!units) return null;
  const h = Number(strip.height.toFixed(2));
  const w = Number(strip.width.toFixed(2));
  const c = Number(strip.contribution.toFixed(2));
  return `(${h} ${units.output})(${w} ${units.input}) = ${c} ${accumulatedUnits(fixture)}`;
}

/**
 * A vertical frame that actually contains what is drawn.
 *
 * Mafs auto-fits when no `y` is given, and an auto-fit over a viewBox with only
 * `x` set left the rate drawn as near-vertical strokes off the top and bottom of
 * the panel. The frame always includes zero, because every rectangle is measured
 * from the axis and an axis off-screen makes the picture unreadable.
 */
export function verticalFrame(
  values: readonly number[],
  pad = 0.15,
): [number, number] {
  const finite = values.filter((v) => Number.isFinite(v));
  const lo = Math.min(0, ...finite);
  const hi = Math.max(0, ...finite);
  const span = Math.max(hi - lo, 1e-6);
  return [lo - span * pad, hi + span * pad];
}

export function AccumulationStrip({
  fixture,
  interval,
  n,
  sample = "right",
  partitionKind = "equal",
  viewBox,
  height = 340,
  ariaLabel,
  showRunningTotal = false,
  runningAt,
  onDragRightEndpoint,
  bracket,
  labelStrips = 0,
  onDragInterval,
  domain,
}: AccumulationStripProps) {
  const [a, b] = interval ?? fixture.domain;

  const bars = useMemo(
    () => strips(fixture, a, b, n, sample, partitionKind),
    [fixture, a, b, n, sample, partitionKind],
  );

  const totals = useMemo(
    () => (showRunningTotal ? runningTotal(fixture.f, a, b, Math.max(n, 48), "mid") : null),
    [showRunningTotal, fixture, a, b, n],
  );

  /**
   * Bracket bars, drawn only where the guarantee holds. On a rate that rises and
   * falls the bars vanish even if the two sums happen to straddle the value —
   * which is the content of the lesson's `bracket` beat, not a rendering bug.
   */
  const bracketBars = useMemo(() => {
    if (!bracket) return null;
    const report = bracketReport(fixture, a, b, n, bracket.value);
    if (!report.guaranteed || !report.straddles) return null;
    return { lo: report.lo, hi: report.hi };
  }, [bracket, fixture, a, b, n]);

  const runningValue = useMemo(() => {
    if (runningAt === undefined || totals === null) return null;
    let best = totals[0]!;
    for (const entry of totals) {
      if (entry.x <= runningAt) best = entry;
    }
    return best;
  }, [runningAt, totals]);

  /** The rate's own frame, sampled from the fixture over the shown interval. */
  const rateFrame = useMemo(() => {
    const samples: number[] = [];
    for (let i = 0; i <= 240; i += 1) samples.push(fixture.f(a + ((b - a) * i) / 240));
    for (const bar of bars) samples.push(bar.height);
    return verticalFrame(samples);
  }, [fixture, a, b, bars]);

  /** The total's own frame — a different quantity, in different units. */
  const totalFrame = useMemo(
    // A wider pad than the rate panel: this one is short, and at 0.15 the
    // bottom tick label was drawn half outside the panel.
    () => (totals === null ? null : verticalFrame(totals.map((t) => t.total), 0.25)),
    [totals],
  );

  const ratePlot = (
    <MafsSceneShell
      ariaLabel={ariaLabel}
      height={totals ? Math.round(height * 0.58) : height}
      viewBox={viewBox ?? { x: [a, b], y: rateFrame }}
      xStep={niceStep(b - a)}
      yStep={niceStep(rateFrame[1] - rateFrame[0])}
    >
      {/* The rectangles. Positive above the axis, negative below — never mirrored. */}
      {bars.map((bar) => (
        <Polygon
          key={`strip-${bar.lo}`}
          points={[
            [bar.lo, 0],
            [bar.hi, 0],
            [bar.hi, bar.height],
            [bar.lo, bar.height],
          ]}
          color={bar.contribution < 0 ? VIOLATION : RESULT}
          fillOpacity={0.22}
          weight={1.5}
        />
      ))}

      {/* Product labels, on the first few rectangles only — every rectangle
          labelled at n = 64 is unreadable, and an unreadable label teaches
          nothing. The explorer's readout carries the rest. */}
      {bars.slice(0, labelStrips).map((bar) => {
        const label = stripLabel(fixture, bar);
        return label === null ? null : (
          <Text
            key={`label-${bar.lo}`}
            x={(bar.lo + bar.hi) / 2}
            y={bar.height}
            attach={bar.height < 0 ? "s" : "n"}
            color={bar.contribution < 0 ? VIOLATION : RESULT}
            size={13}
          >
            {label}
          </Text>
        );
      })}

      {/* The rate itself — always the real sampled fixture. */}
      <Plot.OfX y={(x) => fixture.f(x)} color={CURVE} minSamplingDepth={7} />

      {/* The interval's ends, draggable along the axis. */}
      {onDragInterval &&
        (["a", "b"] as const).map((which) => {
          const [dLo, dHi] = domain ?? fixture.domain;
          const here = which === "a" ? a : b;
          return (
            <MovablePoint
              key={`end-${which}`}
              point={[here, 0]}
              color={HANDLE}
              constrain={([x]) => [Math.min(Math.max(x, dLo), dHi), 0]}
              onMove={([x]) =>
                onDragInterval(which, Math.min(Math.max(x, dLo), dHi))
              }
            />
          );
        })}
    </MafsSceneShell>
  );

  /**
   * The total gets its OWN panel and its own vertical scale.
   *
   * The rate and its total are different quantities in different units — metres
   * per second and metres. Drawing them on one axis would either flatten the rate
   * to a line or push the total off the panel, and would quietly assert that the
   * two are comparable heights. They are not.
   */
  const totalPlot =
    totals === null || totalFrame === null ? null : (
      <MafsSceneShell
        ariaLabel={`The running total accumulated from ${a.toFixed(2)}, on its own vertical scale`}
        height={Math.round(height * 0.42)}
        viewBox={{ x: [a, b], y: totalFrame }}
        xStep={niceStep(b - a)}
        yStep={niceStep(totalFrame[1] - totalFrame[0], 4)}
      >
        {totals.slice(0, -1).map((entry, i) => {
          const next = totals[i + 1]!;
          return (
            <Line.Segment
              key={`total-${entry.x}`}
              point1={[entry.x, entry.total]}
              point2={[next.x, next.total]}
              color={TOTAL}
            />
          );
        })}
        {bracketBars && (
          <>
            <Line.Segment
              point1={[a, bracketBars.lo]}
              point2={[b, bracketBars.lo]}
              color={INK}
              style="dashed"
            />
            <Line.Segment
              point1={[a, bracketBars.hi]}
              point2={[b, bracketBars.hi]}
              color={INK}
              style="dashed"
            />
          </>
        )}
        {runningValue &&
          (onDragRightEndpoint ? (
            // Constrained to the running-total trace: dragging chooses a right
            // endpoint, and the height is whatever the accumulated total is
            // there. It can never move the total itself.
            <MovablePoint
              point={[runningValue.x, runningValue.total]}
              color={HANDLE}
              constrain={([x]) => {
                const clamped = Math.min(Math.max(x, a), b);
                let best = totals[0]!;
                for (const entry of totals) {
                  if (entry.x <= clamped) best = entry;
                }
                return [clamped, best.total];
              }}
              onMove={([x]) => onDragRightEndpoint(Math.min(Math.max(x, a), b))}
            />
          ) : (
            <Point x={runningValue.x} y={runningValue.total} color={TOTAL} />
          ))}
      </MafsSceneShell>
    );

  return (
    <div className="accumulation-strip">
      {ratePlot}
      {totalPlot}
    </div>
  );
}
