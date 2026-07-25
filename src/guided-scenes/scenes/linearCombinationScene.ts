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
import { LINEAR_COMBINATION_SEGMENTS, requireBeats } from "./sceneTimings";
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
  runSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Guided scene for Lesson 1: build linear combinations of two vectors, then
 * contrast an independent span (the whole plane) with a dependent span (a
 * single line), and finally read ONE fixed point in two bases. All concrete
 * numbers come from the shared lesson example.
 *
 * Two audit fixes shape the choreography:
 *
 *  - **w travels.** The `addition` beat used to grow a SECOND arrow in place
 *    under the caption "slide w so its tail sits on the tip of v". Now the same
 *    `wArrow` object is translated along v (`wShift`), leaving a dashed ghost
 *    where it started — so the head-to-tail construction is a motion, not an
 *    assertion, and the arrow keeps its identity.
 *  - **The coordinate payoff is predicted.** Reading p against the new grid is
 *    split into "read it in the standard basis + swap the grid" → a held
 *    prediction → "walk it out". The reveal re-uses the very same v and w
 *    arrows, so p's new name is *constructed* rather than announced.
 */

const SCENE_ID = "vectors-linear-combinations";

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

/**
 * The closing walk is only honest if v + w really is p — otherwise the two
 * arrows would land beside the point they claim to name.
 */
if (Math.abs(V.x + W_IND.x - P.x) > 1e-9 || Math.abs(V.y + W_IND.y - P.y) > 1e-9) {
  throw new Error("linearCombinationScene: v + w does not land on the target p.");
}

const px = (v: Vector2): Vector2 => new Vector2(v.x * SCALE, -v.y * SCALE);
const fmt = (n: number) => formatSceneNumber(n, 1);

export const linearCombinationScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const grid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  grid.opacity(0.55);
  view.add(grid);

  // The (v, w) coordinate grid — standard lattice carried by B (columns v, w).
  // Hidden until the coordinate arc, where p lands on lattice node (1, 1).
  const bGrid = makeTransformedGrid(() => B_MATRIX, OVERLAY_CLEAR_HALF_EXTENT);
  bGrid.opacity(0);
  view.add(bGrid);

  const origin = new Circle({ size: 14, fill: ROLE.text, opacity: 1 });
  view.add(origin);

  // Live coefficients / directions.
  const wTip = createSignal(W_IND);
  const aCoef = createSignal(EX.initialA);
  const bCoef = createSignal(EX.initialB);
  /**
   * How far w's TAIL has slid along a·v: 0 = at the origin, 1 = on v's tip.
   * This is what makes "slide w to the tip of v" an actual translation of the
   * same arrow rather than a second arrow appearing there.
   */
  const wShift = createSignal(0);
  const wTail = (): Vector2 => V.scale(aCoef() * wShift());

  // Reachable-set overlays (built first so arrows draw on top). Both wear the
  // same "reachable" role — they are the same idea in two cases, and are told
  // apart by shape (filled region vs dashed line), not by hue.
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
    stroke: ROLE.original,
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

  // Where w was before it slid — so the travel has a visible "from".
  const wGhost = makeArrow(ROLE.dim, 3);
  wGhost.opacity(0).points(() => [new Vector2(0, 0), px(wTip())]);
  view.add(wGhost);

  // Head-to-tail helper used by the dependent-inside beat (b·w from a·v's tip).
  const wFromV = makeArrow(ROLE.basis2, 4);
  wFromV
    .end(0)
    .points(() => [
      px(V.scale(aCoef())),
      px(V.scale(aCoef()).add(wTip().scale(bCoef()))),
    ]);
  view.add(wFromV);

  // Primary arrows.
  const vArrow = makeArrow(ROLE.basis1);
  vArrow.end(0).points(() => [new Vector2(0, 0), px(V)]);
  const wArrow = makeArrow(ROLE.basis2);
  wArrow.end(0).points(() => [px(wTail()), px(wTail().add(wTip()))]);
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

  // Fixed target point p (the object under discussion in the coordinate arc).
  const pArrow = makeArrow(ROLE.selected, 6);
  pArrow.end(0).points(() => [new Vector2(0, 0), px(P)]);
  view.add(pArrow);
  const pDot = new Circle({ size: 16, fill: ROLE.selected, opacity: 0 });
  pDot.position(px(P));
  view.add(pDot);

  // Labels.
  const vLabel = makeLabel("v", ROLE.basis1);
  vLabel.opacity(0).position(() => px(V).add(new Vector2(20, -18)));
  const wLabel = makeLabel("w", ROLE.basis2);
  // Parked beside the SHAFT, not the tip: once w slides onto v's tip its head
  // sits exactly on p, and a tip-anchored label printed itself over p's.
  wLabel.opacity(0).position(() => {
    const tail = wTail();
    const tip = tail.add(wTip());
    const mid = tail.add(tip).scale(0.5);
    return px(mid).add(new Vector2(14, 22));
  });
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

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const bodies: Record<string, () => ThreadGenerator> = {
    *plane() {
      const b = beats("plane");
      // Grid/origin already visible at t=0; gently settle into the watch frame.
      yield* grid.opacity(1, b.settle!);
      yield* waitFor(b.hold!);
    },
    *["vector-v"]() {
      const b = beats("vector-v");
      setEq("v = [ " + fmt(V.x) + ", " + fmt(V.y) + " ]");
      yield* all(
        eq.opacity(1, b.grow!),
        vLabel.opacity(1, b.grow!),
        vArrow.end(1, b.grow!, easeInOutCubic),
      );
      yield* waitFor(b.hold!);
    },
    *components() {
      const b = beats("components");
      setCaption("Coordinates = horizontal + vertical movement");
      yield* all(caption.opacity(1, b.compH!), compH.opacity(1, b.compH!));
      yield* compV.opacity(1, b.compV!);
      yield* waitFor(b.hold!);
      yield* all(compH.opacity(0.25, b.retire!), compV.opacity(0.25, b.retire!));
    },
    *["vector-w"]() {
      const b = beats("vector-w");
      setEq("w = [ " + fmt(W_IND.x) + ", " + fmt(W_IND.y) + " ]");
      setCaption("A second, independent direction");
      yield* all(
        wLabel.opacity(1, b.grow!),
        wArrow.end(1, b.grow!, easeInOutCubic),
      );
      yield* waitFor(b.hold!);
    },
    *addition() {
      const b = beats("addition");
      setEq("v + w   (head to tail)");
      setCaption("Slide w so its tail sits on the tip of v — the same arrow, moved");
      // a = b = 1 for a clean sum. Instantaneous: nothing bound to these is
      // visible yet (comboArrow.end is 0), so there is nothing to snap.
      aCoef(1);
      bCoef(1);
      // The ghost is placed exactly where w already is, so revealing it changes
      // no pixel — it only becomes visible as w departs.
      wGhost.opacity(0.55);
      yield* wShift(1, b.slide!, easeInOutCubic);
      setEq("v + w   =   the tip w now points at");
      yield* comboArrow.end(1, b.sum!, easeInOutCubic);
      yield* comboArrow.lineWidth(9, b.pulseUp!);
      yield* comboArrow.lineWidth(6, b.pulseDown!);
      yield* waitFor(b.hold!);
      // Send w home so every later beat starts from the same picture.
      yield* all(wShift(0, b.retire!, easeInOutCubic), wGhost.opacity(0, b.retire!));
    },
    *scaling() {
      const b = beats("scaling");
      setCaption("Scaling stretches, shrinks, or flips a direction");
      comboArrow.stroke(ROLE.basis1);
      yield* bCoef(0, b.isolate!); // isolate a·v
      setEq("a · v ,   a = 2");
      yield* aCoef(2, b.a2!, easeInOutCubic);
      setEq("a · v ,   a = 0.5");
      yield* aCoef(0.5, b.aHalf!, easeInOutCubic);
      setEq("a · v ,   a = −1  (reverses)");
      yield* aCoef(-1, b.aNeg!, easeInOutCubic);
      yield* waitFor(b.hold!);
      yield* aCoef(1, b.restore!);
      comboArrow.stroke(ROLE.result);
    },
    *combination() {
      const b = beats("combination");
      setEq("a · v + b · w");
      setCaption("Every combination is one reachable point");
      yield* focusOpacities(
        [
          { node: comboArrow, opacity: 1 },
          { node: vArrow, opacity: 0.55 },
          { node: wArrow, opacity: 0.55 },
          { node: spanRegion, opacity: 0 },
          { node: spanLine, opacity: 0 },
        ],
        b.focus!,
      );
      yield* bCoef(1, b.b1!);
      yield* aCoef(1.6, b.move1!, easeInOutCubic);
      yield* bCoef(-0.7, b.move2!, easeInOutCubic);
      yield* all(
        aCoef(0.6, b.move3!, easeInOutCubic),
        bCoef(1.2, b.move3!, easeInOutCubic),
      );
      yield* waitFor(b.hold!);
    },
    *["span-plane"]() {
      const b = beats("span-plane");
      // Name-after-intuition: feel the reachable set, then name it span.
      setEq("independent v, w");
      setCaption("Those combinations fill the whole plane");
      yield* all(aCoef(1, b.reset!), bCoef(1, b.reset!));
      yield* focusOpacities(
        [
          { node: spanRegion, opacity: 0.22 },
          { node: comboArrow, opacity: 0.45 },
          { node: vArrow, opacity: 0.7 },
          { node: wArrow, opacity: 0.7 },
        ],
        b.fill!,
      );
      yield* waitFor(b.hold!);
      setCaption("That reachable set is the span of v and w");
      yield* waitFor(b.name!);
    },
    *dependent() {
      const b = beats("dependent");
      setEq("w = 2 · v   (dependent)");
      setCaption("When directions line up, reachability collapses to a line");
      yield* spanRegion.opacity(0, b.clear!);
      yield* wTip(W_DEP, b.collapse!, easeInOutCubic);
      yield* focusOpacities(
        [
          { node: spanLine, opacity: 1 },
          { node: vArrow, opacity: 0.85 },
          { node: wArrow, opacity: 0.85 },
          { node: comboArrow, opacity: 0.4 },
        ],
        b.focus!,
      );
      yield* waitFor(b.hold!);
    },
    *["dependent-inside"]() {
      const b = beats("dependent-inside");
      // Target r = (3, 6) = 3v lies ON the dependent line, so infinitely many
      // (a, b) reach it: with w = 2v, a·v + b·w = r reduces to a + 2b = 3.
      setEq("a + 2·b = 3   (w = 2·v)");
      setCaption("Target r = (3, 6) sits on the line — many (a, b) reach it");
      comboArrow.stroke(ROLE.target);
      yield* all(aCoef(3, b.setup!), bCoef(0, b.setup!)); // (3, 0)
      yield* focusOpacities(
        [
          { node: comboArrow, opacity: 1 },
          { node: spanLine, opacity: 1 },
          { node: wFromV, opacity: 1 },
          { node: vArrow, opacity: 0.7 },
          { node: wArrow, opacity: 0.7 },
        ],
        b.focus!,
      );
      yield* wFromV.end(1, b.grow!);
      yield* waitFor(b.hold!);
      setCaption("Slide b and set a = 3 − 2b — the tip never leaves r");
      yield* all(
        aCoef(1, b.move1!, easeInOutCubic),
        bCoef(1, b.move1!, easeInOutCubic),
      ); // (1, 1)
      yield* all(
        aCoef(-1, b.move2!, easeInOutCubic),
        bCoef(2, b.move2!, easeInOutCubic),
      ); // (-1, 2)
      yield* waitFor(b.hold2!);
      yield* wFromV.end(0, b.retire!);
      comboArrow.stroke(ROLE.result);
    },
    *basis() {
      const b = beats("basis");
      // Restore the independent pair and name it a basis of the plane.
      setEq("independent v, w  →  a basis");
      setCaption("In the plane, two independent directions form a basis");
      yield* all(
        spanLine.opacity(0, b.restore!),
        comboArrow.opacity(0, b.restore!),
        wTip(W_IND, b.restore!, easeInOutCubic),
      );
      // Return the coefficients to 1 for the coordinate arc. Done only AFTER
      // comboArrow has faded to 0, so nothing bound to them is on screen and the
      // reset is invisible — and it is what lets the closing walk put w's tail on
      // v's TIP rather than on a·v for some stale a.
      aCoef(1);
      bCoef(1);
      yield* focusOpacities(
        [
          { node: spanRegion, opacity: 0.22 },
          { node: vArrow, opacity: 1 },
          { node: wArrow, opacity: 1 },
          { node: vLabel, opacity: 1 },
          { node: wLabel, opacity: 1 },
        ],
        b.focus!,
      );
      yield* waitFor(b.hold!);
    },
    *["read-standard"]() {
      const b = beats("read-standard");
      // One fixed point p. Its position is written once, at construction, and
      // never touched again — "p never moves" is a property of the scene, not
      // a claim in a caption.
      setEq(`p in standard basis = ( ${fmt(P.x)}, ${fmt(P.y)} )`);
      setCaption("Read p against the standard grid: 4 right, 1 up");
      yield* all(
        pArrow.end(1, b.pIn!, easeInOutCubic),
        pDot.opacity(1, b.pIn!),
        pLabel.opacity(1, b.pIn!),
        spanRegion.opacity(0.08, b.pIn!),
        vArrow.opacity(0.5, b.pIn!),
        wArrow.opacity(0.5, b.pIn!),
      );
      yield* waitFor(b.hold!);
      setCaption("Now lay a different grid over it — the one built from v and w");
      yield* all(
        bGrid.opacity(0.9, b.swap!),
        grid.opacity(0.22, b.swap!),
        vArrow.opacity(0.95, b.swap!),
        wArrow.opacity(0.95, b.swap!),
      );
      yield* waitFor(b.hold2!);
    },
    *["predict-coordinates"]() {
      const b = beats("predict-coordinates");
      setCaption("p has not moved, and both grid directions are on screen.");
      yield* all(
        vArrow.lineWidth(8, b.emphasize!),
        wArrow.lineWidth(8, b.emphasize!),
      );
      setEq("p in basis (v, w) = ( ?, ? )");
      setCaption(
        "Predict: how many steps along v, and how many along w, land on p?",
      );
      yield* waitFor(b.ask!);
      yield* waitFor(b.think!);
    },
    *coordinates() {
      const b = beats("coordinates");
      setCaption("Walk it out: one step along v…");
      yield* all(
        vArrow.lineWidth(6, b.walk1!),
        wArrow.lineWidth(6, b.walk1!),
        vArrow.opacity(1, b.walk1!),
      );
      setCaption("…then one step along w — and the walk ends exactly on p.");
      // The SAME w arrow used for the sum in `addition` slides onto v's tip
      // again; v + w = p, so the construction lands on the point by
      // construction rather than by a caption saying it does.
      yield* wShift(1, b.walk2!, easeInOutCubic);
      setEq(`p in basis (v, w) = ( ${fmt(EX.coordinatesInBasis[0])}, ${fmt(EX.coordinatesInBasis[1])} )`);
      yield* all(pDot.size(26, b.reveal! / 2), pDot.size(16, b.reveal! / 2));
      setCaption("p never moved — only its coordinates changed");
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of LINEAR_COMBINATION_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
