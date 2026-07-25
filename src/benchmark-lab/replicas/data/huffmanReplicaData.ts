import { stableAscendingOrder } from "../../../guided-scenes/scenes/kitLayout";

/**
 * Pure data for the huffman-merge replica. The merge order is COMPUTED by the
 * greedy rule over the observed distribution — never hardcoded — so the
 * value-conservation and two-lowest invariants hold by construction and the
 * tests can falsify the choreography against the algorithm.
 */

export interface HuffmanLeafSpec {
  id: string;
  symbol: string;
  p: number;
}

/** Distribution observed off the reference frames, ascending. */
export const HUFFMAN_LEAVES: readonly HuffmanLeafSpec[] = [
  { id: "leaf-D", symbol: "D", p: 0.15 },
  { id: "leaf-E", symbol: "E", p: 0.16 },
  { id: "leaf-A", symbol: "A", p: 0.17 },
  { id: "leaf-C", symbol: "C", p: 0.17 },
  { id: "leaf-B", symbol: "B", p: 0.35 },
];

export interface HuffmanMergeStep {
  /** Frontier member ids consumed (lowest first). */
  left: string;
  right: string;
  parentId: string;
  /** Parent's displayed value = sum of the two consumed values. */
  value: number;
  /** Frontier ids in sorted order AFTER this merge (including the new token). */
  frontierAfter: string[];
}

/**
 * Run the greedy merge until `stopWhen` members remain (the excerpt stops at
 * two). Ties keep insertion order (stable), matching the reference's visible
 * choice of A before C.
 */
export function computeMergeSteps(
  leaves: readonly HuffmanLeafSpec[],
  stopWhen = 2,
): HuffmanMergeStep[] {
  const frontier = leaves.map((leaf) => ({ id: leaf.id, value: leaf.p }));
  const steps: HuffmanMergeStep[] = [];
  let parentIndex = 0;
  while (frontier.length > stopWhen) {
    const order = stableAscendingOrder(frontier.map((f) => f.value));
    const a = frontier[order[0]!]!;
    const b = frontier[order[1]!]!;
    const value = Number((a.value + b.value).toFixed(4));
    parentIndex += 1;
    const parentId = `merge-${parentIndex}`;
    const rest = frontier.filter((f) => f !== a && f !== b);
    rest.push({ id: parentId, value });
    const sorted = stableAscendingOrder(rest.map((f) => f.value)).map(
      (i) => rest[i]!,
    );
    frontier.length = 0;
    frontier.push(...sorted);
    steps.push({
      left: a.id,
      right: b.id,
      parentId,
      value,
      frontierAfter: sorted.map((f) => f.id),
    });
  }
  return steps;
}

/** Stage-space slots observed off the reference frames. */
export const HUFFMAN_LAYOUT = {
  column: { x: -338, topY: -172, rowGap: 88 },
  /** Final tree slot per leaf id. */
  treeSlots: {
    "leaf-A": { x: -203, y: 197 },
    "leaf-C": { x: -68, y: 197 },
    "leaf-D": { x: 67, y: 197 },
    "leaf-E": { x: 202, y: 197 },
  } as Record<string, { x: number; y: number }>,
  /** Parent slots keyed by computed parent id (merge order). */
  parentSlots: {
    "merge-1": { x: 135, y: 67 },
    "merge-2": { x: -135, y: 67 },
    "merge-3": { x: 0, y: -68 },
  } as Record<string, { x: number; y: number }>,
} as const;

export const HUFFMAN_COLORS = {
  valueBox: "#e8d44d",
  symbolBox: "#5db6d6",
  parentRing: "#e8d44d",
  edge: "#8b93a1",
  emphasis: "#f2f5fa",
  text: "#f2f5fa",
} as const;
