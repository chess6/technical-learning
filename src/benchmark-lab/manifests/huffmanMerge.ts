import type { BenchmarkManifest } from "./types";

/**
 * Focused benchmark: establish the sorted Huffman frontier, then complete one
 * greedy merge and re-sort (24:10.0-24:22.5). Repeated merges and narration
 * holds add runtime but no new capability, so they remain in the reference
 * pack rather than the rendered excerpt.
 */
export const huffmanMergeManifest: BenchmarkManifest = {
  id: "huffman-merge",
  title: "Huffman first greedy merge (Reducible)",
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
    "The sorted frontier makes the greedy choice spatial. The two lowest leaves " +
    "travel into permanent tree slots, a parent is born with their sum, and a " +
    "queue copy returns to sorted position.",
  beats: [
    {
      id: "frontier",
      title: "The sorted frontier",
      refStart: 1450.0,
      refEnd: 1454.7,
      purpose: "Establish the probability ordering that licenses the merge.",
      visibleObjects: ["leaf-D", "leaf-E", "leaf-A", "leaf-C", "leaf-B"],
      text: {
        kind: "value-readout",
        note: "Each leaf carries its symbol and probability; no caption.",
      },
      camera: { mode: "static" },
    },
    {
      id: "merge-DE",
      title: "Merge the two least likely: D and E",
      refStart: 1454.7,
      refEnd: 1462.5,
      purpose:
        "Carry the two lowest leaves to tree slots, grow their summed parent, " +
        "and post its queue token back into sorted position.",
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
  ],
  objects: [
    ...[
      ["leaf-D", 0.15, "D"],
      ["leaf-E", 0.16, "E"],
      ["leaf-A", 0.17, "A"],
      ["leaf-C", 0.17, "C"],
      ["leaf-B", 0.35, "B"],
    ].map(([id, value, symbol]) => ({
      id: id as string,
      kind: "token" as const,
      description: `Leaf ${symbol} (${value}); persistent from frontier to landed state.`,
      persistsAcross: ["frontier", "merge-DE"],
      maxStepPx: 40,
    })),
    {
      id: "parent-DE",
      kind: "node",
      description: "Permanent 0.31 parent born above D and E.",
      persistsAcross: ["merge-DE"],
      maxStepPx: 6,
    },
    {
      id: "token-DE",
      kind: "token",
      description: "Queue copy of the 0.31 parent posted into the frontier.",
      persistsAcross: ["merge-DE"],
      maxStepPx: 40,
    },
    {
      id: "edge-DE-left",
      kind: "edge",
      description: "Edge from the new parent to D.",
      persistsAcross: ["merge-DE"],
      maxStepPx: 6,
    },
    {
      id: "edge-DE-right",
      kind: "edge",
      description: "Edge from the new parent to E.",
      persistsAcross: ["merge-DE"],
      maxStepPx: 6,
    },
  ],
  events: [
    {
      id: "highlight-two-lowest",
      refTime: 1454.7,
      description: "The two lowest tokens, D and E, are emphasised.",
      anchor: "transcript",
    },
    {
      id: "de-travel-start",
      refTime: 1456.2,
      description: "D and E travel from the frontier to their tree slots.",
      anchor: "transcript",
    },
    {
      id: "parent-de-born",
      refTime: 1458.3,
      description: "A parent appears displaying their sum while edges grow.",
      anchor: "transcript",
    },
    {
      id: "token-de-posted",
      refTime: 1460.5,
      description: "A queue copy of the parent returns in sorted position.",
      anchor: "estimated",
    },
  ],
  landmarks: [
    {
      id: "frontier-column",
      objectId: "leaf-D",
      beatId: "frontier",
      x: -338,
      y: -172,
      note: "Top of the sorted column at the left of frame.",
    },
    {
      id: "leaf-D-tree-slot",
      objectId: "leaf-D",
      beatId: "merge-DE",
      x: 67,
      y: 197,
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
  ],
  invariants: [
    {
      id: "parent-sum-conservation",
      description: "The new parent displays the sum of D and E.",
      beats: ["merge-DE"],
    },
    {
      id: "frontier-sorted",
      description: "At every retained rest state the frontier is ascending.",
      beats: ["frontier", "merge-DE"],
    },
    {
      id: "merge-picks-two-lowest",
      description: "The enacted merge consumes the two lowest frontier values.",
      beats: ["merge-DE"],
    },
  ],
  transitions: [
    {
      refTime: 1456.2,
      kind: "travel",
      objects: ["leaf-D", "leaf-E"],
      note: "The same leaf objects travel from frontier to tree.",
    },
    {
      refTime: 1458.3,
      kind: "grow",
      objects: ["parent-DE", "edge-DE-left", "edge-DE-right"],
    },
    {
      refTime: 1460.5,
      kind: "travel",
      objects: ["token-DE", "leaf-A", "leaf-C", "leaf-B"],
      note: "The frontier re-sorts around the posted parent token.",
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
      id: "typography",
      note: "Reference uses serif LaTeX numerals; the replica uses the repo sans stack.",
    },
    {
      id: "column-resort-detail",
      note:
        "Reference rebuilds the frontier group per re-sort; the replica moves " +
        "only members whose positions change. End states are compared.",
    },
  ],
};
