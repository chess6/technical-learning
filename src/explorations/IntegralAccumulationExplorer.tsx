import { useCallback, useMemo, useState } from "react";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ProseWithMath } from "../components/lesson/ProseWithMath";
import { AccumulationStrip, strips, stripLabel } from "./AccumulationStrip";
import { ParameterControls } from "./ParameterControls";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import {
  CALCULUS_FIXTURES,
  accumulatedUnits,
  bracketReport,
  getCalculusFixture,
  refinementTable,
  riemannSum,
  type CalculusFixture,
  type SamplePoint,
} from "../math";
import "./IntegralAccumulationExplorer.css";

/**
 * Explorer for `integral-accumulation`.
 *
 * The learner does the construction: pick a rate, chop it, choose where to
 * sample, and watch the sum settle. Three things it is careful about, because
 * each is a claim the lesson makes:
 *
 *  1. **The units are derived, not captioned.** `accumulatedUnits` throws for a
 *     fixture that declares no axis units, so a unit string on screen is always
 *     one the fixture actually earns. Change the fixture and the readout changes
 *     with it — that is the "one machine, four meters" content, made operable.
 *  2. **Bracketing is reported only where it holds.** The readout says
 *     `brackets: no` on the non-monotone rate rather than quietly drawing bars,
 *     and names monotonicity as the missing hypothesis. The lesson ships a graded
 *     item on exactly this, so the explorer must not contradict it.
 *  3. **No antiderivative** (package ledger check P1). Every number here comes
 *     from `riemannSum` or `refinementTable`. Several of the offered fixtures
 *     declare a closed-form antiderivative and this module never reads one; the
 *     next lesson's corroboration is only evidence if these two routes are
 *     genuinely independent.
 */

/** The fixtures this explorer offers, in teaching order. */
const OFFERED = [
  "ex-drive",
  "ex-constant-rate",
  "ex-parabola",
  "ex-non-monotone",
  "ex-current",
  "ex-power",
] as const;

const DEFAULT_FIXTURE = "ex-drive";
const DEFAULT_N = 4;
const DEFAULT_SAMPLE: SamplePoint = "right";

/** n is log-stepped: the interesting refinements are multiplicative. */
const N_LADDER = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512] as const;

const SAMPLES: readonly { id: SamplePoint; label: string }[] = [
  { id: "left", label: "Left end" },
  { id: "right", label: "Right end" },
  { id: "mid", label: "Midpoint" },
];

function fmt(n: number, places = 3): string {
  if (!Number.isFinite(n)) return "—";
  const r = Number(n.toFixed(places));
  return Object.is(r, -0) ? "0" : String(r);
}

export function IntegralAccumulationExplorer() {
  const [fixtureId, setFixtureId] = useState<string>(DEFAULT_FIXTURE);
  const fixture: CalculusFixture = useMemo(
    () => getCalculusFixture(fixtureId),
    [fixtureId],
  );

  const [a, setA] = useState(fixture.domain[0]);
  const [b, setB] = useState(fixture.domain[1]);
  const [rung, setRung] = useState(N_LADDER.indexOf(DEFAULT_N));
  const [sample, setSample] = useState<SamplePoint>(DEFAULT_SAMPLE);
  const [showTable, setShowTable] = useState(false);
  const [showSymbolic, setShowSymbolic] = useState(false);
  const [showRunning, setShowRunning] = useState(false);
  const [runningAt, setRunningAt] = useState(fixture.domain[1]);

  const n = N_LADDER[Math.min(Math.max(rung, 0), N_LADDER.length - 1)]!;

  const pick = useCallback((id: string) => {
    const next = getCalculusFixture(id);
    setFixtureId(id);
    setA(next.domain[0]);
    setB(next.domain[1]);
    setRunningAt(next.domain[1]);
    setRung(N_LADDER.indexOf(DEFAULT_N));
  }, []);

  const reset = useCallback(() => {
    const start = getCalculusFixture(DEFAULT_FIXTURE);
    setFixtureId(DEFAULT_FIXTURE);
    setA(start.domain[0]);
    setB(start.domain[1]);
    setRunningAt(start.domain[1]);
    setRung(N_LADDER.indexOf(DEFAULT_N));
    setSample(DEFAULT_SAMPLE);
    setShowTable(false);
    setShowSymbolic(false);
    setShowRunning(false);
  }, []);

  const hi = Math.max(b, a + 1e-6);

  /**
   * ONE effective right-hand endpoint, clamped to the interval, used for both the
   * geometry and the readout.
   *
   * Moving `a` or `b` does not move `runningAt`, so the stored value can end up
   * outside `[a, b]`. Previously the readout computed and labelled `A(x)` at that
   * stale value while the plotted marker was clamped to the drawn curve — the
   * number on screen and the point on screen were answers to different questions.
   * Deriving both from one clamped value makes that disagreement unrepresentable.
   */
  const effectiveRunningAt = Math.min(Math.max(runningAt, a), hi);

  const sum = useMemo(
    () => riemannSum(fixture.f, a, hi, n, sample),
    [fixture, a, hi, n, sample],
  );

  /**
   * The value the sums are closing on, produced by the same summation route at a
   * fine partition. It is the reference the bracket is checked against, and it is
   * never a closed-form shortcut.
   */
  const fine = useMemo(
    () => riemannSum(fixture.f, a, hi, 4096, "mid"),
    [fixture, a, hi],
  );

  const bracket = useMemo(
    () => bracketReport(fixture, a, hi, n, fine),
    [fixture, a, hi, n, fine],
  );

  const units = fixture.units ? accumulatedUnits(fixture) : null;

  const runningValue = useMemo(
    () =>
      riemannSum(fixture.f, a, Math.max(effectiveRunningAt, a + 1e-9), 2048, "mid"),
    [fixture, a, effectiveRunningAt],
  );

  const table = useMemo(
    () =>
      showTable
        ? refinementTable(fixture.f, a, hi, [1, 2, 4, 8, 16, 64, 256], sample)
        : [],
    [showTable, fixture, a, hi, sample],
  );

  /**
   * The first and last rectangles' products, spelled out.
   *
   * Both, not just the first: "every rectangle is its own product" is the point,
   * and one example cannot make it. They live in the readout because the plot has
   * no room for two labels side by side.
   */
  const products = useMemo(() => {
    const bars = strips(fixture, a, hi, n, sample);
    if (bars.length === 0) return null;
    const first = stripLabel(fixture, bars[0]!);
    const last = bars.length > 1 ? stripLabel(fixture, bars[bars.length - 1]!) : null;
    return first === null ? null : { first, last };
  }, [fixture, a, hi, n, sample]);

  /** What to do, phrased for whatever is on screen now. */
  const instruction = showRunning
    ? "**Drag the gold point on the lower panel** to move the right-hand end, and watch $A(x)$ read out. The total has its own vertical scale, because it is a different quantity in different units. Where does it climb fastest? Where does it turn?"
    : n < 8
      ? "**Drag the two gold points on the axis** to move the interval's ends, then raise **Refinement step**. Each rectangle is a *product* — a rate times a duration — and the readout spells the first one out, in units. Watch the sum settle as the pieces get shorter."
      : "Now compare the sample points. **Left end**, **right end**, and **midpoint** give different sums at this $n$ — and the same limit. On a monotone rate the left and right sums bracket the answer; try *A rate that rises and falls* and watch the bracket fail.";

  return (
    <ExplorationPanel
      explorationId="integral-accumulation"
      title="Chop it yourself"
      description="Cut the interval, multiply on each piece, add — and refine until the total stops moving."
      summary={instruction}
      toolbar={
        <>
          <PresetPicker
            label="Rate"
            activeId={fixtureId}
            presets={OFFERED.map((id) => ({
              id,
              label: CALCULUS_FIXTURES.find((f) => f.id === id)!.label,
              onSelect: () => pick(id),
            }))}
          />
          <PresetPicker
            label="Sample point"
            activeId={sample}
            presets={SAMPLES.map((s) => ({
              id: s.id,
              label: s.label,
              onSelect: () => setSample(s.id),
            }))}
          />
          <ResetButton onReset={reset} />
        </>
      }
      controls={
        <>
          <ParameterControls
            title="The interval, and how finely you cut it"
            controls={[
              {
                id: "a",
                label: "Start a",
                value: a,
                min: fixture.domain[0],
                max: hi - 0.1,
                step: 0.05,
                onChange: setA,
              },
              {
                id: "b",
                label: "End b",
                value: b,
                min: a + 0.1,
                max: fixture.domain[1],
                step: 0.05,
                onChange: setB,
              },
              {
                // Log-stepped: the slider moves over the rungs of the ladder,
                // not over n itself, so its travel is spent where refinement is
                // visible. It is labelled for what it controls — a slider
                // labelled "Pieces n" while displaying the rung index 2 was
                // simply lying about its own value.
                id: "n",
                label: "Refinement step",
                value: rung,
                min: 0,
                max: N_LADDER.length - 1,
                step: 1,
                onChange: setRung,
              },
              ...(showRunning
                ? [
                    {
                      id: "runningAt",
                      label: "Right-hand end x",
                      value: effectiveRunningAt,
                      min: a,
                      max: hi,
                      step: 0.05,
                      onChange: setRunningAt,
                    },
                  ]
                : []),
            ]}
          />
          <ExplorationToggles
            toggles={[
              {
                id: "running",
                label: "Show the running total A(x)",
                checked: showRunning,
                onChange: setShowRunning,
              },
              {
                id: "table",
                label: "Show the sum table against n",
                checked: showTable,
                onChange: setShowTable,
              },
              {
                id: "symbolic",
                label: "Show the symbolic definition",
                checked: showSymbolic,
                onChange: setShowSymbolic,
              },
            ]}
          />
        </>
      }
      readout={
        <>
          <SceneReadout
            items={[
              { id: "pieces", label: "Pieces n", value: String(n) },
              {
                id: "sum",
                label: "Riemann sum",
                value: units === null ? fmt(sum) : `${fmt(sum)} ${units}`,
              },
              {
                id: "units",
                label: "Units, from the axes",
                value:
                  fixture.units === null || fixture.units === undefined
                    ? "this rate declares no axis units"
                    : `(${fixture.units.output})(${fixture.units.input}) = ${units}`,
              },
              { id: "left", label: "Left sum", value: fmt(bracket.left) },
              { id: "right", label: "Right sum", value: fmt(bracket.right) },
              {
                // Two rows, not one. They come apart exactly where the lesson
                // is pointing: on a rate that turns, the pair can still straddle
                // the answer by luck, and calling that a bracket would teach the
                // very over-generalization the recognition item catches.
                id: "straddles",
                label: "Left and right straddle it?",
                value: bracket.straddles
                  ? `yes — width ${fmt(bracket.width, 4)}`
                  : `no — both are on the same side, width ${fmt(bracket.width, 4)}`,
              },
              {
                id: "guaranteed",
                label: "Guaranteed to?",
                value: bracket.guaranteed
                  ? "yes — the rate is monotone on this interval"
                  : "no — the rate turns here, so any straddle is luck",
              },
              ...(showRunning
                ? [
                    {
                      id: "running",
                      label: `A(${fmt(effectiveRunningAt, 2)})`,
                      value:
                        units === null
                          ? fmt(runningValue)
                          : `${fmt(runningValue)} ${units}`,
                    },
                  ]
                : []),
            ]}
          />

          {products && (
            <SceneReadout
              title="Rectangles, spelled out"
              items={[
                { id: "first", label: "First (rate)(width)", value: products.first },
                ...(products.last
                  ? [{ id: "last", label: "Last (rate)(width)", value: products.last }]
                  : []),
              ]}
            />
          )}

          {!bracket.guaranteed && (
            <ProseWithMath
              className="integral-explorer__note"
              text={
                "The rate **turns** on this interval, so the left and right sums guarantee nothing — even if they happen to land either side of the answer at this $n$, which they sometimes do. Bracketing is a consequence of the rate being *monotone*, not of the sum being a Riemann sum, which is why the picture shows no bars here. Narrow the interval to a stretch where the rate only rises, or only falls, and they come back."
              }
            />
          )}

          {showTable && (
            <table className="integral-explorer__table">
              <caption>The sum as the pieces get shorter</caption>
              <thead>
                <tr>
                  <th scope="col">n</th>
                  <th scope="col">sum</th>
                  <th scope="col">change</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row: { n: number; sum: number }, i: number) => (
                  <tr key={row.n}>
                    <td>{row.n}</td>
                    <td>{fmt(row.sum, 4)}</td>
                    <td>{i === 0 ? "—" : fmt(row.sum - table[i - 1]!.sum, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {showSymbolic && (
            <ProseWithMath
              className="integral-explorer__note"
              text={`$$\\int_{${fmt(a, 2)}}^{${fmt(hi, 2)}} f(x)\\,dx \\;=\\; \\lim_{\\text{mesh}\\to0}\\ \\sum_{i=1}^{n} f(x_i^*)\\,\\Delta x_i \\;\\approx\\; ${fmt(fine, 4)}$$\n\nThe value on the right was produced by the **same** construction at a much finer partition — 4096 pieces, midpoint sampled. It is a better estimate, not a different kind of thing.`}
            />
          )}
        </>
      }
    >
      <AccumulationStrip
        fixture={fixture}
        interval={[a, hi]}
        n={n}
        sample={sample}
        showRunningTotal={showRunning}
        runningAt={showRunning ? effectiveRunningAt : undefined}
        onDragRightEndpoint={showRunning ? setRunningAt : undefined}
        onDragInterval={(which, x) => {
          // Each end is clamped away from the other, so a drag can never invert
          // the interval or collapse it to a point.
          if (which === "a") setA(Math.min(x, b - 0.1));
          else setB(Math.max(x, a + 0.1));
        }}
        domain={fixture.domain}
        bracket={{ value: fine }}
        labelStrips={n <= 8 ? 1 : 0}
        height={340}
        ariaLabel={`${fixture.label}, cut into ${n} pieces sampled at the ${sample} of each`}
      />
    </ExplorationPanel>
  );
}
