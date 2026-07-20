import { Circle, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { MATRIX_LESSON_EXAMPLE } from "../../lessons/exampleData";
import { matrixVectorMultiply, type Matrix2x2 } from "../../math";
import { MATRIX_TRANSFORMATION_SEGMENTS } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatSceneNumber,
  focusOpacities,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
  makeTransformedGrid,
  morphMatrixEntries,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Guided scene for Lesson 2: a 2x2 matrix moves the basis vectors, deforms the
 * grid, carries a sample vector along, and tours a few canonical
 * transformations. The concrete matrix is the shared A = [[2, 1], [0, 1]].
 *
 * Quality-bar focus: column→Aeᵢ identity (tip coordinates bind column to
 * vector), attention focus during column beats, shared morph helper.
 */

const A = MATRIX_LESSON_EXAMPLE.matrix as Matrix2x2;
const SAMPLE = (MATRIX_LESSON_EXAMPLE.inputVector ?? [1.5, 0.5]) as [
  number,
  number,
];

const px = (v: readonly [number, number]): Vector2 =>
  new Vector2(v[0] * SCALE, -v[1] * SCALE);
const fmt = (n: number) => formatSceneNumber(n);

export const matrixTransformationScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const ma = createSignal(1);
  const mb = createSignal(0);
  const mc = createSignal(0);
  const md = createSignal(1);
  const matrix = (): Matrix2x2 => [
    [ma(), mb()],
    [mc(), md()],
  ];

  const ghostGrid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  ghostGrid.opacity(0.18);
  view.add(ghostGrid);

  const tGrid = makeTransformedGrid(matrix, OVERLAY_CLEAR_HALF_EXTENT);
  tGrid.opacity(0);
  view.add(tGrid);

  const origin = new Circle({ size: 14, fill: ROLE.text });
  view.add(origin);

  const e1Ghost = makeArrow(ROLE.dim, 3);
  e1Ghost.opacity(0).points([new Vector2(0, 0), px([1, 0])]);
  const e2Ghost = makeArrow(ROLE.dim, 3);
  e2Ghost.opacity(0).points([new Vector2(0, 0), px([0, 1])]);
  view.add(e1Ghost);
  view.add(e2Ghost);

  const e1 = makeArrow(ROLE.basis1, 6);
  e1.points(() => [new Vector2(0, 0), px([ma(), mc()])]);
  const e2 = makeArrow(ROLE.basis2, 6);
  e2.points(() => [new Vector2(0, 0), px([mb(), md()])]);
  view.add(e1);
  view.add(e2);

  const sample = makeArrow(ROLE.selected, 5);
  sample
    .end(0)
    .points(() => [new Vector2(0, 0), px(matrixVectorMultiply(matrix(), SAMPLE))]);
  view.add(sample);

  const e1Label = makeLabel("e₁", ROLE.basis1);
  e1Label.opacity(0).position(() => px([ma(), mc()]).add(new Vector2(16, 16)));
  const e2Label = makeLabel("e₂", ROLE.basis2);
  e2Label.opacity(0).position(() => px([mb(), md()]).add(new Vector2(16, -6)));
  view.add(e1Label);
  view.add(e2Label);

  // Tip coordinate readouts — bind column entries to the landing tip.
  const e1Coords = makeLabel("", ROLE.basis1, 32);
  e1Coords
    .opacity(0)
    .position(() => px([ma(), mc()]).add(new Vector2(22, -28)));
  const e2Coords = makeLabel("", ROLE.basis2, 32);
  e2Coords
    .opacity(0)
    .position(() => px([mb(), md()]).add(new Vector2(22, 28)));
  view.add(e1Coords);
  view.add(e2Coords);

  const matrixLabel = makeOverlayLabel("", ROLE.text, 42);
  matrixLabel.opacity(0).position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(matrixLabel);

  const caption = makeOverlayLabel("", ROLE.textMuted, 34);
  caption.opacity(0).position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const setMatrixLabel = () =>
    matrixLabel.text(
      `A = [[${fmt(ma())}, ${fmt(mb())}], [${fmt(mc())}, ${fmt(md())}]]`,
    );
  const setCaption = (text: string) => caption.text(text);

  setMatrixLabel();
  setCaption("Identity grid — watch where e₁ and e₂ go under A");
  matrixLabel.opacity(1);
  caption.opacity(1);
  e1Label.opacity(1);
  e2Label.opacity(1);
  e1Ghost.opacity(0.35);
  e2Ghost.opacity(0.35);

  const seconds = Object.fromEntries(
    MATRIX_TRANSFORMATION_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  function* morphTo(target: Matrix2x2, dur: number): ThreadGenerator {
    yield* morphMatrixEntries(ma, mb, mc, md, target, dur);
  }

  const bodies: Record<string, () => ThreadGenerator> = {
    *identity() {
      setMatrixLabel();
      setCaption("Identity: e₁ = (1,0), e₂ = (0,1)");
      yield* all(
        matrixLabel.opacity(1, 0.4),
        caption.opacity(1, 0.4),
        e1.end(1, 0.8),
        e2.end(1, 0.8),
        e1Label.opacity(1, 0.4),
        e2Label.opacity(1, 0.4),
      );
      yield* all(e1Ghost.opacity(0.5, 0.5), e2Ghost.opacity(0.5, 0.5));
      yield* waitFor(seconds.identity - 1.6);
    },
    *col1() {
      // Column → tip coordinates → Ae₁: identity preserved across the beat.
      setCaption("First column of A is exactly Ae₁");
      yield* focusOpacities([
        { node: e1, opacity: 1 },
        { node: e1Label, opacity: 1 },
        { node: e2, opacity: 0.3 },
        { node: e2Label, opacity: 0.3 },
        { node: sample, opacity: 0.2 },
        { node: tGrid, opacity: 0 },
      ]);
      yield* e1.lineWidth(9, 0.35);
      yield* all(
        ma(A[0][0], 1.3, easeInOutCubic),
        mc(A[1][0], 1.3, easeInOutCubic),
      );
      setMatrixLabel();
      e1Coords.text(`(${fmt(A[0][0])}, ${fmt(A[1][0])})`);
      e1Label.text("Ae₁");
      yield* e1Coords.opacity(1, 0.35);
      yield* e1.lineWidth(6, 0.3);
      yield* waitFor(seconds.col1 - 2.3);
    },
    *col2() {
      setCaption("Second column of A is exactly Ae₂");
      yield* focusOpacities([
        { node: e2, opacity: 1 },
        { node: e2Label, opacity: 1 },
        { node: e1, opacity: 0.35 },
        { node: e1Label, opacity: 0.35 },
        { node: e1Coords, opacity: 0.45 },
        { node: sample, opacity: 0.2 },
      ]);
      yield* e2.lineWidth(9, 0.35);
      yield* all(
        mb(A[0][1], 1.3, easeInOutCubic),
        md(A[1][1], 1.3, easeInOutCubic),
      );
      setMatrixLabel();
      e2Coords.text(`(${fmt(A[0][1])}, ${fmt(A[1][1])})`);
      e2Label.text("Ae₂");
      yield* e2Coords.opacity(1, 0.35);
      yield* e2.lineWidth(6, 0.3);
      yield* waitFor(seconds.col2 - 2.3);
    },
    *sample() {
      setCaption(`Write the sample as ${fmt(SAMPLE[0])}·e₁ + ${fmt(SAMPLE[1])}·e₂`);
      yield* focusOpacities([
        { node: sample, opacity: 1 },
        { node: e1, opacity: 0.55 },
        { node: e2, opacity: 0.55 },
        { node: e1Coords, opacity: 0.35 },
        { node: e2Coords, opacity: 0.35 },
      ]);
      yield* sample.end(1, 1.2, easeInOutCubic);
      yield* waitFor(seconds.sample - 1.55);
    },
    *["transform-sample"]() {
      setCaption("By linearity it lands on the transformed basis");
      yield* sample.lineWidth(8, 0.4);
      yield* sample.lineWidth(5, 0.5);
      yield* waitFor(seconds["transform-sample"] - 0.9);
    },
    *grid() {
      setCaption("The whole grid follows the same rule");
      yield* all(
        tGrid.opacity(0.9, 1),
        e1Coords.opacity(0.25, 0.5),
        e2Coords.opacity(0.25, 0.5),
      );
      yield* waitFor(seconds.grid - 1);
    },
    *compare() {
      setCaption("Faint = original · bright = transformed");
      yield* all(e1Ghost.opacity(0.7, 0.6), e2Ghost.opacity(0.7, 0.6));
      yield* waitFor(seconds.compare - 0.6);
    },
    *presets() {
      yield* all(e1Coords.opacity(0, 0.3), e2Coords.opacity(0, 0.3));
      const tour: Array<[string, Matrix2x2]> = [
        ["Scale", [[2, 0], [0, 2]]],
        ["Rotation", [[0, -1], [1, 0]]],
        ["Reflection", [[1, 0], [0, -1]]],
        ["Singular collapse", [[2, 4], [1, 2]]],
      ];
      const per = (seconds.presets - 0.4) / tour.length;
      for (const [name, target] of tour) {
        setCaption(`${name}`);
        yield* morphTo(target, per * 0.7);
        setMatrixLabel();
        yield* waitFor(per * 0.3);
      }
    },
    *summary() {
      setCaption("Columns are the basis images; everything follows");
      yield* morphTo(A, 1.2);
      e1Label.text("Ae₁");
      e2Label.text("Ae₂");
      setMatrixLabel();
      yield* waitFor(seconds.summary - 1.2);
    },
  };

  for (const segment of MATRIX_TRANSFORMATION_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
