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
import {
  DETERMINANT_LESSON_EXAMPLE,
  DETERMINANT_LESSON_PRESETS,
} from "../lessons/exampleData";
import {
  applyMatrixToUnitSquare,
  classifyDeterminant,
  clamp,
  determinant2x2,
  matrixVectorMultiply,
  requireMatrixExample,
  type Matrix2x2,
} from "../math";
import "./DeterminantExplorer.css";

const DEFAULT = DETERMINANT_LESSON_EXAMPLE;
const ENTRY_MIN = -3;
const ENTRY_MAX = 3;

const ROLE_ORIGINAL = "var(--role-original)";
const ROLE_BASIS_1 = "var(--role-basis-1)";
const ROLE_BASIS_2 = "var(--role-basis-2)";
const ROLE_SELECTED = "var(--role-selected)";
const ROLE_GRID = "var(--role-intermediate)";

type Entries = { a: number; b: number; c: number; d: number };

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
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

export function DeterminantExplorer() {
  const [entries, setEntries] = useState<Entries>(() =>
    toEntries(DEFAULT.matrix),
  );
  const [showOriginalSquare, setShowOriginalSquare] = useState(true);
  const [showTransformedSquare, setShowTransformedSquare] = useState(true);
  const [showBasis, setShowBasis] = useState(true);
  const [showOrientation, setShowOrientation] = useState(true);

  const matrix = useMemo(() => toMatrix(entries), [entries]);
  const classification = useMemo(() => classifyDeterminant(matrix), [matrix]);
  const det = determinant2x2(matrix);
  const e1 = matrixVectorMultiply(matrix, [1, 0]);
  const e2 = matrixVectorMultiply(matrix, [0, 1]);
  const transformedCorners = applyMatrixToUnitSquare(matrix);

  const setEntry = useCallback((key: keyof Entries, value: number) => {
    setEntries((prev) => ({
      ...prev,
      [key]: clamp(value, ENTRY_MIN, ENTRY_MAX),
    }));
  }, []);

  const applyPreset = useCallback((exampleId: string) => {
    setEntries(toEntries(requireMatrixExample(exampleId).matrix));
  }, []);

  const handleReset = useCallback(() => {
    setEntries(toEntries(DEFAULT.matrix));
    setShowOriginalSquare(true);
    setShowTransformedSquare(true);
    setShowBasis(true);
    setShowOrientation(true);
  }, []);

  return (
    <ExplorationPanel
      explorationId="determinant-area-scaling"
      title="Stretch and flip signed area"
      description="Change A and watch the unit square become a parallelogram. Area tracks |det(A)|; the dashed edge marks orientation."
      toolbar={
        <>
          <PresetPicker
            label="Examples"
            presets={DETERMINANT_LESSON_PRESETS.map((p) => ({
              id: p.id,
              label: p.label,
              onSelect: () => applyPreset(p.exampleId),
            }))}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      summary={classification.summary}
      controls={
        <>
          <ParameterControls
            title="Matrix entries"
            controls={[
              { id: "det-a", label: "a₁₁", value: entries.a, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setEntry("a", v) },
              { id: "det-b", label: "a₁₂", value: entries.b, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setEntry("b", v) },
              { id: "det-c", label: "a₂₁", value: entries.c, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setEntry("c", v) },
              { id: "det-d", label: "a₂₂", value: entries.d, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setEntry("d", v) },
            ]}
          />
          <details className="exploration-details">
            <summary>Display options</summary>
            <div className="exploration-details__body">
              <ExplorationToggles
                toggles={[
                  { id: "det-orig", label: "Original unit square", checked: showOriginalSquare, onChange: setShowOriginalSquare },
                  { id: "det-trans", label: "Transformed parallelogram", checked: showTransformedSquare, onChange: setShowTransformedSquare },
                  { id: "det-basis", label: "Basis vectors", checked: showBasis, onChange: setShowBasis },
                  { id: "det-orient", label: "Orientation edge (dashed)", checked: showOrientation, onChange: setShowOrientation },
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
              id: "matrix",
              label: "A",
              value: (
                <span data-testid="det-matrix-readout" data-plain={`[[${fmt(entries.a)}, ${fmt(entries.b)}], [${fmt(entries.c)}, ${fmt(entries.d)}]]`}>
                  <MatrixTeX a={entries.a} b={entries.b} c={entries.c} d={entries.d} />
                </span>
              ),
            },
            {
              id: "det",
              label: "det(A)",
              value: <span data-testid="det-value">{fmt(det)}</span>,
            },
            {
              id: "abs",
              label: "|det(A)|",
              value: <span data-testid="det-abs">{fmt(classification.absDet)}</span>,
            },
            {
              id: "effect",
              label: "Geometry",
              value: (
                <span data-testid="det-effect">
                  {classification.areaEffect}
                  {classification.reversesOrientation ? " · reversed" : " · oriented"}
                </span>
              ),
            },
          ]}
        />
      }
    >
      <div className="det-explorer__scene">
        <MafsSceneShell
          ariaLabel="Unit square and its image under A, with basis vectors and orientation edge"
          viewBox={{ x: [-4.5, 4.5], y: [-3.5, 3.5], padding: 0.35 }}
          height={400}
        >
          {showOriginalSquare && (
            <Polygon
              points={[[0, 0], [1, 0], [1, 1], [0, 1]]}
              color={ROLE_ORIGINAL}
              fillOpacity={0.08}
              strokeOpacity={0.45}
              weight={1.5}
              svgPolygonProps={{ strokeDasharray: "6 5" }}
            />
          )}
          {showTransformedSquare && (
            <Polygon
              points={transformedCorners as [number, number][]}
              color={ROLE_SELECTED}
              fillOpacity={0.18}
              strokeOpacity={0.85}
              weight={2.5}
            />
          )}
          {showOrientation && (
            <Line.Segment
              point1={[0, 0]}
              point2={e1 as [number, number]}
              color={ROLE_SELECTED}
              weight={3}
              style="dashed"
            />
          )}
          {showBasis && (
            <>
              <Vector tip={e1 as [number, number]} color={ROLE_BASIS_1} weight={4} />
              <Vector tip={e2 as [number, number]} color={ROLE_BASIS_2} weight={4} />
              <Text x={e1[0]} y={e1[1]} attach="ne" attachDistance={12} color={ROLE_BASIS_1} size={16}>
                e₁
              </Text>
              <Text x={e2[0]} y={e2[1]} attach="ne" attachDistance={12} color={ROLE_BASIS_2} size={16}>
                e₂
              </Text>
            </>
          )}
          {/* Quiet axes reference */}
          <Line.Segment point1={[-4, 0]} point2={[4, 0]} color={ROLE_GRID} weight={1} opacity={0.35} />
          <Line.Segment point1={[0, -3]} point2={[0, 3]} color={ROLE_GRID} weight={1} opacity={0.35} />
        </MafsSceneShell>
      </div>
    </ExplorationPanel>
  );
}
