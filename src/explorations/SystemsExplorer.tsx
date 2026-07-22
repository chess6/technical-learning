import { useCallback, useState } from "react";
import { Circle, Line, Polygon, Text, Vector, useMovablePoint } from "mafs";
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
  classifyRowConstraint,
  clamp,
  scaleVector,
  type Matrix2x2,
  type RowConstraint,
  type Vector2,
} from "../math";
import "./SystemsExplorer.css";

const EX = LINEAR_SYSTEM_EXAMPLE;
const BOUND = EX.bound;
const ENTRY = 5;
/** Half-width of each fixed square view box. */
const VIEW = 7;
const EPS = 1e-6;

const ROLE_ROW_1 = "var(--role-original)";
const ROLE_ROW_2 = "var(--role-transformed)";
const ROLE_COL_1 = "var(--role-basis-1)";
const ROLE_COL_2 = "var(--role-basis-2)";
const ROLE_TARGET = "var(--role-selected)";
const ROLE_COMBO = "var(--role-invariant)";
const ROLE_SPAN = "var(--role-reachable)";
const ROLE_SOLUTION = "var(--role-selected)";
const ROLE_MUTED = "var(--role-intermediate)";

type Entries = { a: number; b: number; c: number; d: number };
type Preset = "unique" | "infinite" | "none" | "near-singular" | "free";

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

const clampVal = (v: number) => clamp(v, -BOUND, BOUND);
const clampVec = (p: readonly [number, number]): [number, number] => [
  clampVal(p[0]),
  clampVal(p[1]),
];

const approxEntries = (e: Entries, m: readonly [readonly number[], readonly number[]]) =>
  Math.abs(e.a - m[0][0]!) < EPS &&
  Math.abs(e.b - m[0][1]!) < EPS &&
  Math.abs(e.c - m[1][0]!) < EPS &&
  Math.abs(e.d - m[1][1]!) < EPS;

const approxVec = (p: Vector2, q: readonly [number, number]) =>
  Math.abs(p[0] - q[0]!) < EPS && Math.abs(p[1] - q[1]!) < EPS;

/**
 * One coefficient pair `(x, y)` that combines the columns toward `b`, driven by
 * a single parameter `t` — the heart of the dependent case. The reachable set is
 * the line `s·e` (e = the nonzero column), and the parameter does two DIFFERENT
 * teaching jobs depending on whether `b` is reachable:
 *
 * - **consistent** (`b` on the line): sweep the *null direction*. The endpoint
 *   stays pinned at `b` while both scaled arrows change — "many recipes, one
 *   target". This is the infinite family `y = t, x = s0 − k·t`.
 * - **inconsistent** (`b` off the line): sweep the *endpoint* along the reachable
 *   line instead (`x = t, y = 0` ⇒ endpoint `t·e`). Every recipe lands somewhere
 *   on the columns' line and none of them touch `b` — reachability visibly fails.
 */
function dependentRecipe(
  col1: Vector2,
  col2: Vector2,
  b: Vector2,
  t: number,
  consistent: boolean,
): { x: number; y: number; combo: Vector2 } | null {
  const n1 = Math.hypot(col1[0], col1[1]);
  const n2 = Math.hypot(col2[0], col2[1]);
  if (n1 <= 1e-9 && n2 <= 1e-9) return null; // zero matrix — nothing to combine

  const combineOf = (x: number, y: number): Vector2 => [
    x * col1[0] + y * col2[0],
    x * col1[1] + y * col2[1],
  ];

  const useCol1 = n1 > 1e-9;
  const e: Vector2 = useCol1 ? col1 : col2;
  const other: Vector2 = useCol1 ? col2 : col1;
  const ee = e[0] * e[0] + e[1] * e[1];
  const s0 = (b[0] * e[0] + b[1] * e[1]) / ee; // scalar of b projected onto e
  const k = Math.abs(e[0]) >= Math.abs(e[1]) ? other[0] / e[0] : other[1] / e[1];

  if (!consistent) {
    // b unreachable: put all the weight on the nonzero column and let t slide the
    // endpoint t·e along the whole reachable line — it never equals b.
    return useCol1
      ? { x: t, y: 0, combo: combineOf(t, 0) }
      : { x: 0, y: t, combo: combineOf(0, t) };
  }

  // b reachable: sweep the null direction; the endpoint s0·e (= b) stays fixed.
  if (useCol1) {
    const y = t;
    const x = s0 - k * y;
    return { x, y, combo: combineOf(x, y) };
  }
  const x = t;
  const y = s0 - k * x;
  return { x, y, combo: combineOf(x, y) };
}

/** Human-readable geometry of a degenerate row, or `null` for an honest line. */
function degenerateRowNote(rc: RowConstraint, index: 1 | 2): string | null {
  if (rc.kind === "all") return `equation ${index}: 0 = 0 — every point (no constraint)`;
  if (rc.kind === "empty") return `equation ${index}: 0 = c ≠ 0 — impossible (no points)`;
  return null;
}

/**
 * Lesson "Linear Systems" exploration — the row picture (coefficient space) and
 * the column picture (output space) of the SAME system `A x = b`, side by side.
 *
 * - Row picture lives in **coefficient space** `(x, y)`; a solution is a *point*
 *   where the constraint lines meet. Each row is classified with
 *   `classifyRowConstraint`, so an all-zero row is drawn as "all points" or
 *   "impossible" rather than a false line.
 * - Column picture lives in **output space**; the columns are blended to reach
 *   `b`. In the dependent case a `t` slider sweeps the infinitely many recipes
 *   that reach the same endpoint (or shows none reaching an off-line `b`).
 *
 * All classification comes from the shared `classifyLinearSystem2x2`; nothing
 * here re-derives the linear algebra. The highlighted preset is *derived* from
 * the live state, so dragging `b` off a preset correctly falls back to "free".
 */
export function SystemsExplorer() {
  const [entries, setEntries] = useState<Entries>({
    a: EX.a[0][0],
    b: EX.a[0][1],
    c: EX.a[1][0],
    d: EX.a[1][1],
  });
  const [showCombination, setShowCombination] = useState(true);
  const [autoFit, setAutoFit] = useState(false);
  const [t, setT] = useState(1);

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
  const { kind, independentColumns, consistent, solution } = classification;

  // Row picture: each equation as its true geometric object (line / all / none).
  const rc1 = classifyRowConstraint(entries.a, entries.b, b[0]);
  const rc2 = classifyRowConstraint(entries.c, entries.d, b[1]);
  const rowNotes = [degenerateRowNote(rc1, 1), degenerateRowNote(rc2, 2)].filter(
    (n): n is string => n !== null,
  );

  // Derive the highlighted preset from the ACTUAL state (fixes the stale-preset
  // bug: dragging b off "Infinitely many" now reads as "free", never a mismatch).
  const activePreset: Preset = approxEntries(entries, EX.a) && approxVec(b, EX.b)
    ? "unique"
    : approxEntries(entries, EX.aDependent) && approxVec(b, EX.bInfinite)
      ? "infinite"
      : approxEntries(entries, EX.aDependent) && approxVec(b, EX.bNone)
        ? "none"
        : approxEntries(entries, EX.aNearSingular) && approxVec(b, EX.bNearSingular)
          ? "near-singular"
          : "free";

  // A near-singular independent matrix can push the unique solution far outside
  // the fixed view box. Detect it so we can warn instead of silently clipping.
  const solutionOffscreen =
    solution !== null &&
    (Math.abs(solution[0]) > VIEW || Math.abs(solution[1]) > VIEW);

  // Auto-fit: when the unique solution is off-screen, optionally widen the row
  // (coefficient-space) view just enough to bring it back in, so learners can see
  // the far-away crossing instead of only being told it exists.
  const rowExtent =
    autoFit && solution
      ? Math.max(VIEW, Math.abs(solution[0]) + 1, Math.abs(solution[1]) + 1)
      : VIEW;
  const rowCorners: [number, number][] = [
    [-rowExtent, -rowExtent],
    [rowExtent, -rowExtent],
    [rowExtent, rowExtent],
    [-rowExtent, rowExtent],
  ];
  const solutionInRowView =
    solution !== null &&
    Math.abs(solution[0]) <= rowExtent &&
    Math.abs(solution[1]) <= rowExtent;

  // Column-space line (dependent case): draw through the nonzero column.
  const spanDir: Vector2 = Math.hypot(col1[0], col1[1]) > 1e-9 ? col1 : col2;
  const spanP1 = scaleVector(spanDir, 40) as [number, number];
  const spanP2 = scaleVector(spanDir, -40) as [number, number];

  // The recipe drawn in the column picture. Independent → the unique solution;
  // dependent → the t-swept family (endpoint fixed, arrows moving).
  const recipe =
    independentColumns && solution
      ? { x: solution[0], y: solution[1], combo: b }
      : !independentColumns
        ? dependentRecipe(col1, col2, b, t, consistent)
        : null;
  const hasRecipe = recipe !== null;
  const scaled1: Vector2 = recipe
    ? [recipe.x * col1[0], recipe.x * col1[1]]
    : [0, 0];
  const comboPt: Vector2 = recipe ? recipe.combo : [0, 0];
  const recipeReachesB = recipe
    ? Math.hypot(comboPt[0] - b[0], comboPt[1] - b[1]) < 1e-6
    : false;
  // The second (col₂) arrow is hidden when the recipe puts no weight on col₂
  // (the no-solution sweep uses only the nonzero column) so we never draw a
  // zero-length vector.
  const secondArrowVisible =
    Math.hypot(comboPt[0] - scaled1[0], comboPt[1] - scaled1[1]) > 1e-6;
  const showArrows = showCombination && hasRecipe && !solutionOffscreen;

  const applyPreset = useCallback(
    (next: Preset) => {
      setT(1);
      if (next === "unique") {
        setEntries({ a: EX.a[0][0], b: EX.a[0][1], c: EX.a[1][0], d: EX.a[1][1] });
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
      } else if (next === "near-singular") {
        setEntries({
          a: EX.aNearSingular[0][0],
          b: EX.aNearSingular[0][1],
          c: EX.aNearSingular[1][0],
          d: EX.aNearSingular[1][1],
        });
        target.setPoint(EX.bNearSingular as [number, number]);
        setAutoFit(false);
      }
    },
    [target],
  );

  const handleReset = useCallback(() => {
    applyPreset("unique");
    setShowCombination(true);
    setAutoFit(false);
  }, [applyPreset]);

  const summary = (() => {
    if (kind === "unique") {
      if (solutionOffscreen) {
        return `Independent columns, but only just: A is nearly singular (det ≈ ${fmt(classification.determinant)}), so the two lines are almost parallel and cross very far away — the single solution ${solution ? `(${fmt(solution[0])}, ${fmt(solution[1])})` : ""} sits off-screen. There is still exactly one solution mathematically, but it is highly sensitive: a tiny nudge of b or A swings it a long way (poor conditioning). Turn on “auto-fit” to pull the crossing into view, or move A away from dependent columns.`;
      }
      return `Independent columns: the map x ↦ A x is reversible, so every target is reached by exactly one recipe. Here the two lines cross once and (x, y) = (${fmt(solution![0])}, ${fmt(solution![1])}). One solution.`;
    }
    if (kind === "infinite") {
      const rows =
        rc1.kind === "all" && rc2.kind === "all"
          ? "Both equations read 0 = 0 — no constraint at all — so every point of the plane solves the system."
          : rc1.kind === "all" || rc2.kind === "all"
            ? "One equation reads 0 = 0 (no constraint); the other is a single line, so that whole line is the solution set."
            : "The two equations describe the same line, so every point on it is a solution.";
      return `Dependent columns, and b lies on the line they span, so b is reachable. ${rows} Slide t: infinitely many recipes reach the same b. Infinitely many solutions.`;
    }
    // none
    const rows =
      rc1.kind === "empty" || rc2.kind === "empty"
        ? "One equation reads 0 = c with c ≠ 0 — impossible on its own — so nothing can satisfy the system."
        : "The two lines are parallel and never meet.";
    return `Dependent columns, and b lies off the line they span, so no recipe reaches it — slide t and watch the endpoint slide along the columns' line, never touching b. ${rows} No solution.`;
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
      description="Left: the row picture in coefficient space (x, y) — each equation is a line and a solution is where they meet. Right: the column picture in output space — blend col₁, col₂ to reach b. Drag the gold target b, edit A, or (when the columns are dependent) sweep the recipe parameter t to see many recipes reach one b."
      toolbar={
        <>
          <PresetPicker
            label="Case"
            activeId={activePreset}
            presets={[
              { id: "unique", label: "One solution", onSelect: () => applyPreset("unique") },
              { id: "infinite", label: "Infinitely many", onSelect: () => applyPreset("infinite") },
              { id: "none", label: "No solution", onSelect: () => applyPreset("none") },
              { id: "near-singular", label: "Near-singular", onSelect: () => applyPreset("near-singular") },
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
              {
                id: "toggle-autofit",
                label: "Auto-fit an off-screen solution",
                checked: autoFit,
                onChange: setAutoFit,
              },
            ]}
          />
          {!independentColumns && hasRecipe && (
            <ParameterControls
              title="Recipe parameter t (dependent columns)"
              controls={[
                {
                  id: "sys-t",
                  label: "t",
                  value: t,
                  min: -5,
                  max: 5,
                  onChange: setT,
                },
              ]}
            />
          )}
          <details className="exploration-details">
            <summary>Matrix A &amp; target b (numeric)</summary>
            <div className="exploration-details__body">
              <ParameterControls
                title="Matrix A (columns are col₁, col₂)"
                controls={[
                  { id: "sys-a", label: "a₁₁", value: entries.a, min: -ENTRY, max: ENTRY, onChange: (v) => setEntries((e) => ({ ...e, a: v })) },
                  { id: "sys-b", label: "a₁₂", value: entries.b, min: -ENTRY, max: ENTRY, onChange: (v) => setEntries((e) => ({ ...e, b: v })) },
                  { id: "sys-c", label: "a₂₁", value: entries.c, min: -ENTRY, max: ENTRY, onChange: (v) => setEntries((e) => ({ ...e, c: v })) },
                  { id: "sys-d", label: "a₂₂", value: entries.d, min: -ENTRY, max: ENTRY, onChange: (v) => setEntries((e) => ({ ...e, d: v })) },
                ]}
              />
              <ParameterControls
                title="Target b (also draggable)"
                controls={[
                  { id: "sys-b1", label: "b₁", value: b[0], min: -BOUND, max: BOUND, onChange: (v) => target.setPoint([clampVal(v), b[1]]) },
                  { id: "sys-b2", label: "b₂", value: b[1], min: -BOUND, max: BOUND, onChange: (v) => target.setPoint([b[0], clampVal(v)]) },
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
              id: "columns",
              label: "Columns",
              value: <span data-testid="systems-columns-readout">{independentColumns ? "independent" : "dependent"}</span>,
            },
            {
              id: "consistent",
              label: "b reachable?",
              value: <span>{consistent ? "yes (in column space)" : "no (off column space)"}</span>,
            },
            ...(kind === "unique" && solution
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
            ...(!independentColumns && recipe
              ? [
                  {
                    id: "recipe",
                    label: "recipe (x, y) at t",
                    value: (
                      <span data-testid="systems-recipe-readout" data-plain={`(${fmt(recipe.x)}, ${fmt(recipe.y)})`}>
                        <VectorTeX x={recipe.x} y={recipe.y} />
                      </span>
                    ),
                  },
                  {
                    id: "reach",
                    label: "this recipe reaches b?",
                    value: (
                      <span data-testid="systems-reach-readout">
                        {recipeReachesB
                          ? "yes — and so does every t (infinitely many)"
                          : "no — the endpoint stays on the columns' line"}
                      </span>
                    ),
                  },
                ]
              : []),
            ...(solutionOffscreen
              ? [
                  {
                    id: "offscreen",
                    label: "heads up",
                    value: (
                      <span data-testid="systems-offscreen-readout">
                        {solutionInRowView
                          ? "near-singular A — solution fitted into view (sensitive)"
                          : "near-singular A — solution off-screen; enable auto-fit"}
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
            Row picture — <strong>coefficient space (x, y)</strong>: each equation is a line; a solution is a point on both
          </figcaption>
          <MafsSceneShell
            ariaLabel="Row picture in coefficient space: the two equations drawn as lines and their intersection"
            viewBox={{ x: [-rowExtent, rowExtent], y: [-rowExtent, rowExtent], padding: 0.3 }}
            height={340}
          >
            {rc1.kind === "line" && (
              <Line.ThroughPoints point1={rc1.point1 as [number, number]} point2={rc1.point2 as [number, number]} color={ROLE_ROW_1} weight={2.5} />
            )}
            {rc1.kind === "all" && (
              <Polygon points={rowCorners} color={ROLE_ROW_1} fillOpacity={0.06} strokeOpacity={0.25} weight={1} />
            )}
            {rc2.kind === "line" && (
              <Line.ThroughPoints point1={rc2.point1 as [number, number]} point2={rc2.point2 as [number, number]} color={ROLE_ROW_2} weight={2.5} />
            )}
            {rc2.kind === "all" && (
              <Polygon points={rowCorners} color={ROLE_ROW_2} fillOpacity={0.06} strokeOpacity={0.25} weight={1} />
            )}
            {solution && solutionInRowView && (
              <>
                <Circle center={solution as [number, number]} radius={0.03 * rowExtent} color={ROLE_SOLUTION} fillOpacity={1} />
                <Text x={solution[0]} y={solution[1]} attach="ne" attachDistance={18} color={ROLE_SOLUTION} size={15}>
                  {`(${fmt(solution[0])}, ${fmt(solution[1])})`}
                </Text>
              </>
            )}
            {rowNotes.map((note, i) => (
              <Text key={note} x={-rowExtent + 0.4} y={rowExtent - 0.5 - i * 0.8} attach="e" color={i === 0 ? ROLE_ROW_1 : ROLE_ROW_2} size={13}>
                {note}
              </Text>
            ))}
            {solutionOffscreen && !solutionInRowView && (
              <Text x={0} y={0} attach="n" attachDistance={6} color={ROLE_SOLUTION} size={14}>
                solution off-screen (near-singular) — enable auto-fit
              </Text>
            )}
          </MafsSceneShell>
        </figure>

        <figure className="systems-explorer__panel">
          <figcaption className="systems-explorer__caption">
            Column picture — <strong>output space</strong>: blend col₁, col₂ to reach b
          </figcaption>
          <MafsSceneShell
            ariaLabel="Column picture in output space: the two matrix columns, the target b, and the combination reaching it"
            viewBox={{ x: [-VIEW, VIEW], y: [-VIEW, VIEW], padding: 0.3 }}
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
            {showArrows && (
              <>
                <Vector tail={[0, 0]} tip={scaled1 as [number, number]} color={ROLE_COL_1} weight={2} style="dashed" opacity={0.75} />
                {secondArrowVisible && (
                  <Vector tail={scaled1 as [number, number]} tip={comboPt as [number, number]} color={ROLE_COL_2} weight={2} style="dashed" opacity={0.75} />
                )}
                {recipeReachesB ? (
                  <Vector tip={b as [number, number]} color={ROLE_COMBO} weight={3} opacity={0.5} />
                ) : (
                  <>
                    <Circle center={comboPt as [number, number]} radius={0.16} color={ROLE_COMBO} fillOpacity={1} />
                    <Line.Segment point1={comboPt as [number, number]} point2={b as [number, number]} color={ROLE_MUTED} weight={1.5} style="dashed" opacity={0.6} />
                    <Text x={comboPt[0]} y={comboPt[1]} attach="sw" attachDistance={14} color={ROLE_COMBO} size={13}>
                      recipe endpoint
                    </Text>
                  </>
                )}
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
        <li><span className="swatch swatch--row1" /> equation 1</li>
        <li><span className="swatch swatch--row2" /> equation 2</li>
        <li><span className="swatch swatch--col1" /> col₁</li>
        <li><span className="swatch swatch--col2" /> col₂</li>
        <li><span className="swatch swatch--target" /> target b</li>
      </ul>
    </ExplorationPanel>
  );
}
