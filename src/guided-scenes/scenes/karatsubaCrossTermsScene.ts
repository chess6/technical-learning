import { Circle, Latex, Line, Node, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { KARATSUBA_CLEAN, KARATSUBA_BOUNDARY } from "../../lessons/karatsubaData";
import { karatsubaStep, leafCount, recursionTree, type TreeNode } from "../../math";
import { KARATSUBA_SEGMENTS, requireBeats } from "./sceneTimings";
import { ROLE, makeOverlayLabel, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";

/**
 * Watch scene for Karatsuba: weighted multiplication rectangle → shared middle
 * weight → separate auxiliary coefficient rectangle → reconstruction → carry vs
 * width → conceptual recurrence trees. Numbers come from karatsubaData and math
 * helpers (karatsubaStep / recursionTree / leafCount) — the scene only maps them
 * to the canvas.
 *
 * Region → role color mapping (shared with the explorer, do not change):
 *   AC = basis1, AD = selected, BC = transformed, BD = basis2.
 */

const SCENE_ID = "karatsuba-cross-terms";

const CLEAN = karatsubaStep(KARATSUBA_CLEAN.x, KARATSUBA_CLEAN.y, KARATSUBA_CLEAN.m);
const BOUNDARY = karatsubaStep(
  KARATSUBA_BOUNDARY.x,
  KARATSUBA_BOUNDARY.y,
  KARATSUBA_BOUNDARY.m,
);

/** Closed rectangle corners in scene pixels (origin at center of rect). */
function rectCorners(
  cx: number,
  cy: number,
  w: number,
  h: number,
): Vector2[] {
  const hw = w / 2;
  const hh = h / 2;
  return [
    new Vector2(cx - hw, cy - hh),
    new Vector2(cx + hw, cy - hh),
    new Vector2(cx + hw, cy + hh),
    new Vector2(cx - hw, cy + hh),
  ];
}

function makeRegion(color: string, opacity = 0.55): Line {
  return new Line({
    closed: true,
    fill: color,
    stroke: color,
    lineWidth: 2,
    opacity,
    points: [new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1)],
  });
}

/**
 * Region name inside a solid FOIL tile. No glyph stroke — the dark halo from
 * makeLabel/makeOverlayLabel reads as bold+blur on filled regions.
 */
function makeRegionLabel(text: string, pos: Vector2, fontSize = 22): Txt {
  return new Txt({
    text,
    fill: ROLE.text,
    fontSize,
    fontWeight: 500,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    position: pos,
    opacity: 0,
  });
}

/** Short title above a rectangle — light outline only, not a thick halo. */
function makePanelTitle(text: string, color: string, fontSize: number): Txt {
  return new Txt({
    text,
    fill: color,
    stroke: ROLE.background,
    lineWidth: 2,
    strokeFirst: true,
    fontSize,
    fontWeight: 600,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
  });
}

interface TreeLayout {
  readonly nodes: Vector2[];
  readonly edges: [Vector2, Vector2][];
  /** Positions of the bottom row only — the row the exponent beat is about. */
  readonly leafPoints: Vector2[];
  readonly leaves: number;
}

/**
 * Lay out a conceptual recursion tree from the shared `recursionTree` structure.
 * Leaf count is taken from `leafCount` so the drawing and any caption agree.
 */
function layoutTree(
  branch: 3 | 4,
  depth: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
): TreeLayout {
  const tree = recursionTree(branch, depth);
  const nodes: Vector2[] = [];
  const edges: [Vector2, Vector2][] = [];
  const leafPoints: Vector2[] = [];
  const levelY = (level: number) =>
    depth === 0 ? top : top + (level * (bottom - top)) / depth;

  function walk(node: TreeNode, level: number, x0: number, x1: number): Vector2 {
    const point = new Vector2((x0 + x1) / 2, levelY(level));
    nodes.push(point);
    if (node.children.length === 0) leafPoints.push(point);
    if (node.children.length > 0) {
      const span = (x1 - x0) / node.children.length;
      node.children.forEach((child, i) => {
        const childPoint = walk(child, level + 1, x0 + i * span, x0 + (i + 1) * span);
        edges.push([point, childPoint]);
      });
    }
    return point;
  }

  walk(tree, 0, left, right);
  return { nodes, edges, leafPoints, leaves: leafCount(branch, depth) };
}

/**
 * Build a tree, keeping the LEAF dots addressable.
 *
 * The `exponent` beat promised a leaf-row pulse and delivered an
 * `opacity(1 → 1)` no-op, leaving the scene's climax as caption text over a
 * still picture. Returning the leaf circles is what lets that beat actually
 * touch the row it is about.
 */
function buildTree(
  layout: TreeLayout,
  color: string,
): { group: Node; leafDots: Circle[] } {
  const group = new Node({ opacity: 0 });
  for (const [a, b] of layout.edges) {
    group.add(
      new Line({ points: [a, b], stroke: color, lineWidth: 1, opacity: 0.5 }),
    );
  }
  const leafKeys = new Set(layout.leafPoints.map((p) => `${p.x},${p.y}`));
  const leafDots: Circle[] = [];
  for (const point of layout.nodes) {
    const isLeaf = leafKeys.has(`${point.x},${point.y}`);
    const dot = new Circle({ position: point, size: 4, fill: color });
    group.add(dot);
    if (isLeaf) leafDots.push(dot);
  }
  return { group, leafDots };
}

export const karatsubaCrossTermsScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  // ---------------------------------------------------------------------------
  // Weighted multiplication rectangle (12×13), left side, own scale.
  // ---------------------------------------------------------------------------
  const weightedGroup = new Node({});
  view.add(weightedGroup);

  // Keep the teaching geometry inside a clear mid-band so top titles and the
  // bottom caption never share pixels with the rectangles (caption wraps up).
  const W_ORIGIN = new Vector2(-250, 10);
  const W_SCALE = 16; // pixels per unit — sized to leave caption/title bands clear
  const wW = CLEAN.x * W_SCALE;
  const wH = CLEAN.y * W_SCALE;
  const splitX = 10 * W_SCALE; // place-value split (10A | B)
  const splitY = 10 * W_SCALE; // place-value split (10C | D)
  const left = W_ORIGIN.x - wW / 2;
  const wx0 = left;
  const wy0 = W_ORIGIN.y - wH / 2;

  // AC top-left (high×high), AD bottom-left, BC top-right, BD bottom-right.
  const acPts = [
    new Vector2(wx0, wy0),
    new Vector2(wx0 + splitX, wy0),
    new Vector2(wx0 + splitX, wy0 + splitY),
    new Vector2(wx0, wy0 + splitY),
  ];
  const adPts = [
    new Vector2(wx0, wy0 + splitY),
    new Vector2(wx0 + splitX, wy0 + splitY),
    new Vector2(wx0 + splitX, wy0 + wH),
    new Vector2(wx0, wy0 + wH),
  ];
  const bcPts = [
    new Vector2(wx0 + splitX, wy0),
    new Vector2(wx0 + wW, wy0),
    new Vector2(wx0 + wW, wy0 + splitY),
    new Vector2(wx0 + splitX, wy0 + splitY),
  ];
  const bdPts = [
    new Vector2(wx0 + splitX, wy0 + splitY),
    new Vector2(wx0 + wW, wy0 + splitY),
    new Vector2(wx0 + wW, wy0 + wH),
    new Vector2(wx0 + splitX, wy0 + wH),
  ];

  const outline = new Line({
    closed: true,
    stroke: ROLE.text,
    lineWidth: 3,
    fill: null,
    opacity: 1,
    points: rectCorners(W_ORIGIN.x, W_ORIGIN.y, wW, wH),
  });
  weightedGroup.add(outline);

  const ac = makeRegion(ROLE.basis1, 0);
  ac.points(acPts);
  const ad = makeRegion(ROLE.selected, 0);
  ad.points(adPts);
  const bc = makeRegion(ROLE.transformed, 0);
  bc.points(bcPts);
  const bd = makeRegion(ROLE.basis2, 0);
  bd.points(bdPts);
  weightedGroup.add(ac);
  weightedGroup.add(ad);
  weightedGroup.add(bc);
  weightedGroup.add(bd);

  // Use a light-outline title (not SAFE_WIDTH overlay): full-width overlays
  // centered at ±250 clipped past the stage edge.
  const weightedTitle = makePanelTitle("Weighted  12×13", ROLE.text, 26);
  weightedTitle.position(new Vector2(W_ORIGIN.x, wy0 - 28));
  weightedGroup.add(weightedTitle);

  // Region labels inside each subrectangle. They start as bare region names
  // (AC/AD/BC/BD) and gain their place-value weight during the weights beat.
  const acCenter = new Vector2(wx0 + splitX / 2, wy0 + splitY / 2);
  const adCenter = new Vector2(
    wx0 + splitX / 2,
    wy0 + splitY + (wH - splitY) / 2,
  );
  const bcCenter = new Vector2(
    wx0 + splitX + (wW - splitX) / 2,
    wy0 + splitY / 2,
  );
  const bdCenter = new Vector2(
    wx0 + splitX + (wW - splitX) / 2,
    wy0 + splitY + (wH - splitY) / 2,
  );
  const wLabelAC = makeRegionLabel("AC", acCenter);
  const wLabelAD = makeRegionLabel("AD", adCenter, 18);
  const wLabelBC = makeRegionLabel("BC", bcCenter, 18);
  const wLabelBD = makeRegionLabel("BD", bdCenter, 18);
  weightedGroup.add(wLabelAC);
  weightedGroup.add(wLabelAD);
  weightedGroup.add(wLabelBC);
  weightedGroup.add(wLabelBD);

  // Combined middle label shown when AD and BC collapse into one weighted term.
  // Sit just under the rectangle, still above the bottom caption band (~y 210+).
  const combinedMid = new Latex({
    tex: "10(AD+BC)",
    fill: ROLE.selected,
    fontSize: 24,
    position: new Vector2(W_ORIGIN.x, wy0 + wH + 22),
    opacity: 0,
  });
  weightedGroup.add(combinedMid);

  // ---------------------------------------------------------------------------
  // Auxiliary coefficient rectangle (3×4), right side, own scale.
  // ---------------------------------------------------------------------------
  const auxGroup = new Node({});
  view.add(auxGroup);

  const A_ORIGIN = new Vector2(250, 10);
  const A_SCALE = 32;
  const aW = (CLEAN.a + CLEAN.b) * A_SCALE; // 3
  const aH = (CLEAN.c + CLEAN.d) * A_SCALE; // 4
  const aSplitX = CLEAN.a * A_SCALE;
  const aSplitY = CLEAN.c * A_SCALE;
  const ax0 = A_ORIGIN.x - aW / 2;
  const ay0 = A_ORIGIN.y - aH / 2;

  const auxOutline = new Line({
    closed: true,
    stroke: ROLE.original,
    lineWidth: 3,
    fill: null,
    opacity: 0,
    points: rectCorners(A_ORIGIN.x, A_ORIGIN.y, aW, aH),
  });
  auxGroup.add(auxOutline);

  const auxAc = makeRegion(ROLE.basis1, 0);
  auxAc.points([
    new Vector2(ax0, ay0),
    new Vector2(ax0 + aSplitX, ay0),
    new Vector2(ax0 + aSplitX, ay0 + aSplitY),
    new Vector2(ax0, ay0 + aSplitY),
  ]);
  const auxAd = makeRegion(ROLE.selected, 0);
  auxAd.points([
    new Vector2(ax0, ay0 + aSplitY),
    new Vector2(ax0 + aSplitX, ay0 + aSplitY),
    new Vector2(ax0 + aSplitX, ay0 + aH),
    new Vector2(ax0, ay0 + aH),
  ]);
  const auxBc = makeRegion(ROLE.transformed, 0);
  auxBc.points([
    new Vector2(ax0 + aSplitX, ay0),
    new Vector2(ax0 + aW, ay0),
    new Vector2(ax0 + aW, ay0 + aSplitY),
    new Vector2(ax0 + aSplitX, ay0 + aSplitY),
  ]);
  const auxBd = makeRegion(ROLE.basis2, 0);
  auxBd.points([
    new Vector2(ax0 + aSplitX, ay0 + aSplitY),
    new Vector2(ax0 + aW, ay0 + aSplitY),
    new Vector2(ax0 + aW, ay0 + aH),
    new Vector2(ax0 + aSplitX, ay0 + aH),
  ]);
  auxGroup.add(auxAc);
  auxGroup.add(auxAd);
  auxGroup.add(auxBc);
  auxGroup.add(auxBd);

  const auxLabelAC = makeRegionLabel(
    "AC",
    new Vector2(ax0 + aSplitX / 2, ay0 + aSplitY / 2),
    18,
  );
  const auxLabelAD = makeRegionLabel(
    "AD",
    new Vector2(ax0 + aSplitX / 2, ay0 + aSplitY + (aH - aSplitY) / 2),
    18,
  );
  const auxLabelBC = makeRegionLabel(
    "BC",
    new Vector2(ax0 + aSplitX + (aW - aSplitX) / 2, ay0 + aSplitY / 2),
    18,
  );
  const auxLabelBD = makeRegionLabel(
    "BD",
    new Vector2(
      ax0 + aSplitX + (aW - aSplitX) / 2,
      ay0 + aSplitY + (aH - aSplitY) / 2,
    ),
    18,
  );
  auxGroup.add(auxLabelAC);
  auxGroup.add(auxLabelAD);
  auxGroup.add(auxLabelBC);
  auxGroup.add(auxLabelBD);

  const auxTitle = makePanelTitle("Auxiliary  (A+B)×(C+D)", ROLE.original, 22);
  auxTitle.position(new Vector2(A_ORIGIN.x, ay0 - 26));
  auxTitle.opacity(0);
  auxGroup.add(auxTitle);

  // ---------------------------------------------------------------------------
  // Output-carrying diagram for 78×56 (replaces the weighted rect at that beat).
  // ---------------------------------------------------------------------------
  const carryGroup = new Node({ opacity: 0 });
  view.add(carryGroup);

  const cz2 = createSignal(BOUNDARY.z2); // 35
  const cz1 = createSignal(BOUNDARY.z1); // 82
  const cz0 = createSignal(BOUNDARY.z0); // 48

  const carryTitle = makePanelTitle("Output carrying: 78 × 56", ROLE.text, 26);
  carryTitle.position(new Vector2(0, -120));
  carryGroup.add(carryTitle);

  const carryBlocks: { sig: () => number; place: string; color: string; x: number }[] =
    [
      { sig: cz2, place: "z_2", color: ROLE.basis1, x: -150 },
      { sig: cz1, place: "z_1", color: ROLE.selected, x: 0 },
      { sig: cz0, place: "z_0", color: ROLE.basis2, x: 150 },
    ];
  for (const block of carryBlocks) {
    carryGroup.add(
      new Rect({
        x: block.x,
        y: 0,
        width: 100,
        height: 74,
        radius: 10,
        fill: block.color,
        opacity: 0.28,
        stroke: block.color,
        lineWidth: 2,
      }),
    );
    carryGroup.add(
      new Latex({
        tex: block.place,
        fill: ROLE.textMuted,
        fontSize: 22,
        position: new Vector2(block.x, -56),
      }),
    );
    carryGroup.add(
      new Latex({
        tex: () => String(Math.round(block.sig())),
        fill: ROLE.text,
        fontSize: 34,
        position: new Vector2(block.x, 0),
      }),
    );
  }

  // Carry chips (temporary): +4 from z0→z1, then +8 from z1→z2.
  const carryChip0 = new Latex({
    tex: "+4",
    fill: ROLE.result,
    fontSize: 26,
    position: new Vector2(75, -44),
    opacity: 0,
  });
  const carryChip1 = new Latex({
    tex: "+8",
    fill: ROLE.result,
    fontSize: 26,
    position: new Vector2(-75, -44),
    opacity: 0,
  });
  carryGroup.add(carryChip0);
  carryGroup.add(carryChip1);

  const carryPlaces = new Latex({
    tex: "z_2\\,(\\times100)\\quad z_1\\,(\\times10)\\quad z_0\\,(\\times1)",
    fill: ROLE.textMuted,
    fontSize: 20,
    position: new Vector2(0, 70),
  });
  carryGroup.add(carryPlaces);

  // ---------------------------------------------------------------------------
  // Conceptual recurrence trees (branch 4 vs branch 3), depth 3.
  // ---------------------------------------------------------------------------
  const TREE_DEPTH = 3;
  // Trees sit in the mid-band; leaf labels stay above the caption band (y≲180).
  const tree4Layout = layoutTree(4, TREE_DEPTH, -380, -40, -80, 110);
  const tree3Layout = layoutTree(3, TREE_DEPTH, 40, 380, -80, 110);
  const tree4 = buildTree(tree4Layout, ROLE.transformed);
  const tree3 = buildTree(tree3Layout, ROLE.basis1);
  const tree4Group = tree4.group;
  const tree3Group = tree3.group;
  view.add(tree4Group);
  view.add(tree3Group);

  /**
   * Leaf-count bars on a COMMON scale, so "the exponent bends" is a length you
   * can see rather than two numbers you have to compare in your head.
   */
  const BAR_MAX_PX = 300;
  const barScale = BAR_MAX_PX / Math.max(tree4Layout.leaves, tree3Layout.leaves);
  const makeLeafBar = (x: number, leaves: number, color: string): Rect =>
    new Rect({
      x,
      y: 168,
      width: leaves * barScale,
      height: 12,
      radius: 6,
      fill: color,
      opacity: 0,
      scale: [0, 1],
      offset: [-1, 0],
    });
  const tree4Bar = makeLeafBar(-360, tree4Layout.leaves, ROLE.transformed);
  const tree3Bar = makeLeafBar(60, tree3Layout.leaves, ROLE.basis1);
  view.add(tree4Bar);
  view.add(tree3Bar);

  const tree4Title = makePanelTitle("Branch 4 (naive)", ROLE.transformed, 22);
  tree4Title.position(new Vector2(-210, -110));
  tree4Title.opacity(0);
  const tree3Title = makePanelTitle("Branch 3 (Karatsuba)", ROLE.basis1, 22);
  tree3Title.position(new Vector2(210, -110));
  tree3Title.opacity(0);
  const tree4Leaves = makePanelTitle(
    `${tree4Layout.leaves} leaves = n²`,
    ROLE.transformed,
    20,
  );
  tree4Leaves.position(new Vector2(-210, 140));
  tree4Leaves.opacity(0);
  const tree3Leaves = makePanelTitle(
    `${tree3Layout.leaves} leaves ≈ n^1.585`,
    ROLE.basis1,
    20,
  );
  tree3Leaves.position(new Vector2(210, 140));
  tree3Leaves.opacity(0);
  view.add(tree4Title);
  view.add(tree3Title);
  view.add(tree4Leaves);
  view.add(tree3Leaves);

  // ---------------------------------------------------------------------------
  // Shared overlay caption + equation.
  // ---------------------------------------------------------------------------
  // Slightly smaller overlay with a thin outline — the default overlay stroke
  // (≈0.22×fontSize) reads as a bold blur on long captions.
  const caption = makeOverlayLabel(
    "12 × 13 as a weighted multiplication rectangle",
    ROLE.textMuted,
    30,
  );
  caption.lineWidth(3);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y + 8));
  view.add(caption);

  const formula = new Latex({
    tex: "(10A+B)(10C+D)",
    fill: ROLE.text,
    fontSize: 26,
    opacity: 0,
    position: new Vector2(0, -230),
  });
  view.add(formula);

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  /**
   * Captions SNAP. Motion Canvas interpolates `Txt.text` character by character,
   * so a tweened caption change renders a few tenths of a second of scrambled
   * letters — caught on an export frame as "only their sD+BC+BDeede". The
   * duration each tween used to occupy is now an explicit hold, so the beat is
   * budgeted identically and the text is always a real sentence.
   */
  const setCaption = (text: string) => caption.text(text);

  const bodies: Record<string, () => ThreadGenerator> = {
    *setup() {
      // Establishing frame already visible at t=0 (outline + caption).
      yield* waitFor(beats("setup").hold!);
    },
    *foil() {
      const b = beats("foil");
      setCaption("FOIL: four subrectangles AC, AD, BC, BD");
      yield* all(
        ac.opacity(0.55, b.in!, easeInOutCubic),
        ad.opacity(0.55, b.in!, easeInOutCubic),
        bc.opacity(0.55, b.in!, easeInOutCubic),
        bd.opacity(0.55, b.in!, easeInOutCubic),
        wLabelAC.opacity(1, b.in!),
        wLabelAD.opacity(1, b.in!),
        wLabelBC.opacity(1, b.in!),
        wLabelBD.opacity(1, b.in!),
        formula.opacity(1, b.in!),
      );
      formula.tex("100\\,AC + 10\\,AD + 10\\,BC + BD");
      yield* waitFor(b.hold!);
    },
    *weights() {
      const b = beats("weights");
      setCaption("Place-value weights: which two pieces share a column?");
      yield* waitFor(b.leadIn!);
      // Weights fade in by attaching each region's place value to its name.
      yield* all(
        wLabelAC.text("100 AC", b.labelWrite!),
        wLabelAD.text("10 AD", b.labelWrite!),
        wLabelBC.text("10 BC", b.labelWrite!),
      );
      yield* waitFor(b.hold!);
    },
    *share() {
      const b = beats("share");
      setCaption("AD and BC share weight 10 — only their sum is needed");
      yield* waitFor(b.caption!);
      // Focal event: dim AC and BD, brighten and pulse the two ×10 pieces.
      yield* all(
        ac.opacity(0.2, b.focus!),
        bd.opacity(0.2, b.focus!),
        wLabelAC.opacity(0.35, b.focus!),
        wLabelBD.opacity(0.35, b.focus!),
        ad.opacity(0.85, b.focus!),
        bc.opacity(0.85, b.focus!),
      );
      yield* all(ad.opacity(1, b.up!), bc.opacity(1, b.up!));
      yield* all(ad.opacity(0.85, b.down!), bc.opacity(0.85, b.down!));
      // The two ×10 labels TRAVEL to one place and merge there. Fading one pair
      // out while a third label faded in elsewhere made "the middle collapses"
      // a caption; this makes it a motion.
      const mergePoint = combinedMid.position();
      // They dissolve AS they arrive, and the combined term rises in their
      // place. Letting them land still legible left "10 AD" and "10 BC"
      // printed on top of each other for half a second — one unreadable blob
      // at the very moment the merge is supposed to be read (text-overlap
      // hard gate).
      yield* all(
        wLabelAD.position(mergePoint, b.merge!, easeInOutCubic),
        wLabelBC.position(mergePoint, b.merge!, easeInOutCubic),
        wLabelAD.opacity(0, b.merge!),
        wLabelBC.opacity(0, b.merge!),
        combinedMid.opacity(1, b.merge!),
      );
      yield* all(
        formula.tex("100\\,AC + 10(AD+BC) + BD", b.combine!),
      );
      yield* waitFor(b.hold!);
    },
    *["aux-rect"]() {
      const b = beats("aux-rect");
      setCaption("A different rectangle: (A+B)(C+D) = AC+AD+BC+BD");
      yield* all(
        auxOutline.opacity(1, b.in!),
        auxTitle.opacity(1, b.in!),
        auxAc.opacity(0.5, b.in!),
        auxAd.opacity(0.5, b.in!),
        auxBc.opacity(0.5, b.in!),
        auxBd.opacity(0.5, b.in!),
        auxLabelAC.opacity(1, b.in!),
        auxLabelAD.opacity(1, b.in!),
        auxLabelBC.opacity(1, b.in!),
        auxLabelBD.opacity(1, b.in!),
        formula.tex("(A+B)(C+D)=3\\cdot4=12", b.in!),
      );
      yield* waitFor(b.hold!);
    },
    *subtract() {
      const b = beats("subtract");
      // A real prediction: the four named pieces are on screen and labelled, and
      // the question has one answer. It used to hold for 1.2s, which is not
      // thinking time — it is a beat of dead air before the answer.
      setCaption(
        "Prediction: AC and BD are already known. Remove them from this rectangle — what is left?",
      );
      yield* waitFor(b.ask!);
      yield* waitFor(b.think!);
      // PEEL: the two corner tiles slide out of the rectangle rather than
      // dimming in place, so "peel off the corners" is the motion on screen.
      // AC peels sideways rather than diagonally: (-58, -54) parked its label
      // on top of the panel title, printing "AC" over "Auxiliary (A+B)×(C+D)"
      // for the rest of the beat (text-overlap hard gate).
      const AC_PEEL = new Vector2(-96, -16);
      const BD_PEEL = new Vector2(58, 54);
      yield* all(
        auxAc.position(AC_PEEL, b.peel!, easeInOutCubic),
        auxBd.position(BD_PEEL, b.peel!, easeInOutCubic),
        auxLabelAC.position(auxLabelAC.position().add(AC_PEEL), b.peel!, easeInOutCubic),
        auxLabelBD.position(auxLabelBD.position().add(BD_PEEL), b.peel!, easeInOutCubic),
        auxAc.opacity(0.15, b.peel!),
        auxBd.opacity(0.15, b.peel!),
        auxLabelAC.opacity(0.3, b.peel!),
        auxLabelBD.opacity(0.3, b.peel!),
      );
      setCaption("The two opposite corners left = AD+BC = z₁ = 12 − 1 − 6 = 5");
      yield* all(
        auxAd.opacity(0.9, b.reveal!),
        auxBc.opacity(0.9, b.reveal!),
        formula.tex("z_1=(A+B)(C+D)-AC-BD", b.reveal!),
      );
      yield* waitFor(b.hold!);
    },
    *reassemble() {
      const b = beats("reassemble");
      setCaption(
        `Rebuild: 100·${CLEAN.z2} + 10·${CLEAN.z1} + ${CLEAN.z0} = ${CLEAN.product}`,
      );
      yield* all(
        formula.tex(
          `100z_2+10z_1+z_0=${CLEAN.product}\\quad(3\\text{ products})`,
          b.caption!,
        ),
        ac.opacity(0.55, b.caption!),
        bd.opacity(0.55, b.caption!),
      );
      yield* waitFor(b.hold!);
    },
    *["carry-vs-width"]() {
      const b = beats("carry-vs-width");
      setCaption('78 × 56: two different kinds of "too big"');
      // The 12×13 weighted rectangle leaves so 78×56 can take the stage.
      // Also force trees (if somehow visible from scrubbing) fully off.
      yield* all(
        weightedGroup.opacity(0, b.clear!),
        auxGroup.opacity(0, b.clear!),
        tree4Group.opacity(0, b.clear!),
        tree3Group.opacity(0, b.clear!),
        tree4Title.opacity(0, b.clear!),
        tree3Title.opacity(0, b.clear!),
        tree4Leaves.opacity(0, b.clear!),
        tree3Leaves.opacity(0, b.clear!),
        tree4Bar.opacity(0, b.clear!),
        tree3Bar.opacity(0, b.clear!),
      );
      yield* all(
        carryGroup.opacity(1, b.show!),
        formula.tex("z_2\\cdot100+z_1\\cdot10+z_0=3500+820+48", b.show!),
      );
      yield* waitFor(b.hold!);
      // Carry step 1: z0 = 48 keeps 8, carries +4 into z1 → 86. The chip
      // TRAVELS from the z₀ column to the z₁ column, because that is what
      // "carries 4 into z₁" describes.
      const step0 = BOUNDARY.normalized.steps[0]!;
      carryChip0.position(new Vector2(150, -44));
      yield* carryChip0.opacity(1, b.chip0!);
      yield* carryChip0.position(new Vector2(0, -44), b.travel0!, easeInOutCubic);
      cz0(step0.digitAfter);
      cz1(cz1() + step0.carryOut);
      setCaption("Output carrying: 48 keeps 8, carries 4 → z₁ = 86");
      yield* waitFor(b.caption0!);
      yield* waitFor(b.hold0!);
      // Carry step 2: z1 = 86 keeps 6, carries +8 into z2 → 43.
      const step1 = BOUNDARY.normalized.steps[1]!;
      carryChip1.position(new Vector2(0, -44));
      yield* all(carryChip0.opacity(0, b.chip1!), carryChip1.opacity(1, b.chip1!));
      yield* carryChip1.position(new Vector2(-150, -44), b.travel1!, easeInOutCubic);
      cz1(step1.digitAfter);
      cz2(cz2() + step1.carryOut);
      setCaption("86 keeps 6, carries 8 → z₂ = 43. Digits 4368");
      yield* formula.tex("(35,82,48)\\to(35,86,8)\\to(43,6,8)=4368", b.caption1!);
      yield* waitFor(b.hold1!);
      yield* carryChip1.opacity(0, b.retire!);
      setCaption("Separately: A+B=15 is wider — padding, not a 4th multiply");
      yield* waitFor(b.caption2!);
      yield* waitFor(b.hold2!);
    },
    *branch() {
      const b = beats("branch");
      setCaption("Conceptual recurrence trees — not an exact numeric call-tree trace");
      yield* all(
        carryGroup.opacity(0, b.in!),
        tree4Group.opacity(1, b.in!),
        tree3Group.opacity(1, b.in!),
        tree4Title.opacity(1, b.in!),
        tree3Title.opacity(1, b.in!),
        formula.tex(
          "T(n)=4T(n/2)\\quad\\text{vs}\\quad T(n)=3T(n/2)+\\Theta(n)",
          b.in!,
        ),
      );
      yield* all(tree4Leaves.opacity(1, b.leaves!), tree3Leaves.opacity(1, b.leaves!));
      yield* waitFor(b.hold!);
    },
    *exponent() {
      const b = beats("exponent");
      setCaption("Leaf counts: n² vs n^(log₂ 3) ≈ n^1.585 — an exponent change, not 25%");
      yield* all(
        formula.tex(
          "\\log_2 4 = 2 \\;\\longrightarrow\\; \\log_2 3 \\approx 1.585",
          b.caption!,
        ),
      );
      // The leaf ROW is what the exponent counts, so touch it: every leaf dot
      // in each tree swells and brightens in turn. (This used to be
      // `opacity(1 → 1)` on two labels — a literal no-op.)
      const half = b.leafPulse! / 2;
      yield* all(
        ...tree4.leafDots.map((dot) => dot.size(10, half, easeInOutCubic)),
      );
      yield* all(
        ...tree3.leafDots.map((dot) => dot.size(10, half, easeInOutCubic)),
      );
      // …and then the two counts are drawn to the SAME scale, so the gap is a
      // length rather than two numbers to compare mentally.
      tree4Bar.opacity(0.85);
      tree3Bar.opacity(0.85);
      yield* all(
        tree4Bar.scale([1, 1], b.countUp!, easeInOutCubic),
        tree3Bar.scale([1, 1], b.countUp!, easeInOutCubic),
      );
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of KARATSUBA_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
