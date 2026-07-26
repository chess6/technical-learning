import { Circle, Line, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { DETERMINANT_LESSON_EXAMPLE } from "../../lessons/exampleData";
import {
  applyMatrixToUnitSquare,
  determinant2x2,
  requireMatrixExample,
  type Matrix2x2,
} from "../../math";
import { DETERMINANT_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatAreaFactor,
  formatSceneNumber,
  formatSignedArea,
  focusOpacities,
  orientationSweep,
  makeArrow,
  makeGhostClosedRegion,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
  morphMatrixEntries,
  runSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 3: determinants as signed area scaling.
 *
 * Quality-bar focus:
 * - Script-event contract + attention choreography via shared focusOpacities.
 * - Object continuity: same unit-square object morphs; ghost of the original.
 * - Successive transforms on an explicitly announced diagonal digression.
 * - Name-after-intuition: feel the area factor before naming det(A).
 *
 * Two July 2026 audit fixes:
 *
 *  - **The headline number is live.** It was set imperatively before and after
 *    each morph, so through `collapse` and `negative` — the two beats where the
 *    determinant is the whole point — the screen showed the PREVIOUS value for
 *    up to two seconds while the geometry was already somewhere else. It is now
 *    a function of the live matrix signals, evaluated every frame.
 *  - **Orientation is actually drawn.** The "orientation" indicator was a dashed
 *    arrow lying exactly on Ae₁, which cannot show a flip: handedness is the
 *    SIGNED sweep from Ae₁ to Ae₂. That sweep is now an arc which visibly
 *    reverses direction as the determinant crosses zero.
 */

const SCENE_ID = "determinant-area-scaling";

const A = DETERMINANT_LESSON_EXAMPLE.matrix as Matrix2x2;
const EXPAND = requireMatrixExample("uniform-scale").matrix as Matrix2x2;
const SINGULAR = requireMatrixExample("singular-collapse").matrix as Matrix2x2;
const NEGATIVE = requireMatrixExample("determinant-negative").matrix as Matrix2x2;

/** Intermediate for successive area demo: stretch e₁ only. det = 2. */
const X_STRETCH: Matrix2x2 = [
  [EXPAND[0][0], 0],
  [0, 1],
];

const IDENTITY: Matrix2x2 = [
  [1, 0],
  [0, 1],
];

/**
 * The scene's claims about sign only hold if the shared examples still have the
 * signs the beats name. Checked before a frame renders.
 */
function assertSceneMathIsConsistent(): void {
  if (determinant2x2(A) <= 0) {
    throw new Error("determinantAreaScalingScene: the main example is not orientation-preserving.");
  }
  if (Math.abs(determinant2x2(SINGULAR)) > 1e-9) {
    throw new Error("determinantAreaScalingScene: the collapse example is not singular.");
  }
  if (determinant2x2(NEGATIVE) >= 0) {
    throw new Error("determinantAreaScalingScene: the negative example does not have det < 0.");
  }
}

const px = (v: readonly [number, number]): Vector2 =>
  new Vector2(v[0] * SCALE, -v[1] * SCALE);

const fmt = (n: number) => formatSceneNumber(n);

function squarePoints(m: Matrix2x2): Vector2[] {
  return applyMatrixToUnitSquare(m).map((p) => px(p));
}

/** Radius of the orientation sweep, in pixels. */
const ARC_RADIUS = 74;
/** Samples along the arc — enough that the curve reads as a curve. */
const ARC_STEPS = 36;

/**
 * Points of the signed sweep from Ae₁ to Ae₂ at a fixed radius.
 *
 * The angle itself comes from the Motion-Canvas-free `orientationSweep` (so a
 * unit test can hold it against `determinant2x2`'s sign); this only turns it
 * into pixels. The sweep runs counter-clockwise exactly when det > 0 and
 * clockwise exactly when det < 0, and degenerates to nothing when the columns
 * are parallel — i.e. when the plane has been flattened.
 */
function orientationArcPoints(
  matrix: Matrix2x2,
  radius = ARC_RADIUS,
  steps = ARC_STEPS,
): Vector2[] {
  const sweep = orientationSweep(matrix);
  if (sweep === null) return [];
  const from = Math.atan2(matrix[1][0], matrix[0][0]);
  const points: Vector2[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = from + (sweep * i) / steps;
    // Screen y grows downward, so the math-space angle is negated.
    points.push(new Vector2(Math.cos(angle) * radius, -Math.sin(angle) * radius));
  }
  return points;
}

export const determinantAreaScalingScene = makeScene2D(function* (view) {
  assertSceneMathIsConsistent();
  view.fill(ROLE.background);

  const ma = createSignal(1);
  const mb = createSignal(0);
  const mc = createSignal(0);
  const md = createSignal(1);
  const matrix = (): Matrix2x2 => [
    [ma(), mb()],
    [mc(), md()],
  ];
  const det = (): number => determinant2x2(matrix());

  const grid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  grid.opacity(0.55);
  view.add(grid);

  const origin = new Circle({ size: 14, fill: ROLE.text, opacity: 1 });
  view.add(origin);

  const ghostSquare = makeGhostClosedRegion(squarePoints(IDENTITY));
  ghostSquare.opacity(0);
  view.add(ghostSquare);

  const square = new Line({
    stroke: ROLE.original,
    lineWidth: 3,
    closed: true,
    fill: ROLE.original,
    opacity: 0.35,
    points: () => squarePoints(matrix()),
  });
  view.add(square);

  // The orientation sweep: Ae₁ → Ae₂, the shortest signed way round.
  const orientArc = new Line({
    stroke: ROLE.selected,
    lineWidth: 4.5,
    endArrow: true,
    arrowSize: 13,
    opacity: 0.35,
    points: () => orientationArcPoints(matrix()),
  });
  view.add(orientArc);
  const orientLabel = makeLabel("e₁ → e₂", ROLE.selected, 22);
  // Ride the arc's MIDPOINT. Parked at a fixed point above the origin the label
  // drifted away from the thing it names as the columns moved.
  // It rides INSIDE the arc. Outside it (ARC_RADIUS + 26) it shared the ray
  // with whichever column the arc's midpoint pointed along, printing
  // "e₁ → e₂" under "e₁" or "e₂" whenever the columns closed up — the arrow
  // tips, and so their labels, are always further out than the arc itself.
  orientLabel.position(() => {
    const m = matrix();
    const sweep = orientationSweep(m);
    // Always comfortably inside the SHORTER column, so the label can never
    // reach the arrow tips — and so their labels, which ride those tips.
    // Outside the arc it shared a ray with whichever column the midpoint
    // pointed along and printed "e₁ → e₂" under "e₁" (text-overlap gate).
    const shortestColumn = Math.min(
      px([m[0][0], m[1][0]]).magnitude,
      px([m[0][1], m[1][1]]).magnitude,
    );
    const r = Math.max(18, Math.min(ARC_RADIUS - 26, shortestColumn * 0.5));
    if (sweep === null) return new Vector2(0, -r);
    const mid = Math.atan2(m[1][0], m[0][0]) + sweep / 2;
    return new Vector2(Math.cos(mid) * r, -Math.sin(mid) * r);
  });
  orientLabel.opacity(0);
  view.add(orientLabel);

  const e1 = makeArrow(ROLE.basis1, 6);
  e1.points(() => [new Vector2(0, 0), px([ma(), mc()])]);
  e1.end(0);
  const e2 = makeArrow(ROLE.basis2, 6);
  e2.points(() => [new Vector2(0, 0), px([mb(), md()])]);
  e2.end(0);
  view.add(e1);
  view.add(e2);

  const e1Label = makeLabel("e₁", ROLE.basis1);
  e1Label.position(() => px([ma(), mc()]).add(new Vector2(18, 18)));
  e1Label.opacity(0);
  const e2Label = makeLabel("e₂", ROLE.basis2);
  e2Label.position(() => px([mb(), md()]).add(new Vector2(18, -8)));
  e2Label.opacity(0);
  view.add(e1Label);
  view.add(e2Label);

  const top = makeOverlayLabel("", ROLE.text, 40);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 32);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const setTop = (text: string) => top.text(text);
  const setCaption = (text: string) => caption.text(text);
  /** Bind the headline to the LIVE matrix so it can never lag the geometry. */
  const liveAreaFactor = () => top.text(() => formatAreaFactor(det()));
  const liveSignedArea = () => top.text(() => formatSignedArea(det()));

  setTop("Unit square · area = 1");
  setCaption("Watch what happens to this region's area");
  top.opacity(1);
  caption.opacity(1);
  square.opacity(0.45);

  function* morphTo(target: Matrix2x2, dur: number): ThreadGenerator {
    yield* morphMatrixEntries(ma, mb, mc, md, target, dur);
  }

  function* focusSquare(emphasis = 0.55, duration = 0.35): ThreadGenerator {
    yield* focusOpacities(
      [
        { node: square, opacity: emphasis },
        { node: e1, opacity: 0.35 },
        { node: e2, opacity: 0.35 },
        { node: e1Label, opacity: 0.35 },
        { node: e2Label, opacity: 0.35 },
        { node: orientArc, opacity: 0.3 },
        { node: orientLabel, opacity: 0 },
      ],
      duration,
    );
  }

  function* focusBasis(duration = 0.35): ThreadGenerator {
    yield* focusOpacities(
      [
        { node: square, opacity: 0.22 },
        { node: e1, opacity: 1 },
        { node: e2, opacity: 1 },
        { node: e1Label, opacity: 1 },
        { node: e2Label, opacity: 1 },
        { node: orientArc, opacity: 0.35 },
      ],
      duration,
    );
  }

  function* focusOrientation(duration = 0.35): ThreadGenerator {
    yield* focusOpacities(
      [
        { node: square, opacity: 0.28 },
        { node: e1, opacity: 0.6 },
        { node: e2, opacity: 0.6 },
        { node: e1Label, opacity: 0.6 },
        { node: e2Label, opacity: 0.6 },
        { node: orientArc, opacity: 1 },
        { node: orientLabel, opacity: 1 },
      ],
      duration,
    );
  }

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const bodies: Record<string, () => ThreadGenerator> = {
    *identity() {
      const b = beats("identity");
      setTop("Unit square · area = 1");
      setCaption("One region to track — its area starts at 1");
      yield* all(
        e1.end(1, b.in!),
        e2.end(1, b.in!),
        e1Label.opacity(0.7, b.in!),
        e2Label.opacity(0.7, b.in!),
        square.opacity(0.5, b.in!),
      );
      yield* waitFor(b.hold!);
    },
    *basis() {
      const b = beats("basis");
      setTop("Columns of A");
      setCaption("Lesson 2: columns are where e₁ and e₂ land");
      yield* focusBasis(b.focus!);
      yield* morphTo(A, b.morph!);
      e1Label.text("Ae₁");
      e2Label.text("Ae₂");
      yield* waitFor(b.hold!);
    },
    *parallelogram() {
      const b = beats("parallelogram");
      setTop("Same square · new shape");
      setCaption("The unit square itself becomes this parallelogram");
      yield* all(ghostSquare.opacity(0.22, b.ghost!), focusSquare(0.55, b.ghost!));
      yield* waitFor(b.hold!);
    },
    *area() {
      const b = beats("area");
      liveAreaFactor();
      setCaption("That area is the scale factor for every region");
      yield* focusSquare(0.6, b.focus!);
      yield* waitFor(b.hold!);
      liveSignedArea();
      setCaption("We call this scale factor the determinant of A");
      yield* waitFor(b.hold2!);
    },
    *expand() {
      const b = beats("expand");
      // Honesty: this is a digression to a diagonal map, not a factorization of A.
      setTop("Aside: a diagonal map");
      setCaption("Not the shear — a pure stretch, so area multiplies visibly");
      yield* all(ghostSquare.opacity(0.18, b.focus!), focusSquare(0.55, b.focus!));
      yield* morphTo(IDENTITY, b.reset!);
      e1Label.text("e₁");
      e2Label.text("e₂");
      setCaption("First stretch sideways — watch area × 2");
      liveAreaFactor();
      yield* morphTo(X_STRETCH, b.x!);
      yield* waitFor(b.hold!);
      setCaption("Then stretch vertically — area multiplies again");
      yield* morphTo(EXPAND, b.y!);
      setCaption(
        `On a diagonal map each stretch multiplies the area: ${fmt(EXPAND[0][0])} × ${fmt(EXPAND[1][1])} = ${fmt(determinant2x2(EXPAND))}`,
      );
      yield* waitFor(b.hold2!);
    },
    *collapse() {
      const b = beats("collapse");
      liveSignedArea();
      setCaption("Drive the factor to zero — the parallelogram flattens, and the readout falls with it");
      yield* focusSquare(0.55, b.focus!);
      yield* morphTo(SINGULAR, b.morph!);
      yield* waitFor(b.hold!);
    },
    *["predict-negative"]() {
      const b = beats("predict-negative");
      setCaption("The factor reached 0. The columns are about to keep going — past each other.");
      yield* focusOrientation(b.focus!);
      yield* waitFor(b.ask!);
      setCaption("Predict: what can a NEGATIVE area factor mean? Watch the e₁ → e₂ sweep.");
      yield* waitFor(b.think!);
    },
    *negative() {
      const b = beats("negative");
      setCaption("Past zero the sweep runs the other way round — orientation reverses");
      yield* morphTo(NEGATIVE, b.morph!);
      yield* orientArc.lineWidth(7, b.up!);
      yield* orientArc.lineWidth(4.5, b.down!);
      yield* waitFor(b.hold!);
    },
    *sign() {
      const b = beats("sign");
      setTop("|det| = area · sign = orientation");
      setCaption("Magnitude says how much · sign says which handedness");
      yield* all(focusSquare(0.45, b.focus!), orientArc.opacity(0.9, b.focus!));
      yield* waitFor(b.hold!);
    },
    *summary() {
      const b = beats("summary");
      setCaption("Determinant = signed area scale of the transformation");
      yield* all(
        morphTo(A, b.morph!),
        ghostSquare.opacity(0.2, b.morph!),
        focusSquare(0.5, b.morph!),
      );
      e1Label.text("Ae₁");
      e2Label.text("Ae₂");
      liveSignedArea();
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of DETERMINANT_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
