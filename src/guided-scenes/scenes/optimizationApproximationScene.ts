import { Circle, Latex, Line, Node, Rect, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { OPTIMIZATION_APPROXIMATION_SEGMENTS, requireBeats } from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";
import { OPT_ABS, OPT_CUBIC_SURVIVOR, OPT_MAIN_CUBIC } from "../../math";

/**
 * `optimization-approximation` — one panel. The escape-route step-and-check
 * demonstration, a sweep across the interval, and two staged fixture resets
 * (x^3's survivor, |x|'s unexamined minimum), before returning to decide the
 * main case globally.
 *
 * **The honesty obligation this file keeps** (matching
 * `derivativeLocalLinearityScene`'s own precedent): the curve is always the
 * real sampled fixture, re-drawn every frame from `activeFixture().f` — no
 * code path substitutes a straight line. `E(h)` and `mh` are drawn as
 * separately labelled quantities in `stepAndCheck`, never folded into one
 * "approximately equals". The `sweep` beat's caption states explicitly that
 * the sweep is a SAMPLED VISUALIZATION of the proven theorem above it, not a
 * test of every real point — what is proven is the escape-route lemma, not
 * the animation.
 *
 * The `predictStep` beat is a true hold: the stepped value is not on screen
 * when the question is asked. `survivorNotAnswer`'s verdict is a second true
 * hold, for the same reason.
 */

const SCENE_ID = "optimization-approximation";

/**
 * Every fixture the scene draws is imported from `src/math/optimization.ts`,
 * never reimplemented here — `OPT_MAIN_CUBIC` is the main worked case
 * (insight.md §7), `OPT_CUBIC_SURVIVOR` is x^3 at 0, `OPT_ABS` is |x| on
 * [-2, 2]. `OPT_MAIN_CUBIC.derivative` is what every displayed slope,
 * tangent, and step reads from — no local closed form is re-derived.
 */
const MAIN_F = OPT_MAIN_CUBIC.f;
const MAIN_DERIVATIVE = OPT_MAIN_CUBIC.derivative;
const MAIN_DOMAIN = OPT_MAIN_CUBIC.domain;
const A_POINT = 0;
const M_SLOPE = MAIN_DERIVATIVE(A_POINT); // -3
const STEP_H = -0.5; // improving direction, since m < 0

const CUBIC_F = OPT_CUBIC_SURVIVOR.f;
const CUBIC_DOMAIN = OPT_CUBIC_SURVIVOR.domain;

const ABS_F = OPT_ABS.f;
const ABS_DOMAIN = OPT_ABS.domain;

const PLOT = new Vector2(0, 10);
const PLOT_W = 640;
const PLOT_H = 300;

/** Sanity: the candidate values displayed in `decideGlobally` are real, not typed-in. */
const CANDIDATE_CHECK: readonly [number, number][] = [
  [-2, -2],
  [-1, 2],
  [1, -2],
  [3, 18],
];
for (const [x, expected] of CANDIDATE_CHECK) {
  if (Math.abs(MAIN_F(x) - expected) > 1e-9) {
    throw new Error(`optimizationApproximationScene: f(${x}) disagrees with the displayed value ${expected}.`);
  }
}

/**
 * Sanity: `tooBig`'s claimed crossing. At a = 0, E(h) = h^3 (exact for this
 * cubic), so sign(mh) and sign(f(a+h)-f(a)) = sign(mh + h^3) agree exactly
 * while |h| < sqrt(3) and disagree beyond it (mh + h^3 = h(h^2 - 3) changes
 * sign there since m = -3). The beat animates h out to -1.9, which must
 * cross -sqrt(3) ≈ -1.732 for the disagreement to actually occur on screen.
 */
const TOO_BIG_TARGET = -1.9;
const CROSSING = -Math.sqrt(3);
if (!(TOO_BIG_TARGET < CROSSING)) {
  throw new Error(
    `optimizationApproximationScene: tooBig's target ${TOO_BIG_TARGET} does not cross the real disagreement point ${CROSSING}.`,
  );
}
{
  const beforeChange = MAIN_F(A_POINT + (CROSSING + 0.1)) - MAIN_F(A_POINT);
  const beforeSign = Math.sign(M_SLOPE * (CROSSING + 0.1));
  const afterChange = MAIN_F(A_POINT + TOO_BIG_TARGET) - MAIN_F(A_POINT);
  const afterSign = Math.sign(M_SLOPE * TOO_BIG_TARGET);
  if (Math.sign(beforeChange) !== beforeSign || Math.sign(afterChange) === afterSign) {
    throw new Error("optimizationApproximationScene: tooBig's claimed sign crossing does not actually occur.");
  }
}

function tex(value: string | (() => string), size: number, fill: string = ROLE.text): Latex {
  return new Latex({ tex: value as never, fontSize: size, fill });
}

export const optimizationApproximationScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);
  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const activeF = createSignal<(x: number) => number>(() => MAIN_F);
  const activeDomain = createSignal<readonly [number, number]>(MAIN_DOMAIN);
  const centre = createSignal<number>(A_POINT);
  const h = createSignal<number>(0);

  const yWindow = () => {
    const [lo, hi] = activeDomain();
    const f = activeF();
    let maxV = -Infinity;
    let minV = Infinity;
    for (let i = 0; i <= 60; i += 1) {
      const v = f(lo + ((hi - lo) * i) / 60);
      if (v > maxV) maxV = v;
      if (v < minV) minV = v;
    }
    return { lo: minV, hi: maxV };
  };

  const px = (x: number, y: number): Vector2 => {
    const [lo, hi] = activeDomain();
    const yw = yWindow();
    const yLo = yw.lo - (yw.hi - yw.lo) * 0.15 - 1e-6;
    const yHi = yw.hi + (yw.hi - yw.lo) * 0.15 + 1e-6;
    return new Vector2(
      PLOT.x + ((x - lo) / (hi - lo) - 0.5) * PLOT_W,
      PLOT.y - ((y - yLo) / (yHi - yLo) - 0.5) * PLOT_H,
    );
  };

  const frame = new Rect({
    x: PLOT.x,
    y: PLOT.y,
    width: PLOT_W,
    height: PLOT_H,
    radius: 8,
    stroke: ROLE.grid,
    lineWidth: 1.5,
    clip: true,
  });
  view.add(frame);
  const inner = new Node({ position: new Vector2(-PLOT.x, -PLOT.y) });
  frame.add(inner);

  const plotCurve = (): Vector2[] => {
    const [lo, hi] = activeDomain();
    const f = activeF();
    const pts: Vector2[] = [];
    for (let i = 0; i <= 300; i += 1) {
      const x = lo + ((hi - lo) * i) / 300;
      const y = f(x);
      if (Number.isFinite(y)) pts.push(px(x, y));
    }
    return pts;
  };
  const curve = new Line({
    key: "semantic:optapprox:curve",
    stroke: ROLE.original,
    lineWidth: 4,
    points: plotCurve,
  });
  inner.add(curve);

  const point = new Circle({
    size: 12,
    fill: ROLE.text,
    position: () => px(centre(), activeF()(centre())),
  });
  inner.add(point);

  const tangent = new Line({
    key: "semantic:optapprox:tangent",
    stroke: ROLE.transformed,
    lineWidth: 4,
    opacity: 0,
    points: () => {
      const a = centre();
      const f = activeF();
      const m = MAIN_DERIVATIVE(a);
      const [lo, hi] = activeDomain();
      const w = (hi - lo) * 0.28;
      return [px(a - w, f(a) - m * w), px(a + w, f(a) + m * w)];
    },
  });
  inner.add(tangent);

  const steppedPoint = new Circle({
    size: 12,
    fill: ROLE.result,
    opacity: 0,
    position: () => px(centre() + h(), activeF()(centre() + h())),
  });
  inner.add(steppedPoint);

  /** The step segment, split into the LINEAR part (mh) and the residual (E), drawn separately. */
  const linearSegment = new Line({
    key: "semantic:optapprox:mh",
    stroke: ROLE.transformed,
    lineWidth: 5,
    opacity: 0,
    points: () => {
      const a = centre();
      const f = activeF();
      const m = MAIN_DERIVATIVE(a);
      return [px(a, f(a)), px(a + h(), f(a) + m * h())];
    },
  });
  inner.add(linearSegment);

  const residualSegment = new Line({
    key: "semantic:optapprox:residual",
    stroke: ROLE.violation,
    lineWidth: 4,
    opacity: 0,
    points: () => {
      const a = centre();
      const f = activeF();
      const m = MAIN_DERIVATIVE(a);
      return [px(a + h(), f(a) + m * h()), px(a + h(), f(a + h()))];
    },
  });
  inner.add(residualSegment);

  /** One-sided ray for `oneDirection` — deliberately drawn to ONE side only, so no symmetric line implies a direction that is not actually available. */
  const oneSidedRay = new Line({
    key: "semantic:optapprox:onesided",
    stroke: ROLE.transformed,
    lineWidth: 4,
    opacity: 0,
    points: () => {
      const a = centre();
      const f = activeF();
      const m = MAIN_DERIVATIVE(a);
      const [lo, hi] = activeDomain();
      const w = (hi - lo) * 0.28;
      return [px(a, f(a)), px(a + w, f(a) + m * w)];
    },
  });
  inner.add(oneSidedRay);

  /**
   * `tooBig`'s live sign-agreement check — read directly off `MAIN_F` and
   * `M_SLOPE`, the same quantities `mhLabel`/`eLabel` already read, so a
   * frame where they disagree is a frame where this genuinely flips, not a
   * scripted color change.
   */
  const agrees = (): boolean => {
    const change = MAIN_F(A_POINT + h()) - MAIN_F(A_POINT);
    const predicted = Math.sign(M_SLOPE * h());
    const actual = Math.sign(change);
    return predicted === 0 || actual === predicted;
  };

  /** The sweep marker and the set of sample dots, greying out as the sweep passes. */
  const SAMPLE_XS = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3];
  const sweepProgress = createSignal(0); // 0..1 across MAIN_DOMAIN
  const isCandidate = (x: number) =>
    Math.abs(x - -2) < 1e-6 || Math.abs(x - -1) < 1e-6 || Math.abs(x - 1) < 1e-6 || Math.abs(x - 3) < 1e-6;
  const sampleDots = SAMPLE_XS.map(
    (x) =>
      new Circle({
        size: 9,
        fill: () => {
          const [lo, hiD] = MAIN_DOMAIN;
          const passed = lo + (hiD - lo) * sweepProgress() >= x - 1e-6;
          if (!passed) return ROLE.selected;
          return isCandidate(x) ? ROLE.selected : ROLE.dim;
        },
        opacity: 0,
        position: px(x, MAIN_F(x)),
      }),
  );
  for (const dot of sampleDots) inner.add(dot);

  const sweepMarker = new Line({
    key: "semantic:optapprox:sweepmarker",
    stroke: ROLE.violation,
    lineWidth: 3,
    opacity: 0,
    points: () => {
      const [lo, hiD] = MAIN_DOMAIN;
      const x = lo + (hiD - lo) * sweepProgress();
      return [px(x, yWindow().lo), px(x, yWindow().hi)];
    },
  });
  inner.add(sweepMarker);

  /* ------------------------------------------------------------- the labels */
  const title = tex("", 28);
  title.position(new Vector2(LABEL_CENTER_X, -230));
  title.opacity(0);
  view.add(title);

  const caption = tex("", 22, ROLE.textMuted);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  caption.opacity(0);
  view.add(caption);

  const equationLabel = tex("", 22, ROLE.text);
  equationLabel.position(new Vector2(LABEL_CENTER_X, -190));
  equationLabel.opacity(0);
  view.add(equationLabel);

  const mhLabel = tex(() => `mh = ${(M_SLOPE * h()).toFixed(2)}`, 22, ROLE.transformed);
  mhLabel.position(new Vector2(-220, 160));
  mhLabel.opacity(0);
  view.add(mhLabel);

  // E(h) computed from the actual fixture — f(a+h) - f(a) - f'(a)h — never a
  // hand-derived closed form that could silently drift from MAIN_F.
  const eLabel = tex(
    () => `E(h) = ${(MAIN_F(A_POINT + h()) - MAIN_F(A_POINT) - M_SLOPE * h()).toFixed(3)}`,
    22,
    ROLE.violation,
  );
  eLabel.position(new Vector2(220, 160));
  eLabel.opacity(0);
  view.add(eLabel);

  const agreementLabel = new Latex({
    tex: (() => (agrees() ? "\\text{sign agrees}" : "\\text{SIGN DISAGREES}")) as never,
    fontSize: 24,
    fill: (() => (agrees() ? ROLE.transformed : ROLE.violation)) as never,
  });
  agreementLabel.position(new Vector2(LABEL_CENTER_X, 195));
  agreementLabel.opacity(0);
  view.add(agreementLabel);

  const say = function* (node: Latex, body: string, d: number): ThreadGenerator {
    node.tex(body);
    yield* node.opacity(1, d);
  };
  const roman = (t: string) => `\\text{${t}}`;

  const bodies: Record<string, () => ThreadGenerator> = {
    *theSearch() {
      const b = beats("theSearch");
      yield* say(title, roman("An impossible amount of checking"), b.title!);
      yield* all(...sampleDots.map((d) => d.opacity(1, b.samples!)));
      yield* say(
        caption,
        roman("the largest sample is not an answer — there are uncountably many points to compare"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *standSloped() {
      const b = beats("standSloped");
      yield* say(title, roman("Standing where the ground is sloped"), b.title!);
      yield* point.opacity(1, b.drawPoint!);
      yield* tangent.opacity(1, b.tangent!);
      yield* say(equationLabel, `f'(${A_POINT}) = ${M_SLOPE} \\neq 0`, b.label!);
      yield* say(
        caption,
        roman("the local model hands you a step that provably improves"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *predictStep() {
      const b = beats("predictStep");
      // A true hold: nothing moves, and the stepped value is not on screen.
      yield* say(title, roman("Which direction increases f?"), b.ask!);
      yield* waitFor(b.think!);
    },

    *stepAndCheck() {
      const b = beats("stepAndCheck");
      h(STEP_H);
      yield* say(title, roman("The step pays off"), b.title!);
      yield* all(
        steppedPoint.opacity(1, b.step!),
        linearSegment.opacity(1, b.step!),
        residualSegment.opacity(1, b.step!),
      );
      yield* mhLabel.opacity(1, b.mhLabel!);
      yield* eLabel.opacity(1, b.eLabel!);
      yield* say(
        caption,
        roman("mh and E(h), drawn separately — mh dominates, and f genuinely increases"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *tooBig() {
      const b = beats("tooBig");
      yield* say(title, roman("The promise is only local"), b.title!);
      yield* agreementLabel.opacity(1, b.reveal!);
      // Enlarge |h| (still stepping left, the improving direction) until the
      // sign genuinely flips — at a = 0 on the main cubic, sign(mh) and
      // sign(f(a+h)-f(a)) disagree once |h| exceeds sqrt(3) ≈ 1.732, a real
      // crossing computed live by `agrees()`, not staged.
      yield* h(-1.9, b.magnify!, easeInOutCubic);
      yield* say(
        caption,
        roman("past a certain step the sign disagrees — a radius that works, never claimed the largest"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *sweep() {
      const b = beats("sweep");
      yield* all(
        equationLabel.opacity(0, 0.2),
        mhLabel.opacity(0, 0.2),
        eLabel.opacity(0, 0.2),
        agreementLabel.opacity(0, 0.2),
        tangent.opacity(0, 0.2),
        linearSegment.opacity(0, 0.2),
        residualSegment.opacity(0, 0.2),
        steppedPoint.opacity(0, 0.2),
        point.opacity(0, 0.2),
      );
      h(0);
      yield* say(title, roman("Ruling points out"), b.title!);
      yield* sweepMarker.opacity(1, 0.3);
      yield* sweepProgress(1, b.sweepMotion!);
      yield* sweepMarker.opacity(0, b.greyOut!);
      yield* say(
        caption,
        roman("a sampled visualization of the proven lemma above — not a test of every real point"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *survivorNotAnswer() {
      const b = beats("survivorNotAnswer");
      yield* all(...sampleDots.map((d) => d.opacity(0, b.clear!)));
      activeF(() => CUBIC_F);
      activeDomain(CUBIC_DOMAIN);
      centre(0);
      yield* all(curve.opacity(1, b.reset!), point.opacity(1, b.reset!));
      yield* say(title, roman("A survivor that is not an answer"), b.title!);
      yield* say(equationLabel, "f(x) = x^3, \\quad f'(0) = 0", b.flatLabel!);
      // A true hold before the verdict.
      yield* waitFor(b.silence!);
      yield* say(
        caption,
        roman("every window around 0 has points above AND below — neither a max nor a min"),
        b.reveal!,
      );
      yield* waitFor(b.hold!);
    },

    *unexaminedMinimum() {
      const b = beats("unexaminedMinimum");
      yield* all(
        curve.opacity(0, b.clear!),
        point.opacity(0, b.clear!),
        equationLabel.opacity(0, b.clear!),
        caption.opacity(0, b.clear!),
      );
      activeF(() => ABS_F);
      activeDomain(ABS_DOMAIN);
      centre(0);
      yield* all(curve.opacity(1, b.reset!), point.opacity(1, b.reset!));
      yield* say(title, roman("A winner the sweep never examined"), b.title!);
      yield* say(equationLabel, "f(x) = |x|", b.cornerLabel!);
      yield* say(
        caption,
        roman("the minimum sits exactly where no local model exists — nothing here was ever refuted"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *oneDirection() {
      const b = beats("oneDirection");
      yield* all(
        curve.opacity(0, b.clear!),
        point.opacity(0, b.clear!),
        equationLabel.opacity(0, b.clear!),
        caption.opacity(0, b.clear!),
      );
      activeF(() => MAIN_F);
      activeDomain(MAIN_DOMAIN);
      centre(MAIN_DOMAIN[0]); // the left endpoint, a = -2
      h(0);
      yield* all(curve.opacity(1, b.reset!), point.opacity(1, b.reset!));
      yield* say(title, roman("Only one way to step"), b.title!);
      // Deliberately ONE-SIDED — no symmetric tangent is drawn here, so
      // nothing on screen implies a leftward step is available.
      yield* oneSidedRay.opacity(1, b.arrow!);
      const slopeAtLeft = MAIN_DERIVATIVE(MAIN_DOMAIN[0]);
      yield* say(equationLabel, `f'(-2) = ${slopeAtLeft} > 0`, b.label!);
      yield* say(
        caption,
        roman("stepping right refutes 'local maximum' — stepping left would leave the domain, so 'local minimum' is never tested"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *decideGlobally() {
      const b = beats("decideGlobally");
      yield* all(
        curve.opacity(0, b.clear!),
        point.opacity(0, b.clear!),
        equationLabel.opacity(0, b.clear!),
        caption.opacity(0, b.clear!),
        oneSidedRay.opacity(0, b.clear!),
      );
      activeF(() => MAIN_F);
      activeDomain(MAIN_DOMAIN);
      centre(0);
      sweepProgress(1); // every sample already swept: refuted points read dim, candidates read selected
      for (const dot of sampleDots) dot.opacity(1);
      yield* curve.opacity(1, b.reset!);
      yield* say(title, roman("Deciding, at last"), b.title!);
      yield* say(
        equationLabel,
        "f(-2){=}-2,\\ f(-1){=}2,\\ f(1){=}-2,\\ f(3){=}18",
        b.table!,
      );
      yield* say(
        caption,
        roman("the global maximum is 18, at the ENDPOINT x=3 — not the interior local max f(-1)=2"),
        b.markMax!,
      );
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of OPTIMIZATION_APPROXIMATION_SEGMENTS) {
    yield* runSegment(segment.duration, bodies[segment.id]!, `${SCENE_ID}.${segment.id}`);
  }
});
