import { useCallback, useState } from "react";
import { Circle, Line, Polygon, Text, Vector } from "mafs";
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
  generateSolution,
  matrixVectorMultiply,
  nullspaceBasis2x2,
  solutionSet2x2,
  type Matrix2x2,
  type Subspace2D,
  type Vector2,
} from "../math";
import "./SolutionSetExplorer.css";

const EX = LINEAR_SYSTEM_EXAMPLE;
const BOUND = EX.bound;
const ENTRY = 5;
/** Half-width of each fixed square view box (math units). */
const VIEW = 6;
const EPS = 1e-6;

const ROLE_NULL = "var(--role-basis-1)";
const ROLE_SOLUTION = "var(--role-selected)";
const ROLE_PARTICULAR = "var(--role-invariant)";
const ROLE_SECOND = "var(--role-transformed)";
const ROLE_DIFFERENCE = "var(--role-basis-2)";
const ROLE_OFFSET = "var(--role-reachable)";
const ROLE_AXIS = "var(--role-intermediate)";

type Entries = { a: number; b: number; c: number; d: number };
type Preset = "infinite" | "unique" | "homogeneous" | "none" | "plane" | "free";

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

const clampVal = (v: number) => clamp(v, -BOUND, BOUND);

const approxEntries = (
  e: Entries,
  m: readonly [readonly number[], readonly number[]],
) =>
  Math.abs(e.a - m[0][0]!) < EPS &&
  Math.abs(e.b - m[0][1]!) < EPS &&
  Math.abs(e.c - m[1][0]!) < EPS &&
  Math.abs(e.d - m[1][1]!) < EPS;

const approxVec = (p: Vector2, q: readonly [number, number]) =>
  Math.abs(p[0] - q[0]!) < EPS && Math.abs(p[1] - q[1]!) < EPS;

const ZERO_MATRIX: [[number, number], [number, number]] = [
  [0, 0],
  [0, 0],
];

/**
 * The null space of `A`, drawn correctly for BOTH independent and singular `A`.
 * `nullspaceBasis2x2` assumes a singular matrix (it returns a vector orthogonal
 * to a row), so an independent (invertible) matrix must short-circuit to the
 * trivial null space {0} before we ever consult it. See docs/insights/solution-sets.md.
 */
function nullSpaceOf(A: Matrix2x2): Subspace2D {
  const cls = classifyLinearSystem2x2(A, [0, 0]);
  if (cls.independentColumns) return { kind: "zero" };
  return nullspaceBasis2x2(A);
}

/** Two endpoints of a line through `p` with direction `dir`, clipped to ±VIEW. */
function lineEndpoints(
  p: Vector2,
  dir: Vector2,
): [[number, number], [number, number]] {
  const L = 2 * VIEW;
  const n = Math.hypot(dir[0], dir[1]) || 1;
  const ux = dir[0] / n;
  const uy = dir[1] / n;
  return [
    [p[0] - ux * L, p[1] - uy * L],
    [p[0] + ux * L, p[1] + uy * L],
  ];
}

const VIEW_CORNERS: [number, number][] = [
  [-VIEW, -VIEW],
  [VIEW, -VIEW],
  [VIEW, VIEW],
  [-VIEW, VIEW],
];

/**
 * Lesson "Solution Sets & Homogeneous Systems" exploration.
 *
 * Two linked solution-space panels of the SAME matrix `A`:
 *
 *  - **left** the homogeneous system `A x = 0` — its solution set is `Null(A)`,
 *    a subspace through the origin (a point, a line, or the whole plane);
 *  - **right** `A x = b` — its solution set is `x_p + Null(A)` (the same shape
 *    slid off the origin), or empty when `b` is unreachable.
 *
 * A free-variable slider `t` slides a second solution `x_p + t·v` along the set,
 * and the difference of two solutions is drawn translated to the origin, landing
 * on the null line — the discovery engine that any two solutions differ by a
 * homogeneous solution. All structure comes from the shared `solutionSet2x2` /
 * `nullspaceBasis2x2`; nothing here re-derives the linear algebra.
 */
export function SolutionSetExplorer() {
  const [entries, setEntries] = useState<Entries>({
    a: EX.aDependent[0][0],
    b: EX.aDependent[0][1],
    c: EX.aDependent[1][0],
    d: EX.aDependent[1][1],
  });
  const [b, setB] = useState<Vector2>(EX.bInfinite as Vector2);
  const [t, setT] = useState(1);
  const [showDifference, setShowDifference] = useState(true);

  const A: Matrix2x2 = [
    [entries.a, entries.b],
    [entries.c, entries.d],
  ];

  const set = solutionSet2x2(A, b);
  const nul = nullSpaceOf(A);
  const cls = classifyLinearSystem2x2(A, b);
  const isHomogeneous = approxVec(b, [0, 0]);

  const direction: Vector2 | null = set.kind === "line" ? set.direction : null;
  const particular: Vector2 | null = set.kind === "empty" ? null : set.particular;
  const second: Vector2 | null =
    direction && particular ? generateSolution(particular, direction, t) : null;
  // The difference second − x_p = t·v is a homogeneous solution: A·(diff) = 0.
  const difference: Vector2 | null =
    second && particular ? [second[0] - particular[0], second[1] - particular[1]] : null;
  const secondSolves = second
    ? (() => {
        const img = matrixVectorMultiply(A, second);
        return Math.abs(img[0] - b[0]) < 1e-6 && Math.abs(img[1] - b[1]) < 1e-6;
      })()
    : false;

  const activePreset: Preset = approxEntries(entries, EX.aDependent)
    ? approxVec(b, EX.bInfinite)
      ? "infinite"
      : approxVec(b, [0, 0])
        ? "homogeneous"
        : approxVec(b, EX.bNone)
          ? "none"
          : "free"
    : approxEntries(entries, EX.a) && approxVec(b, EX.b)
      ? "unique"
      : approxEntries(entries, ZERO_MATRIX) && approxVec(b, [0, 0])
        ? "plane"
        : "free";

  const applyPreset = useCallback((next: Exclude<Preset, "free">) => {
    setT(1);
    if (next === "infinite") {
      setEntries({ a: 1, b: 2, c: 2, d: 4 });
      setB(EX.bInfinite as Vector2);
    } else if (next === "unique") {
      setEntries({ a: EX.a[0][0], b: EX.a[0][1], c: EX.a[1][0], d: EX.a[1][1] });
      setB(EX.b as Vector2);
    } else if (next === "homogeneous") {
      setEntries({ a: 1, b: 2, c: 2, d: 4 });
      setB([0, 0]);
    } else if (next === "none") {
      setEntries({ a: 1, b: 2, c: 2, d: 4 });
      setB(EX.bNone as Vector2);
    } else if (next === "plane") {
      setEntries({ a: 0, b: 0, c: 0, d: 0 });
      setB([0, 0]);
    }
  }, []);

  const handleReset = useCallback(() => {
    applyPreset("infinite");
    setShowDifference(true);
  }, [applyPreset]);

  // Null-space geometry (shared by both panels).
  const nullLine =
    nul.kind === "line" ? lineEndpoints([0, 0], nul.basis) : null;

  // Solution-set geometry (right panel).
  const solLine =
    set.kind === "line" ? lineEndpoints(set.particular, set.direction) : null;

  const kindLabel =
    set.kind === "empty"
      ? "empty (no solutions)"
      : set.kind === "point"
        ? "a single point"
        : set.kind === "line"
          ? "an affine line (dimension 1)"
          : "the whole plane (dimension 2)";

  const nullLabel =
    nul.kind === "zero"
      ? "only the zero vector, {0} (trivial)"
      : nul.kind === "line"
        ? `a line through the origin, span{(${fmt(nul.basis[0])}, ${fmt(nul.basis[1])})}`
        : "the whole plane ℝ²";

  const summary = (() => {
    if (set.kind === "empty") {
      return `b is off the column space, so no particular solution exists. The decomposition x_p + Null(A) needs a particular solution to anchor it, so the solution set is empty — even though Null(A) itself (left) is unchanged. Existence failed; multiplicity never got a chance.`;
    }
    if (set.kind === "point") {
      return `Independent columns, so Null(A) = {0}: there is nothing to add to the one solution x_p = (${fmt(set.particular[0])}, ${fmt(set.particular[1])}). The solution set is a single point. Every b is reachable exactly once — uniqueness comes from the trivial null space.`;
    }
    if (set.kind === "plane") {
      return `A sends every vector to 0, so Null(A) is the whole plane — and with b = 0 the solution set is the whole plane too. This is the caveat case: a single difference vector gives only one direction, not the whole set, because the null space is 2-dimensional. You need both independent null directions to pin the shape.`;
    }
    // line
    const anchor = isHomogeneous
      ? `Here b = 0, so x_p = (0, 0) and the solution set passes through the origin — it coincides with Null(A) itself.`
      : `Every other solution is x_p = (${fmt(set.particular[0])}, ${fmt(set.particular[1])}) plus a multiple of the null direction v = (${fmt(set.direction[0])}, ${fmt(set.direction[1])}): the solution set is the null line slid to pass through x_p.`;
    return `Dependent columns and b is reachable. ${anchor} Slide t to walk along the set; the difference of any two solutions is a null vector (drawn from the origin, it lands on the null line). Two solutions establish at least this line — pinning the full shape needs all of Null(A).`;
  })();

  return (
    <ExplorationPanel
      explorationId="solution-sets"
      title="Solution set = null space, carried off the origin"
      description="Left: the homogeneous system A x = 0, whose solutions form Null(A) — a subspace through the origin. Right: A x = b, whose solutions are x_p + Null(A) — the same shape slid to pass through one particular solution (or empty when b is unreachable). Slide the free-variable t to generate more solutions; the difference of any two is a null vector."
      toolbar={
        <>
          <PresetPicker
            label="Case"
            activeId={activePreset}
            presets={[
              { id: "infinite", label: "Infinitely many (line)", onSelect: () => applyPreset("infinite") },
              { id: "unique", label: "Unique (point)", onSelect: () => applyPreset("unique") },
              { id: "homogeneous", label: "Homogeneous (b = 0)", onSelect: () => applyPreset("homogeneous") },
              { id: "none", label: "Inconsistent (empty)", onSelect: () => applyPreset("none") },
              { id: "plane", label: "Whole plane (A = 0)", onSelect: () => applyPreset("plane") },
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
                id: "toggle-difference",
                label: "Show the difference of two solutions is a null vector",
                checked: showDifference,
                onChange: setShowDifference,
              },
            ]}
          />
          {direction && (
            <ParameterControls
              title="Free variable t — slide the second solution along the set"
              controls={[
                { id: "sol-t", label: "t", value: t, min: -4, max: 4, onChange: setT },
              ]}
            />
          )}
          <details className="exploration-details">
            <summary>Matrix A &amp; target b (numeric)</summary>
            <div className="exploration-details__body">
              <ParameterControls
                title="Matrix A (columns are col₁, col₂)"
                controls={[
                  { id: "sol-a", label: "a₁₁", value: entries.a, min: -ENTRY, max: ENTRY, onChange: (v) => setEntries((e) => ({ ...e, a: v })) },
                  { id: "sol-b", label: "a₁₂", value: entries.b, min: -ENTRY, max: ENTRY, onChange: (v) => setEntries((e) => ({ ...e, b: v })) },
                  { id: "sol-c", label: "a₂₁", value: entries.c, min: -ENTRY, max: ENTRY, onChange: (v) => setEntries((e) => ({ ...e, c: v })) },
                  { id: "sol-d", label: "a₂₂", value: entries.d, min: -ENTRY, max: ENTRY, onChange: (v) => setEntries((e) => ({ ...e, d: v })) },
                ]}
              />
              <ParameterControls
                title="Target b"
                controls={[
                  { id: "sol-b1", label: "b₁", value: b[0], min: -BOUND, max: BOUND, onChange: (v) => setB([clampVal(v), b[1]]) },
                  { id: "sol-b2", label: "b₂", value: b[1], min: -BOUND, max: BOUND, onChange: (v) => setB([b[0], clampVal(v)]) },
                ]}
              />
            </div>
          </details>
        </>
      }
      readout={
        <SceneReadout
          title="Structure of the solution set"
          items={[
            {
              id: "kind",
              label: "Sol(A, b)",
              value: <span data-testid="solset-kind-readout">{kindLabel}</span>,
            },
            {
              id: "reachable",
              label: "b reachable? (existence)",
              value: <span data-testid="solset-reach-readout">{cls.consistent ? "yes — b is in the column space" : "no — b is off the column space"}</span>,
            },
            {
              id: "null",
              label: "Null(A) (multiplicity)",
              value: <span data-testid="solset-null-readout">{nullLabel}</span>,
            },
            ...(particular
              ? [
                  {
                    id: "particular",
                    label: "particular solution xₚ",
                    value: (
                      <span data-testid="solset-particular-readout" data-plain={`(${fmt(particular[0])}, ${fmt(particular[1])})`}>
                        <VectorTeX x={particular[0]} y={particular[1]} />
                      </span>
                    ),
                  },
                ]
              : []),
            ...(second && difference
              ? [
                  {
                    id: "generated",
                    label: "xₚ + t·v",
                    value: (
                      <span data-testid="solset-generated-readout" data-plain={`(${fmt(second[0])}, ${fmt(second[1])})`}>
                        <VectorTeX x={second[0]} y={second[1]} />
                      </span>
                    ),
                  },
                  {
                    id: "check",
                    label: "is xₚ + t·v a solution?",
                    value: (
                      <span data-testid="solset-check-readout">
                        {secondSolves ? "yes — and so is every t (add any null vector)" : "—"}
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      }
    >
      <div className="solution-set-explorer__panels">
        <figure className="solution-set-explorer__panel">
          <figcaption className="solution-set-explorer__caption">
            <strong>Homogeneous system A x = 0</strong> — the null space, a subspace through the origin
          </figcaption>
          <MafsSceneShell
            ariaLabel="Solution space of the homogeneous system A x = 0: the null space drawn through the origin as a point, a line, or the whole plane"
            viewBox={{ x: [-VIEW, VIEW], y: [-VIEW, VIEW], padding: 0.3 }}
            height={340}
          >
            {nul.kind === "plane" && (
              <Polygon points={VIEW_CORNERS} color={ROLE_NULL} fillOpacity={0.14} strokeOpacity={0.3} weight={1} />
            )}
            {nullLine && (
              <Line.Segment point1={nullLine[0]} point2={nullLine[1]} color={ROLE_NULL} weight={3} />
            )}
            <Circle center={[0, 0]} radius={0.14} color={ROLE_NULL} fillOpacity={1} />
            <Text x={0} y={0} attach="sw" attachDistance={16} color={ROLE_NULL} size={14}>
              {nul.kind === "zero" ? "Null(A) = {0}" : "Null(A)"}
            </Text>
          </MafsSceneShell>
        </figure>

        <figure className="solution-set-explorer__panel">
          <figcaption className="solution-set-explorer__caption">
            <strong>A x = b</strong> — the solution set is Null(A) translated by xₚ (or empty)
          </figcaption>
          <MafsSceneShell
            ariaLabel="Solution space of A x = b: the solution set drawn as the null space translated to pass through a particular solution, with a free-variable slider and the difference of two solutions"
            viewBox={{ x: [-VIEW, VIEW], y: [-VIEW, VIEW], padding: 0.3 }}
            height={340}
          >
            {/* Reference: Null(A) through the origin (faint), so the translate reads. */}
            {set.kind === "plane" && (
              <Polygon points={VIEW_CORNERS} color={ROLE_SOLUTION} fillOpacity={0.14} strokeOpacity={0.3} weight={1} />
            )}
            {nullLine && (
              <Line.Segment point1={nullLine[0]} point2={nullLine[1]} color={ROLE_NULL} weight={2} style="dashed" opacity={0.5} />
            )}
            <Circle center={[0, 0]} radius={0.08} color={ROLE_AXIS} fillOpacity={1} />

            {/* The solution set. */}
            {solLine && (
              <Line.Segment point1={solLine[0]} point2={solLine[1]} color={ROLE_SOLUTION} weight={3} />
            )}

            {particular && (
              <>
                {/* Offset arrow origin → x_p: the translate that carries the null space off the origin. */}
                {!approxVec(particular, [0, 0]) && (
                  <Vector tail={[0, 0]} tip={particular as [number, number]} color={ROLE_OFFSET} weight={2} style="dashed" opacity={0.8} />
                )}
                <Circle center={particular as [number, number]} radius={0.14} color={ROLE_PARTICULAR} fillOpacity={1} />
                <Text x={particular[0]} y={particular[1]} attach="ne" attachDistance={14} color={ROLE_PARTICULAR} size={15}>
                  xₚ
                </Text>
              </>
            )}

            {second && particular && (
              <>
                {/* Difference at its natural place: x_p → second solution. */}
                <Vector tail={particular as [number, number]} tip={second as [number, number]} color={ROLE_DIFFERENCE} weight={2} opacity={0.85} />
                <Circle center={second as [number, number]} radius={0.12} color={ROLE_SECOND} fillOpacity={1} />
                <Text x={second[0]} y={second[1]} attach="se" attachDistance={14} color={ROLE_SECOND} size={14}>
                  xₚ + t·v
                </Text>
                {/* The SAME difference translated to the origin: it lands on the null line. */}
                {showDifference && difference && !approxVec(difference, [0, 0]) && (
                  <>
                    <Vector tail={[0, 0]} tip={difference as [number, number]} color={ROLE_DIFFERENCE} weight={2} style="dashed" opacity={0.8} />
                    <Text x={difference[0]} y={difference[1]} attach="nw" attachDistance={12} color={ROLE_DIFFERENCE} size={13}>
                      (xₚ+t·v) − xₚ ∈ Null(A)
                    </Text>
                  </>
                )}
              </>
            )}

            {set.kind === "empty" && (
              <Text x={0} y={0} attach="n" attachDistance={8} color={ROLE_SOLUTION} size={15}>
                Sol(A, b) = ∅ — b is unreachable
              </Text>
            )}
          </MafsSceneShell>
        </figure>
      </div>
      <ul className="solution-set-explorer__legend" aria-label="Legend">
        <li><span className="swatch swatch--null" /> Null(A) — homogeneous</li>
        <li><span className="swatch swatch--solution" /> solution set A x = b</li>
        <li><span className="swatch swatch--particular" /> particular xₚ</li>
        <li><span className="swatch swatch--second" /> generated xₚ + t·v</li>
        <li><span className="swatch swatch--difference" /> difference (a null vector)</li>
      </ul>
    </ExplorationPanel>
  );
}
