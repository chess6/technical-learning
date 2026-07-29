import { useCallback, useMemo, useState } from "react";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ProseWithMath } from "../components/lesson/ProseWithMath";
import {
  LocalLinearityZoom,
  magnificationCeiling,
  zoomReadouts,
} from "./LocalLinearityZoom";
import { ParameterControls } from "./ParameterControls";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import {
  CALCULUS_FIXTURES,
  getCalculusFixture,
  numericDerivative,
  type CalculusFixture,
} from "../math";
import "./DerivativeLocalLinearityExplorer.css";

/**
 * Explorer for `derivative-local-linearity`.
 *
 * The learner drives the magnification and the step, and watches the two
 * readouts that carry the lesson: the residual `E(h)`, which never reaches
 * zero on a curved fixture, and the ratio `E(h)/h`, which does.
 *
 * Two things it is careful about:
 *
 *  1. **The magnification is capped, and the cap is stated on screen.** Past the
 *     fixture's sampling floor the picture would be an artefact of the sampling
 *     rather than of the function, and silently clamping would let the learner
 *     believe they had zoomed further than they had.
 *  2. **The comparison slope is opt-in and measured.** With it on, the learner
 *     sees one error ratio tend to zero and the other tend to a nonzero
 *     constant — the criterion that actually singles the tangent out.
 */

const OFFERED = [
  "ex-parabola",
  "ex-cubic-inflection",
  "ex-decay",
  "ex-abs",
] as const;

const DEFAULT_FIXTURE = "ex-parabola";
const BASE_HALF_WIDTH = 1;
const MAX_MAGNIFICATION = magnificationCeiling(BASE_HALF_WIDTH, 1e-4);

/** Where each fixture is worth looking, so the picker lands somewhere useful. */
const FOCUS: Record<string, number> = {
  "ex-parabola": 1.4,
  "ex-cubic-inflection": 0,
  "ex-decay": 2,
  "ex-abs": 0,
};

function fmt(n: number, places = 4): string {
  if (!Number.isFinite(n)) return "—";
  if (n !== 0 && Math.abs(n) < 1e-3) return n.toExponential(2);
  const r = Number(n.toFixed(places));
  return Object.is(r, -0) ? "0" : String(r);
}

export function DerivativeLocalLinearityExplorer() {
  const [fixtureId, setFixtureId] = useState<string>(DEFAULT_FIXTURE);
  const [at, setAt] = useState(FOCUS[DEFAULT_FIXTURE]!);
  const [magnification, setMagnification] = useState(1);
  const [h, setH] = useState(0.5);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonSlope, setComparisonSlope] = useState(0);
  const [showDerivative, setShowDerivative] = useState(false);

  const fixture: CalculusFixture = useMemo(
    () => getCalculusFixture(fixtureId),
    [fixtureId],
  );

  const trueSlope = useMemo(
    () =>
      fixture.derivative ? fixture.derivative(at) : numericDerivative(fixture.f, at),
    [fixture, at],
  );

  const pick = useCallback((id: string) => {
    setFixtureId(id);
    setAt(FOCUS[id] ?? 0);
    setMagnification(1);
  }, []);

  const reset = useCallback(() => {
    setFixtureId(DEFAULT_FIXTURE);
    setAt(FOCUS[DEFAULT_FIXTURE]!);
    setMagnification(1);
    setH(0.5);
    setShowComparison(false);
    setComparisonSlope(0);
    setShowDerivative(false);
  }, []);

  const r = useMemo(
    () =>
      zoomReadouts(
        fixture,
        at,
        h,
        showComparison ? trueSlope + comparisonSlope : undefined,
      ),
    [fixture, at, h, showComparison, comparisonSlope, trueSlope],
  );

  const atCeiling = magnification >= MAX_MAGNIFICATION;
  const differentiableHere = !(fixture.nonDifferentiable ?? []).some(
    (p) => Math.abs(p - at) < 1e-9,
  );

  return (
    <ExplorationPanel
      explorationId="derivative-local-linearity"
      title="Zoom until it is a line"
      description="Magnify about the point and watch the curve straighten — and watch the gap that is still there."
    >
      <PresetPicker
        label="Function"
        activeId={fixtureId}
        presets={OFFERED.map((id) => ({
          id,
          label: CALCULUS_FIXTURES.find((f) => f.id === id)!.label,
          onSelect: () => pick(id),
        }))}
      />

      <LocalLinearityZoom
        fixture={fixture}
        at={at}
        magnification={magnification}
        h={h}
        showSecant
        comparisonSlope={
          showComparison ? trueSlope + comparisonSlope : undefined
        }
        baseHalfWidth={BASE_HALF_WIDTH}
        ariaLabel={`${fixture.label}, magnified ${Math.round(magnification)} times about x = ${fmt(at, 2)}`}
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
            id: "magnification",
            label: "Magnification",
            value: magnification,
            min: 1,
            max: MAX_MAGNIFICATION,
            step: 1,
            onChange: setMagnification,
          },
          {
            id: "h",
            label: "Step h",
            value: h,
            min: 0.0001,
            max: 1,
            step: 0.0001,
            onChange: setH,
          },
          ...(showComparison
            ? [
                {
                  id: "comparison",
                  label: "Comparison slope, offset from f′(a)",
                  value: comparisonSlope,
                  min: -2,
                  max: 2,
                  step: 0.1,
                  onChange: setComparisonSlope,
                },
              ]
            : []),
        ]}
      />

      <SceneReadout
        items={[
          {
            id: "secant",
            label: "Secant slope over h",
            value: r.secantSlope === null ? "—" : fmt(r.secantSlope),
          },
          {
            id: "slope",
            label: differentiableHere ? "f′(a)" : "f′(a)",
            value: differentiableHere
              ? fmt(r.slope)
              : "does not exist — the one-sided slopes differ",
          },
          {
            id: "estimate",
            label: "Linear estimate f(a) + f′(a)h",
            value: r.estimate === null ? "—" : fmt(r.estimate),
          },
          {
            id: "actual",
            label: "True f(a + h)",
            value: r.actual === null ? "—" : fmt(r.actual),
          },
          {
            id: "residual",
            label: "Residual E(h)",
            value: r.residual === null ? "—" : fmt(r.residual),
          },
          {
            // The readout that carries C5. It is listed last and named as the
            // ratio, because it is the one that goes to zero while E(h) does not.
            id: "ratio",
            label: "E(h) / h",
            value: r.residualRatio === null ? "—" : fmt(r.residualRatio),
          },
          ...(showComparison
            ? [
                {
                  id: "comparison-ratio",
                  label: "E(h) / h for the comparison line",
                  value:
                    r.comparisonResidualRatio === null
                      ? "—"
                      : fmt(r.comparisonResidualRatio),
                },
              ]
            : []),
        ]}
      />

      <ExplorationToggles
        toggles={[
          {
            id: "comparison",
            label: "Compare against a line of another slope",
            checked: showComparison,
            onChange: setShowComparison,
          },
          {
            id: "derivative",
            label: "Show f′ as a function",
            checked: showDerivative,
            onChange: setShowDerivative,
          },
        ]}
      />

      {atCeiling && (
        <ProseWithMath
          className="derivative-explorer__note"
          text={`Magnification is capped at ${MAX_MAGNIFICATION.toLocaleString()}×. Past this the window is narrower than the resolution the curve is sampled at, so the picture would show the sampling rather than the function. The cap is stated rather than applied silently.`}
        />
      )}

      {showComparison && (
        <ProseWithMath
          className="derivative-explorer__note"
          text={
            "Shrink $h$ and watch the two ratios. The tangent's $E(h)/h$ goes to zero; the comparison line's settles on a nonzero number — the difference between the two slopes. *That* is what singles the tangent out, not touching the curve once."
          }
        />
      )}

      {showDerivative && (
        <SceneReadout
          title="f′ sampled across the domain"
          items={[0.25, 0.5, 0.75].map((t) => {
            const x =
              fixture.domain[0] + (fixture.domain[1] - fixture.domain[0]) * t;
            return {
              id: `dv-${t}`,
              label: `f′(${fmt(x, 2)})`,
              value: fmt(numericDerivative(fixture.f, x)),
            };
          })}
        />
      )}

      <ResetButton onReset={reset} />
    </ExplorationPanel>
  );
}
