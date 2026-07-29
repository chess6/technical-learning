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
  EX_CUBIC_INFLECTION,
  EX_PARABOLA,
  numericDerivative,
  residual,
} from "../../math";
import { DERIVATIVE_NAMES_SEGMENTS, requireBeats } from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";

/**
 * Clip 2 of `derivative-local-linearity` — the compression.
 *
 * One number, read three ways. Clip 1 produced a line; this clip shows that the
 * line's slope, the rate, and the prediction are **one object**, then singles
 * the tangent out by error decay rather than by contact, and closes by
 * refuting the school definition at an inflection point.
 *
 * The `wrong-slope` beat is the load-bearing one and its comparison must be
 * **measured, not asserted**: both gaps are drawn from `residual`, and both
 * ratios are read out live, so the learner sees one tend to zero while the
 * other does not.
 */

const SCENE_ID = "derivative-three-names";

const PLOT = new Vector2(-150, 30);
const PLOT_W = 520;
const PLOT_H = 340;

const A_POINT = 1.4;
const SLOPE = EX_PARABOLA.derivative!(A_POINT);
/** A deliberately wrong slope: close enough to look plausible, and not the tangent. */
const WRONG_SLOPE = SLOPE + 0.7;

const X_SPAN: readonly [number, number] = [A_POINT - 1.1, A_POINT + 1.1];
const Y_CENTRE = EX_PARABOLA.f(A_POINT);
const Y_SPAN = 3.4;

const px = (x: number, y: number): Vector2 =>
  new Vector2(
    PLOT.x + ((x - (X_SPAN[0] + X_SPAN[1]) / 2) / ((X_SPAN[1] - X_SPAN[0]) / 2)) * (PLOT_W / 2),
    PLOT.y - ((y - Y_CENTRE) / Y_SPAN) * (PLOT_H / 2),
  );

function tex(
  value: string | (() => string),
  size: number,
  fill: string = ROLE.text,
): Latex {
  return new Latex({ tex: value as never, fontSize: size, fill });
}

export const derivativeThreeNamesScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);
  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const step = createSignal(0.9);

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
  const inner = new Node({ position: new Vector2(-PLOT.x, -PLOT.y) });
  frame.add(inner);

  const curvePoints = (() => {
    const pts: Vector2[] = [];
    for (let i = 0; i <= 300; i += 1) {
      const x = X_SPAN[0] + ((X_SPAN[1] - X_SPAN[0]) * i) / 300;
      pts.push(px(x, EX_PARABOLA.f(x)));
    }
    return pts;
  })();
  inner.add(
    new Line({
      key: "semantic:three-names:curve",
      stroke: ROLE.original,
      lineWidth: 4,
      points: curvePoints,
    }),
  );

  const line = (slope: number, color: string, dashed = false, key?: string): Line =>
    new Line({
      key,
      stroke: color,
      lineWidth: 4,
      lineDash: dashed ? [9, 7] : undefined,
      opacity: 0,
      points: [
        px(X_SPAN[0], EX_PARABOLA.f(A_POINT) + slope * (X_SPAN[0] - A_POINT)),
        px(X_SPAN[1], EX_PARABOLA.f(A_POINT) + slope * (X_SPAN[1] - A_POINT)),
      ],
    });

  const tangent = line(SLOPE, ROLE.transformed, false, "semantic:three-names:tangent");
  const wrong = line(WRONG_SLOPE, ROLE.violation, true);
  wrong.lineWidth(5);
  inner.add(tangent);
  inner.add(wrong);

  const anchor = new Circle({
    size: 14,
    fill: ROLE.text,
    position: px(A_POINT, EX_PARABOLA.f(A_POINT)),
  });
  inner.add(anchor);

  /** Rise and run, drawn on the tangent — the "read it as a slope" beat. */
  const riseRun = new Node({ opacity: 0 });
  inner.add(riseRun);
  riseRun.add(
    new Line({
      stroke: ROLE.textMuted,
      lineWidth: 3,
      points: [
        px(A_POINT, EX_PARABOLA.f(A_POINT)),
        px(A_POINT + 0.6, EX_PARABOLA.f(A_POINT)),
      ],
    }),
  );
  riseRun.add(
    new Line({
      stroke: ROLE.textMuted,
      lineWidth: 3,
      points: [
        px(A_POINT + 0.6, EX_PARABOLA.f(A_POINT)),
        px(A_POINT + 0.6, EX_PARABOLA.f(A_POINT) + SLOPE * 0.6),
      ],
    }),
  );

  /** The two measured gaps, tangent vs wrong slope. */
  const gapFor = (slope: number, color: string, key?: string): Line =>
    new Line({
      key,
      stroke: color,
      lineWidth: 4,
      opacity: 0,
      points: () => {
        const d = step();
        return [
          px(A_POINT + d, EX_PARABOLA.f(A_POINT) + slope * d),
          px(A_POINT + d, EX_PARABOLA.f(A_POINT + d)),
        ];
      },
    });
  const tangentGap = gapFor(SLOPE, ROLE.transformed, "semantic:three-names:tangent-gap");
  const wrongGap = gapFor(WRONG_SLOPE, ROLE.violation);
  inner.add(tangentGap);
  inner.add(wrongGap);

  /* ------------------------------------------------------------- readouts */
  const readout = (
    body: () => string,
    y: number,
    color: string,
  ): Latex => {
    const node = tex(body, 24, color);
    node.position(new Vector2(250, y));
    node.opacity(0);
    view.add(node);
    return node;
  };

  const rateOut = readout(
    () => `\\text{rate} = ${SLOPE}\\ \\text{units/unit}`,
    -140,
    ROLE.transformed,
  );
  const slopeOut = readout(
    () => `\\text{slope} = \\frac{${(SLOPE * 0.6).toFixed(2)}}{0.60} = ${SLOPE}`,
    -96,
    ROLE.transformed,
  );
  const approxOut = readout(
    () =>
      `f(a{+}h) \\approx ${(EX_PARABOLA.f(A_POINT) + SLOPE * step()).toFixed(3)}`,
    -52,
    ROLE.transformed,
  );
  const tangentRatio = readout(
    () =>
      `\\text{tangent: } E/h = ${(residual(EX_PARABOLA.f, A_POINT, SLOPE, step()) / step()).toFixed(3)}`,
    30,
    ROLE.transformed,
  );
  const wrongRatio = readout(
    () =>
      `\\text{other: } E/h = ${(residual(EX_PARABOLA.f, A_POINT, WRONG_SLOPE, step()) / step()).toFixed(3)}`,
    74,
    ROLE.violation,
  );

  /* ------------------------------------------------- the inflection panel */
  const crossPanel = new Node({ opacity: 0 });
  view.add(crossPanel);
  const crossFrame = new Rect({
    x: PLOT.x,
    y: PLOT.y,
    width: PLOT_W,
    height: PLOT_H,
    radius: 10,
    fill: ROLE.background,
    stroke: ROLE.grid,
    lineWidth: 1.5,
    clip: true,
  });
  crossPanel.add(crossFrame);
  const crossInner = new Node({ position: new Vector2(-PLOT.x, -PLOT.y) });
  crossFrame.add(crossInner);

  const CX: readonly [number, number] = [-1.2, 1.2];
  const cpx = (x: number, y: number): Vector2 =>
    new Vector2(
      PLOT.x + (x / CX[1]) * (PLOT_W / 2) * 0.9,
      PLOT.y - (y / 1.8) * (PLOT_H / 2) * 0.9,
    );
  crossInner.add(
    new Line({
      stroke: ROLE.original,
      lineWidth: 4,
      points: Array.from({ length: 241 }, (_, i) => {
        const x = CX[0] + ((CX[1] - CX[0]) * i) / 240;
        return cpx(x, EX_CUBIC_INFLECTION.f(x));
      }),
    }),
  );
  // At x = 0 the tangent to x³ is y = 0, and the curve crosses it there.
  crossInner.add(
    new Line({
      stroke: ROLE.transformed,
      lineWidth: 4,
      points: [cpx(CX[0], 0), cpx(CX[1], 0)],
    }),
  );
  crossInner.add(new Circle({ size: 14, fill: ROLE.text, position: cpx(0, 0) }));

  /* ------------------------------------------------------- the f' panel */
  const derivPanel = new Node({ opacity: 0 });
  view.add(derivPanel);
  const derivFrame = new Rect({
    x: PLOT.x,
    y: PLOT.y,
    width: PLOT_W,
    height: PLOT_H,
    radius: 10,
    fill: ROLE.background,
    stroke: ROLE.grid,
    lineWidth: 1.5,
    clip: true,
  });
  derivPanel.add(derivFrame);
  const derivInner = new Node({ position: new Vector2(-PLOT.x, -PLOT.y) });
  derivFrame.add(derivInner);
  const dpx = (x: number, y: number): Vector2 =>
    new Vector2(
      PLOT.x + ((x - 1) / 1.4) * (PLOT_W / 2) * 0.85,
      PLOT.y - ((y - 2) / 3.2) * (PLOT_H / 2) * 0.85,
    );
  derivInner.add(
    new Line({
      stroke: ROLE.original,
      lineWidth: 3,
      opacity: 0.5,
      points: Array.from({ length: 201 }, (_, i) => {
        const x = 0.2 + (2.0 * i) / 200;
        return dpx(x, EX_PARABOLA.f(x));
      }),
    }),
  );
  derivInner.add(
    new Line({
      key: "semantic:three-names:derivative",
      stroke: ROLE.basis1,
      lineWidth: 4,
      // Drawn from a NUMERIC derivative of the same fixture, so the plotted f'
      // cannot drift from the f above it.
      points: Array.from({ length: 201 }, (_, i) => {
        const x = 0.2 + (2.0 * i) / 200;
        return dpx(x, numericDerivative(EX_PARABOLA.f, x));
      }),
    }),
  );

  /* -------------------------------------------------------------- labels */
  const title = tex("", 32);
  title.position(new Vector2(LABEL_CENTER_X, -232));
  title.opacity(0);
  view.add(title);
  const caption = tex("", 26, ROLE.textMuted);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  caption.opacity(0);
  view.add(caption);

  const say = function* (node: Latex, body: string, d: number): ThreadGenerator {
    node.tex(body);
    yield* node.opacity(1, d);
  };
  const roman = (t: string) => `\\text{${t}}`;

  const bodies: Record<string, () => ThreadGenerator> = {
    *oneLine() {
      const b = beats("oneLine");
      yield* say(title, roman("One line, from the zoom"), b.title!);
      yield* tangent.opacity(1, b.draw!);
      yield* waitFor(b.hold!);
    },

    *asRate() {
      const b = beats("asRate");
      yield* say(title, roman("Read it as a rate"), b.title!);
      yield* rateOut.opacity(1, b.show!);
      yield* waitFor(b.hold!);
    },

    *asSlope() {
      const b = beats("asSlope");
      yield* say(title, roman("Read it as a slope"), b.title!);
      yield* all(riseRun.opacity(1, b.show!), slopeOut.opacity(1, b.show!));
      yield* say(caption, roman("same number, different reading"), b.caption!);
      yield* waitFor(b.hold!);
    },

    *asApprox() {
      const b = beats("asApprox");
      yield* say(title, roman("Read it as a prediction"), b.title!);
      yield* all(approxOut.opacity(1, b.show!), tangentGap.opacity(1, b.show!));
      yield* say(
        caption,
        roman("the gap between the prediction and the truth is the error"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *twoLines() {
      const b = beats("twoLines");
      yield* all(caption.opacity(0, b.clear!), riseRun.opacity(0, b.clear!));
      yield* say(title, roman("Two lines through the same point"), b.title!);
      yield* all(
        wrong.opacity(1, b.draw!),
        wrongGap.opacity(1, b.draw!),
        tangentRatio.opacity(1, b.draw!),
        wrongRatio.opacity(1, b.draw!),
      );
      // Bring the step inside the range where the tangent is ALREADY the better
      // approximation before the prediction is posed. For f(x)=x^2 the ratios
      // are h and h - 0.7, so at the opening step of 0.9 the wrong line's error
      // is the smaller of the two — a frame that contradicts the claim the beat
      // is about to make. The comparison is only honest once h < 0.35.
      yield* step(0.3, b.settle!, easeInOutCubic);
      yield* waitFor(b.hold!);
    },

    *predictDecay() {
      const b = beats("predictDecay");
      // Nothing moves. Both ratios are on screen and stay there.
      yield* say(
        title,
        `\\begin{gathered} ${roman("The step is about to shrink.")} \\\\ ${roman("What will each error ratio do?")} \\end{gathered}`,
        b.ask!,
      );
      yield* waitFor(b.think!);
    },

    *decay() {
      const b = beats("decay");
      // Both ratios are measured live. The tangent's tends to 0; the other's
      // tends to a nonzero constant. The comparison is shown, never asserted.
      yield* step(0.05, b.shrink!, easeInOutCubic);
      yield* say(title, roman("One vanishes faster than the step"), b.title!);
      yield* say(
        caption,
        roman("that decay, not touching, is what singles the tangent out"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *crosses() {
      const b = beats("crosses");
      yield* all(
        title.opacity(0, b.clear!),
        caption.opacity(0, b.clear!),
        rateOut.opacity(0, b.clear!),
        slopeOut.opacity(0, b.clear!),
        approxOut.opacity(0, b.clear!),
        tangentRatio.opacity(0, b.clear!),
        wrongRatio.opacity(0, b.clear!),
      );
      yield* crossPanel.opacity(1, b.show!);
      yield* say(title, roman("A tangent may cross the curve"), b.title!);
      yield* say(
        caption,
        `y = x^3 \\text{ at } x = 0 \\quad ${roman("— contact was never the criterion")}`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *derivativeFn() {
      const b = beats("derivativeFn");
      yield* crossPanel.opacity(0, b.clear!);
      yield* derivPanel.opacity(1, b.show!);
      yield* say(title, roman("A slope at every point"), b.title!);
      yield* say(caption, `f(x)=x^2 \\Rightarrow f'(x)=2x`, b.caption!);
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of DERIVATIVE_NAMES_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
