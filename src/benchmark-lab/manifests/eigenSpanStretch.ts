import type { BenchmarkManifest } from "./types";

/**
 * Focused benchmark: one complete "vector remains on its span" transform from
 * 3Blue1Brown's eigenvector chapter (1:57.4-2:09.5). The longer source study
 * remains in the reference pack; this runtime excerpt keeps only the causal
 * sequence needed to test fixed anchors, continuous matrix geometry, and
 * identity through a transform.
 */
export const eigenSpanStretchManifest: BenchmarkManifest = {
  id: "eigen-span-stretch",
  title: "Eigen direction stays on its span (3b1b)",
  packDir: ".reference-sources/packs/PFDu9oVAE-g",
  source: {
    repoSlug: "3b1b-videos",
    repoUrl: "https://github.com/3b1b/videos",
    inspectedCommit: "e317d6c5eaa8370a2deb4d148c246b0d0e9fbe6f",
    videoId: "PFDu9oVAE-g",
    videoTitle: "Eigenvectors and eigenvalues | Chapter 14, Essence of linear algebra",
    channel: "3Blue1Brown",
    sceneSources: ["VectorRemainsOnSpan"],
    license: "CC BY-NC-SA 4.0 (reference-only)",
  },
  pedagogicalPurpose:
    "A fixed span line is drawn before the plane moves; the same vector then " +
    "slides along that line under a continuous transform. This is the smallest " +
    "sequence that tests the benchmark's central geometric claim.",
  beats: [
    {
      id: "stay-on-span",
      title: "A special vector rides its own span",
      refStart: 117.4,
      refEnd: 129.5,
      purpose:
        "Draw the invariant line first, continuously transform the plane and " +
        "vector together, then land back on an inspectable resting frame.",
      visibleObjects: [
        "static-grid",
        "moving-grid",
        "matrix-panel",
        "ihat",
        "jhat",
        "vec-diag",
        "span-diag",
      ],
      text: {
        kind: "object-label",
        note: "Only the pinned matrix with colour-coded columns; no caption.",
      },
      camera: { mode: "static" },
    },
  ],
  objects: [
    {
      id: "static-grid",
      kind: "grid",
      description: "Faint background copy of the plane that never moves.",
      persistsAcross: ["stay-on-span"],
      maxStepPx: 1,
    },
    {
      id: "moving-grid",
      kind: "grid",
      description: "The transforming plane, tracked at its (1,1) lattice point.",
      persistsAcross: ["stay-on-span"],
      maxStepPx: 40,
    },
    {
      id: "matrix-panel",
      kind: "equation",
      description: "Pinned 2x2 matrix with column colours bound to the basis.",
      persistsAcross: ["stay-on-span"],
      maxStepPx: 4,
    },
    {
      id: "ihat",
      kind: "vector",
      description: "First basis vector carried by the same transform.",
      persistsAcross: ["stay-on-span"],
      maxStepPx: 40,
    },
    {
      id: "jhat",
      kind: "vector",
      description: "Second basis vector carried by the same transform.",
      persistsAcross: ["stay-on-span"],
      maxStepPx: 40,
    },
    {
      id: "vec-diag",
      kind: "vector",
      description: "The special vector that stays on the diagonal span.",
      persistsAcross: ["stay-on-span"],
      maxStepPx: 40,
    },
    {
      id: "span-diag",
      kind: "line",
      description: "The diagonal span drawn before motion and held fixed.",
      persistsAcross: ["stay-on-span"],
      maxStepPx: 2,
      fullBleed: true,
    },
  ],
  events: [
    {
      id: "diag-span-drawn",
      refTime: 118.4,
      description: "The vector's span line is drawn before any motion.",
      anchor: "estimated",
    },
    {
      id: "diag-transform-start",
      refTime: 120.6,
      description: "The plane starts transforming; the vector slides along its span.",
      anchor: "transcript",
    },
  ],
  landmarks: [
    {
      id: "matrix-pinned",
      objectId: "matrix-panel",
      beatId: "stay-on-span",
      x: -90,
      y: -195,
      note: "Matrix remains pinned above-left of the origin.",
    },
  ],
  invariants: [
    {
      id: "eigen-directions-match-math",
      description: "The drawn diagonal is a true eigen direction of the matrix.",
      beats: [],
    },
    {
      id: "span-lines-static-during-transform",
      description: "The span anchor does not move while the plane transforms.",
      beats: ["stay-on-span"],
    },
    {
      id: "eigenvectors-stay-on-span",
      description: "The tracked vector tip stays on its span at every sampled frame.",
      beats: ["stay-on-span"],
    },
    {
      id: "tips-match-matrix",
      description: "The tracked tip reaches the shared-math image of its vector.",
      beats: ["stay-on-span"],
    },
  ],
  transitions: [
    {
      refTime: 120.6,
      kind: "continuous-morph",
      objects: ["moving-grid", "vec-diag", "ihat", "jhat"],
      note: "Grid and vectors morph together; no opacity replacement.",
    },
    {
      refTime: 127.5,
      kind: "cut",
      objects: ["moving-grid", "vec-diag"],
      note: "The reference resets to the resting state near the end of the beat.",
    },
  ],
  tolerances: {
    eventTimeSec: 0.5,
    holdSec: 0.75,
    landmarkPx: 24,
    landmarkScaleRatio: 0.15,
    visibleOpacity: 0.05,
  },
  knownDeviations: [
    {
      id: "grid-unit",
      note:
        "Reference uses about 65 px per unit at equivalent framing; the replica " +
        "uses the repo-wide 64 px scale.",
    },
    {
      id: "font",
      note: "Reference uses LaTeX serif type; the replica uses the repo sans stack.",
    },
  ],
};
