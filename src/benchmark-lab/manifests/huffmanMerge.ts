import type { BenchmarkManifest } from "./types";

/**
 * Benchmark: the Huffman tree build choreography (Reducible, B3y0RsVCyrw,
 * 24:10-24:57).
 *
 * Chosen from the Reducible pack to test: algorithm/tree-state choreography
 * with persistent objects across structural changes — leaves that physically
 * TRAVEL from a sorted frontier column into their final tree slots, parents
 * born at the merge (never morphed from children), and the double-identity
 * trick where each internal node exists once fixed in the tree and once as a
 * queue token that later fades into its already-placed original. Text is
 * object labels and value readouts only; no titles or captions; camera fixed.
 *
 * Distribution observed off the reference frames: D=0.15, E=0.16, A=0.17,
 * C=0.17, B=0.35. Merge order: (D,E)->0.31, (A,C)->0.34, (0.34,0.31)->0.65.
 * Written from observation; no reference source code consulted.
 */
export const huffmanMergeManifest: BenchmarkManifest = {
  id: "huffman-merge",
  title: "Huffman merge choreography (Reducible)",
  packDir: ".reference-sources/packs/B3y0RsVCyrw",
  source: {
    repoSlug: "reducible",
    repoUrl: "https://github.com/nipunramk/Reducible",
    inspectedCommit: "88f4f8f7da11443b4e995bf0c71683c55e2cf17b",
    videoId: "B3y0RsVCyrw",
    videoTitle: "Huffman Codes: An Information Theory Perspective",
    channel: "Reducible",
    sceneSources: [
      "HuffmanCodesProbDist",
      "make_huffman_tree",
      "animate_huffman_step",
      "transform_heap",
    ],
    license: "none declared (reference-only)",
  },
  pedagogicalPurpose:
    "The greedy invariant is a PLACE on screen: a column that is visibly kept " +
    "sorted. Each merge consumes the two lowest tokens, grows a parent at the " +
    "merge point, and posts the parent back into the column — so the recursion " +
    "is watched, not asserted.",
  beats: [
    {
      id: "frontier",
      title: "The sorted frontier",
      refStart: 1450.0,
      refEnd: 1454.7,
      purpose:
        "Establish the sorted probability column that every later step reads from.",
      visibleObjects: [
        "leaf-D",
        "leaf-E",
        "leaf-A",
        "leaf-C",
        "leaf-B",
      ],
      text: {
        kind: "value-readout",
        note: "Each leaf carries its symbol and probability; nothing else on screen.",
      },
      camera: { mode: "static" },
    },
    {
      id: "merge-DE",
      title: "Merge the two least likely: D and E",
      refStart: 1454.7,
      refEnd: 1462.5,
      purpose:
        "First merge: the two lowest leaves travel to tree slots, a parent is " +
        "born displaying their sum, and its token re-enters the sorted column.",
      visibleObjects: [
        "leaf-D",
        "leaf-E",
        "leaf-A",
        "leaf-C",
        "leaf-B",
        "parent-DE",
        "edge-DE-left",
        "edge-DE-right",
        "token-DE",
      ],
      text: { kind: "value-readout" },
      camera: { mode: "static" },
    },
    {
      id: "note-recursion",
      title: "The same problem, one symbol smaller",
      refStart: 1462.5,
      refEnd: 1471.8,
      purpose:
        "Hold: the new token sits in sorted position; narration recasts the " +
        "state as the same problem on a smaller set.",
      visibleObjects: [
        "leaf-D",
        "leaf-E",
        "leaf-A",
        "leaf-C",
        "leaf-B",
        "parent-DE",
        "edge-DE-left",
        "edge-DE-right",
        "token-DE",
      ],
      text: { kind: "value-readout" },
      camera: { mode: "static" },
    },
    {
      id: "merge-AC",
      title: "Merge A and C",
      refStart: 1471.8,
      refEnd: 1481.7,
      purpose:
        "Second merge, identical choreography — the repetition IS the algorithm.",
      visibleObjects: [
        "leaf-D",
        "leaf-E",
        "leaf-A",
        "leaf-C",
        "leaf-B",
        "parent-DE",
        "parent-AC",
        "edge-DE-left",
        "edge-DE-right",
        "edge-AC-left",
        "edge-AC-right",
        "token-DE",
        "token-AC",
      ],
      text: { kind: "value-readout" },
      camera: { mode: "static" },
    },
    {
      id: "merge-internal",
      title: "The two lowest are now internal nodes",
      refStart: 1481.7,
      refEnd: 1494.7,
      purpose:
        "The queue tokens are consumed: they travel onto their already-placed " +
        "tree originals and fade, while a grandparent is born above both subtrees.",
      visibleObjects: [
        "leaf-D",
        "leaf-E",
        "leaf-A",
        "leaf-C",
        "leaf-B",
        "parent-DE",
        "parent-AC",
        "root-065",
        "edge-DE-left",
        "edge-DE-right",
        "edge-AC-left",
        "edge-AC-right",
        "edge-065-left",
        "edge-065-right",
      ],
      text: { kind: "value-readout" },
      camera: { mode: "static" },
    },
    {
      id: "hold-two-left",
      title: "Two elements remain",
      refStart: 1494.7,
      refEnd: 1497.0,
      purpose: "Hold on the state that sets up the final merge (outside this excerpt).",
      visibleObjects: [
        "leaf-D",
        "leaf-E",
        "leaf-A",
        "leaf-C",
        "leaf-B",
        "parent-DE",
        "parent-AC",
        "root-065",
        "edge-DE-left",
        "edge-DE-right",
        "edge-AC-left",
        "edge-AC-right",
        "edge-065-left",
        "edge-065-right",
      ],
      text: { kind: "value-readout" },
      camera: { mode: "static" },
    },
  ],
  objects: [
    {
      id: "leaf-D",
      kind: "token",
      description: "Leaf D (0.15): probability box over symbol box; travels column -> tree.",
      persistsAcross: ["frontier", "merge-DE", "note-recursion", "merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 40,
    },
    {
      id: "leaf-E",
      kind: "token",
      description: "Leaf E (0.16).",
      persistsAcross: ["frontier", "merge-DE", "note-recursion", "merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 40,
    },
    {
      id: "leaf-A",
      kind: "token",
      description: "Leaf A (0.17).",
      persistsAcross: ["frontier", "merge-DE", "note-recursion", "merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 40,
    },
    {
      id: "leaf-C",
      kind: "token",
      description: "Leaf C (0.17).",
      persistsAcross: ["frontier", "merge-DE", "note-recursion", "merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 40,
    },
    {
      id: "leaf-B",
      kind: "token",
      description: "Leaf B (0.35); never merged inside this excerpt, slides up the column.",
      persistsAcross: ["frontier", "merge-DE", "note-recursion", "merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 40,
    },
    {
      id: "parent-DE",
      kind: "node",
      description: "Internal node 0.31, born at the D/E merge point; never moves after birth.",
      persistsAcross: ["merge-DE", "note-recursion", "merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 6,
    },
    {
      id: "parent-AC",
      kind: "node",
      description: "Internal node 0.34, born at the A/C merge point.",
      persistsAcross: ["merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 6,
    },
    {
      id: "root-065",
      kind: "node",
      description: "Internal node 0.65 above both subtrees.",
      persistsAcross: ["merge-internal", "hold-two-left"],
      maxStepPx: 6,
    },
    {
      id: "token-DE",
      kind: "token",
      description:
        "Queue token of 0.31: a copy living in the sorted column until it is " +
        "consumed by travelling onto its tree original and fading.",
      persistsAcross: ["merge-DE", "note-recursion", "merge-AC"],
      maxStepPx: 40,
    },
    {
      id: "token-AC",
      kind: "token",
      description: "Queue token of 0.34.",
      persistsAcross: ["merge-AC"],
      maxStepPx: 40,
    },
    {
      id: "edge-DE-left",
      kind: "edge",
      description: "Edge parent-DE -> D, drawn at the merge.",
      persistsAcross: ["merge-DE", "note-recursion", "merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 6,
    },
    {
      id: "edge-DE-right",
      kind: "edge",
      description: "Edge parent-DE -> E.",
      persistsAcross: ["merge-DE", "note-recursion", "merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 6,
    },
    {
      id: "edge-AC-left",
      kind: "edge",
      description: "Edge parent-AC -> A.",
      persistsAcross: ["merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 6,
    },
    {
      id: "edge-AC-right",
      kind: "edge",
      description: "Edge parent-AC -> C.",
      persistsAcross: ["merge-AC", "merge-internal", "hold-two-left"],
      maxStepPx: 6,
    },
    {
      id: "edge-065-left",
      kind: "edge",
      description: "Edge root-065 -> parent-AC.",
      persistsAcross: ["merge-internal", "hold-two-left"],
      maxStepPx: 6,
    },
    {
      id: "edge-065-right",
      kind: "edge",
      description: "Edge root-065 -> parent-DE.",
      persistsAcross: ["merge-internal", "hold-two-left"],
      maxStepPx: 6,
    },
  ],
  events: [
    {
      id: "highlight-two-lowest",
      refTime: 1454.7,
      description: "The two lowest tokens (D, E) are emphasised.",
      anchor: "transcript",
    },
    {
      id: "de-travel-start",
      refTime: 1456.2,
      description: "D and E travel from the column to their tree slots.",
      anchor: "transcript",
    },
    {
      id: "parent-de-born",
      refTime: 1458.3,
      description: "Parent circle appears showing the sum; edges grow.",
      anchor: "transcript",
    },
    {
      id: "token-de-posted",
      refTime: 1460.5,
      description: "A copy of the parent re-enters the column in sorted position.",
      anchor: "estimated",
    },
    {
      id: "recursion-noted",
      refTime: 1465.8,
      description: "Hold while the state is recast as a smaller instance.",
      anchor: "transcript",
    },
    {
      id: "highlight-ac",
      refTime: 1471.8,
      description: "A and C are emphasised as the new two lowest.",
      anchor: "transcript",
    },
    {
      id: "ac-travel-start",
      refTime: 1473.3,
      description: "A and C travel to tree slots; parent born; edges grow.",
      anchor: "transcript",
    },
    {
      id: "token-ac-posted",
      refTime: 1477.4,
      description: "The 0.34 token re-enters the sorted column.",
      anchor: "transcript",
    },
    {
      id: "highlight-internal-tokens",
      refTime: 1488.7,
      description: "The two internal-node tokens are emphasised as the two lowest.",
      anchor: "transcript",
    },
    {
      id: "internal-merge-start",
      refTime: 1490.2,
      description:
        "Both tokens travel onto their tree originals and fade; the 0.65 " +
        "parent grows above the two subtrees.",
      anchor: "transcript",
    },
    {
      id: "two-remaining",
      refTime: 1494.7,
      description: "Hold: only B and the 0.65 subtree remain.",
      anchor: "transcript",
    },
  ],
  landmarks: [
    {
      id: "frontier-column",
      objectId: "leaf-D",
      beatId: "frontier",
      x: -338,
      y: -172,
      note: "Top of the sorted column, left edge of frame.",
    },
    {
      id: "leaf-D-tree-slot",
      objectId: "leaf-D",
      beatId: "merge-DE",
      x: 67,
      y: 197,
      note: "D's final tree slot (leaf row, right subtree).",
    },
    {
      id: "leaf-E-tree-slot",
      objectId: "leaf-E",
      beatId: "merge-DE",
      x: 202,
      y: 197,
    },
    {
      id: "parent-DE-slot",
      objectId: "parent-DE",
      beatId: "merge-DE",
      x: 135,
      y: 67,
    },
    {
      id: "leaf-A-tree-slot",
      objectId: "leaf-A",
      beatId: "merge-AC",
      x: -203,
      y: 197,
    },
    {
      id: "parent-AC-slot",
      objectId: "parent-AC",
      beatId: "merge-AC",
      x: -135,
      y: 67,
    },
    {
      id: "root-065-slot",
      objectId: "root-065",
      beatId: "merge-internal",
      x: 0,
      y: -68,
    },
    {
      id: "leaf-B-final",
      objectId: "leaf-B",
      beatId: "merge-internal",
      x: -338,
      y: 60,
      note: "B slides up the emptying column but stays in it.",
    },
  ],
  invariants: [
    {
      id: "parent-sum-conservation",
      description:
        "Every internal node's displayed value equals the sum of its " +
        "children's displayed values (frequency conservation).",
      beats: [],
    },
    {
      id: "frontier-sorted",
      description:
        "Whenever the column is at rest (beat ends), its members are ordered " +
        "by ascending displayed value top to bottom.",
      beats: ["frontier", "note-recursion", "merge-AC", "hold-two-left"],
    },
    {
      id: "merge-picks-two-lowest",
      description:
        "Each merge consumes exactly the two lowest-valued frontier members " +
        "(the greedy rule the excerpt teaches).",
      beats: [],
    },
    {
      id: "placed-subtrees-never-move",
      description:
        "Once a node or leaf reaches its tree slot it never moves again.",
      beats: ["merge-AC", "merge-internal", "hold-two-left"],
    },
  ],
  transitions: [
    {
      refTime: 1456.2,
      kind: "travel",
      objects: ["leaf-D", "leaf-E"],
      note: "Same objects slide column -> tree; no fade-swap.",
    },
    {
      refTime: 1458.3,
      kind: "grow",
      objects: ["parent-DE", "edge-DE-left", "edge-DE-right"],
      note: "Parents are born at the merge, never transformed from children.",
    },
    {
      refTime: 1460.5,
      kind: "travel",
      objects: ["token-DE", "leaf-A", "leaf-C", "leaf-B"],
      note: "Column re-sorts around the posted token.",
    },
    {
      refTime: 1473.3,
      kind: "travel",
      objects: ["leaf-A", "leaf-C"],
    },
    {
      refTime: 1475.4,
      kind: "grow",
      objects: ["parent-AC", "edge-AC-left", "edge-AC-right"],
    },
    {
      refTime: 1490.2,
      kind: "fade",
      objects: ["token-DE", "token-AC"],
      note:
        "Intentional disposal: tokens travel onto their tree originals and " +
        "fade there — the one place opacity replacement is the correct reading.",
    },
    {
      refTime: 1492.7,
      kind: "grow",
      objects: ["root-065", "edge-065-left", "edge-065-right"],
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
      id: "token-de-consumed-early",
      note:
        "In the reference the 0.31 token is consumed during the internal " +
        "merge by fading at 0.9 into its original; the replica reproduces the " +
        "fade-at-original but tracks it as consumed (not visible) from the " +
        "start of merge-internal's grow phase.",
    },
    {
      id: "typography",
      note: "Serif LaTeX numerals in the reference; repo sans stack in the replica.",
    },
    {
      id: "column-resort-detail",
      note:
        "The reference rebuilds the whole column group per re-sort with " +
        "per-member transforms; the replica slides only the members whose " +
        "positions change. End states match; mid-flight paths may differ.",
    },
  ],
};
