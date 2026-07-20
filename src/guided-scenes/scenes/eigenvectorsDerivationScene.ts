import { Circle, Line, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { EIGEN_LESSON_EXAMPLE } from "../../lessons/exampleData";
import {
  applyMatrixToUnitSquare,
  determinant2x2,
  eigenDerivation2x2,
  matrixShift,
  matrixVectorMultiply,
  scaleVector,
  stabilizeDirection,
  type Matrix2x2,
  type Vector2 as MathV,
} from "../../math";
import { EIGEN_DERIVATION_SEGMENTS } from "./sceneTimings";
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
 * Lesson 4 derivation ladder: compute eigenvalues/eigenvectors for
 * A = [[3,1],[0,2]] with synchronized geometry.
 *
 * Explicitly exploits asymmetric eigendirections:
 *   λ=3 → (1,0)  (coordinate axis)
 *   λ=2 → (−1,1) (off-axis line)
 * so learners do not conclude eigenvectors are always axes.
 *
 * All numbers from eigenDerivation2x2 — never reimplemented here.
 */

const A = EIGEN_LESSON_EXAMPLE.matrix as Matrix2x2;
const DERIVATION = eigenDerivation2x2(A);

const px = (v: readonly [number, number]): Vector2 =>
  new Vector2(v[0] * SCALE, -v[1] * SCALE);

const fmt = (n: number): string => {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
};

function squarePoints(m: Matrix2x2): Vector2[] {
  return applyMatrixToUnitSquare(m).map((p) => px(p));
}

function lineEnds(dir: MathV, extent = 2.6): [Vector2, Vector2] {
  const u = stabilizeDirection(dir);
  return [px(scaleVector(u, -extent)), px(scaleVector(u, extent))];
}

/** Pick the step for a given λ from the shared derivation spine. */
function stepFor(lambda: number) {
  return DERIVATION.steps.find((s) => Math.abs(s.lambda - lambda) < 1e-8);
}

const STEP_3 = stepFor(3);
const STEP_2 = stepFor(2);
const DIR_3: MathV =
  STEP_3?.eigenspace.kind === "line" ? STEP_3.eigenspace.basis : [1, 0];
const DIR_2: MathV =
  STEP_2?.eigenspace.kind === "line" ? STEP_2.eigenspace.basis : [-1, 1];

export const eigenvectorsDerivationScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  // Live matrix signals — start as A, morph to A−λI during the shift beat.
  const ma = createSignal(A[0][0]);
  const mb = createSignal(A[0][1]);
  const mc = createSignal(A[1][0]);
  const md = createSignal(A[1][1]);
  const matrix = (): Matrix2x2 => [
    [ma(), mb()],
    [mc(), md()],
  ];

  const grid = makeStaticGrid(3);
  grid.opacity(0.5);
  view.add(grid);

  const origin = new Circle({ size: 14, fill: ROLE.text, opacity: 1 });
  view.add(origin);

  // Candidate eigenvector along λ=3 direction (axis) for the shift demo.
  const vScale = createSignal(1.8);
  const vDir: MathV = DIR_3;
  const vArrow = makeArrow(ROLE.original, 6);
  vArrow.points(() => {
    const tip = scaleVector(vDir, vScale());
    return [new Vector2(0, 0), px(tip)];
  });
  view.add(vArrow);

  const AvArrow = makeArrow(ROLE.transformed, 6);
  AvArrow.points(() => {
    const tip = scaleVector(vDir, vScale());
    const image = matrixVectorMultiply(matrix(), tip);
    return [new Vector2(0, 0), px(image)];
  });
  AvArrow.opacity(0);
  view.add(AvArrow);

  const vLabel = makeLabel("v", ROLE.original, 36);
  vLabel.position(() => px(scaleVector(vDir, vScale())).add(new Vector2(16, 16)));
  view.add(vLabel);

  const AvLabel = makeLabel("Av", ROLE.transformed, 36);
  AvLabel.position(() => {
    const tip = scaleVector(vDir, vScale());
    return px(matrixVectorMultiply(matrix(), tip)).add(new Vector2(16, -12));
  });
  AvLabel.opacity(0);
  view.add(AvLabel);

  // Unit-square / parallelogram for the charpoly collapse beat.
  const square = new Line({
    stroke: ROLE.original,
    lineWidth: 3,
    closed: true,
    fill: ROLE.original,
    opacity: 0,
    points: () => squarePoints(matrix()),
  });
  view.add(square);

  // Eigenspace lines — drawn in interpret / solveV.
  const line3 = new Line({
    stroke: ROLE.result,
    lineWidth: 3,
    lineDash: [12, 8],
    opacity: 0,
    points: () => lineEnds(DIR_3),
  });
  const line2 = new Line({
    stroke: ROLE.selected,
    lineWidth: 3,
    lineDash: [12, 8],
    opacity: 0,
    points: () => lineEnds(DIR_2),
  });
  view.add(line3);
  view.add(line2);

  const arrow3 = makeArrow(ROLE.result, 5);
  arrow3.points(() => [new Vector2(0, 0), px(scaleVector(DIR_3, 2))]);
  arrow3.opacity(0);
  view.add(arrow3);

  const arrow2 = makeArrow(ROLE.selected, 5);
  arrow2.points(() => [new Vector2(0, 0), px(scaleVector(DIR_2, 2))]);
  arrow2.opacity(0);
  view.add(arrow2);

  const label3 = makeLabel("λ=3 · (1,0)", ROLE.result, 30);
  label3.position(() => px(scaleVector(DIR_3, 2.15)).add(new Vector2(10, 20)));
  label3.opacity(0);
  view.add(label3);

  const label2 = makeLabel("λ=2 · (−1,1)", ROLE.selected, 30);
  label2.position(() => px(scaleVector(DIR_2, 2.15)).add(new Vector2(-20, -24)));
  label2.opacity(0);
  view.add(label2);

  const top = makeOverlayLabel("", ROLE.text, 40);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 30);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const setTop = (text: string) => top.text(text);
  const setCaption = (text: string) => caption.text(text);

  // Establishing frame.
  setTop("Computing eigenvectors");
  setCaption("Same A you just watched — now derive λ and the directions");
  top.opacity(1);
  caption.opacity(1);
  vArrow.opacity(1);
  vLabel.opacity(1);

  function* morphTo(target: Matrix2x2, dur: number): ThreadGenerator {
    yield* all(
      ma(target[0][0], dur, easeInOutCubic),
      mb(target[0][1], dur, easeInOutCubic),
      mc(target[1][0], dur, easeInOutCubic),
      md(target[1][1], dur, easeInOutCubic),
    );
  }

  const seconds = Object.fromEntries(
    EIGEN_DERIVATION_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  const lambda3 = DERIVATION.lambdas.find((l) => Math.abs(l - 3) < 1e-8) ?? 3;
  const shifted3 = matrixShift(A, lambda3);

  const bodies: Record<string, () => ThreadGenerator> = {
    *recap() {
      setTop("Av = λv");
      setCaption("Find nonzero directions A only scales — they stay on their line");
      yield* all(AvArrow.opacity(1, 0.6), AvLabel.opacity(1, 0.6));
      // Show Av = 3v along the axis direction.
      yield* waitFor(seconds.recap - 0.6);
    },

    *shift() {
      setTop("(A − λI)v = 0");
      setCaption(
        "Under the auxiliary map A−λI, that direction collapses to zero — because Av and λv coincide",
      );
      yield* all(AvArrow.opacity(0.25, 0.4), AvLabel.opacity(0, 0.4));
      // Morph A → A−3I and collapse v to the origin.
      yield* all(morphTo(shifted3, 2.2), vScale(0.05, 2.2, easeInOutCubic));
      setCaption("A−λI sends v to the origin — not A itself");
      yield* waitFor(Math.max(0, seconds.shift - 2.6));
    },

    *charpoly() {
      setTop("det(A − λI) = 0");
      setCaption(
        "A map sends a nonzero direction to zero exactly when it collapses area (Lesson 3)",
      );
      // Restore a visible parallelogram under A−λI and show collapse.
      yield* all(
        vArrow.opacity(0.2, 0.4),
        vLabel.opacity(0, 0.4),
        square.opacity(0.45, 0.5),
      );
      const det = determinant2x2(matrix());
      setTop(`det(A − λI) ≈ ${fmt(det)} · collapse`);
      // Nudge slightly away then back to emphasize flatness at this λ.
      const slightlyOff: Matrix2x2 = [
        [shifted3[0][0] + 0.4, shifted3[0][1]],
        [shifted3[1][0], shifted3[1][1] + 0.4],
      ];
      yield* morphTo(slightlyOff, 0.9);
      setTop(`det ≈ ${fmt(determinant2x2(matrix()))}`);
      yield* morphTo(shifted3, 1.2);
      setTop(`det(A − λI) = 0 · area collapses`);
      yield* waitFor(Math.max(0, seconds.charpoly - 3.0));
    },

    *solveLambda() {
      setCaption("Solve λ² − (tr)λ + det = 0 for this A");
      const { b, c } = DERIVATION.charPoly.coefficients;
      setTop(`λ² ${b >= 0 ? "+" : ""}${fmt(b)}λ ${c >= 0 ? "+" : ""}${fmt(c)} = 0`);
      yield* all(square.opacity(0, 0.5), morphTo(A, 1.2));
      const sorted = [...DERIVATION.lambdas].sort((x, y) => y - x);
      setCaption(`Roots: λ = ${sorted.map(fmt).join(", ")}`);
      setTop(`λ = ${sorted.map(fmt).join(" and ")}`);
      yield* waitFor(Math.max(0, seconds.solveLambda - 1.7));
    },

    *solveV() {
      setTop("Solve (A − λI)v = 0");
      setCaption(
        "λ=3 keeps the x-axis; λ=2 is the off-axis line through (−1,1) — not every eigenline is an axis",
      );
      yield* all(
        vArrow.opacity(0, 0.3),
        line3.opacity(1, 0.7),
        arrow3.opacity(1, 0.7),
        label3.opacity(1, 0.7),
      );
      yield* waitFor(1.4);
      yield* all(
        line2.opacity(1, 0.7),
        arrow2.opacity(1, 0.7),
        label2.opacity(1, 0.7),
      );
      yield* waitFor(Math.max(0, seconds.solveV - 2.8));
    },

    *interpret() {
      setTop("Interpret geometrically");
      setCaption(
        "λ=3 stretches along (1,0); λ=2 stretches along (−1,1). Same idea, two different lines",
      );
      // Pulse the off-axis direction so the asymmetry is the takeaway.
      yield* all(
        arrow2.lineWidth(9, 0.5),
        label2.fontSize(34, 0.5),
      );
      yield* all(
        arrow2.lineWidth(5, 0.5),
        label2.fontSize(30, 0.5),
      );
      yield* waitFor(Math.max(0, seconds.interpret - 1.0));
    },
  };

  for (const segment of EIGEN_DERIVATION_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
