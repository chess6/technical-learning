import { useCallback, useMemo, useState } from "react";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ProseWithMath } from "../components/lesson/ProseWithMath";
import { FunctionPlot, samplingOverlay } from "./FunctionPlot";
import { ParameterControls } from "./ParameterControls";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import {
  CALCULUS_FIXTURES,
  continuityAt,
  getCalculusFixture,
  limitFailureAt,
  oneSidedLimit,
  largestWindowFound,
  type CalculusFixture,
} from "../math";
import "./LimitsContinuityExplorer.css";

/**
 * Explorer for `limits-continuity`.
 *
 * The learner plays the tolerance game directly: pick a function and a point,
 * name a tolerance, and the explorer reports the largest window that answers it
 * — or reports honestly that none of the tested windows does.
 *
 * Two things it is careful about, because they are the lesson's content:
 *
 *  1. The reported window is **searched, not guessed**, and the readout says
 *     which of three things happened: the limit does not exist, so no window
 *     could answer any tolerance; a window was found; or **the finite search
 *     ran out** without finding one, which is not the same claim. Exhausting a
 *     ladder is not a proof — on a continuous function a window always exists,
 *     and the search can still fail for a small enough tolerance.
 *  2. The sampling panel draws its guaranteed band only when the fixture
 *     declares a modulus. On `ex-hidden-spike` — continuous, no modulus — the
 *     true curve leaves the sampled polyline's neighbourhood entirely until the
 *     spacing is reduced, which is the lesson's proof that continuity alone
 *     licenses no sampling grid.
 */

/** The fixtures this explorer offers, in teaching order. */
const OFFERED = [
  "ex-parabola",
  "ex-parabola-punctured",
  "ex-jump",
  "ex-oscillate",
  "ex-blowup",
  "ex-hidden-spike",
] as const;

const DEFAULT_FIXTURE = "ex-parabola";
const DEFAULT_AT = 1;
const DEFAULT_EPSILON = 0.5;
const DEFAULT_SPACING = 1;

const EPSILON_MIN = 1e-3;
const EPSILON_MAX = 2;

function fmt(n: number, places = 3): string {
  const r = Number(n.toFixed(places));
  return Object.is(r, -0) ? "0" : String(r);
}

/** Where each fixture's interesting point is, so the picker lands somewhere useful. */
const FOCUS: Record<string, number> = {
  "ex-parabola": 1,
  "ex-parabola-punctured": 3,
  "ex-jump": 1,
  "ex-oscillate": 0,
  "ex-blowup": 0,
  "ex-hidden-spike": 4.5,
};

export function LimitsContinuityExplorer() {
  const [fixtureId, setFixtureId] = useState<string>(DEFAULT_FIXTURE);
  const [at, setAt] = useState(DEFAULT_AT);
  const [epsilon, setEpsilon] = useState(DEFAULT_EPSILON);
  const [spacing, setSpacing] = useState(DEFAULT_SPACING);
  const [showTable, setShowTable] = useState(false);
  const [showSampling, setShowSampling] = useState(false);

  const fixture: CalculusFixture = useMemo(
    () => getCalculusFixture(fixtureId),
    [fixtureId],
  );

  const pickFixture = useCallback((id: string) => {
    setFixtureId(id);
    setAt(FOCUS[id] ?? 0);
  }, []);

  const reset = useCallback(() => {
    setFixtureId(DEFAULT_FIXTURE);
    setAt(DEFAULT_AT);
    setEpsilon(DEFAULT_EPSILON);
    setSpacing(DEFAULT_SPACING);
    setShowTable(false);
    setShowSampling(false);
  }, []);

  /** The candidate the neighbours force, taken from the right-hand approach. */
  const candidate = useMemo(() => {
    const failure = limitFailureAt(fixture, at);
    if (failure !== null) return null;
    return oneSidedLimit(fixture.f, at, 1);
  }, [fixture, at]);

  const search = useMemo(() => {
    if (candidate === null) return null;
    const [lo, hi] = fixture.domain;
    return largestWindowFound(fixture.f, at, candidate, epsilon, {
      maxDelta: Math.min(1, (hi - lo) / 4),
    });
  }, [fixture, at, candidate, epsilon]);
  const foundDelta = search?.kind === "found" ? search.delta : null;

  const verdict = continuityAt(fixture, at);
  const failure = limitFailureAt(fixture, at);

  const overlay = useMemo(
    () =>
      showSampling
        ? samplingOverlay(fixture, fixture.domain[0], fixture.domain[1], spacing)
        : null,
    [showSampling, fixture, spacing],
  );

  const table = useMemo(() => {
    if (!showTable) return [];
    return [0.5, 0.25, 0.1, 0.05, 0.01].map((h) => ({
      h,
      left: fixture.f(at - h),
      right: fixture.f(at + h),
    }));
  }, [showTable, fixture, at]);

  return (
    <ExplorationPanel
      explorationId="limits-continuity"
      title="Answer a tolerance with a window"
      description="Name how close the outputs must stay. The explorer searches for a window that delivers it — and tells you honestly when none does."
    >
      <PresetPicker
        label="Function"
        activeId={fixtureId}
        presets={OFFERED.map((id) => ({
          id,
          label: CALCULUS_FIXTURES.find((f) => f.id === id)!.label,
          onSelect: () => pickFixture(id),
        }))}
      />

      <FunctionPlot
        fixture={fixture}
        ariaLabel={`${fixture.label}, with a tolerance band and an input window at x = ${fmt(at)}`}
        at={at}
        band={candidate === null ? undefined : { target: candidate, epsilon }}
        window={foundDelta === null ? undefined : { delta: foundDelta }}
        sampling={showSampling ? { spacing } : undefined}
        height={320}
      />

      <ParameterControls
        controls={[
          {
            id: "at",
            label: "Point a",
            value: at,
            min: fixture.domain[0],
            max: fixture.domain[1],
            step: 0.05,
            onChange: setAt,
          },
          {
            id: "epsilon",
            label: "Tolerance ε",
            value: epsilon,
            min: EPSILON_MIN,
            max: EPSILON_MAX,
            step: 0.001,
            onChange: setEpsilon,
          },
          ...(showSampling
            ? [
                {
                  id: "spacing",
                  label: "Grid spacing",
                  value: spacing,
                  min: 0.02,
                  max: 2,
                  step: 0.01,
                  onChange: setSpacing,
                },
              ]
            : []),
        ]}
      />

      <SceneReadout
        items={[
          {
            id: "forced",
            label: "Forced value",
            value:
              candidate === null
                ? `none — ${failure ?? "no limit"}`
                : fmt(candidate),
          },
          {
            id: "window",
            label: "Largest window found",
            value:
              candidate === null
                ? "—"
                : foundDelta === null
                  ? "none on the search ladder"
                  : `δ = ${fmt(foundDelta, 4)}`,
          },
          {
            // Three outcomes, not two. "The search ran out" is a statement about
            // the search, not about the mathematics, and saying otherwise let
            // this panel report a continuous point as having no guarantee.
            id: "guarantee",
            label: "Guarantee",
            value:
              candidate === null
                ? `no limit — ${failure ?? "none"}`
                : foundDelta !== null
                  ? "met"
                  : "not found at this search depth — try a larger ε",
          },
          { id: "value", label: "f(a) exists", value: verdict.valueExists ? "yes" : "no" },
          { id: "limit", label: "Limit exists", value: verdict.limitExists ? "yes" : "no" },
          { id: "agree", label: "They agree", value: verdict.agree ? "yes" : "no" },
          {
            id: "continuous",
            label: "Continuous at a",
            value: verdict.continuous ? "yes" : "no",
          },
        ]}
      />

      <ExplorationToggles
        toggles={[
          {
            id: "table",
            label: "Show the shrinking-interval table",
            checked: showTable,
            onChange: setShowTable,
          },
          {
            id: "sampling",
            label: "Sample it",
            checked: showSampling,
            onChange: setShowSampling,
          },
        ]}
      />

      {showTable && (
        <table className="limits-explorer__table">
          <caption>Values on either side, as the step shrinks</caption>
          <thead>
            <tr>
              <th scope="col">step h</th>
              <th scope="col">f(a − h)</th>
              <th scope="col">f(a + h)</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row) => (
              <tr key={row.h}>
                <td>{row.h}</td>
                <td>{Number.isFinite(row.left) ? fmt(row.left, 4) : "—"}</td>
                <td>{Number.isFinite(row.right) ? fmt(row.right, 4) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {overlay && (
        <SceneReadout
          title="Sampling"
          items={[
            {
              id: "spacing",
              label: "Spacing actually used",
              value: fmt(overlay.actualSpacing, 4),
            },
            {
              id: "band",
              label: "Guaranteed band over one step",
              value:
                overlay.guaranteedBand === null
                  ? "none — this function declares no modulus"
                  : `± ${fmt(overlay.guaranteedBand, 4)}`,
            },
            {
              id: "gap",
              label: "Worst true-vs-sampled gap",
              value: fmt(overlay.worstGap, 4),
            },
          ]}
        />
      )}

      {overlay && overlay.guaranteedBand === null && (
        <ProseWithMath
          className="limits-explorer__note"
          text={
            "This function is continuous, and the samples still tell you nothing about the gaps: the worst discrepancy above is what a straight line between two samples misses. Continuity fixes no window width. Narrow the spacing and watch the gap close — but notice that nothing except *measuring* told you when to stop."
          }
        />
      )}

      <ResetButton onReset={reset} />
    </ExplorationPanel>
  );
}
