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
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 3: determinants as signed area scaling.
 * Unit square → parallelogram spanned by A e₁, A e₂; area = |det|; sign = orientation.
 */

const A = DETERMINANT_LESSON_EXAMPLE.matrix as Matrix2x2;
const EXPAND = requireMatrixExample("uniform-scale").matrix as Matrix2x2;
const SINGULAR = requireMatrixExample("singular-collapse").matrix as Matrix2x2;
const NEGATIVE = requireMatrixExample("determinant-negative").matrix as Matrix2x2;

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

  const grid = makeStaticGrid(3);
  grid.opacity(0.55);
  view.add(grid);

  const origin = new Circle({ size: 14, fill: ROLE.text, opacity: 1 });
  view.add(origin);

  // Unit square / parallelogram (closed polyline through transformed corners).
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
    points: () => [new Vector2(0, 0), px([ma(), mc()])],
  });
  view.add(orientEdge);

  const e1 = makeArrow(ROLE.basis1, 6);
  e1.points(() => [new Vector2(0, 0), px([ma(), mc()])]);
  const e2 = makeArrow(ROLE.basis2, 6);
  e2.points(() => [new Vector2(0, 0), px([mb(), md()])]);
  view.add(e1);
  view.add(e2);

  const e1Label = makeLabel("e₁", ROLE.basis1);
  e1Label.position(() => px([ma(), mc()]).add(new Vector2(18, 18)));
  const e2Label = makeLabel("e₂", ROLE.basis2);
  e2Label.position(() => px([mb(), md()]).add(new Vector2(18, -8)));
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
  const detLabel = () => {
    const d = determinant2x2(matrix());
    return `det(A) ≈ ${fmt(d)} · |det| ≈ ${fmt(Math.abs(d))}`;
  };

  // Establishing frame at t=0.
  setTop("Unit square · area = 1");
  setCaption("Watch how A stretches signed area");
  top.opacity(1);
  caption.opacity(1);
  e1Label.opacity(1);
  e2Label.opacity(1);
  square.opacity(0.4);
  orientEdge.opacity(0.7);

  function* morphTo(target: Matrix2x2, dur: number): ThreadGenerator {
    yield* all(
      ma(target[0][0], dur, easeInOutCubic),
      mb(target[0][1], dur, easeInOutCubic),
      mc(target[1][0], dur, easeInOutCubic),
      md(target[1][1], dur, easeInOutCubic),
    );
  }

  const seconds = Object.fromEntries(
    DETERMINANT_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  const bodies: Record<string, () => ThreadGenerator> = {
    *identity() {
      setTop("Unit square · area = 1");
      setCaption("Identity: e₁ and e₂ span a square of area 1");
      yield* all(e1.end(1, 0.7), e2.end(1, 0.7), square.opacity(0.45, 0.6));
      yield* waitFor(seconds.identity - 1.3);
    },
    *basis() {
      setCaption("A moves the basis — columns become the new e₁, e₂");
      yield* morphTo(A, 1.6);
      setTop(detLabel());
      yield* waitFor(seconds.basis - 1.6);
    },
    *parallelogram() {
      setCaption("The unit square becomes the parallelogram spanned by Ae₁, Ae₂");
      yield* square.opacity(0.55, 0.8);
      yield* waitFor(seconds.parallelogram - 0.8);
    },
    *area() {
      setTop(detLabel());
      setCaption("Parallelogram area equals |det(A)|");
      yield* waitFor(seconds.area);
    },
    *expand() {
      setCaption("Positive expansion — visual transition toward a larger det");
      yield* morphTo(EXPAND, 1.5);
      setTop(detLabel());
      yield* waitFor(seconds.expand - 1.5);
    },
    *collapse() {
      setCaption("Toward det = 0 the parallelogram flattens onto a line");
      yield* morphTo(SINGULAR, 2);
      setTop(detLabel());
      // Keep vertices finite; singular still draws a degenerate polygon.
      yield* waitFor(seconds.collapse - 2);
    },
    *negative() {
      setCaption("Past zero: dashed edge flips — orientation reverses (not color alone)");
      yield* morphTo(NEGATIVE, 2);
      setTop(detLabel());
      yield* orientEdge.lineWidth(5, 0.4);
      yield* orientEdge.lineWidth(3, 0.4);
      yield* waitFor(seconds.negative - 2.8);
    },
    *sign() {
      setCaption("|det| = area factor · sign(det) = orientation");
      yield* waitFor(seconds.sign);
    },
    *summary() {
      setCaption("Determinant = signed area scale of the transformation");
      yield* morphTo(A, 1.2);
      setTop(detLabel());
      yield* waitFor(seconds.summary - 1.2);
    },
  };

  for (const segment of DETERMINANT_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
