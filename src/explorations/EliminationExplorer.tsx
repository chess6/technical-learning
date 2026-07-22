import { useCallback, useMemo, useState } from "react";
import { Circle, Line, Polygon, Text } from "mafs";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { EquationBlock } from "../components/lesson/EquationBlock";
import { MafsSceneShell } from "./MafsSceneShell";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { PresetPicker } from "./PresetPicker";
import { LINEAR_SYSTEM_EXAMPLE } from "../lessons/exampleData";
import {
  applyRowOperation,
  augmentedFromSystem,
  classifyLinearSystem2x2,
  classifyRowConstraint,
  classifyRowOperation,
  eliminationStepToClearX,
  haveSameSolutionSet,
  numericalStabilityWarning,
  rowOperationSummary,
  systemMatrix,
  systemRhs,
  type AugmentedRow,
  type AugmentedSystem,
  type RowConstraint,
  type RowOperation,
  type Vector2,
} from "../math";
import "./EliminationExplorer.css";

const EX = LINEAR_SYSTEM_EXAMPLE;
/** Half-width of the fixed square view box for the row picture. */
const VIEW = 7;

const ROLE_ROW_1 = "var(--role-original)";
const ROLE_ROW_2 = "var(--role-transformed)";
const ROLE_SOLUTION = "var(--role-selected)";
const ROLE_GHOST = "var(--role-invariant)";

type Preset = "unique" | "infinite" | "none";

const PRESETS: Record<Preset, AugmentedSystem> = {
  unique: augmentedFromSystem(EX.a, EX.b),
  infinite: augmentedFromSystem(EX.aDependent, EX.bInfinite),
  none: augmentedFromSystem(EX.aDependent, EX.bNone),
};

function fmt(n: number): string {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
}

/** Append `coef · varName` as a signed KaTeX term (drops zero, hides unit 1). */
function pushTerm(terms: string[], coef: number, varName: string): void {
  if (Math.abs(coef) < 1e-9) return;
  const rounded = Math.round(coef * 100) / 100;
  const sign = rounded < 0 ? "-" : "+";
  const magnitude = Math.abs(rounded);
  const coefficient = magnitude === 1 ? "" : fmt(magnitude);
  terms.push(`${terms.length === 0 && sign === "+" ? "" : sign} ${coefficient}${varName}`);
}

/** One augmented row `[a, b, c]` as the KaTeX equation `a x + b y = c`. */
function equationTex(row: AugmentedRow): string {
  const terms: string[] = [];
  pushTerm(terms, row[0], "x");
  pushTerm(terms, row[1], "y");
  const lhs = terms.length > 0 ? terms.join(" ") : "0";
  return `${lhs} = ${fmt(row[2])}`;
}

/** The whole system as a KaTeX `cases` block. */
function systemTex(system: AugmentedSystem): string {
  return `\\begin{cases} ${equationTex(system.rows[0])} \\\\ ${equationTex(system.rows[1])} \\end{cases}`;
}

/** The augmented matrix `[A | b]` as KaTeX. */
function augmentedTex(system: AugmentedSystem): string {
  const [r0, r1] = system.rows;
  return `\\left[\\begin{array}{cc|c} ${fmt(r0[0])} & ${fmt(r0[1])} & ${fmt(r0[2])} \\\\ ${fmt(r1[0])} & ${fmt(r1[1])} & ${fmt(r1[2])} \\end{array}\\right]`;
}

/** Human-readable geometry of a degenerate row, or `null` for an honest line. */
function degenerateRowNote(rc: RowConstraint, index: 1 | 2): string | null {
  if (rc.kind === "all") return `equation ${index}: 0 = 0 — every point (no constraint)`;
  if (rc.kind === "empty") return `equation ${index}: 0 = c ≠ 0 — impossible (no points)`;
  return null;
}

/**
 * Lesson "Elimination" exploration — one system A x = b shown as THREE
 * synchronized views: the written equations, the augmented matrix [A | b], and
 * the two constraint lines. The learner applies elementary row operations; the
 * equations and matrix change while the intersection point (the solution set)
 * stays put — making the correctness of elimination visually inevitable rather
 * than a procedure to memorize.
 *
 * Every operation and classification is the shared `src/math/elimination` /
 * `classifyLinearSystem2x2`; no linear algebra is reimplemented here. Applying
 * an *illegal* move (scale by 0) is allowed on purpose — the readout then
 * reports honestly that the solution set changed.
 */
export function EliminationExplorer() {
  const [preset, setPreset] = useState<Preset>("unique");
  const [initialSystem, setInitialSystem] = useState<AugmentedSystem>(PRESETS.unique);
  const [system, setSystem] = useState<AugmentedSystem>(PRESETS.unique);
  const [past, setPast] = useState<AugmentedSystem[]>([]);
  const [lastOp, setLastOp] = useState<RowOperation | null>(null);
  const [scaleRowIdx, setScaleRowIdx] = useState(1);
  const [scaleFactor, setScaleFactor] = useState(2);
  const [addFactor, setAddFactor] = useState(-2);

  const current = classifyLinearSystem2x2(systemMatrix(system), systemRhs(system));
  const baseline = useMemo(
    () => classifyLinearSystem2x2(systemMatrix(initialSystem), systemRhs(initialSystem)),
    [initialSystem],
  );

  // Whether the running system STILL has the same solution set as the start —
  // compared case by case (same point / same line / both empty) through the
  // shared `haveSameSolutionSet`, never "the kind happens to still match".
  const solutionSetUnchanged = haveSameSolutionSet(initialSystem, system);

  const lastValidity = lastOp ? classifyRowOperation(lastOp) : null;
  const lastStabilityWarning = lastOp ? numericalStabilityWarning(lastOp) : null;

  const rc1 = classifyRowConstraint(system.rows[0][0], system.rows[0][1], system.rows[0][2]);
  const rc2 = classifyRowConstraint(system.rows[1][0], system.rows[1][1], system.rows[1][2]);
  const rowNotes = [degenerateRowNote(rc1, 1), degenerateRowNote(rc2, 2)].filter(
    (n): n is string => n !== null,
  );

  const rowCorners: [number, number][] = [
    [-VIEW, -VIEW],
    [VIEW, -VIEW],
    [VIEW, VIEW],
    [-VIEW, VIEW],
  ];
  const ghost: Vector2 | null = baseline.kind === "unique" ? baseline.solution : null;
  const solution = current.kind === "unique" ? current.solution : null;

  const pivotStep = eliminationStepToClearX(system);

  const apply = useCallback(
    (op: RowOperation) => {
      setSystem((prev) => {
        setPast((p) => [...p, prev]);
        return applyRowOperation(prev, op);
      });
      setLastOp(op);
    },
    [],
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1]!;
      setSystem(previous);
      setLastOp(null);
      return p.slice(0, -1);
    });
  }, []);

  const selectPreset = useCallback((next: Preset) => {
    setPreset(next);
    setInitialSystem(PRESETS[next]);
    setSystem(PRESETS[next]);
    setPast([]);
    setLastOp(null);
  }, []);

  const handleReset = useCallback(() => {
    setSystem(initialSystem);
    setPast([]);
    setLastOp(null);
  }, [initialSystem]);

  const kindLabel =
    current.kind === "unique"
      ? "one solution"
      : current.kind === "infinite"
        ? "infinitely many"
        : "no solution";

  // The solution set is a DIFFERENT geometric object per case, so the permanent
  // description, the canvas caption, and the diagram's accessible label must all
  // match the current system rather than assuming a unique crossing point:
  //   unique   → two lines with a fixed intersection point,
  //   infinite → coincident constraints with the same solution line,
  //   none     → constraints with an empty solution set (no crossing).
  const geometryText =
    current.kind === "unique"
      ? {
          description:
            "One system A x = b in three synchronized views — the written equations, the augmented matrix [A | b], and the two constraint lines meeting at a fixed intersection point. Apply an elementary row operation and watch the equations and matrix change while that crossing point (the whole solution set) stays fixed.",
          caption: "Constraint lines — the crossing point is the solution set",
          ariaLabel:
            "The two constraint lines and their fixed intersection point, redrawn as row operations are applied",
        }
      : current.kind === "infinite"
        ? {
            description:
              "One system A x = b in three synchronized views — the written equations, the augmented matrix [A | b], and the two coincident constraint lines. Apply an elementary row operation and watch the equations and matrix change while the shared solution line (the whole solution set) stays fixed.",
            caption: "Constraint lines — the shared line is the solution set",
            ariaLabel:
              "The two coincident constraint lines sharing one solution line, redrawn as row operations are applied",
          }
        : {
            description:
              "One system A x = b in three synchronized views — the written equations, the augmented matrix [A | b], and the two parallel constraint lines that never meet. Apply an elementary row operation and watch the equations and matrix change while the solution set stays empty.",
            caption: "Constraint lines — no crossing, so the solution set is empty",
            ariaLabel:
              "The two parallel constraint lines with no intersection, so the solution set is empty, redrawn as row operations are applied",
          };

  // The solution set is a DIFFERENT geometric object per case, so the "nothing
  // moved" phrasing must be case-specific: a point, a line, or the empty set.
  const preservedPhrase =
    current.kind === "unique"
      ? "the crossing point never moves"
      : current.kind === "infinite"
        ? "the whole solution line is unchanged"
        : "the solution set stays empty (no solution to move)";

  const summary = solutionSetUnchanged
    ? `Same solution set as the start (${kindLabel}). Elimination only rewrites the equations — ${preservedPhrase}.`
    : `⚠ The solution set changed (now ${kindLabel}). The last move was not a reversible row operation, so it did not preserve the solutions — reset and try a legal move.`;

  return (
    <ExplorationPanel
      explorationId="elimination"
      title="Elimination: rewrite the system, keep the solutions"
      description={geometryText.description}
      toolbar={
        <>
          <PresetPicker
            label="Starting system"
            activeId={preset}
            presets={[
              { id: "unique", label: "One solution", onSelect: () => selectPreset("unique") },
              { id: "infinite", label: "Infinitely many", onSelect: () => selectPreset("infinite") },
              { id: "none", label: "No solution", onSelect: () => selectPreset("none") },
            ]}
          />
          <ResetButton onReset={handleReset} label="Reset system" />
        </>
      }
      summary={summary}
      controls={
        <>
          <div className="elimination-explorer__ops" role="group" aria-label="Row operations">
            <p className="elimination-explorer__ops-title">Elementary row operations</p>
            <div className="elimination-explorer__ops-row">
              <button type="button" className="elimination-explorer__op" onClick={() => apply({ kind: "swap" })}>
                Swap R1 ↔ R2
              </button>
              <button
                type="button"
                className="elimination-explorer__op"
                disabled={pivotStep === null}
                onClick={() => pivotStep && apply(pivotStep)}
                title={pivotStep === null ? "R1 has no x to pivot on" : rowOperationSummary(pivotStep)}
              >
                Eliminate x from R2
              </button>
              <button type="button" className="elimination-explorer__op" disabled={past.length === 0} onClick={undo}>
                Undo
              </button>
            </div>
          </div>
          <details className="exploration-details">
            <summary>More row operations</summary>
            <div className="exploration-details__body">
              <ParameterControls
                title="Scale a row"
                controls={[
                  { id: "elim-scale-row", label: "row (1 or 2)", value: scaleRowIdx, min: 1, max: 2, step: 1, onChange: (v) => setScaleRowIdx(Math.round(v)) },
                  { id: "elim-scale-factor", label: "factor", value: scaleFactor, min: -4, max: 4, step: 0.5, onChange: setScaleFactor },
                ]}
              />
              <button
                type="button"
                className="elimination-explorer__op"
                onClick={() => apply({ kind: "scale", row: scaleRowIdx === 1 ? 0 : 1, factor: scaleFactor })}
              >
                Multiply R{scaleRowIdx} by {fmt(scaleFactor)}
              </button>
              <ParameterControls
                title="Add a multiple of R1 to R2"
                controls={[
                  { id: "elim-add-factor", label: "k in R2 → R2 + k·R1", value: addFactor, min: -4, max: 4, step: 0.5, onChange: setAddFactor },
                ]}
              />
              <button
                type="button"
                className="elimination-explorer__op"
                onClick={() => apply({ kind: "add", source: 0, target: 1, factor: addFactor })}
              >
                R2 → R2 + {fmt(addFactor)}·R1
              </button>
              <p className="elimination-explorer__illegal-note">Illegal move (to see what breaks):</p>
              <button
                type="button"
                className="elimination-explorer__op elimination-explorer__op--danger"
                onClick={() => apply({ kind: "scale", row: 1, factor: 0 })}
              >
                Multiply R2 by 0
              </button>
            </div>
          </details>
        </>
      }
      readout={
        <SceneReadout
          title="Status"
          items={[
            {
              id: "kind",
              label: "Solutions",
              value: <span data-testid="elim-kind-readout">{kindLabel}</span>,
            },
            {
              id: "preserved",
              label: "Same solution set?",
              value: (
                <span data-testid="elim-preserved-readout" data-preserved={solutionSetUnchanged}>
                  {solutionSetUnchanged ? "yes ✓" : "no ⚠ (irreversible move)"}
                </span>
              ),
            },
            {
              id: "last-op",
              label: "Last operation",
              value: (
                <span data-testid="elim-last-op-readout">
                  {lastOp ? rowOperationSummary(lastOp) : "—"}
                </span>
              ),
            },
            ...(lastValidity
              ? [
                  {
                    id: "why",
                    label: lastValidity.reversible ? "why it's safe" : "why it's illegal",
                    value: <span data-testid="elim-op-reason">{lastValidity.reason}</span>,
                  },
                ]
              : []),
            ...(lastStabilityWarning
              ? [
                  {
                    id: "stability",
                    label: "numerical caution",
                    value: <span data-testid="elim-stability-warning">{lastStabilityWarning}</span>,
                  },
                ]
              : []),
            ...(solution
              ? [
                  {
                    id: "solution",
                    label: "solution (x, y)",
                    value: (
                      <span data-testid="elim-solution-readout">{`(${fmt(solution[0])}, ${fmt(solution[1])})`}</span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      }
    >
      <div className="elimination-explorer__views">
        <div className="elimination-explorer__symbolic">
          <figure className="elimination-explorer__panel">
            <figcaption className="elimination-explorer__caption">Written equations</figcaption>
            <div className="elimination-explorer__equation" data-testid="elim-equations">
              <EquationBlock tex={systemTex(system)} display />
            </div>
          </figure>
          <figure className="elimination-explorer__panel">
            <figcaption className="elimination-explorer__caption">Augmented matrix [A | b]</figcaption>
            <div className="elimination-explorer__equation" data-testid="elim-augmented">
              <EquationBlock tex={augmentedTex(system)} display />
            </div>
          </figure>
        </div>
        <figure className="elimination-explorer__panel elimination-explorer__panel--canvas">
          <figcaption className="elimination-explorer__caption" data-testid="elim-canvas-caption">
            {geometryText.caption}
          </figcaption>
          <MafsSceneShell
            ariaLabel={geometryText.ariaLabel}
            viewBox={{ x: [-VIEW, VIEW], y: [-VIEW, VIEW], padding: 0.3 }}
            height={340}
          >
            {ghost && (
              <Circle center={ghost as [number, number]} radius={0.28} color={ROLE_GHOST} fillOpacity={0} strokeOpacity={0.7} weight={2} />
            )}
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
            {solution && (
              <>
                <Circle center={solution as [number, number]} radius={0.16} color={ROLE_SOLUTION} fillOpacity={1} />
                <Text x={solution[0]} y={solution[1]} attach="ne" attachDistance={16} color={ROLE_SOLUTION} size={15}>
                  {`(${fmt(solution[0])}, ${fmt(solution[1])})`}
                </Text>
              </>
            )}
            {rowNotes.map((note, i) => (
              <Text key={note} x={-VIEW + 0.4} y={VIEW - 0.5 - i * 0.8} attach="e" color={i === 0 ? ROLE_ROW_1 : ROLE_ROW_2} size={13}>
                {note}
              </Text>
            ))}
          </MafsSceneShell>
        </figure>
      </div>
      <ul className="elimination-explorer__legend" aria-label="Legend">
        <li><span className="swatch swatch--row1" /> equation 1 (R1)</li>
        <li><span className="swatch swatch--row2" /> equation 2 (R2)</li>
        <li><span className="swatch swatch--solution" /> solution (crossing)</li>
        <li><span className="swatch swatch--ghost" /> where the solution started</li>
      </ul>
    </ExplorationPanel>
  );
}
