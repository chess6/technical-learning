import type { BenchmarkManifest } from "./types";

/**
 * Focused benchmark: begin from the established graph/pseudocode frame, enqueue
 * the start vertex, then run the synchronized dequeue/expand metronome
 * (0:21.5-0:38.5). The title, graph build, and nine-second text write-in remain
 * documented in the source pack instead of consuming every comparison run.
 */
export const bfsFrontierManifest: BenchmarkManifest = {
  id: "bfs-frontier",
  title: "BFS synchronized frontier trace (manim-js)",
  packDir: ".reference-sources/packs/mVzsz8Actrc",
  source: {
    repoSlug: "manim-js",
    repoUrl: "https://github.com/JazonJiao/Manim.js",
    inspectedCommit: "7cd0da52fab9300c48e05d71bc655151a52d8a79",
    videoId: "mVzsz8Actrc",
    videoTitle: "Breadth-first search, visualized | Graph Algorithm 1",
    channel: "Jazon Jiao",
    sceneSources: ["Graph01 (1_bfs.js)", "Graph_BFS", "Tracer", "Node", "Edge"],
    license: "none declared (reference-only)",
  },
  pedagogicalPurpose:
    "The pseudocode panel acts as narrator while one state transition moves " +
    "its tracer and mutates the graph. Persistent colours and enqueue numbers " +
    "make the expanding BFS frontier reconstructible without voiceover.",
  beats: [
    {
      id: "init-enqueue",
      title: "Enqueue the start vertex",
      refStart: 21.5,
      refEnd: 23.5,
      purpose:
        "Point at the enqueue line while vertex 0 becomes frontier-yellow and " +
        "receives its computed enqueue number.",
      visibleObjects: [
        "graph-nodes",
        "graph-edges",
        "pseudo-title",
        "pseudo-lines",
        "tracer",
        "vertex-0",
      ],
      text: { kind: "pseudocode-panel" },
      camera: { mode: "static" },
    },
    {
      id: "trace-loop",
      title: "Dequeue / absorb-neighbours metronome",
      refStart: 23.5,
      refEnd: 38.5,
      purpose:
        "Alternate dequeue pulses with expansions at the reference cadence; " +
        "the tracer, state colour, incident-edge flash, and enqueue numbers " +
        "change in one synchronized action.",
      visibleObjects: [
        "graph-nodes",
        "graph-edges",
        "pseudo-title",
        "pseudo-lines",
        "tracer",
        "vertex-0",
        "vertex-4",
      ],
      text: { kind: "pseudocode-panel" },
      camera: { mode: "static" },
    },
  ],
  objects: [
    {
      id: "graph-nodes",
      kind: "shape",
      description: "The fixed 19-vertex lattice, tracked at vertex 9.",
      persistsAcross: ["init-enqueue", "trace-loop"],
      maxStepPx: 4,
    },
    {
      id: "graph-edges",
      kind: "edge",
      description: "The fixed edge set, tracked at a central edge midpoint.",
      persistsAcross: ["init-enqueue", "trace-loop"],
      maxStepPx: 4,
    },
    {
      id: "pseudo-title",
      kind: "label",
      description: "Persistent pseudocode-panel title.",
      persistsAcross: ["init-enqueue", "trace-loop"],
      maxStepPx: 4,
    },
    {
      id: "pseudo-lines",
      kind: "panel",
      description: "Five-line pseudocode panel, tracked at line one's anchor.",
      persistsAcross: ["init-enqueue", "trace-loop"],
      maxStepPx: 4,
    },
    {
      id: "tracer",
      kind: "marker",
      description: "Arrow that points at the line enacted by the current graph mutation.",
      persistsAcross: ["init-enqueue", "trace-loop"],
      maxStepPx: 60,
    },
    {
      id: "vertex-0",
      kind: "node",
      description: "Start vertex: first numbered, first frontier member, first done.",
      persistsAcross: ["init-enqueue", "trace-loop"],
      maxStepPx: 4,
    },
    {
      id: "vertex-4",
      kind: "node",
      description: "A later vertex whose state remains derived from the BFS schedule.",
      persistsAcross: ["trace-loop"],
      maxStepPx: 4,
    },
  ],
  events: [
    {
      id: "enqueue-start-vertex",
      refTime: 21.5,
      description: "Tracer points at enqueue; vertex 0 turns yellow and is numbered.",
      anchor: "scene-map",
    },
    {
      id: "first-dequeue",
      refTime: 23.5,
      description: "Vertex 0 receives the first dequeue pulse.",
      anchor: "scene-map",
    },
    {
      id: "first-expand",
      refTime: 25.2,
      description: "Vertex 0 completes and its neighbours enter the frontier.",
      anchor: "scene-map",
    },
    {
      id: "metronome-tick-6",
      refTime: 33.9,
      description: "The sixth later tick keeps the uniform 1.73-second cadence.",
      anchor: "scene-map",
    },
  ],
  landmarks: [
    {
      id: "vertex-0-pos",
      objectId: "vertex-0",
      beatId: "init-enqueue",
      x: -288,
      y: -210,
      note: "Start vertex at the top-left of the fixed lattice.",
    },
    {
      id: "panel-title-pos",
      objectId: "pseudo-title",
      beatId: "init-enqueue",
      x: 14,
      y: -212,
      note: "Left anchor of the panel title in the upper-right half.",
    },
    {
      id: "panel-line1-pos",
      objectId: "pseudo-lines",
      beatId: "init-enqueue",
      x: 40,
      y: -175,
      note: "Left anchor of the first pseudocode line.",
    },
  ],
  invariants: [
    {
      id: "vertex-positions-frozen",
      description: "Placed vertices never move; only state and labels change.",
      beats: ["init-enqueue", "trace-loop"],
    },
    {
      id: "numbers-match-bfs-order",
      description: "Displayed numbers equal the computed enqueue order.",
      beats: ["trace-loop"],
    },
    {
      id: "done-never-regresses",
      description: "A done vertex never returns to frontier or undiscovered.",
      beats: ["trace-loop"],
    },
    {
      id: "tracer-agrees-with-state",
      description: "The tracer points at the operation enacted on the graph.",
      beats: ["init-enqueue", "trace-loop"],
    },
  ],
  transitions: [
    {
      refTime: 23.5,
      kind: "continuous-morph",
      objects: ["vertex-0", "tracer"],
      note: "The state pulse and tracer movement fire from one transition.",
    },
  ],
  tolerances: {
    eventTimeSec: 0.35,
    holdSec: 0.8,
    landmarkPx: 24,
    landmarkScaleRatio: 0.15,
    visibleOpacity: 0.05,
  },
  knownDeviations: [
    {
      id: "fixed-graph-instance",
      note:
        "Reference randomises edges per run; the replica fixes one deterministic " +
        "lattice instance and derives every number/state from a real BFS.",
    },
  ],
};
