import { useCallback, useMemo, useState } from "react";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ParameterControls } from "./ParameterControls";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { PresetPicker } from "./PresetPicker";
import { SUBSPACE_PRESETS } from "../lessons/exampleData";
import {
  clamp,
  columnSpaceBasis,
  imageShape,
  nullSpaceBasis,
  pivotColumnsOf,
  rankNullityCount,
  type Matrix,
  type Vec,
} from "../math";
import "./SubspacesRankExplorer.css";

/**
 * Lesson 8 explorer — make a map lose a dimension, and watch both spaces answer.
 *
 * The learner edits the third row of a 3×3 map. Making it a combination of the
 * first two is what collapses the map, and the readouts move together: rank
 * falls, the image shape degrades solid → plane → line → point, and the null
 * space grows by exactly as much as the rank fell.
 *
 * Two deliberate choices carry the lesson's misconceptions:
 *  - the column-space basis is labelled "columns of A" and is taken from A, not
 *    from the reduced matrix (`columnSpaceBasis` enforces this);
 *  - the two bases are printed under headings naming their ambient space, so the
 *    "they live in the same place" error is contradicted by the readout itself.
 *
 * No arithmetic is done here; everything comes from `src/math`.
 */

const ENTRY_MIN = -6;
const ENTRY_MAX = 6;

type Row = readonly [number, number, number];

const DEFAULT_TOP: readonly [Row, Row] = [
  [1, 0, 2],
  [0, 1, 3],
];
const DEFAULT_THIRD: Row = [1, 1, 5];

function fmt(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return Object.is(r, -0) ? "0" : String(r);
}

function vecText(v: Vec): string {
  return `(${v.map(fmt).join(", ")})`;
}

function basisText(basis: readonly Vec[]): string {
  return basis.length === 0 ? "{ } — only the zero vector" : basis.map(vecText).join("  ,  ");
}

export function SubspacesRankExplorer() {
  const [top, setTop] = useState<readonly [Row, Row]>(DEFAULT_TOP);
  const [third, setThird] = useState<Row>(DEFAULT_THIRD);

  const matrix: Matrix = useMemo(
    () => [[...top[0]], [...top[1]], [...third]],
    [top, third],
  );

  const count = rankNullityCount(matrix);
  const columns = columnSpaceBasis(matrix);
  const nulls = nullSpaceBasis(matrix);
  const pivots = pivotColumnsOf(matrix);
  const shape = imageShape(count.rank);

  const setThirdEntry = useCallback((index: 0 | 1 | 2, value: number) => {
    setThird((prev) => {
      const next: [number, number, number] = [prev[0], prev[1], prev[2]];
      next[index] = clamp(value, ENTRY_MIN, ENTRY_MAX);
      return next;
    });
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = SUBSPACE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setTop([preset.matrix[0], preset.matrix[1]]);
    setThird(preset.matrix[2]);
  }, []);

  const handleReset = useCallback(() => {
    setTop(DEFAULT_TOP);
    setThird(DEFAULT_THIRD);
  }, []);

  const shapeWords: Record<string, string> = {
    solid: "a solid — nothing collapsed",
    plane: "a plane — one dimension was lost",
    line: "a line — two dimensions were lost",
    point: "a single point — everything collapsed",
  };

  const summary = `Rank ${count.rank}: the unit cube's image is ${shapeWords[shape]}. The null space has dimension ${count.nullity}, and ${count.rank} + ${count.nullity} = ${count.inputDimension}.`;

  return (
    <ExplorationPanel
      explorationId="subspaces-rank"
      title="Make a map lose a dimension"
      description="Edit the third row. When it becomes a combination of the first two, the map collapses — and both spaces respond at once: the image shrinks and the null space grows."
      toolbar={
        <>
          <PresetPicker
            label="Examples"
            presets={SUBSPACE_PRESETS.map((p) => ({
              id: p.id,
              label: p.label,
              onSelect: () => applyPreset(p.id),
            }))}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      summary={summary}
      controls={
        <>
          <div className="subspace-explorer__fixed">
            <span className="subspace-explorer__fixed-label">Rows 1 and 2 (fixed)</span>
            <code data-testid="subspace-fixed-rows">
              ({top[0].map(fmt).join(", ")}) · ({top[1].map(fmt).join(", ")})
            </code>
          </div>
          <ParameterControls
            title="Third row"
            controls={[
              { id: "sub-r3c1", label: "a₃₁", value: third[0], min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setThirdEntry(0, v) },
              { id: "sub-r3c2", label: "a₃₂", value: third[1], min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setThirdEntry(1, v) },
              { id: "sub-r3c3", label: "a₃₃", value: third[2], min: ENTRY_MIN, max: ENTRY_MAX, onChange: (v) => setThirdEntry(2, v) },
            ]}
          />
          <details className="exploration-details">
            <summary>Show the bases</summary>
            <div className="exploration-details__body">
              <dl className="subspace-explorer__bases">
                <dt>
                  Basis of Col(A) — in the <strong>output</strong> space ℝ
                  {count.outputDimension}
                </dt>
                <dd data-testid="subspace-col-basis">{basisText(columns.basis)}</dd>
                <dd className="subspace-explorer__note">
                  These are columns {pivots.map((p) => p + 1).join(" and ") || "—"} of{" "}
                  <strong>A itself</strong>, not of its reduced form.
                </dd>
                <dt>
                  Basis of Null(A) — in the <strong>input</strong> space ℝ
                  {count.inputDimension}
                </dt>
                <dd data-testid="subspace-null-basis">{basisText(nulls.basis)}</dd>
              </dl>
            </div>
          </details>
        </>
      }
      readout={
        <SceneReadout
          title="Readout"
          items={[
            {
              id: "rank",
              label: "rank A",
              value: <span data-testid="subspace-rank">{count.rank}</span>,
            },
            {
              id: "nullity",
              label: "dim Null(A)",
              value: <span data-testid="subspace-nullity">{count.nullity}</span>,
            },
            {
              id: "shape",
              label: "Image of the unit cube",
              value: <span data-testid="subspace-shape">{shape}</span>,
            },
            {
              id: "identity",
              label: "The count",
              value: (
                <span data-testid="subspace-identity">
                  {count.rank} + {count.nullity} = {count.inputDimension}
                </span>
              ),
            },
          ]}
        />
      }
    >
      <div className="subspace-explorer__matrix" aria-label="The current matrix A">
        <table>
          <caption className="sr-only">The 3 by 3 matrix A</caption>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i} data-testid={`subspace-row-${i}`}>
                {row.map((entry, j) => (
                  <td key={j} data-pivot={pivots.includes(j) || undefined}>
                    {fmt(entry)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="subspace-explorer__legend">
          Highlighted columns are the pivot columns — one per surviving dimension.
        </p>
      </div>
    </ExplorationPanel>
  );
}
