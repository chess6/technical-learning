import { Circle, Latex, Line, makeScene2D } from "@motion-canvas/2d";
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
  OVERLAY_CLEAR_HALF_EXTENT,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
  morphMatrixEntries,
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

function lineEnds(dir: MathV, extent = 2.2): [Vector2, Vector2] {
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

const LAMBDA_3 = DERIVATION.lambdas.find((l) => Math.abs(l - 3) < 1e-8) ?? 3;
const SHIFTED_3 = matrixShift(A, LAMBDA_3);

function tipLabelOffset(dir: MathV, pixels = 36): Vector2 {
  const [dx, dy] = stabilizeDirection(dir);
  // Screen-space perpendicular to the drawn arrow (math → screen flips y).
  return new Vector2(-dy * pixels, -dx * pixels);
}

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

  const grid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  grid.opacity(0.5);
  view.add(grid);

  const origin = new Circle({ size: 14, fill: ROLE.text, opacity: 1 });
  view.add(origin);

  // Candidate eigenvector along λ=3 direction (axis) for the shift demo.
  const vScale = createSignal(1.35);
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

  // λv construction for the shift beat. λv is simply the input v scaled by λ;
  // for an eigendirection it lands exactly on Av, so (A − λI)v = Av − λv = 0.
  // lambdaVLen is the λv arrow length in math units along vDir.
  const lambdaVLen = createSignal(0);
  const lambdaVArrow = makeArrow(ROLE.selected, 6);
  lambdaVArrow.points(() => [
    new Vector2(0, 0),
    px(scaleVector(vDir, lambdaVLen())),
  ]);
  lambdaVArrow.opacity(0);
  view.add(lambdaVArrow);

  const lambdaVLabel = makeLabel("λv", ROLE.selected, 34);
  lambdaVLabel.position(() =>
    px(scaleVector(vDir, lambdaVLen())).add(new Vector2(12, 30)),
  );
  lambdaVLabel.opacity(0);
  view.add(lambdaVLabel);

  // Subtraction arrow: −λv anchored at the tip of Av. As subProgress goes
  // 0→1 its head walks from the tip of Av back to the origin, because
  // Av − λv = 0 for the eigendirection. This is the geometric "why".
  const subProgress = createSignal(0);
  const subArrow = makeArrow(ROLE.selected, 4);
  subArrow.lineDash([10, 8]);
  subArrow.points(() => {
    const avTip = px(matrixVectorMultiply(matrix(), scaleVector(vDir, vScale())));
    const minusLambdaV = px(scaleVector(vDir, -LAMBDA_3 * vScale())).scale(
      subProgress(),
    );
    return [avTip, avTip.add(minusLambdaV)];
  });
  subArrow.opacity(0);
  view.add(subArrow);

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
  arrow3.points(() => [new Vector2(0, 0), px(scaleVector(DIR_3, 1.7))]);
  arrow3.opacity(0);
  view.add(arrow3);

  const arrow2 = makeArrow(ROLE.selected, 5);
  arrow2.points(() => [new Vector2(0, 0), px(scaleVector(DIR_2, 1.7))]);
  arrow2.opacity(0);
  view.add(arrow2);

  const label3 = makeLabel("λ=3 · (1,0)", ROLE.result, 28);
  // Grow upward away from the horizontal tip.
  label3.offset([0, 1]);
  label3.position(() =>
    px(scaleVector(DIR_3, 1.7)).add(tipLabelOffset(DIR_3, 28)),
  );
  label3.opacity(0);
  view.add(label3);

  const label2 = makeLabel("λ=2 · (−1,1)", ROLE.selected, 28);
  // Grow away from the off-axis tip (left edge anchored).
  label2.offset([-1, 0]);
  label2.position(() =>
    px(scaleVector(DIR_2, 1.7)).add(tipLabelOffset(DIR_2, 48)),
  );
  label2.opacity(0);
  view.add(label2);

  const top = makeOverlayLabel("", ROLE.text, 40);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);

  // --- Equation-transition pilot (Av = λv → (A − λI)v = 0) ---------------
  // A single lesson-specific KaTeX/MathJax morph. `{{ }}` marks the fragments
  // Motion Canvas should keep identical across states; the rest fades in/out.
  // The morph is honest: we subtract λv from *both* sides, then factor v —
  // no "magical transposition" across the equals sign.
  const EQ_AV = String.raw`{{A\mathbf{v}}}`;
  const EQ_LV = String.raw`{{\lambda\mathbf{v}}}`;
  const EQ_START = String.raw`${EQ_AV}{{=}}${EQ_LV}`;
  const EQ_SUBTRACT = String.raw`${EQ_AV}{{-}}${EQ_LV}{{=}}${EQ_LV}{{-}}${EQ_LV}`;
  const EQ_ZERO = String.raw`${EQ_AV}{{-}}${EQ_LV}{{=}}{{\mathbf{0}}}`;
  const EQ_FACTORED = String.raw`{{(A-\lambda I)\mathbf{v}}}{{=}}{{\mathbf{0}}}`;

  const eqTex = new Latex({
    tex: EQ_START,
    fill: ROLE.text,
    fontSize: 44,
    opacity: 0,
  });
  eqTex.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(eqTex);
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
    yield* morphMatrixEntries(ma, mb, mc, md, target, dur);
  }

  const seconds = Object.fromEntries(
    EIGEN_DERIVATION_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  const bodies: Record<string, () => ThreadGenerator> = {
    *recap() {
      setCaption("Directions A only scales — they stay on their line");
      // Establishing "Computing eigenvectors" title yields to the live equation.
      eqTex.tex(EQ_START);
      yield* all(
        top.opacity(0, 0.3),
        eqTex.opacity(1, 0.4),
        AvArrow.opacity(1, 0.6),
        AvLabel.opacity(1, 0.6),
      );
      yield* waitFor(Math.max(0, seconds.recap - 0.6));
    },

    *shift() {
      // PILOT. Make the algebra geometric: (A − λI)v = Av − λv, and for an
      // eigendirection Av and λv coincide, so the difference is the zero
      // vector. The Latex morph and the arrows move together. We keep the
      // matrix as A here — the charpoly beat is where A actually morphs.
      setCaption("Subtract λv from both sides of Av = λv");
      // Introduce λv (geometry) alongside subtracting λv from both sides
      // (equation). Both sides gain −λv: honest, not a jump across "=".
      lambdaVLen(vScale());
      yield* all(
        lambdaVArrow.opacity(1, 0.4),
        lambdaVLabel.opacity(1, 0.4),
        eqTex.tex(EQ_SUBTRACT, 0.8),
      );
      setCaption("λv is the input v scaled by λ — it lands on Av");
      yield* lambdaVLen(LAMBDA_3 * vScale(), 1.0, easeInOutCubic);
      // Flash to show λv and Av are the same arrow for this direction.
      yield* all(lambdaVArrow.lineWidth(9, 0.22), AvArrow.lineWidth(9, 0.22));
      yield* all(lambdaVArrow.lineWidth(6, 0.22), AvArrow.lineWidth(6, 0.22));
      // Right side λv − λv → 0, mirrored by the tip walking to the origin.
      setCaption("The right side λv − λv is 0; the tip walks to the origin");
      yield* all(
        subArrow.opacity(1, 0.3),
        lambdaVLabel.opacity(0, 0.3),
        eqTex.tex(EQ_ZERO, 0.6),
      );
      yield* subProgress(1, 1.0, easeInOutCubic);
      // Factor v out of Av − λv.
      setCaption("Factor v: (A − λI)v = 0 for this direction");
      yield* all(eqTex.tex(EQ_FACTORED, 0.7), origin.size(24, 0.35));
      yield* origin.size(14, 0.25);
      yield* waitFor(Math.max(0, seconds.shift - 5.1));
    },

    *charpoly() {
      // Now motivate WHEN a nonzero v can collapse: only if the matrix
      // A − λI itself flattens the plane (zero area scale). This is where
      // we actually morph A → A − λI and watch the unit square collapse.
      setTop("det(A − λI) = 0");
      setCaption("When can a nonzero v hit zero? Only if A − λI flattens area");
      // Hand the equation label back to the plain-text top; the pilot morph
      // is done. Clear the vector-subtraction construction and bring up the
      // unit square under the current matrix (still A) so collapse is visible.
      yield* all(
        eqTex.opacity(0, 0.3),
        top.opacity(1, 0.3),
        subArrow.opacity(0, 0.4),
        lambdaVArrow.opacity(0, 0.4),
        AvArrow.opacity(0, 0.4),
        AvLabel.opacity(0, 0.4),
        vArrow.opacity(0.25, 0.4),
        vLabel.opacity(0, 0.4),
        square.opacity(0.45, 0.5),
      );
      // Morph A → A − λI: the unit square collapses onto a line (area → 0).
      setCaption("A − λI squashes the whole plane onto a line — area scale 0");
      yield* morphTo(SHIFTED_3, 1.6);
      setTop(`det(A − λI) ≈ ${fmt(determinant2x2(matrix()))} · collapse`);
      // Nudge slightly off and back to show flatness holds exactly at this λ.
      const slightlyOff: Matrix2x2 = [
        [SHIFTED_3[0][0] + 0.4, SHIFTED_3[0][1]],
        [SHIFTED_3[1][0], SHIFTED_3[1][1] + 0.4],
      ];
      yield* morphTo(slightlyOff, 0.8);
      setTop(`det ≈ ${fmt(determinant2x2(matrix()))} · not flat`);
      yield* morphTo(SHIFTED_3, 1.0);
      setTop("det(A − λI) = 0 · area collapses");
      yield* waitFor(Math.max(0, seconds.charpoly - 4.3));
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
        "λ=3 keeps the x-axis; λ=2 is the off-axis line through (−1,1)",
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
        "λ=3 stretches along (1,0); λ=2 along (−1,1) — two different lines",
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
