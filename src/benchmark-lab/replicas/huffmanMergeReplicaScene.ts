import { Line, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { columnLayout } from "../../guided-scenes/scenes/kitLayout";
import {
  makeRingToken,
  makeStackedToken,
  pulseRing,
} from "../../guided-scenes/scenes/kitMotion";
import { beginProbeRun, registerProbe } from "../probes/probeRegistry";
import { huffmanMergeManifest as manifest } from "../manifests/huffmanMerge";
import { makeEventLogger, runReplicaBeats } from "./replicaKit";
import {
  HUFFMAN_COLORS as C,
  HUFFMAN_LAYOUT,
  HUFFMAN_LEAVES,
  computeMergeSteps,
} from "./data/huffmanReplicaData";

/**
 * Reconstruction of Reducible's Huffman build choreography, from observation:
 * a sorted frontier column on the left; each merge slides the SAME leaf
 * objects into tree slots, grows a parent ring at the merge point, and posts
 * a queue-token copy of that parent back into the re-sorted column; internal
 * merges consume the tokens by sliding them onto their tree originals and
 * fading. Merge order and sums come from the greedy algorithm in the data
 * module — the scene enacts, never re-derives.
 */

const ID = manifest.id;

export const huffmanMergeReplicaScene = makeScene2D(function* (view) {
  view.fill("#0a0d11");
  beginProbeRun(ID);
  const logEvent = makeEventLogger(manifest);

  const steps = computeMergeSteps(HUFFMAN_LEAVES);
  const [stepDE, stepAC, stepInternal] = steps;
  if (!stepDE || !stepAC || !stepInternal) {
    throw new Error("huffman replica expects exactly three merge steps");
  }
  const columnRows = columnLayout(5, HUFFMAN_LAYOUT.column.x, HUFFMAN_LAYOUT.column.topY, HUFFMAN_LAYOUT.column.rowGap);
  const rowVec = (i: number) => new Vector2(columnRows[i]!.x, columnRows[i]!.y);

  // --- leaves: created ONCE, moved forever after ----------------------------
  const leafNodes = new Map<string, ReturnType<typeof makeStackedToken>>();
  for (const [i, leaf] of HUFFMAN_LEAVES.entries()) {
    const token = makeStackedToken(
      leaf.p.toFixed(2),
      leaf.symbol,
      C.valueBox,
      C.symbolBox,
    );
    token.node.position(rowVec(i));
    leafNodes.set(leaf.id, token);
    view.add(token.node);
  }

  // --- parents + queue tokens + edges ---------------------------------------
  const parentNodes = new Map<string, ReturnType<typeof makeRingToken>>();
  const queueTokens = new Map<string, ReturnType<typeof makeRingToken>>();
  const edges = new Map<string, Line>();

  const slotOf = (id: string): Vector2 => {
    const leafSlot = HUFFMAN_LAYOUT.treeSlots[id];
    if (leafSlot) return new Vector2(leafSlot.x, leafSlot.y - 10);
    const parentSlot = HUFFMAN_LAYOUT.parentSlots[id];
    if (parentSlot) return new Vector2(parentSlot.x, parentSlot.y);
    throw new Error(`No tree slot for ${id}`);
  };

  for (const step of steps) {
    const slot = HUFFMAN_LAYOUT.parentSlots[step.parentId]!;
    const parent = makeRingToken(step.value.toFixed(2), C.parentRing);
    parent.node.position(new Vector2(slot.x, slot.y));
    parent.node.scale(0);
    parentNodes.set(step.parentId, parent);

    const token = makeRingToken(step.value.toFixed(2), C.parentRing, { radius: 26 });
    token.node.position(new Vector2(slot.x, slot.y));
    token.node.opacity(0);
    queueTokens.set(step.parentId, token);

    for (const side of ["left", "right"] as const) {
      const childId = side === "left" ? step.left : step.right;
      const childSlot = slotOf(childId);
      const from = new Vector2(slot.x, slot.y);
      const direction = childSlot.sub(from).normalized;
      const start = from.add(direction.scale(34));
      const end = childSlot.add(direction.scale(-38));
      const edge = new Line({
        stroke: C.edge,
        lineWidth: 4,
        points: [start, end],
        end: 0,
      });
      edges.set(`edge-${step.parentId}-${side}`, edge);
      view.add(edge);
    }
  }
  for (const parent of parentNodes.values()) view.add(parent.node);
  for (const token of queueTokens.values()) view.add(token.node);

  // Manifest ids for the computed parents (kept aligned by the data tests).
  const parentAlias: Record<string, string> = {
    "parent-DE": "merge-1",
    "parent-AC": "merge-2",
    "root-065": "merge-3",
  };
  const edgeAlias: Record<string, string> = {
    "edge-DE-left": "edge-merge-1-left",
    "edge-DE-right": "edge-merge-1-right",
    "edge-AC-left": "edge-merge-2-left",
    "edge-AC-right": "edge-merge-2-right",
    "edge-065-left": "edge-merge-3-left",
    "edge-065-right": "edge-merge-3-right",
  };
  const tokenAlias: Record<string, string> = {
    "token-DE": "merge-1",
    "token-AC": "merge-2",
  };

  // --- probes ----------------------------------------------------------------
  for (const leaf of HUFFMAN_LEAVES) {
    const token = leafNodes.get(leaf.id)!;
    registerProbe(ID, leaf.id, () => ({
      x: token.node.position().x,
      y: token.node.position().y,
      opacity: token.node.opacity(),
      width: 46,
      height: 72,
      value: leaf.p,
      text: leaf.symbol,
    }));
  }
  for (const [manifestId, computedId] of Object.entries(parentAlias)) {
    const parent = parentNodes.get(computedId)!;
    const value = steps.find((s) => s.parentId === computedId)!.value;
    registerProbe(ID, manifestId, () => ({
      x: parent.node.position().x,
      y: parent.node.position().y,
      opacity: parent.node.opacity() * Math.min(1, parent.node.scale().x),
      width: 60,
      height: 60,
      value,
    }));
  }
  for (const [manifestId, computedId] of Object.entries(tokenAlias)) {
    const token = queueTokens.get(computedId)!;
    const value = steps.find((s) => s.parentId === computedId)!.value;
    registerProbe(ID, manifestId, () => ({
      x: token.node.position().x,
      y: token.node.position().y,
      opacity: token.node.opacity(),
      width: 52,
      height: 52,
      value,
    }));
  }
  for (const [manifestId, edgeKey] of Object.entries(edgeAlias)) {
    const edge = edges.get(edgeKey)!;
    registerProbe(ID, manifestId, () => {
      const points = [
        edge.parsedPoints()[0]!,
        edge.parsedPoints()[edge.parsedPoints().length - 1]!,
      ];
      const mid = points[0]!.add(points[1]!).scale(0.5);
      return {
        x: mid.x,
        y: mid.y,
        opacity: Math.min(edge.opacity(), edge.end()),
      };
    });
  }

  // --- choreography helpers ----------------------------------------------------
  function* travelToTree(leafId: string, delay: number): ThreadGenerator {
    const token = leafNodes.get(leafId)!;
    const slot = HUFFMAN_LAYOUT.treeSlots[leafId]!;
    yield* waitFor(delay);
    yield* token.node.position(
      new Vector2(slot.x, slot.y),
      1.5,
      easeInOutCubic,
    );
  }

  function* growParent(parentId: string): ThreadGenerator {
    const parent = parentNodes.get(parentId)!;
    yield* all(
      parent.node.scale(1, 0.5, easeInOutCubic),
      edges.get(`edge-${parentId}-left`)!.end(1, 0.6, easeInOutCubic),
      edges.get(`edge-${parentId}-right`)!.end(1, 0.6, easeInOutCubic),
    );
  }

  function* postToken(
    parentId: string,
    columnRow: number,
    resort: [string, number][],
  ): ThreadGenerator {
    const token = queueTokens.get(parentId)!;
    token.node.opacity(1);
    yield* all(
      token.node.position(rowVec(columnRow), 1.0, easeInOutCubic),
      ...resort.map(([leafId, row]) =>
        leafNodes
          .get(leafId)!
          .node.position(rowVec(row), 1.0, easeInOutCubic),
      ),
    );
  }

  const bodies: Record<string, () => ThreadGenerator> = {
    // [1450.0-1454.7) the sorted column, at rest.
    *frontier() {
      yield* waitFor(4.0);
    },
    // [1454.7-1462.5) merge D and E.
    *"merge-DE"() {
      logEvent("highlight-two-lowest"); // 0.0
      yield* all(
        pulseRing(view, columnRows[0]!, C.emphasis, { radius: 44 }),
        pulseRing(view, columnRows[1]!, C.emphasis, { radius: 44 }),
      );
      yield* waitFor(0.6);
      logEvent("de-travel-start"); // 1.5
      yield* all(travelToTree(stepDE.left, 0), travelToTree(stepDE.right, 0.2));
      yield* waitFor(0.4);
      logEvent("parent-de-born"); // 3.6
      yield* growParent(stepDE.parentId);
      yield* waitFor(1.6);
      logEvent("token-de-posted"); // 5.8
      yield* postToken(stepDE.parentId, 2, [
        ["leaf-A", 0],
        ["leaf-C", 1],
        ["leaf-B", 3],
      ]);
    },
    // [1462.5-1471.8) hold; the state is a smaller instance of itself.
    *"note-recursion"() {
      yield* waitFor(3.3);
      logEvent("recursion-noted"); // 3.3
      yield* pulseRing(
        view,
        { x: columnRows[2]!.x, y: columnRows[2]!.y },
        C.parentRing,
        { radius: 40 },
      );
      yield* waitFor(3.0);
    },
    // [1471.8-1481.7) merge A and C.
    *"merge-AC"() {
      logEvent("highlight-ac"); // 0.0
      yield* all(
        pulseRing(view, columnRows[0]!, C.emphasis, { radius: 44 }),
        pulseRing(view, columnRows[1]!, C.emphasis, { radius: 44 }),
      );
      yield* waitFor(0.6);
      logEvent("ac-travel-start"); // 1.5
      yield* all(travelToTree(stepAC.left, 0), travelToTree(stepAC.right, 0.2));
      yield* growParent(stepAC.parentId);
      yield* waitFor(1.8);
      logEvent("token-ac-posted"); // 5.6
      yield* postToken(stepAC.parentId, 1, [
        ["leaf-B", 2],
      ]);
      // token-DE moves to row 0 in the same re-sort.
      yield* queueTokens
        .get(stepDE.parentId)!
        .node.position(rowVec(0), 0.6, easeInOutCubic);
    },
    // [1481.7-1494.7) the two lowest are the internal-node tokens.
    *"merge-internal"() {
      yield* waitFor(7.0);
      logEvent("highlight-internal-tokens"); // 7.0
      yield* all(
        pulseRing(view, columnRows[0]!, C.emphasis, { radius: 40 }),
        pulseRing(view, columnRows[1]!, C.emphasis, { radius: 40 }),
      );
      yield* waitFor(0.6);
      logEvent("internal-merge-start"); // 8.5
      const tokenDE = queueTokens.get(stepDE.parentId)!;
      const tokenAC = queueTokens.get(stepAC.parentId)!;
      const slotDE = HUFFMAN_LAYOUT.parentSlots[stepDE.parentId]!;
      const slotAC = HUFFMAN_LAYOUT.parentSlots[stepAC.parentId]!;
      yield* all(
        tokenDE.node.position(new Vector2(slotDE.x, slotDE.y), 1.2, easeInOutCubic),
        tokenAC.node.position(new Vector2(slotAC.x, slotAC.y), 1.2, easeInOutCubic),
      );
      yield* all(tokenDE.node.opacity(0, 0.4), tokenAC.node.opacity(0, 0.4));
      yield* waitFor(0.9);
      // 11.0: the grandparent grows; B slides up the emptying column.
      yield* all(
        growParent(stepInternal.parentId),
        leafNodes
          .get("leaf-B")!
          .node.position(new Vector2(HUFFMAN_LAYOUT.column.x, 60), 0.8, easeInOutCubic),
      );
    },
    // [1494.7-1497.0) hold with two elements remaining.
    *"hold-two-left"() {
      logEvent("two-remaining"); // 0.0
      yield* waitFor(1.8);
    },
  };

  yield* runReplicaBeats(manifest, bodies);
});
