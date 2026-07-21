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
  fillOpacity = 0.45,
  weight = 2,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  fillOpacity?: number;
  weight?: number;
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
      fillOpacity={fillOpacity}
      weight={weight}
    />
  );
}

export function KaratsubaExplorer() {
  const [digits, setDigits] = useState<Digits>(DEFAULT);
  const [showWeights, setShowWeights] = useState(true);
  const [showAux, setShowAux] = useState(true);
  const [showPeel, setShowPeel] = useState(false);
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
    setShowPeel(false);
    setShowTree(false);
    setShowQuadraticNote(false);
    setTreeN(8);
    setShowExampleTrace(false);
    setActivePreset(KARATSUBA_CLEAN.id);
  }, []);

  const carrySequence = step.normalized.steps
    .map((s) => `${s.valueBefore}→${s.digitAfter} (+${s.carryOut})`)
    .join("; ");

  // `normalized.blocks` is least-significant-first; humans read most-significant
  // first. Show the reading order but keep the internal (low→high) array visible.
  const readingOrder = [...step.normalized.blocks].reverse().join(", ");

  // Independently normalized frames: unit square [0,1]×[0,1] for each view.
  // Extra top/bottom padding so frame titles are not clipped by the Mafs viewport.
  const diagramViewBox = {
    x: [-0.42, 1.18] as [number, number],
    y: [-0.36, 1.34] as [number, number],
    padding: 0.02,
  };

  const weightedView = (
    <MafsSceneShell
      height={260}
      viewBox={diagramViewBox}
      ariaLabel={`Weighted multiplication rectangle ${x} by ${y}, regions labeled 100 AC, 10 AD, 10 BC, BD`}
      showCoordinates={false}
    >
      {/* Outer frame so the four FOIL regions read as one rectangle. */}
      <Polygon
        points={[
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ]}
        color="var(--color-canvas-text)"
        fillOpacity={0}
        weight={2}
      />
      <RegionRect x0={0} y0={wLowY} x1={wSplitX} y1={1} color={ROLE_AC} />
      <RegionRect x0={0} y0={0} x1={wSplitX} y1={wLowY} color={ROLE_AD} />
      <RegionRect x0={wSplitX} y0={wLowY} x1={1} y1={1} color={ROLE_BC} />
      <RegionRect x0={wSplitX} y0={0} x1={1} y1={wLowY} color={ROLE_BD} />
      <Text x={0.5} y={1.18} attach="s" size={15} color="var(--color-canvas-text)">
        {`Weighted ${x}×${y}`}
      </Text>
      {/* Edge place-value ticks so the skinny strips still read as 10A|B and 10C|D. */}
      <Text x={wSplitX / 2} y={-0.14} attach="n" size={12} color="var(--color-canvas-text)">
        10A
      </Text>
      <Text x={(1 + wSplitX) / 2} y={-0.14} attach="n" size={12} color="var(--color-canvas-text)">
        B
      </Text>
      <Text x={-0.12} y={(1 + wLowY) / 2} attach="e" size={12} color="var(--color-canvas-text)">
        10C
      </Text>
      <Text x={-0.12} y={wLowY / 2} attach="e" size={12} color="var(--color-canvas-text)">
        D
      </Text>
      {showWeights ? (
        <>
          <Text x={wSplitX / 2} y={(1 + wLowY) / 2} size={14} color="var(--color-canvas-text)">
            {"100 AC"}
          </Text>
          <Text x={wSplitX / 2} y={wLowY / 2} size={14} color="var(--color-canvas-text)">
            {"10 AD"}
          </Text>
          <Text x={(1 + wSplitX) / 2} y={(1 + wLowY) / 2} size={14} color="var(--color-canvas-text)">
            {"10 BC"}
          </Text>
          <Text x={(1 + wSplitX) / 2} y={wLowY / 2} size={14} color="var(--color-canvas-text)">
            BD
          </Text>
        </>
      ) : (
        <>
          <Text x={wSplitX / 2} y={(1 + wLowY) / 2} size={14} color="var(--color-canvas-text)">
            AC
          </Text>
          <Text x={wSplitX / 2} y={wLowY / 2} size={14} color="var(--color-canvas-text)">
            AD
          </Text>
          <Text x={(1 + wSplitX) / 2} y={(1 + wLowY) / 2} size={14} color="var(--color-canvas-text)">
            BC
          </Text>
          <Text x={(1 + wSplitX) / 2} y={wLowY / 2} size={14} color="var(--color-canvas-text)">
            BD
          </Text>
        </>
      )}
    </MafsSceneShell>
  );

  // Peel: dim the two known corners AC (top-left) and BD (bottom-right); keep the
  // two OPPOSITE corners AD (bottom-left) and BC (top-right) — their areas are z₁.
  const cornerOpacity = showPeel ? 0.1 : 0.45;
  const oppositeOpacity = showPeel ? 0.7 : 0.45;
  const oppositeWeight = showPeel ? 4 : 2;

  const auxView = showAux ? (
    <MafsSceneShell
      height={260}
      viewBox={diagramViewBox}
      ariaLabel={`Auxiliary coefficient rectangle ${sumA} by ${sumC}, subrectangles labeled AC, AD, BC, BD${
        showPeel ? "; AC and BD peeled off, AD and BC (= z₁) highlighted" : ""
      }`}
      showCoordinates={false}
    >
      <Polygon
        points={[
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ]}
        color="var(--color-canvas-text)"
        fillOpacity={0}
        weight={2}
      />
      <RegionRect
        x0={0}
        y0={aLowY}
        x1={aSplitX}
        y1={1}
        color={ROLE_AC}
        fillOpacity={cornerOpacity}
      />
      <RegionRect
        x0={0}
        y0={0}
        x1={aSplitX}
        y1={aLowY}
        color={ROLE_AD}
        fillOpacity={oppositeOpacity}
        weight={oppositeWeight}
      />
      <RegionRect
        x0={aSplitX}
        y0={aLowY}
        x1={1}
        y1={1}
        color={ROLE_BC}
        fillOpacity={oppositeOpacity}
        weight={oppositeWeight}
      />
      <RegionRect
        x0={aSplitX}
        y0={0}
        x1={1}
        y1={aLowY}
        color={ROLE_BD}
        fillOpacity={cornerOpacity}
      />
      <Text x={0.5} y={1.18} attach="s" size={15} color="var(--color-canvas-text)">
        {`Auxiliary ${sumA}×${sumC}`}
      </Text>
      <Text x={aSplitX / 2} y={-0.14} attach="n" size={12} color="var(--color-canvas-text)">
        A
      </Text>
      <Text x={(aSplitX + 1) / 2} y={-0.14} attach="n" size={12} color="var(--color-canvas-text)">
        B
      </Text>
      <Text x={-0.12} y={(aLowY + 1) / 2} attach="e" size={12} color="var(--color-canvas-text)">
        C
      </Text>
      <Text x={-0.12} y={aLowY / 2} attach="e" size={12} color="var(--color-canvas-text)">
        D
      </Text>
      <Text x={aSplitX / 2} y={(aLowY + 1) / 2} size={14} color="var(--color-canvas-text)">
        AC
      </Text>
      <Text x={aSplitX / 2} y={aLowY / 2} size={14} color="var(--color-canvas-text)">
        AD
      </Text>
      <Text x={(aSplitX + 1) / 2} y={(aLowY + 1) / 2} size={14} color="var(--color-canvas-text)">
        BC
      </Text>
      <Text x={(aSplitX + 1) / 2} y={aLowY / 2} size={14} color="var(--color-canvas-text)">
        BD
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
                id: "peel",
                label: "Peel off AC and BD (leave z₁ = AD + BC)",
                checked: showPeel,
                onChange: setShowPeel,
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
                    : carrySequence}
                </span>
              ),
            },
            {
              id: "normalized-blocks",
              label: "Normalized blocks",
              value: (
                <span data-testid="karatsuba-normalized">
                  reading order (high→low): {readingOrder}
                  {"  "}
                  <span className="karatsuba-explorer__aside">
                    (internal array is low→high: [{step.normalized.blocks.join(", ")}])
                  </span>
                </span>
              ),
            },
            {
              id: "peel",
              label: "Peel (z₁ = AD + BC)",
              value: (
                <span data-testid="karatsuba-peel">
                  {showPeel
                    ? `Peel off the known corners AC and BD; the two opposite corners AD + BC remain = z₁ = (A+B)(C+D) − AC − BD = ${step.sumProduct} − ${step.regions.ac} − ${step.regions.bd} = ${step.z1}`
                    : "off — toggle “Peel off AC and BD” to isolate z₁"}
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
