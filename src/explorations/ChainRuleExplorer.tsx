import { useCallback, useMemo, useState } from "react";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ProseWithMath } from "../components/lesson/ProseWithMath";
import { LocalLinearityZoom, magnificationCeiling } from "./LocalLinearityZoom";
import { ParameterControls } from "./ParameterControls";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import { numericDerivative, slopeAt, type CalculusFixture } from "../math";
import "./ChainRuleExplorer.css";

/**
 * Explorer for `chain-rule` (spine L5). Two linked `local-linearity-zoom`
 * panels — L2's own family, reused exactly as its module docstring
 * anticipates — one for `g`, one for `f`, sharing a single magnification
 * control so the compound-magnification story (insight §C11) stays visible
 * as one lever rather than two independently fiddled ones.
 *
 * **Honesty obligations this file keeps:**
 *
 *  1. **The chain-rule value and the direct numeric derivative of `f∘g` are
 *     computed independently.** The chain-rule readout multiplies `f'(g(a))`
 *     and `g'(a)`; the corroboration readout differentiates the composite
 *     function directly, never consulting the other route. Their agreement
 *     (or, for the corner preset, the direct route standing alone) is real
 *     corroboration — the same discipline `FundamentalTheoremExplorer` keeps
 *     for its two computations of an integral.
 *  2. **A corner in `g` is never silently smoothed over.** `slopeAt`'s
 *     discriminated result is read directly (never `numericDerivative`, which
 *     would fabricate a slope at `ex-abs`'s vertex); when `g` has no single
 *     slope at `a`, the chain-rule readout says so explicitly rather than
 *     omitting a number, and the direct corroboration readout is what shows
 *     the composite may still be differentiable there.
 */

interface CompositePair {
  readonly id: string;
  readonly label: string;
  readonly g: CalculusFixture;
  readonly f: CalculusFixture;
  readonly a: number;
}

const G_MAIN: CalculusFixture = {
  id: "chain-g-main",
  label: "g(x) = x² + 1",
  f: (x) => x * x + 1,
  domain: [-2, 3],
  derivative: (x) => 2 * x,
};
const F_MAIN: CalculusFixture = {
  id: "chain-f-main",
  label: "f(u) = u³",
  f: (u) => u * u * u,
  domain: [-3, 10],
  derivative: (u) => 3 * u * u,
};

/** g'(a) = 0 at a = 2: the chain rule's answer (0) needs no special case. */
const G_ZERO: CalculusFixture = {
  id: "chain-g-zero",
  label: "g(x) = (x − 2)²",
  f: (x) => (x - 2) * (x - 2),
  domain: [0, 4],
  derivative: (x) => 2 * (x - 2),
};
const F_ZERO: CalculusFixture = {
  id: "chain-f-zero",
  label: "f(u) = u³ + 3u + 5",
  f: (u) => u * u * u + 3 * u + 5,
  domain: [-3, 3],
  derivative: (u) => 3 * u * u + 3,
};

/** g = |x| (a corner at 0) composed inside f(u) = u²: the composite is x², smooth. */
const G_CORNER: CalculusFixture = {
  id: "chain-g-corner",
  label: "g(x) = |x|",
  f: Math.abs,
  domain: [-2, 2],
  nonDifferentiable: [0],
};
const F_CORNER: CalculusFixture = {
  id: "chain-f-corner",
  label: "f(u) = u²",
  f: (u) => u * u,
  domain: [-2, 2],
  derivative: (u) => 2 * u,
};

const PAIRS: readonly CompositePair[] = [
  { id: "main", label: "The worked example", g: G_MAIN, f: F_MAIN, a: 1 },
  { id: "zero", label: "g′(a) = 0", g: G_ZERO, f: F_ZERO, a: 2 },
  { id: "corner", label: "g has a corner at a", g: G_CORNER, f: F_CORNER, a: 0 },
];

const DEFAULT_PAIR = "main";
const BASE_HALF_WIDTH = 1.4;
const MAX_MAGNIFICATION = magnificationCeiling(BASE_HALF_WIDTH, 1e-4);

function fmt(n: number | null, places = 4): string {
  if (n === null || !Number.isFinite(n)) return "—";
  const r = Number(n.toFixed(places));
  return Object.is(r, -0) ? "0" : String(r);
}

export function ChainRuleExplorer() {
  const [pairId, setPairId] = useState<string>(DEFAULT_PAIR);
  const [magnification, setMagnification] = useState(1);
  const [showRepair, setShowRepair] = useState(false);

  const pair = useMemo(
    () => PAIRS.find((p) => p.id === pairId) ?? PAIRS[0]!,
    [pairId],
  );
  const a = pair.a;
  const b = pair.g.f(a);

  const gSlope = useMemo(() => slopeAt(pair.g, a), [pair, a]);
  const fSlope = useMemo(() => slopeAt(pair.f, b), [pair, b]);

  /** The chain-rule value — null when g has no single slope at a. */
  const chainRuleValue =
    gSlope.kind === "differentiable" && fSlope.kind === "differentiable"
      ? fSlope.slope * gSlope.slope
      : null;

  /**
   * The composite, differentiated DIRECTLY and numerically — never reading
   * `chainRuleValue`. This is the independent corroboration: for the corner
   * preset it is the ONLY route to a number, and it is real evidence that the
   * chain rule's hypothesis (both pieces differentiable) is sufficient, not
   * necessary.
   */
  const composite = useCallback((x: number) => pair.f.f(pair.g.f(x)), [pair]);
  const directDerivative = useMemo(
    () => numericDerivative(composite, a),
    [composite, a],
  );

  const pick = useCallback((id: string) => {
    setPairId(id);
    setMagnification(1);
  }, []);

  const reset = useCallback(() => {
    setPairId(DEFAULT_PAIR);
    setMagnification(1);
    setShowRepair(false);
  }, []);

  return (
    <ExplorationPanel
      explorationId="chain-rule"
      title="Two zooms, one number"
      description="Magnify g, then magnify f at the point g's output lands — and watch the two slopes compound."
      summary="**Drag the magnification slider** and watch both panels straighten together. Then switch presets: one where g′(a) = 0, and one where g has a corner but the composite is smooth anyway."
      toolbar={
        <>
          <PresetPicker
            label="Pair"
            activeId={pairId}
            presets={PAIRS.map((p) => ({
              id: p.id,
              label: p.label,
              onSelect: () => pick(p.id),
            }))}
          />
          <ResetButton onReset={reset} />
        </>
      }
      controls={
        <>
          <ParameterControls
            title="Magnification"
            controls={[
              {
                id: "magnification",
                label: "Magnification (both panels)",
                value: magnification,
                min: 1,
                max: MAX_MAGNIFICATION,
                step: 1,
                onChange: setMagnification,
              },
            ]}
          />
          <ExplorationToggles
            toggles={[
              {
                id: "repair",
                label: "Show the honest repair, not the cancel-du attempt",
                checked: showRepair,
                onChange: setShowRepair,
              },
            ]}
          />
        </>
      }
      readout={
        <>
          <SceneReadout
            title="The two rates, and their compound"
            items={[
              {
                id: "g-slope",
                label: `g′(${fmt(a, 2)})`,
                value:
                  gSlope.kind === "differentiable"
                    ? fmt(gSlope.slope)
                    : `no single slope — corner (${fmt(gSlope.left, 2)} / ${fmt(gSlope.right, 2)})`,
              },
              {
                id: "f-slope",
                label: `f′(${fmt(b, 2)})`,
                value: fSlope.kind === "differentiable" ? fmt(fSlope.slope) : "no single slope",
              },
              {
                id: "chain",
                label: "Chain rule: f′(g(a))·g′(a)",
                value:
                  chainRuleValue === null
                    ? "— (g has no single slope here; the chain rule does not apply)"
                    : fmt(chainRuleValue),
              },
              {
                id: "direct",
                label: "(f∘g)′(a), differentiated directly",
                value: fmt(directDerivative),
              },
            ]}
          />

          {chainRuleValue !== null && (
            <ProseWithMath
              className="chain-explorer__note"
              text={`Two independent routes: ${fmt(chainRuleValue)} from the chain rule, ${fmt(directDerivative)} from differentiating the composite directly. The chain-rule route never reads the direct one — agreement is corroboration.`}
            />
          )}
          {chainRuleValue === null && (
            <ProseWithMath
              className="chain-explorer__note"
              text={`g has no single slope at $a = ${fmt(a, 2)}$, so the chain rule's hypothesis fails and it gives no answer — but the composite can still be differentiable: the direct route above shows $(f\\circ g)'(${fmt(a, 2)}) = ${fmt(directDerivative)}$ anyway. The chain rule's hypothesis is sufficient, not necessary.`}
            />
          )}

          <ProseWithMath
            className="chain-explorer__note"
            text={
              showRepair
                ? `The honest repair: substitute $g$'s local model as $f$'s input in the identity $f(b+k) = f(b) + f'(b)k + E_f(k)$ — an identity, never a division, and $E_f(0) = 0$ automatically. That is why $g'(a) = 0$ needs no special case.`
                : `The popular proof "cancels the $du$'s": $\\frac{\\Delta y}{\\Delta x} = \\frac{\\Delta y}{\\Delta u}\\cdot\\frac{\\Delta u}{\\Delta x}$ — which silently needs $\\Delta u \\neq 0$ to even divide.`
            }
          />
        </>
      }
    >
      <div className="chain-explorer__panels">
        <LocalLinearityZoom
          fixture={pair.g}
          at={a}
          magnification={magnification}
          baseHalfWidth={BASE_HALF_WIDTH}
          height={300}
          ariaLabel={`${pair.g.label}, magnified ${Math.round(magnification)} times about x = ${fmt(a, 2)}`}
        />
        <LocalLinearityZoom
          fixture={pair.f}
          at={b}
          magnification={magnification}
          baseHalfWidth={BASE_HALF_WIDTH}
          height={300}
          ariaLabel={`${pair.f.label}, magnified ${Math.round(magnification)} times about u = ${fmt(b, 2)}, g's output at a`}
        />
      </div>
    </ExplorationPanel>
  );
}
