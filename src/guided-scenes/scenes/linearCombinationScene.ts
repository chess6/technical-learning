import { Circle, Line, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { LINEAR_COMBINATION_EXAMPLE } from "../../lessons/exampleData";
import type { Matrix2x2 } from "../../math";
import { LINEAR_COMBINATION_SEGMENTS } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatSceneNumber,
  focusOpacities,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeSegment,
  makeStaticGrid,
  makeTransformedGrid,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Guided scene for Lesson 1: build linear combinations of two vectors, then
 * contrast an independent span (the whole plane) with a dependent span (a
 * single line). All concrete numbers come from the shared lesson example.
 */

const EX = LINEAR_COMBINATION_EXAMPLE;
const V = new Vector2(EX.v[0], EX.v[1]);
const W_IND = new Vector2(EX.wIndependent[0], EX.wIndependent[1]);
const W_DEP = new Vector2(EX.wDependent[0], EX.wDependent[1]);
// Fixed target p = v + w = (4, 1). Its (v, w)-coordinate grid is the standard
// lattice mapped by B, whose columns are v and w; p then lands on node (1, 1).
const P = new Vector2(EX.target[0], EX.target[1]);
const B_MATRIX: Matrix2x2 = [
  [EX.v[0], EX.wIndependent[0]],
  [EX.v[1], EX.wIndependent[1]],
];

const px = (v: Vector2): Vector2 => new Vector2(v.x * SCALE, -v.y * SCALE);
const fmt = (n: number) => formatSceneNumber(n, 1);

export const linearCombinationScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const grid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  grid.opacity(0.55);
  view.add(grid);

  // The (v, w) coordinate grid — standard lattice carried by B (columns v, w).
  // Hidden until the coordinates beat, where p lands on lattice node (1, 1).
  const bGrid = makeTransformedGrid(() => B_MATRIX, OVERLAY_CLEAR_HALF_EXTENT);
  bGrid.opacity(0);
  view.add(bGrid);

  const origin = new Circle({ size: 14, fill: ROLE.text, opacity: 1 });
  view.add(origin);

  // Live coefficients / directions.
  const wTip = createSignal(W_IND);
  const aCoef = createSignal(EX.initialA);
  const bCoef = createSignal(EX.initialB);

  // Reachable-set overlays (built first so arrows draw on top).
  const spanRegion = new Line({
    closed: true,
    fill: ROLE.original,
    stroke: ROLE.original,
    lineWidth: 1.5,
    opacity: 0,
    points: () => {
      const r = 1.1;
      const a = px(V.scale(r).add(wTip().scale(r)));
      const b = px(V.scale(r).sub(wTip().scale(r)));
      return [a, b, a.scale(-1), b.scale(-1)];
    },
  });
  view.add(spanRegion);

  const spanLine = new Line({
    stroke: ROLE.result,
    lineWidth: 4,
    lineDash: [10, 8],
    opacity: 0,
    points: () => [px(V.scale(1.8)), px(V.scale(-1.8))],
  });
  view.add(spanLine);

  // Component decomposition of v.
  const compH = makeSegment(ROLE.basis1, 2.5, true);
  compH.opacity(0).points(() => [new Vector2(0, 0), px(new Vector2(V.x, 0))]);
  const compV = makeSegment(ROLE.basis2, 2.5, true);
  compV.opacity(0).points(() => [px(new Vector2(V.x, 0)), px(V)]);
  view.add(compH);
  view.add(compV);

  // Head-to-tail helpers.
  const wFromV = makeArrow(ROLE.basis2, 4);
  wFromV.end(0).points(() => [px(V.scale(aCoef())), px(V.scale(aCoef()).add(wTip().scale(bCoef())))]);
  view.add(wFromV);

  // Primary arrows.
  const vArrow = makeArrow(ROLE.basis1);
  vArrow.end(0).points(() => [new Vector2(0, 0), px(V)]);
  const wArrow = makeArrow(ROLE.basis2);
  wArrow.end(0).points(() => [new Vector2(0, 0), px(wTip())]);
  const comboArrow = makeArrow(ROLE.result, 6);
  comboArrow
    .end(0)
    .points(() => [
      new Vector2(0, 0),
      px(V.scale(aCoef()).add(wTip().scale(bCoef()))),
    ]);
  view.add(comboArrow);
  view.add(vArrow);
  view.add(wArrow);

  // Fixed target point p (gold), used only in the basis / coordinate beats.
  const pArrow = makeArrow(ROLE.selected, 6);
  pArrow.end(0).points(() => [new Vector2(0, 0), px(P)]);
  view.add(pArrow);

  // Labels.
  const vLabel = makeLabel("v", ROLE.basis1);
  vLabel.opacity(0).position(() => px(V).add(new Vector2(20, -18)));
  const wLabel = makeLabel("w", ROLE.basis2);
  wLabel.opacity(0).position(() => px(wTip()).add(new Vector2(20, -8)));
  const pLabel = makeLabel("p", ROLE.selected);
  pLabel.opacity(0).position(px(P).add(new Vector2(22, -16)));
  view.add(vLabel);
  view.add(wLabel);
  view.add(pLabel);

  const eq = makeOverlayLabel("", ROLE.text, 42);
  eq.opacity(0).position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(eq);

  const caption = makeOverlayLabel("", ROLE.textMuted, 34);
  caption.opacity(0).position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const setEq = (text: string) => eq.text(text);
  const setCaption = (text: string) => caption.text(text);

  // Establishing shot: readable when paused at t=0 (before autoplay).
  setCaption("Two arrows from the origin — stretch and add them");
  caption.opacity(1);

  // Duration lookup keeps the animation length aligned with sceneTimings.
  const seconds = Object.fromEntries(
    LINEAR_COMBINATION_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  const bodies: Record<string, () => ThreadGenerator> = {
    *plane() {
      // Grid/origin already visible at t=0; gently settle into the watch frame.
      yield* all(grid.opacity(1, 0.6), origin.opacity(1, 0.01));
      yield* waitFor(seconds.plane - 0.6);
    },
    *["vector-v"]() {
      setEq("v = [ " + fmt(V.x) + ", " + fmt(V.y) + " ]");
      yield* all(eq.opacity(1, 0.5), vLabel.opacity(1, 0.5), vArrow.end(1, 1.4, easeInOutCubic));
      yield* waitFor(seconds["vector-v"] - 1.9);
    },
    *components() {
      setCaption("Coordinates = horizontal + vertical movement");
      yield* all(caption.opacity(1, 0.4), compH.opacity(1, 0.6));
      yield* compV.opacity(1, 0.6);
      yield* waitFor(seconds.components - 1.6);
      yield* all(compH.opacity(0.25, 0.5), compV.opacity(0.25, 0.5));
    },
    *["vector-w"]() {
      setEq("w = [ " + fmt(W_IND.x) + ", " + fmt(W_IND.y) + " ]");
      setCaption("A second, independent direction");
      yield* all(wLabel.opacity(1, 0.5), wArrow.end(1, 1.4, easeInOutCubic));
      yield* waitFor(seconds["vector-w"] - 1.4);
    },
    *addition() {
      setEq("v + w   (head to tail)");
      setCaption("Slide w so its tail sits on the tip of v");
      // a = b = 1 for a clean sum.
      yield* all(aCoef(1, 0.01), bCoef(1, 0.01));
      yield* wFromV.end(1, 1);
      yield* comboArrow.end(1, 1);
      yield* waitFor(seconds.addition - 2);
      yield* wFromV.end(0, 0.5);
    },
    *scaling() {
      setCaption("Scaling stretches, shrinks, or flips a direction");
      comboArrow.stroke(ROLE.basis1);
      yield* bCoef(0, 0.5); // isolate a·v
      setEq("a · v ,   a = 2");
      yield* aCoef(2, 1, easeInOutCubic);
      setEq("a · v ,   a = 0.5");
      yield* aCoef(0.5, 1, easeInOutCubic);
      setEq("a · v ,   a = −1  (reverses)");
      yield* aCoef(-1, 1, easeInOutCubic);
      yield* waitFor(seconds.scaling - 3.5);
      yield* aCoef(1, 0.6);
      comboArrow.stroke(ROLE.result);
    },
    *combination() {
      setEq("a · v + b · w");
      setCaption("Every combination is one reachable point");
      yield* focusOpacities([
        { node: comboArrow, opacity: 1 },
        { node: vArrow, opacity: 0.55 },
        { node: wArrow, opacity: 0.55 },
        { node: spanRegion, opacity: 0 },
        { node: spanLine, opacity: 0 },
      ]);
      yield* bCoef(1, 0.6);
      yield* aCoef(1.6, 0.9, easeInOutCubic);
      yield* bCoef(-0.7, 0.9, easeInOutCubic);
      yield* all(aCoef(0.6, 0.9, easeInOutCubic), bCoef(1.2, 0.9, easeInOutCubic));
      yield* waitFor(seconds.combination - 3.95);
    },
    *["span-plane"]() {
      // Name-after-intuition: feel the reachable set, then name it span.
      setEq("independent v, w");
      setCaption("Those combinations fill the whole plane");
      yield* all(aCoef(1, 0.6), bCoef(1, 0.6));
      yield* focusOpacities([
        { node: spanRegion, opacity: 0.22 },
        { node: comboArrow, opacity: 0.45 },
        { node: vArrow, opacity: 0.7 },
        { node: wArrow, opacity: 0.7 },
      ]);
      yield* waitFor(1.0);
      setCaption("That reachable set is the span of v and w");
      yield* waitFor(seconds["span-plane"] - 2.6);
    },
    *dependent() {
      setEq("w = 2 · v   (dependent)");
      setCaption("When directions line up, reachability collapses to a line");
      yield* spanRegion.opacity(0, 0.6);
      yield* wTip(W_DEP, 1.4, easeInOutCubic);
      yield* focusOpacities([
        { node: spanLine, opacity: 1 },
        { node: vArrow, opacity: 0.85 },
        { node: wArrow, opacity: 0.85 },
        { node: comboArrow, opacity: 0.4 },
      ]);
      yield* waitFor(seconds.dependent - 2.35);
    },
    *basis() {
      // Restore the independent pair and name it a basis of the plane.
      setEq("independent v, w  →  a basis");
      setCaption("In the plane, two independent directions form a basis");
      comboArrow.stroke(ROLE.result);
      yield* all(
        spanLine.opacity(0, 0.4),
        comboArrow.opacity(0, 0.4),
        wTip(W_IND, 1.2, easeInOutCubic),
      );
      yield* focusOpacities([
        { node: spanRegion, opacity: 0.22 },
        { node: vArrow, opacity: 1 },
        { node: wArrow, opacity: 1 },
        { node: vLabel, opacity: 1 },
        { node: wLabel, opacity: 1 },
      ]);
      yield* waitFor(seconds.basis - 1.6);
    },
    *coordinates() {
      // One fixed point p, two coordinate readings. p never moves.
      setEq("p in standard basis = ( 4, 1 )");
      setCaption("Read p against the standard grid: 4 right, 1 up");
      yield* all(
        spanRegion.opacity(0.08, 0.4),
        vArrow.opacity(0.5, 0.4),
        wArrow.opacity(0.5, 0.4),
      );
      yield* all(pArrow.end(1, 1.2, easeInOutCubic), pLabel.opacity(1, 0.6));
      yield* waitFor(1.2);
      // Fade in the (v, w) coordinate grid; p stays geometrically fixed.
      setCaption("Same arrow, read against basis (v, w):  p = 1·v + 1·w");
      yield* all(
        bGrid.opacity(0.6, 0.8),
        grid.opacity(0.22, 0.8),
        vArrow.opacity(0.95, 0.8),
        wArrow.opacity(0.95, 0.8),
      );
      setEq("p in basis (v, w) = ( 1, 1 )");
      yield* waitFor(1.4);
      setCaption("p never moved — only its coordinates changed");
      yield* waitFor(seconds.coordinates - 5.0);
    },
  };

  for (const segment of LINEAR_COMBINATION_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
