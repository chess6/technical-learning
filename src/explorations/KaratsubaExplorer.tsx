import { useCallback, useMemo, useState } from "react";
import { Polygon, Text } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ProseWithMath } from "../components/lesson/ProseWithMath";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import { PresetPicker } from "./PresetPicker";
import { KaratsubaTreeDiagram } from "./KaratsubaTreeDiagram";
import {
  KARATSUBA_ARITHMETIC_PRESETS,
  KARATSUBA_CLEAN,
  requireKaratsubaExample,
} from "../lessons/karatsubaData";
import { clamp, karatsubaStep } from "../math";
import "./KaratsubaExplorer.css";

const ROLE_AC = "var(--role-basis-1)";
const ROLE_AD = "var(--role-selected)";
const ROLE_BC = "var(--role-transformed)";
const ROLE_BD = "var(--role-basis-2)";

type Digits = { a: number; b: number; c: number; d: number };

function fromExample(x: number, y: number): Digits {
  return {
    a: Math.floor(x / 10),
    b: x % 10,
    c: Math.floor(y / 10),
    d: y % 10,
  };
}

const DEFAULT = fromExample(KARATSUBA_CLEAN.x, KARATSUBA_CLEAN.y);

function RegionRect({
  x0,
  y0,
  x1,
  y1,
  color,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
}) {
  return (
    <Polygon
      points={[
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ]}
      color={color}
      fillOpacity={0.45}
    />
  );
}

export function KaratsubaExplorer() {
  const [digits, setDigits] = useState<Digits>(DEFAULT);
  const [showWeights, setShowWeights] = useState(true);
  const [showAux, setShowAux] = useState(true);
  const [showTree, setShowTree] = useState(false);
  const [showQuadraticNote, setShowQuadraticNote] = useState(false);
  const [treeN, setTreeN] = useState(8);
  const [showExampleTrace, setShowExampleTrace] = useState(false);
  const [activePreset, setActivePreset] = useState(KARATSUBA_CLEAN.id);

  const x = 10 * digits.a + digits.b;
  const y = 10 * digits.c + digits.d;
  const step = useMemo(() => karatsubaStep(x, y, 1), [x, y]);

  // Weighted rectangle: split by place-value lengths (10A vs B, 10C vs D).
  // Left = high (10A), right = low (B); bottom = low (D), top = high (10C).
  const wSplitX = x > 0 ? (10 * digits.a) / x : 0;
  const wHighY = y > 0 ? (10 * digits.c) / y : 0; // fraction of height for 10C (top)
  const wLowY = 1 - wHighY; // D at bottom
  // Auxiliary rectangle: unweighted digit split (same left/right, bottom/top convention).
  const sumA = digits.a + digits.b;
  const sumC = digits.c + digits.d;
  const aSplitX = sumA > 0 ? digits.a / sumA : 0;
  const aHighY = sumC > 0 ? digits.c / sumC : 0;
  const aLowY = 1 - aHighY;

  const setDigit = useCallback((key: keyof Digits, value: number) => {
    setDigits((prev) => ({ ...prev, [key]: clamp(Math.round(value), 0, 9) }));
    setActivePreset("");
  }, []);

  const applyPreset = useCallback((exampleId: string) => {
    const ex = requireKaratsubaExample(exampleId);
    setDigits(fromExample(ex.x, ex.y));
    setActivePreset(exampleId);
  }, []);

  const handleReset = useCallback(() => {
    setDigits(DEFAULT);
    setShowWeights(true);
    setShowAux(true);
    setShowTree(false);
    setShowQuadraticNote(false);
    setTreeN(8);
    setShowExampleTrace(false);
    setActivePreset(KARATSUBA_CLEAN.id);
  }, []);

  const carrySequence = step.normalized.steps
    .map((s) => `${s.valueBefore}→${s.digitAfter} (+${s.carryOut})`)
    .join("; ");

  // Independently normalized frames: unit square [0,1]×[0,1] for each view.
  const weightedView = (
    <MafsSceneShell
      height={220}
      viewBox={{ x: [-0.15, 1.15], y: [-0.2, 1.2], padding: 0.05 }}
      ariaLabel={`Weighted multiplication rectangle ${x} by ${y}`}
      showCoordinates={false}
    >
      <RegionRect x0={0} y0={wLowY} x1={wSplitX} y1={1} color={ROLE_AC} />
      <RegionRect x0={0} y0={0} x1={wSplitX} y1={wLowY} color={ROLE_AD} />
      <RegionRect x0={wSplitX} y0={wLowY} x1={1} y1={1} color={ROLE_BC} />
      <RegionRect x0={wSplitX} y0={0} x1={1} y1={wLowY} color={ROLE_BD} />
      <Text x={0.5} y={1.08} attach="s" size={14} color="var(--role-text)">
        {`Weighted ${x}×${y}`}
      </Text>
      {showWeights ? (
        <>
          <Text x={wSplitX / 2} y={(1 + wLowY) / 2} size={12} color="var(--role-text)">
            {`100·${step.regions.ac}`}
          </Text>
          <Text x={wSplitX / 2} y={wLowY / 2} size={12} color="var(--role-text)">
            {`10·${step.regions.ad}`}
          </Text>
          <Text x={(1 + wSplitX) / 2} y={(1 + wLowY) / 2} size={12} color="var(--role-text)">
            {`10·${step.regions.bc}`}
          </Text>
          <Text x={(1 + wSplitX) / 2} y={wLowY / 2} size={12} color="var(--role-text)">
            {`${step.regions.bd}`}
          </Text>
        </>
      ) : null}
    </MafsSceneShell>
  );

  const auxView = showAux ? (
    <MafsSceneShell
      height={220}
      viewBox={{ x: [-0.15, 1.15], y: [-0.2, 1.2], padding: 0.05 }}
      ariaLabel={`Auxiliary coefficient rectangle ${sumA} by ${sumC}`}
      showCoordinates={false}
    >
      <RegionRect x0={0} y0={aLowY} x1={aSplitX} y1={1} color={ROLE_AC} />
      <RegionRect x0={0} y0={0} x1={aSplitX} y1={aLowY} color={ROLE_AD} />
      <RegionRect x0={aSplitX} y0={aLowY} x1={1} y1={1} color={ROLE_BC} />
      <RegionRect x0={aSplitX} y0={0} x1={1} y1={aLowY} color={ROLE_BD} />
      <Text x={0.5} y={1.08} attach="s" size={14} color="var(--role-text)">
        {`Auxiliary ${sumA}×${sumC}`}
      </Text>
    </MafsSceneShell>
  ) : null;

  return (
    <ExplorationPanel
      explorationId="karatsuba-cross-terms"
      title="Place-value rectangles and three products"
      description="Adjust the digits of two two-digit numbers. The weighted rectangle shows why AD and BC share a column; the auxiliary rectangle shows how one product recovers their sum."
      toolbar={
        <>
          <PresetPicker
            label="Examples"
            activeId={activePreset || undefined}
            presets={KARATSUBA_ARITHMETIC_PRESETS.map((p) => ({
              id: p.id,
              label: p.label,
              onSelect: () => applyPreset(p.id),
            }))}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      controls={
        <>
          <ParameterControls
            title="Digits"
            controls={[
              {
                id: "a",
                label: "A",
                value: digits.a,
                min: 0,
                max: 9,
                step: 1,
                onChange: (v) => setDigit("a", v),
              },
              {
                id: "b",
                label: "B",
                value: digits.b,
                min: 0,
                max: 9,
                step: 1,
                onChange: (v) => setDigit("b", v),
              },
              {
                id: "c",
                label: "C",
                value: digits.c,
                min: 0,
                max: 9,
                step: 1,
                onChange: (v) => setDigit("c", v),
              },
              {
                id: "d",
                label: "D",
                value: digits.d,
                min: 0,
                max: 9,
                step: 1,
                onChange: (v) => setDigit("d", v),
              },
            ]}
          />
          <ExplorationToggles
            title="Display"
            toggles={[
              {
                id: "weights",
                label: "Show place-value weights",
                checked: showWeights,
                onChange: setShowWeights,
              },
              {
                id: "aux",
                label: "Show the auxiliary coefficient rectangle",
                checked: showAux,
                onChange: setShowAux,
              },
              {
                id: "tree",
                label: "Show recursion tree & cost",
                checked: showTree,
                onChange: setShowTree,
              },
              {
                id: "parabola",
                label: "Show the quadratic-evaluation note (advanced)",
                checked: showQuadraticNote,
                onChange: setShowQuadraticNote,
              },
            ]}
          />
        </>
      }
      readout={
        <SceneReadout
          title="Karatsuba readout"
          items={[
            {
              id: "product-pair",
              label: "Product",
              value: (
                <span data-testid="karatsuba-product">
                  {x} × {y} = {step.product}
                </span>
              ),
            },
            {
              id: "regions",
              label: "FOIL regions",
              value: (
                <ProseWithMath
                  text={`$AC=${step.regions.ac}$, $AD=${step.regions.ad}$, $BC=${step.regions.bc}$, $BD=${step.regions.bd}$`}
                />
              ),
            },
            {
              id: "sum-product",
              label: "(A+B)(C+D)",
              value: (
                <span data-testid="karatsuba-sum-product">{step.sumProduct}</span>
              ),
            },
            {
              id: "coeffs",
              label: "Coefficients",
              value: (
                <span data-testid="karatsuba-coeffs">
                  z₂={step.z2}, z₁={step.z1}, z₀={step.z0}
                </span>
              ),
            },
            {
              id: "pre-carry",
              label: "Before carrying",
              value: `100·${step.z2} + 10·${step.z1} + ${step.z0}`,
            },
            {
              id: "carry-steps",
              label: "Carry sequence",
              value: (
                <span data-testid="karatsuba-carry">
                  {step.normalized.steps.length === 0
                    ? "none (clean coefficients)"
                    : `${carrySequence} → blocks [${step.normalized.blocks.join(", ")}]`}
                </span>
              ),
            },
            {
              id: "mult-count",
              label: "Multiplications",
              value: (
                <span data-testid="karatsuba-mult-count">3 (Karatsuba) vs 4 (naive)</span>
              ),
            },
            {
              id: "badges",
              label: "Size effects",
              value: (
                <span className="karatsuba-explorer__badges">
                  <span
                    className={
                      step.coefficientOverflow
                        ? "karatsuba-explorer__badge karatsuba-explorer__badge--on"
                        : "karatsuba-explorer__badge"
                    }
                    data-testid="badge-carrying"
                    data-active={step.coefficientOverflow ? "true" : "false"}
                  >
                    coefficient overflow → carrying
                  </span>
                  <span
                    className={
                      step.operandWidthGrowth
                        ? "karatsuba-explorer__badge karatsuba-explorer__badge--on"
                        : "karatsuba-explorer__badge"
                    }
                    data-testid="badge-width"
                    data-active={step.operandWidthGrowth ? "true" : "false"}
                  >
                    operand width +1 → padding
                  </span>
                </span>
              ),
            },
          ]}
        />
      }
    >
      <div className="karatsuba-explorer__frames">
        <div className="karatsuba-explorer__frame">{weightedView}</div>
        {auxView ? <div className="karatsuba-explorer__frame">{auxView}</div> : null}
      </div>
      {showQuadraticNote ? (
        <p className="karatsuba-explorer__parabola" data-testid="parabola-note">
          <ProseWithMath text="Advanced: the three products are three evaluations of the product quadratic $x(t)y(t)$ at $t=0,1,\\infty$. Optional deeper connection — not required for the elementary chain." />
        </p>
      ) : null}
      {showTree ? (
        <KaratsubaTreeDiagram
          n={treeN}
          showExampleTrace={showExampleTrace}
          onNChange={setTreeN}
          onShowExampleTraceChange={setShowExampleTrace}
        />
      ) : null}
    </ExplorationPanel>
  );
}
