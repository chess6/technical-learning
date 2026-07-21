import { useCallback, useMemo, useState } from "react";
import { Line, Point, Polygon, Text, Vector, useMovablePoint } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { MatrixTeX, VectorTeX } from "../components/lesson/ProseWithMath";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import { PresetPicker } from "./PresetPicker";
import {
  MATRIX_LESSON_EXAMPLE,
  TRANSFORM_LESSON_PRESETS,
} from "../lessons/exampleData";
import { OPENING_GRAPHIC } from "../lessons/openingGraphic";
import {
  applyMatrixToPoints,
  clamp,
  determinant2x2,
  DIAGNOSTIC_PRESETS,
  lerpIdentityToMatrix,
  matrixVectorMultiply,
  requireMatrixExample,
  transformedGridSegments,
  type Matrix2x2,
  type Vector2,
} from "../math";
import "./MatrixTransformationExplorer.css";

const GRAPHIC = OPENING_GRAPHIC.outline as readonly [number, number][];
const ANCHORS = OPENING_GRAPHIC.anchors;
const ROLE_SELECTED = "var(--role-selected)";

/** Reflection across y = x — the "same map, two matrices" example. */
const REFLECTION_XY: Matrix2x2 = [
  [0, 1],
  [1, 0],
];

function matrixApproxEqual(m: Matrix2x2, n: Matrix2x2, tol = 0.05): boolean {
  return (
    Math.abs(m[0][0] - n[0][0]) < tol &&
    Math.abs(m[0][1] - n[0][1]) < tol &&
    Math.abs(m[1][0] - n[1][0]) < tol &&
    Math.abs(m[1][1] - n[1][1]) < tol
  );
}

const DEFAULT_EXAMPLE = MATRIX_LESSON_EXAMPLE;
const INITIAL_INPUT = (DEFAULT_EXAMPLE.inputVector ?? [1.5, 0.5]) as Vector2;
const ENTRY_MIN = -3;
const ENTRY_MAX = 3;
const VEC_MIN = -3;
const VEC_MAX = 3;
const GRID_EXTENT = 4;

const ROLE_ORIGINAL = "var(--role-original)";
const ROLE_TRANSFORMED = "var(--role-transformed)";
const ROLE_BASIS_1 = "var(--role-basis-1)";
const ROLE_BASIS_2 = "var(--role-basis-2)";
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

function fmtPlainMatrix(m: Matrix2x2): string {
  return `[[${fmt(m[0][0])}, ${fmt(m[0][1])}], [${fmt(m[1][0])}, ${fmt(m[1][1])}]]`;
}

function TransformedGrid({ matrix, color }: { matrix: Matrix2x2; color: string }) {
  // Endpoints only: each segment is the image of an identity-space line under A.
  const segments = transformedGridSegments(matrix, GRID_EXTENT);
  return (
    <>
      {segments.map((seg) => (
        <Line.Segment
          key={`${seg.kind}${seg.index}`}
          point1={seg.point1 as [number, number]}
          point2={seg.point2 as [number, number]}
          color={color}
          weight={seg.index === 0 ? 2 : 1}
          opacity={seg.index === 0 ? 0.75 : 0.28}
        />
      ))}
    </>
  );
}

export function MatrixTransformationExplorer() {
  const [entries, setEntries] = useState<Entries>(() =>
    toEntries(DEFAULT_EXAMPLE.matrix),
  );
  const [t, setT] = useState(1);
  const [showTransformedGrid, setShowTransformedGrid] = useState(true);
  const [showBasis, setShowBasis] = useState(true);
  const [showGraphic, setShowGraphic] = useState(true);
  const [targetMatrix, setTargetMatrix] = useState<Matrix2x2 | null>(null);

  const target = useMemo(() => toMatrix(entries), [entries]);
  const current = useMemo(() => lerpIdentityToMatrix(target, t), [target, t]);

  const inputPoint = useMovablePoint(INITIAL_INPUT as [number, number], {
    color: ROLE_ORIGINAL,
    constrain: (p) =>
      [clamp(p[0], VEC_MIN, VEC_MAX), clamp(p[1], VEC_MIN, VEC_MAX)] as [
        number,
        number,
      ],
  });
  const { x, y, element: inputElement, setPoint } = inputPoint;
  const input: Vector2 = [x, y];

  const output = matrixVectorMultiply(current, input);
  const e1 = matrixVectorMultiply(current, [1, 0]);
  const e2 = matrixVectorMultiply(current, [0, 1]);
  const det = determinant2x2(target);
  const singular = Math.abs(det) < 1e-9;

  // Shared graphic: transform every vertex through the shared math (never ad-hoc).
  const graphicTransformed = applyMatrixToPoints(current, GRAPHIC);
  const noseImage = matrixVectorMultiply(current, GRAPHIC[ANCHORS.nose]!);
  const finImage = matrixVectorMultiply(current, GRAPHIC[ANCHORS.rightFin]!);
  const noseOriginal = GRAPHIC[ANCHORS.nose]!;
  const finOriginal = GRAPHIC[ANCHORS.rightFin]!;

  // "Same map, two matrices": reflection across y = x is diag(1, -1) in B.
  const isReflectionXY = matrixApproxEqual(target, REFLECTION_XY);

  // Build-a-matrix target-match task.
  const targetGraphic = targetMatrix ? applyMatrixToPoints(targetMatrix, GRAPHIC) : null;
  const targetMatched = targetMatrix ? matrixApproxEqual(target, targetMatrix) : false;

  const showDiagnosticPresets = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return (
        new URLSearchParams(window.location.search).get("debug") === "1" ||
        window.localStorage?.getItem("guidedSceneDebug") === "1"
      );
    } catch {
      return false;
    }
  }, []);

  const setEntry = useCallback((key: keyof Entries, value: number) => {
    setEntries((prev) => ({ ...prev, [key]: clamp(value, ENTRY_MIN, ENTRY_MAX) }));
  }, []);

  const applyPreset = useCallback((exampleId: string) => {
    setEntries(toEntries(requireMatrixExample(exampleId).matrix));
    setT(1);
    setTargetMatrix(null);
  }, []);

  const startMatch = useCallback((exampleId: string) => {
    // Learner rebuilds the map from its basis images: start at the identity so
    // the two columns must be set to hit the target graphic.
    setTargetMatrix(requireMatrixExample(exampleId).matrix as Matrix2x2);
    setEntries(toEntries(requireMatrixExample("identity").matrix));
    setT(1);
  }, []);

  const handleReset = useCallback(() => {
    setEntries(toEntries(DEFAULT_EXAMPLE.matrix));
    setT(1);
    setShowTransformedGrid(true);
    setShowBasis(true);
    setShowGraphic(true);
    setTargetMatrix(null);
    setPoint(INITIAL_INPUT as [number, number]);
  }, [setPoint]);

  const learnerPresets = TRANSFORM_LESSON_PRESETS.map((p) => ({
    id: p.id,
    label: p.label,
    onSelect: () => applyPreset(p.exampleId),
  }));

  const diagnosticPresets = showDiagnosticPresets
    ? DIAGNOSTIC_PRESETS.map((exampleId) => {
        const ex = requireMatrixExample(exampleId);
        return {
          id: exampleId,
          label: `Diag: ${ex.title}`,
          onSelect: () => applyPreset(exampleId),
        };
      })
    : [];

  return (
    <ExplorationPanel
      explorationId="matrix-transformation"
      title="Transform the plane"
      description="Edit the same matrix A from the guided animation. Drag v, or scrub the identity→A transition."
      toolbar={
        <>
          <PresetPicker
            label="Presets"
            presets={[
              ...learnerPresets,
              {
                id: "reflection-xy",
                label: "Reflect y = x",
                onSelect: () => applyPreset("reflection-xy"),
              },
              ...diagnosticPresets,
            ]}
          />
          <PresetPicker
            label="Build a matrix (set the two columns to match the target)"
            activeId={targetMatrix ? "on" : "off"}
            presets={[
              { id: "match-rotation", label: "Target: rotation", onSelect: () => startMatch("rotation") },
              { id: "match-reflection", label: "Target: reflect y = x", onSelect: () => startMatch("reflection-xy") },
              { id: "match-off", label: "Free explore", onSelect: () => setTargetMatrix(null) },
            ]}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      controls={
        <>
          <ParameterControls
            title="Matrix A"
            controls={[
              { id: "m-a", label: "a₁₁", value: entries.a, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setEntry("a", v) },
              { id: "m-b", label: "a₁₂", value: entries.b, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setEntry("b", v) },
              { id: "m-c", label: "a₂₁", value: entries.c, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setEntry("c", v) },
              { id: "m-d", label: "a₂₂", value: entries.d, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setEntry("d", v) },
            ]}
          />
          <details className="exploration-details">
            <summary>Numeric v, display &amp; transition</summary>
            <div className="exploration-details__body">
              <ParameterControls
                title="Input vector v (also draggable)"
                controls={[
                  { id: "in-x", label: "vₓ", value: x, min: VEC_MIN, max: VEC_MAX, onChange: (val) => setPoint([clamp(val, VEC_MIN, VEC_MAX), y]) },
                  { id: "in-y", label: "v_y", value: y, min: VEC_MIN, max: VEC_MAX, onChange: (val) => setPoint([x, clamp(val, VEC_MIN, VEC_MAX)]) },
                ]}
              />
              <ParameterControls
                title="Identity → A"
                controls={[
                  { id: "progress", label: "Transition", value: t, min: 0, max: 1, step: 0.01, onChange: setT },
                ]}
              />
              <ExplorationToggles
                title="Display"
                toggles={[
                  { id: "toggle-grid", label: "Transformed grid", checked: showTransformedGrid, onChange: setShowTransformedGrid },
                  { id: "toggle-basis", label: "Basis vectors", checked: showBasis, onChange: setShowBasis },
                  { id: "toggle-graphic", label: "Show graphic (craft)", checked: showGraphic, onChange: setShowGraphic },
                ]}
              />
            </div>
          </details>
        </>
      }
      readout={
        <SceneReadout
          title="Result"
          items={[
            {
              id: "matrix",
              label: "Matrix A",
              value: (
                <span data-testid="matrix-readout" data-plain={fmtPlainMatrix(target)}>
                  <MatrixTeX a={target[0][0]} b={target[0][1]} c={target[1][0]} d={target[1][1]} />
                </span>
              ),
            },
            {
              id: "input",
              label: "Input v",
              value: (
                <span data-testid="input-readout" data-plain={`(${fmt(input[0])}, ${fmt(input[1])})`}>
                  <VectorTeX x={input[0]} y={input[1]} name="v" />
                </span>
              ),
            },
            {
              id: "output",
              label: "A v",
              value: (
                <span data-testid="output-readout" data-plain={`(${fmt(output[0])}, ${fmt(output[1])})`}>
                  <VectorTeX x={output[0]} y={output[1]} />
                </span>
              ),
            },
            {
              id: "e1",
              label: "Column 1 = A·e₁",
              value: (
                <span data-testid="e1-readout" data-plain={`(${fmt(e1[0])}, ${fmt(e1[1])})`}>
                  <VectorTeX x={e1[0]} y={e1[1]} />
                </span>
              ),
            },
            {
              id: "e2",
              label: "Column 2 = A·e₂",
              value: (
                <span data-testid="e2-readout" data-plain={`(${fmt(e2[0])}, ${fmt(e2[1])})`}>
                  <VectorTeX x={e2[0]} y={e2[1]} />
                </span>
              ),
            },
            {
              id: "det",
              label: "det(A) — Lesson 3 preview",
              value: (
                <span data-testid="det-readout" className="matrix-explorer__det">
                  {fmt(det)}
                  {singular ? " · collapses" : ""}
                </span>
              ),
            },
            ...(singular
              ? [
                  {
                    id: "graphic-collapse",
                    label: "Graphic",
                    value: (
                      <span data-testid="graphic-collapse-readout">
                        collapsed onto a line (vertices coincide)
                      </span>
                    ),
                  },
                ]
              : []),
            ...(isReflectionXY
              ? [
                  {
                    id: "two-matrices",
                    label: "Same map in B = ((1,1),(1,−1))",
                    value: (
                      <span data-testid="two-matrices-readout" data-plain="diag(1, -1)">
                        <MatrixTeX a={1} b={0} c={0} d={-1} name="[T]_B" />
                      </span>
                    ),
                  },
                ]
              : []),
            ...(targetMatrix
              ? [
                  {
                    id: "target-match",
                    label: "Target match",
                    value: (
                      <span data-testid="target-match-readout">
                        {targetMatched ? "matched" : "set both columns to match"}
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      }
    >
      <div className="matrix-explorer__scene">
        <MafsSceneShell
          ariaLabel="Input vector and its image under the matrix, with transformed basis and grid"
          viewBox={{ x: [-4, 5.5], y: [-3.5, 4.5], padding: 0.45 }}
          height={380}
        >
          {showTransformedGrid && (
            <TransformedGrid matrix={current} color={ROLE_GRID} />
          )}
          {showGraphic && (
            <>
              {/* Ghost original craft (dashed) for before/after correspondence. */}
              <Polygon
                points={GRAPHIC as [number, number][]}
                color={ROLE_ORIGINAL}
                fillOpacity={0.05}
                strokeOpacity={0.5}
                weight={1.5}
              />
              {/* Optional target ghost (build-a-matrix task). */}
              {targetGraphic && (
                <Polygon
                  points={targetGraphic as [number, number][]}
                  color={ROLE_SELECTED}
                  fillOpacity={0.04}
                  strokeOpacity={0.6}
                  weight={2}
                />
              )}
              {/* Transformed craft (solid) — every vertex via applyMatrixToPoints. */}
              <Polygon
                points={graphicTransformed as [number, number][]}
                color={ROLE_TRANSFORMED}
                fillOpacity={0.14}
                strokeOpacity={0.95}
                weight={2}
              />
              {/* Gold anchors: nose and right fin, tracked across the transform. */}
              <Point x={noseOriginal[0]} y={noseOriginal[1]} color={ROLE_ORIGINAL} />
              <Point x={finOriginal[0]} y={finOriginal[1]} color={ROLE_ORIGINAL} />
              <Point x={noseImage[0]} y={noseImage[1]} color={ROLE_SELECTED} />
              <Point x={finImage[0]} y={finImage[1]} color={ROLE_SELECTED} />
              <Text x={noseImage[0]} y={noseImage[1]} attach="n" attachDistance={12} color={ROLE_SELECTED} size={13}>
                nose
              </Text>
            </>
          )}
          {showBasis && (
            <>
              <Vector tip={e1 as [number, number]} color={ROLE_BASIS_1} weight={3} />
              <Vector tip={e2 as [number, number]} color={ROLE_BASIS_2} weight={3} />
              <Text x={e1[0]} y={e1[1]} attach="ne" attachDistance={10} color={ROLE_BASIS_1} size={15}>
                e₁
              </Text>
              <Text x={e2[0]} y={e2[1]} attach="ne" attachDistance={10} color={ROLE_BASIS_2} size={15}>
                e₂
              </Text>
            </>
          )}
          <Vector tip={input as [number, number]} color={ROLE_ORIGINAL} weight={3} style="solid" />
          <Vector tip={output as [number, number]} color={ROLE_TRANSFORMED} weight={3} style="dashed" />
          <Text x={input[0]} y={input[1]} attach="nw" attachDistance={12} color={ROLE_ORIGINAL} size={15}>
            v
          </Text>
          <Text x={output[0]} y={output[1]} attach="ne" attachDistance={12} color={ROLE_TRANSFORMED} size={15}>
            A v
          </Text>
          {inputElement}
        </MafsSceneShell>
      </div>
      <ul className="matrix-explorer__legend" aria-label="Legend">
        <li><span className="swatch swatch--original" /> Input v (solid)</li>
        <li><span className="swatch swatch--transformed" /> Output A·v (dashed)</li>
        <li><span className="swatch swatch--basis1" /> Transformed e₁</li>
        <li><span className="swatch swatch--basis2" /> Transformed e₂</li>
      </ul>
    </ExplorationPanel>
  );
}
