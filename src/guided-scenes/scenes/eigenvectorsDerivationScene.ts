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
import { EIGEN_DERIVATION_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatDirectionRatio,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
  morphMatrixEntries,
  runSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 4 derivation ladder: compute eigenvalues/eigenvectors for
 * A = [[3,1],[0,2]] with synchronized geometry.
 *
 * Explicitly exploits asymmetric eigendirections:
 *   λ=3 → (1,0)  (coordinate axis)
 *   λ=2 → (1,−1) (off-axis line)
 * so learners do not conclude eigenvectors are always axes.
 *
 * All numbers from eigenDerivation2x2 — never reimplemented here, and every
 * direction LABEL is derived from the direction actually drawn: the λ=2 line
 * used to be drawn along (1,−1) and labelled (−1,1), the opposite ray, which
 * also disagreed with the lesson prose.
 */

const SCENE_ID = "eigenvectors-derivation";

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
const LAMBDA_2 = DERIVATION.lambdas.find((l) => Math.abs(l - 2) < 1e-8) ?? 2;
const SHIFTED_3 = matrixShift(A, LAMBDA_3);
const SHIFTED_2 = matrixShift(A, LAMBDA_2);

/**
 * Correctness guard (single source of truth). The two solve beats claim that
 * each shifted matrix sends its whole drawn line to the origin; if the shared
 * example ever changes so that is false, the scene must fail rather than
 * animate a probe whose image quietly drifts off zero.
 */
function assertSceneMathIsConsistent(): void {
  for (const [lambda, shifted, direction] of [
    [LAMBDA_3, SHIFTED_3, DIR_3],
    [LAMBDA_2, SHIFTED_2, DIR_2],
  ] as const) {
    const image = matrixVectorMultiply(shifted, scaleVector(direction, 1.7));
    if (Math.hypot(image[0], image[1]) > 1e-9) {
      throw new Error(
        `eigenvectorsDerivationScene: (A − ${lambda}I) does not kill its drawn direction.`,
      );
    }
    if (Math.abs(determinant2x2(shifted)) > 1e-9) {
      throw new Error(
        `eigenvectorsDerivationScene: A − ${lambda}I is not singular.`,
      );
    }
  }
}

/** `[a b ; c d]` for a shifted matrix written beside its beat. */
function matrixText(m: Matrix2x2): string {
  const e = (n: number) => fmt(n).replace("-", "−");
  return `[ ${e(m[0][0])}  ${e(m[0][1])} ;  ${e(m[1][0])}  ${e(m[1][1])} ]`;
}

function tipLabelOffset(dir: MathV, pixels = 36): Vector2 {
  const [dx, dy] = stabilizeDirection(dir);
  // Screen-space perpendicular to the drawn arrow (math → screen flips y).
  return new Vector2(-dy * pixels, -dx * pixels);
}

export const eigenvectorsDerivationScene = makeScene2D(function* (view) {
  assertSceneMathIsConsistent();
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
  // Clear of v's label, which sits at (+16, +16) from ITS tip: λv and v run
  // along the same direction and their tips coincide whenever λ ≈ 1, which
  // printed "λv" under "v" for the whole recap beat (text-overlap hard gate).
  lambdaVLabel.position(() =>
    px(scaleVector(vDir, lambdaVLen())).add(new Vector2(12, 64)),
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
    stroke: ROLE.basis1,
    lineWidth: 3,
    lineDash: [12, 8],
    opacity: 0,
    points: () => lineEnds(DIR_3),
  });
  const line2 = new Line({
    stroke: ROLE.basis2,
    lineWidth: 3,
    lineDash: [12, 8],
    opacity: 0,
    points: () => lineEnds(DIR_2),
  });
  view.add(line3);
  view.add(line2);

  const arrow3 = makeArrow(ROLE.basis1, 5);
  arrow3.points(() => [new Vector2(0, 0), px(scaleVector(DIR_3, 1.7))]);
  arrow3.opacity(0);
  view.add(arrow3);

  const arrow2 = makeArrow(ROLE.basis2, 5);
  arrow2.points(() => [new Vector2(0, 0), px(scaleVector(DIR_2, 1.7))]);
  arrow2.opacity(0);
  view.add(arrow2);

  /* ---------------------------------------------------------------------
   * The solve apparatus: one probe per eigenspace.
   *
   * "Solve (A − λI)v = 0" used to be a caption over two lines that faded in —
   * the answers, not the solving. Each root is now substituted back: the plane
   * is carried to A − λI, the shifted matrix is written out, and a probe
   * travels the line while its image, computed through that SAME live matrix,
   * stays on the origin. The eigenspace is what the shifted map kills, watched
   * rather than asserted.
   * ------------------------------------------------------------------- */
  function makeProbe(direction: MathV, color: string, key: string) {
    const t = createSignal(-1);
    const at = (): MathV => scaleVector(direction, t() * 1.7);
    const dot = new Circle({ key, size: 20, fill: color, opacity: 0 });
    dot.position(() => px(at()));
    view.add(dot);
    const image = new Circle({
      size: 20,
      fill: color,
      stroke: ROLE.background,
      lineWidth: 3,
      opacity: 0,
    });
    image.position(() => px(matrixVectorMultiply(matrix(), at())));
    view.add(image);
    return { t, dot, image };
  }
  const probe3 = makeProbe(DIR_3, ROLE.basis1, "semantic:eigen-derivation:probe-1");
  const probe2 = makeProbe(DIR_2, ROLE.basis2, "semantic:eigen-derivation:probe-2");

  /** The shifted matrix, written out beside the beat that uses it. */
  const shiftedNote = makeLabel("", ROLE.textMuted, 26);
  shiftedNote.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y + 44));
  shiftedNote.opacity(0);
  view.add(shiftedNote);

  const label3 = makeLabel(
    `λ=${fmt(LAMBDA_3)} · ${formatDirectionRatio([DIR_3[0], DIR_3[1]])}`,
    ROLE.basis1,
    28,
  );
  // Grow upward away from the horizontal tip.
  label3.offset([0, 1]);
  label3.position(() =>
    px(scaleVector(DIR_3, 1.7)).add(tipLabelOffset(DIR_3, 28)),
  );
  label3.opacity(0);
  view.add(label3);

  const label2 = makeLabel(
    `λ=${fmt(LAMBDA_2)} · ${formatDirectionRatio([DIR_2[0], DIR_2[1]])}`,
    ROLE.basis2,
    28,
  );
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

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  /** Fade every probe out. Each solve beat re-introduces only its own. */
  const retireProbes = (duration: number): ThreadGenerator[] =>
    [probe3, probe2].flatMap((probe) => [
      probe.dot.opacity(0, duration),
      probe.image.opacity(0, duration),
    ]);

  /** One root, solved. See the `solveV3` / `solveV2` bodies. */
  function* solveEigenspace(
    segmentId: string,
    spec: {
      lambda: number;
      shifted: Matrix2x2;
      line: Line;
      arrow: Line;
      label: ReturnType<typeof makeLabel>;
      probe: ReturnType<typeof makeProbe>;
      note: string;
    },
  ): ThreadGenerator {
    const b = beats(segmentId);
    const lambda = fmt(spec.lambda);
    setTop(`Solve (A − ${lambda}I)v = 0`);
    setCaption(`Substitute λ = ${lambda} back, and carry the plane to A − ${lambda}I.`);
    shiftedNote.text(`A − ${lambda}I = ${matrixText(spec.shifted)}`);
    yield* all(
      morphTo(spec.shifted, b.shift!),
      shiftedNote.opacity(1, b.shift!),
      vArrow.opacity(0, b.shift!),
      square.opacity(0, b.shift!),
      // Retire whichever probe belongs to the OTHER root. Its image is a
      // function of the live matrix, so left up it would drift away from the
      // origin under this beat's shifted matrix and read as a second claim.
      ...retireProbes(b.shift!),
    );
    setCaption("It is singular — so some whole line has to be sent to the origin.");
    yield* all(
      spec.line.opacity(1, b.reveal!),
      spec.arrow.opacity(1, b.reveal!),
      spec.label.opacity(1, b.reveal!),
    );
    yield* waitFor(b.hold!);
    spec.probe.t(-1);
    yield* all(
      spec.probe.dot.opacity(1, b.probeIn!),
      spec.probe.image.opacity(1, b.probeIn!),
    );
    setCaption("Walk a probe along that line and watch its image.");
    // The image is computed through the SAME live matrix as everything else,
    // so "it never leaves the origin" is a consequence, not a parked dot.
    yield* spec.probe.t(1, b.travel!, easeInOutCubic);
    setCaption(
      `Its image never left the origin: every v on this line solves (A − ${lambda}I)v = 0.`,
    );
    yield* origin.size(26, b.up!);
    yield* origin.size(14, b.down!);
    setCaption(`That line IS the eigenspace for λ = ${lambda}. ${spec.note}`);
    yield* waitFor(b.hold2!);
  }

  const bodies: Record<string, () => ThreadGenerator> = {
    *recap() {
      const b = beats("recap");
      setCaption("Directions A only scales — they stay on their line");
      // Establishing "Computing eigenvectors" title yields to the live equation.
      eqTex.tex(EQ_START);
      yield* all(
        top.opacity(0, b.in!),
        eqTex.opacity(1, b.in!),
        AvArrow.opacity(1, b.in!),
        AvLabel.opacity(1, b.in!),
      );
      yield* waitFor(b.hold!);
    },

    *shift() {
      const b = beats("shift");
      // Make the algebra geometric: (A − λI)v = Av − λv, and for an
      // eigendirection Av and λv coincide, so the difference is the zero
      // vector. The Latex morph and the arrows move together. We keep the
      // matrix as A here — the charpoly beat is where A actually morphs.
      setCaption("Subtract λv from both sides of Av = λv");
      // Introduce λv (geometry) alongside subtracting λv from both sides
      // (equation). Both sides gain −λv: honest, not a jump across "=".
      lambdaVLen(vScale());
      yield* all(
        lambdaVArrow.opacity(1, b.intro!),
        lambdaVLabel.opacity(1, b.intro!),
        eqTex.tex(EQ_SUBTRACT, b.intro!),
      );
      setCaption("λv is the input v scaled by λ — it lands on Av");
      yield* lambdaVLen(LAMBDA_3 * vScale(), b.grow!, easeInOutCubic);
      // Flash to show λv and Av are the same arrow for this direction.
      yield* all(
        lambdaVArrow.lineWidth(9, b.flashUp!),
        AvArrow.lineWidth(9, b.flashUp!),
      );
      yield* all(
        lambdaVArrow.lineWidth(6, b.flashDown!),
        AvArrow.lineWidth(6, b.flashDown!),
      );
      // Right side λv − λv → 0, mirrored by the tip walking to the origin.
      setCaption("The right side λv − λv is 0; the tip walks to the origin");
      yield* all(
        subArrow.opacity(1, b.sub!),
        lambdaVLabel.opacity(0, b.sub!),
        eqTex.tex(EQ_ZERO, b.sub!),
      );
      yield* subProgress(1, b.walk!, easeInOutCubic);
      // Factor v out of Av − λv.
      setCaption("Factor v: (A − λI)v = 0 for this direction");
      yield* all(eqTex.tex(EQ_FACTORED, b.factor!), origin.size(24, b.factor!));
      yield* origin.size(14, b.originDown!);
      yield* waitFor(b.hold!);
    },

    *["predict-collapse"]() {
      const b = beats("predict-collapse");
      setCaption(
        "v is NOT the zero vector — and yet A − λI sends it to the origin.",
      );
      yield* waitFor(b.ask!);
      setCaption(
        "Predict, from Lesson 3: what must the area scale of A − λI be for that to be possible?",
      );
      yield* waitFor(b.think!);
    },

    *charpoly() {
      const b = beats("charpoly");
      // Now motivate WHEN a nonzero v can collapse: only if the matrix
      // A − λI itself flattens the plane (zero area scale). This is where
      // we actually morph A → A − λI and watch the unit square collapse.
      setTop("det(A − λI) = 0");
      setCaption("A nonzero v can only die if A − λI flattens area to nothing");
      // Hand the equation label back to the plain-text top; the pilot morph
      // is done. Clear the vector-subtraction construction and bring up the
      // unit square under the current matrix (still A) so collapse is visible.
      yield* all(
        eqTex.opacity(0, b.clear!),
        top.opacity(1, b.clear!),
        subArrow.opacity(0, b.clear!),
        lambdaVArrow.opacity(0, b.clear!),
        AvArrow.opacity(0, b.clear!),
        AvLabel.opacity(0, b.clear!),
        vArrow.opacity(0.25, b.clear!),
        vLabel.opacity(0, b.clear!),
        square.opacity(0.45, b.clear!),
      );
      // Morph A → A − λI: the unit square collapses onto a line (area → 0).
      // The headline is bound to the LIVE matrix, so it falls with the shape
      // rather than being stamped on before and after the morph.
      top.text(() => `det(A − λI) ≈ ${fmt(determinant2x2(matrix()))}`);
      setCaption("A − λI squashes the whole plane onto a line — area scale 0");
      yield* morphTo(SHIFTED_3, b.morph!);
      // Nudge slightly off and back to show flatness holds exactly at this λ.
      const slightlyOff: Matrix2x2 = [
        [SHIFTED_3[0][0] + 0.4, SHIFTED_3[0][1]],
        [SHIFTED_3[1][0], SHIFTED_3[1][1] + 0.4],
      ];
      setCaption("Nudge λ off and the square puffs back up — flat happens exactly at this λ");
      yield* morphTo(slightlyOff, b.off!);
      yield* morphTo(SHIFTED_3, b.back!);
      yield* waitFor(b.hold!);
    },

    *solveLambda() {
      const b = beats("solveLambda");
      setCaption("Solve λ² − (tr)λ + det = 0 for this A");
      const { b: coefB, c } = DERIVATION.charPoly.coefficients;
      setTop(`λ² ${coefB >= 0 ? "+" : ""}${fmt(coefB)}λ ${c >= 0 ? "+" : ""}${fmt(c)} = 0`);
      yield* all(square.opacity(0, b.morph!), morphTo(A, b.morph!));
      const sorted = [...DERIVATION.lambdas].sort((x, y) => y - x);
      setCaption(`Roots: λ = ${sorted.map(fmt).join(", ")}`);
      setTop(`λ = ${sorted.map(fmt).join(" and ")}`);
      yield* waitFor(b.hold!);
    },

    /**
     * Substitute a root back and solve for its eigenspace, by watching the
     * shifted matrix kill a whole line.
     *
     * Shared by both roots so the two are demonstrably the SAME procedure run
     * twice — which is the point of the step, and what a hand-written second
     * copy would quietly stop guaranteeing.
     */
    *["solveV3"]() {
      yield* solveEigenspace("solveV3", {
        lambda: LAMBDA_3,
        shifted: SHIFTED_3,
        line: line3,
        arrow: arrow3,
        label: label3,
        probe: probe3,
        note: "It is a coordinate axis.",
      });
    },

    *["solveV2"]() {
      yield* solveEigenspace("solveV2", {
        lambda: LAMBDA_2,
        shifted: SHIFTED_2,
        line: line2,
        arrow: arrow2,
        label: label2,
        probe: probe2,
        note: "A different λ, a different shifted matrix, a line off the axes.",
      });
    },

    *interpret() {
      const b = beats("interpret");
      setTop("Interpret geometrically");
      setCaption("Put A back, and keep both lines on screen.");
      // Return the plane to A: the scene should close on the matrix it is
      // about, not on the last shifted one it borrowed.
      yield* all(
        morphTo(A, b.restore!),
        shiftedNote.opacity(0, b.restore!),
        ...retireProbes(b.restore!),
      );
      setCaption(
        `λ=${fmt(LAMBDA_3)} stretches along ${formatDirectionRatio([DIR_3[0], DIR_3[1]])}; ` +
          `λ=${fmt(LAMBDA_2)} along ${formatDirectionRatio([DIR_2[0], DIR_2[1]])} — two different lines`,
      );
      // Pulse the off-axis direction so the asymmetry is the takeaway.
      yield* all(arrow2.lineWidth(9, b.emphasisUp!), label2.fontSize(34, b.emphasisUp!));
      yield* all(arrow2.lineWidth(5, b.emphasisDown!), label2.fontSize(30, b.emphasisDown!));
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of EIGEN_DERIVATION_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
