import type { BenchmarkManifest } from "./types";

/** Focused rendered-video window for length-paced pseudocode write-in. */
export const bfsPseudocodeWriteinManifest: BenchmarkManifest = {
  id: "bfs-pseudocode-writein",
  title: "BFS pseudocode write-in",
  packDir: ".reference-sources/packs/mVzsz8Actrc",
  source: {
    repoSlug: "manim-js",
    repoUrl: "https://github.com/JazonJiao/Manim.js",
    inspectedCommit: "7cd0da52fab9300c48e05d71bc655151a52d8a79",
    videoId: "mVzsz8Actrc",
    videoTitle: "Breadth-first search, visualized | Graph Algorithm 1",
    channel: "Jazon Jiao",
    sceneSources: ["Graph_BFS", "Tracer", "TextWriteIn"],
    license: "none declared (reference-only)",
  },
  pedagogicalPurpose:
    "Measure pseudocode that writes beside an already established graph, " +
    "with line timing proportional to text length so the panel can carry narration.",
  beats: [
    {
      id: "pseudocode-writein",
      title: "Pseudocode writes beside stable state",
      refStart: 12.5,
      refEnd: 21.5,
      purpose:
        "Write the panel title and lines in sequence while the graph remains fixed.",
      visibleObjects: [
        "graph-nodes",
        "graph-edges",
        "pseudo-title",
        "pseudo-lines",
      ],
      text: {
        kind: "pseudocode-panel",
        note: "Character write-in; longer lines receive proportionally more time.",
      },
      camera: { mode: "static" },
    },
  ],
  objects: [
    {
      id: "graph-nodes",
      kind: "shape",
      description: "Established graph node anchor.",
      persistsAcross: ["pseudocode-writein"],
      maxStepPx: 4,
    },
    {
      id: "graph-edges",
      kind: "edge",
      description: "Established graph edge anchor.",
      persistsAcross: ["pseudocode-writein"],
      maxStepPx: 4,
    },
    {
      id: "pseudo-title",
      kind: "label",
      description: "Accent title of the pseudocode panel.",
      persistsAcross: ["pseudocode-writein"],
      maxStepPx: 4,
    },
    {
      id: "pseudo-lines",
      kind: "panel",
      description: "Five persistent pseudocode lines, sampled as one text ledger.",
      persistsAcross: ["pseudocode-writein"],
      maxStepPx: 4,
    },
  ],
  events: [
    {
      id: "pseudo-writein-start",
      refTime: 12.5,
      description: "The pseudocode panel begins writing.",
      anchor: "estimated",
    },
  ],
  landmarks: [],
  invariants: [
    {
      id: "write-in-never-regresses",
      description: "Visible pseudocode only gains characters.",
      beats: ["pseudocode-writein"],
    },
    {
      id: "graph-fixed-during-write-in",
      description: "Graph geometry remains fixed while text writes beside it.",
      beats: ["pseudocode-writein"],
    },
  ],
  transitions: [
    {
      refTime: 12.5,
      kind: "grow",
      objects: ["pseudo-title", "pseudo-lines"],
      note: "Text reveals progressively; it is not swapped in as a finished panel.",
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
      id: "typography",
      classification: "intentionally different for product semantics",
      note: "The replica uses the product sans stack and neutral pseudocode wording.",
    },
  ],
};
