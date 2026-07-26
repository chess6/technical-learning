import { Circle, Line, Node, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { LINEAR_COMBINATION_EXAMPLE as EX } from "../../lessons/exampleData";
import {
  approximatelyEqualVector,
  coordinatesInBasis,
  isDiagonal,
  matrixInBasis,
  matrixVectorMultiply,
  requireMatrixExample,
  scaleVector,
  type Matrix2x2,
  type Vector2 as MathVector2,
} from "../../math";
import { CHANGE_OF_BASIS_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatSceneNumber,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeSegment,
  makeStaticGrid,
  morphMatrixEntries,
  runSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 10 Watch scene — "Change of Basis".
 *
 * The lesson's central error is believing a change of basis moves the vector.
 * This scene makes that impossible to believe by CONSTRUCTION: the arrow's
 * position is written exactly once, at setup, and never again. Nothing in the
 * timeline can move it. What changes is the grid drawn underneath and the
 * readout drawn beside it.
 *
 * The basis is Lesson 1's — deliberately neither orthogonal nor unit length, so
 * the scene never suggests a change of basis needs either (that is Lesson 12).
 *
 * Two audit fixes:
 *
 *  - **The new name is predicted, then CONSTRUCTED.** Both grid directions are
 *    lit, the learner is asked how many steps of each land on p, and the reveal
 *    walks b₁ then b₂ head-to-tail onto the arrow's own tip. The readout is the
 *    end of a walk rather than a number that appears beside a still picture.
 *  - **"The same deformation" is re-run.** `map-eigenbasis` used to make its
 *    claim over a frozen, already-deformed square: nothing moved during the beat
 *    that says the motion is identical, and the "other basis" was never drawn.
 *    The plane now returns to the identity and deforms AGAIN — same matrix, same
 *    path — with the eigenbasis on screen, so "diagonal" is watched: each of the
 *    two drawn directions only stretches, by 3 and by 2, and never turns.
 *
 * Correctness discipline: the coordinates shown, and the diagonal matrix in the
 * final beat, come from `src/math`. `assertSceneMathIsConsistent` re-checks them
 * against Lesson 1's hand-worked values before a frame renders.
 */

const SCENE_ID = "change-of-basis";

const B1 = EX.v as MathVector2; // (1, 2)
const B2 = EX.wIndependent as MathVector2; // (3, -1)
const POINT = EX.target as MathVector2; // (4, 1)
const POINT_COORDS = coordinatesInBasis(B1, B2, POINT)!;

/** Lesson 11's matrix, and the eigenbasis that diagonalizes it. */
const A = requireMatrixExample("eigen-distinct").matrix; // [[3,1],[0,2]]
const EIGEN_1: MathVector2 = [1, 0];
const EIGEN_2: MathVector2 = [-1, 1];
const A_IN_EIGENBASIS = matrixInBasis(A, EIGEN_1, EIGEN_2)!;
/** Drawn length of each eigendirection, in math units. */
const EIGEN_DRAW = 1.2;

function assertSceneMathIsConsistent(): void {
  // Lesson 1 worked these coordinates by hand; the scene must agree with it.
  if (!approximatelyEqualVector(POINT_COORDS, EX.coordinatesInBasis, 1e-9)) {
    throw new Error("changeOfBasisScene: coordinates disagree with Lesson 1.");
  }
  // Rebuilding the point from its coordinates must land back on the point.
  const rebuilt: MathVector2 = [
    POINT_COORDS[0] * B1[0] + POINT_COORDS[1] * B2[0],
    POINT_COORDS[0] * B1[1] + POINT_COORDS[1] * B2[1],
  ];
  if (!approximatelyEqualVector(rebuilt, POINT, 1e-9)) {
    throw new Error("changeOfBasisScene: coordinates do not rebuild the point.");
  }
  // The final beat's claim is that the description became diagonal.
  if (!isDiagonal(A_IN_EIGENBASIS, 1e-9)) {
    throw new Error("changeOfBasisScene: the eigenbasis description is not diagonal.");
  }
  // …and it is only legible as "each direction only stretches" if the two drawn
  // directions really are eigenvectors, each scaled by its diagonal entry.
  for (const [index, dir] of [EIGEN_1, EIGEN_2].entries()) {
    const image = matrixVectorMultiply(A, dir);
    const lambda = A_IN_EIGENBASIS[index]![index]!;
    if (!approximatelyEqualVector(image, scaleVector(dir, lambda), 1e-9)) {
      throw new Error(
        `changeOfBasisScene: drawn direction ${index + 1} is not scaled by its diagonal entry.`,
      );
    }
  }
}

const px = (v: MathVector2): Vector2 => new Vector2(v[0] * SCALE, -v[1] * SCALE);
const fmt = (n: number) => formatSceneNumber(n);
const matrixText = (m: Matrix2x2): string =>
  `[ ${fmt(m[0][0])}  ${fmt(m[0][1])} ; ${fmt(m[1][0])}  ${fmt(m[1][1])} ]`;

/**
 * A grid of lines along `first` and `second`.
 *
 * The two families are CO-EQUAL, so they get the co-equal pair roles rather
 * than one shared hue: the line family running along `first` wears `firstColor`
 * and the family running along `second` wears `secondColor`, and the two lines
 * through the origin are drawn heavier. That is what lets a learner count "one
 * step along b₁, one along b₂" without being told which is which.
 */
function makeBasisGrid(
  first: MathVector2,
  second: MathVector2,
  firstColor: string,
  secondColor: string,
  extent = 3,
): Node {
  const group = new Node({});
  const line = (from: MathVector2, to: MathVector2, isAxis: boolean, color: string) =>
    new Line({
      stroke: color,
      lineWidth: isAxis ? 2.5 : 1,
      opacity: isAxis ? 0.9 : 0.4,
      points: [px(from), px(to)],
    });
  for (let k = -extent; k <= extent; k += 1) {
    // Lines running along b₂, offset by k·b₁ …
    group.add(
      line(
        [k * first[0] - extent * second[0], k * first[1] - extent * second[1]],
        [k * first[0] + extent * second[0], k * first[1] + extent * second[1]],
        k === 0,
        secondColor,
      ),
    );
    // …and lines running along b₁, offset by k·b₂.
    group.add(
      line(
        [k * second[0] - extent * first[0], k * second[1] - extent * first[1]],
        [k * second[0] + extent * first[0], k * second[1] + extent * first[1]],
        k === 0,
        firstColor,
      ),
    );
  }
  return group;
}

export const changeOfBasisScene = makeScene2D(function* (view) {
  assertSceneMathIsConsistent();
  view.fill(ROLE.background);

  const standardGrid = makeStaticGrid({
    x: 4.25,
    y: OVERLAY_CLEAR_HALF_EXTENT,
  });
  standardGrid.opacity(0.5);
  view.add(standardGrid);

  const basisGrid = makeBasisGrid(B1, B2, ROLE.basis1, ROLE.basis2);
  basisGrid.opacity(0);
  view.add(basisGrid);

  const eigenGrid = makeBasisGrid(EIGEN_1, EIGEN_2, ROLE.basis1, ROLE.basis2, 3);
  eigenGrid.opacity(0);
  view.add(eigenGrid);

  // --- The map's deforming outline (later beats) ---
  const m11 = createSignal(1);
  const m12 = createSignal(0);
  const m21 = createSignal(0);
  const m22 = createSignal(1);
  const liveMatrix = (): Matrix2x2 => [
    [m11(), m12()],
    [m21(), m22()],
  ];
  const outline = new Line({
    stroke: ROLE.transformed,
    lineWidth: 3,
    closed: true,
    opacity: 0,
    points: () =>
      (
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ] as MathVector2[]
      ).map((corner) => px(matrixVectorMultiply(liveMatrix(), corner))),
  });
  view.add(outline);

  // --- Basis vectors of B, shown when its grid is up (a co-equal pair) ---
  const b1Arrow = makeArrow(ROLE.basis1, 5);
  b1Arrow.points([new Vector2(0, 0), px(B1)]);
  b1Arrow.opacity(0);
  view.add(b1Arrow);
  const b2Arrow = makeArrow(ROLE.basis2, 5);
  b2Arrow.points([new Vector2(0, 0), px(B2)]);
  b2Arrow.opacity(0);
  view.add(b2Arrow);

  /**
   * The coordinate WALK: one step along b₁ from the origin, then one along b₂
   * from its tip. Because POINT_COORDS rebuilds the point (asserted above), the
   * walk terminates exactly on p — the readout is the end of a construction.
   */
  const walkT = createSignal(0);
  const walk1 = makeSegment(ROLE.basis1, 5);
  walk1.points(() => [
    new Vector2(0, 0),
    px(scaleVector(B1, POINT_COORDS[0] * Math.min(1, walkT()))),
  ]);
  walk1.opacity(0);
  view.add(walk1);
  const walk2 = makeSegment(ROLE.basis2, 5);
  walk2.points(() => {
    const start = scaleVector(B1, POINT_COORDS[0]);
    const t = Math.max(0, walkT() - 1);
    const step = scaleVector(B2, POINT_COORDS[1] * t);
    return [px(start), px([start[0] + step[0], start[1] + step[1]])];
  });
  walk2.opacity(0);
  view.add(walk2);

  // --- The eigenbasis, drawn only in the final beat. Both arrows ride the LIVE
  // matrix, so "this basis only gets stretched" is a fact of the picture. ---
  const eigenArrows = [EIGEN_1, EIGEN_2].map((dir, i) => {
    const arrow = makeArrow(i === 0 ? ROLE.basis1 : ROLE.basis2, 6);
    arrow.points(() => [
      new Vector2(0, 0),
      px(matrixVectorMultiply(liveMatrix(), scaleVector(dir, EIGEN_DRAW))),
    ]);
    arrow.opacity(0);
    view.add(arrow);
    return arrow;
  });

  const origin = new Circle({ size: 12, fill: ROLE.text });
  view.add(origin);

  // --- THE arrow. Its position is written here and NOWHERE else. ---
  const arrow = makeArrow(ROLE.selected, 6, "semantic:vector:p");
  arrow.points([new Vector2(0, 0), px(POINT)]);
  view.add(arrow);
  const arrowDot = new Circle({ size: 16, fill: ROLE.selected });
  arrowDot.position(px(POINT));
  view.add(arrowDot);

  // --- Readouts. Neither wears a role hue: they are two NAMES for one point,
  // not two objects, and are told apart by their basis subscript. ---
  const standardReadout = makeLabel(
    "",
    ROLE.textMuted,
    30,
    "semantic:readout:p-standard",
  );
  standardReadout.position(px(POINT).add(new Vector2(76, -26)));
  standardReadout.opacity(0);
  view.add(standardReadout);
  const basisReadout = makeLabel("", ROLE.text, 30);
  basisReadout.position(px(POINT).add(new Vector2(76, 22)));
  basisReadout.opacity(0);
  view.add(basisReadout);

  const matrixReadout = makeLabel("", ROLE.transformed, 30);
  matrixReadout.position(new Vector2(-232, -150));
  matrixReadout.opacity(0);
  view.add(matrixReadout);

  const honestNote = makeLabel(
    "this basis is neither perpendicular nor unit length — neither is required",
    ROLE.dim,
    19,
  );
  honestNote.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y + 40));
  honestNote.opacity(0);
  view.add(honestNote);

  const top = makeOverlayLabel("One arrow on the usual grid", ROLE.text, 34);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 25);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);
  const setTop = (s: string) => top.text(s);
  const setCaption = (s: string) => caption.text(s);

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const bodies: Record<string, () => ThreadGenerator> = {
    *["one-arrow"]() {
      const b = beats("one-arrow");
      setTop("One arrow on the usual grid");
      setCaption(`The point p sits here. Against the standard grid it reads (${fmt(POINT[0])}, ${fmt(POINT[1])}).`);
      standardReadout.text(`(${fmt(POINT[0])}, ${fmt(POINT[1])})`);
      yield* standardReadout.opacity(1, b.pause!);
      yield* waitFor(b.hold!);
    },

    *["swap-grid"]() {
      const b = beats("swap-grid");
      setTop("Swap the grid, not the arrow");
      setCaption("Lesson 1's basis gives a second grid. Watch the arrow — it does not move.");
      // Snap the honest note on with the grid so scrubbing here reads correctly.
      honestNote.opacity(1);
      yield* all(
        basisGrid.opacity(1, b.grid!),
        b1Arrow.opacity(1, b.grid!),
        b2Arrow.opacity(1, b.grid!),
        standardGrid.opacity(0.16, b.grid!),
      );
      yield* waitFor(b.hold!);
    },

    *["predict-readout"]() {
      const b = beats("predict-readout");
      setTop("Predict: what does p read now?");
      setCaption("Both grid directions are lit, and p has not moved a pixel.");
      yield* all(
        b1Arrow.lineWidth(8, b.pause!),
        b2Arrow.lineWidth(8, b.pause!),
      );
      basisReadout.text("[p]_B = ( ?, ? )");
      basisReadout.opacity(1);
      setCaption("Predict: how many steps along b₁, and how many along b₂, land on p?");
      yield* waitFor(b.ask!);
      yield* waitFor(b.think!);
    },

    *["new-readout"]() {
      const b = beats("new-readout");
      setTop("A different name for the same point");
      setCaption("Walk it: one step along b₁…");
      walk1.opacity(1);
      walk2.opacity(1);
      yield* all(
        b1Arrow.lineWidth(5, b.walk1!),
        b2Arrow.lineWidth(5, b.walk1!),
        walkT(1, b.walk1!, easeInOutCubic),
      );
      setCaption("…then one step along b₂ — and the walk ends exactly on p.");
      yield* walkT(2, b.walk2!, easeInOutCubic);
      basisReadout.text(`[p]_B = (${fmt(POINT_COORDS[0])}, ${fmt(POINT_COORDS[1])})`);
      yield* all(arrowDot.size(24, b.readout! / 2), arrowDot.size(16, b.readout! / 2));
      yield* waitFor(b.hold!);
      setCaption("Two readouts, one arrow. Nothing about the point changed — only the grid used to name it.");
      yield* waitFor(b.hold2!);
    },

    *["hidden-subscript"]() {
      const b = beats("hidden-subscript");
      setTop("The subscript that was always there");
      setCaption("So the first reading was never just a pair of numbers — it was the name in the standard basis.");
      standardReadout.text(`[p]_E = (${fmt(POINT[0])}, ${fmt(POINT[1])})`);
      basisReadout.text(`[p]_B = (${fmt(POINT_COORDS[0])}, ${fmt(POINT_COORDS[1])})`);
      yield* waitFor(b.hold!);
      setCaption("Every vector and every matrix since Lesson 2 has carried that hidden subscript.");
      yield* waitFor(b.hold2!);
    },

    *["map-standard"]() {
      const b = beats("map-standard");
      setTop("A map, described in the standard basis");
      setCaption("Now watch a map instead of a point. Here is its matrix in standard coordinates.");
      // Retire the point; the subject is the map now.
      standardReadout.opacity(0);
      basisReadout.opacity(0);
      walk1.opacity(0);
      walk2.opacity(0);
      arrow.opacity(0.15);
      arrowDot.opacity(0.15);
      basisGrid.opacity(0);
      b1Arrow.opacity(0);
      b2Arrow.opacity(0);
      standardGrid.opacity(0.5);
      honestNote.opacity(0);
      outline.opacity(1);
      matrixReadout.text(`[A]_E = ${matrixText(A)}`);
      matrixReadout.opacity(1);
      yield* morphMatrixEntries(m11, m12, m21, m22, A, b.morph!);
      yield* waitFor(b.hold!);
    },

    *["map-eigenbasis"]() {
      const b = beats("map-eigenbasis");
      setTop("The same deformation, described in another basis");
      setCaption("Undo it, and lay a different basis underneath — these two directions.");
      // Return to the identity WITH the outline on screen, so the replay starts
      // from the same place the first run did.
      yield* all(
        morphMatrixEntries(m11, m12, m21, m22, [[1, 0], [0, 1]], b.reset!),
        eigenGrid.opacity(0.55, b.reset!),
        eigenArrows[0]!.opacity(1, b.reset!),
        eigenArrows[1]!.opacity(1, b.reset!),
        standardGrid.opacity(0.18, b.reset!),
      );
      // SNAP the new description on before the replay: a learner scrubbing here
      // must not see the standard-basis matrix under a title announcing another.
      matrixReadout.text(`[A]_B = ${matrixText(A_IN_EIGENBASIS)}`);
      yield* waitFor(b.hold!);
      setCaption("Now run exactly the same matrix again — identical motion, different description.");
      yield* morphMatrixEntries(m11, m12, m21, m22, A, b.replay!);
      yield* waitFor(b.hold2!);
      setCaption(
        `In this basis the matrix is diagonal: neither drawn direction turns — one is stretched by ${fmt(A_IN_EIGENBASIS[0][0])}, the other by ${fmt(A_IN_EIGENBASIS[1][1])}.`,
      );
      yield* waitFor(b.hold3!);
    },
  };

  for (const segment of CHANGE_OF_BASIS_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
