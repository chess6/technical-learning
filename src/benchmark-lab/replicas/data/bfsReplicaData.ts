/**
 * Pure data for the bfs-frontier replica: a FIXED 19-vertex instance with the
 * reference's staggered-lattice silhouette, plus the BFS schedule computed by
 * an actual queue — numbers and colours in the scene are read from this
 * schedule, so the numbers-match-BFS-order invariant holds by construction
 * (the reference randomises edges per run; fixing the instance is a declared
 * deviation).
 */

export interface BfsVertex {
  x: number;
  y: number;
}

/** Vertex lattice observed off the reference frames (stage coords). */
export const BFS_VERTICES: readonly BfsVertex[] = [
  // row 0
  { x: -288, y: -210 },
  { x: -192, y: -210 },
  // row 1
  { x: -336, y: -130 },
  { x: -240, y: -130 },
  { x: -144, y: -130 },
  // row 2
  { x: -384, y: -50 },
  { x: -288, y: -50 },
  { x: -192, y: -50 },
  { x: -96, y: -50 },
  // row 3
  { x: -336, y: 30 },
  { x: -240, y: 30 },
  { x: -144, y: 30 },
  // row 4
  { x: -384, y: 110 },
  { x: -288, y: 110 },
  { x: -192, y: 110 },
  { x: -96, y: 110 },
  // row 5
  { x: -336, y: 190 },
  { x: -240, y: 190 },
  { x: -144, y: 190 },
];

/** Fixed edge set (connected; lattice-neighbour pairs). */
export const BFS_EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 2], [0, 3], [1, 3], [1, 4],
  [2, 3], [3, 4],
  [2, 5], [2, 6], [3, 6], [3, 7], [4, 7], [4, 8],
  [5, 6], [6, 7], [7, 8],
  [5, 9], [6, 9], [6, 10], [7, 10], [7, 11], [8, 11],
  [9, 10], [10, 11],
  [9, 12], [9, 13], [10, 13], [10, 14], [11, 14], [11, 15],
  [12, 16], [13, 16], [14, 17], [14, 18], [15, 18],
  [16, 17], [17, 18],
];

export function bfsAdjacency(): number[][] {
  const adjacency: number[][] = BFS_VERTICES.map(() => []);
  for (const [a, b] of BFS_EDGES) {
    adjacency[a]!.push(b);
    adjacency[b]!.push(a);
  }
  for (const list of adjacency) list.sort((x, y) => x - y);
  return adjacency;
}

export type BfsTransition =
  | { type: "init"; vertex: number }
  | { type: "dequeue"; vertex: number }
  | {
      type: "expand";
      vertex: number;
      /** Newly discovered neighbours in adjacency order. */
      discovered: number[];
    }
  | { type: "end" };

export interface BfsSchedule {
  /** State-machine transitions in metronome order. */
  transitions: BfsTransition[];
  /** BFS number per vertex (enqueue order), -1 if never reached. */
  numberOf: number[];
}

/** Real BFS over the fixed instance, producing the exact transition list. */
export function computeBfsSchedule(start = 0): BfsSchedule {
  const adjacency = bfsAdjacency();
  const numberOf = BFS_VERTICES.map(() => -1);
  const queue: number[] = [];
  const transitions: BfsTransition[] = [];
  let nextNumber = 0;

  numberOf[start] = nextNumber++;
  queue.push(start);
  transitions.push({ type: "init", vertex: start });

  while (queue.length > 0) {
    const vertex = queue.shift()!;
    transitions.push({ type: "dequeue", vertex });
    const discovered: number[] = [];
    for (const neighbour of adjacency[vertex]!) {
      if (numberOf[neighbour] === -1) {
        numberOf[neighbour] = nextNumber++;
        queue.push(neighbour);
        discovered.push(neighbour);
      }
    }
    transitions.push({ type: "expand", vertex, discovered });
  }
  transitions.push({ type: "end" });
  return { transitions, numberOf };
}

/** Metronome period of the reference (52 frames at 30 fps). */
export const BFS_TICK_SECONDS = 52 / 30;

export const BFS_PSEUDOCODE = {
  title: "Breadth-first search",
  lines: [
    "Make a queue, add the start vertex",
    "While the queue is not empty:",
    "    Take the front vertex out",
    "    Add its new neighbours to the queue",
    "Done",
  ],
} as const;

export const BFS_COLORS = {
  undiscovered: "#16283d",
  undiscoveredRing: "#4d84c4",
  frontier: "#e8d44d",
  done: "#3f9d55",
  action: "#e08b3a",
  edge: "#2e5d3a",
  panelTitle: "#e8d44d",
  panelText: "#f2f5fa",
  number: "#f2f5fa",
} as const;
