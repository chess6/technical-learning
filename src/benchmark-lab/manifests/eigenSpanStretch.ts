import type { BenchmarkManifest } from "./types";

/**
 * Benchmark: "special vectors stay on their span" (3b1b, Essence of Linear
 * Algebra ch. 14, PFDu9oVAE-g, 1:57.4-3:22.5).
 *
 * Chosen from the 3b1b pack to test: a continuous geometric transformation of
 * the whole plane, span lines drawn BEFORE the transform and held static while
 * vectors slide along them, a pinned matrix whose columns stay color-bound to
 * the basis vectors, gradient vector fans that read as one family, coordinate
 * labels that ride a vector's tip as the receipt of its identity, and a text
 * treatment with NO titles or captions — only object labels and two late
 * temporary annotations.
 *
 * All timing anchors below come from the pack's transcript segments and
 * scene-map (committed, paraphrased); positions were observed off the locally
 * extracted reference frames. Written entirely from observation — no source
 * code from the reference repository was consulted for the reconstruction.
 */
export const eigenSpanStretchManifest: BenchmarkManifest = {
  id: "eigen-span-stretch",
  title: "Eigen directions stay on their span (3b1b)",
  packDir: ".reference-sources/packs/PFDu9oVAE-g",
  source: {
    repoSlug: "3b1b-videos",
    repoUrl: "https://github.com/3b1b/videos",
    inspectedCommit: "e317d6c5eaa8370a2deb4d148c246b0d0e9fbe6f",
    videoId: "PFDu9oVAE-g",
    videoTitle: "Eigenvectors and eigenvalues | Chapter 14, Essence of linear algebra",
    channel: "3Blue1Brown",
    sceneSources: [
      "VectorRemainsOnSpan",
      "IHatAsEigenVector",
      "AllXAxisVectorsAreEigenvectors",
      "SneakierEigenVector",
      "FullSneakyEigenspace",
    ],
    license: "CC BY-NC-SA 4.0 (reference-only)",
  },
  pedagogicalPurpose:
    "The eigenvector definition is carried entirely by geometry: a fixed span " +
    "line plus a vector that slides along it under the transform. The excerpt " +
    "escalates one vector -> the basis vector -> the whole family, then closes " +
    "with the counterexample that defines the boundary of the concept.",
  beats: [
    {
      id: "stay-on-span",
      title: "A special vector rides its own span",
      refStart: 117.4,
      refEnd: 129.5,
      purpose:
        "Plant the definition: the span line is drawn first and stays fixed; " +
        "the transform stretches the vector along it like a scalar.",
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
        note: "Only the pinned matrix with color-coded columns; no captions.",
      },
      camera: { mode: "static" },
    },
    {
      id: "ihat-stretch",
      title: "i-hat is such a vector: column one says x3",
      refStart: 129.5,
      refEnd: 146.3,
      purpose:
        "Bind the algebra to the geometry: the first matrix column is read " +
        "off while i-hat stretches to three times itself along the x-axis.",
      visibleObjects: [
        "static-grid",
        "moving-grid",
        "matrix-panel",
        "ihat",
        "jhat",
        "span-x",
      ],
      text: {
        kind: "object-label",
        note: "Matrix column one emphasised while i-hat moves; still no captions.",
      },
      camera: { mode: "static" },
    },
    {
      id: "xaxis-family",
      title: "Every x-axis vector stretches by three",
      refStart: 146.3,
      refEnd: 158.5,
      purpose:
        "Linearity promotes one eigenvector to a family: a gradient fan of " +
        "arrows along the x-axis all stretch together.",
      visibleObjects: [
        "static-grid",
        "moving-grid",
        "matrix-panel",
        "jhat",
        "fan-x",
        "span-x",
      ],
      text: { kind: "object-label" },
      camera: { mode: "static" },
    },
    {
      id: "sneaky-vector",
      title: "The sneakier eigenvector (-1, 1) stretches by two",
      refStart: 158.5,
      refEnd: 169.0,
      purpose:
        "A second, non-obvious eigen direction; the coordinate label rides the " +
        "tip and gains a '2x' prefix as the receipt that it is the same vector.",
      visibleObjects: [
        "static-grid",
        "moving-grid",
        "matrix-panel",
        "ihat",
        "jhat",
        "vec-sneaky",
        "span-diag",
        "label-sneaky",
      ],
      text: {
        kind: "object-label",
        note: "Boxed coordinate label at the tip; a scale prefix fades in at the stretched tip.",
      },
      camera: { mode: "static" },
    },
    {
      id: "diagonal-family",
      title: "The whole diagonal family stretches by two",
      refStart: 169.0,
      refEnd: 179.8,
      purpose:
        "Same promotion for the diagonal direction: a gradient fan on the " +
        "span line all stretch by two.",
      visibleObjects: [
        "static-grid",
        "moving-grid",
        "matrix-panel",
        "jhat",
        "fan-diag",
        "span-diag",
      ],
      text: { kind: "object-label" },
      camera: { mode: "static" },
    },
    {
      id: "recap-both-fans",
      title: "Both eigen families, annotated",
      refStart: 179.8,
      refEnd: 192.8,
      purpose:
        "Hold both families on the resting grid and let two short annotations " +
        "name the stretch factors; the matrix panel retires.",
      visibleObjects: [
        "static-grid",
        "moving-grid",
        "fan-x",
        "fan-diag",
        "text-stretch3",
        "text-stretch2",
      ],
      text: {
        kind: "temporary-annotation",
        note: "Two annotations placed along the families they describe.",
      },
      camera: { mode: "static" },
    },
    {
      id: "knocked-off",
      title: "Any other vector is knocked off its span",
      refStart: 192.8,
      refEnd: 202.5,
      purpose:
        "The counterexample: a distinctly-coloured vector on a faded span " +
        "line visibly rotates off it under the same transform.",
      visibleObjects: [
        "static-grid",
        "moving-grid",
        "fan-x",
        "fan-diag",
        "text-stretch3",
        "text-stretch2",
        "vec-knocked",
        "span-knocked",
        "label-knocked",
      ],
      text: {
        kind: "temporary-annotation",
        note: "One annotation beside the counterexample vector.",
      },
      camera: { mode: "static" },
    },
  ],
  objects: [
    {
      id: "static-grid",
      kind: "grid",
      description: "Faint background copy of the plane that never moves.",
      persistsAcross: [
        "stay-on-span",
        "ihat-stretch",
        "xaxis-family",
        "sneaky-vector",
        "diagonal-family",
        "recap-both-fans",
        "knocked-off",
      ],
      maxStepPx: 1,
    },
    {
      id: "moving-grid",
      kind: "grid",
      description: "The transforming plane (tracked at its (1,1) lattice point).",
      persistsAcross: [
        "stay-on-span",
        "ihat-stretch",
        "xaxis-family",
        "sneaky-vector",
        "diagonal-family",
        "recap-both-fans",
        "knocked-off",
      ],
      maxStepPx: 40,
    },
    {
      id: "matrix-panel",
      kind: "equation",
      description: "The pinned 2x2 matrix with column colours matching the basis.",
      persistsAcross: [
        "stay-on-span",
        "ihat-stretch",
        "xaxis-family",
        "sneaky-vector",
        "diagonal-family",
      ],
      maxStepPx: 4,
    },
    {
      id: "ihat",
      kind: "vector",
      description: "First basis vector; stretches to (3,0) in its beat.",
      persistsAcross: ["stay-on-span", "ihat-stretch", "sneaky-vector"],
      maxStepPx: 40,
    },
    {
      id: "jhat",
      kind: "vector",
      description: "Second basis vector; carried to (1,2) by the transform.",
      persistsAcross: [
        "stay-on-span",
        "ihat-stretch",
        "xaxis-family",
        "sneaky-vector",
        "diagonal-family",
      ],
      maxStepPx: 40,
    },
    {
      id: "vec-diag",
      kind: "vector",
      description: "Opening special vector on the diagonal span (points to (1,-1)).",
      persistsAcross: ["stay-on-span"],
      maxStepPx: 40,
    },
    {
      id: "span-diag",
      kind: "line",
      description:
        "The diagonal span line through (-1,1)/(1,-1); drawn before any " +
        "transform and shared by the opening vector and the sneaky vector.",
      persistsAcross: ["stay-on-span", "sneaky-vector", "diagonal-family"],
      maxStepPx: 2,
      fullBleed: true,
    },
    {
      id: "span-x",
      kind: "line",
      description: "The x-axis span line highlighted while i-hat stretches.",
      persistsAcross: ["ihat-stretch", "xaxis-family"],
      maxStepPx: 2,
      fullBleed: true,
    },
    {
      id: "fan-x",
      kind: "shape",
      description: "Gradient fan of arrows along the x-axis (tracked at +2 units).",
      persistsAcross: ["xaxis-family", "recap-both-fans", "knocked-off"],
      maxStepPx: 40,
    },
    {
      id: "fan-diag",
      kind: "shape",
      description: "Gradient fan of arrows along the diagonal (tracked at (-1,1)).",
      persistsAcross: ["diagonal-family", "recap-both-fans", "knocked-off"],
      maxStepPx: 40,
    },
    {
      id: "vec-sneaky",
      kind: "vector",
      description: "The sneaky eigenvector pointing to (-1,1); stretches by two.",
      persistsAcross: ["sneaky-vector"],
      maxStepPx: 40,
    },
    {
      id: "label-sneaky",
      kind: "label",
      description: "Boxed coordinate label riding the sneaky vector's tip.",
      persistsAcross: ["sneaky-vector"],
      maxStepPx: 40,
    },
    {
      id: "text-stretch3",
      kind: "label",
      description: "Annotation naming the x-family stretch factor.",
      persistsAcross: ["recap-both-fans", "knocked-off"],
      maxStepPx: 4,
    },
    {
      id: "text-stretch2",
      kind: "label",
      description: "Annotation naming the diagonal-family stretch factor.",
      persistsAcross: ["recap-both-fans", "knocked-off"],
      maxStepPx: 4,
    },
    {
      id: "vec-knocked",
      kind: "vector",
      description: "Counterexample vector on the y=x diagonal, knocked off its span.",
      persistsAcross: ["knocked-off"],
      maxStepPx: 40,
    },
    {
      id: "span-knocked",
      kind: "line",
      description: "Faded span line of the counterexample vector; never moves.",
      persistsAcross: ["knocked-off"],
      maxStepPx: 2,
      fullBleed: true,
    },
    {
      id: "label-knocked",
      kind: "label",
      description: "Annotation beside the counterexample.",
      persistsAcross: ["knocked-off"],
      maxStepPx: 4,
    },
  ],
  events: [
    {
      id: "diag-span-drawn",
      refTime: 118.4,
      description: "The opening vector's span line is drawn before any motion.",
      anchor: "estimated",
    },
    {
      id: "diag-transform-start",
      refTime: 120.6,
      description: "The plane starts transforming; the vector stretches along its span.",
      anchor: "transcript",
    },
    {
      id: "ihat-focus",
      refTime: 129.5,
      description: "Attention moves to i-hat as the next special vector.",
      anchor: "transcript",
    },
    {
      id: "column-one-read",
      refTime: 134.6,
      description: "The first matrix column is emphasised and read as i-hat's image.",
      anchor: "transcript",
    },
    {
      id: "ihat-transform-start",
      refTime: 139.3,
      description: "i-hat stretches to three times itself along the x-axis.",
      anchor: "transcript",
    },
    {
      id: "xfan-in",
      refTime: 147.0,
      description: "The x-axis family of arrows fades in on the resting grid.",
      anchor: "estimated",
    },
    {
      id: "xfan-stretch-start",
      refTime: 150.0,
      description: "The whole x-axis family stretches by three.",
      anchor: "transcript",
    },
    {
      id: "sneaky-in",
      refTime: 158.5,
      description: "The sneaky vector and its boxed coordinate label appear.",
      anchor: "transcript",
    },
    {
      id: "sneaky-transform-start",
      refTime: 164.7,
      description: "The sneaky vector stretches by two; the label rides its tip.",
      anchor: "transcript",
    },
    {
      id: "diagfan-in",
      refTime: 169.0,
      description: "The diagonal family fades in on the span line.",
      anchor: "transcript",
    },
    {
      id: "diagfan-stretch-start",
      refTime: 173.6,
      description: "The diagonal family stretches by two.",
      anchor: "transcript",
    },
    {
      id: "stretch3-annotation",
      refTime: 185.6,
      description: "Annotation names the x-family factor.",
      anchor: "transcript",
    },
    {
      id: "stretch2-annotation",
      refTime: 188.6,
      description: "Annotation names the diagonal-family factor.",
      anchor: "transcript",
    },
    {
      id: "knocked-in",
      refTime: 192.8,
      description: "The counterexample vector and its faded span appear.",
      anchor: "transcript",
    },
    {
      id: "knocked-transform-start",
      refTime: 196.4,
      description: "The transform knocks the counterexample off its span.",
      anchor: "transcript",
    },
  ],
  landmarks: [
    {
      id: "matrix-pinned",
      objectId: "matrix-panel",
      beatId: "ihat-stretch",
      x: -90,
      y: -195,
      note: "Matrix sits above-left of the origin, clear of the geometry.",
    },
    {
      id: "ihat-stretched-tip",
      objectId: "ihat",
      beatId: "ihat-stretch",
      x: 192,
      y: 0,
      note: "Three units along the x-axis at 64 px/unit.",
    },
    {
      id: "sneaky-stretched-tip",
      objectId: "vec-sneaky",
      beatId: "sneaky-vector",
      x: -128,
      y: -128,
      note: "Tip lands on 2*(-1,1) = (-2,2).",
    },
    {
      id: "stretch3-annotation-pos",
      objectId: "text-stretch3",
      beatId: "recap-both-fans",
      x: -180,
      y: 40,
      note: "Annotation sits just below the x-axis family, left of centre.",
    },
  ],
  invariants: [
    {
      id: "eigen-directions-match-math",
      description:
        "The two span lines drawn are exactly the eigen directions of the " +
        "example matrix as computed by the shared math (x-axis for 3, " +
        "(-1,1) for 2).",
      beats: [],
    },
    {
      id: "span-lines-static-during-transform",
      description:
        "While the grid transform progresses, span-line endpoints never move.",
      beats: ["stay-on-span", "ihat-stretch", "sneaky-vector", "diagonal-family"],
    },
    {
      id: "eigenvectors-stay-on-span",
      description:
        "At every sampled frame, tracked eigenvector tips lie on their span " +
        "line (no arcing off the line mid-tween).",
      beats: ["stay-on-span", "ihat-stretch", "sneaky-vector", "diagonal-family"],
    },
    {
      id: "tips-match-matrix",
      description:
        "At beat ends, tracked vector tips equal the shared-math product of " +
        "the current matrix and the vector's original coordinates.",
      beats: ["stay-on-span", "ihat-stretch", "sneaky-vector", "knocked-off"],
    },
    {
      id: "label-scale-prefix-truthful",
      description:
        "The '2x' prefix on the riding label is only visible once the tip is " +
        "at least 1.5x its original distance from the origin (value shown " +
        "matches geometry).",
      beats: ["sneaky-vector"],
    },
  ],
  transitions: [
    {
      refTime: 120.6,
      kind: "continuous-morph",
      objects: ["moving-grid", "vec-diag", "ihat", "jhat"],
      note: "First transform: grid and vectors morph together; nothing cuts.",
    },
    {
      refTime: 127.5,
      kind: "cut",
      objects: ["moving-grid", "vec-diag"],
      note:
        "Reference resets to the identity between sub-scenes with a hard cut; " +
        "the replica keeps the cut (intentional, matched).",
    },
    {
      refTime: 139.3,
      kind: "continuous-morph",
      objects: ["moving-grid", "ihat", "jhat"],
    },
    {
      refTime: 146.3,
      kind: "cut",
      objects: ["moving-grid"],
      note: "Sub-scene reset to the identity before the family beat.",
    },
    {
      refTime: 150.0,
      kind: "continuous-morph",
      objects: ["moving-grid", "fan-x"],
    },
    {
      refTime: 158.5,
      kind: "cut",
      objects: ["moving-grid"],
      note: "Reset to the identity before the sneaky-vector beat.",
    },
    {
      refTime: 164.7,
      kind: "continuous-morph",
      objects: ["moving-grid", "vec-sneaky", "label-sneaky"],
    },
    {
      refTime: 169.0,
      kind: "cut",
      objects: ["moving-grid"],
      note: "Reset before the diagonal-family beat.",
    },
    {
      refTime: 173.6,
      kind: "continuous-morph",
      objects: ["moving-grid", "fan-diag"],
    },
    {
      refTime: 179.8,
      kind: "cut",
      objects: ["moving-grid", "fan-x", "fan-diag"],
      note: "Reset to the resting grid with both families for the recap.",
    },
    {
      refTime: 196.4,
      kind: "continuous-morph",
      objects: ["moving-grid", "vec-knocked"],
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
        "Reference uses ~65 px per unit at 1080p-equivalent framing; the " +
        "replica uses the repo-wide 64 px SCALE. Landmark tolerance absorbs it.",
    },
    {
      id: "matrix-position-constant",
      note:
        "The reference re-pins the matrix at slightly different x positions " +
        "per scene class (it is rebuilt between scenes). The replica keeps ONE " +
        "pinned position for the whole excerpt - deliberate, since persistent " +
        "identity is the pattern under study.",
    },
    {
      id: "font",
      note:
        "Reference typography is LaTeX serif; replica uses the repo's " +
        "sans-serif stack. Text is compared by placement and timing, not face.",
    },
    {
      id: "fan-density",
      note:
        "The reference fan has an arrow every half unit with per-arrow " +
        "gradient colouring; the replica draws one arrow per unit. Family-" +
        "reading is preserved; density is a craft difference, recorded.",
    },
  ],
};
