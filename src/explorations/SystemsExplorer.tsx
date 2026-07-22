import { useCallback, useState } from "react";
import { Circle, Line, Text, Vector, useMovablePoint } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { VectorTeX } from "../components/lesson/ProseWithMath";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { ExplorationToggles } from "./ExplorationToggles";
import { PresetPicker } from "./PresetPicker";
import { LINEAR_SYSTEM_EXAMPLE } from "../lessons/exampleData";
import {
  classifyLinearSystem2x2,
  clamp,
  scaleVector,
  type Matrix2x2,
  type Vector2,
} from "../math";
import "./SystemsExplorer.css";

const EX = LINEAR_SYSTEM_EXAMPLE;
const BOUND = EX.bound;
const ENTRY = 5;

const ROLE_ROW_1 = "var(--role-original)";
const ROLE_ROW_2 = "var(--role-transformed)";
const ROLE_COL_1 = "var(--role-basis-1)";
const ROLE_COL_2 = "var(--role-basis-2)";
const ROLE_TARGET = "var(--role-selected)";
const ROLE_COMBO = "var(--role-invariant)";
const ROLE_SPAN = "var(--role-reachable)";
const ROLE_SOLUTION = "var(--role-selected)";

type Entries = { a: number; b: number; c: number; d: number };
type Preset = "unique" | "infinite" | "none" | "free";

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

const clampVal = (v: number) => clamp(v, -BOUND, BOUND);
const clampVec = (p: readonly [number, number]): [number, number] => [
  clampVal(p[0]),
  clampVal(p[1]),
];

/** Two distinct points on the line a·x + b·y = c (for Line.ThroughPoints). */
function twoPointsOnLine(
  a: number,
  b: number,
  c: number,
): [[number, number], [number, number]] {
  if (Math.abs(b) > 1e-9) {
    return [
      [0, c / b],
      [1, (c - a) / b],
    ];
  }
  if (Math.abs(a) > 1e-9) {
    return [
      [c / a, 0],
      [c / a, 1],
    ];
  }
  // Degenerate 0 = c row (a = b = 0): render nothing meaningful; a dot at origin.
  return [
    [0, 0],
    [1, 0],
  ];
}

/**
 * Lesson "Linear Systems" exploration — the row picture and the column picture
 * of the SAME system `A x = b`, side by side and synchronized. Drag the target
 * b or edit the matrix entries and watch both pictures — and the no/one/infinite
 * classification — change together. Classification comes from the shared
 * `classifyLinearSystem2x2`; nothing here re-derives the linear algebra.
 */
export function SystemsExplorer() {
  const [entries, setEntries] = useState<Entries>({
    a: EX.a[0][0],
    b: EX.a[0][1],
    c: EX.a[1][0],
    d: EX.a[1][1],
  });
  const [preset, setPreset] = useState<Preset>("unique");
  const [showCombination, setShowCombination] = useState(true);

  const target = useMovablePoint(EX.b as [number, number], {
    color: ROLE_TARGET,
    constrain: clampVec,
  });

  const b: Vector2 = [target.x, target.y];
  const A: Matrix2x2 = [
    [entries.a, entries.b],
    [entries.c, entries.d],
  ];
  const col1: Vector2 = [entries.a, entries.c];
  const col2: Vector2 = [entries.b, entries.d];

  const classification = classifyLinearSystem2x2(A, b);
  const { kind, determinant, independentColumns, consistent, solution } =
    classification;

  const line1Pts = twoPointsOnLine(entries.a, entries.b, b[0]);
  const line2Pts = twoPointsOnLine(entries.c, entries.d, b[1]);

  // Column-space line (dependent case): draw through the nonzero column.
  const spanDir: Vector2 =
    Math.hypot(col1[0], col1[1]) > 1e-9 ? col1 : col2;
  const spanP1 = scaleVector(spanDir, 40) as [number, number];
  const spanP2 = scaleVector(spanDir, -40) as [number, number];

  // Combination arrows for the unique case.
  const scaled1: Vector2 = solution
    ? [solution[0] * col1[0], solution[0] * col1[1]]
    : [0, 0];

  const applyPreset = useCallback(
    (next: Preset) => {
      setPreset(next);
      if (next === "unique") {
        setEntries({
          a: EX.a[0][0],
          b: EX.a[0][1],
          c: EX.a[1][0],
          d: EX.a[1][1],
        });
        target.setPoint(EX.b as [number, number]);
      } else if (next === "infinite") {
        setEntries({
          a: EX.aDependent[0][0],
          b: EX.aDependent[0][1],
          c: EX.aDependent[1][0],
          d: EX.aDependent[1][1],
        });
        target.setPoint(EX.bInfinite as [number, number]);
      } else if (next === "none") {
        setEntries({
          a: EX.aDependent[0][0],
          b: EX.aDependent[0][1],
          c: EX.aDependent[1][0],
          d: EX.aDependent[1][1],
        });
        target.setPoint(EX.bNone as [number, number]);
      }
      // "free" leaves the current state; the learner drives it.
    },
    [target],
  );

  const handleReset = useCallback(() => {
    applyPreset("unique");
    setShowCombination(true);
  }, [applyPreset]);

  const summary = (() => {
    if (kind === "unique") {
      return `Independent columns (det = ${fmt(determinant)} ≠ 0). The two lines cross at exactly one point, and exactly one recipe combines the columns to reach b: (x, y) = (${fmt(solution![0])}, ${fmt(solution![1])}). One solution.`;
    }
    if (kind === "infinite") {
      return `Dependent columns (det = 0) and b lies on the line they span. The two equations describe the same line, so every point on it solves the system — infinitely many solutions.`;
    }
    return `Dependent columns (det = 0), but b lies off the line the columns span. The two lines are parallel and never meet; no combination of the columns reaches b — no solution.`;
  })();

  const kindLabel =
    kind === "unique"
      ? "one solution"
      : kind === "infinite"
        ? "infinitely many"
        : "no solution";

  return (
    <ExplorationPanel
      explorationId="linear-systems"
      title="One system, two pictures"
      description="The row picture (left) and column picture (right) of the same system A x = b. Drag the gold target b, or open the matrix controls to change A — both pictures and the solution count update together."
      toolbar={
        <>
          <PresetPicker
            label="Case"
            activeId={preset}
            presets={[
              { id: "unique", label: "One solution", onSelect: () => applyPreset("unique") },
              { id: "infinite", label: "Infinitely many", onSelect: () => applyPreset("infinite") },
              { id: "none", label: "No solution", onSelect: () => applyPreset("none") },
              { id: "free", label: "Free drag", onSelect: () => applyPreset("free") },
            ]}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      summary={summary}
      controls={
        <>
          <ExplorationToggles
            toggles={[
              {
                id: "toggle-combination",
                label: "Show the column combination",
                checked: showCombination,
                onChange: setShowCombination,
              },
            ]}
          />
          <details className="exploration-details">
            <summary>Matrix A &amp; target b (numeric)</summary>
            <div className="exploration-details__body">
              <ParameterControls
                title="Matrix A (columns are col₁, col₂)"
                controls={[
                  { id: "sys-a", label: "a₁₁", value: entries.a, min: -ENTRY, max: ENTRY, onChange: (v) => { setEntries((e) => ({ ...e, a: v })); setPreset("free"); } },
                  { id: "sys-b", label: "a₁₂", value: entries.b, min: -ENTRY, max: ENTRY, onChange: (v) => { setEntries((e) => ({ ...e, b: v })); setPreset("free"); } },
                  { id: "sys-c", label: "a₂₁", value: entries.c, min: -ENTRY, max: ENTRY, onChange: (v) => { setEntries((e) => ({ ...e, c: v })); setPreset("free"); } },
                  { id: "sys-d", label: "a₂₂", value: entries.d, min: -ENTRY, max: ENTRY, onChange: (v) => { setEntries((e) => ({ ...e, d: v })); setPreset("free"); } },
                ]}
              />
              <ParameterControls
                title="Target b (also draggable)"
                controls={[
                  { id: "sys-b1", label: "b₁", value: b[0], min: -BOUND, max: BOUND, onChange: (v) => { target.setPoint([clampVal(v), b[1]]); setPreset("free"); } },
                  { id: "sys-b2", label: "b₂", value: b[1], min: -BOUND, max: BOUND, onChange: (v) => { target.setPoint([b[0], clampVal(v)]); setPreset("free"); } },
                ]}
              />
            </div>
          </details>
        </>
      }
      readout={
        <SceneReadout
          title="Classification"
          items={[
            {
              id: "kind",
              label: "Solutions",
              value: <span data-testid="systems-kind-readout">{kindLabel}</span>,
            },
            {
              id: "det",
              label: "det(A)",
              value: <span data-testid="systems-det-readout">{fmt(determinant)}</span>,
            },
            {
              id: "columns",
              label: "Columns",
              value: <span>{independentColumns ? "independent" : "dependent"}</span>,
            },
            {
              id: "consistent",
              label: "b reachable?",
              value: <span>{consistent ? "yes (in column space)" : "no"}</span>,
            },
            ...(solution
              ? [
                  {
                    id: "solution",
                    label: "solution (x, y)",
                    value: (
                      <span data-testid="systems-solution-readout" data-plain={`(${fmt(solution[0])}, ${fmt(solution[1])})`}>
                        <VectorTeX x={solution[0]} y={solution[1]} />
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      }
    >
      <div className="systems-explorer__panels">
        <figure className="systems-explorer__panel">
          <figcaption className="systems-explorer__caption">
            Row picture — two lines; a solution is where they meet
          </figcaption>
          <MafsSceneShell
            ariaLabel="Row picture: the two equations drawn as lines and their intersection"
            viewBox={{ x: [-7, 7], y: [-7, 7], padding: 0.3 }}
            height={340}
          >
            <Line.ThroughPoints point1={line1Pts[0]} point2={line1Pts[1]} color={ROLE_ROW_1} weight={2.5} />
            <Line.ThroughPoints point1={line2Pts[0]} point2={line2Pts[1]} color={ROLE_ROW_2} weight={2.5} />
            {solution && (
              <>
                <Circle center={solution as [number, number]} radius={0.22} color={ROLE_SOLUTION} fillOpacity={1} />
                <Text x={solution[0]} y={solution[1]} attach="ne" attachDistance={18} color={ROLE_SOLUTION} size={15}>
                  {`(${fmt(solution[0])}, ${fmt(solution[1])})`}
                </Text>
              </>
            )}
          </MafsSceneShell>
        </figure>

        <figure className="systems-explorer__panel">
          <figcaption className="systems-explorer__caption">
            Column picture — combine col₁, col₂ to reach b
          </figcaption>
          <MafsSceneShell
            ariaLabel="Column picture: the two matrix columns, the target b, and the combination reaching it"
            viewBox={{ x: [-7, 7], y: [-7, 7], padding: 0.3 }}
            height={340}
          >
            {!independentColumns && (
              <Line.Segment
                point1={spanP1}
                point2={spanP2}
                color={ROLE_SPAN}
                weight={2}
                style="dashed"
                opacity={0.5}
              />
            )}
            <Vector tip={col1 as [number, number]} color={ROLE_COL_1} weight={3} />
            <Vector tip={col2 as [number, number]} color={ROLE_COL_2} weight={3} />
            {showCombination && solution && (
              <>
                <Vector tail={[0, 0]} tip={scaled1 as [number, number]} color={ROLE_COL_1} weight={2} style="dashed" opacity={0.7} />
                <Vector tail={scaled1 as [number, number]} tip={b as [number, number]} color={ROLE_COL_2} weight={2} style="dashed" opacity={0.7} />
                <Vector tip={b as [number, number]} color={ROLE_COMBO} weight={3} opacity={0.5} />
              </>
            )}
            <Text x={col1[0]} y={col1[1]} attach="ne" attachDistance={12} color={ROLE_COL_1} size={15}>
              col₁
            </Text>
            <Text x={col2[0]} y={col2[1]} attach="ne" attachDistance={12} color={ROLE_COL_2} size={15}>
              col₂
            </Text>
            {target.element}
            <Text x={b[0]} y={b[1]} attach="se" attachDistance={16} color={ROLE_TARGET} size={15}>
              b
            </Text>
          </MafsSceneShell>
        </figure>
      </div>
      <ul className="systems-explorer__legend" aria-label="Legend">
        <li><span className="swatch swatch--row1" /> equation 1 (line)</li>
        <li><span className="swatch swatch--row2" /> equation 2 (line)</li>
        <li><span className="swatch swatch--col1" /> col₁</li>
        <li><span className="swatch swatch--col2" /> col₂</li>
        <li><span className="swatch swatch--target" /> target b</li>
      </ul>
    </ExplorationPanel>
  );
}
