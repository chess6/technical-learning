import type { BenchmarkManifest } from "./types";

/** Twelve-second window measuring a camera reframe around a local proof. */
export const abCameraReframeManifest: BenchmarkManifest = {
  id: "ab-camera-reframe",
  title: "(a,b)-tree camera reframe around a local proof",
  packDir: ".reference-sources/packs/lifFgyB77zc",
  source: {
    repoSlug: "xiaoxiae-videos",
    repoUrl: "https://github.com/xiaoxiae/videos",
    inspectedCommit: "f65794b0dfc81b225364ea776feac8326599cdaa",
    videoId: "lifFgyB77zc",
    videoTitle: "The Most Elegant Search Structure | (a,b)-trees",
    channel: "Tom Slama (Tom S)",
    sceneSources: ["Insertion", "MovingCameraScene"],
    license: "GPL-3.0 (reference-only)",
  },
  pedagogicalPurpose:
    "Measure reframing as part of the argument: the full tree establishes " +
    "context, then the camera isolates the split halves while a local inequality appears.",
  beats: [
    {
      id: "wide-context",
      title: "Whole-tree context",
      refStart: 340.6,
      refEnd: 342.2,
      purpose: "Hold the full structure long enough to locate the proof subject.",
      visibleObjects: ["camera-rig", "proof-halves"],
      text: { kind: "object-label" },
      camera: { mode: "static" },
    },
    {
      id: "camera-reframe",
      title: "Reframe onto the split halves",
      refStart: 342.2,
      refEnd: 343.8,
      purpose: "Move the viewport continuously onto the local argument.",
      visibleObjects: ["camera-rig", "proof-halves"],
      text: { kind: "none" },
      camera: {
        mode: "zoom-in",
        target: { x: 0, y: 0, scale: 1.5 },
        note: "Reference frames centre the selected pair and enlarge it by roughly one half.",
      },
    },
    {
      id: "local-proof",
      title: "Annotate the isolated relation",
      refStart: 343.8,
      refEnd: 352.6,
      purpose:
        "Keep the selected halves framed while the inequality is written beneath them.",
      visibleObjects: ["camera-rig", "proof-halves", "proof-note"],
      text: {
        kind: "temporary-annotation",
        note: "One inequality beside the objects it justifies.",
      },
      camera: {
        mode: "zoom-in",
        target: { x: 0, y: 0, scale: 1.5 },
      },
    },
  ],
  objects: [
    {
      id: "camera-rig",
      kind: "marker",
      description: "Viewport focus and scale probe.",
      persistsAcross: ["wide-context", "camera-reframe", "local-proof"],
      maxStepPx: 20,
    },
    {
      id: "proof-halves",
      kind: "node",
      description: "The pair of nodes isolated by the camera.",
      persistsAcross: ["wide-context", "camera-reframe", "local-proof"],
      maxStepPx: 4,
    },
    {
      id: "proof-note",
      kind: "label",
      description: "Temporary inequality annotation.",
      persistsAcross: ["local-proof"],
      maxStepPx: 4,
    },
  ],
  events: [
    {
      id: "zoom-to-halves",
      refTime: 342.2,
      description: "The camera begins isolating the split halves.",
      anchor: "estimated",
    },
    {
      id: "validity-annotated",
      refTime: 346.6,
      description: "The local inequality appears beneath the selected pair.",
      anchor: "estimated",
    },
  ],
  landmarks: [],
  invariants: [],
  transitions: [
    {
      refTime: 342.2,
      kind: "continuous-morph",
      objects: ["camera-rig", "proof-halves"],
      note: "Viewport movement, not object replacement.",
    },
    {
      refTime: 346.6,
      kind: "grow",
      objects: ["proof-note"],
    },
  ],
  tolerances: {
    eventTimeSec: 0.8,
    holdSec: 1,
    landmarkPx: 30,
    landmarkScaleRatio: 0.2,
    visibleOpacity: 0.05,
  },
  knownDeviations: [
    {
      id: "group-transform-camera",
      classification: "blocked by runtime limitation",
      note:
        "The runtime has no scene camera object; the replica reframes a persistent world group.",
    },
    {
      id: "diagram-simplification",
      classification: "intentionally different for product semantics",
      note:
        "The focused replica keeps only the selected nodes and enough context to measure the treatment.",
    },
  ],
};
