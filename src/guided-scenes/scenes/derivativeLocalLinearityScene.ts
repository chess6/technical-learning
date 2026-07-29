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
  EX_ABS,
  EX_PARABOLA,
  differenceQuotient,
  residual,
  type CalculusFixture,
} from "../../math";
import { DERIVATIVE_ZOOM_SEGMENTS, requireBeats } from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";

/**
 * Clip 1 of `derivative-local-linearity` — the zoom.
 *
 * Secants settle; then the picture is magnified about the point and the curve
 * becomes a line. The two are shown to be the same line, and then the corner is
 * magnified and never becomes one.
 *
 * **The honesty obligation this file exists to keep** (package ledger check P3):
 * every frame plots the *real sampled fixture* through `plotCurve`, which
 * evaluates `fixture.f`. There is no code path that substitutes a straight line
 * at high magnification, and the residual is drawn as a labelled, measured gap
 * at every stage — because the curvature has not gone away, it has become small
 * compared to the step. A zoom that faked straightness would teach exactly the
 * misconception the checkpoint exists to refute.
 */

const SCENE_ID = "derivative-local-linearity";

const PLOT = new Vector2(-140, 20);
const PLOT_W = 540;
const PLOT_H = 360;

/** The running example, continuing L1's arithmetic: x² at a = 3. */
const A_POINT = 3;
const SLOPE = EX_PARABOLA.derivative!(A_POINT);

function tex(
  value: string | (() => string),
  size: number,
  fill: string = ROLE.text,
): Latex {
  return new Latex({ tex: value as never, fontSize: size, fill });
}

export const derivativeLocalLinearityScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);
  const beats = (id: string) => requireBeats(SCENE_ID, id);

  /**
   * Half-width of the window, in input units. Driven by the zoom beat.
   *
   * Declared **inside** the scene generator, not at module scope. A signal at
   * module scope survives between runs, so the Player's second pass would begin
   * with the previous pass's fully-zoomed window — every earlier beat would draw
   * the wrong picture, and the reset in the final beat would register as the
   * whole panel teleporting. Seek determinism depends on this.
   */
  const halfWidth = createSignal(1.2);

  /** Live window: x within halfWidth of the point, y scaled by the true slope. */
  const centre = createSignal<number>(A_POINT);
  const activeFixture = createSignal<CalculusFixture>(EX_PARABOLA);

  /**
   * Vertical extent, scaled by the **active fixture's own** local steepness.
   *
   * Using the running example's slope for every fixture made the corner look
   * like a shallow dent: |x| rises at ±1 and the window was sized for a slope
   * of 6, so the V was flattened by a factor of six. The scale a picture is
   * drawn at is part of what it claims.
   */
  const localSlope = () => {
    const f = activeFixture();
    const a = centre();
    if (f.derivative) return f.derivative(a);
    // At a corner the derivative does not exist; the steepest one-sided slope is
    // the honest scale.
    const d = Math.max(halfWidth() * 0.5, 1e-6);
    return Math.max(
      Math.abs((f.f(a + d) - f.f(a)) / d),
      Math.abs((f.f(a) - f.f(a - d)) / d),
    );
  };
  const halfHeight = () =>
    Math.max(Math.abs(localSlope()) * halfWidth() * 1.35, halfWidth() * 0.6);

  const px = (x: number, y: number): Vector2 => {
    const a = centre();
    const y0 = activeFixture().f(a);
    return new Vector2(
      PLOT.x + ((x - a) / halfWidth()) * (PLOT_W / 2),
      PLOT.y - ((y - y0) / halfHeight()) * (PLOT_H / 2),
    );
  };

  const frame = new Rect({
    x: PLOT.x,
    y: PLOT.y,
    width: PLOT_W,
    height: PLOT_H,
    radius: 10,
    stroke: ROLE.grid,
    lineWidth: 1.5,
    clip: true,
  });
  view.add(frame);
  // A clipped Rect positions children relative to its own centre; the pixel
  // helper returns stage coordinates. Every clipped panel carries this offset.
  const inner = new Node({ position: new Vector2(-PLOT.x, -PLOT.y) });
  frame.add(inner);

  /**
   * The curve — **always the fixture's own values**, re-sampled every frame from
   * the live window. This is the P3 obligation in code.
   */
  const plotCurve = (): Vector2[] => {
    const a = centre();
    const w = halfWidth();
    const f = activeFixture().f;
    const pts: Vector2[] = [];
    for (let i = 0; i <= 320; i += 1) {
      const x = a - w + (2 * w * i) / 320;
      const y = f(x);
      if (Number.isFinite(y)) pts.push(px(x, y));
    }
    return pts;
  };
  inner.add(
    new Line({
      key: "semantic:derivative:curve",
      stroke: ROLE.original,
      lineWidth: 4,
      points: plotCurve,
    }),
  );

  const point = new Circle({
    size: 14,
    fill: ROLE.text,
    position: () => px(centre(), activeFixture().f(centre())),
  });
  inner.add(point);

  /* ------------------------------------------------------------- the secant */
  const h = createSignal(1.0);
  const secant = new Line({
    key: "semantic:derivative:secant",
    stroke: ROLE.basis2,
    lineWidth: 3,
    lineDash: [10, 8],
    opacity: 0,
    points: () => {
      const a = centre();
      const f = activeFixture().f;
      const step = h();
      if (step === 0) return [px(a, f(a)), px(a, f(a))];
      const m = differenceQuotient(f, a, step);
      const w = halfWidth() * 1.4;
      return [px(a - w, f(a) - m * w), px(a + w, f(a) + m * w)];
    },
  });
  inner.add(secant);

  const secantDot = new Circle({
    size: 12,
    fill: ROLE.basis2,
    opacity: 0,
    position: () => px(centre() + h(), activeFixture().f(centre() + h())),
  });
  inner.add(secantDot);

  /* ------------------------------------------------------------ the tangent */
  const tangent = new Line({
    key: "semantic:derivative:tangent",
    stroke: ROLE.transformed,
    lineWidth: 4,
    opacity: 0,
    points: () => {
      const a = centre();
      const f = activeFixture().f;
      const w = halfWidth() * 1.4;
      return [px(a - w, f(a) - SLOPE * w), px(a + w, f(a) + SLOPE * w)];
    },
  });
  inner.add(tangent);

  /**
   * The residual, drawn as a measured vertical gap at the window's edge, with
   * its own live readout. It is never hidden and never zeroed.
   */
  const gapAt = () => halfWidth() * 0.72;
  const gap = new Line({
    key: "semantic:derivative:residual",
    stroke: ROLE.violation,
    lineWidth: 3,
    opacity: 0,
    points: () => {
      const a = centre();
      const f = activeFixture().f;
      const d = gapAt();
      return [px(a + d, f(a) + SLOPE * d), px(a + d, f(a + d))];
    },
  });
  inner.add(gap);

  const gapLabel = tex(
    () => `E = ${residual(EX_PARABOLA.f, A_POINT, SLOPE, gapAt()).toExponential(1)}`,
    22,
    ROLE.violation,
  );
  gapLabel.position(new Vector2(258, 96));
  gapLabel.opacity(0);
  view.add(gapLabel);

  /**
   * The corner's two one-sided lines. Drawn only in the last beat, and drawn
   * because the claim "the two sides stay different lines" should be visible
   * rather than only spoken.
   */
  const sideLine = (slope: number): Line =>
    new Line({
      stroke: ROLE.violation,
      lineWidth: 3,
      lineDash: [10, 8],
      opacity: 0,
      // A half-line through (a, f(a)) of the given slope, on its own side. The
      // left branch runs BACKWARDS from the point, so its far end is at
      // f(a) - slope*w — an earlier sign slip drew it as f(a) + slope*w and it
      // visibly failed to lie on the curve.
      points: () => {
        const a = centre();
        const f = activeFixture().f;
        const w = halfWidth() * 1.3;
        return slope < 0
          ? [px(a - w, f(a) - slope * w), px(a, f(a))]
          : [px(a, f(a)), px(a + w, f(a) + slope * w)];
      },
    });
  const leftLine = sideLine(-1);
  const rightLine = sideLine(1);
  inner.add(leftLine);
  inner.add(rightLine);

  /* ------------------------------------------------------------- the labels */
  const title = tex("", 32);
  title.position(new Vector2(LABEL_CENTER_X, -230));
  title.opacity(0);
  view.add(title);

  const caption = tex("", 26, ROLE.textMuted);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  caption.opacity(0);
  view.add(caption);

  const magLabel = tex(
    () => `${Math.round(1.2 / halfWidth())}\\times`,
    28,
    ROLE.selected,
  );
  magLabel.position(new Vector2(258, -150));
  magLabel.opacity(0);
  view.add(magLabel);

  const slopeLabel = tex(() => {
    const step = h();
    return step === 0
      ? `f'(${A_POINT}) = ${SLOPE}`
      : `\\frac{f(${A_POINT}+h)-f(${A_POINT})}{h} = ${differenceQuotient(
          EX_PARABOLA.f,
          A_POINT,
          step,
        ).toFixed(3)}`;
  }, 24, ROLE.basis2);
  slopeLabel.position(new Vector2(258, -100));
  slopeLabel.opacity(0);
  view.add(slopeLabel);

  const say = function* (node: Latex, body: string, d: number): ThreadGenerator {
    node.tex(body);
    yield* node.opacity(1, d);
  };
  const roman = (t: string) => `\\text{${t}}`;

  const bodies: Record<string, () => ThreadGenerator> = {
    *secantBeat() {
      const b = beats("secantBeat");
      yield* say(title, roman("An average over an interval"), b.title!);
      yield* all(
        secant.opacity(1, b.draw!),
        secantDot.opacity(1, b.draw!),
        slopeLabel.opacity(1, b.draw!),
      );
      yield* say(
        caption,
        `${roman("the secant's slope is the average rate over ")}h`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *shrink() {
      const b = beats("shrink");
      yield* say(title, roman("Shrink the interval"), b.title!);
      // The quotient is 2a + h, so this settles on 6 — L1's forced value.
      yield* h(0.05, b.narrow!, easeInOutCubic);
      yield* say(
        caption,
        `${roman("the slope settles on ")}${SLOPE}${roman(" — L1's forced value")}`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *predict() {
      const b = beats("predict");
      // Nothing moves.
      yield* say(
        title,
        `\\begin{gathered} ${roman("The picture is about to be magnified 100 times.")} \\\\ ${roman("What will the curve look like?")} \\end{gathered}`,
        b.ask!,
      );
      yield* waitFor(b.think!);
    },

    *zoom() {
      const b = beats("zoom");
      yield* all(
        secant.opacity(0, b.clear!),
        secantDot.opacity(0, b.clear!),
        slopeLabel.opacity(0, b.clear!),
      );
      // PARK the secant marker on the point before the window narrows. Its
      // position is `a + h` in world units, so a fixed h in a window shrinking
      // 100x sends it a thousand pixels off-panel. Fading it is not enough — the
      // teleport gate measures position, not visibility, and it is right to:
      // an object that keeps moving while invisible has not left the scene, it
      // has just stopped being watched.
      h(0);
      yield* say(title, roman("It becomes a line"), b.title!);
      yield* all(magLabel.opacity(1, b.reveal!), gapLabel.opacity(1, b.reveal!), gap.opacity(1, b.reveal!));
      // Successive magnifications. The curve is re-sampled at every frame; the
      // residual shrinks but is drawn and read out at each stage.
      yield* halfWidth(0.012, b.magnify!, easeInOutCubic);
      yield* say(
        caption,
        roman("the gap is still there — it is small compared to the step, not zero"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *same() {
      const b = beats("same");
      yield* say(title, roman("The same line the secants settled on"), b.title!);
      yield* tangent.opacity(1, b.draw!);
      yield* say(caption, `f'(${A_POINT}) = ${SLOPE}`, b.caption!);
      yield* waitFor(b.hold!);
    },

    *corner() {
      const b = beats("corner");
      // A STAGED reset, not an imperative snap. Changing the fixture, the
      // centre, and the window in one frame moves every node at once, which the
      // teleport gate correctly reads as objects losing their identity. So the
      // panel fades out, the swap happens while nothing is visible, and it fades
      // back in — the same pattern `matrix-composition` uses for its resets.
      yield* all(
        tangent.opacity(0, b.clear!),
        gap.opacity(0, b.clear!),
        gapLabel.opacity(0, b.clear!),
        caption.opacity(0, b.clear!),
        frame.opacity(0, b.clear!),
      );
      activeFixture(EX_ABS);
      centre(0);
      halfWidth(1.2);
      yield* all(
        frame.opacity(1, b.restore!),
        leftLine.opacity(1, b.restore!),
        rightLine.opacity(1, b.restore!),
      );
      yield* say(title, roman("Where it fails"), b.title!);
      // |x| is scale-invariant about the origin, so magnifying changes the
      // magnification readout and NOTHING else. That invariance is the content
      // of the beat, which is why its declared intent is a transition rather
      // than geometry: there is no target that moves, and there should not be.
      yield* halfWidth(0.02, b.magnify!, easeInOutCubic);
      yield* say(
        caption,
        roman("however far you magnify, the two sides stay different lines"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of DERIVATIVE_ZOOM_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
