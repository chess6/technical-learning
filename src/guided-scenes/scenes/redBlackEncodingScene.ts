import { Circle, Line, Node, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  easeInOutCubic,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { RBT_FOUR_NODE } from "../../lessons/exampleData";
import { RED_BLACK_SEGMENTS, requireBeats } from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";
import {
  makeEquationLedger,
  makeFullFrameTreatment,
  makeSplitScreen,
  silentHold,
} from "./scenePresentation";

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

const LEFT_X = 0;
const RIGHT_X = 0;
const CLUSTER_Y = -20;
const NODE_R = 30;
const CELL_W = 62;
const SCENE_ID = "red-black-encoding";

/** Slot for the i-th key inside the left panel's 2–3–4 box. */
const cellX = (index: number, count: number): number =>
  LEFT_X + (index - (count - 1) / 2) * CELL_W;

function makeKeyCell(key: number, pos: Vector2): Node {
  const group = new Node({
    key: `semantic:red-black:key-cell:${key}`,
    position: pos,
    opacity: 0,
  });
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
  const group = new Node({
    key: `semantic:red-black:binary-node:${key}`,
    position: pos,
    opacity: 0,
  });
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

  const split = makeSplitScreen({
    gap: 42,
    leftKey: "semantic:red-black:multiway-panel",
    rightKey: "semantic:red-black:binary-panel",
  });
  view.add(split.node);

  const ledger = makeEquationLedger(
    [
      { id: "state", label: "state", value: "one key" },
      { id: "encoding", label: "encoding", value: "black representative" },
      { id: "invariant", label: "invariant", value: "", color: ROLE.selected },
    ],
    {
      position: new Vector2(0, 205),
      width: 560,
      rowHeight: 30,
      key: "semantic:red-black:ledger",
    },
  );
  view.add(ledger.node);
  const title = ledger.row("state").value;
  const caption = ledger.row("encoding").value;
  const bhLabel = ledger.row("invariant").value;
  bhLabel.opacity(0);

  const prediction = makeFullFrameTreatment(
    `Which key rises? Does the binary tree move—or recolour?`,
    { kind: "prediction", key: "presentation:red-black:prediction" },
  );
  view.add(prediction.node);

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
  const rep = makeCircleNode(
    KEYS[1]!,
    new Vector2(RIGHT_X, CLUSTER_Y - 46),
    false,
  );
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

  const marker = makeSmallLabel(
    "▲ the break is now here",
    new Vector2(RIGHT_X, CLUSTER_Y - 118),
    ROLE.transformed,
  );

  split.right.add(edgeLeft);
  split.right.add(edgeRight);
  split.right.add(edge35);
  split.right.add(clusterRing);
  split.right.add(red35);
  for (const cell of cells) split.left.add(cell);
  split.left.add(arrivingCell);
  split.right.add(rep);
  split.right.add(redLeft);
  split.right.add(redRight);
  split.left.add(panelLeft);
  split.right.add(panelRight);
  split.right.add(marker);

  function* show(node: Node, on: boolean, duration = 0.5) {
    yield* node.opacity(on ? 1 : 0, duration, easeInOutCubic);
  }

  // Establishing frame: one key and its binary representative.
  title.text("one key");
  caption.text("one black representative");
  cells[1]!.opacity(1);
  cells[1]!.position(new Vector2(LEFT_X, CLUSTER_Y));
  rep.opacity(1);
  panelLeft.opacity(1);
  panelRight.opacity(1);

  const beats = (segmentId: string) => requireBeats(SCENE_ID, segmentId);

  const bodies: Record<string, () => ThreadGenerator> = {
    *establish() {
      const b = beats("establish");
      yield* silentHold(b.hold!);
    },

    *["encode-2node"]() {
      title.text("2-node");
      caption.text("one key ↔ black node");
      const b = beats("encode-2node");
      yield* show(clusterRing, true, b.ringIn!);
      yield* silentHold(b.hold!);
    },

    *["encode-3node"]() {
      title.text("3-node");
      caption.text("extra key ↔ red child");
      const b = beats("encode-3node");
      yield* all(
        cells[1]!.position(
          new Vector2(cellX(1, 2), CLUSTER_Y),
          b.reposition!,
          easeInOutCubic,
        ),
        cells[0]!.position(new Vector2(cellX(0, 2), CLUSTER_Y), b.reposition!),
      );
      yield* all(
        show(cells[0]!, true, b.childIn!),
        show(edgeLeft, true, b.childIn!),
      );
      yield* show(redLeft, true, b.colourIn!);
      yield* silentHold(b.hold!);
    },

    *["encode-4node"]() {
      title.text("4-node");
      caption.text("two extra keys ↔ two reds");
      const b = beats("encode-4node");
      yield* all(
        cells[0]!.position(
          new Vector2(cellX(0, 3), CLUSTER_Y),
          b.reposition!,
          easeInOutCubic,
        ),
        cells[1]!.position(
          new Vector2(cellX(1, 3), CLUSTER_Y),
          b.reposition!,
          easeInOutCubic,
        ),
      );
      yield* all(
        show(cells[2]!, true, b.childIn!),
        show(edgeRight, true, b.childIn!),
      );
      yield* show(redRight, true, b.colourIn!);
      yield* silentHold(b.hold!);
    },

    *["read-off-r2"]() {
      title.text("red means same multiway node");
      caption.text("red-under-red would merge levels");
      const b = beats("read-off-r2");
      yield* silentHold(b.hold!);
    },

    *["read-off-r3"]() {
      title.text("black counts levels");
      caption.text("reds add keys, not height");
      bhLabel.text("black height=1");
      const b = beats("read-off-r3");
      yield* show(bhLabel, true, b.labelIn!);
      yield* silentHold(b.hold!);
    },

    *overflow() {
      title.text(`overflow: +${ARRIVING}`);
      caption.text("full node must split");
      const b = beats("overflow");
      yield* all(
        show(bhLabel, false, b.arrival!),
        show(arrivingCell, true, b.arrival!),
      );
      yield* split.node.opacity(0, b.settle! * 0.25);
      yield* prediction.show(b.settle! * 0.25);
      yield* silentHold(b.settle! * 0.5);
      yield* silentHold(b.think!);
    },

    *["split-is-recolour"]() {
      title.text(`promote ${PROMOTED}`);
      caption.text("split ↔ colour flip");
      const b = beats("split-is-recolour");
      yield* prediction.hide(b.split! * 0.2);
      yield* split.node.opacity(1, b.split! * 0.2);
      const revealMotion = b.split! * 0.6;
      yield* all(
        cells[1]!.position(
          new Vector2(LEFT_X, CLUSTER_Y - 96),
          revealMotion,
          easeInOutCubic,
        ),
        cells[0]!.position(
          new Vector2(LEFT_X - 70, CLUSTER_Y + 52),
          revealMotion,
          easeInOutCubic,
        ),
        cells[2]!.position(
          new Vector2(LEFT_X + 70, CLUSTER_Y + 52),
          revealMotion,
          easeInOutCubic,
        ),
        paintTween(rep, true, revealMotion),
        paintTween(redLeft, false, revealMotion),
        paintTween(redRight, false, revealMotion),
      );
      yield* silentHold(b.settle!);
      caption.text(`${ARRIVING} joins ${KEYS[2]} as red`);
      yield* all(
        arrivingCell.position(
          new Vector2(LEFT_X + 70 - (CELL_W - 6) / 2 - 3, CLUSTER_Y + 52),
          b.insert!,
          easeInOutCubic,
        ),
        cells[2]!.position(
          new Vector2(LEFT_X + 70 + (CELL_W - 6) / 2 + 3, CLUSTER_Y + 52),
          b.insert!,
          easeInOutCubic,
        ),
      );
      yield* all(
        show(edge35, true, b.relationIn!),
        show(red35, true, b.relationIn!),
      );
      yield* silentHold(b.hold!);
    },

    *["invariant-held"]() {
      title.text("split complete");
      caption.text("colours changed · count did not");
      bhLabel.text("black height still 1");
      const b = beats("invariant-held");
      yield* show(bhLabel, true, b.labelIn!);
      yield* silentHold(b.hold!);
    },

    *["violation-moves-up"]() {
      title.text("repair moves upward");
      caption.text("red representative joins parent");
      const b = beats("violation-moves-up");
      yield* show(marker, true, b.markerIn!);
      yield* silentHold(b.hold!);
    },

    *["root-split"]() {
      title.text("root has no parent");
      caption.text("force root black");
      bhLabel.text("black height=2 on every path");
      const b = beats("root-split");
      yield* all(
        paintTween(rep, false, b.recolour!),
        show(marker, false, b.recolour!),
      );
      yield* silentHold(b.hold!);
    },
  };

  for (const segment of RED_BLACK_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `red-black-encoding.${segment.id}`,
    );
  }
});
