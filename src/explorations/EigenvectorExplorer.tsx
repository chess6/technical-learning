import { useCallback, useMemo, useState } from "react";
import { Line, Text, Vector, useMovablePoint } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { MatrixTeX, VectorTeX } from "../components/lesson/ProseWithMath";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import { PresetPicker } from "./PresetPicker";
import {
  EIGEN_LESSON_EXAMPLE,
  EIGEN_LESSON_PRESETS,
} from "../lessons/exampleData";
import {
  classifyEigenCandidate,
  clamp,
  matrixVectorMultiply,
  requireMatrixExample,
  summarizeEigenAnalysis,
  type Matrix2x2,
  type Vector2,
} from "../math";
import "./DeterminantExplorer.css";

const DEFAULT = EIGEN_LESSON_EXAMPLE;
const INITIAL_V = (DEFAULT.inputVector ?? [1, 1]) as Vector2;
const ENTRY_MIN = -3;
const ENTRY_MAX = 3;
const VEC_BOUND = 3;

const ROLE_V = "var(--role-original)";
const ROLE_AV = "var(--role-transformed)";
const ROLE_EIGEN = "var(--role-selected)";
const ROLE_BASIS_1 = "var(--role-basis-1)";
const ROLE_BASIS_2 = "var(--role-basis-2)";

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

export function EigenvectorExplorer() {
  const [entries, setEntries] = useState<Entries>(() =>
    toEntries(DEFAULT.matrix),
  );
  const [showExact, setShowExact] = useState(true);
  const [showAv, setShowAv] = useState(true);

  const matrix = useMemo(() => toMatrix(entries), [entries]);
  const analysis = useMemo(() => summarizeEigenAnalysis(matrix), [matrix]);

  const vPoint = useMovablePoint(INITIAL_V as [number, number], {
    color: ROLE_V,
    constrain: (p) =>
      [
        clamp(p[0], -VEC_BOUND, VEC_BOUND),
        clamp(p[1], -VEC_BOUND, VEC_BOUND),
      ] as [number, number],
  });

  const v: Vector2 = [vPoint.x, vPoint.y];
  const Av = matrixVectorMultiply(matrix, v);
  const candidate = classifyEigenCandidate(matrix, v);

  const setEntry = useCallback((key: keyof Entries, value: number) => {
    setEntries((prev) => ({
      ...prev,
      [key]: clamp(value, ENTRY_MIN, ENTRY_MAX),
    }));
  }, []);

  const applyPreset = useCallback(
    (exampleId: string) => {
      const ex = requireMatrixExample(exampleId);
      setEntries(toEntries(ex.matrix));
      const next = (ex.inputVector ?? INITIAL_V) as [number, number];
      vPoint.setPoint(next);
    },
    [vPoint],
  );

  const handleReset = useCallback(() => {
    setEntries(toEntries(DEFAULT.matrix));
    vPoint.setPoint(INITIAL_V as [number, number]);
    setShowExact(true);
    setShowAv(true);
  }, [vPoint]);

  const lineAngleDeg =
    candidate.kind === "zero-vector"
      ? null
      : Math.round(((candidate.lineAngleRadians * 180) / Math.PI) * 10) / 10;

  return (
    <ExplorationPanel
      explorationId="eigenvectors-invariant-directions"
      title="Hunt for invariant directions"
      description="Drag a candidate vector v and compare it with Av. Dashed lines show exact real eigendirections from the math analysis."
      toolbar={
        <>
          <PresetPicker
            label="Examples"
            presets={EIGEN_LESSON_PRESETS.map((p) => ({
              id: p.id,
              label: p.label,
              onSelect: () => applyPreset(p.exampleId),
            }))}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      summary={
        candidate.kind === "zero-vector"
          ? candidate.summary
          : `${analysis.summary} ${candidate.summary}`
      }
      controls={
        <>
          <ParameterControls
            title="Candidate v"
            controls={[
              {
                id: "eig-vx",
                label: "vₓ",
                value: v[0],
                min: -VEC_BOUND,
                max: VEC_BOUND,
                onChange: (val) =>
                  vPoint.setPoint([clamp(val, -VEC_BOUND, VEC_BOUND), v[1]]),
              },
              {
                id: "eig-vy",
                label: "v_y",
                value: v[1],
                min: -VEC_BOUND,
                max: VEC_BOUND,
                onChange: (val) =>
                  vPoint.setPoint([v[0], clamp(val, -VEC_BOUND, VEC_BOUND)]),
              },
            ]}
          />
          <details className="exploration-details">
            <summary>Matrix entries &amp; display</summary>
            <div className="exploration-details__body">
              <ParameterControls
                title="Matrix A"
                controls={[
                  { id: "eig-a", label: "a₁₁", value: entries.a, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (val) => setEntry("a", val) },
                  { id: "eig-b", label: "a₁₂", value: entries.b, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (val) => setEntry("b", val) },
                  { id: "eig-c", label: "a₂₁", value: entries.c, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (val) => setEntry("c", val) },
                  { id: "eig-d", label: "a₂₂", value: entries.d, min: ENTRY_MIN, max: ENTRY_MAX, onChange: (val) => setEntry("d", val) },
                ]}
              />
              <ExplorationToggles
                toggles={[
                  { id: "eig-exact", label: "Exact eigendirections", checked: showExact, onChange: setShowExact },
                  { id: "eig-av", label: "Show Av", checked: showAv, onChange: setShowAv },
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
                <span data-testid="eigen-matrix-readout">
                  <MatrixTeX a={entries.a} b={entries.b} c={entries.c} d={entries.d} />
                </span>
              ),
            },
            {
              id: "v",
              label: "v",
              value: (
                <span data-testid="eigen-v-readout" data-plain={`(${fmt(v[0])}, ${fmt(v[1])})`}>
                  <VectorTeX x={v[0]} y={v[1]} name="v" />
                </span>
              ),
            },
            {
              id: "Av",
              label: "Av",
              value: (
                <span data-testid="eigen-av-readout" data-plain={`(${fmt(Av[0])}, ${fmt(Av[1])})`}>
                  <VectorTeX x={Av[0]} y={Av[1]} />
                </span>
              ),
            },
            {
              id: "angle",
              label: "Line angle",
              value: (
                <span data-testid="eigen-angle">
                  {lineAngleDeg === null ? "—" : `${lineAngleDeg}°`}
                </span>
              ),
            },
            {
              id: "kind",
              label: "Analysis",
              value: <span data-testid="eigen-kind">{analysis.kind}</span>,
            },
            {
              id: "candidate",
              label: "Candidate",
              value: <span data-testid="eigen-candidate">{candidate.kind}</span>,
            },
          ]}
        />
      }
    >
      <div className="eigen-explorer__scene">
        <MafsSceneShell
          ariaLabel="Candidate vector v, its image Av, and exact eigendirections"
          viewBox={{ x: [-4.5, 4.5], y: [-3.5, 3.5], padding: 0.35 }}
          height={400}
        >
          {showExact &&
            analysis.directions.map((dir, index) => {
              const tip = [dir[0] * 3, dir[1] * 3] as [number, number];
              const anti = [-tip[0], -tip[1]] as [number, number];
              return (
                <Line.Segment
                  key={`eig-line-${index}`}
                  point1={anti}
                  point2={tip}
                  color={ROLE_EIGEN}
                  weight={2}
                  style="dashed"
                  opacity={0.85}
                />
              );
            })}
          {showExact &&
            analysis.directions.map((dir, index) => {
              const tip = [dir[0] * 3, dir[1] * 3] as [number, number];
              const color = index === 0 ? ROLE_BASIS_1 : ROLE_BASIS_2;
              return (
                <Vector
                  key={`eig-arrow-${index}`}
                  tip={tip}
                  color={color}
                  weight={3}
                />
              );
            })}
          {showAv && (
            <Vector tip={Av as [number, number]} color={ROLE_AV} weight={4} />
          )}
          <Vector tip={v as [number, number]} color={ROLE_V} weight={4} />
          <Text x={v[0]} y={v[1]} attach="ne" attachDistance={12} color={ROLE_V} size={16}>
            v
          </Text>
          {showAv && (
            <Text x={Av[0]} y={Av[1]} attach="ne" attachDistance={12} color={ROLE_AV} size={16}>
              Av
            </Text>
          )}
          {vPoint.element}
        </MafsSceneShell>
      </div>
    </ExplorationPanel>
  );
}
