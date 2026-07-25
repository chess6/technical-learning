import { Line, Node, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { makeFocusRig } from "../../guided-scenes/scenes/kitMotion";
import { beginProbeRun, registerProbe } from "../probes/probeRegistry";
import { abSplitManifest as manifest } from "../manifests/abSplit";
import { makeEventLogger, runReplicaBeats } from "./replicaKit";
import {
  AB_COLORS as C,
  AB_LAYOUT_CONSTANTS,
  keyPositions,
  layoutAbTree,
  stageById,
  type AbNode,
} from "./data/abTreeReplicaData";

/**
 * Reconstruction of the (a,b)-tree overflow -> split -> cascade excerpt,
 * from observation. The load-bearing grammar being reproduced:
 *
 *  - KEY TOKENS PERSIST: every key is one Txt node for the whole excerpt;
 *    structural steps move keys, never fade them.
 *  - BORDERS ARE DISPOSABLE: node outlines swap at splits (full border out,
 *    two half borders pulling apart) while the keys travel.
 *  - LEAF ROW PINNED: layout is computed from the leaf row upward, so root
 *    splits grow the tree UP while leaves never move.
 *  - RED IS RESERVED: only the violating node and the arriving key are red.
 *  - CAMERA AS ARGUMENT: the validity beats reframe onto the relevant nodes
 *    with everything else dimmed.
 */

const ID = manifest.id;
const FONT = "'Source Sans 3', 'Segoe UI', system-ui, sans-serif";
const KEY_FONT = 34;
const BORDER_H = 62;
const LEAF_SIZE = 22;

interface BorderSpec {
  x: number;
  y: number;
  width: number;
}

/** Border rect spec for the node containing `sampleKey` in `stage`. */
function borderFor(stage: AbNode, sampleKey: number): BorderSpec {
  const layout = layoutAbTree(stage);
  for (const entry of layout.values()) {
    if (entry.keys.includes(sampleKey)) {
      return {
        x: entry.x,
        y: entry.y,
        width: entry.keys.length * AB_LAYOUT_CONSTANTS.keySpacing + 34,
      };
    }
  }
  throw new Error(`No node containing key ${sampleKey}`);
}

/** Edge segments (parent bottom -> child top) for a stage. */
function edgesFor(stage: AbNode): { from: Vector2; to: Vector2 }[] {
  const layout = layoutAbTree(stage);
  const out: { from: Vector2; to: Vector2 }[] = [];
  const walk = (n: AbNode): void => {
    const parent = layout.get(n)!;
    for (const child of n.children) {
      const c = layout.get(child)!;
      out.push({
        from: new Vector2(parent.x, parent.y + BORDER_H / 2),
        to: new Vector2(c.x, c.y - BORDER_H / 2),
      });
      walk(child);
    }
    if (n.children.length === 0) {
      for (const leafX of parent.leafXs) {
        out.push({
          from: new Vector2(parent.x, parent.y + BORDER_H / 2),
          to: new Vector2(leafX, AB_LAYOUT_CONSTANTS.leafY - LEAF_SIZE / 2),
        });
      }
    }
  };
  walk(stage);
  return out;
}

/** Leaf-square x positions for a stage, left to right. */
function leafXsFor(stage: AbNode): number[] {
  const layout = layoutAbTree(stage);
  const xs: number[] = [];
  for (const entry of layout.values()) xs.push(...entry.leafXs);
  return xs.sort((a, b) => a - b);
}

export const abSplitReplicaScene = makeScene2D(function* (view) {
  view.fill("#0a0d11");
  beginProbeRun(ID);
  const logEvent = makeEventLogger(manifest);

  const rig = makeFocusRig();
  view.add(rig.world);

  // --- persistent section title (inside the world, as observed) -------------
  const title = new Txt({
    text: "Insertion",
    fontFamily: FONT,
    fontStyle: "italic",
    fontSize: 44,
    fill: C.stroke,
    position: new Vector2(0, -166),
  });
  const titleUnderline = new Line({
    stroke: C.stroke,
    lineWidth: 2,
    points: [new Vector2(-96, -138), new Vector2(96, -138)],
  });
  const titleGroup = new Node({});
  titleGroup.add(title);
  titleGroup.add(titleUnderline);
  // Title anchor probe reports the manifest's landmark point.
  titleGroup.position(new Vector2(0, 0));
  rig.world.add(titleGroup);

  // --- persistent key tokens --------------------------------------------------
  const dim = createSignal(0); // 1 = dim everything outside the camera focus
  const keyTokens = new Map<number, Txt>();
  const keyRed = new Map<number, ReturnType<typeof createSignal<number>>>();
  const startPositions = keyPositions(stageById("overflow"));
  for (let key = 0; key <= 9; key += 1) {
    const red = createSignal(0);
    keyRed.set(key, red);
    const token = new Txt({
      text: String(key),
      fontFamily: FONT,
      fontSize: KEY_FONT,
      fill: () => (red() > 0.5 ? C.violation : C.key),
      opacity: key <= 7 ? 1 : 0,
    });
    const at = startPositions[key];
    if (at) token.position(new Vector2(at.x, at.y));
    keyTokens.set(key, token);
  }

  // --- disposable borders ------------------------------------------------------
  interface LiveBorder {
    rect: Rect;
    violated: ReturnType<typeof createSignal<number>>;
  }
  const borderLayer = new Node({});
  const edgeLayer = new Node({ opacity: 0.9 });
  const leafLayer = new Node({});
  rig.world.add(edgeLayer);
  rig.world.add(borderLayer);
  rig.world.add(leafLayer);
  for (const token of keyTokens.values()) rig.world.add(token);

  function makeBorder(spec: BorderSpec): LiveBorder {
    const violated = createSignal(0);
    const rect = new Rect({
      width: spec.width,
      height: BORDER_H,
      radius: 26,
      stroke: () => (violated() > 0.5 ? C.violation : C.stroke),
      lineWidth: 3,
      position: new Vector2(spec.x, spec.y),
      opacity: 0,
    });
    borderLayer.add(rect);
    return { rect, violated };
  }

  // --- leaf squares --------------------------------------------------------------
  const leafSquares: Rect[] = [];
  function syncLeafSquares(xs: number[], fadeNew: boolean): ThreadGenerator[] {
    const tweens: ThreadGenerator[] = [];
    xs.forEach((x, i) => {
      if (i < leafSquares.length) {
        tweens.push(
          leafSquares[i]!.position(
            new Vector2(x, AB_LAYOUT_CONSTANTS.leafY),
            0.8,
            easeInOutCubic,
          ),
        );
        return;
      }
      const square = new Rect({
        width: LEAF_SIZE,
        height: LEAF_SIZE,
        stroke: C.stroke,
        lineWidth: 2.5,
        position: new Vector2(x, AB_LAYOUT_CONSTANTS.leafY),
        opacity: 0,
      });
      leafSquares.push(square);
      leafLayer.add(square);
      tweens.push(square.opacity(1, fadeNew ? 0.5 : 0));
    });
    return tweens;
  }

  // --- edges: rebuilt per stage (plumbing, allowed to swap) ----------------------
  function setEdges(stage: AbNode): void {
    edgeLayer.removeChildren();
    for (const edge of edgesFor(stage)) {
      edgeLayer.add(
        new Line({
          stroke: C.stroke,
          lineWidth: 2,
          opacity: 0.75,
          points: [edge.from, edge.to],
        }),
      );
    }
  }

  // --- initial state: the frozen overflow stage -----------------------------------
  const overflowStage = stageById("overflow");
  setEdges(overflowStage);
  yield* all(...syncLeafSquares(leafXsFor(overflowStage), false));
  const bRoot = makeBorder(borderFor(overflowStage, 1));
  const b0 = makeBorder(borderFor(overflowStage, 0));
  const b2 = makeBorder(borderFor(overflowStage, 2));
  const b4567 = makeBorder(borderFor(overflowStage, 4));
  bRoot.rect.opacity(1);
  b0.rect.opacity(1);
  b2.rect.opacity(1);
  b4567.rect.opacity(1);
  b4567.violated(1);
  for (const key of [4, 5, 6, 7]) keyRed.get(key)!(1);

  // --- pause overlay (screen-fixed, outside the rig) -------------------------------
  const overlay = new Node({ opacity: 0 });
  overlay.add(
    new Rect({ width: 960, height: 540, fill: "rgba(4,7,10,0.55)" }),
  );
  const pauseMarker = new Rect({
    width: 18,
    height: 30,
    fill: C.stroke,
    radius: 4,
    position: new Vector2(-200, 190),
  });
  overlay.add(
    new Line({
      stroke: C.stroke,
      lineWidth: 3,
      opacity: 0.7,
      points: [new Vector2(-200, 190), new Vector2(200, 190)],
    }),
  );
  overlay.add(pauseMarker);
  view.add(overlay);

  // --- annotations ------------------------------------------------------------------
  const validityNote = new Txt({
    text: "⌊(b+1)/2⌋ ≥ a",
    fontFamily: FONT,
    fontSize: 30,
    fill: C.annotation,
    position: new Vector2(-49, 78),
    opacity: 0,
  });
  rig.world.add(validityNote);
  const rootNoteGroup = new Node({ opacity: 0 });
  rootNoteGroup.add(
    new Txt({
      text: "2 children",
      fontFamily: FONT,
      fontSize: 30,
      fill: C.annotation,
      position: new Vector2(-215, -89),
    }),
  );
  rootNoteGroup.add(
    new Line({
      stroke: C.annotation,
      lineWidth: 3,
      endArrow: true,
      arrowSize: 12,
      points: [new Vector2(-140, -89), new Vector2(-92, -89)],
    }),
  );
  rig.world.add(rootNoteGroup);

  // Dim layer applies to non-focused content during camera beats.
  const dimmable = [edgeLayer, leafLayer, b0.rect, b2.rect] as const;
  for (const node of dimmable) {
    const base = node.opacity();
    node.opacity(() => base * (1 - dim() * 0.75));
  }

  // --- probes --------------------------------------------------------------------
  registerProbe(ID, "title", () => ({
    x: title.position().x,
    y: title.position().y,
    opacity: title.opacity(),
    width: 220,
    height: 50,
    text: title.text(),
  }));
  registerProbe(ID, "pause-overlay", () => ({
    x: pauseMarker.position().x,
    y: pauseMarker.position().y,
    opacity: overlay.opacity(),
  }));
  const keyProbe = (key: number) => {
    const token = keyTokens.get(key)!;
    return () => ({
      x: token.position().x,
      y: token.position().y,
      opacity: token.opacity(),
      width: 30,
      height: 40,
      value: key,
      text: String(key),
    });
  };
  // Node probes anchor on a representative persistent key of the node.
  registerProbe(ID, "root-node", () => {
    const token = keyTokens.get(1)!;
    return {
      x: bRoot.rect.position().x,
      y: bRoot.rect.position().y,
      opacity: Math.max(bRoot.rect.opacity(), token.opacity()),
    };
  });
  registerProbe(ID, "new-root", () => {
    const token = keyTokens.get(3)!;
    return { x: token.position().x, y: token.position().y, opacity: token.opacity() };
  });
  registerProbe(ID, "node-0", keyProbe(0));
  registerProbe(ID, "node-2", keyProbe(2));
  registerProbe(ID, "node-4567", () => {
    const token = keyTokens.get(5)!;
    return {
      x: b4567.rect.position().x,
      y: b4567.rect.position().y,
      opacity: b4567.rect.opacity() * token.opacity(),
    };
  });
  registerProbe(ID, "key-4", keyProbe(4));
  registerProbe(ID, "key-5", keyProbe(5));
  registerProbe(ID, "key-67", keyProbe(7));
  registerProbe(ID, "key-89", keyProbe(9));
  registerProbe(ID, "leaf-row", () => {
    const first = leafSquares[0]!;
    return {
      x: first.position().x,
      y: first.position().y,
      opacity: first.opacity(),
      width: LEAF_SIZE,
      height: LEAF_SIZE,
    };
  });
  registerProbe(ID, "validity-note", () => ({
    x: validityNote.position().x,
    y: validityNote.position().y,
    opacity: validityNote.opacity(),
    width: 190,
    height: 36,
    text: validityNote.text(),
  }));
  registerProbe(ID, "root-note", () => ({
    x: -215,
    y: -89,
    opacity: rootNoteGroup.opacity(),
    width: 150,
    height: 36,
    text: "2 children",
  }));
  registerProbe(ID, "camera-rig", () => ({
    x: rig.focus().x,
    y: rig.focus().y,
    opacity: 1,
    scale: rig.scale(),
  }));

  // --- shared structural moves ------------------------------------------------------
  function* moveKeysToStage(stage: AbNode, duration: number): ThreadGenerator {
    const targets = keyPositions(stage);
    const tweens: ThreadGenerator[] = [];
    for (const [key, token] of keyTokens) {
      const target = targets[key];
      if (!target) continue;
      const current = token.position();
      if (Math.abs(current.x - target.x) > 0.5 || Math.abs(current.y - target.y) > 0.5) {
        tweens.push(
          token.position(new Vector2(target.x, target.y), duration, easeInOutCubic),
        );
      }
    }
    tweens.push(...syncLeafSquares(leafXsFor(stage), true));
    yield* all(...tweens);
    setEdges(stage);
  }

  /** Split choreography: swap one border for two pulling-apart halves. */
  function* splitBorders(
    dying: LiveBorder,
    stage: AbNode,
    leftKey: number,
    rightKey: number,
  ): ThreadGenerator {
    const leftSpec = borderFor(stage, leftKey);
    const rightSpec = borderFor(stage, rightKey);
    const centre = dying.rect.position();
    const left = makeBorder({ ...leftSpec });
    const right = makeBorder({ ...rightSpec });
    left.rect.position(centre);
    right.rect.position(centre);
    dying.rect.opacity(0);
    left.rect.opacity(1);
    right.rect.opacity(1);
    yield* all(
      left.rect.position(new Vector2(leftSpec.x, leftSpec.y), 1.0, easeInOutCubic),
      left.rect.width(leftSpec.width, 1.0, easeInOutCubic),
      right.rect.position(new Vector2(rightSpec.x, rightSpec.y), 1.0, easeInOutCubic),
      right.rect.width(rightSpec.width, 1.0, easeInOutCubic),
    );
    newBorders.push(left, right);
  }
  const newBorders: LiveBorder[] = [];

  // Borders created later, tracked for stage moves.
  let b67: LiveBorder | null = null;

  const bodies: Record<string, () => ThreadGenerator> = {
    // [299.0-310.6) frozen violating tree under the pause overlay.
    *"pause-prompt"() {
      yield* waitFor(0.7);
      logEvent("pause-begins"); // 0.7
      yield* overlay.opacity(1, 0.4);
      yield* pauseMarker.position(new Vector2(200, 190), 9.6);
      yield* overlay.opacity(0, 0.5);
    },
    // [310.6-317.9) split: the middle key rises.
    *"split-rise"() {
      yield* waitFor(2.0);
      logEvent("split-starts"); // 2.0
      const afterSplit = stageById("after-split");
      // Halves pull apart while keys 4 / 6,7 ride along.
      const splitRun = splitBorders(b4567, afterSplit, 4, 7);
      const targets = keyPositions(afterSplit);
      yield* all(
        splitRun,
        keyTokens.get(4)!.position(
          new Vector2(targets[4]!.x, targets[4]!.y),
          1.0,
          easeInOutCubic,
        ),
        keyTokens.get(6)!.position(
          new Vector2(targets[6]!.x, targets[6]!.y),
          1.0,
          easeInOutCubic,
        ),
        keyTokens.get(7)!.position(
          new Vector2(targets[7]!.x, targets[7]!.y),
          1.0,
          easeInOutCubic,
        ),
      );
      b67 = newBorders[newBorders.length - 1]!;
      yield* waitFor(0.4);
      logEvent("middle-key-rises"); // 3.4
      // Key 5 travels up into the root; root border widens; neighbours shift.
      const rootSpec = borderFor(afterSplit, 1);
      yield* all(
        keyTokens.get(5)!.position(
          new Vector2(targets[5]!.x, targets[5]!.y),
          1.2,
          easeInOutCubic,
        ),
        keyTokens.get(1)!.position(
          new Vector2(targets[1]!.x, targets[1]!.y),
          1.2,
          easeInOutCubic,
        ),
        keyTokens.get(3)!.position(
          new Vector2(targets[3]!.x, targets[3]!.y),
          1.2,
          easeInOutCubic,
        ),
        bRoot.rect.width(rootSpec.width, 1.2, easeInOutCubic),
        bRoot.rect.position(new Vector2(rootSpec.x, rootSpec.y), 1.2, easeInOutCubic),
      );
      // Violation resolved: red retires.
      for (const key of [4, 5, 6, 7]) yield* keyRed.get(key)!(0, 0.3);
      setEdges(afterSplit);
      yield* moveKeysToStage(afterSplit, 0.6);
    },
    // [317.9-326.7) hold; the cascade rule is stated.
    *"cascade-note"() {
      logEvent("cascade-rule-stated"); // 0.0
      yield* waitFor(8.0);
    },
    // [326.7-340.6) inserts 8 and 9; splits cascade to a NEW root.
    *"more-inserts"() {
      yield* waitFor(1.8);
      logEvent("insert-8"); // 1.8
      const after8 = stageById("after-insert-8");
      const targets8 = keyPositions(after8);
      const key8 = keyTokens.get(8)!;
      key8.position(new Vector2(targets8[8]!.x, targets8[8]!.y - 150));
      keyRed.get(8)!(1);
      yield* key8.opacity(1, 0.25);
      yield* all(
        key8.position(new Vector2(targets8[8]!.x, targets8[8]!.y), 0.7, easeInOutCubic),
        b67!.rect.width(borderFor(after8, 7).width, 0.7, easeInOutCubic),
        b67!.rect.position(
          new Vector2(borderFor(after8, 7).x, borderFor(after8, 7).y),
          0.7,
          easeInOutCubic,
        ),
      );
      yield* keyRed.get(8)!(0, 0.3);
      yield* moveKeysToStage(after8, 0.6);
      yield* waitFor(1.65);
      logEvent("insert-9-overflow"); // 5.3
      const after9 = stageById("after-inserts");
      const targets9 = keyPositions(after9);
      const key9 = keyTokens.get(9)!;
      key9.position(new Vector2(targets9[9]!.x, targets9[9]!.y - 150));
      keyRed.get(9)!(1);
      yield* key9.opacity(1, 0.25);
      yield* all(
        key9.position(new Vector2(targets9[9]!.x, targets9[9]!.y), 0.7, easeInOutCubic),
        b67!.rect.width(borderFor(after9, 7).width, 0.7, easeInOutCubic),
        b67!.rect.position(
          new Vector2(borderFor(after9, 7).x, borderFor(after9, 7).y),
          0.7,
          easeInOutCubic,
        ),
      );
      b67!.violated(1);
      for (const key of [6, 7, 8, 9]) keyRed.get(key)!(1);
      yield* moveKeysToStage(after9, 0.5);
      yield* waitFor(1.05);
      logEvent("cascade-split"); // 7.8
      const cascade = stageById("cascade");
      const cascadeTargets = keyPositions(cascade);
      const splitRun = splitBorders(b67!, cascade, 6, 9);
      yield* all(
        splitRun,
        keyTokens.get(7)!.position(
          new Vector2(cascadeTargets[7]!.x, cascadeTargets[7]!.y),
          1.2,
          easeInOutCubic,
        ),
      );
      for (const key of [6, 8, 9]) yield* keyRed.get(key)!(0, 0.2);
      // Root is now overfull.
      bRoot.violated(1);
      for (const key of [1, 3, 5, 7]) keyRed.get(key)!(1);
      const rootSpec = borderFor(cascade, 1);
      yield* all(
        bRoot.rect.width(rootSpec.width, 0.5, easeInOutCubic),
        bRoot.rect.position(new Vector2(rootSpec.x, rootSpec.y), 0.5, easeInOutCubic),
      );
      yield* moveKeysToStage(cascade, 0.5);
      logEvent("root-splits-up"); // ~10.3
      const grown = stageById("grown");
      const grownTargets = keyPositions(grown);
      const rootSplit = splitBorders(bRoot, grown, 1, 7);
      const newRootSpec = borderFor(grown, 3);
      const bNewRoot = makeBorder(newRootSpec);
      yield* all(
        rootSplit,
        keyTokens.get(3)!.position(
          new Vector2(grownTargets[3]!.x, grownTargets[3]!.y),
          1.2,
          easeInOutCubic,
        ),
        bNewRoot.rect.opacity(1, 0.8),
      );
      for (const key of [1, 3, 5, 7]) yield* keyRed.get(key)!(0, 0.15);
      bRoot.violated(0);
      yield* moveKeysToStage(grown, 0.7);
    },
    // [340.6-357.0) camera zooms to the split halves; validity annotated.
    *"split-validity"() {
      yield* waitFor(1.6);
      logEvent("zoom-to-halves"); // 1.6
      const camera = manifest.beats.find((b) => b.id === "split-validity")!.camera;
      yield* all(
        rig.focusOn(camera.target!, camera.target!.scale!, 1.6),
        dim(1, 1.6),
      );
      yield* waitFor(2.8);
      logEvent("validity-annotated"); // 6.0
      yield* validityNote.opacity(1, 0.7);
      yield* waitFor(9.0);
    },
    // [357.0-366.0) reframe on the root; count its two children.
    *"root-validity"() {
      logEvent("reframe-root"); // 0.0
      const camera = manifest.beats.find((b) => b.id === "root-validity")!.camera;
      yield* all(
        rig.focusOn(camera.target!, camera.target!.scale!, 1.4),
        validityNote.opacity(0, 0.6),
      );
      yield* rootNoteGroup.opacity(1, 0.7);
      yield* waitFor(6.5);
    },
  };

  yield* runReplicaBeats(manifest, bodies);
});
