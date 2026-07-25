import { useCallback, useMemo, useState } from "react";
import { Line, Polygon, Text, Vector } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { MatrixTeX } from "../components/lesson/ProseWithMath";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import { PresetPicker } from "./PresetPicker";
import { COMPOSITION_LESSON_PRESETS } from "../lessons/exampleData";
import {
  applyMatrixToUnitSquare,
  clamp,
  determinant2x2,
  inverse2x2,
  matrixMatrixMultiply,
  productColumn,
  requireMatrixExample,
  type Matrix2x2,
} from "../math";
import "./MatrixCompositionExplorer.css";

/**
 * Lesson 6 explorer — compose two maps and watch the product's columns.
 *
 * The one thing this explorer exists to make felt: **column j of the product is
 * the FIRST map's column j pushed through the SECOND map.** So the readout does
 * not merely print the product matrix — it prints `col₁ = A · col₁(B)` beside
 * it, and the canvas draws the intermediate stage so the two-step journey is
 * visible rather than asserted.
 *
 * The order toggle is the second point: swapping it recomputes everything, and
 * the "other order" outline stays on the canvas for comparison.
 *
 * All arithmetic comes from `src/math`. In particular the singular case shows
 * "no inverse" rather than a matrix of `Infinity` — `inverse2x2` returns `null`,
 * and that null is rendered, not papered over.
 */

const A_DEFAULT = requireMatrixExample("shear-2-1").matrix;
const B_DEFAULT = requireMatrixExample("rotation").matrix;
const ENTRY_MIN = -3;
const ENTRY_MAX = 3;

const ROLE_ORIGINAL = "var(--role-original)";
const ROLE_BASIS_1 = "var(--role-basis-1)";
const ROLE_BASIS_2 = "var(--role-basis-2)";
const ROLE_SELECTED = "var(--role-selected)";
const ROLE_INTERMEDIATE = "var(--role-intermediate)";
const ROLE_GRID = "var(--role-intermediate)";

type Entries = { a: number; b: number; c: number; d: number };
/** Which map the learner applies FIRST. The matrix written is the other one × this. */
type Order = "b-first" | "a-first";

function toEntries(m: Matrix2x2): Entries {
  return { a: m[0][0], b: m[0][1], c: m[1][0], d: m[1][1] };
}

function toMatrix(e: Entries): Matrix2x2 {
  return [
    [e.a, e.b],
    [e.c, e.d],
  ];
}

function fmt(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return Object.is(r, -0) ? "0" : String(r);
}

function plain(m: Matrix2x2): string {
  return `[[${fmt(m[0][0])}, ${fmt(m[0][1])}], [${fmt(m[1][0])}, ${fmt(m[1][1])}]]`;
}

export function MatrixCompositionExplorer() {
  const [aEntries, setAEntries] = useState<Entries>(() => toEntries(A_DEFAULT));
  const [bEntries, setBEntries] = useState<Entries>(() => toEntries(B_DEFAULT));
  const [order, setOrder] = useState<Order>("b-first");
  const [showIntermediate, setShowIntermediate] = useState(true);
  const [showOtherOrder, setShowOtherOrder] = useState(false);
  const [showInverse, setShowInverse] = useState(false);

  const A = useMemo(() => toMatrix(aEntries), [aEntries]);
  const B = useMemo(() => toMatrix(bEntries), [bEntries]);

  // "first" is applied to the plane first; "second" acts on its image. The
  // matrix of the composite is therefore `second × first`.
  const first = order === "b-first" ? B : A;
  const second = order === "b-first" ? A : B;
  const firstName = order === "b-first" ? "B" : "A";
  const secondName = order === "b-first" ? "A" : "B";

  const product = useMemo(
    () => matrixMatrixMultiply(second, first),
    [second, first],
  );
  const otherOrder = useMemo(
    () => matrixMatrixMultiply(first, second),
    [first, second],
  );
  const productDet = determinant2x2(product);
  const productInverse = inverse2x2(product);
  const invertible = productInverse !== null;

  const col1 = productColumn(second, first, 0);
  const col2 = productColumn(second, first, 1);

  const intermediateCorners = applyMatrixToUnitSquare(first);
  const finalCorners = applyMatrixToUnitSquare(product);
  const otherCorners = applyMatrixToUnitSquare(otherOrder);

  const setAEntry = useCallback((key: keyof Entries, value: number) => {
    setAEntries((prev) => ({ ...prev, [key]: clamp(value, ENTRY_MIN, ENTRY_MAX) }));
  }, []);
  const setBEntry = useCallback((key: keyof Entries, value: number) => {
    setBEntries((prev) => ({ ...prev, [key]: clamp(value, ENTRY_MIN, ENTRY_MAX) }));
  }, []);

  const applyPreset = useCallback((target: "A" | "B", exampleId: string) => {
    const entries = toEntries(requireMatrixExample(exampleId).matrix);
    if (target === "A") setAEntries(entries);
    else setBEntries(entries);
  }, []);

  const handleReset = useCallback(() => {
    setAEntries(toEntries(A_DEFAULT));
    setBEntries(toEntries(B_DEFAULT));
    setOrder("b-first");
    setShowIntermediate(true);
    setShowOtherOrder(false);
    setShowInverse(false);
  }, []);

  const summary = invertible
    ? `Applying ${firstName} then ${secondName} is the single map ${secondName}${firstName}. It is invertible — nothing collapsed — so it can be undone.`
    : `Applying ${firstName} then ${secondName} collapses the plane onto a line or a point. det = 0, so there is no inverse: two different inputs already share an output.`;

  return (
    <ExplorationPanel
      explorationId="matrix-composition"
      title="Compose two maps, then try to undo them"
      description="Apply one map, then the other. The product's first column is always the first map's first column pushed through the second map — change either matrix and watch that stay true. Swap the order and the composite generally changes."
      toolbar={
        <>
          <PresetPicker
            label="Set A"
            presets={COMPOSITION_LESSON_PRESETS.map((p) => ({
              id: `comp-a-${p.id}`,
              label: p.label,
              onSelect: () => applyPreset("A", p.exampleId),
            }))}
          />
          <PresetPicker
            label="Set B"
            presets={COMPOSITION_LESSON_PRESETS.map((p) => ({
              id: `comp-b-${p.id}`,
              label: p.label,
              onSelect: () => applyPreset("B", p.exampleId),
            }))}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      summary={summary}
      controls={
        <>
          <div className="comp-explorer__order">
            <span id="comp-order-label" className="comp-explorer__order-label">
              Apply first
            </span>
            <div
              className="comp-explorer__order-buttons"
              role="group"
              aria-labelledby="comp-order-label"
            >
              <button
                type="button"
                className="btn btn--ghost"
                data-testid="comp-order-b-first"
                aria-pressed={order === "b-first"}
                onClick={() => setOrder("b-first")}
              >
                B, then A <span aria-hidden="true">(AB)</span>
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                data-testid="comp-order-a-first"
                aria-pressed={order === "a-first"}
                onClick={() => setOrder("a-first")}
              >
                A, then B <span aria-hidden="true">(BA)</span>
              </button>
            </div>
          </div>
          <ParameterControls
            title="Matrix A"
            controls={[
              { id: "comp-a11", label: "a₁₁", value: aEntries.a, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setAEntry("a", v) },
              { id: "comp-a12", label: "a₁₂", value: aEntries.b, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setAEntry("b", v) },
              { id: "comp-a21", label: "a₂₁", value: aEntries.c, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setAEntry("c", v) },
              { id: "comp-a22", label: "a₂₂", value: aEntries.d, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setAEntry("d", v) },
            ]}
          />
          <ParameterControls
            title="Matrix B"
            controls={[
              { id: "comp-b11", label: "b₁₁", value: bEntries.a, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setBEntry("a", v) },
              { id: "comp-b12", label: "b₁₂", value: bEntries.b, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setBEntry("b", v) },
              { id: "comp-b21", label: "b₂₁", value: bEntries.c, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setBEntry("c", v) },
              { id: "comp-b22", label: "b₂₂", value: bEntries.d, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setBEntry("d", v) },
            ]}
          />
          <details className="exploration-details">
            <summary>Display options</summary>
            <div className="exploration-details__body">
              <ExplorationToggles
                toggles={[
                  { id: "comp-intermediate", label: `Intermediate stage (after ${firstName} only)`, checked: showIntermediate, onChange: setShowIntermediate },
                  { id: "comp-other-order", label: "The other order, for comparison", checked: showOtherOrder, onChange: setShowOtherOrder },
                  { id: "comp-inverse", label: "Inverse of the composite", checked: showInverse, onChange: setShowInverse },
                ]}
              />
            </div>
          </details>
        </>
      }
      readout={
        <SceneReadout
          title="Readout"
          items={[
            {
              id: "product",
              label: `${secondName}${firstName}`,
              value: (
                <span data-testid="comp-product-readout" data-plain={plain(product)}>
                  <MatrixTeX a={product[0][0]} b={product[0][1]} c={product[1][0]} d={product[1][1]} />
                </span>
              ),
            },
            {
              id: "columns",
              label: "Its columns",
              value: (
                <span data-testid="comp-columns-readout">
                  col₁ = {secondName}·col₁({firstName}) = ({fmt(col1[0])}, {fmt(col1[1])});{" "}
                  col₂ = {secondName}·col₂({firstName}) = ({fmt(col2[0])}, {fmt(col2[1])})
                </span>
              ),
            },
            {
              id: "det",
              label: "ad − bc of the composite",
              value: <span data-testid="comp-det">{fmt(productDet)}</span>,
            },
            {
              id: "invertible",
              label: "Can it be undone?",
              value: (
                <span data-testid="comp-invertible">
                  {invertible ? "Yes — invertible" : "No — singular, the plane collapsed"}
                </span>
              ),
            },
            ...(showInverse
              ? [
                  {
                    id: "inverse",
                    label: `(${secondName}${firstName})⁻¹`,
                    value: productInverse ? (
                      <span
                        data-testid="comp-inverse-readout"
                        data-plain={plain(productInverse)}
                      >
                        <MatrixTeX
                          a={productInverse[0][0]}
                          b={productInverse[0][1]}
                          c={productInverse[1][0]}
                          d={productInverse[1][1]}
                        />
                      </span>
                    ) : (
                      <span data-testid="comp-inverse-readout" data-plain="none">
                        No inverse exists — information was lost.
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      }
    >
      <div className="comp-explorer__scene">
        <MafsSceneShell
          ariaLabel={`The unit square, its image after ${firstName} alone, and its image after the composite ${secondName}${firstName}, with the composite's columns drawn as basis vectors`}
          viewBox={{ x: [-4.5, 4.5], y: [-3.5, 3.5], padding: 0.35 }}
          height={400}
        >
          {/* The original — always present, so "what moved" is answerable. */}
          <Polygon
            points={[[0, 0], [1, 0], [1, 1], [0, 1]]}
            color={ROLE_ORIGINAL}
            fillOpacity={0.08}
            strokeOpacity={0.45}
            weight={1.5}
            svgPolygonProps={{ strokeDasharray: "6 5" }}
          />
          {showIntermediate && (
            <Polygon
              points={intermediateCorners as [number, number][]}
              color={ROLE_INTERMEDIATE}
              fillOpacity={0.06}
              strokeOpacity={0.5}
              weight={1.5}
              svgPolygonProps={{ strokeDasharray: "3 4" }}
            />
          )}
          {showOtherOrder && (
            <Polygon
              points={otherCorners as [number, number][]}
              color={ROLE_ORIGINAL}
              fillOpacity={0.04}
              strokeOpacity={0.5}
              weight={1.5}
              svgPolygonProps={{ strokeDasharray: "10 6" }}
            />
          )}
          <Polygon
            points={finalCorners as [number, number][]}
            color={ROLE_SELECTED}
            fillOpacity={0.18}
            strokeOpacity={0.85}
            weight={2.5}
          />
          <Vector tip={col1 as [number, number]} color={ROLE_BASIS_1} weight={4} />
          <Vector tip={col2 as [number, number]} color={ROLE_BASIS_2} weight={4} />
          <Text x={col1[0]} y={col1[1]} attach="ne" attachDistance={12} color={ROLE_BASIS_1} size={16}>
            col₁
          </Text>
          <Text x={col2[0]} y={col2[1]} attach="ne" attachDistance={12} color={ROLE_BASIS_2} size={16}>
            col₂
          </Text>
          <Line.Segment point1={[-4, 0]} point2={[4, 0]} color={ROLE_GRID} weight={1} opacity={0.35} />
          <Line.Segment point1={[0, -3]} point2={[0, 3]} color={ROLE_GRID} weight={1} opacity={0.35} />
        </MafsSceneShell>
      </div>
    </ExplorationPanel>
  );
}
