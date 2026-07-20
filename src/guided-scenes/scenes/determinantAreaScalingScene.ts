import { Circle, Line, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
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
import { DETERMINANT_SEGMENTS } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 3: determinants as signed area scaling.
 *
 * Quality-bar focus (highest impact only):
 * - Script-event contract: one communicative purpose per beat.
 * - Attention choreography: one focal relationship; dim the rest.
 * - Object continuity: same unit-square object morphs; ghost of the original.
 * - Successive transforms: diagonal stretch in two held stages so area multiplies.
 * - Name-after-intuition: feel the area factor before naming det(A).
 */

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

const px = (v: readonly [number, number]): Vector2 =>
  new Vector2(v[0] * SCALE, -v[1] * SCALE);

const fmt = (n: number): string => {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
};

function squarePoints(m: Matrix2x2): Vector2[] {
  return applyMatrixToUnitSquare(m).map((p) => px(p));
}

export const determinantAreaScalingScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const ma = createSignal(1);
  const mb = createSignal(0);
  const mc = createSignal(0);
  const md = createSignal(1);
  const matrix = (): Matrix2x2 => [
    [ma(), mb()],
    [mc(), md()],
  ];

  const grid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  grid.opacity(0.55);
  view.add(grid);

  const origin = new Circle({ size: 14, fill: ROLE.text, opacity: 1 });
  view.add(origin);

  // Ghost of the original unit square — continuity: "this became that."
  const ghostSquare = new Line({
    stroke: ROLE.original,
    lineWidth: 2,
    closed: true,
    fill: ROLE.original,
    opacity: 0.12,
    lineDash: [8, 8],
    points: squarePoints(IDENTITY),
  });
  view.add(ghostSquare);

  // Live unit square / parallelogram (same object throughout).
  const square = new Line({
    stroke: ROLE.original,
    lineWidth: 3,
    closed: true,
    fill: ROLE.original,
    opacity: 0.35,
    points: () => squarePoints(matrix()),
  });
  view.add(square);

  // Orientation cue: dashed edge from origin → Ae1 (not color-only).
  const orientEdge = new Line({
    stroke: ROLE.selected,
    lineWidth: 3,
    lineDash: [10, 8],
    endArrow: true,
    arrowSize: 12,
    opacity: 0.35,
    points: () => [new Vector2(0, 0), px([ma(), mc()])],
  });
  view.add(orientEdge);

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
  const areaFactorLabel = () => {
    const d = determinant2x2(matrix());
    return `area factor ≈ ${fmt(Math.abs(d))}`;
  };
  const detLabel = () => {
    const d = determinant2x2(matrix());
    return `det(A) ≈ ${fmt(d)} · |det| ≈ ${fmt(Math.abs(d))}`;
  };

  // Establishing frame at t=0 — square is the sole focal object.
  setTop("Unit square · area = 1");
  setCaption("Watch what happens to this region's area");
  top.opacity(1);
  caption.opacity(1);
  square.opacity(0.45);
  ghostSquare.opacity(0);
  orientEdge.opacity(0.2);

  function* morphTo(target: Matrix2x2, dur: number): ThreadGenerator {
    yield* all(
      ma(target[0][0], dur, easeInOutCubic),
      mb(target[0][1], dur, easeInOutCubic),
      mc(target[1][0], dur, easeInOutCubic),
      md(target[1][1], dur, easeInOutCubic),
    );
  }

  function* focusSquare(emphasis = 0.55): ThreadGenerator {
    yield* all(
      square.opacity(emphasis, 0.35),
      e1.opacity(0.35, 0.35),
      e2.opacity(0.35, 0.35),
      e1Label.opacity(0.35, 0.35),
      e2Label.opacity(0.35, 0.35),
      orientEdge.opacity(0.25, 0.35),
    );
  }

  function* focusBasis(): ThreadGenerator {
    yield* all(
      square.opacity(0.22, 0.35),
      e1.opacity(1, 0.35),
      e2.opacity(1, 0.35),
      e1Label.opacity(1, 0.35),
      e2Label.opacity(1, 0.35),
      orientEdge.opacity(0.55, 0.35),
    );
  }

  function* focusOrientation(): ThreadGenerator {
    yield* all(
      square.opacity(0.28, 0.35),
      e1.opacity(0.45, 0.35),
      e2.opacity(0.45, 0.35),
      e1Label.opacity(0.45, 0.35),
      e2Label.opacity(0.45, 0.35),
      orientEdge.opacity(1, 0.35),
    );
  }

  const seconds = Object.fromEntries(
    DETERMINANT_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  const bodies: Record<string, () => ThreadGenerator> = {
    *identity() {
      // Focal: unit square only. Basis arrives after the region is established.
      setTop("Unit square · area = 1");
      setCaption("One region to track — its area starts at 1");
      yield* all(
        e1.end(1, 0.7),
        e2.end(1, 0.7),
        e1Label.opacity(0.7, 0.7),
        e2Label.opacity(0.7, 0.7),
        square.opacity(0.5, 0.6),
      );
      yield* waitFor(seconds.identity - 1.3);
    },
    *basis() {
      // Focal: columns as landing spots (Lesson 2 callback). Square stays dim.
      setTop("Columns of A");
      setCaption("Lesson 2: columns are where e₁ and e₂ land");
      yield* focusBasis();
      yield* morphTo(A, 1.6);
      e1Label.text("Ae₁");
      e2Label.text("Ae₂");
      yield* waitFor(seconds.basis - 1.95);
    },
    *parallelogram() {
      // Focal: same square object, now a parallelogram; ghost shows identity.
      setTop("Same square · new shape");
      setCaption("The unit square itself becomes this parallelogram");
      yield* all(
        ghostSquare.opacity(0.22, 0.5),
        focusSquare(0.55),
      );
      yield* waitFor(seconds.parallelogram - 0.85);
    },
    *area() {
      // Name-after-intuition: feel the factor, then name det.
      setTop(areaFactorLabel());
      setCaption("That area is the scale factor for every region");
      yield* focusSquare(0.6);
      yield* waitFor(1.4);
      setTop(detLabel());
      setCaption("We call this scale factor the determinant of A");
      yield* waitFor(seconds.area - 1.75);
    },
    *expand() {
      // Successive transforms: two held stages so area multiplies visibly.
      setTop("Stretch in stages");
      setCaption("First stretch sideways — watch area × 2");
      yield* all(
        ghostSquare.opacity(0.18, 0.3),
        focusSquare(0.55),
        morphTo(X_STRETCH, 1.3),
      );
      setTop(`area = ${fmt(determinant2x2(X_STRETCH))}`);
      yield* waitFor(1.1);
      setCaption("Then stretch vertically — area multiplies again");
      yield* morphTo(EXPAND, 1.3);
      setTop(
        `area = ${fmt(EXPAND[0][0])} × ${fmt(EXPAND[1][1])} = ${fmt(determinant2x2(EXPAND))}`,
      );
      setCaption("For a diagonal map, area multiplies by each stretch");
      yield* waitFor(seconds.expand - 3.7);
    },
    *collapse() {
      // Contrast: area factor → 0.
      setTop(detLabel());
      setCaption("Drive the factor to zero — the parallelogram flattens");
      yield* focusSquare(0.55);
      yield* morphTo(SINGULAR, 2);
      setTop(detLabel());
      yield* waitFor(seconds.collapse - 2.35);
    },
    *negative() {
      // Focal: orientation edge flips past zero.
      setCaption("Past zero the dashed edge flips — orientation reverses");
      yield* focusOrientation();
      yield* morphTo(NEGATIVE, 2);
      setTop(detLabel());
      yield* orientEdge.lineWidth(5, 0.35);
      yield* orientEdge.lineWidth(3, 0.35);
      yield* waitFor(seconds.negative - 3.05);
    },
    *sign() {
      setTop("|det| = area · sign = orientation");
      setCaption("Magnitude says how much · sign says which handedness");
      yield* all(focusSquare(0.45), orientEdge.opacity(0.85, 0.4));
      yield* waitFor(seconds.sign - 0.4);
    },
    *summary() {
      setCaption("Determinant = signed area scale of the transformation");
      yield* all(
        morphTo(A, 1.2),
        ghostSquare.opacity(0.2, 0.5),
        focusSquare(0.5),
      );
      e1Label.text("Ae₁");
      e2Label.text("Ae₂");
      setTop(detLabel());
      yield* waitFor(seconds.summary - 1.2);
    },
  };

  for (const segment of DETERMINANT_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
