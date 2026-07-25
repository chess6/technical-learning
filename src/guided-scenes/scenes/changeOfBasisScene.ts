import { Circle, Line, Node, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { LINEAR_COMBINATION_EXAMPLE as EX } from "../../lessons/exampleData";
import {
  approximatelyEqualVector,
  coordinatesInBasis,
  isDiagonal,
  matrixInBasis,
  requireMatrixExample,
  type Matrix2x2,
  type Vector2 as MathVector2,
} from "../../math";
import { CHANGE_OF_BASIS_SEGMENTS } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatSceneNumber,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
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
 * Correctness discipline: the coordinates shown, and the diagonal matrix in the
 * final beat, come from `src/math`. `assertSceneMathIsConsistent` re-checks them
 * against Lesson 1's hand-worked values before a frame renders.
 */

const B1 = EX.v as MathVector2; // (1, 2)
const B2 = EX.wIndependent as MathVector2; // (3, -1)
const POINT = EX.target as MathVector2; // (4, 1)
const POINT_COORDS = coordinatesInBasis(B1, B2, POINT)!;

/** Lesson 11's matrix, and the eigenbasis that diagonalizes it. */
const A = requireMatrixExample("eigen-distinct").matrix; // [[3,1],[0,2]]
const EIGEN_1: MathVector2 = [1, 0];
const EIGEN_2: MathVector2 = [-1, 1];
const A_IN_EIGENBASIS = matrixInBasis(A, EIGEN_1, EIGEN_2)!;

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
}

const px = (v: MathVector2): Vector2 => new Vector2(v[0] * SCALE, -v[1] * SCALE);
const fmt = (n: number) => formatSceneNumber(n);
const matrixText = (m: Matrix2x2): string =>
  `[ ${fmt(m[0][0])}  ${fmt(m[0][1])} ; ${fmt(m[1][0])}  ${fmt(m[1][1])} ]`;

/** A grid of lines along b₁ and b₂ through the lattice they generate. */
function makeBasisGrid(first: MathVector2, second: MathVector2, extent = 3): Node {
  const group = new Node({});
  const line = (from: MathVector2, to: MathVector2, isAxis: boolean) =>
    new Line({
      stroke: isAxis ? ROLE.basis2 : ROLE.basis2,
      lineWidth: isAxis ? 2.5 : 1,
      opacity: isAxis ? 0.9 : 0.4,
      points: [px(from), px(to)],
    });
  for (let k = -extent; k <= extent; k += 1) {
    // Lines parallel to b₂, offset by k·b₁ …
    group.add(
      line(
        [k * first[0] - extent * second[0], k * first[1] - extent * second[1]],
        [k * first[0] + extent * second[0], k * first[1] + extent * second[1]],
        k === 0,
      ),
    );
    // …and lines parallel to b₁, offset by k·b₂.
    group.add(
      line(
        [k * second[0] - extent * first[0], k * second[1] - extent * first[1]],
        [k * second[0] + extent * first[0], k * second[1] + extent * first[1]],
        k === 0,
      ),
    );
  }
  return group;
}

export const changeOfBasisScene = makeScene2D(function* (view) {
  assertSceneMathIsConsistent();
  view.fill(ROLE.background);

  const standardGrid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  standardGrid.opacity(0.5);
  view.add(standardGrid);

  const basisGrid = makeBasisGrid(B1, B2);
  basisGrid.opacity(0);
  view.add(basisGrid);

  // --- The map's deforming outline (later beats) ---
  const m11 = createSignal(1);
  const m12 = createSignal(0);
  const m21 = createSignal(0);
  const m22 = createSignal(1);
  const outline = new Line({
    stroke: ROLE.transformed,
    lineWidth: 3,
    closed: true,
    opacity: 0,
    points: () =>
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ].map(([x, y]) =>
        px([m11() * x! + m12() * y!, m21() * x! + m22() * y!]),
      ),
  });
  view.add(outline);

  // --- Basis vectors of B, shown when its grid is up ---
  const b1Arrow = makeArrow(ROLE.basis2, 5);
  b1Arrow.points([new Vector2(0, 0), px(B1)]);
  b1Arrow.opacity(0);
  view.add(b1Arrow);
  const b2Arrow = makeArrow(ROLE.basis2, 5);
  b2Arrow.points([new Vector2(0, 0), px(B2)]);
  b2Arrow.opacity(0);
  view.add(b2Arrow);

  const origin = new Circle({ size: 12, fill: ROLE.text });
  view.add(origin);

  // --- THE arrow. Its position is written here and NOWHERE else. ---
  const arrow = makeArrow(ROLE.selected, 6);
  arrow.points([new Vector2(0, 0), px(POINT)]);
  view.add(arrow);
  const arrowDot = new Circle({ size: 16, fill: ROLE.selected });
  arrowDot.position(px(POINT));
  view.add(arrowDot);

  // --- Readouts ---
  const standardReadout = makeLabel("", ROLE.original, 30);
  standardReadout.position(px(POINT).add(new Vector2(76, -26)));
  standardReadout.opacity(0);
  view.add(standardReadout);
  const basisReadout = makeLabel("", ROLE.basis2, 30);
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

  const bodies: Record<string, () => ThreadGenerator> = {
    *["one-arrow"]() {
      setTop("One arrow on the usual grid");
      setCaption(`The point p sits here. Against the standard grid it reads (${fmt(POINT[0])}, ${fmt(POINT[1])}).`);
      standardReadout.text(`(${fmt(POINT[0])}, ${fmt(POINT[1])})`);
      yield* standardReadout.opacity(1, 0.6);
      yield* waitFor(1.6);
    },

    *["swap-grid"]() {
      setTop("Swap the grid, not the arrow");
      setCaption("Lesson 1's basis gives a second grid. Watch the arrow — it does not move.");
      // Snap the honest note on with the grid so scrubbing here reads correctly.
      honestNote.opacity(1);
      yield* all(
        basisGrid.opacity(1, 1),
        b1Arrow.opacity(1, 0.8),
        b2Arrow.opacity(1, 0.8),
        standardGrid.opacity(0.16, 1),
      );
      yield* waitFor(1.4);
    },

    *["new-readout"]() {
      setTop("A different name for the same point");
      setCaption(`Counted along the new grid, the same point reads (${fmt(POINT_COORDS[0])}, ${fmt(POINT_COORDS[1])}): one step along b₁, one along b₂.`);
      basisReadout.text(`(${fmt(POINT_COORDS[0])}, ${fmt(POINT_COORDS[1])})`);
      basisReadout.opacity(1);
      yield* all(arrowDot.size(24, 0.35), arrowDot.size(16, 0.35));
      yield* waitFor(1.6);
      setCaption("Two readouts, one arrow. Nothing about the point changed — only the grid used to name it.");
      yield* waitFor(1.6);
    },

    *["hidden-subscript"]() {
      setTop("The subscript that was always there");
      setCaption("So the first reading was never just a pair of numbers — it was the name in the standard basis.");
      standardReadout.text(`[p]_E = (${fmt(POINT[0])}, ${fmt(POINT[1])})`);
      basisReadout.text(`[p]_B = (${fmt(POINT_COORDS[0])}, ${fmt(POINT_COORDS[1])})`);
      yield* waitFor(2);
      setCaption("Every vector and every matrix since Lesson 2 has carried that hidden subscript.");
      yield* waitFor(1.6);
    },

    *["map-standard"]() {
      setTop("A map, described in the standard basis");
      setCaption("Now watch a map instead of a point. Here is its matrix in standard coordinates.");
      // Retire the point; the subject is the map now.
      standardReadout.opacity(0);
      basisReadout.opacity(0);
      arrow.opacity(0.15);
      arrowDot.opacity(0.15);
      basisGrid.opacity(0.25);
      b1Arrow.opacity(0);
      b2Arrow.opacity(0);
      standardGrid.opacity(0.5);
      honestNote.opacity(0);
      outline.opacity(1);
      matrixReadout.text(`[A]_E = ${matrixText(A)}`);
      matrixReadout.opacity(1);
      yield* morphMatrixEntries(m11, m12, m21, m22, A, 2.2);
      yield* waitFor(1.4);
    },

    *["map-eigenbasis"]() {
      setTop("The same deformation, described in another basis");
      setCaption("The shape and its motion are unchanged. Only the description is swapped.");
      // The outline is NOT re-animated: the deformation already happened and is
      // identical. Only the matrix beside it changes — which is the whole claim.
      //
      // SNAP the new description on the beat's first frame. Swapping it after a
      // wait would leave a learner who scrubs here looking at the standard-basis
      // matrix under a title announcing the other basis — the scene would be
      // contradicting itself at exactly the beat that carries the payoff.
      matrixReadout.text(`[A]_B = ${matrixText(A_IN_EIGENBASIS)}`);
      yield* all(matrixReadout.opacity(0.4, 0.3), matrixReadout.opacity(1, 0.4));
      yield* waitFor(1.2);
      setCaption("In this basis the matrix is diagonal: the map only scales along the two chosen directions.");
      yield* waitFor(2);
      setCaption("The map did not get simpler. The language did — and choosing that language is the next lesson's business.");
      yield* waitFor(1.4);
    },
  };

  for (const segment of CHANGE_OF_BASIS_SEGMENTS) {
    yield* runSegment(segment.duration, bodies[segment.id]!);
  }
});
