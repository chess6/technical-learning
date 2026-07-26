import type { BenchmarkManifest } from "./types";

/**
 * Fifteen-second window spanning the landed prediction overlay and the first
 * structural reveal. The prompt is shortened from the full source pause by
 * starting after its establishing seconds, while preserving its frozen state.
 */
export const abPredictionRevealManifest: BenchmarkManifest = {
  id: "ab-prediction-reveal",
  title: "(a,b)-tree prediction → structural reveal",
  packDir: ".reference-sources/packs/lifFgyB77zc",
  source: {
    repoSlug: "xiaoxiae-videos",
    repoUrl: "https://github.com/xiaoxiae/videos",
    inspectedCommit: "f65794b0dfc81b225364ea776feac8326599cdaa",
    videoId: "lifFgyB77zc",
    videoTitle: "The Most Elegant Search Structure | (a,b)-trees",
    channel: "Tom Slama (Tom S)",
    sceneSources: ["TransparentPause", "Insertion", "ABTree.bubble_insert"],
    license: "GPL-3.0 (reference-only)",
  },
  pedagogicalPurpose:
    "Measure a full-frame prediction treatment over frozen mathematical state, " +
    "followed immediately by a reveal enacted on the same persistent key tokens.",
  beats: [
    {
      id: "pause-prompt",
      title: "Predict the repair",
      refStart: 302.9,
      refEnd: 310.6,
      purpose:
        "Freeze the overfull tree under a screen-wide pause treatment so the repair can be predicted.",
      visibleObjects: [
        "title",
        "root-node",
        "node-0",
        "node-2",
        "node-4567",
        "leaf-row",
        "pause-overlay",
      ],
      text: {
        kind: "intertitle",
        note: "A screen-fixed pause layer over the frozen violating state.",
      },
      camera: { mode: "static" },
    },
    {
      id: "split-rise",
      title: "Reveal: the middle key rises",
      refStart: 310.6,
      refEnd: 317.9,
      purpose:
        "Retire the overlay, split the overfull node, and carry the same middle key into the parent.",
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
      text: { kind: "object-label" },
      camera: { mode: "static" },
    },
  ],
  objects: [
    {
      id: "title",
      kind: "label",
      description: "Persistent section title.",
      persistsAcross: ["pause-prompt", "split-rise"],
      maxStepPx: 4,
    },
    {
      id: "pause-overlay",
      kind: "panel",
      description: "Screen-fixed prediction/pause treatment.",
      persistsAcross: ["pause-prompt"],
      maxStepPx: 60,
      fullBleed: true,
    },
    {
      id: "root-node",
      kind: "node",
      description: "Persistent parent that receives the middle key.",
      persistsAcross: ["pause-prompt", "split-rise"],
      maxStepPx: 40,
    },
    {
      id: "node-0",
      kind: "node",
      description: "Unchanged left node.",
      persistsAcross: ["pause-prompt", "split-rise"],
      maxStepPx: 12,
    },
    {
      id: "node-2",
      kind: "node",
      description: "Unchanged middle node.",
      persistsAcross: ["pause-prompt", "split-rise"],
      maxStepPx: 12,
    },
    {
      id: "node-4567",
      kind: "node",
      description: "Overfull node held frozen during prediction.",
      persistsAcross: ["pause-prompt"],
      maxStepPx: 12,
    },
    {
      id: "key-4",
      kind: "token",
      description: "Persistent left split key.",
      persistsAcross: ["split-rise"],
      maxStepPx: 40,
    },
    {
      id: "key-5",
      kind: "token",
      description: "Persistent middle key that rises.",
      persistsAcross: ["split-rise"],
      maxStepPx: 40,
    },
    {
      id: "key-67",
      kind: "token",
      description: "Persistent right split keys, anchored on key 7.",
      persistsAcross: ["split-rise"],
      maxStepPx: 40,
    },
    {
      id: "leaf-row",
      kind: "marker",
      description: "Pinned same-depth leaf row.",
      persistsAcross: ["pause-prompt", "split-rise"],
      maxStepPx: 8,
    },
  ],
  events: [
    {
      id: "pause-begins",
      refTime: 303.6,
      description: "The pause treatment is fully established.",
      anchor: "estimated",
    },
    {
      id: "split-starts",
      refTime: 312.6,
      description: "The overfull border pulls into two halves.",
      anchor: "transcript",
    },
    {
      id: "middle-key-rises",
      refTime: 314,
      description: "The middle key starts travelling into its parent.",
      anchor: "estimated",
    },
  ],
  landmarks: [],
  invariants: [
    {
      id: "keys-sorted-left-to-right",
      description: "Persistent key tokens remain sorted at each rest state.",
      beats: [],
    },
    {
      id: "leaf-row-height-constant",
      description: "The leaf row remains at one height through the reveal.",
      beats: ["pause-prompt", "split-rise"],
    },
    {
      id: "keys-persist-through-split",
      description: "The reveal moves key tokens rather than replacing them.",
      beats: ["split-rise"],
    },
  ],
  transitions: [
    {
      refTime: 310.6,
      kind: "fade",
      objects: ["pause-overlay"],
    },
    {
      refTime: 312.6,
      kind: "grow",
      objects: ["key-4", "key-67"],
    },
    {
      refTime: 314,
      kind: "travel",
      objects: ["key-5", "root-node"],
    },
  ],
  tolerances: {
    eventTimeSec: 0.75,
    holdSec: 1,
    landmarkPx: 28,
    landmarkScaleRatio: 0.2,
    visibleOpacity: 0.05,
  },
  knownDeviations: [
    {
      id: "layout-algorithm",
      classification: "measured finding",
      note:
        "The deterministic product layout centres parents differently from the hand-tuned reference layout.",
    },
    {
      id: "typography",
      classification: "intentionally different for product semantics",
      note: "The replica uses the product sans stack rather than reference LaTeX.",
    },
  ],
};
