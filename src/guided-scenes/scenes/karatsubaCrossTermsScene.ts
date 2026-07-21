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
import { KARATSUBA_SEGMENTS } from "./sceneTimings";
import { ROLE, makeOverlayLabel } from "./sceneKit";
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
  const levelY = (level: number) =>
    depth === 0 ? top : top + (level * (bottom - top)) / depth;

  function walk(node: TreeNode, level: number, x0: number, x1: number): Vector2 {
    const point = new Vector2((x0 + x1) / 2, levelY(level));
    nodes.push(point);
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
  return { nodes, edges, leaves: leafCount(branch, depth) };
}

function buildTree(layout: TreeLayout, color: string): Node {
  const group = new Node({ opacity: 0 });
  for (const [a, b] of layout.edges) {
    group.add(
      new Line({ points: [a, b], stroke: color, lineWidth: 1, opacity: 0.5 }),
    );
  }
  for (const point of layout.nodes) {
    group.add(new Circle({ position: point, size: 4, fill: color }));
  }
  return group;
}

export const karatsubaCrossTermsScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const seconds = Object.fromEntries(
    KARATSUBA_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

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
  const tree4Group = buildTree(tree4Layout, ROLE.transformed);
  const tree3Group = buildTree(tree3Layout, ROLE.basis1);
  view.add(tree4Group);
  view.add(tree3Group);

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

  const bodies: Record<string, () => ThreadGenerator> = {
    *setup() {
      // Establishing frame already visible at t=0 (outline + caption).
      yield* waitFor(seconds.setup);
    },
    *foil() {
      yield* all(
        ac.opacity(0.55, 0.6, easeInOutCubic),
        ad.opacity(0.55, 0.6, easeInOutCubic),
        bc.opacity(0.55, 0.6, easeInOutCubic),
        bd.opacity(0.55, 0.6, easeInOutCubic),
        wLabelAC.opacity(1, 0.6),
        wLabelAD.opacity(1, 0.6),
        wLabelBC.opacity(1, 0.6),
        wLabelBD.opacity(1, 0.6),
        caption.text("FOIL: four subrectangles AC, AD, BC, BD", 0.4),
        formula.opacity(1, 0.4),
      );
      formula.tex("100\\,AC + 10\\,AD + 10\\,BC + BD");
      yield* waitFor(seconds.foil - 0.6);
    },
    *weights() {
      yield* caption.text(
        "Place-value weights: which two pieces share a column?",
        0.4,
      );
      // Weights fade in by attaching each region's place value to its name.
      yield* all(
        wLabelAC.text("100 AC", 0.4),
        wLabelAD.text("10 AD", 0.4),
        wLabelBC.text("10 BC", 0.4),
      );
      yield* waitFor(seconds.weights - 0.8);
    },
    *share() {
      yield* caption.text(
        "AD and BC share weight 10 — only their sum is needed",
        0.4,
      );
      // Focal event: dim AC and BD, brighten and pulse the two ×10 pieces.
      yield* all(
        ac.opacity(0.2, 0.5),
        bd.opacity(0.2, 0.5),
        wLabelAC.opacity(0.35, 0.5),
        wLabelBD.opacity(0.35, 0.5),
        ad.opacity(0.85, 0.5),
        bc.opacity(0.85, 0.5),
      );
      yield* all(ad.opacity(1, 0.25), bc.opacity(1, 0.25));
      yield* all(ad.opacity(0.85, 0.25), bc.opacity(0.85, 0.25));
      // Combine the two ×10 pieces into a single weighted term.
      yield* all(
        wLabelAD.opacity(0, 0.4),
        wLabelBC.opacity(0, 0.4),
        combinedMid.opacity(1, 0.4),
        formula.tex("100\\,AC + 10(AD+BC) + BD", 0.4),
      );
      yield* waitFor(seconds.share - 2.2);
    },
    *["aux-rect"]() {
      yield* all(
        auxOutline.opacity(1, 0.6),
        auxTitle.opacity(1, 0.6),
        auxAc.opacity(0.5, 0.6),
        auxAd.opacity(0.5, 0.6),
        auxBc.opacity(0.5, 0.6),
        auxBd.opacity(0.5, 0.6),
        auxLabelAC.opacity(1, 0.6),
        auxLabelAD.opacity(1, 0.6),
        auxLabelBC.opacity(1, 0.6),
        auxLabelBD.opacity(1, 0.6),
        caption.text(
          "A different rectangle: (A+B)(C+D) = AC+AD+BC+BD",
          0.4,
        ),
        formula.tex("(A+B)(C+D)=3\\cdot4=12", 0.4),
      );
      yield* waitFor(seconds["aux-rect"] - 0.6);
    },
    *subtract() {
      yield* caption.text(
        "Prediction: remove AC and BD — what remains?",
        0.4,
      );
      yield* waitFor(1.2);
      yield* all(
        auxAc.opacity(0.12, 0.6),
        auxBd.opacity(0.12, 0.6),
        auxLabelAC.opacity(0.3, 0.6),
        auxLabelBD.opacity(0.3, 0.6),
        auxAd.opacity(0.9, 0.6),
        auxBc.opacity(0.9, 0.6),
        caption.text(
          "The two opposite corners left = AD+BC = z₁ = 12 − 1 − 6 = 5",
          0.4,
        ),
        formula.tex("z_1=(A+B)(C+D)-AC-BD", 0.4),
      );
      yield* waitFor(seconds.subtract - 2.2);
    },
    *reassemble() {
      yield* all(
        caption.text(
          `Rebuild: 100·${CLEAN.z2} + 10·${CLEAN.z1} + ${CLEAN.z0} = ${CLEAN.product}`,
          0.4,
        ),
        formula.tex(
          `100z_2+10z_1+z_0=${CLEAN.product}\\quad(3\\text{ products})`,
          0.4,
        ),
        ac.opacity(0.55, 0.4),
        bd.opacity(0.55, 0.4),
      );
      yield* waitFor(seconds.reassemble - 0.4);
    },
    *["carry-vs-width"]() {
      // The 12×13 weighted rectangle leaves so 78×56 can take the stage.
      // Also force trees (if somehow visible from scrubbing) fully off.
      yield* all(
        weightedGroup.opacity(0, 0.5),
        auxGroup.opacity(0, 0.5),
        tree4Group.opacity(0, 0.3),
        tree3Group.opacity(0, 0.3),
        tree4Title.opacity(0, 0.3),
        tree3Title.opacity(0, 0.3),
        tree4Leaves.opacity(0, 0.3),
        tree3Leaves.opacity(0, 0.3),
        caption.text('78 × 56: two different kinds of "too big"', 0.4),
      );
      yield* all(
        carryGroup.opacity(1, 0.5),
        formula.tex("z_2\\cdot100+z_1\\cdot10+z_0=3500+820+48", 0.4),
      );
      yield* waitFor(0.7);
      // Carry step 1: z0 = 48 keeps 8, carries +4 into z1 → 86.
      const step0 = BOUNDARY.normalized.steps[0]!;
      yield* carryChip0.opacity(1, 0.3);
      cz0(step0.digitAfter);
      cz1(cz1() + step0.carryOut);
      yield* caption.text(
        "Output carrying: 48 keeps 8, carries 4 → z₁ = 86",
        0.4,
      );
      yield* waitFor(0.7);
      // Carry step 2: z1 = 86 keeps 6, carries +8 into z2 → 43.
      const step1 = BOUNDARY.normalized.steps[1]!;
      yield* all(carryChip0.opacity(0, 0.2), carryChip1.opacity(1, 0.3));
      cz1(step1.digitAfter);
      cz2(cz2() + step1.carryOut);
      yield* all(
        caption.text("86 keeps 6, carries 8 → z₂ = 43. Digits 4368", 0.4),
        formula.tex("(35,82,48)\\to(35,86,8)\\to(43,6,8)=4368", 0.4),
      );
      yield* waitFor(0.7);
      yield* carryChip1.opacity(0, 0.2);
      yield* caption.text(
        "Separately: A+B=15 is wider — padding, not a 4th multiply",
        0.4,
      );
      yield* waitFor(seconds["carry-vs-width"] - 5.3);
    },
    *branch() {
      yield* all(
        carryGroup.opacity(0, 0.4),
        caption.text(
          "Conceptual recurrence trees — not an exact numeric call-tree trace",
          0.4,
        ),
        tree4Group.opacity(1, 0.6),
        tree3Group.opacity(1, 0.6),
        tree4Title.opacity(1, 0.6),
        tree3Title.opacity(1, 0.6),
        formula.tex(
          "T(n)=4T(n/2)\\quad\\text{vs}\\quad T(n)=3T(n/2)+\\Theta(n)",
          0.4,
        ),
      );
      yield* all(tree4Leaves.opacity(1, 0.5), tree3Leaves.opacity(1, 0.5));
      yield* waitFor(seconds.branch - 1.1);
    },
    *exponent() {
      yield* all(
        caption.text(
          "Leaf counts: n² vs n^(log₂ 3) ≈ n^1.585 — an exponent change, not 25%",
          0.4,
        ),
        formula.tex(
          "\\log_2 4 = 2 \\;\\longrightarrow\\; \\log_2 3 \\approx 1.585",
          0.4,
        ),
      );
      // Pulse the leaf rows so attention lands on the leaf totals.
      yield* all(tree4Leaves.opacity(1, 0.3), tree3Leaves.opacity(1, 0.3));
      yield* waitFor(seconds.exponent - 0.7);
    },
  };

  for (const segment of KARATSUBA_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
