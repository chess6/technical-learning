import { useCallback, useMemo, useState } from "react";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import { PresetPicker } from "./PresetPicker";
import { RANK_NULLITY_PRESETS } from "../lessons/exampleData";
import {
  isInjective,
  isSurjective,
  maxPossibleRank,
  rankNullityCount,
  type Matrix,
} from "../math";
import "./RankNullityExplorer.css";

/**
 * Lesson 9 explorer — the ledger, driven by maps of DIFFERENT SHAPES.
 *
 * Deliberately built around non-square maps. With m = n the law degenerates into
 * "rank determines nullity", which Lesson 8 already gave; the impossibility
 * results — no bigger-to-smaller map is one-to-one, no smaller-to-bigger map is
 * onto — cannot even be stated with square examples. So the shape is the primary
 * control here, not the entries.
 *
 * Each verdict is shown with the inequality that produced it, so "not one-to-one"
 * is never a bare label the learner has to trust.
 */

function fmt(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return Object.is(r, -0) ? "0" : String(r);
}

export function RankNullityExplorer() {
  const [presetId, setPresetId] = useState(RANK_NULLITY_PRESETS[0]!.id);
  const [showWhy, setShowWhy] = useState(false);

  const preset = useMemo(
    () => RANK_NULLITY_PRESETS.find((p) => p.id === presetId) ?? RANK_NULLITY_PRESETS[0]!,
    [presetId],
  );
  const matrix = preset.matrix as unknown as Matrix;

  const count = rankNullityCount(matrix);
  const rows = count.outputDimension;
  const columns = count.inputDimension;
  const ceiling = maxPossibleRank(rows, columns);
  const injective = isInjective(matrix);
  const surjective = isSurjective(matrix);

  const handleReset = useCallback(() => {
    setPresetId(RANK_NULLITY_PRESETS[0]!.id);
    setShowWhy(false);
  }, []);

  const injectiveReason = injective
    ? `nullity is 0, so no two inputs collide`
    : columns > rows
      ? `nullity ≥ n − m = ${columns} − ${rows} = ${columns - rows} > 0, forced by the shape alone`
      : `nullity is ${count.nullity} > 0 for this particular map`;

  const surjectiveReason = surjective
    ? `rank ${count.rank} = m, so the image fills the output space`
    : columns < rows
      ? `rank ≤ n = ${columns} < m = ${rows}, forced by the shape alone`
      : `rank is ${count.rank} < m = ${rows} for this particular map`;

  const summary = `${rows} × ${columns}: the budget is n = ${columns}, and the ceiling on the rank is min(m, n) = ${ceiling}. This map spends it as ${count.rank} survived + ${count.nullity} crushed.`;

  return (
    <ExplorationPanel
      explorationId="rank-nullity"
      title="Spend the budget"
      description="Change the SHAPE of the map, not just its entries. The total is always n — the input dimension — but the ceiling on what can survive is min(m, n), and that is what makes some maps impossible."
      toolbar={
        <>
          <PresetPicker
            label="Map"
            presets={RANK_NULLITY_PRESETS.map((p) => ({
              id: p.id,
              label: p.label,
              onSelect: () => setPresetId(p.id),
            }))}
            activeId={presetId}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      summary={summary}
      controls={
        <div className="rn-explorer__verdicts">
          <div className="rn-explorer__verdict" data-ok={injective || undefined}>
            <span className="rn-explorer__verdict-q">One-to-one?</span>
            <strong data-testid="rn-injective">{injective ? "Yes" : "No"}</strong>
          </div>
          <div className="rn-explorer__verdict" data-ok={surjective || undefined}>
            <span className="rn-explorer__verdict-q">Onto?</span>
            <strong data-testid="rn-surjective">{surjective ? "Yes" : "No"}</strong>
          </div>
          <label className="rn-explorer__why">
            <input
              type="checkbox"
              checked={showWhy}
              onChange={(event) => setShowWhy(event.target.checked)}
            />
            Why?
          </label>
          {showWhy && (
            <ul className="rn-explorer__reasons" data-testid="rn-reasons">
              <li>One-to-one: {injectiveReason}.</li>
              <li>Onto: {surjectiveReason}.</li>
            </ul>
          )}
        </div>
      }
      readout={
        <SceneReadout
          title="The ledger"
          items={[
            {
              id: "budget",
              label: "Budget n (inputs)",
              value: <span data-testid="rn-budget">{columns}</span>,
            },
            {
              id: "ceiling",
              label: "Ceiling min(m, n)",
              value: <span data-testid="rn-ceiling">{ceiling}</span>,
            },
            {
              id: "survived",
              label: "Survived (rank)",
              value: <span data-testid="rn-rank">{count.rank}</span>,
            },
            {
              id: "crushed",
              label: "Crushed (nullity)",
              value: <span data-testid="rn-nullity">{count.nullity}</span>,
            },
            {
              id: "total",
              label: "Total",
              value: (
                <span data-testid="rn-total">
                  {count.rank} + {count.nullity} = {count.total}
                </span>
              ),
            },
          ]}
        />
      }
    >
      <div className="rn-explorer__matrix">
        <table>
          <caption className="sr-only">
            The current matrix, {rows} rows by {columns} columns
          </caption>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {row.map((entry, j) => (
                  <td key={j}>{fmt(entry)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="rn-explorer__shape" data-testid="rn-shape">
          {rows} rows (output space ℝ{rows}) × {columns} columns (input space ℝ
          {columns})
        </p>
      </div>
    </ExplorationPanel>
  );
}
