import { Circle, Line, Node, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { BST_SEVEN } from "../../lessons/exampleData";
import {
  binarySearchProbes,
  bstHeight,
  bstSearchTrace,
  buildBalanced,
} from "../../math";
import { BST_LIFT_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  makeOverlayLabel,
  runSegment,
  worstCaseComparisons,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_TOP_Y } from "./safeFrame";

/**
 * Watch scene for Binary Search Trees.
 *
 * The choreography *is* the argument: binary search runs on the sorted array,
 * its probes are marked, a second search shows the first probe being recomputed
 * from scratch, and the probed cells are then lifted **straight down** into tree
 * positions. The vertical-only move is deliberate — nothing is rearranged, so
 * the drawing cannot imply that a computation happened. The ordering rule is
 * read off the result afterwards rather than asserted before it.
 *
 * Every key, probe sequence, path, and height comes from `src/math`; this module
 * only maps them onto the canvas.
 */

const SCENE_ID = "bst-lift-from-array";

const KEYS = BST_SEVEN.sorted;
const TARGET = BST_SEVEN.target!;
/** A second target chosen so its first probe repeats the first search's. */
const SECOND_TARGET = 8;

const BALANCED = buildBalanced(KEYS);

/** Horizontal slot per key, in sorted order — shared by the array and the tree. */
const SLOT = 88;
const slotX = (index: number): number => (index - (KEYS.length - 1) / 2) * SLOT;
const keyIndex = (key: number): number => KEYS.indexOf(key);

const ARRAY_Y = -186;
const LEVEL_Y = [-40, 52, 144] as const;

/** Depth of each key in the balanced tree, from the real structure. */
function depthOf(key: number): number {
  let node = BALANCED;
  let depth = 0;
  while (node !== null && node.key !== key) {
    node = key < node.key ? node.left : node.right;
    depth += 1;
  }
  return depth;
}

/** Parent of each key in the balanced tree, or null for the root. */
function parentOf(key: number): number | null {
  let node = BALANCED;
  let parent: number | null = null;
  while (node !== null && node.key !== key) {
    parent = node.key;
    node = key < node.key ? node.left : node.right;
  }
  return parent;
}

const treePos = (key: number): Vector2 =>
  new Vector2(slotX(keyIndex(key)), LEVEL_Y[depthOf(key)]!);

const arrayPos = (key: number): Vector2 =>
  new Vector2(slotX(keyIndex(key)), ARRAY_Y);

/** The chain sorted insertion produces: one level down and right per key. */
const chainPos = (key: number): Vector2 =>
  new Vector2(-236 + keyIndex(key) * 46, -128 + keyIndex(key) * 44);

function makeCell(key: number): Rect {
  return new Rect({
    width: 72,
    height: 52,
    radius: 8,
    fill: ROLE.grid,
    stroke: ROLE.axis,
    lineWidth: 2,
    position: arrayPos(key),
  });
}

function makeKeyText(key: number): Txt {
  return new Txt({
    text: String(key),
    fill: ROLE.text,
    fontSize: 26,
    fontWeight: 600,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    position: arrayPos(key),
  });
}

function makeEdge(from: Vector2, to: Vector2): Line {
  return new Line({
    points: [from, to],
    stroke: ROLE.axis,
    lineWidth: 3,
    opacity: 0,
  });
}

function makeSmallLabel(text: string, pos: Vector2, color: string): Txt {
  return new Txt({
    text,
    fill: color,
    stroke: ROLE.background,
    lineWidth: 4,
    strokeFirst: true,
    fontSize: 20,
    fontWeight: 600,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    position: pos,
    opacity: 0,
  });
}

export const bstLiftScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const caption = makeOverlayLabel("", ROLE.textMuted, 26);
  caption.position(new Vector2(0, LABEL_BOTTOM_Y));
  const title = makeOverlayLabel("", ROLE.text, 28);
  title.position(new Vector2(0, LABEL_TOP_Y));

  // ---- the array -----------------------------------------------------------
  const cells = new Map(KEYS.map((key) => [key, makeCell(key)]));
  const labels = new Map(KEYS.map((key) => [key, makeKeyText(key)]));
  const arrayGroup = new Node({});
  for (const key of KEYS) {
    arrayGroup.add(cells.get(key)!);
    arrayGroup.add(labels.get(key)!);
  }

  // ---- the tree that the cells will become --------------------------------
  const edges = new Map<number, Line>();
  const edgeGroup = new Node({});
  for (const key of KEYS) {
    const parent = parentOf(key);
    if (parent === null) continue;
    const edge = makeEdge(treePos(parent), treePos(key));
    edges.set(key, edge);
    edgeGroup.add(edge);
  }

  // Ring drawn around a probed / visited key.
  const rings = new Map(
    KEYS.map((key) => [
      key,
      new Circle({
        width: 62,
        height: 62,
        stroke: ROLE.selected,
        lineWidth: 3,
        position: arrayPos(key),
        opacity: 0,
      }),
    ]),
  );
  const ringGroup = new Node({});
  for (const key of KEYS) ringGroup.add(rings.get(key)!);

  const ruleLeft = makeSmallLabel("smaller", new Vector2(-96, 6), ROLE.original);
  const ruleRight = makeSmallLabel("larger", new Vector2(96, 6), ROLE.transformed);
  const intervalLabel = makeSmallLabel(
    "(16, 42)",
    new Vector2(slotX(keyIndex(23)), LEVEL_Y[2]! + 46),
    ROLE.basis2,
  );
  const costLabel = makeSmallLabel(
    "depth 2 → 3 comparisons",
    new Vector2(0, LABEL_BOTTOM_Y - 52),
    ROLE.selected,
  );

  // The invariant the whole choreography rests on: horizontal position is
  // sorted order, and NOTHING in the scene ever changes it. Shown from the lift
  // onward — including through the degenerate chain, where it is the reason the
  // stick still holds the same keys in the same order.
  const orderRuler = new Line({
    points: [
      new Vector2(slotX(0) - 30, -166),
      new Vector2(slotX(KEYS.length - 1) + 30, -166),
    ],
    stroke: ROLE.selected,
    lineWidth: 2,
    lineDash: [8, 8],
    endArrow: true,
    arrowSize: 10,
    opacity: 0,
  });
  const orderLabel = makeSmallLabel(
    "left → right stays sorted order",
    new Vector2(0, -192),
    ROLE.selected,
  );

  view.add(edgeGroup);
  view.add(arrayGroup);
  view.add(ringGroup);
  view.add(ruleLeft);
  view.add(ruleRight);
  view.add(intervalLabel);
  view.add(costLabel);
  view.add(orderRuler);
  view.add(orderLabel);
  view.add(caption);
  view.add(title);

  /** Move one key's cell + label together. */
  function* moveKey(
    key: number,
    to: Vector2,
    duration: number,
  ): ThreadGenerator {
    yield* all(
      cells.get(key)!.position(to, duration, easeInOutCubic),
      labels.get(key)!.position(to, duration, easeInOutCubic),
      rings.get(key)!.position(to, duration, easeInOutCubic),
    );
  }

  function* dimKeys(keys: readonly number[], to: number, duration = 0.5) {
    yield* all(
      ...keys.flatMap((key) => [
        cells.get(key)!.opacity(to, duration, easeInOutCubic),
        labels.get(key)!.opacity(to, duration, easeInOutCubic),
      ]),
    );
  }

  function* ring(key: number, on: boolean, duration = 0.4) {
    yield* rings.get(key)!.opacity(on ? 1 : 0, duration, easeInOutCubic);
  }

  // The establishing frame is already correct at t = 0.
  title.text("Binary search on a sorted array");
  caption.text(`Find ${TARGET}.`);

  const firstProbes = binarySearchProbes(KEYS, TARGET);
  const secondProbes = binarySearchProbes(KEYS, SECOND_TARGET);

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const bodies: Record<string, () => ThreadGenerator> = {
    *establish() {
      yield* waitFor(beats("establish").hold!);
    },

    *["probe-first"]() {
      const b = beats("probe-first");
      // Probe the midpoint; everything it rules out goes dark and stays dark.
      const probe = firstProbes[0]!;
      yield* ring(probe, true, b.ring!);
      caption.text(`${TARGET} > ${probe}, so everything at or below ${probe} is gone.`);
      const discarded = KEYS.filter((k) => k <= probe);
      yield* dimKeys(discarded, 0.18, b.dim!);
      yield* waitFor(b.hold!);
    },

    *["probe-rest"]() {
      const b = beats("probe-rest");
      const rest = firstProbes.slice(1);
      const ringTimes = [b.ring1!, b.ring2!];
      const gapTimes = [b.gap1!, b.gap2!];
      for (const [i, probe] of rest.entries()) {
        yield* ring(probe, true, ringTimes[i] ?? b.ring1!);
        yield* waitFor(gapTimes[i] ?? b.gap1!);
      }
      caption.text(`Three probes: ${firstProbes.join(" → ")}. That is the whole search.`);
      yield* waitFor(b.hold!);
    },

    *["second-search"]() {
      const b = beats("second-search");
      // Reset, then search a different key — and meet the same first probe.
      yield* all(
        dimKeys(KEYS, 1, b.reset!),
        ...KEYS.map((key) => ring(key, false, b.reset!)),
      );
      title.text("A different key — and the same first question");
      caption.text(`Now find ${SECOND_TARGET}.`);
      yield* waitFor(b.hold!);
      yield* ring(secondProbes[0]!, true, b.ring!);
      caption.text(
        `The first comparison is ${secondProbes[0]} again — recomputed from scratch.`,
      );
      yield* waitFor(b.hold2!);
    },

    *lift() {
      const b = beats("lift");
      title.text("Keep the probes instead of recomputing them");
      caption.text("Every probe becomes a node; every outcome becomes an edge.");
      yield* all(...KEYS.map((key) => ring(key, false, b.clear!)));
      // A purely VERTICAL move: the horizontal slot never changes, so nothing is
      // rearranged — only remembered. The ruler makes that checkable.
      yield* all(
        orderRuler.opacity(0.8, b.lift!),
        orderLabel.opacity(0.9, b.lift!),
        ...KEYS.map((key) => moveKey(key, treePos(key), b.lift!)),
      );
      yield* all(
        ...[...edges.values()].map((edge) => edge.opacity(1, b.edges!, easeInOutCubic)),
      );
      yield* waitFor(b.hold!);
    },

    *["read-the-rule"]() {
      const b = beats("read-the-rule");
      title.text("Nobody stated the rule — it fell out");
      caption.text(
        "A comparison that sent you left had to discard everything larger. That is the ordering condition.",
      );
      yield* all(
        ruleLeft.opacity(1, b.ruleReveal!, easeInOutCubic),
        ruleRight.opacity(1, b.costReveal!, easeInOutCubic),
      );
      yield* waitFor(b.hold!);
    },

    *["interval-stays"]() {
      const b = beats("interval-stays");
      title.text("Each position inherits a range");
      caption.text(
        "Going right at 16 sets the floor; going left at 42 sets the ceiling. Only keys in between may live here.",
      );
      yield* all(
        ruleLeft.opacity(0, b.swap!, easeInOutCubic),
        ruleRight.opacity(0, b.swap!, easeInOutCubic),
        ring(23, true, b.swap!),
      );
      yield* intervalLabel.opacity(1, b.label!, easeInOutCubic);
      yield* waitFor(b.hold!);
    },

    *["cost-is-depth"]() {
      const b = beats("cost-is-depth");
      title.text("One comparison per level");
      const path = bstSearchTrace(BALANCED, TARGET).comparisons;
      caption.text(`Finding ${TARGET} compares ${path.join(", ")}.`);
      yield* all(
        intervalLabel.opacity(0, b.clear!, easeInOutCubic),
        ...KEYS.map((key) => ring(key, false, b.clear!)),
      );
      // Split the declared walk budget across the path so the beat consumes
      // exactly what it declared, whatever the path length turns out to be.
      const perRing = b.walk! / (path.length * 2);
      for (const key of path) {
        yield* ring(key, true, perRing);
        yield* waitFor(perRing);
      }
      yield* costLabel.opacity(1, b.costReveal!, easeInOutCubic);
      yield* waitFor(b.hold!);
    },

    *degenerate() {
      const b = beats("degenerate");
      title.text("Now insert the same keys in increasing order");
      caption.text(
        "Each key is larger than everything before it, so each one in turn walks to the far right.",
      );
      yield* all(
        costLabel.opacity(0, b.clear!, easeInOutCubic),
        ...KEYS.map((key) => ring(key, false, b.clear!)),
        ...[...edges.values()].map((edge) => edge.opacity(0, b.clear!, easeInOutCubic)),
      );
      // ONE AT A TIME. The caption says each key walks in turn; the scene used
      // to move all seven simultaneously, which is a different (and much less
      // instructive) claim. Budget split so the loop consumes exactly `insert`.
      const perMove = (b.insert! * 0.62) / KEYS.length;
      const perEdge = (b.insert! * 0.38) / (KEYS.length - 1);
      const edgeList = [...edges.values()];
      yield* moveKey(KEYS[0]!, chainPos(KEYS[0]!), perMove);
      for (let i = 1; i < KEYS.length; i += 1) {
        yield* moveKey(KEYS[i]!, chainPos(KEYS[i]!), perMove);
        const edge = edgeList[i - 1]!;
        edge.points([chainPos(KEYS[i - 1]!), chainPos(KEYS[i]!)]);
        yield* edge.opacity(1, perEdge, easeInOutCubic);
      }
      yield* waitFor(b.hold!);
    },

    *["predict-gap"]() {
      const b = beats("predict-gap");
      title.text("Same keys. Same rule. Same sorted readout.");
      caption.text(
        "This chain holds exactly the keys the balanced tree held, in the same left-to-right order.",
      );
      yield* waitFor(b.ask!);
      caption.text(
        `Predict: to find ${TARGET} here, how many comparisons at worst — and how many did the balanced shape need?`,
      );
      yield* waitFor(b.think!);
    },

    *["the-gap"]() {
      const b = beats("the-gap");
      title.text("Same keys. Three comparisons, or seven");
      const balancedCost = worstCaseComparisons(bstHeight(BALANCED));
      const chainCost = worstCaseComparisons(KEYS.length - 1);
      caption.text(
        `Balanced: ${balancedCost} comparisons. This chain: ${chainCost}. Only the insertion order changed.`,
      );
      costLabel.text(`height ${bstHeight(BALANCED)} vs height ${KEYS.length - 1}`);
      costLabel.position(new Vector2(0, LABEL_BOTTOM_Y - 52));
      yield* costLabel.opacity(1, b.label!, easeInOutCubic);
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of BST_LIFT_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
