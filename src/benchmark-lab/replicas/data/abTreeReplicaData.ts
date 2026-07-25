/**
 * Pure data for the ab-split replica: the (2,4)-tree stages the excerpt walks
 * through, and a layout calculator that pins the LEAF ROW at a constant
 * height so the tree visibly grows upward at the root — the invariant the
 * reference enforces by construction.
 *
 * Stages are declared as nested key lists; tests verify the sorted order and
 * the split arithmetic rather than trusting the transcription.
 */

export interface AbNode {
  keys: number[];
  children: AbNode[];
}

function node(keys: number[], children: AbNode[] = []): AbNode {
  return { keys, children };
}

/** The five tree states the excerpt passes through, in order. */
export const AB_STAGES: readonly { id: string; root: AbNode; violating: number[] }[] = [
  {
    // Frozen state under the pause prompt: (4 5 6 7) is overfull.
    id: "overflow",
    root: node([1, 3], [node([0]), node([2]), node([4, 5, 6, 7])]),
    violating: [4],
  },
  {
    // After the split: 5 rose into the root.
    id: "after-split",
    root: node([1, 3, 5], [node([0]), node([2]), node([4]), node([6, 7])]),
    violating: [],
  },
  {
    // Insert 8: the rightmost node widens but stays legal.
    id: "after-insert-8",
    root: node([1, 3, 5], [node([0]), node([2]), node([4]), node([6, 7, 8])]),
    violating: [],
  },
  {
    // Insert 9: the rightmost node is overfull again.
    id: "after-inserts",
    root: node([1, 3, 5], [node([0]), node([2]), node([4]), node([6, 7, 8, 9])]),
    violating: [6],
  },
  {
    // 7 rises; now the ROOT is overfull.
    id: "cascade",
    root: node(
      [1, 3, 5, 7],
      [node([0]), node([2]), node([4]), node([6]), node([8, 9])],
    ),
    violating: [1],
  },
  {
    // Root splits; 3 rises into a brand-new root. Height grows upward.
    id: "grown",
    root: node(
      [3],
      [
        node([1], [node([0]), node([2])]),
        node([5, 7], [node([4]), node([6]), node([8, 9])]),
      ],
    ),
    violating: [],
  },
];

export function stageById(id: string): AbNode {
  const stage = AB_STAGES.find((s) => s.id === id);
  if (!stage) throw new Error(`Unknown ab stage: ${id}`);
  return stage.root;
}

/** In-order key reading (must be ascending at every stage). */
export function inorderKeys(root: AbNode): number[] {
  const out: number[] = [];
  const walk = (n: AbNode): void => {
    if (n.children.length === 0) {
      out.push(...n.keys);
      return;
    }
    for (let i = 0; i < n.children.length; i += 1) {
      walk(n.children[i]!);
      if (i < n.keys.length) out.push(n.keys[i]!);
    }
  };
  walk(root);
  return out;
}

/** Depth of every leaf-level node (all must be equal — the (a,b) invariant). */
export function leafDepths(root: AbNode): number[] {
  const depths: number[] = [];
  const walk = (n: AbNode, depth: number): void => {
    if (n.children.length === 0) {
      depths.push(depth);
      return;
    }
    for (const child of n.children) walk(child, depth + 1);
  };
  walk(root, 0);
  return depths;
}

export interface AbLayoutEntry {
  /** Node centre. */
  x: number;
  y: number;
  /** Position per key in this node, keyed by key value. */
  keyX: Record<number, number>;
  keys: number[];
  /** Leaf-square x positions under this node (bottom nodes only). */
  leafXs: number[];
}

export const AB_LAYOUT_CONSTANTS = {
  /** Leaf-square row: PINNED for the whole excerpt. */
  leafY: 175,
  /** Vertical gap between node levels, leaves upward. */
  levelGap: 88,
  /** Horizontal spacing between adjacent leaf squares. */
  leafSpacing: 56,
  keySpacing: 46,
} as const;

/**
 * Layout: leaf squares get consecutive slots centred on x=0; each bottom node
 * centres over its leaf squares; every parent centres over its children.
 * Node y depends on height ABOVE THE LEAF ROW, so deeper trees grow upward
 * while the leaf row never moves.
 */
export function layoutAbTree(root: AbNode): Map<AbNode, AbLayoutEntry> {
  const { leafY, levelGap, leafSpacing, keySpacing } = AB_LAYOUT_CONSTANTS;
  const layout = new Map<AbNode, AbLayoutEntry>();

  const countLeafSquares = (n: AbNode): number =>
    n.children.length === 0
      ? n.keys.length + 1
      : n.children.reduce((sum, c) => sum + countLeafSquares(c), 0);

  const total = countLeafSquares(root);
  const leftEdge = -((total - 1) * leafSpacing) / 2;
  let nextLeaf = 0;

  const heightOf = (n: AbNode): number =>
    n.children.length === 0 ? 1 : 1 + heightOf(n.children[0]!);

  const place = (n: AbNode): AbLayoutEntry => {
    const y = leafY - heightOf(n) * levelGap;
    let x: number;
    let leafXs: number[] = [];
    if (n.children.length === 0) {
      leafXs = Array.from(
        { length: n.keys.length + 1 },
        () => leftEdge + nextLeaf++ * leafSpacing,
      );
      x = (leafXs[0]! + leafXs[leafXs.length - 1]!) / 2;
    } else {
      const childEntries = n.children.map(place);
      x =
        (childEntries[0]!.x + childEntries[childEntries.length - 1]!.x) / 2;
    }
    const keyX: Record<number, number> = {};
    const keyLeft = x - ((n.keys.length - 1) * keySpacing) / 2;
    n.keys.forEach((key, i) => {
      keyX[key] = keyLeft + i * keySpacing;
    });
    const entry: AbLayoutEntry = { x, y, keyX, keys: n.keys, leafXs };
    layout.set(n, entry);
    return entry;
  };

  place(root);
  return layout;
}

/** Flatten a stage's layout into key-token positions keyed by key value. */
export function keyPositions(root: AbNode): Record<number, { x: number; y: number }> {
  const layout = layoutAbTree(root);
  const out: Record<number, { x: number; y: number }> = {};
  for (const entry of layout.values()) {
    for (const key of entry.keys) {
      out[key] = { x: entry.keyX[key]!, y: entry.y };
    }
  }
  return out;
}

export const AB_COLORS = {
  stroke: "#f2f5fa",
  key: "#f2f5fa",
  violation: "#e05252",
  arriving: "#e05252",
  dim: "#5a6170",
  annotation: "#f2f5fa",
} as const;
