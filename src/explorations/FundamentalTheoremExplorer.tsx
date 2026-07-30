import { useCallback, useMemo, useState } from "react";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ProseWithMath } from "../components/lesson/ProseWithMath";
import { AccumulationStrip } from "./AccumulationStrip";
import { TelescopingCancellation } from "./TelescopingCancellation";
import { ParameterControls } from "./ParameterControls";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import {
  cancelContributions,
  getCalculusFixture,
  intervalContributions,
  numericDerivative,
  partitionPoints,
  residual,
  riemannSum,
  type CalculusFixture,
} from "../math";
import "./FundamentalTheoremExplorer.css";

/**
 * Explorer for `fundamental-theorem` (spine L4). Initialized from
 * `ex-parabola` on $[0, 2]$ — L3's own corroboration case.
 *
 * **Honesty obligations this file keeps:**
 *
 *  1. **The two computations stay independent.** `fineSum` comes from
 *     `riemannSum` alone; `bracketValue` comes from the fixture's declared
 *     `antiderivative` alone. Neither reads the other, so their agreement (or
 *     `ex-gaussian`'s refusal to produce one at all) is real evidence.
 *  2. **`ex-gaussian` offers no bracket value.** Its `antiderivative` is
 *     undefined, and the readout says so rather than inventing one — the
 *     explorer-side twin of clip 2's `not-a-recipe` beat.
 *  3. **The cancellation display is the GENERIC engine**
 *     (`intervalContributions` + `cancelContributions`), the same one
 *     `greens-theorem` reuses over shared interior edges — never a hard-coded
 *     "first and last" assumption.
 */

const OFFERED = ["ex-parabola", "ex-drive", "ex-decay", "ex-cubic-inflection", "ex-gaussian"] as const;

const DEFAULT_FIXTURE = "ex-parabola";
const DEFAULT_N = 8;
const FINE_N = 4096;

function fmt(n: number | null, places = 4): string {
  if (n === null || !Number.isFinite(n)) return "—";
  const r = Number(n.toFixed(places));
  return Object.is(r, -0) ? "0" : String(r);
}

export function FundamentalTheoremExplorer() {
  const [fixtureId, setFixtureId] = useState<string>(DEFAULT_FIXTURE);
  const fixture: CalculusFixture = useMemo(() => getCalculusFixture(fixtureId), [fixtureId]);

  const [a, setA] = useState(fixture.domain[0]);
  const [b, setB] = useState(fixture.domain[1]);
  const [n, setN] = useState(DEFAULT_N);
  const [unequal, setUnequal] = useState(true);
  const [c, setC] = useState(0);
  const [runningLimitA, setRunningLimitA] = useState(fixture.domain[0]);
  const [runningAt, setRunningAt] = useState(fixture.domain[1]);
  const [showCancellation, setShowCancellation] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSideBySide, setShowSideBySide] = useState(false);

  const hi = Math.max(b, a + 1e-6);
  const partitionKind = unequal ? "unequal" : "equal";

  const pick = useCallback((id: string) => {
    const next = getCalculusFixture(id);
    setFixtureId(id);
    setA(next.domain[0]);
    setB(next.domain[1]);
    setRunningLimitA(next.domain[0]);
    setRunningAt(next.domain[1]);
  }, []);

  const reset = useCallback(() => {
    const start = getCalculusFixture(DEFAULT_FIXTURE);
    setFixtureId(DEFAULT_FIXTURE);
    setA(start.domain[0]);
    setB(start.domain[1]);
    setN(DEFAULT_N);
    setUnequal(true);
    setC(0);
    setRunningLimitA(start.domain[0]);
    setRunningAt(start.domain[1]);
    setShowCancellation(false);
    setShowError(false);
    setShowSideBySide(false);
  }, []);

  /** The refined Riemann sum — the same route as every other lesson's number. */
  const fineSum = useMemo(
    () => riemannSum(fixture.f, a, hi, FINE_N, "mid"),
    [fixture, a, hi],
  );

  /** `F(b) - F(a)`, with `+C` applied to both — never read by `fineSum`. */
  const bracketValue = useMemo(() => {
    if (!fixture.antiderivative) return null;
    return fixture.antiderivative(hi) + c - (fixture.antiderivative(a) + c);
  }, [fixture, a, hi, c]);

  const difference = bracketValue === null ? null : bracketValue - fineSum;

  const points = useMemo(
    () => partitionPoints(a, hi, n, partitionKind),
    [a, hi, n, partitionKind],
  );

  const contributions = useMemo(() => {
    if (!fixture.antiderivative) return null;
    const F = fixture.antiderivative;
    return intervalContributions((x) => F(x) + c, points);
  }, [fixture, c, points]);

  const cancellation = useMemo(
    () => (contributions ? cancelContributions(contributions) : null),
    [contributions],
  );

  /** The first few pieces' errors: `E_i = [F(x_{i+1}) - F(x_i)] - f(x_i) Δx_i`. */
  const errors = useMemo(() => {
    if (!fixture.antiderivative) return null;
    const F = fixture.antiderivative;
    const out: { i: number; dx: number; e: number }[] = [];
    for (let i = 0; i < Math.min(points.length - 1, 6); i += 1) {
      const x0 = points[i]!;
      const dx = points[i + 1]! - x0;
      out.push({ i, dx, e: residual(F, x0, fixture.f(x0), dx) });
    }
    return out;
  }, [fixture, points]);

  const effectiveRunningAt = Math.min(Math.max(runningAt, runningLimitA), fixture.domain[1]);
  const A = useCallback(
    (x: number) => riemannSum(fixture.f, runningLimitA, Math.max(x, runningLimitA + 1e-9), 2000, "mid"),
    [fixture, runningLimitA],
  );
  const slopeOfA = useMemo(
    () => numericDerivative(A, effectiveRunningAt),
    [A, effectiveRunningAt],
  );

  return (
    <ExplorationPanel
      explorationId="fundamental-theorem"
      title="Two computations, one number"
      description="Chop it, add it, refine it — and check the sum against the antiderivative bracket."
      summary="**Drag the two gold points on the axis** to choose the interval, then toggle equal/unequal pieces and watch the survivor count stay 2 either way. Then try `e^(-x²)` — the bracket has nothing to read, and only the sum still answers."
      toolbar={
        <>
          <PresetPicker
            label="Integrand"
            activeId={fixtureId}
            presets={OFFERED.map((id) => ({
              id,
              label: getCalculusFixture(id).label,
              onSelect: () => pick(id),
            }))}
          />
          <ResetButton onReset={reset} />
        </>
      }
      controls={
        <>
          <ParameterControls
            title="The interval, its pieces, and F"
            controls={[
              { id: "a", label: "Start a", value: a, min: fixture.domain[0], max: hi - 0.1, step: 0.05, onChange: setA },
              { id: "b", label: "End b", value: b, min: a + 0.1, max: fixture.domain[1], step: 0.05, onChange: setB },
              { id: "n", label: "Pieces n", value: n, min: 2, max: 256, step: 1, onChange: (v) => setN(Math.round(v)) },
              { id: "c", label: "Constant C added to F", value: c, min: -5, max: 5, step: 0.25, onChange: setC },
              {
                id: "runningLimitA",
                label: "Lower limit of A(x)",
                value: runningLimitA,
                min: fixture.domain[0],
                max: fixture.domain[1] - 0.1,
                step: 0.05,
                onChange: setRunningLimitA,
              },
              {
                id: "runningAt",
                label: "A evaluated at x",
                value: effectiveRunningAt,
                min: runningLimitA,
                max: fixture.domain[1],
                step: 0.05,
                onChange: setRunningAt,
              },
            ]}
          />
          <ExplorationToggles
            toggles={[
              { id: "unequal", label: "Unequal partition", checked: unequal, onChange: setUnequal },
              { id: "cancellation", label: "Show the cancellation term by term", checked: showCancellation, onChange: setShowCancellation },
              { id: "error", label: "Show the error E_i on each piece", checked: showError, onChange: setShowError },
              { id: "sideBySide", label: "Show the two computations side by side", checked: showSideBySide, onChange: setShowSideBySide },
            ]}
          />
        </>
      }
      readout={
        <>
          <SceneReadout
            title="The theorem's own readout"
            items={[
              {
                id: "bracket",
                label: "F(b) − F(a)",
                value: bracketValue === null ? "no closed form — F has none for this integrand" : fmt(bracketValue),
              },
              { id: "sum", label: "Refined Riemann sum", value: fmt(fineSum) },
              {
                id: "difference",
                label: "Their difference",
                value: difference === null ? "— (nothing to compare)" : fmt(difference, 6),
              },
              {
                id: "survivors",
                label: "Survivors from the cancellation",
                value: cancellation === null ? "— (no F to telescope)" : String(cancellation.survivors.length),
              },
              {
                id: "A",
                label: `A(${fmt(effectiveRunningAt, 2)})`,
                value: fmt(A(effectiveRunningAt)),
              },
              {
                id: "slope",
                label: "A'(x), numerically",
                value: `${fmt(slopeOfA)} vs f(x) = ${fmt(fixture.f(effectiveRunningAt))}`,
              },
            ]}
          />

          {showSideBySide && (
            <ProseWithMath
              className="ftc-explorer__note"
              text={
                bracketValue === null
                  ? "This integrand declares no antiderivative, so there is only one route to a number here — the sum. That is exactly `not-a-recipe`'s point: the theorem promises existence, not a formula."
                  : "Two routes that never call each other: the sum chops and adds the rate; the bracket evaluates a stated antiderivative at the two ends. Agreement between them is independent corroboration, not circularity — because neither computation consulted the other."
              }
            />
          )}

          {showCancellation && contributions && (
            <TelescopingCancellation
              contributions={contributions}
              title={`The identity, over ${n} ${unequal ? "unequal" : "equal"} pieces`}
            />
          )}
          {showCancellation && !contributions && (
            <ProseWithMath
              className="ftc-explorer__note"
              text="No antiderivative, no telescoping identity to show — the cancellation is a statement about F, and this integrand has none in closed form."
            />
          )}

          {showError && errors && (
            <table className="ftc-explorer__table">
              <caption>The local-linear error on the first pieces</caption>
              <thead>
                <tr>
                  <th scope="col">i</th>
                  <th scope="col">Δx_i</th>
                  <th scope="col">E_i</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((row) => (
                  <tr key={row.i}>
                    <td>{row.i}</td>
                    <td>{fmt(row.dx, 4)}</td>
                    <td>{fmt(row.e, 6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {showError && !errors && (
            <ProseWithMath
              className="ftc-explorer__note"
              text="No antiderivative, no local-linear error to report against — E_i is defined relative to F."
            />
          )}
        </>
      }
    >
      <AccumulationStrip
        fixture={fixture}
        interval={[a, hi]}
        n={n}
        sample="left"
        partitionKind={partitionKind}
        domain={fixture.domain}
        onDragInterval={(which, x) => (which === "a" ? setA(x) : setB(x))}
        ariaLabel={`${fixture.label}, cut into ${n} ${partitionKind} pieces`}
      />
    </ExplorationPanel>
  );
}
