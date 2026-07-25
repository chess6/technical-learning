import { describe, expect, it } from "vitest";
import {
  EIGEN_BENCH_MATRIX,
  EIGEN_DIR_DIAG,
  EIGEN_DIR_X,
  EIGEN_FACTORS,
  eigenAnalysisOfBenchMatrix,
  makeFanArrows,
} from "../eigenReplicaData";
import {
  HUFFMAN_LAYOUT,
  HUFFMAN_LEAVES,
  computeMergeSteps,
} from "../huffmanReplicaData";
import {
  AB_LAYOUT_CONSTANTS,
  AB_STAGES,
  inorderKeys,
  keyPositions,
  layoutAbTree,
  leafDepths,
  stageById,
} from "../abTreeReplicaData";
import {
  BFS_EDGES,
  BFS_TICK_SECONDS,
  BFS_VERTICES,
  computeBfsSchedule,
} from "../bfsReplicaData";
import { matrixVectorMultiply } from "../../../../math";

describe("eigen replica data", () => {
  it("declared eigen directions/factors agree with the shared math", () => {
    const analysis = eigenAnalysisOfBenchMatrix();
    expect(analysis.kind).toBe("distinct-real");
    if (analysis.kind !== "distinct-real") throw new Error("expected distinct-real");
    expect(analysis.pairs.map((p) => p.eigenvalue).sort()).toEqual([2, 3]);
    // Each declared direction must be an actual eigenvector at its factor.
    const image3 = matrixVectorMultiply(EIGEN_BENCH_MATRIX, EIGEN_DIR_X);
    expect(image3[0]).toBeCloseTo(EIGEN_DIR_X[0] * EIGEN_FACTORS.xAxis);
    expect(image3[1]).toBeCloseTo(EIGEN_DIR_X[1] * EIGEN_FACTORS.xAxis);
    const image2 = matrixVectorMultiply(EIGEN_BENCH_MATRIX, EIGEN_DIR_DIAG);
    expect(image2[0]).toBeCloseTo(EIGEN_DIR_DIAG[0] * EIGEN_FACTORS.diagonal);
    expect(image2[1]).toBeCloseTo(EIGEN_DIR_DIAG[1] * EIGEN_FACTORS.diagonal);
  });

  it("fans skip the zero vector and fade with distance", () => {
    const fan = makeFanArrows([1, 0], 3, "#ffffff", "#000000");
    expect(fan).toHaveLength(6);
    expect(fan.some((a) => a.tip[0] === 0 && a.tip[1] === 0)).toBe(false);
    const near = fan.find((a) => a.tip[0] === 1)!;
    const far = fan.find((a) => a.tip[0] === 3)!;
    expect(near.color).not.toBe(far.color);
    expect(far.color).toBe("#000000");
  });
});

describe("huffman replica data", () => {
  it("computes the observed merge order by the greedy rule", () => {
    const steps = computeMergeSteps(HUFFMAN_LEAVES);
    expect(steps.map((s) => [s.left, s.right])).toEqual([
      ["leaf-D", "leaf-E"],
      ["leaf-A", "leaf-C"],
      ["merge-1", "merge-2"],
    ]);
    expect(steps.map((s) => s.value)).toEqual([0.31, 0.34, 0.65]);
  });

  it("keeps the frontier sorted ascending after every merge", () => {
    const values = new Map<string, number>(
      HUFFMAN_LEAVES.map((l) => [l.id, l.p]),
    );
    for (const step of computeMergeSteps(HUFFMAN_LEAVES)) {
      values.set(step.parentId, step.value);
      const frontierValues = step.frontierAfter.map((id) => values.get(id)!);
      expect([...frontierValues].sort((a, b) => a - b)).toEqual(frontierValues);
    }
  });

  it("conserves probability into every parent", () => {
    const values = new Map<string, number>(
      HUFFMAN_LEAVES.map((l) => [l.id, l.p]),
    );
    for (const step of computeMergeSteps(HUFFMAN_LEAVES)) {
      expect(step.value).toBeCloseTo(
        values.get(step.left)! + values.get(step.right)!,
        10,
      );
      values.set(step.parentId, step.value);
    }
  });

  it("has a tree slot for every leaf and parent the excerpt places", () => {
    const steps = computeMergeSteps(HUFFMAN_LEAVES);
    for (const step of steps) {
      expect(HUFFMAN_LAYOUT.parentSlots[step.parentId]).toBeDefined();
    }
    for (const id of ["leaf-A", "leaf-C", "leaf-D", "leaf-E"]) {
      expect(HUFFMAN_LAYOUT.treeSlots[id]).toBeDefined();
    }
  });
});

describe("ab-tree replica data", () => {
  it.each(AB_STAGES.map((s) => [s.id] as const))(
    "stage %s keeps keys sorted and all leaves at one depth",
    (id) => {
      const root = stageById(id);
      const keys = inorderKeys(root);
      expect([...keys].sort((a, b) => a - b)).toEqual(keys);
      expect(new Set(leafDepths(root)).size).toBe(1);
    },
  );

  it("covers keys 0..7 before the inserts and 0..9 after", () => {
    expect(inorderKeys(stageById("overflow"))).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(inorderKeys(stageById("grown"))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("pins the leaf row while the root rises a level after the growth", () => {
    const before = layoutAbTree(stageById("overflow"));
    const after = layoutAbTree(stageById("grown"));
    const leafRowYs = (layout: ReturnType<typeof layoutAbTree>) =>
      [...layout.values()]
        .filter((e) => e.leafXs.length > 0)
        .map((e) => e.y);
    // Bottom key-nodes sit one gap above the pinned leaf-square row in both.
    const expectBottom = AB_LAYOUT_CONSTANTS.leafY - AB_LAYOUT_CONSTANTS.levelGap;
    expect(Math.max(...leafRowYs(before))).toBe(expectBottom);
    expect(Math.max(...leafRowYs(after))).toBe(expectBottom);
    // The root is one level higher after the growth.
    const rootYBefore = Math.min(...[...before.values()].map((e) => e.y));
    const rootYAfter = Math.min(...[...after.values()].map((e) => e.y));
    expect(rootYBefore - rootYAfter).toBe(AB_LAYOUT_CONSTANTS.levelGap);
  });

  it("moves only the rising keys between the cascade and grown stages", () => {
    const cascade = keyPositions(stageById("cascade"));
    const grown = keyPositions(stageById("grown"));
    // Key 3 rises a full level.
    expect(grown[3]!.y).toBeLessThan(cascade[3]!.y);
    // Leaf-level keys keep their row.
    expect(grown[0]!.y).toBe(cascade[0]!.y);
    expect(grown[8]!.y).toBe(cascade[8]!.y);
  });
});

describe("bfs replica data", () => {
  it("has a connected fixed instance (no restart state needed)", () => {
    const { numberOf } = computeBfsSchedule();
    expect(numberOf.every((n) => n >= 0)).toBe(true);
    expect(new Set(numberOf).size).toBe(BFS_VERTICES.length);
  });

  it("numbers vertices in enqueue order with the start at 0", () => {
    const { numberOf, transitions } = computeBfsSchedule();
    expect(numberOf[0]).toBe(0);
    const enqueueOrder: number[] = [0];
    for (const t of transitions) {
      if (t.type === "expand") enqueueOrder.push(...t.discovered);
    }
    enqueueOrder.forEach((vertex, i) => {
      expect(numberOf[vertex]).toBe(i);
    });
  });

  it("alternates dequeue/expand after init (the reference's two-state loop)", () => {
    const { transitions } = computeBfsSchedule();
    expect(transitions[0]!.type).toBe("init");
    const loop = transitions.slice(1, -1);
    loop.forEach((t, i) => {
      expect(t.type).toBe(i % 2 === 0 ? "dequeue" : "expand");
    });
    expect(transitions[transitions.length - 1]!.type).toBe("end");
  });

  it("BFS numbers never decrease with distance from the start (layer order)", () => {
    const { numberOf } = computeBfsSchedule();
    // distances via the same adjacency
    const dist = BFS_VERTICES.map(() => -1);
    dist[0] = 0;
    const queue = [0];
    const adjacency: number[][] = BFS_VERTICES.map(() => []);
    for (const [a, b] of BFS_EDGES) {
      adjacency[a]!.push(b);
      adjacency[b]!.push(a);
    }
    while (queue.length) {
      const v = queue.shift()!;
      for (const n of adjacency[v]!) {
        if (dist[n] === -1) {
          dist[n] = dist[v]! + 1;
          queue.push(n);
        }
      }
    }
    for (let a = 0; a < BFS_VERTICES.length; a += 1) {
      for (let b = 0; b < BFS_VERTICES.length; b += 1) {
        if (dist[a]! < dist[b]!) {
          expect(numberOf[a]!).toBeLessThan(numberOf[b]!);
        }
      }
    }
  });

  it("keeps the reference metronome cadence", () => {
    expect(BFS_TICK_SECONDS).toBeCloseTo(1.7333, 3);
  });
});
