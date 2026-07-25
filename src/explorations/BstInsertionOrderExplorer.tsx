import { useCallback, useMemo, useState } from "react";
import {
  bstHeight,
  bstInOrder,
  bstInsertAll,
  bstSearchTrace,
  heightBounds,
  intervalAt,
  medianFirstOrder,
  worstCaseComparisons,
  type BSTNode,
} from "../math";
import { BST_SEVEN } from "../lessons/exampleData";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ExplorationToggles } from "./ExplorationToggles";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import "./BstInsertionOrderExplorer.css";

/**
 * The lesson's claim, made drivable: the learner chooses the **insertion order**
 * and watches the height — and therefore the search cost — move, while the
 * in-order readout underneath refuses to change.
 *
 * Every tree, path, interval, height, and bound comes from
 * `src/math/binarySearchTrees`; this component only lays them out.
 */

const KEYS = BST_SEVEN.sorted;
const SORTED_ORDER = [...KEYS];
const REVERSE_ORDER = [...KEYS].reverse();
const MEDIAN_ORDER = medianFirstOrder(KEYS);

const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 380;
const NODE_R = 20;

type Placed = {
  key: number;
  x: number;
  y: number;
  parent: { x: number; y: number } | null;
};

/**
 * Lay a tree out by in-order position (x) and depth (y) — the same mapping the
 * guided scene uses, so a learner arriving from the animation recognises it.
 */
function layout(root: BSTNode | null): Placed[] {
  const order = bstInOrder(root);
  const slot = new Map(order.map((key, index) => [key, index]));
  const h = Math.max(bstHeight(root), 0);
  const stepX = (VIEW_WIDTH - 80) / Math.max(order.length - 1, 1);
  const stepY = (VIEW_HEIGHT - 80) / Math.max(h, 1);
  const placed: Placed[] = [];

  const walk = (
    node: BSTNode | null,
    depth: number,
    parent: { x: number; y: number } | null,
  ): void => {
    if (node === null) return;
    const x = 40 + slot.get(node.key)! * stepX;
    const y = 40 + depth * stepY;
    placed.push({ key: node.key, x, y, parent });
    walk(node.left, depth + 1, { x, y });
    walk(node.right, depth + 1, { x, y });
  };
  walk(root, 0, null);
  return placed;
}

function formatInterval(lo: number | null, hi: number | null): string {
  return `(${lo ?? "−∞"}, ${hi ?? "∞"})`;
}

export function BstInsertionOrderExplorer() {
  const [order, setOrder] = useState<readonly number[]>(MEDIAN_ORDER);
  const [preset, setPreset] = useState("median");
  const [target, setTarget] = useState<number>(BST_SEVEN.target!);
  const [showIntervals, setShowIntervals] = useState(false);

  const tree = useMemo(() => bstInsertAll([...order]), [order]);
  const placed = useMemo(() => layout(tree), [tree]);
  const trace = useMemo(() => bstSearchTrace(tree, target), [tree, target]);
  const onPath = useMemo(() => new Set(trace.comparisons), [trace]);

  const h = bstHeight(tree);
  const bounds = heightBounds(KEYS.length);
  const cost = worstCaseComparisons(tree);
  const sequence = bstInOrder(tree);

  const apply = useCallback((id: string, next: readonly number[]) => {
    setPreset(id);
    setOrder(next);
  }, []);

  const handleReset = useCallback(() => {
    apply("median", MEDIAN_ORDER);
    setTarget(BST_SEVEN.target!);
    setShowIntervals(false);
  }, [apply]);

  const atMinimum = h === bounds.min;
  const atMaximum = h === bounds.max;

  return (
    <ExplorationPanel
      explorationId="bst-insertion-order"
      title="Choose the insertion order, choose the cost"
      description="The same seven keys every time. Pick the order they arrive in, then search for one — the height, and therefore the worst-case comparison count, is the only thing that moves."
      toolbar={
        <>
          <PresetPicker
            label="Insertion order"
            activeId={preset}
            presets={[
              {
                id: "median",
                label: "Median-first",
                onSelect: () => apply("median", MEDIAN_ORDER),
              },
              {
                id: "sorted",
                label: "Sorted",
                onSelect: () => apply("sorted", SORTED_ORDER),
              },
              {
                id: "reverse",
                label: "Reverse",
                onSelect: () => apply("reverse", REVERSE_ORDER),
              },
            ]}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      summary={
        atMinimum
          ? `This order reaches the minimum height ${bounds.min}, so a search costs at most ${cost} comparisons — the best any binary tree on ${KEYS.length} keys can do.`
          : atMaximum
            ? `This order builds a chain of height ${h}: a search costs up to ${cost} comparisons, the same as scanning a list. The keys are unchanged — only the order they arrived in.`
            : `Height ${h}, so a search costs at most ${cost} comparisons. The minimum for ${KEYS.length} keys is ${bounds.min}.`
      }
      controls={
        <>
          <div className="bst-explorer__order" aria-live="polite">
            <span className="bst-explorer__order-label">Inserted in this order</span>
            <ol className="bst-explorer__order-list">
              {order.map((key, index) => (
                <li key={key} className="bst-explorer__order-chip">
                  <span className="bst-explorer__order-index">{index + 1}</span>
                  {key}
                </li>
              ))}
            </ol>
          </div>

          <div className="bst-explorer__search">
            <span className="bst-explorer__order-label" id="bst-search-label">
              Search for
            </span>
            <div
              className="bst-explorer__search-keys"
              role="group"
              aria-labelledby="bst-search-label"
            >
              {KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="btn btn--ghost bst-explorer__search-key"
                  aria-pressed={target === key}
                  data-active={target === key || undefined}
                  onClick={() => setTarget(key)}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <ExplorationToggles
            title="Display options"
            toggles={[
              {
                id: "intervals",
                label: "Show each position's legal interval",
                checked: showIntervals,
                onChange: setShowIntervals,
              },
            ]}
          />
        </>
      }
      readout={
        <SceneReadout
          title="Result"
          items={[
            { id: "height", label: "Height (edges)", value: String(h) },
            {
              id: "cost",
              label: "Worst-case comparisons",
              value: String(cost),
            },
            {
              id: "bounds",
              label: "Possible heights",
              value: `${bounds.min} … ${bounds.max}`,
            },
            {
              id: "trace",
              label: `Comparisons to find ${target}`,
              value: trace.comparisons.join(" → "),
            },
            {
              id: "inorder",
              label: "In-order readout",
              value: sequence.join(", "),
            },
          ]}
        />
      }
    >
      <div className="bst-explorer__stage">
        <svg
          className="bst-explorer__svg"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`Binary search tree of height ${h} built by inserting ${order.join(", ")}. Searching for ${target} compares ${trace.comparisons.join(", ")}.`}
        >
          {placed.map((node) =>
            node.parent ? (
              <line
                key={`edge-${node.key}`}
                className="bst-explorer__edge"
                x1={node.parent.x}
                y1={node.parent.y}
                x2={node.x}
                y2={node.y}
              />
            ) : null,
          )}
          {placed.map((node) => {
            const interval = intervalAt(tree, node.key);
            return (
              <g key={`node-${node.key}`}>
                <circle
                  className="bst-explorer__node"
                  data-on-path={onPath.has(node.key) || undefined}
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R}
                />
                <text
                  className="bst-explorer__node-text"
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                >
                  {node.key}
                </text>
                {showIntervals && interval ? (
                  <text
                    className="bst-explorer__interval"
                    x={node.x}
                    y={node.y + NODE_R + 16}
                    textAnchor="middle"
                  >
                    {formatInterval(interval.lo, interval.hi)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
        <p className="bst-explorer__caption">
          Highlighted nodes are the comparisons the search actually makes: one per
          level, so the count is the depth plus one.
        </p>
      </div>
    </ExplorationPanel>
  );
}
