import type { BenchmarkManifest } from "./types";

/**
 * Benchmark: BFS as an expanding frontier (Jazon Jiao / manim-js, mVzsz8Actrc,
 * 0:00-0:40).
 *
 * Chosen from the manim-js pack as the NO-NARRATION case: pacing is carried by
 * on-canvas text (a pseudocode panel whose write-in speed is proportional to
 * text length) and a fixed metronome (one algorithm micro-step every ~1.73 s).
 * Tests: staggered build-in, a pseudocode panel as the narrator with a tracer
 * arrow moved by the SAME state transition that mutates the graph, persistent
 * state colours (undiscovered/frontier/done) vs transient action pulses
 * (orange), discovery-order numbers left as permanent residue, and fixed
 * vertex geometry so every delta reads against a stable layout.
 *
 * The reference randomises its edge set per run; the replica fixes a
 * deterministic instance with the same silhouette (19 vertices on a staggered
 * lattice) and derives all colours/numbers from a real BFS over that instance.
 * Written from observation; no reference source code was copied.
 */
export const bfsFrontierManifest: BenchmarkManifest = {
  id: "bfs-frontier",
  title: "BFS expanding frontier (manim-js)",
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
    "An algorithm animated with no voice at all: the pseudocode panel " +
    "narrates, colour encodes persistent state, orange pulses mark the " +
    "current action, and enqueue-order numbers accumulate into a picture " +
    "that proves layer-by-layer traversal.",
  beats: [
    {
      id: "intro-card",
      title: "Full-frame title card",
      refStart: 0.0,
      refEnd: 5.0,
      purpose:
        "A full-frame intertitle names the topic before anything is drawn " +
        "(the no-narration substitute for a spoken opening).",
      visibleObjects: ["intro-title"],
      text: {
        kind: "intertitle",
        note: "Character-by-character write-in of the topic name.",
      },
      camera: { mode: "static" },
    },
    {
      id: "graph-build",
      title: "The graph draws itself in",
      refStart: 5.0,
      refEnd: 12.5,
      purpose:
        "Nodes then edges appear with staggered starts, establishing the " +
        "fixed geometry every later change reads against.",
      visibleObjects: ["graph-nodes", "graph-edges"],
      text: { kind: "none" },
      camera: { mode: "static" },
    },
    {
      id: "pseudocode-writein",
      title: "Pseudocode types itself in",
      refStart: 12.5,
      refEnd: 21.5,
      purpose:
        "The five-line pseudocode panel writes in character by character, " +
        "each line's start delayed proportionally to the previous line's " +
        "length — text length standing in for narration pace.",
      visibleObjects: ["graph-nodes", "graph-edges", "pseudo-title", "pseudo-lines"],
      text: {
        kind: "pseudocode-panel",
        note: "Yellow title, white body, write-in pacing proportional to length.",
      },
      camera: { mode: "static" },
    },
    {
      id: "init-enqueue",
      title: "Enqueue the start vertex",
      refStart: 21.5,
      refEnd: 23.5,
      purpose:
        "The tracer arrow points at the enqueue line while vertex 0 turns " +
        "frontier-yellow and receives its number — panel and canvas mutate " +
        "in the same transition.",
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
        "One micro-step every ~1.73 s: dequeue (orange pulse on the front " +
        "vertex, tracer to the dequeue line) alternating with expansion " +
        "(vertex turns done-green, incident edges flash, neighbours turn " +
        "yellow and are numbered with staggered pops).",
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
    {
      id: "hold-state",
      title: "Hold on the half-traced graph",
      refStart: 38.5,
      refEnd: 40.0,
      purpose:
        "The metronome keeps its cadence; the excerpt ends mid-trace with " +
        "the frontier ring visible.",
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
      id: "intro-title",
      kind: "label",
      description: "Full-frame topic intertitle (write-in).",
      persistsAcross: ["intro-card"],
      maxStepPx: 20,
    },
    {
      id: "graph-nodes",
      kind: "shape",
      description: "The 19 vertex circles (tracked at vertex 9, mid-lattice).",
      persistsAcross: [
        "graph-build",
        "pseudocode-writein",
        "init-enqueue",
        "trace-loop",
        "hold-state",
      ],
      maxStepPx: 4,
    },
    {
      id: "graph-edges",
      kind: "edge",
      description: "The fixed edge set (tracked at one central edge midpoint).",
      persistsAcross: [
        "graph-build",
        "pseudocode-writein",
        "init-enqueue",
        "trace-loop",
        "hold-state",
      ],
      maxStepPx: 4,
    },
    {
      id: "pseudo-title",
      kind: "label",
      description: "Panel title in the accent colour.",
      persistsAcross: ["pseudocode-writein", "init-enqueue", "trace-loop", "hold-state"],
      maxStepPx: 4,
    },
    {
      id: "pseudo-lines",
      kind: "panel",
      description: "The five pseudocode lines (tracked at line one's anchor).",
      persistsAcross: ["pseudocode-writein", "init-enqueue", "trace-loop", "hold-state"],
      maxStepPx: 4,
    },
    {
      id: "tracer",
      kind: "marker",
      description:
        "The arrow that re-points at the active pseudocode line on every " +
        "state transition.",
      persistsAcross: ["init-enqueue", "trace-loop", "hold-state"],
      maxStepPx: 60,
    },
    {
      id: "vertex-0",
      kind: "node",
      description:
        "The start vertex: first to be numbered, first frontier member, " +
        "first done.",
      persistsAcross: ["init-enqueue", "trace-loop", "hold-state"],
      maxStepPx: 4,
    },
    {
      id: "vertex-4",
      kind: "node",
      description:
        "A second-ring vertex whose dequeue pulse falls inside the excerpt.",
      persistsAcross: ["trace-loop", "hold-state"],
      maxStepPx: 4,
    },
  ],
  events: [
    {
      id: "intro-writein-start",
      refTime: 1.0,
      description: "The topic intertitle begins writing in.",
      anchor: "estimated",
    },
    {
      id: "nodes-build-start",
      refTime: 5.0,
      description: "Vertex circles start appearing with staggered onsets.",
      anchor: "estimated",
    },
    {
      id: "edges-build-start",
      refTime: 8.0,
      description: "Edges start growing in between placed vertices.",
      anchor: "estimated",
    },
    {
      id: "pseudo-writein-start",
      refTime: 12.5,
      description: "Panel title begins its write-in.",
      anchor: "estimated",
    },
    {
      id: "enqueue-start-vertex",
      refTime: 21.5,
      description:
        "Tracer appears at the enqueue line; vertex 0 turns yellow and is " +
        "numbered.",
      anchor: "scene-map",
    },
    {
      id: "first-dequeue",
      refTime: 23.5,
      description: "First metronome tick: vertex 0 pulses orange (dequeue).",
      anchor: "scene-map",
    },
    {
      id: "first-expand",
      refTime: 25.2,
      description:
        "Vertex 0 turns green; its neighbours flash their edges, turn " +
        "yellow, and are numbered with staggered pops.",
      anchor: "scene-map",
    },
    {
      id: "metronome-tick-6",
      refTime: 33.9,
      description: "Sixth tick after the first dequeue (uniform 1.73 s cadence).",
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
      note: "Start vertex, top-left of the lattice; never moves.",
    },
    {
      id: "panel-title-pos",
      objectId: "pseudo-title",
      beatId: "pseudocode-writein",
      x: 14,
      y: -212,
      note: "Panel title's LEFT anchor, upper right half of the stage.",
    },
    {
      id: "panel-line1-pos",
      objectId: "pseudo-lines",
      beatId: "pseudocode-writein",
      x: 40,
      y: -175,
      note: "First pseudocode line's LEFT anchor, indented under the title.",
    },
    {
      id: "intro-title-pos",
      objectId: "intro-title",
      beatId: "intro-card",
      x: 0,
      y: 190,
      note: "Intertitle in the lower half of the otherwise empty frame.",
    },
  ],
  invariants: [
    {
      id: "vertex-positions-frozen",
      description:
        "No vertex position ever changes after it is placed — only colours, " +
        "numbers, and transient pulses.",
      beats: ["pseudocode-writein", "init-enqueue", "trace-loop", "hold-state"],
    },
    {
      id: "numbers-match-bfs-order",
      description:
        "Displayed vertex numbers equal the enqueue order of a real BFS over " +
        "the replica's fixed graph instance.",
      beats: ["trace-loop", "hold-state"],
    },
    {
      id: "done-never-regresses",
      description:
        "A vertex that has turned done-green never changes colour again; the " +
        "visited set only grows.",
      beats: ["trace-loop", "hold-state"],
    },
    {
      id: "tracer-agrees-with-state",
      description:
        "Whenever a vertex is being dequeued the tracer points at the " +
        "dequeue line, and during neighbour absorption it points at the " +
        "absorb line — panel and canvas can never desynchronise.",
      beats: ["init-enqueue", "trace-loop"],
    },
  ],
  transitions: [
    {
      refTime: 5.0,
      kind: "cut",
      objects: ["intro-title"],
      note: "Intertitle card ends on a hard cut to the empty stage.",
    },
    {
      refTime: 5.2,
      kind: "grow",
      objects: ["graph-nodes"],
      note: "Staggered grow-in, one onset per vertex.",
    },
    {
      refTime: 8.0,
      kind: "grow",
      objects: ["graph-edges"],
    },
    {
      refTime: 23.5,
      kind: "continuous-morph",
      objects: ["vertex-0", "tracer"],
      note: "State tick: pulse + tracer move fire from one transition.",
    },
  ],
  tolerances: {
    eventTimeSec: 0.6,
    holdSec: 0.8,
    landmarkPx: 24,
    landmarkScaleRatio: 0.15,
    visibleOpacity: 0.05,
  },
  knownDeviations: [
    {
      id: "fixed-graph-instance",
      note:
        "The reference randomises its edge set per run, so the recorded video " +
        "is one sample. The replica fixes a deterministic instance with the " +
        "same vertex lattice; per-vertex colours/numbers therefore differ " +
        "from the recording while obeying the same BFS discipline.",
    },
    {
      id: "intro-card-branding",
      note:
        "The reference intro card carries channel branding (logo, name). The " +
        "replica keeps only the treatment — a full-frame write-in intertitle " +
        "— with neutral text. Branding is deliberately not reproduced.",
    },
    {
      id: "trace-length",
      note:
        "The excerpt cuts the trace mid-run at 40 s; the reference continues " +
        "to ~85 s. The replica holds its final excerpt state.",
    },
  ],
};
