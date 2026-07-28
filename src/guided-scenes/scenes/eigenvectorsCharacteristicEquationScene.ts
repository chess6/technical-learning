import { Circle, Latex, Line, Node, Rect, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import {
  matrixVectorMultiply,
  type Matrix2x2,
  type Vector2 as MathVector2,
} from "../../math";
import {
  LAMBDA_RANGE,
  STEPS,
  assertEigenDerivationDataIsConsistent,
  detAtLambda,
  detCurveSamples,
  lerpIdentityTo,
  shiftedAt,
  texNumber,
} from "./eigenDerivationData";
import { bridgeBeat } from "./eigenDerivationScript";
import {
  EIGEN_CHARACTERISTIC_SEGMENTS,
  requireBeats,
} from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";

/**
 * The characteristic-equation bridge.
 *
 * It sits beside the theorem, between the lesson's two other clips and doing
 * neither of their jobs. `eigenvectors-invariant-directions` shows THAT some
 * directions survive; `eigenvectors-derivation` shows HOW to compute them on
 * paper. Between them sits the step a learner most often takes on trust: why
 * the eigenvalues should be the roots of a determinant at all.
 *
 * So λ becomes a dial. `A − λI` is presented as a whole FAMILY of maps, the
 * plane deforms under whichever member the dial selects, and the graph of
 * `det(A − λI)` is traced by the same sweep. The eigenvalues are then found
 * rather than computed: they are where the curve crosses the axis and, at the
 * same instant, where the grid flattens onto a line. Both roots of
 * `(3 − λ)(2 − λ)` are simple, so the curve passes through zero at each of them
 * and is negative in between — it does not touch and turn back. The polynomial
 * is named
 * last, as the equation that predicts crossings the learner has already
 * watched happen.
 *
 * Adapted from the laboratory's "Knob" candidate, cut to that one idea: the
 * opening fan and the per-root eigenspace solves both belong to the clips
 * either side of it, so this one keeps only the dial and the collapse.
 *
 * Two things it must keep apart, because they are different lines in different
 * spaces and drawing both unlabelled reads as self-contradiction:
 *
 *  - the KERNEL, the inputs sent to the origin, drawn in input coordinates —
 *    at λ = 2 the shifted map is `(x, y) ↦ (x + y, 0)`, so the kernel is
 *    `y = −x`;
 *  - the IMAGE, where the whole plane lands, which is what the collapsed grid
 *    IS — at λ = 2 that is `y = 0`.
 *
 * They swap over between the two roots. Which of them is on screen in each beat
 * is declared in `eigenDerivationScript`'s `BRIDGE_BEATS` and read back through
 * `bridgeBeat`, so the separation is a property of a table a test can check
 * rather than of hand-written opacity calls.
 */

const SCENE_ID = "eigenvectors-characteristic-equation";

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
    CURVE.x +
      ((lambda - LAMBDA_RANGE[0]) / (LAMBDA_RANGE[1] - LAMBDA_RANGE[0])) *
        CURVE_W *
        2 -
      CURVE_W,
    CURVE.y -
      ((det - DET_RANGE[0]) / (DET_RANGE[1] - DET_RANGE[0])) * CURVE_H * 2 +
      CURVE_H,
  );

const GRID_EXTENT = 4;

/**
 * Two decimals for the dial's live readouts.
 *
 * These DO tick, and that is the point: λ is a continuous parameter here and
 * `A − λI` is genuinely defined at every value of it — unlike an interpolated
 * coefficient, which would pretend to be a number somebody had written down.
 */
const dp2 = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
};

/** Prose inside math mode, so a caption can carry a live λ without leaving it. */
const roman = (text: string): string => `\\text{${text}}`;

function tex(
  value: Parameters<typeof Latex.prototype.tex>[0] | (() => string),
  size: number,
  fill: string = ROLE.text,
): Latex {
  return new Latex({ tex: value as never, fontSize: size, fill });
}

export const eigenvectorsCharacteristicEquationScene = makeScene2D(function* (
  view,
) {
  assertEigenDerivationDataIsConsistent();
  view.fill(ROLE.background);

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  /* --------------------------------------------------- the deforming plane */
  /**
   * λ drives everything: the matrix, the grid, the readouts, and the playhead
   * on the curve. One quantity, several views of it.
   */
  const lambda = createSignal(0);
  /**
   * How much of the curve has been traced. Driven alongside λ and never
   * rewound, so resetting λ for the closing frame does not erase the record of
   * where the crossings were found.
   */
  const traceTo = createSignal(0);
  /** How far the plane has been carried toward `A − λI`. */
  const applyT = createSignal(0);
  const live = (): Matrix2x2 => lerpIdentityTo(shiftedAt(lambda()), applyT());
  const mapped = (p: MathVector2): Vector2 =>
    px(matrixVectorMultiply(live(), p));

  // Everything that moves with the map lives inside a clipped viewport: a grid
  // under a shear runs hundreds of pixels past any fixed extent, and letting it
  // cross into the curve panel would make two unrelated pictures share ink.
  const planeFrame = new Rect({
    x: PLANE.x,
    y: PLANE.y,
    width: PLANE_W,
    height: PLANE_H,
    radius: 10,
    stroke: ROLE.grid,
    lineWidth: 1.5,
    clip: true,
  });
  view.add(planeFrame);
  const gridGroup = new Node({
    key: "semantic:characteristic:plane",
    position: () => new Vector2(-PLANE.x, -PLANE.y),
  });
  planeFrame.add(gridGroup);
  for (let k = -GRID_EXTENT; k <= GRID_EXTENT; k += 1) {
    const isAxis = k === 0;
    // Both families follow the live map, so the whole space moves — not a
    // static frame with arrows drawn on top of it.
    gridGroup.add(
      new Line({
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        points: () => [mapped([k, -GRID_EXTENT]), mapped([k, GRID_EXTENT])],
      }),
    );
    gridGroup.add(
      new Line({
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        points: () => [mapped([-GRID_EXTENT, k]), mapped([GRID_EXTENT, k])],
      }),
    );
  }

  /**
   * Per-root kernel and image.
   *
   * `basis1`/`basis2` are the two co-equal eigendirections; `target` is the
   * image line, which is a different object and never borrows their hue.
   */
  const roots = STEPS.map((step, index) => {
    const kernelColor = index === 0 ? ROLE.basis1 : ROLE.basis2;
    // Drawn in INPUT coordinates: the eigenline is a set of inputs, and under
    // A − λI its image is the origin. Mapping the line itself would collapse it
    // to a point and say nothing.
    const line = new Line({
      stroke: kernelColor,
      lineWidth: 4,
      lineDash: [12, 8],
      opacity: 0,
      points: [
        px([step.direction[0] * -3.4, step.direction[1] * -3.4]),
        px([step.direction[0] * 3.4, step.direction[1] * 3.4]),
      ],
    });
    gridGroup.add(line);

    /**
     * A probe that WALKS the kernel while its image sits still on the origin.
     * Per-root, so one root's walk cannot drive the other's.
     */
    const probeT = createSignal(-1);
    const at = (): MathVector2 => [
      step.direction[0] * probeT() * 2.4,
      step.direction[1] * probeT() * 2.4,
    ];
    const probe = new Circle({
      key: `semantic:characteristic:probe-${index}`,
      size: 16,
      fill: kernelColor,
      opacity: 0,
      position: () => px(at()),
    });
    gridGroup.add(probe);
    const image = new Circle({
      size: 18,
      fill: ROLE.target,
      stroke: ROLE.background,
      lineWidth: 3,
      opacity: 0,
      position: () => mapped(at()),
    });
    gridGroup.add(image);

    /** Where the whole plane lands: a different line, in the output space. */
    const imageLine = new Line({
      stroke: ROLE.target,
      lineWidth: 6,
      opacity: 0,
      points: [
        px([step.imageDirection[0] * -4, step.imageDirection[1] * -4]),
        px([step.imageDirection[0] * 4, step.imageDirection[1] * 4]),
      ],
    });
    gridGroup.add(imageLine);

    const imageLabel = tex(
      `${roman("image: the whole plane lands here")}`,
      22,
      ROLE.target,
    );
    imageLabel.position(
      px([step.imageDirection[0] * 2.4, step.imageDirection[1] * 2.4]).add(
        new Vector2(index === 0 ? 118 : 26, index === 0 ? 26 : -26),
      ),
    );
    imageLabel.opacity(0);
    view.add(imageLabel);

    /**
     * Two names for one line, because it is two different things depending on
     * which map is on screen. While `A − λI` is singular it is that map's
     * KERNEL; back under `A` — which is invertible, and whose kernel is
     * {0} — the same line is an eigendirection. Carrying the word "kernel"
     * into the closing frame would have been simply false.
     */
    const labelAt = (body: string): Latex => {
      const node = tex(body, 24, kernelColor);
      node.position(
        px([step.direction[0] * 2.6, step.direction[1] * 2.6]).add(
          new Vector2(index === 0 ? 8 : 92, index === 0 ? -30 : 20),
        ),
      );
      node.opacity(0);
      view.add(node);
      return node;
    };
    const kernelLabel = labelAt(
      `${roman("kernel: ")}\\lambda = ${texNumber(step.lambda)}`,
    );
    // Short on purpose: the closing caption already says what these lines do
    // under A, and a long label runs off the plane's viewport.
    const eigenLabel = labelAt(`\\lambda = ${texNumber(step.lambda)}`);

    return {
      line,
      probe,
      probeT,
      image,
      imageLine,
      imageLabel,
      kernelLabel,
      eigenLabel,
      step,
    };
  });

  const origin = new Circle({ size: 12, fill: ROLE.text, position: px([0, 0]) });
  gridGroup.add(origin);

  /* -------------------------------------------------------------- the dial */
  const dial = new Node({ opacity: 0 });
  view.add(dial);
  const TRACK_Y = -206;
  const trackX = (value: number) => curvePx(value, 0).x;
  dial.add(
    new Line({
      stroke: ROLE.grid,
      lineWidth: 3,
      points: [
        new Vector2(trackX(LAMBDA_RANGE[0]), TRACK_Y),
        new Vector2(trackX(LAMBDA_RANGE[1]), TRACK_Y),
      ],
    }),
  );
  for (let stop = LAMBDA_RANGE[0]; stop <= LAMBDA_RANGE[1]; stop += 1) {
    dial.add(
      new Line({
        stroke: ROLE.axis,
        lineWidth: 2,
        points: [
          new Vector2(trackX(stop), TRACK_Y - 8),
          new Vector2(trackX(stop), TRACK_Y + 8),
        ],
      }),
    );
    const numeral = tex(texNumber(stop), 20, ROLE.textMuted);
    numeral.position(new Vector2(trackX(stop), TRACK_Y - 28));
    dial.add(numeral);
  }
  const knob = new Circle({
    key: "semantic:characteristic:knob",
    size: 20,
    fill: ROLE.selected,
    position: () => new Vector2(trackX(lambda()), TRACK_Y),
  });
  dial.add(knob);
  const dialLabel = tex(
    () => `\\lambda = ${dp2(lambda())}`,
    28,
    ROLE.selected,
  );
  // Under the track, not beside it: at λ = 1.72 a readout hung off the right
  // end ran past the stage edge.
  dialLabel.position(
    new Vector2((trackX(LAMBDA_RANGE[0]) + trackX(LAMBDA_RANGE[1])) / 2, TRACK_Y + 36),
  );
  dial.add(dialLabel);

  /* --------------------------------------------------- the shifted matrix */
  const shiftedLabel = tex(() => {
    const m = shiftedAt(lambda());
    return `A - \\lambda I = \\begin{bmatrix} ${dp2(m[0][0])} & ${dp2(m[0][1])} \\\\ ${dp2(m[1][0])} & ${dp2(m[1][1])} \\end{bmatrix}`;
  }, 30);
  shiftedLabel.position(new Vector2(-256, -206));
  shiftedLabel.opacity(0);
  view.add(shiftedLabel);

  /* ------------------------------------------------------ the det(λ) curve */
  const curvePanel = new Node({ opacity: 0 });
  view.add(curvePanel);
  curvePanel.add(
    new Line({
      stroke: ROLE.axis,
      lineWidth: 2,
      points: [curvePx(LAMBDA_RANGE[0], 0), curvePx(LAMBDA_RANGE[1], 0)],
    }),
  );
  curvePanel.add(
    new Line({
      stroke: ROLE.grid,
      lineWidth: 1.5,
      points: [
        curvePx(LAMBDA_RANGE[0], DET_RANGE[0]),
        curvePx(LAMBDA_RANGE[0], DET_RANGE[1]),
      ],
    }),
  );
  const curveTitle = tex("\\det(A - \\lambda I)", 26);
  curveTitle.position(
    curvePx(LAMBDA_RANGE[0], DET_RANGE[1]).add(new Vector2(94, -24)),
  );
  curvePanel.add(curveTitle);

  /**
   * The curve is TRACED by the sweep: only the part the dial has already
   * visited is drawn, so it is a record of the motion rather than a plot that
   * was there all along.
   */
  const SAMPLES = detCurveSamples();
  const traced = new Line({
    key: "semantic:characteristic:det-curve",
    stroke: ROLE.selected,
    lineWidth: 4,
    /**
     * No ink until the dial has actually moved. At λ = 0 exactly one sample
     * qualifies, and a one-point line is a visible object with no measurable
     * geometry; ramping the opacity off the same signal that draws it keeps the
     * two in step without a separate cue to keep synchronized.
     */
    opacity: () =>
      Math.min(1, Math.max(0, (traceTo() - LAMBDA_RANGE[0] - 0.05) / 0.12)),
    points: () =>
      SAMPLES.filter(([value]) => value <= traceTo() + 1e-9).map(
        ([value, det]) => curvePx(value, det),
      ),
  });
  curvePanel.add(traced);
  const playhead = new Circle({
    key: "semantic:characteristic:playhead",
    size: 14,
    fill: ROLE.selected,
    position: () => curvePx(lambda(), detAtLambda(lambda())),
  });
  curvePanel.add(playhead);

  /** Zero markers, dropped as each crossing is reached. */
  const zeroMarks = STEPS.map((step) => {
    const mark = new Circle({
      size: 16,
      fill: ROLE.background,
      stroke: ROLE.target,
      lineWidth: 3,
      opacity: 0,
      position: curvePx(step.lambda, 0),
    });
    curvePanel.add(mark);
    const label = tex(texNumber(step.lambda), 24, ROLE.target);
    label.position(curvePx(step.lambda, 0).add(new Vector2(0, 30)));
    label.opacity(0);
    curvePanel.add(label);
    return { mark, label };
  });

  const detReadout = tex(
    () => `\\det = ${dp2(detAtLambda(lambda()))}`,
    28,
    ROLE.textMuted,
  );
  detReadout.position(new Vector2(CURVE.x, CURVE.y + CURVE_H + 52));
  detReadout.opacity(0);
  view.add(detReadout);

  /* -------------------------------------------------------------- caption */
  const caption = tex("", 28, ROLE.textMuted);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  caption.opacity(0);
  view.add(caption);
  const say = function* (body: string, duration: number): ThreadGenerator {
    caption.tex(body);
    yield* caption.opacity(1, duration);
  };

  const polynomial = tex("", 30);
  polynomial.position(new Vector2(-200, -206));
  polynomial.opacity(0);
  view.add(polynomial);

  /**
   * Bring the stage to a beat's declared state.
   *
   * Every kernel/image visibility change goes through here, reading
   * `BRIDGE_BEATS`, so "only one kernel at a time" and "the image is named
   * whenever it is on screen" are properties of a table a test can check.
   * `underA` is the closing state: no map is singular there, so there is no
   * image line, and both eigendirections may finally share the frame.
   */
  const stageFor = function* (
    beatId: string,
    duration: number,
  ): ThreadGenerator {
    const state = bridgeBeat(beatId);
    yield* all(
      ...roots.flatMap((entry, index) => {
        const kernelOn = state.underA || state.kernelOf === index;
        const walking = !state.underA && state.kernelOf === index;
        const imageOn = state.imageOf === index;
        return [
          entry.line.opacity(kernelOn ? 0.95 : 0, duration),
          entry.kernelLabel.opacity(walking ? 1 : 0, duration),
          entry.eigenLabel.opacity(state.underA ? 1 : 0, duration),
          entry.probe.opacity(walking ? 1 : 0, duration),
          entry.image.opacity(walking ? 1 : 0, duration),
          entry.imageLine.opacity(imageOn ? 0.85 : 0, duration),
          entry.imageLabel.opacity(imageOn ? 1 : 0, duration),
        ] as ThreadGenerator[];
      }),
    );
  };

  const bodies: Record<string, () => ThreadGenerator> = {
    *family() {
      const b = beats("family");
      yield* say(
        `${roman("subtract ")}\\lambda${roman(" down the diagonal: one map for every ")}\\lambda`,
        b.caption!,
      );
      yield* shiftedLabel.opacity(1, b.matrix!);
      // At λ = 0 the family's member IS A, so this deformation is the same one
      // the introduction ended on — the bridge starts where that clip stopped.
      yield* applyT(1, b.carry!, easeInOutCubic);
      yield* all(
        dial.opacity(1, b.panels!),
        curvePanel.opacity(1, b.panels!),
        detReadout.opacity(1, b.panels!),
      );
      yield* waitFor(b.hold!);
    },

    *sweep() {
      const b = beats("sweep");
      yield* say(
        `${roman("turn ")}\\lambda${roman(" and watch the determinant")}`,
        b.caption!,
      );
      // One quantity moves; everything else in the frame is a function of it.
      yield* all(
        lambda(1.72, b.turn!, easeInOutCubic),
        traceTo(1.72, b.turn!, easeInOutCubic),
      );
      yield* waitFor(b.hold!);
    },

    *predict() {
      const b = beats("predict");
      // Nothing moves. The dial, the live matrix, the traced curve and the
      // determinant readout are all still on screen and all still say the same
      // thing, which is what makes this answerable rather than a guess.
      yield* say(
        `${roman("it is shrinking. What will the plane do when it reaches ")}0${roman("?")}`,
        b.ask!,
      );
      yield* waitFor(b.think!);
    },

    *firstZero() {
      const b = beats("firstZero");
      // Prospective while the dial is still travelling: naming the value it is
      // about to reach reads as the clip giving away the answer rather than
      // letting the learner watch it arrive.
      yield* say(roman("the determinant is falling toward zero"), b.ask!);
      yield* all(
        lambda(STEPS[1]!.lambda, b.travel!, easeInOutCubic),
        traceTo(STEPS[1]!.lambda, b.travel!, easeInOutCubic),
      );
      // Landed: now it can be named.
      yield* say(
        `${roman("at ")}\\lambda = ${texNumber(STEPS[1]!.lambda)}${roman(" it is zero — and the plane is flat")}`,
        b.name!,
      );
      yield* all(
        zeroMarks[1]!.mark.opacity(1, b.mark!),
        zeroMarks[1]!.label.opacity(1, b.mark!),
      );
      // The flattened grid IS the image; the kernel is a different line, and
      // both are named for the space they live in.
      roots[1]!.probeT(-1);
      yield* stageFor("firstZero", b.lines!);
      yield* roots[1]!.probeT(1, b.walk!, easeInOutCubic);
      yield* waitFor(b.hold!);
    },

    *secondZero() {
      const b = beats("secondZero");
      // Clear first: at λ = 2.6 the determinant is −0.24 and the plane is still
      // two-dimensional, so an image line drawn there would claim a collapse
      // that has not happened.
      yield* stageFor("sweep", b.clear!);
      yield* say(roman("keep turning — the curve is coming back up"), b.ask!);
      yield* all(
        lambda(2.6, b.travel!, easeInOutCubic),
        traceTo(2.6, b.travel!, easeInOutCubic),
      );
      yield* all(
        lambda(STEPS[0]!.lambda, b.land!, easeInOutCubic),
        traceTo(STEPS[0]!.lambda, b.land!, easeInOutCubic),
      );
      yield* say(
        `${roman("it crosses zero again, at ")}\\lambda = ${texNumber(STEPS[0]!.lambda)}`,
        b.name!,
      );
      yield* all(
        zeroMarks[0]!.mark.opacity(1, b.mark!),
        zeroMarks[0]!.label.opacity(1, b.mark!),
      );
      // The pair swaps over: at λ = 3 the kernel is the line that WAS the image
      // at λ = 2, and vice versa.
      roots[0]!.probeT(-1);
      yield* stageFor("secondZero", b.lines!);
      yield* roots[0]!.probeT(1, b.walk!, easeInOutCubic);
      yield* waitFor(b.hold!);
    },

    *roots() {
      const b = beats("roots");
      // Only now is the polynomial named — as the equation that PREDICTS the
      // crossings the learner has already watched happen.
      yield* say(
        roman("the curve is a quadratic; its roots are the eigenvalues"),
        b.caption!,
      );
      polynomial.tex(
        `\\det(A - \\lambda I) = (${texNumber(STEPS[0]!.lambda)} - \\lambda)(${texNumber(STEPS[1]!.lambda)} - \\lambda)`,
      );
      // It replaces the shifted-matrix readout rather than being laid over the
      // plane: the two never need to be read at the same time.
      yield* all(
        shiftedLabel.opacity(0, b.swap!),
        polynomial.opacity(1, b.swap!),
        detReadout.opacity(0, b.swap!),
      );
      // Turn the dial back rather than cutting: λ = 0 selects A itself, so the
      // plane travels continuously from the collapsed state to the map the
      // lesson started with. Snapping λ moved the whole grid in one frame,
      // which reads as a different picture rather than the same one returning.
      yield* all(
        lambda(0, b.restore!, easeInOutCubic),
        stageFor("roots", b.restore!),
        dial.opacity(0.25, b.restore!),
      );
      // No member of the family is singular at λ = 0, so there is no image
      // line, and both eigendirections may finally share the frame.
      yield* say(
        roman("back at A, each line is stretched by its own eigenvalue"),
        b.close!,
      );
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of EIGEN_CHARACTERISTIC_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
