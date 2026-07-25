import { Circle, Line, Node, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { RBT_FOUR_NODE } from "../../lessons/exampleData";
import { RED_BLACK_SEGMENTS } from "./sceneTimings";
import { ROLE, makeOverlayLabel, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_TOP_Y } from "./safeFrame";

/**
 * Watch scene for Red–Black Trees: **one cluster, two panels**.
 *
 * Left: a 2–3–4 node drawn as a box of keys. Right: its binary encoding. Keys
 * arrive on the left and the encoding follows in the *same* frame, so the
 * learner watches the correspondence instead of being told it. Then the node
 * overflows and — after an explicit prediction prompt — splits, with the split
 * seen to be the colour flip: the left panel's key travel and the right
 * panel's tweened recolour run simultaneously, every node object keeping its
 * identity. The arriving key then settles into its new home (a red child of
 * its neighbour, both panels), and a dedicated beat reads the conserved black
 * height off the picture before the violation is traced upward.
 *
 * Deliberately a single cluster rather than a whole tree: the insight is about
 * what one node *is*, and a full tree at this size would make the colour change
 * — the actual subject — the smallest thing on screen.
 *
 * Choreography informed by the reference packs (see
 * .reference-sources/packs/lifFgyB77zc — Sláma's (a,b)-trees): keys travel and
 * are never faded out/in; the leaf row stays pinned so height grows upward at
 * the root; red is reserved for data (extra keys) while the violation marker
 * uses a distinct colour, because Sláma's red-means-violation grammar would
 * collide with red-black data colours.
 */

const KEYS = RBT_FOUR_NODE.keys; // [20, 30, 40]
const ARRIVING = RBT_FOUR_NODE.arriving; // 35
const PROMOTED = RBT_FOUR_NODE.promoted; // 30

const LEFT_X = -240;
const RIGHT_X = 250;
const CLUSTER_Y = 10;
const NODE_R = 30;
const CELL_W = 62;

/** Slot for the i-th key inside the left panel's 2–3–4 box. */
const cellX = (index: number, count: number): number =>
  LEFT_X + (index - (count - 1) / 2) * CELL_W;

function makeKeyCell(key: number, pos: Vector2): Node {
  const group = new Node({ position: pos, opacity: 0 });
  group.add(
    new Rect({
      width: CELL_W - 6,
      height: 46,
      radius: 6,
      fill: ROLE.grid,
      stroke: ROLE.axis,
      lineWidth: 2,
    }),
  );
  group.add(
    new Txt({
      text: String(key),
      fill: ROLE.text,
      fontSize: 24,
      fontWeight: 600,
      fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    }),
  );
  return group;
}

function makeCircleNode(key: number, pos: Vector2, red: boolean): Node {
  const group = new Node({ position: pos, opacity: 0 });
  group.add(
    new Circle({
      width: NODE_R * 2,
      height: NODE_R * 2,
      fill: red ? ROLE.result : ROLE.background,
      stroke: red ? ROLE.result : ROLE.textMuted,
      lineWidth: 3,
    }),
  );
  group.add(
    new Txt({
      text: String(key),
      fill: red ? ROLE.background : ROLE.text,
      fontSize: 22,
      fontWeight: 700,
      fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    }),
  );
  return group;
}

/**
 * Tweened recolour: the colour flip is the subject of the split beat, so it
 * must be *watchable* — running over the same duration as the left panel's key
 * travel, never snapping. The node objects themselves are reused (identity is
 * preserved; only paint changes).
 */
function* paintTween(
  group: Node,
  red: boolean,
  duration: number,
): ThreadGenerator {
  const [circle, label] = group.children() as [Circle, Txt];
  yield* all(
    circle.fill(red ? ROLE.result : ROLE.background, duration, easeInOutCubic),
    circle.stroke(red ? ROLE.result : ROLE.textMuted, duration, easeInOutCubic),
    label.fill(red ? ROLE.background : ROLE.text, duration, easeInOutCubic),
  );
}

function makeSmallLabel(text: string, pos: Vector2, color: string): Txt {
  return new Txt({
    text,
    fill: color,
    stroke: ROLE.background,
    lineWidth: 4,
    strokeFirst: true,
    fontSize: 19,
    fontWeight: 600,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    position: pos,
    opacity: 0,
  });
}

export const redBlackEncodingScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const seconds = Object.fromEntries(
    RED_BLACK_SEGMENTS.map((segment) => [segment.id, segment.duration]),
  ) as Record<string, number>;

  const caption = makeOverlayLabel("", ROLE.textMuted, 25);
  caption.position(new Vector2(0, LABEL_BOTTOM_Y));
  const title = makeOverlayLabel("", ROLE.text, 28);
  title.position(new Vector2(0, LABEL_TOP_Y));

  // Panel labels sit high enough that the promoted key's lift during the
  // split (to CLUSTER_Y − 96) never runs into them.
  const panelLeft = makeSmallLabel(
    "2–3–4 tree",
    new Vector2(LEFT_X, CLUSTER_Y - 145),
    ROLE.basis1,
  );
  const panelRight = makeSmallLabel(
    "its binary encoding",
    new Vector2(RIGHT_X, CLUSTER_Y - 145),
    ROLE.original,
  );

  // ---- left panel: the 2–3–4 node as a box of keys ------------------------
  const cells = KEYS.map((key, index) =>
    makeKeyCell(key, new Vector2(cellX(index, 3), CLUSTER_Y)),
  );
  // Waits with a clear gap to the box: 35 drawn flush after 40 would read as
  // a fourth in-box key breaking sorted order. It "knocks" from outside.
  const arrivingCell = makeKeyCell(
    ARRIVING,
    new Vector2(cellX(3, 4) + 64, CLUSTER_Y),
  );

  // ---- right panel: black representative + up to two red children ---------
  const rep = makeCircleNode(KEYS[1]!, new Vector2(RIGHT_X, CLUSTER_Y - 46), false);
  const redLeft = makeCircleNode(
    KEYS[0]!,
    new Vector2(RIGHT_X - 78, CLUSTER_Y + 62),
    true,
  );
  const redRight = makeCircleNode(
    KEYS[2]!,
    new Vector2(RIGHT_X + 78, CLUSTER_Y + 62),
    true,
  );
  const edgeLeft = new Line({
    points: [
      new Vector2(RIGHT_X - 12, CLUSTER_Y - 20),
      new Vector2(RIGHT_X - 66, CLUSTER_Y + 40),
    ],
    stroke: ROLE.axis,
    lineWidth: 3,
    opacity: 0,
  });
  const edgeRight = new Line({
    points: [
      new Vector2(RIGHT_X + 12, CLUSTER_Y - 20),
      new Vector2(RIGHT_X + 66, CLUSTER_Y + 40),
    ],
    stroke: ROLE.axis,
    lineWidth: 3,
    opacity: 0,
  });

  const clusterRing = new Circle({
    width: 250,
    height: 190,
    stroke: ROLE.selected,
    lineWidth: 3,
    position: new Vector2(RIGHT_X, CLUSTER_Y + 12),
    opacity: 0,
  });

  // The arriving key's final home after the split: a red child under the (now
  // black) right node — the same "extra key hangs off in red" rule as before.
  const red35 = makeCircleNode(
    ARRIVING,
    new Vector2(RIGHT_X + 34, CLUSTER_Y + 132),
    true,
  );
  const edge35 = new Line({
    points: [
      new Vector2(RIGHT_X + 66, CLUSTER_Y + 84),
      new Vector2(RIGHT_X + 46, CLUSTER_Y + 108),
    ],
    stroke: ROLE.axis,
    lineWidth: 3,
    opacity: 0,
  });

  const bhLabel = makeSmallLabel(
    "black height 1 — the reds add keys, not levels",
    new Vector2(0, LABEL_BOTTOM_Y - 48),
    ROLE.selected,
  );
  const marker = makeSmallLabel(
    "▲ the break is now here",
    new Vector2(RIGHT_X, CLUSTER_Y - 118),
    ROLE.transformed,
  );

  view.add(edgeLeft);
  view.add(edgeRight);
  view.add(edge35);
  view.add(clusterRing);
  view.add(red35);
  for (const cell of cells) view.add(cell);
  view.add(arrivingCell);
  view.add(rep);
  view.add(redLeft);
  view.add(redRight);
  view.add(panelLeft);
  view.add(panelRight);
  view.add(bhLabel);
  view.add(marker);
  view.add(caption);
  view.add(title);

  function* show(node: Node, on: boolean, duration = 0.5) {
    yield* node.opacity(on ? 1 : 0, duration, easeInOutCubic);
  }

  // Establishing frame, correct at t = 0: one key on each side.
  title.text("A node with one key");
  caption.text("The left panel is the 2–3–4 node. The right is how it is stored.");
  cells[1]!.opacity(1);
  cells[1]!.position(new Vector2(LEFT_X, CLUSTER_Y));
  rep.opacity(1);
  panelLeft.opacity(1);
  panelRight.opacity(1);

  const bodies: Record<string, () => ThreadGenerator> = {
    *establish() {
      yield* waitFor(seconds.establish!);
    },

    *["encode-2node"]() {
      title.text("A 2-node is a lone black node");
      caption.text("One key, one black node. Nothing else to record.");
      yield* show(clusterRing, true, 0.5);
      yield* waitFor(seconds["encode-2node"]! - 0.5);
    },

    *["encode-3node"]() {
      title.text("A second key hangs off in red");
      caption.text(
        "Two keys is a 3-node. The extra key does not get its own level — it hangs off the black one, in red.",
      );
      yield* all(
        cells[1]!.position(new Vector2(cellX(1, 2), CLUSTER_Y), 0.6, easeInOutCubic),
        cells[0]!.position(new Vector2(cellX(0, 2), CLUSTER_Y), 0.01),
      );
      yield* all(show(cells[0]!, true, 0.5), show(edgeLeft, true, 0.5));
      yield* show(redLeft, true, 0.5);
      yield* waitFor(seconds["encode-3node"]! - 1.6);
    },

    *["encode-4node"]() {
      title.text("Three keys, two reds");
      caption.text("A 4-node: the black representative and both of its extra keys.");
      yield* all(
        cells[0]!.position(new Vector2(cellX(0, 3), CLUSTER_Y), 0.5, easeInOutCubic),
        cells[1]!.position(new Vector2(cellX(1, 3), CLUSTER_Y), 0.5, easeInOutCubic),
      );
      yield* all(show(cells[2]!, true, 0.5), show(edgeRight, true, 0.5));
      yield* show(redRight, true, 0.5);
      yield* waitFor(seconds["encode-4node"]! - 1.5);
    },

    *["read-off-r2"]() {
      title.text("“No two reds” was never an axiom");
      caption.text(
        "Every extra key hangs off a BLACK representative. A red under a red would be the same node, drawn wrong.",
      );
      yield* waitFor(seconds["read-off-r2"]!);
    },

    *["read-off-r3"]() {
      title.text("Counting black nodes counts levels");
      caption.text(
        "Reds add keys within a level; only blacks start a new one. So equal black heights means all 2–3–4 leaves are level.",
      );
      yield* show(bhLabel, true, 0.5);
      yield* waitFor(seconds["read-off-r3"]! - 0.5);
    },

    *overflow() {
      title.text(`A fourth key — ${ARRIVING} — and no room`);
      caption.text("The node is full. In a 2–3–4 tree, a full node splits.");
      yield* all(show(bhLabel, false, 0.3), show(arrivingCell, true, 0.6));
      yield* waitFor(1.4);
      // Prediction before the reveal: name what must stay fixed before seeing
      // the repair. runSegment pads the rest of the segment as think time.
      caption.text(
        `Predict: which key is promoted — and does the right panel MOVE, or RECOLOUR?`,
      );
    },

    *["split-is-recolour"]() {
      title.text("The split IS the colour flip");
      caption.text(
        `${PROMOTED} is promoted into the parent; the other two become their own 2-nodes. On the right, nothing moves — the colours flip.`,
      );
      // Left: the box breaks in two with the middle key lifted out, while the
      // right panel enacts the SAME event as colour alone — one motion, two
      // views, and every node object keeps its identity.
      yield* all(
        cells[1]!.position(new Vector2(LEFT_X, CLUSTER_Y - 96), 0.9, easeInOutCubic),
        cells[0]!.position(new Vector2(LEFT_X - 70, CLUSTER_Y + 52), 0.9, easeInOutCubic),
        cells[2]!.position(new Vector2(LEFT_X + 70, CLUSTER_Y + 52), 0.9, easeInOutCubic),
        paintTween(rep, true, 0.9),
        paintTween(redLeft, false, 0.9),
        paintTween(redRight, false, 0.9),
      );
      yield* waitFor(0.6);
      // Close the loop: the arriving key finally fits — it slides into the
      // right-hand 2-node (left panel) and hangs off it in red (right panel).
      caption.text(
        `And ${ARRIVING} finally fits: into the ${KEYS[2]} node — as a red child, same rule as before.`,
      );
      yield* all(
        arrivingCell.position(
          new Vector2(LEFT_X + 70 - (CELL_W - 6) / 2 - 3, CLUSTER_Y + 52),
          0.7,
          easeInOutCubic,
        ),
        cells[2]!.position(
          new Vector2(LEFT_X + 70 + (CELL_W - 6) / 2 + 3, CLUSTER_Y + 52),
          0.7,
          easeInOutCubic,
        ),
      );
      yield* all(show(edge35, true, 0.4), show(red35, true, 0.4));
    },

    *["invariant-held"]() {
      title.text("What the flip conserved");
      caption.text(
        "Count blacks downward: one on every path, exactly as before. The split changed colours, not counts.",
      );
      bhLabel.text("black height still 1 — the flip changed colours, not counts");
      yield* show(bhLabel, true, 0.5);
    },

    *["violation-moves-up"]() {
      title.text("The break moved up one level");
      caption.text(
        "The representative is red now — an extra key in its parent's node. If that parent is red too, the same repair runs one level higher.",
      );
      yield* show(marker, true, 0.5);
      yield* waitFor(seconds["violation-moves-up"]! - 0.5);
    },

    *["root-split"]() {
      title.text("Unless there is no parent left");
      caption.text(
        "At the root there is nowhere to promote to: the root is simply forced black again, and every path gains one black node at once.",
      );
      bhLabel.text("black height 2 — on every path, at the same moment");
      yield* all(paintTween(rep, false, 0.6), show(marker, false, 0.4));
      yield* waitFor(seconds["root-split"]! - 0.6);
    },
  };

  for (const segment of RED_BLACK_SEGMENTS) {
    yield* runSegment(segment.duration, bodies[segment.id]!);
  }
});
