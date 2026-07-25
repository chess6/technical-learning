import { useCallback, useMemo, useState } from "react";
import {
  blackHeight,
  blackHeightsPerPath,
  classifyRepair,
  decode234,
  heightRB,
  inOrderRB,
  insertRB,
  isLegalRB,
  rotateOnlyAt,
  sizeRB,
  type Node234,
  type RBNode,
} from "../math";
import { RBT_CANONICAL } from "../lessons/exampleData";
import { ExplorationPanel } from "../components/lesson/ExplorationPanel";
import { ExplorationToggles } from "./ExplorationToggles";
import { PresetPicker } from "./PresetPicker";
import { ResetButton } from "./ResetButton";
import { SceneReadout } from "./SceneReadout";
import "./RedBlackEncodingExplorer.css";

/**
 * Both sides of the encoding, in lockstep: the 2–3–4 tree the learner is really
 * manipulating, and the red-black tree that stores it.
 *
 * The control that matters most is **Rotate only (break it)** — a rotation with
 * no accompanying recolour. It is here so the lesson's sharpest misconception is
 * confronted by the learner doing it, watching the in-order row refuse to move
 * while the per-path black counts diverge.
 *
 * Every tree, count, classification, and legality report comes from
 * `src/math/redBlackTrees`.
 */

const START = [...RBT_CANONICAL.order];
const NEXT_KEYS = [5, 15, 25, 35, 45, 55, 65, 75];

const VIEW_WIDTH = 660;
const VIEW_HEIGHT = 320;
const NODE_R = 18;

type Placed = {
  key: number;
  red: boolean;
  x: number;
  y: number;
  parent: { x: number; y: number } | null;
};

function layout(root: RBNode | null): Placed[] {
  const order = inOrderRB(root);
  const slot = new Map(order.map((key, index) => [key, index]));
  const h = Math.max(heightRB(root), 1);
  const stepX = (VIEW_WIDTH - 70) / Math.max(order.length - 1, 1);
  const stepY = (VIEW_HEIGHT - 70) / h;
  const placed: Placed[] = [];
  const walk = (
    node: RBNode | null,
    depth: number,
    parent: { x: number; y: number } | null,
  ): void => {
    if (node === null) return;
    const x = 35 + slot.get(node.key)! * stepX;
    const y = 35 + depth * stepY;
    placed.push({ key: node.key, red: node.colour === "red", x, y, parent });
    walk(node.left, depth + 1, { x, y });
    walk(node.right, depth + 1, { x, y });
  };
  walk(root, 0, null);
  return placed;
}

/** Render the decoded 2–3–4 tree as nested key boxes, level by level. */
function levelsOf(node: Node234 | null): string[][] {
  const levels: string[][] = [];
  const walk = (current: Node234 | null, depth: number): void => {
    if (current === null) return;
    levels[depth] = levels[depth] ?? [];
    levels[depth]!.push(current.keys.join(" · "));
    for (const child of current.children) walk(child, depth + 1);
  };
  walk(node, 0);
  return levels;
}

export function RedBlackEncodingExplorer() {
  const [keys, setKeys] = useState<readonly number[]>(START);
  const [broken, setBroken] = useState<RBNode | null>(null);
  const [showClusters, setShowClusters] = useState(false);

  const built = useMemo(() => {
    let root: RBNode | null = null;
    for (const key of keys) root = insertRB(root, key).tree;
    return root;
  }, [keys]);

  const tree = broken ?? built;
  const placed = useMemo(() => layout(tree), [tree]);
  const paths = blackHeightsPerPath(tree);
  const legality = isLegalRB(tree);
  const decoded = useMemo(() => decode234(tree), [tree]);
  const levels = useMemo(() => levelsOf(decoded), [decoded]);

  const remaining = NEXT_KEYS.filter((key) => !keys.includes(key));
  const nextKey = remaining[0];
  const nextRepair = useMemo(
    () => (nextKey === undefined ? null : classifyRepair(built, nextKey)),
    [built, nextKey],
  );

  const insert = useCallback((key: number) => {
    setBroken(null);
    setKeys((current) => [...current, key]);
  }, []);

  const breakIt = useCallback(() => {
    // A rotation with no recolour — deliberately wrong, so the learner can see
    // which half of the operation was actually doing the work.
    if (built === null) return;
    setBroken(rotateOnlyAt(built, built.key, "right"));
  }, [built]);

  const handleReset = useCallback(() => {
    setKeys(START);
    setBroken(null);
    setShowClusters(false);
  }, []);

  const repairWord =
    nextRepair === null
      ? ""
      : nextRepair.kind === "none"
        ? "nothing to repair"
        : nextRepair.kind === "rotate"
          ? "a rotation redraws it"
          : "a split — the colour flip";

  return (
    <ExplorationPanel
      explorationId="red-black-encoding"
      title="Insert on both sides at once"
      description="The 2–3–4 tree above, its binary encoding below. Insert a key and watch the same event happen twice — or break the tree on purpose with a rotation that has no recolour."
      toolbar={
        <>
          <PresetPicker
            label="Insert"
            presets={remaining.slice(0, 4).map((key) => ({
              id: String(key),
              label: String(key),
              onSelect: () => insert(key),
            }))}
          />
          <ResetButton onReset={handleReset} />
        </>
      }
      summary={
        broken !== null
          ? `Broken on purpose: ${legality.violations.join("; ")}. The in-order row below has not moved — a rotation never damages order. What it damaged is the black-height rule, which is the recolour's job.`
          : nextRepair === null
            ? `Legal. Black height ${blackHeight(tree)}, ${sizeRB(tree)} keys, height ${heightRB(tree)} — inside the bound 2·log₂(n+1).`
            : `Next key ${nextKey} lands in the ${nextRepair.arityBefore}-node {${nextRepair.nodeKeys.join(", ")}}, so: ${repairWord}.`
      }
      controls={
        <>
          <div className="rb-explorer__decoded">
            <span className="rb-explorer__label">The 2–3–4 tree it encodes</span>
            {levels.map((level, depth) => (
              <div key={depth} className="rb-explorer__level">
                {level.map((node) => (
                  <span key={node} className="rb-explorer__node234">
                    {node}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="rb-explorer__break">
            <span className="rb-explorer__label">The rotation on its own</span>
            <button
              type="button"
              className="btn rb-explorer__break-button"
              onClick={breakIt}
              disabled={broken !== null}
            >
              Rotate only (break it)
            </button>
            <p className="rb-explorer__break-note">
              A rotation with no recolour. Watch the per-path black counts, then
              the in-order row.
            </p>
          </div>

          <ExplorationToggles
            title="Display options"
            toggles={[
              {
                id: "clusters",
                label: "Ring each black node with its red children",
                checked: showClusters,
                onChange: setShowClusters,
              },
            ]}
          />
        </>
      }
      readout={
        <SceneReadout
          title="Result"
          items={[
            {
              id: "legal",
              label: "Legal",
              value: legality.legal ? "yes" : `no — ${legality.violations[0]}`,
            },
            { id: "bh", label: "Black height", value: String(blackHeight(tree)) },
            {
              id: "paths",
              label: "Black nodes per path",
              value: [...new Set(paths)].sort((a, b) => a - b).join(", "),
            },
            { id: "height", label: "Height (edges)", value: String(heightRB(tree)) },
            {
              id: "bound",
              label: "Bound 2·log₂(n+1)",
              value: (2 * Math.log2(sizeRB(tree) + 1)).toFixed(2),
            },
            { id: "inorder", label: "In-order readout", value: inOrderRB(tree).join(", ") },
          ]}
        />
      }
    >
      <div className="rb-explorer__stage">
        <svg
          className="rb-explorer__svg"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`Red-black tree with ${sizeRB(tree)} keys, black height ${blackHeight(tree)}, ${legality.legal ? "legal" : `illegal: ${legality.violations.join("; ")}`}.`}
        >
          {placed.map((node) =>
            node.parent ? (
              <line
                key={`edge-${node.key}`}
                className="rb-explorer__edge"
                x1={node.parent.x}
                y1={node.parent.y}
                x2={node.x}
                y2={node.y}
              />
            ) : null,
          )}
          {showClusters
            ? placed
                .filter((node) => !node.red)
                .map((node) => (
                  <circle
                    key={`ring-${node.key}`}
                    className="rb-explorer__cluster"
                    cx={node.x}
                    cy={node.y + 12}
                    r={NODE_R + 22}
                  />
                ))
            : null}
          {placed.map((node) => (
            <g key={`node-${node.key}`}>
              <circle
                className="rb-explorer__node"
                data-red={node.red || undefined}
                cx={node.x}
                cy={node.y}
                r={NODE_R}
              />
              <text
                className="rb-explorer__node-text"
                data-red={node.red || undefined}
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
              >
                {node.key}
              </text>
            </g>
          ))}
        </svg>
        <p className="rb-explorer__caption">
          Red means “an extra key in my parent's node”. Ring a black node with its
          red children and you have ringed one 2–3–4 node.
        </p>
      </div>
    </ExplorationPanel>
  );
}
