import { Latex, Line, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { KARATSUBA_CLEAN, KARATSUBA_BOUNDARY } from "../../lessons/karatsubaData";
import { karatsubaStep, leafCount } from "../../math";
import { KARATSUBA_SEGMENTS } from "./sceneTimings";
import { ROLE, makeOverlayLabel } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";

/**
 * Watch scene for Karatsuba: weighted multiplication rectangle → shared middle
 * weight → separate auxiliary coefficient rectangle → reconstruction → carry vs
 * width → conceptual recurrence trees. Numbers from karatsubaData.
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

function makeRegion(
  color: string,
  opacity = 0.55,
): Line {
  return new Line({
    closed: true,
    fill: color,
    stroke: color,
    lineWidth: 2,
    opacity,
    points: [new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1)],
  });
}

export const karatsubaCrossTermsScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const seconds = Object.fromEntries(
    KARATSUBA_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  // --- Weighted multiplication rectangle (12×13), left side, independently scaled ---
  const W_ORIGIN = new Vector2(-280, 40);
  const W_SCALE = 18; // pixels per unit for the weighted view
  const wW = CLEAN.x * W_SCALE;
  const wH = CLEAN.y * W_SCALE;
  // Split: A=1,B=2,C=1,D=3 → vertical split at A/(A+B)=1/3? Actually width split is A vs B along x for (10A+B)...
  // For area view of (10A+B)×(10C+D), FOIL regions:
  //   AC: width A*10? Better: use digit split of the dimensions themselves.
  // Dimensions are 12 and 13. Split width into A*10=10 and B=2; height into C*10=10 and D=3.
  const splitX = 10 * W_SCALE; // A·10
  const splitY = 10 * W_SCALE; // C·10
  const left = W_ORIGIN.x - wW / 2;
  // Motion Canvas: +y is down. Place origin of rectangle at top-left for clarity.
  const wx0 = left;
  const wy0 = W_ORIGIN.y - wH / 2;

  // Regions: AC (top-left in screen? height from top):
  // Math: x from 0..10 is high part A·10, 10..12 is B; y from 0..10 is C·10, 10..13 is D.
  // Screen: x same; y flipped so math-up is screen-up (smaller y).
  const acPts = [
    new Vector2(wx0, wy0),
    new Vector2(wx0 + splitX, wy0),
    new Vector2(wx0 + splitX, wy0 + splitY),
    new Vector2(wx0, wy0 + splitY),
  ];
  // AD = high×low → left, bottom (screen y increases down)
  const adPts = [
    new Vector2(wx0, wy0 + splitY),
    new Vector2(wx0 + splitX, wy0 + splitY),
    new Vector2(wx0 + splitX, wy0 + wH),
    new Vector2(wx0, wy0 + wH),
  ];
  // BC = low×high → right, top
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
  view.add(outline);

  const ac = makeRegion(ROLE.basis1, 0);
  ac.points(acPts);
  const ad = makeRegion(ROLE.selected, 0);
  ad.points(adPts);
  const bc = makeRegion(ROLE.transformed, 0);
  bc.points(bcPts);
  const bd = makeRegion(ROLE.basis2, 0);
  bd.points(bdPts);
  view.add(ac);
  view.add(ad);
  view.add(bc);
  view.add(bd);

  const weightedTitle = makeOverlayLabel(
    "Weighted multiplication rectangle  12×13",
    ROLE.text,
  );
  weightedTitle.position(new Vector2(W_ORIGIN.x, wy0 - 36));
  view.add(weightedTitle);

  // --- Auxiliary coefficient rectangle (3×4), right side, own scale ---
  const A_ORIGIN = new Vector2(260, 40);
  const A_SCALE = 36;
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
  view.add(auxOutline);

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
  view.add(auxAc);
  view.add(auxAd);
  view.add(auxBc);
  view.add(auxBd);

  const auxTitle = makeOverlayLabel(
    "Auxiliary coefficient rectangle  (A+B)×(C+D)",
    ROLE.original,
  );
  auxTitle.position(new Vector2(A_ORIGIN.x, ay0 - 36));
  auxTitle.opacity(0);
  view.add(auxTitle);

  const caption = makeOverlayLabel(
    "12 × 13 as a weighted multiplication rectangle",
    ROLE.textMuted,
  );
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const formula = new Latex({
    tex: "(10A+B)(10C+D)",
    fill: ROLE.text,
    fontSize: 28,
    opacity: 0,
    position: new Vector2(0, -220),
  });
  view.add(formula);

  // Conceptual tree leaf counts (not a literal 1234×5678 trace).
  const treeCaption = makeOverlayLabel("", ROLE.selected);
  treeCaption.position(new Vector2(0, 200));
  treeCaption.opacity(0);
  view.add(treeCaption);

  const weightLabels = createSignal(0);

  const bodies: Record<string, () => ThreadGenerator> = {
    *setup() {
      // Establishing frame already visible at t=0.
      yield* waitFor(seconds.setup);
    },
    *foil() {
      yield* all(
        ac.opacity(0.55, 0.6, easeInOutCubic),
        ad.opacity(0.55, 0.6, easeInOutCubic),
        bc.opacity(0.55, 0.6, easeInOutCubic),
        bd.opacity(0.55, 0.6, easeInOutCubic),
        caption.text("FOIL: four subrectangles AC, AD, BC, BD", 0.4),
        formula.opacity(1, 0.4),
      );
      formula.tex("100\\,AC + 10\\,AD + 10\\,BC + BD");
      yield* waitFor(seconds.foil - 1);
    },
    *weights() {
      yield* caption.text(
        "Prediction: which two pieces share a place-value weight?",
        0.4,
      );
      weightLabels(1);
      yield* waitFor(seconds.weights);
    },
    *share() {
      yield* all(
        ac.opacity(0.25, 0.5),
        bd.opacity(0.25, 0.5),
        ad.opacity(0.85, 0.5),
        bc.opacity(0.85, 0.5),
        caption.text(
          "AD and BC share weight 10 — only AD+BC is needed",
          0.4,
        ),
        formula.tex("100\\,AC + 10(AD+BC) + BD", 0.4),
      );
      yield* waitFor(seconds.share - 0.9);
    },
    *["aux-rect"]() {
      yield* all(
        auxOutline.opacity(1, 0.6),
        auxTitle.opacity(1, 0.6),
        auxAc.opacity(0.5, 0.6),
        auxAd.opacity(0.5, 0.6),
        auxBc.opacity(0.5, 0.6),
        auxBd.opacity(0.5, 0.6),
        caption.text(
          "A different rectangle: (A+B)(C+D) = AC+AD+BC+BD",
          0.4,
        ),
        formula.tex("(A+B)(C+D)=3\\cdot4=12", 0.4),
      );
      yield* waitFor(seconds["aux-rect"] - 1);
    },
    *subtract() {
      yield* caption.text(
        "Prediction: shade the whole, remove AC and BD — what remains?",
        0.4,
      );
      yield* waitFor(1.2);
      yield* all(
        auxAc.opacity(0.12, 0.6),
        auxBd.opacity(0.12, 0.6),
        auxAd.opacity(0.9, 0.6),
        auxBc.opacity(0.9, 0.6),
        caption.text(
          "L-shape left = AD+BC = z₁ = 12 − 1 − 6 = 5",
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
      yield* waitFor(seconds.reassemble - 0.8);
    },
    *["carry-vs-width"]() {
      yield* all(
        caption.text(
          `Boundary ${BOUNDARY.x}×${BOUNDARY.y}: z=(${BOUNDARY.z2},${BOUNDARY.z1},${BOUNDARY.z0}) overflow → carrying; A+B=15 → wider sum-product (padding, not a 4th multiply)`,
          0.5,
        ),
        formula.tex(
          "(35,82,48)\\to(35,86,8)\\to(43,6,8)=4368",
          0.4,
        ),
      );
      yield* waitFor(seconds["carry-vs-width"] - 0.9);
    },
    *branch() {
      const levels = 3;
      yield* all(
        auxOutline.opacity(0.2, 0.4),
        auxAc.opacity(0, 0.4),
        auxAd.opacity(0, 0.4),
        auxBc.opacity(0, 0.4),
        auxBd.opacity(0, 0.4),
        auxTitle.opacity(0.3, 0.4),
        caption.text(
          "Conceptual recurrence trees — not an exact numeric call-tree trace",
          0.4,
        ),
        treeCaption.opacity(1, 0.4),
        treeCaption.text(
          `branch 4 → ${leafCount(4, levels)} leaves   |   branch 3 → ${leafCount(3, levels)} leaves  (depth ${levels})`,
          0.4,
        ),
        formula.tex("T(n)=4T(n/2)\\quad\\text{vs}\\quad T(n)=3T(n/2)+\\Theta(n)", 0.4),
      );
      yield* waitFor(seconds.branch - 0.8);
    },
    *exponent() {
      yield* all(
        caption.text(
          "Leaf counts: n² vs n^(log₂ 3) ≈ n^1.585 — an exponent change, not 25%",
          0.4,
        ),
        formula.tex("\\log_2 4 = 2 \\;\\longrightarrow\\; \\log_2 3 \\approx 1.585", 0.4),
        treeCaption.text(
          `At n=8: ${leafCount(4, 3)} vs ${leafCount(3, 3)} multiplications at the leaves`,
          0.4,
        ),
      );
      yield* waitFor(seconds.exponent - 0.8);
    },
  };

  for (const segment of KARATSUBA_SEGMENTS) {
    yield* bodies[segment.id]!();
  }

  // Silence unused signal warning in strict builds — weightLabels reserved for label fade.
  void weightLabels;
});
