import type { BenchmarkManifest } from "./types";

/**
 * Focused benchmark: the actual overfull-node repair from the (a,b)-tree
 * reference (5:10.6-5:17.9). The 11.6-second prediction pause and later
 * lecture holds stay documented in the reference pack, but are not rendered
 * on every laboratory run.
 */
export const abSplitManifest: BenchmarkManifest = {
  id: "ab-split",
  title: "(a,b)-tree middle-key split (Tom Slama)",
  packDir: ".reference-sources/packs/lifFgyB77zc",
  source: {
    repoSlug: "xiaoxiae-videos",
    repoUrl: "https://github.com/xiaoxiae/videos",
    inspectedCommit: "f65794b0dfc81b225364ea776feac8326599cdaa",
    videoId: "lifFgyB77zc",
    videoTitle: "The Most Elegant Search Structure | (a,b)-trees",
    channel: "Tom Slama (Tom S)",
    sceneSources: ["Insertion", "ABTree.bubble_insert", "create_node"],
    license: "GPL-3.0 (reference-only)",
  },
  pedagogicalPurpose:
    "Structural repair is shown as motion of persistent key tokens: an " +
    "overfull border separates and the middle key physically rises into its " +
    "parent while the leaf row remains pinned.",
  beats: [
    {
      id: "split-rise",
      title: "Split: the middle key rises",
      refStart: 310.6,
      refEnd: 317.9,
      purpose:
        "Retire the prediction overlay, pull the overfull border into two legal " +
        "nodes, and carry the same middle-key token into the parent.",
      visibleObjects: [
        "title",
        "root-node",
        "node-0",
        "node-2",
        "key-4",
        "key-5",
        "key-67",
        "leaf-row",
      ],
      text: {
        kind: "object-label",
        note: "Only key numerals and the persistent section title.",
      },
      camera: { mode: "static" },
    },
  ],
  objects: [
    {
      id: "title",
      kind: "label",
      description: "Persistent underlined section title.",
      persistsAcross: ["split-rise"],
      maxStepPx: 4,
    },
    {
      id: "root-node",
      kind: "node",
      description: "Original root, tracked at persistent key 1 while it widens.",
      persistsAcross: ["split-rise"],
      maxStepPx: 40,
    },
    {
      id: "node-0",
      kind: "node",
      description: "Unchanged leaf-parent holding key 0.",
      persistsAcross: ["split-rise"],
      maxStepPx: 12,
    },
    {
      id: "node-2",
      kind: "node",
      description: "Unchanged leaf-parent holding key 2.",
      persistsAcross: ["split-rise"],
      maxStepPx: 12,
    },
    {
      id: "key-4",
      kind: "token",
      description: "Persistent key 4 carried into the left split half.",
      persistsAcross: ["split-rise"],
      maxStepPx: 40,
    },
    {
      id: "key-5",
      kind: "token",
      description: "Persistent middle key that rises into the root.",
      persistsAcross: ["split-rise"],
      maxStepPx: 40,
    },
    {
      id: "key-67",
      kind: "token",
      description: "Persistent key 7, with key 6 beside it, carried right.",
      persistsAcross: ["split-rise"],
      maxStepPx: 40,
    },
    {
      id: "leaf-row",
      kind: "marker",
      description: "Leftmost square in the leaf row, which remains at one height.",
      persistsAcross: ["split-rise"],
      maxStepPx: 8,
    },
  ],
  events: [
    {
      id: "split-starts",
      refTime: 312.6,
      description: "The overfull border pulls apart into two half-borders.",
      anchor: "transcript",
    },
    {
      id: "middle-key-rises",
      refTime: 314.0,
      description: "Key 5 travels upward into its slot in the root.",
      anchor: "estimated",
    },
  ],
  landmarks: [
    {
      id: "root-after-split",
      objectId: "root-node",
      beatId: "split-rise",
      x: -50,
      y: -8,
      note: "Reference-observed key-1 slot after the root widens.",
      evidence: {
        kind: "reference-frame",
        refTime: 317.9,
        note: "Measured from the landed reference keyframe, not the replica layout.",
      },
    },
  ],
  invariants: [
    {
      id: "keys-sorted-left-to-right",
      description: "At the landed frame, key tokens read in ascending order.",
      beats: [],
    },
    {
      id: "leaf-row-height-constant",
      description: "The leaf row never changes height during the repair.",
      beats: ["split-rise"],
    },
    {
      id: "keys-persist-through-split",
      description: "No key token fades during the structural change.",
      beats: ["split-rise"],
    },
    {
      id: "violation-colour-reserved",
      description: "Red is reserved for the violation and retires when repaired.",
      beats: ["split-rise"],
    },
  ],
  transitions: [
    {
      refTime: 312.6,
      kind: "grow",
      objects: ["key-4", "key-67"],
      note: "The disposable border separates while persistent keys ride with it.",
    },
    {
      refTime: 314.0,
      kind: "travel",
      objects: ["key-5", "root-node"],
      note: "The middle key rises; neighbours make room in the same parent.",
    },
  ],
  tolerances: {
    eventTimeSec: 0.75,
    holdSec: 1.0,
    landmarkPx: 26,
    landmarkScaleRatio: 0.2,
    visibleOpacity: 0.05,
  },
  knownDeviations: [
    {
      id: "layout-algorithm",
      classification: "measured finding",
      note:
        "Reference uses a hand-tuned parent-placement rule; the replica computes " +
        "layout deterministically upward from the pinned leaf row.",
    },
    {
      id: "typography",
      classification: "intentionally different for product semantics",
      note: "Reference uses serif LaTeX keys; the replica uses the repo sans stack.",
    },
  ],
};
