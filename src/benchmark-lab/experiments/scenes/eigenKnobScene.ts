import { Circle, Line, Node, Rect, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { matrixVectorMultiply, type Vector2 as MathVector2 } from "../../../math";
import {
  A,
  FAN_DIRECTIONS,
  LAMBDA_RANGE,
  STEPS,
  assertEigenDataIsConsistent,
  detAtLambda,
  detCurveSamples,
  lerpIdentityTo,
  shiftedAt,
  staysOnItsLine,
} from "../eigenExperimentData";
import { ACCENT, INK, INK_FAINT, INK_MUTED, STAGE_BG, makeTex, texNumber, texRoman } from "../mathType";
import { runCandidateBeats } from "../candidateKit";

/**
 * Candidate A — "Knob".
 *
 * Design thesis: eigenvalues are handed to the learner as the output of a
 * formula. Nothing in the production clip shows that λ is a quantity you can
 * VARY, that A − λI is a whole family of maps, or that the characteristic
 * equation asks one question about that family — for which λ does it stop being
 * invertible?
 *
 * So λ becomes a dial, and the frame carries two readouts of it: the whole
 * plane deforming under A − λI, and the graph of det(A − λI) against λ, traced
 * by the same sweep. The eigenvalues are then discovered rather than computed —
 * they are where the curve touches the axis and, at the same instant, where the
 * grid flattens onto a line. The characteristic polynomial is named at the END,
 * as the equation that predicts the crossings the learner has already seen.
 *
 * The whole-space deformation is the deliberate departure from the production
 * scene, which explains on a static plane with arrows on top. "This line lands
 * on itself" is only convincing if the rest of the space is visibly not doing
 * that.
 *
 * Correctness: while a root is being examined, ONLY that root's null direction
 * is drawn. A − 2I kills exactly one of the two eigenlines, and showing both
 * there would imply it kills both. Both come back only after the plane returns
 * to A.
 */

const S = 58;
const PLANE = new Vector2(-206, 26);
/** The plane's viewport. A deforming grid is unbounded; the frame is not. */
const PLANE_W = 520;
const PLANE_H = 384;
const px = (p: MathVector2): Vector2 =>
  new Vector2(PLANE.x + p[0] * S, PLANE.y - p[1] * S);

/** Curve panel, right of the plane. */
const CURVE = new Vector2(272, 40);
const CURVE_W = 148;
const CURVE_H = 84;
const DET_RANGE: readonly [number, number] = [-1.6, 6.4];
const curvePx = (lambda: number, det: number): Vector2 =>
  new Vector2(
    CURVE.x + ((lambda - LAMBDA_RANGE[0]) / (LAMBDA_RANGE[1] - LAMBDA_RANGE[0])) * CURVE_W * 2 - CURVE_W,
    CURVE.y - ((det - DET_RANGE[0]) / (DET_RANGE[1] - DET_RANGE[0])) * CURVE_H * 2 + CURVE_H,
  );

const GRID_EXTENT = 4;

/**
 * Two decimals for the dial's live readouts.
 *
 * These DO tick, and that is the point: λ is a continuous parameter here and
 * `A − λI` is genuinely defined at every value of it. That is the opposite of
 * the elimination clip, where an interpolated coefficient pretended to be a row
 * somebody had written down. Three decimals just made the numbers hard to read.
 */
const dp2 = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
};

export const eigenKnobScene = makeScene2D(function* (view) {
  assertEigenDataIsConsistent();
  view.fill(STAGE_BG);

  /* --------------------------------------------------- the deforming plane */
  /**
   * λ drives everything: the matrix, the grid, the fan, the readouts, and the
   * playhead on the curve. One quantity, several views of it.
   */
  const lambda = createSignal(0);
  /**
   * How much of the curve has been traced. Driven alongside λ during the
   * sweeps and never rewound, so resetting λ for the closing frame does not
   * erase the record of where the crossings were found.
   */
  const traceTo = createSignal(0);
  /** How far the plane has been carried toward `A − λI`. */
  const applyT = createSignal(0);
  const live = () => lerpIdentityTo(shiftedAt(lambda()), applyT());
  /** Separate: the opening beats deform by A itself, not by the shifted map. */
  const showA = createSignal(0);
  const liveMap = () =>
    showA() > 0 ? lerpIdentityTo(A, showA()) : live();

  const mapped = (p: MathVector2): Vector2 =>
    px(matrixVectorMultiply(liveMap(), p));

  // Everything that moves with the map lives inside a clipped viewport: a grid
  // under a shear runs hundreds of pixels past any fixed extent, and letting it
  // cross into the curve panel would make two unrelated pictures share ink.
  const planeFrame = new Rect({
    x: PLANE.x,
    y: PLANE.y,
    width: PLANE_W,
    height: PLANE_H,
    radius: 10,
    stroke: INK_FAINT,
    lineWidth: 1.5,
    clip: true,
  });
  view.add(planeFrame);
  const gridGroup = new Node({ position: () => new Vector2(-PLANE.x, -PLANE.y) });
  planeFrame.add(gridGroup);
  for (let k = -GRID_EXTENT; k <= GRID_EXTENT; k += 1) {
    const isAxis = k === 0;
    // Both families follow the live map, so the whole space moves — not a
    // static frame with arrows drawn on top of it.
    gridGroup.add(
      new Line({
        stroke: isAxis ? INK_MUTED : INK_FAINT,
        lineWidth: isAxis ? 2 : 1,
        points: () => [mapped([k, -GRID_EXTENT]), mapped([k, GRID_EXTENT])],
      }),
    );
    gridGroup.add(
      new Line({
        stroke: isAxis ? INK_MUTED : INK_FAINT,
        lineWidth: isAxis ? 2 : 1,
        points: () => [mapped([-GRID_EXTENT, k]), mapped([GRID_EXTENT, k])],
      }),
    );
  }

  /** The fan: most directions visibly leave their ray; two do not. */
  const fan = FAN_DIRECTIONS.map((direction) => {
    const onLine = staysOnItsLine(direction);
    const arrow = new Line({
      stroke: onLine ? ACCENT.invariant : INK_MUTED,
      lineWidth: onLine ? 5 : 3,
      endArrow: true,
      arrowSize: 12,
      opacity: 0,
      points: () => [px([0, 0]), mapped(direction)],
    });
    gridGroup.add(arrow);
    return { arrow, onLine };
  });

  /** The two eigenlines, each shown only when it is the one under discussion. */
  const eigenLines = STEPS.map((step, index) => {
    // Drawn in INPUT coordinates: the eigenline is a set of inputs, and under
    // A − λI its IMAGE is the origin. Mapping the line itself would collapse it
    // to a point and say nothing.
    const line = new Line({
      stroke: index === 0 ? ACCENT.rowOne : ACCENT.rowTwo,
      lineWidth: 4,
      lineDash: [12, 8],
      opacity: 0,
      points: [
        px([step.direction[0] * -3.4, step.direction[1] * -3.4]),
        px([step.direction[0] * 3.4, step.direction[1] * 3.4]),
      ],
    });
    gridGroup.add(line);
    /** A probe on that line, and its image — which never leaves the origin. */
    const probe = new Circle({
      size: 16,
      fill: index === 0 ? ACCENT.rowOne : ACCENT.rowTwo,
      opacity: 0,
      position: px([step.direction[0] * 2.1, step.direction[1] * 2.1]),
    });
    gridGroup.add(probe);
    const dot = new Circle({
      size: 18,
      fill: ACCENT.target,
      stroke: STAGE_BG,
      lineWidth: 3,
      opacity: 0,
      position: () => mapped([step.direction[0] * 2.1, step.direction[1] * 2.1]),
    });
    gridGroup.add(dot);
    const label = makeTex(
      `\\lambda = ${texNumber(step.lambda)}`,
      30,
      { fill: index === 0 ? ACCENT.rowOne : ACCENT.rowTwo, opacity: 0 },
    );
    label.position(
      px([step.direction[0] * 2.6, step.direction[1] * 2.6]).add(
        new Vector2(index === 0 ? 8 : 54, index === 0 ? -30 : 8),
      ),
    );
    view.add(label);
    return { line, dot, probe, label, step };
  });

  const origin = new Circle({ size: 12, fill: INK, position: px([0, 0]) });
  gridGroup.add(origin);

  /* ------------------------------------------------------------ the dial */
  const dial = new Node({ opacity: 0 });
  view.add(dial);
  const TRACK_Y = -206;
  const trackX = (value: number) =>
    curvePx(value, 0).x;
  dial.add(
    new Line({
      stroke: INK_FAINT,
      lineWidth: 3,
      points: [
        new Vector2(trackX(LAMBDA_RANGE[0]), TRACK_Y),
        new Vector2(trackX(LAMBDA_RANGE[1]), TRACK_Y),
      ],
    }),
  );
  for (const stop of [0, 1, 2, 3, 4]) {
    dial.add(
      new Line({
        stroke: INK_MUTED,
        lineWidth: 2,
        points: [
          new Vector2(trackX(stop), TRACK_Y - 8),
          new Vector2(trackX(stop), TRACK_Y + 8),
        ],
      }),
    );
    const numeral = makeTex(texNumber(stop), 22, { fill: INK_MUTED });
    numeral.position(new Vector2(trackX(stop), TRACK_Y - 28));
    dial.add(numeral);
  }
  const knob = new Circle({
    size: 20,
    fill: ACCENT.invariant,
    position: () => new Vector2(trackX(lambda()), TRACK_Y),
  });
  dial.add(knob);
  const dialLabel = makeTex(
    () => `\\lambda = ${dp2(lambda())}`,
    30,
    { fill: ACCENT.invariant },
  );
  dialLabel.position(new Vector2(trackX(LAMBDA_RANGE[1]) + 78, TRACK_Y));
  dial.add(dialLabel);

  /* ------------------------------------------------- the shifted matrix */
  const shiftedLabel = makeTex(
    () => {
      const m = shiftedAt(lambda());
      return `A - \\lambda I = \\begin{bmatrix} ${dp2(m[0][0])} & ${dp2(m[0][1])} \\\\ ${dp2(m[1][0])} & ${dp2(m[1][1])} \\end{bmatrix}`;
    },
    32,
    { fill: INK, opacity: 0 },
  );
  shiftedLabel.position(new Vector2(-250, -206));
  view.add(shiftedLabel);

  /* ----------------------------------------------------- the det(λ) curve */
  const curvePanel = new Node({ opacity: 0 });
  view.add(curvePanel);
  curvePanel.add(
    new Line({
      stroke: INK_MUTED,
      lineWidth: 2,
      points: [
        curvePx(LAMBDA_RANGE[0], 0),
        curvePx(LAMBDA_RANGE[1], 0),
      ],
    }),
  );
  curvePanel.add(
    new Line({
      stroke: INK_FAINT,
      lineWidth: 1.5,
      points: [
        curvePx(LAMBDA_RANGE[0], DET_RANGE[0]),
        curvePx(LAMBDA_RANGE[0], DET_RANGE[1]),
      ],
    }),
  );
  const curveTitle = makeTex("\\det(A - \\lambda I)", 28, { fill: INK });
  curveTitle.position(curvePx(LAMBDA_RANGE[0], DET_RANGE[1]).add(new Vector2(96, -22)));
  curvePanel.add(curveTitle);

  /**
   * The curve is TRACED by the sweep: only the part of it the dial has already
   * visited is drawn, so it is a record of the motion rather than a plot that
   * was there all along.
   */
  const SAMPLES = detCurveSamples();
  const traced = new Line({
    stroke: ACCENT.invariant,
    lineWidth: 4,
    points: () =>
      SAMPLES.filter(([value]) => value <= traceTo() + 1e-9).map(([value, det]) =>
        curvePx(value, det),
      ),
  });
  curvePanel.add(traced);
  const playhead = new Circle({
    size: 14,
    fill: ACCENT.invariant,
    position: () => curvePx(lambda(), detAtLambda(lambda())),
  });
  curvePanel.add(playhead);

  /** Zero markers, dropped as each crossing is reached. */
  const zeroMarks = STEPS.map((step) => {
    const mark = new Circle({
      size: 16,
      fill: STAGE_BG,
      stroke: ACCENT.target,
      lineWidth: 3,
      opacity: 0,
      position: curvePx(step.lambda, 0),
    });
    curvePanel.add(mark);
    const label = makeTex(texNumber(step.lambda), 26, {
      fill: ACCENT.target,
      opacity: 0,
    });
    label.position(curvePx(step.lambda, 0).add(new Vector2(0, 30)));
    curvePanel.add(label);
    return { mark, label };
  });

  const detReadout = makeTex(
    () => `\\det = ${dp2(detAtLambda(lambda()))}`,
    30,
    { fill: INK_MUTED, opacity: 0 },
  );
  detReadout.position(new Vector2(CURVE.x, CURVE.y + CURVE_H + 52));
  view.add(detReadout);

  /* ------------------------------------------------------------- caption */
  const caption = makeTex("", 30, { fill: INK_MUTED, opacity: 0 });
  caption.position(new Vector2(0, 250));
  view.add(caption);
  const say = function* (text: string, duration: number): ThreadGenerator {
    caption.tex(text);
    yield* caption.opacity(1, duration);
  };

  const polynomial = makeTex("", 32, { fill: INK, opacity: 0 });
  polynomial.position(new Vector2(-196, -206));
  view.add(polynomial);

  const bodies: Record<string, () => ThreadGenerator> = {
    *fan() {
      caption.tex(texRoman("A acts on every direction at once"));
      yield* all(
        caption.opacity(1, 0.5),
        ...fan.map(({ arrow }) => arrow.opacity(0.9, 0.5)),
      );
      yield* waitFor(0.5);
      // The whole space moves. Most rays turn; two do not — but nothing says
      // which yet.
      yield* showA(1, 2.4, easeInOutCubic);
      yield* waitFor(1.6);
    },

    *eigenlines() {
      yield* say(texRoman("two directions came back onto their own line"), 0.4);
      yield* all(
        ...eigenLines.map(({ line }) => line.opacity(0.8, 0.6)),
        ...fan
          .filter(({ onLine }) => !onLine)
          .map(({ arrow }) => arrow.opacity(0.28, 0.6)),
      );
      yield* waitFor(1.2);
      yield* say(
        `${texRoman("on those, ")}A\\mathbf{v} = \\lambda\\mathbf{v}${texRoman(" for some number ")}\\lambda`,
        0.4,
      );
      yield* waitFor(2.0);
      // Retire the labels: which λ belongs to which line is what the rest of
      // the clip is for, and asserting it here would give the answer away.
      yield* all(
        ...eigenLines.map(({ line }) => line.opacity(0, 0.5)),
        ...fan.map(({ arrow }) => arrow.opacity(0, 0.5)),
      );
    },

    *shift() {
      yield* say(
        `${texRoman("subtract ")}\\lambda${texRoman(" from the diagonal — a whole family of maps")}`,
        0.4,
      );
      // Return to the identity before switching which matrix drives the plane:
      // at t = 0 every map is the identity, so the swap is invisible.
      yield* showA(0, 1.2, easeInOutCubic);
      lambda(0);
      showA(0);
      yield* shiftedLabel.opacity(1, 0.5);
      yield* applyT(1, 1.4, easeInOutCubic);
      yield* all(dial.opacity(1, 0.5), curvePanel.opacity(1, 0.5), detReadout.opacity(1, 0.5));
      yield* waitFor(1.0);
    },

    *sweep() {
      yield* say(
        `${texRoman("turn ")}\\lambda${texRoman(" and watch the determinant")}`,
        0.4,
      );
      // One quantity moves; every other thing in the frame is a function of it.
      yield* all(lambda(1.72, 4.2, easeInOutCubic), traceTo(1.72, 4.2, easeInOutCubic));
      yield* waitFor(0.9);
    },

    *firstZero() {
      yield* say(
        `${texRoman("at ")}\\lambda = ${texNumber(STEPS[1]!.lambda)}${texRoman(" the determinant is zero — the plane is flat")}`,
        0.35,
      );
      yield* all(
        lambda(STEPS[1]!.lambda, 1.5, easeInOutCubic),
        traceTo(STEPS[1]!.lambda, 1.5, easeInOutCubic),
      );
      yield* all(
        zeroMarks[1]!.mark.opacity(1, 0.4),
        zeroMarks[1]!.label.opacity(1, 0.4),
      );
      yield* waitFor(1.9);
    },

    *kernel1() {
      // ONLY this root's null direction. A − 2I kills exactly one eigenline;
      // drawing both here would say it kills both.
      yield* say(
        texRoman("one whole line was sent to the origin — that is the eigenspace"),
        0.35,
      );
      yield* all(
        eigenLines[1]!.line.opacity(0.9, 0.5),
        eigenLines[1]!.probe.opacity(1, 0.5),
        eigenLines[1]!.dot.opacity(1, 0.5),
        eigenLines[1]!.label.opacity(1, 0.5),
      );
      yield* waitFor(2.6);
      yield* all(
        eigenLines[1]!.line.opacity(0, 0.4),
        eigenLines[1]!.probe.opacity(0, 0.4),
        eigenLines[1]!.dot.opacity(0, 0.4),
        eigenLines[1]!.label.opacity(0, 0.4),
      );
    },

    *secondZero() {
      yield* say(texRoman("keep turning"), 0.35);
      yield* all(lambda(2.6, 1.6, easeInOutCubic), traceTo(2.6, 1.6, easeInOutCubic));
      yield* say(
        `${texRoman("and again at ")}\\lambda = ${texNumber(STEPS[0]!.lambda)}`,
        0.3,
      );
      yield* all(
        lambda(STEPS[0]!.lambda, 1.2, easeInOutCubic),
        traceTo(STEPS[0]!.lambda, 1.2, easeInOutCubic),
      );
      yield* all(
        zeroMarks[0]!.mark.opacity(1, 0.4),
        zeroMarks[0]!.label.opacity(1, 0.4),
      );
      yield* waitFor(1.1);
    },

    *kernel2() {
      yield* say(texRoman("a different line dies this time"), 0.35);
      yield* all(
        eigenLines[0]!.line.opacity(0.9, 0.5),
        eigenLines[0]!.probe.opacity(1, 0.5),
        eigenLines[0]!.dot.opacity(1, 0.5),
        eigenLines[0]!.label.opacity(1, 0.5),
      );
      yield* waitFor(2.2);
    },

    *polynomial() {
      // Only now is the polynomial named — as the equation that PREDICTS the
      // crossings the learner has already watched happen.
      yield* say(
        texRoman("the curve is a quadratic; its roots are the eigenvalues"),
        0.4,
      );
      polynomial.tex(
        `\\det(A - \\lambda I) = (${texNumber(STEPS[0]!.lambda)} - \\lambda)(${texNumber(STEPS[1]!.lambda)} - \\lambda)`,
      );
      // It replaces the shifted-matrix readout rather than being laid over the
      // plane: the two never need to be read at the same time.
      yield* shiftedLabel.opacity(0, 0.4);
      yield* all(polynomial.opacity(1, 0.5), detReadout.opacity(0, 0.5));
      yield* waitFor(1.2);
      // Restore A, and only NOW may both eigendirections share the frame:
      // under A each is scaled by its own λ, which is true of both at once.
      lambda(0);
      applyT(0);
      yield* all(
        showA(1, 1.4, easeInOutCubic),
        eigenLines[1]!.line.opacity(0.9, 0.7),
        eigenLines[1]!.label.opacity(1, 0.7),
        eigenLines[0]!.probe.opacity(0, 0.5),
        eigenLines[0]!.dot.opacity(0, 0.5),
        dial.opacity(0.25, 0.7),
      );
      yield* say(
        texRoman("back under A: each line is stretched by its own eigenvalue"),
        0.4,
      );
      yield* waitFor(1.6);
    },
  };

  yield* runCandidateBeats("knob", bodies, "eigen");
});
