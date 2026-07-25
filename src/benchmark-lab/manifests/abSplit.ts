import type { BenchmarkManifest } from "./types";

/**
 * Benchmark: overflow -> split -> cascade to the root ((a,b)-trees, Tom Slama,
 * lifFgyB77zc, 4:59-6:06).
 *
 * Chosen from the xiaoxiae pack to test: persistent key tokens through
 * structural change (keys travel, only borders/edges appear and disappear), a
 * full-frame pause prompt over a frozen violating state, the pinned leaf row
 * with the tree growing UPWARD at the root, camera reframing (zoom to the
 * split halves for the validity argument, zoom to the root for the 2-children
 * rule) with everything else dimmed, and red as the single reserved
 * violation colour.
 *
 * Observed structure: (2,4)-tree over keys 0..7; inserting 5 overflows
 * (4 5 6 7); split lifts 5 to the root -> (1 3 5). Inserting 8 then 9
 * overflows (6 7 8 9); 7 rises; the root (1 3 5 7) overflows and splits,
 * lifting 3 into a NEW root — the tree grows upward while the leaf row stays
 * pinned. Written from observation; the GPL reference source was not consulted
 * for the reconstruction.
 */
export const abSplitManifest: BenchmarkManifest = {
  id: "ab-split",
  title: "(a,b)-tree split cascade (Tom Slama)",
  packDir: ".reference-sources/packs/lifFgyB77zc",
  source: {
    repoSlug: "xiaoxiae-videos",
    repoUrl: "https://github.com/xiaoxiae/videos",
    inspectedCommit: "f65794b0dfc81b225364ea776feac8326599cdaa",
    videoId: "lifFgyB77zc",
    videoTitle: "The Most Elegant Search Structure | (a,b)-trees",
    channel: "Tom Slama (Tom S)",
    sceneSources: ["Insertion", "ABTree.bubble_insert", "TransparentPause", "create_node"],
    license: "GPL-3.0 (reference-only)",
  },
  pedagogicalPurpose:
    "Structural repair as motion of persistent tokens: the viewer predicts " +
    "the fix during a frozen pause, then watches the middle key physically " +
    "rise while every key keeps its identity, and finally sees the invariant " +
    "(same-depth leaves) enforced by layout as growth happens only at the root.",
  beats: [
    {
      id: "pause-prompt",
      title: "Pause: how would you fix the overfull node?",
      refStart: 299.0,
      refEnd: 310.6,
      purpose:
        "The tree is frozen in its violating state (red overfull node) under " +
        "a pause overlay so the viewer can predict the repair.",
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
        note:
          "Persistent section title plus a full-frame pause overlay with a " +
          "sliding progress marker.",
      },
      camera: { mode: "static" },
    },
    {
      id: "split-rise",
      title: "Split: the middle key rises",
      refStart: 310.6,
      refEnd: 317.9,
      purpose:
        "The repair: the overfull border pulls apart into two half-borders " +
        "while the middle key travels up into the parent; every key token " +
        "persists.",
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
      text: { kind: "object-label", note: "Only the key numerals and the section title." },
      camera: { mode: "static" },
    },
    {
      id: "cascade-note",
      title: "The parent might now be broken too",
      refStart: 317.9,
      refEnd: 326.7,
      purpose:
        "Hold on the repaired tree while the cascade rule is stated: adding a " +
        "key upward can re-break the invariant, so the process repeats.",
      visibleObjects: [
        "title",
        "root-node",
        "node-0",
        "node-2",
        "key-4",
        "key-67",
        "leaf-row",
      ],
      text: { kind: "object-label" },
      camera: { mode: "static" },
    },
    {
      id: "more-inserts",
      title: "Insert 8, 9: the split cascades to the root",
      refStart: 326.7,
      refEnd: 340.6,
      purpose:
        "Two more inserts overflow the rightmost node; its split overfills " +
        "the root, whose own split lifts a key into a NEW root — the leaf row " +
        "stays pinned and the tree grows upward.",
      visibleObjects: [
        "title",
        "root-node",
        "new-root",
        "node-0",
        "node-2",
        "key-4",
        "key-67",
        "key-89",
        "leaf-row",
      ],
      text: { kind: "object-label" },
      camera: { mode: "static" },
    },
    {
      id: "split-validity",
      title: "Why a split half is always legal",
      refStart: 340.6,
      refEnd: 357.0,
      purpose:
        "Camera zooms to the split halves while the floor((b+1)/2) >= a " +
        "argument is annotated beneath them; the rest of the tree dims.",
      visibleObjects: [
        "title",
        "new-root",
        "root-node",
        "key-67",
        "validity-note",
      ],
      text: {
        kind: "temporary-annotation",
        note: "A short inequality annotation near the zoomed halves.",
      },
      camera: {
        mode: "zoom-in",
        target: { x: 120, y: -20, scale: 1.5 },
        note: "Zoom onto the two nodes produced by the last split.",
      },
    },
    {
      id: "root-validity",
      title: "The root may have as few as two children",
      refStart: 357.0,
      refEnd: 366.0,
      purpose:
        "Camera reframes on the new root; an arrow annotation counts its two " +
        "children, the exception the root is allowed.",
      visibleObjects: [
        "title",
        "new-root",
        "root-node",
        "key-67",
        "root-note",
      ],
      text: {
        kind: "temporary-annotation",
        note: "Arrow-plus-words annotation pointing at the root.",
      },
      camera: {
        mode: "zoom-in",
        target: { x: 0, y: -90, scale: 1.6 },
        note: "Reframe upward onto the root; lower layers dimmed.",
      },
    },
  ],
  objects: [
    {
      id: "title",
      kind: "label",
      description: "Persistent underlined section title, top centre.",
      persistsAcross: [
        "pause-prompt",
        "split-rise",
        "cascade-note",
        "more-inserts",
        "split-validity",
        "root-validity",
      ],
      maxStepPx: 30,
    },
    {
      id: "pause-overlay",
      kind: "panel",
      description: "Pause progress overlay across the frozen frame.",
      persistsAcross: ["pause-prompt"],
      maxStepPx: 60,
    },
    {
      id: "root-node",
      kind: "node",
      description:
        "The original root border with keys 1,3 (later 1,3,5, then split); " +
        "tracked at key 1.",
      persistsAcross: [
        "pause-prompt",
        "split-rise",
        "cascade-note",
        "more-inserts",
        "split-validity",
        "root-validity",
      ],
      maxStepPx: 40,
    },
    {
      id: "new-root",
      kind: "node",
      description: "The new root born when the old root splits; tracked at key 3.",
      persistsAcross: ["more-inserts", "split-validity", "root-validity"],
      maxStepPx: 40,
    },
    {
      id: "node-0",
      kind: "node",
      description: "Leaf-parent holding key 0; never changes.",
      persistsAcross: ["pause-prompt", "split-rise", "cascade-note", "more-inserts"],
      maxStepPx: 12,
    },
    {
      id: "node-2",
      kind: "node",
      description: "Leaf-parent holding key 2; never changes.",
      persistsAcross: ["pause-prompt", "split-rise", "cascade-note", "more-inserts"],
      maxStepPx: 12,
    },
    {
      id: "node-4567",
      kind: "node",
      description: "The overfull red node holding 4,5,6,7 before the split.",
      persistsAcross: ["pause-prompt"],
      maxStepPx: 12,
    },
    {
      id: "key-4",
      kind: "token",
      description: "Key token 4; stays at leaf level through both splits.",
      persistsAcross: ["split-rise", "cascade-note", "more-inserts"],
      maxStepPx: 40,
    },
    {
      id: "key-5",
      kind: "token",
      description: "Key token 5; RISES into the root during the first split.",
      persistsAcross: ["split-rise"],
      maxStepPx: 40,
    },
    {
      id: "key-67",
      kind: "token",
      description: "Key token 7 (with 6 beside it); 7 rises in the cascade.",
      persistsAcross: ["split-rise", "cascade-note", "more-inserts", "split-validity", "root-validity"],
      maxStepPx: 40,
    },
    {
      id: "key-89",
      kind: "token",
      description: "Keys 8 and 9, inserted during the cascade beat.",
      persistsAcross: ["more-inserts"],
      maxStepPx: 40,
    },
    {
      id: "leaf-row",
      kind: "marker",
      description:
        "The row of square leaves; pinned at one height for the whole excerpt " +
        "(tracked at the leftmost leaf).",
      persistsAcross: [
        "pause-prompt",
        "split-rise",
        "cascade-note",
        "more-inserts",
      ],
      maxStepPx: 8,
    },
    {
      id: "validity-note",
      kind: "label",
      description: "Inequality annotation under the zoomed split halves.",
      persistsAcross: ["split-validity"],
      maxStepPx: 20,
    },
    {
      id: "root-note",
      kind: "label",
      description: "Arrow annotation counting the root's two children.",
      persistsAcross: ["root-validity"],
      maxStepPx: 20,
    },
  ],
  events: [
    {
      id: "pause-begins",
      refTime: 299.7,
      description: "Pause overlay slides in over the frozen violating tree.",
      anchor: "transcript",
    },
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
    {
      id: "cascade-rule-stated",
      refTime: 317.9,
      description: "Hold begins while the repeat-upward rule is stated.",
      anchor: "transcript",
    },
    {
      id: "insert-8",
      refTime: 328.5,
      description: "Key 8 drops into the rightmost node.",
      anchor: "estimated",
    },
    {
      id: "insert-9-overflow",
      refTime: 332.0,
      description: "Key 9 lands; the node turns red (overfull).",
      anchor: "estimated",
    },
    {
      id: "cascade-split",
      refTime: 334.5,
      description: "Split: 7 rises; the root overfills and turns red.",
      anchor: "estimated",
    },
    {
      id: "root-splits-up",
      refTime: 337.0,
      description:
        "The root splits; 3 rises into a brand-new root while the leaf row " +
        "stays pinned.",
      anchor: "estimated",
    },
    {
      id: "zoom-to-halves",
      refTime: 342.2,
      description: "Camera zooms onto the two split halves; the rest dims.",
      anchor: "transcript",
    },
    {
      id: "validity-annotated",
      refTime: 346.6,
      description: "The floor((b+1)/2) >= a annotation is written under them.",
      anchor: "transcript",
    },
    {
      id: "reframe-root",
      refTime: 357.0,
      description: "Camera reframes on the root; the two-children arrow appears.",
      anchor: "transcript",
    },
  ],
  landmarks: [
    {
      id: "title-pos",
      objectId: "title",
      beatId: "pause-prompt",
      x: 0,
      y: -158,
      note: "Underlined section title above the tree.",
    },
    {
      id: "root-before-growth",
      objectId: "root-node",
      beatId: "split-rise",
      x: 0,
      y: -8,
      note: "Root centre before the tree grows a level.",
    },
    {
      id: "new-root-after-growth",
      objectId: "new-root",
      beatId: "more-inserts",
      x: 0,
      y: -70,
      note: "The new root sits a full level higher.",
    },
    {
      id: "leaf-row-pinned",
      objectId: "leaf-row",
      beatId: "more-inserts",
      x: -248,
      y: 175,
      note: "Leftmost leaf square: same height as before the growth.",
    },
  ],
  invariants: [
    {
      id: "keys-sorted-left-to-right",
      description:
        "At every beat end, key tokens read in ascending order left to right " +
        "across the whole tree.",
      beats: [],
    },
    {
      id: "leaf-row-height-constant",
      description:
        "The leaf row's y position never changes — growth happens only at the " +
        "root (the all-leaves-same-depth invariant enforced by layout).",
      beats: ["pause-prompt", "split-rise", "cascade-note", "more-inserts"],
    },
    {
      id: "keys-persist-through-split",
      description:
        "No key token fades during a structural step; only borders and edges " +
        "appear or disappear.",
      beats: ["split-rise", "more-inserts"],
    },
    {
      id: "violation-colour-reserved",
      description:
        "Red marks exactly the currently-violating node and the arriving key; " +
        "nothing else is red.",
      beats: ["pause-prompt", "more-inserts"],
    },
  ],
  transitions: [
    {
      refTime: 312.6,
      kind: "grow",
      objects: ["node-4567"],
      note: "Border swap: full border out, two half-borders pull apart.",
    },
    {
      refTime: 314.0,
      kind: "travel",
      objects: ["key-5", "root-node"],
      note: "The middle key rises into the parent slot; neighbours make room.",
    },
    {
      refTime: 334.5,
      kind: "travel",
      objects: ["key-67", "root-node"],
    },
    {
      refTime: 337.0,
      kind: "travel",
      objects: ["new-root", "root-node"],
      note: "Root split: key 3 rises; the two halves drop into child positions.",
    },
    {
      refTime: 342.2,
      kind: "continuous-morph",
      objects: ["new-root", "root-node", "key-67"],
      note: "Camera zoom is a continuous reframe, not a cut.",
    },
    {
      refTime: 357.0,
      kind: "continuous-morph",
      objects: ["new-root", "root-node"],
      note: "Second reframe onto the root.",
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
      id: "insert-timing-estimated",
      note:
        "The batch-insert montage (8, 9) has no narration anchors; its event " +
        "times were read off the reference frames to ~0.5 s.",
    },
    {
      id: "typography",
      note: "Serif LaTeX keys in the reference; repo sans stack in the replica.",
    },
    {
      id: "camera-implementation",
      note:
        "The reference uses a moving camera; the replica reframes by scaling " +
        "and translating the world group (the runtime has no camera rig). " +
        "Framing targets and timing match; interpolation curve may differ.",
    },
    {
      id: "search-descent-elided",
      note:
        "The reference briefly shows the sped-up search descent for inserts 8 " +
        "and 9; the replica drops the keys directly into the target node. The " +
        "descent belongs to an earlier beat outside this excerpt.",
    },
  ],
};
