import { useCallback, useMemo, useState } from "react";
import { Line, Point, Text, Vector, useMovablePoint } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { MatrixTeX, VectorTeX } from "../components/lesson/ProseWithMath";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import { PresetPicker } from "./PresetPicker";
import { GraphicShape } from "./GraphicShape";
import { OPENING_GRAPHIC } from "../lessons/openingGraphic";
import {
  MATRIX_LESSON_EXAMPLE,
  TRANSFORM_LESSON_PRESETS,
} from "../lessons/exampleData";
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

const ROLE_SELECTED = "var(--role-selected)";
const OUTLINE = OPENING_GRAPHIC.outline as readonly [number, number][];

/** Reflection across y = x — the "same map, two matrices" example. */
const REFLECTION_XY: Matrix2x2 = [
  [0, 1],
  [1, 0],
];

function matrixApproxEqual(m: Matrix2x2, n: Matrix2x2, tol = 0.08): boolean {
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
type Mode = "transform" | "graphic-challenge";

/** Challenge targets: match the craft by placing the two column arrows. */
const CHALLENGE_TARGETS: readonly { id: string; label: string; exampleId: string }[] = [
  { id: "rotation", label: "Rotation", exampleId: "rotation" },
  { id: "reflection-xy", label: "Reflect y = x", exampleId: "reflection-xy" },
  { id: "shear", label: "Shear", exampleId: "shear-2-1" },
];

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
  const [mode, setMode] = useState<Mode>("transform");
  const [entries, setEntries] = useState<Entries>(() =>
    toEntries(DEFAULT_EXAMPLE.matrix),
  );
  const [t, setT] = useState(1);
  const [showTransformedGrid, setShowTransformedGrid] = useState(true);
  const [showBasis, setShowBasis] = useState(true);
  const [challengeExampleId, setChallengeExampleId] = useState("rotation");

  // Input vector (transform mode only): draggable arbitrary v.
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

  // Challenge mode: the two matrix columns ARE the draggable arrows the learner
  // controls (T(e₁) and T(e₂)); the matrix is read off their tips.
  const col1 = useMovablePoint([1, 0], {
    color: ROLE_BASIS_1,
    constrain: (p) =>
      [clamp(p[0], ENTRY_MIN, ENTRY_MAX), clamp(p[1], ENTRY_MIN, ENTRY_MAX)] as [
        number,
        number,
      ],
  });
  const col2 = useMovablePoint([0, 1], {
    color: ROLE_BASIS_2,
    constrain: (p) =>
      [clamp(p[0], ENTRY_MIN, ENTRY_MAX), clamp(p[1], ENTRY_MIN, ENTRY_MAX)] as [
        number,
        number,
      ],
  });

  // Single source of truth for the matrix, chosen by mode.
  const target: Matrix2x2 =
    mode === "graphic-challenge"
      ? [
          [col1.x, col2.x],
          [col1.y, col2.y],
        ]
      : toMatrix(entries);
  const current =
    mode === "graphic-challenge" ? target : lerpIdentityToMatrix(target, t);

  const output = matrixVectorMultiply(current, input);
  const e1 = matrixVectorMultiply(current, [1, 0]);
  const e2 = matrixVectorMultiply(current, [0, 1]);
  const det = determinant2x2(target);
  const singular = Math.abs(det) < 1e-9;

  const challengeTarget = useMemo(
    () => requireMatrixExample(challengeExampleId).matrix as Matrix2x2,
    [challengeExampleId],
  );
  const targetGraphic = applyMatrixToPoints(challengeTarget, OUTLINE);
  const currentGraphic = applyMatrixToPoints(current, OUTLINE);
  const targetMatched = matrixApproxEqual(target, challengeTarget);

  // "Same map, two matrices": reflection across y = x is diag(1, -1) in B.
  const isReflectionXY = matrixApproxEqual(target, REFLECTION_XY);

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
  }, []);

  const enterChallenge = useCallback(
    (exampleId: string) => {
      setMode("graphic-challenge");
      setChallengeExampleId(exampleId);
      // Start from the identity columns, so the learner must build the map.
      col1.setPoint([1, 0]);
      col2.setPoint([0, 1]);
      setT(1);
    },
    [col1, col2],
  );

  const leaveChallenge = useCallback(() => {
    setMode("transform");
  }, []);

  const handleReset = useCallback(() => {
    setMode("transform");
    setEntries(toEntries(DEFAULT_EXAMPLE.matrix));
    setT(1);
    setShowTransformedGrid(true);
    setShowBasis(true);
    setPoint(INITIAL_INPUT as [number, number]);
    col1.setPoint([1, 0]);
    col2.setPoint([0, 1]);
  }, [setPoint, col1, col2]);

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

  const inChallenge = mode === "graphic-challenge";

  return (
    <ExplorationPanel
      explorationId="matrix-transformation"
      title="Transform the plane"
      description="Edit the matrix A from the guided animation, or switch to the graphic challenge and place the two column arrows to match a target craft."
      toolbar={
        <>
          <PresetPicker
            label="Mode"
            activeId={mode}
            presets={[
              { id: "transform", label: "Transform the plane", onSelect: leaveChallenge },
              {
                id: "graphic-challenge",
                label: "Graphic challenge",
                onSelect: () => enterChallenge(challengeExampleId),
              },
            ]}
          />
          {inChallenge ? (
            <PresetPicker
              label="Target craft (place T(e₁), T(e₂) to match)"
              activeId={challengeExampleId}
              presets={CHALLENGE_TARGETS.map((tgt) => ({
                id: tgt.id,
                label: tgt.label,
                onSelect: () => enterChallenge(tgt.exampleId),
              }))}
            />
          ) : (
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
          )}
          <ResetButton onReset={handleReset} />
        </>
      }
      controls={
        inChallenge ? (
          <p className="matrix-explorer__challenge-hint">
            Drag the two column arrows <strong>T(e₁)</strong> and{" "}
            <strong>T(e₂)</strong>. The matrix columns update from where you place
            them — match the faint target craft. You are controlling two vectors,
            not four sliders.
          </p>
        ) : (
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
                  ]}
                />
              </div>
            </details>
          </>
        )
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
            ...(inChallenge
              ? []
              : [
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
                ]),
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
            ...(!inChallenge && singular
              ? [
                  {
                    id: "graphic-collapse",
                    label: "Note",
                    value: (
                      <span data-testid="graphic-collapse-readout">
                        dependent columns — outputs collapse onto a line
                      </span>
                    ),
                  },
                ]
              : []),
            ...(!inChallenge && isReflectionXY
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
            ...(inChallenge
              ? [
                  {
                    id: "target-match",
                    label: "Target match",
                    value: (
                      <span data-testid="target-match-readout">
                        {targetMatched ? "matched ✓" : "place both column arrows to match"}
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
          ariaLabel={
            inChallenge
              ? "Graphic challenge: place the two column arrows to transform the craft onto the faint target craft"
              : "Input vector and its image under the matrix, with transformed basis and grid"
          }
          viewBox={{ x: [-4, 5.5], y: [-3.5, 4.5], padding: 0.45 }}
          height={380}
        >
          {showTransformedGrid && (
            <TransformedGrid matrix={current} color={ROLE_GRID} />
          )}

          {inChallenge && (
            <>
              {/* Faint original craft + faint target craft + live transformed craft. */}
              <GraphicShape matrix={[[1, 0], [0, 1]]} variant="ghost" />
              <GraphicShape matrix={challengeTarget} variant="target" />
              <GraphicShape matrix={current} variant="solid" />
              {/* Vertex correspondence at the nose helps read the match. */}
              <Point x={targetGraphic[0]![0]} y={targetGraphic[0]![1]} color={ROLE_SELECTED} />
              <Point x={currentGraphic[0]![0]} y={currentGraphic[0]![1]} color={ROLE_TRANSFORMED} />
            </>
          )}

          {showBasis && !inChallenge && (
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

          {inChallenge ? (
            <>
              {/* The column arrows the learner drags = T(e₁), T(e₂). */}
              <Vector tip={[col1.x, col1.y]} color={ROLE_BASIS_1} weight={3} />
              <Vector tip={[col2.x, col2.y]} color={ROLE_BASIS_2} weight={3} />
              <Text x={col1.x} y={col1.y} attach="ne" attachDistance={12} color={ROLE_BASIS_1} size={15}>
                T(e₁)
              </Text>
              <Text x={col2.x} y={col2.y} attach="ne" attachDistance={12} color={ROLE_BASIS_2} size={15}>
                T(e₂)
              </Text>
              {col1.element}
              {col2.element}
            </>
          ) : (
            <>
              <Vector tip={input as [number, number]} color={ROLE_ORIGINAL} weight={3} style="solid" />
              <Vector tip={output as [number, number]} color={ROLE_TRANSFORMED} weight={3} style="dashed" />
              <Text x={input[0]} y={input[1]} attach="nw" attachDistance={12} color={ROLE_ORIGINAL} size={15}>
                v
              </Text>
              <Text x={output[0]} y={output[1]} attach="ne" attachDistance={12} color={ROLE_TRANSFORMED} size={15}>
                A v
              </Text>
              {inputElement}
            </>
          )}
        </MafsSceneShell>
      </div>
      <ul className="matrix-explorer__legend" aria-label="Legend">
        {inChallenge ? (
          <>
            <li><span className="swatch swatch--basis1" /> T(e₁) = column 1 (drag)</li>
            <li><span className="swatch swatch--basis2" /> T(e₂) = column 2 (drag)</li>
            <li><span className="swatch swatch--transformed" /> Your craft · faint = target</li>
          </>
        ) : (
          <>
            <li><span className="swatch swatch--original" /> Input v (solid)</li>
            <li><span className="swatch swatch--transformed" /> Output A·v (dashed)</li>
            <li><span className="swatch swatch--basis1" /> Transformed e₁</li>
            <li><span className="swatch swatch--basis2" /> Transformed e₂</li>
          </>
        )}
      </ul>
    </ExplorationPanel>
  );
}
