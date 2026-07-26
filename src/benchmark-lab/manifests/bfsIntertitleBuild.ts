import type { BenchmarkManifest } from "./types";

/**
 * Focused opening window from the rendered reference video. It measures the
 * channel-neutral treatment only: an intertitle yields to a graph whose nodes
 * and then edges arrive with staggered onsets.
 */
export const bfsIntertitleBuildManifest: BenchmarkManifest = {
  id: "bfs-intertitle-build",
  title: "BFS intertitle → staggered graph build",
  packDir: ".reference-sources/packs/mVzsz8Actrc",
  source: {
    repoSlug: "manim-js",
    repoUrl: "https://github.com/JazonJiao/Manim.js",
    inspectedCommit: "7cd0da52fab9300c48e05d71bc655151a52d8a79",
    videoId: "mVzsz8Actrc",
    videoTitle: "Breadth-first search, visualized | Graph Algorithm 1",
    channel: "Jazon Jiao",
    sceneSources: ["Graph01", "Graph", "Graph_U", "Node", "Edge"],
    license: "none declared (reference-only)",
  },
  pedagogicalPurpose:
    "Measure a full-frame intertitle yielding to mathematics and a diagram " +
    "whose fixed vertices and edges establish themselves with staggered onsets.",
  beats: [
    {
      id: "intro-card",
      title: "Full-frame intertitle",
      refStart: 0,
      refEnd: 5,
      purpose:
        "Name the topic on an otherwise empty frame before the mathematical object appears.",
      visibleObjects: ["intro-title"],
      text: {
        kind: "intertitle",
        note: "Neutral topic text; reference branding is intentionally excluded.",
      },
      camera: { mode: "static" },
    },
    {
      id: "graph-build",
      title: "Staggered graph build",
      refStart: 5,
      refEnd: 12.5,
      purpose:
        "Place vertices first, then grow edges, with staggered onsets and fixed landed geometry.",
      visibleObjects: [
        "graph-nodes",
        "graph-edges",
        "graph-node-first",
        "graph-node-last",
        "graph-edge-first",
        "graph-edge-last",
      ],
      text: { kind: "none" },
      camera: { mode: "static" },
    },
  ],
  objects: [
    {
      id: "intro-title",
      kind: "label",
      description: "Neutral full-frame topic intertitle.",
      persistsAcross: ["intro-card"],
      maxStepPx: 4,
    },
    {
      id: "graph-nodes",
      kind: "shape",
      description: "Mid-lattice node anchoring the landed graph.",
      persistsAcross: ["graph-build"],
      maxStepPx: 4,
    },
    {
      id: "graph-edges",
      kind: "edge",
      description: "Central edge anchoring the landed graph.",
      persistsAcross: ["graph-build"],
      maxStepPx: 4,
    },
    {
      id: "graph-node-first",
      kind: "node",
      description: "First vertex in the stagger schedule.",
      persistsAcross: ["graph-build"],
      maxStepPx: 4,
    },
    {
      id: "graph-node-last",
      kind: "node",
      description: "Last vertex in the stagger schedule.",
      persistsAcross: ["graph-build"],
      maxStepPx: 4,
    },
    {
      id: "graph-edge-first",
      kind: "edge",
      description: "First edge in the stagger schedule.",
      persistsAcross: ["graph-build"],
      maxStepPx: 4,
    },
    {
      id: "graph-edge-last",
      kind: "edge",
      description: "Last edge in the stagger schedule.",
      persistsAcross: ["graph-build"],
      maxStepPx: 4,
    },
  ],
  events: [
    {
      id: "intro-writein-start",
      refTime: 1,
      description: "The rendered topic intertitle starts writing.",
      anchor: "estimated",
    },
    {
      id: "nodes-build-start",
      refTime: 5,
      description: "The first graph vertices start arriving.",
      anchor: "estimated",
    },
    {
      id: "edges-build-start",
      refTime: 8,
      description: "Edges begin growing between established vertices.",
      anchor: "estimated",
    },
  ],
  landmarks: [],
  invariants: [
    {
      id: "node-build-is-staggered",
      description: "The first node becomes visible before the last node.",
      beats: ["graph-build"],
    },
    {
      id: "edge-build-is-staggered",
      description: "The first edge begins drawing before the last edge.",
      beats: ["graph-build"],
    },
  ],
  transitions: [
    {
      refTime: 5,
      kind: "cut",
      objects: ["intro-title"],
      note: "The intertitle yields to the mathematical scene.",
    },
    {
      refTime: 5,
      kind: "grow",
      objects: ["graph-node-first", "graph-node-last"],
    },
    {
      refTime: 8,
      kind: "grow",
      objects: ["graph-edge-first", "graph-edge-last"],
    },
  ],
  tolerances: {
    eventTimeSec: 0.65,
    holdSec: 0.8,
    landmarkPx: 28,
    landmarkScaleRatio: 0.2,
    visibleOpacity: 0.05,
  },
  knownDeviations: [
    {
      id: "reference-branding",
      classification: "intentionally different for product semantics",
      note:
        "The rendered reference opening contains channel branding; the replica " +
        "keeps only the intertitle treatment and uses neutral topic text.",
    },
    {
      id: "fixed-graph-instance",
      classification: "intentionally different for product semantics",
      note:
        "The reference randomises edges; the replica uses the committed deterministic graph instance.",
    },
  ],
};
