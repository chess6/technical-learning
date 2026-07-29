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
  EX_HIDDEN_SPIKE,
  EX_JUMP,
  EX_OSCILLATE,
  EX_PARABOLA,
  HIDDEN_SPIKE_GRID,
  differenceQuotient,
  partitionPoints,
  type CalculusFixture,
} from "../../math";
import { LIMITS_CONTINUITY_SEGMENTS, requireBeats } from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X } from "./safeFrame";

/**
 * Guided scene for `limits-continuity` (applied mathematics L1).
 *
 * One graph, one candidate value, two bands. The bands are the whole scene:
 * the learner watches a tolerance named and a window answer it, then watches
 * the point deleted and nothing change.
 *
 * The last two beats are the lesson's correction and are not optional. After
 * continuity is defined, a **continuous** function is sampled on a coarse grid
 * and a full-height spike is shown sitting entirely between two samples — so
 * continuity is seen to be a local promise that fixes no window width. A
 * modulus is then supplied and the guaranteed band drawn, which is what a
 * sampling claim actually needs.
 *
 * Honesty obligations enforced here rather than left to review:
 *
 *  - every plotted curve is sampled from a `src/math/calculus.ts` fixture;
 *    there is no path that draws an idealized shape instead;
 *  - the shrinking-interval table shows values from `differenceQuotient`, so it
 *    cannot drift from the arithmetic the lesson claims;
 *  - the oscillation case is captioned "no forced value", never "the limit is 0";
 *  - the guaranteed band is drawn only in the beat that supplies a modulus.
 */

const SCENE_ID = "limits-continuity";

/* ------------------------------------------------------------- the canvas */

const PLOT = new Vector2(-150, 10);
const PLOT_W = 560;
const PLOT_H = 360;

/** The parabola's window, centred on a = 3 where the quotient is examined. */
const A_POINT = 3;
const FORCED = 2 * A_POINT;

/** World → pixels for the difference-quotient panel: h across, quotient up. */
const H_SPAN = 2.2;
const Q_CENTRE = FORCED;
const Q_SPAN = 2.6;
const qpx = (h: number, q: number): Vector2 =>
  new Vector2(
    PLOT.x + (h / H_SPAN) * (PLOT_W / 2),
    PLOT.y - ((q - Q_CENTRE) / Q_SPAN) * (PLOT_H / 2),
  );

/** The quotient as a function of h — the object the whole scene is about. */
const quotient = (h: number): number =>
  h === 0 ? Number.NaN : differenceQuotient(EX_PARABOLA.f, A_POINT, h);

/** Sample a fixture into pixel points for a secondary panel. */
function fixtureCurve(
  fixture: CalculusFixture,
  centre: Vector2,
  width: number,
  height: number,
  xSpan: readonly [number, number],
  ySpan: readonly [number, number],
  samples = 240,
): Vector2[] {
  const [x0, x1] = xSpan;
  const [y0, y1] = ySpan;
  const out: Vector2[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const x = x0 + ((x1 - x0) * i) / samples;
    const y = fixture.f(x);
    if (!Number.isFinite(y)) continue;
    out.push(
      new Vector2(
        centre.x + ((x - x0) / (x1 - x0) - 0.5) * width,
        centre.y - ((y - y0) / (y1 - y0) - 0.5) * height,
      ),
    );
  }
  return out;
}

function tex(
  value: string | (() => string),
  size: number,
  fill: string = ROLE.text,
): Latex {
  return new Latex({ tex: value as never, fontSize: size, fill });
}

export const limitsContinuityScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  /* ------------------------------------------------------- the main panel */
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
  const inner = new Node({ position: () => new Vector2(-PLOT.x, -PLOT.y) });
  frame.add(inner);

  // Axes: h horizontally, the quotient vertically.
  inner.add(
    new Line({
      stroke: ROLE.axis,
      lineWidth: 2,
      points: [qpx(-H_SPAN, Q_CENTRE), qpx(H_SPAN, Q_CENTRE)],
    }),
  );
  inner.add(
    new Line({
      stroke: ROLE.axis,
      lineWidth: 2,
      points: [qpx(0, Q_CENTRE - Q_SPAN), qpx(0, Q_CENTRE + Q_SPAN)],
    }),
  );

  /**
   * The quotient's graph, drawn from `differenceQuotient` and **split at h = 0**
   * so the undefined point cannot be read off the stroke.
   */
  const branch = (from: number, to: number): Line => {
    const pts: Vector2[] = [];
    const steps = 160;
    for (let i = 0; i <= steps; i += 1) {
      const h = from + ((to - from) * i) / steps;
      if (h === 0) continue;
      pts.push(qpx(h, quotient(h)));
    }
    return new Line({ stroke: ROLE.original, lineWidth: 4, points: pts, opacity: 0 });
  };
  const leftBranch = branch(-H_SPAN, -0.004);
  const rightBranch = branch(0.004, H_SPAN);
  inner.add(leftBranch);
  inner.add(rightBranch);

  /** The hole at h = 0: the value that does not exist. */
  const hole = new Circle({
    key: "semantic:limits:hole",
    position: qpx(0, FORCED),
    size: 22,
    stroke: ROLE.original,
    lineWidth: 3,
    fill: ROLE.background,
    opacity: 0,
  });
  inner.add(hole);

  /* ------------------------------------------------------------ the bands */
  const epsilon = createSignal(1.6);
  const delta = createSignal(H_SPAN);

  const bandTop = new Line({
    key: "semantic:limits:band",
    stroke: ROLE.selected,
    lineWidth: 3,
    lineDash: [10, 8],
    opacity: 0,
    points: () => [qpx(-H_SPAN, FORCED + epsilon()), qpx(H_SPAN, FORCED + epsilon())],
  });
  const bandBottom = new Line({
    stroke: ROLE.selected,
    lineWidth: 3,
    lineDash: [10, 8],
    opacity: 0,
    points: () => [qpx(-H_SPAN, FORCED - epsilon()), qpx(H_SPAN, FORCED - epsilon())],
  });
  inner.add(bandTop);
  inner.add(bandBottom);

  const windowLeft = new Line({
    key: "semantic:limits:window",
    stroke: ROLE.target,
    lineWidth: 3,
    opacity: 0,
    points: () => [
      qpx(-delta(), Q_CENTRE - Q_SPAN),
      qpx(-delta(), Q_CENTRE + Q_SPAN),
    ],
  });
  const windowRight = new Line({
    stroke: ROLE.target,
    lineWidth: 3,
    opacity: 0,
    points: () => [qpx(delta(), Q_CENTRE - Q_SPAN), qpx(delta(), Q_CENTRE + Q_SPAN)],
  });
  inner.add(windowLeft);
  inner.add(windowRight);

  const epsLabel = tex(() => `\\varepsilon = ${epsilon().toFixed(2)}`, 26, ROLE.selected);
  epsLabel.position(new Vector2(255, -150));
  epsLabel.opacity(0);
  view.add(epsLabel);
  const deltaLabel = tex(() => `\\delta = ${delta().toFixed(2)}`, 26, ROLE.target);
  deltaLabel.position(new Vector2(255, -110));
  deltaLabel.opacity(0);
  view.add(deltaLabel);

  /* ----------------------------------------------------- the value table */
  const tableRows = [1, 0.5, 0.25, 0.1, 0.01].map((h, i) => {
    const row = tex(
      `h = ${h} \\;\\Rightarrow\\; ${quotient(h).toFixed(4)}`,
      22,
      ROLE.textMuted,
    );
    row.position(new Vector2(258, -40 + i * 34));
    row.offset([0, 0]);
    row.opacity(0);
    view.add(row);
    return row;
  });

  /* ------------------------------------------------------------- captions */
  const title = tex("", 32);
  title.position(new Vector2(LABEL_CENTER_X, -232));
  title.opacity(0);
  view.add(title);

  const caption = tex("", 26, ROLE.textMuted);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  caption.opacity(0);
  view.add(caption);

  const say = function* (
    node: Latex,
    body: string,
    duration: number,
  ): ThreadGenerator {
    node.tex(body);
    yield* node.opacity(1, duration);
  };
  const roman = (t: string) => `\\text{${t}}`;

  /* --------------------------------------------------- the failure panel */
  const failPanel = new Node({ opacity: 0 });
  view.add(failPanel);
  const failFrame = new Rect({
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
  failPanel.add(failFrame);
  /**
   * A clipped `Rect` positions its children relative to its own centre, while
   * the pixel helpers above return stage coordinates. Every clipped panel in
   * this scene therefore gets an inner node carrying the compensating offset;
   * without it the contents render displaced by the frame's position.
   */
  const failInner = new Node({ position: new Vector2(-PLOT.x, -PLOT.y) });
  failFrame.add(failInner);
  const failCurve = new Line({ stroke: ROLE.original, lineWidth: 4, points: [] });
  failInner.add(failCurve);
  const failName = tex("", 26, ROLE.violation);
  failName.position(new Vector2(PLOT.x, PLOT.y - 150));
  failPanel.add(failName);

  const showFailure = function* (
    fixture: CalculusFixture,
    label: string,
    xSpan: readonly [number, number],
    ySpan: readonly [number, number],
    duration: number,
  ): ThreadGenerator {
    failCurve.points(
      fixtureCurve(fixture, PLOT, PLOT_W * 0.9, PLOT_H * 0.7, xSpan, ySpan),
    );
    failName.tex(roman(label));
    yield* failPanel.opacity(1, duration);
  };

  /* --------------------------------------------------- the sampling panel */
  const samplePanel = new Node({ opacity: 0 });
  view.add(samplePanel);
  const sampleFrame = new Rect({
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
  samplePanel.add(sampleFrame);
  const sampleInner = new Node({ position: new Vector2(-PLOT.x, -PLOT.y) });
  sampleFrame.add(sampleInner);

  const SPIKE_X: readonly [number, number] = [0, 10];
  const SPIKE_Y: readonly [number, number] = [-0.25, 1.25];
  const spikePx = (x: number, y: number): Vector2 =>
    new Vector2(
      PLOT.x + ((x - SPIKE_X[0]) / (SPIKE_X[1] - SPIKE_X[0]) - 0.5) * PLOT_W * 0.9,
      PLOT.y - ((y - SPIKE_Y[0]) / (SPIKE_Y[1] - SPIKE_Y[0]) - 0.5) * PLOT_H * 0.8,
    );

  const spikeSamples = partitionPoints(
    SPIKE_X[0],
    SPIKE_X[1],
    Math.round((SPIKE_X[1] - SPIKE_X[0]) / HIDDEN_SPIKE_GRID),
  );
  // The sampled polyline: what a coarse grid would let you believe.
  sampleInner.add(
    new Line({
      key: "semantic:limits:polyline",
      stroke: ROLE.target,
      lineWidth: 3,
      lineDash: [9, 7],
      points: spikeSamples.map((x) => spikePx(x, EX_HIDDEN_SPIKE.f(x))),
    }),
  );
  for (const x of spikeSamples) {
    sampleInner.add(
      new Circle({ position: spikePx(x, EX_HIDDEN_SPIKE.f(x)), size: 12, fill: ROLE.target }),
    );
  }
  // The truth, revealed second.
  const spikeTruth = new Line({
    key: "semantic:limits:truth",
    stroke: ROLE.violation,
    lineWidth: 4,
    opacity: 0,
    points: (() => {
      const pts: Vector2[] = [];
      for (let i = 0; i <= 600; i += 1) {
        const x = SPIKE_X[0] + ((SPIKE_X[1] - SPIKE_X[0]) * i) / 600;
        pts.push(spikePx(x, EX_HIDDEN_SPIKE.f(x)));
      }
      return pts;
    })(),
  });
  sampleInner.add(spikeTruth);

/**
   * The refined grid.
   *
   * **Not** a guaranteed band drawn around the coarse samples: at this spacing
   * the fixture's real Lipschitz bound is about 7 per unit step, so any honest
   * band would span the whole panel, and drawing a narrow one would show a
   * guarantee the function visibly breaks — which no true modulus can be. What
   * the beat shows instead is what a modulus is *for*: it converts a chosen
   * tolerance into a spacing, and at that spacing the samples track the truth.
   */
  const FINE_SPACING = 0.05;
  const fineSamples = partitionPoints(
    SPIKE_X[0],
    SPIKE_X[1],
    Math.round((SPIKE_X[1] - SPIKE_X[0]) / FINE_SPACING),
  );
  const guarantee = new Node({ opacity: 0 });
  sampleInner.add(guarantee);
  guarantee.add(
    new Line({
      key: "semantic:limits:fine-polyline",
      stroke: ROLE.basis1,
      lineWidth: 3,
      points: fineSamples.map((x) => spikePx(x, EX_HIDDEN_SPIKE.f(x))),
    }),
  );

  /* ------------------------------------------------------------- the body */

  const bodies: Record<string, () => ThreadGenerator> = {
    *paradox() {
      const b = beats("paradox");
      yield* say(title, roman("Average speed needs an interval"), b.title!);
      yield* say(
        caption,
        `${roman("at an instant the formula reads ")}\\tfrac{0}{0}`,
        b.caption!,
      );
      yield* all(
        leftBranch.opacity(1, b.curve!),
        rightBranch.opacity(1, b.curve!),
        hole.opacity(1, b.curve!),
      );
      yield* waitFor(b.hold!);
    },

    *shrink() {
      const b = beats("shrink");
      yield* say(title, roman("But the averages settle"), b.title!);
      // The declared window covers the whole table; each row gets its share.
      const perRow = b.rows! / tableRows.length;
      for (const row of tableRows) {
        yield* row.opacity(1, perRow);
      }
      yield* say(
        caption,
        `${roman("they are closing on ")}${FORCED}`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *band() {
      const b = beats("band");
      yield* say(title, roman("Name a tolerance"), b.title!);
      epsilon(1.6);
      yield* all(
        bandTop.opacity(1, b.draw!),
        bandBottom.opacity(1, b.draw!),
        epsLabel.opacity(1, b.draw!),
      );
      yield* waitFor(b.hold!);
    },

    *window() {
      const b = beats("window");
      yield* say(title, roman("Answer it with a window"), b.title!);
      delta(H_SPAN);
      yield* all(
        windowLeft.opacity(1, b.draw!),
        windowRight.opacity(1, b.draw!),
        deltaLabel.opacity(1, b.draw!),
      );
      // The quotient is 6 + h, so |quotient − 6| < ε exactly when |h| < ε.
      yield* delta(1.6, b.narrow!, easeInOutCubic);
      yield* say(
        caption,
        `${roman("inside the window, every value is within ")}\\varepsilon`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *predict() {
      const b = beats("predict");
      // Nothing moves. Everything the answer depends on is already on screen.
      // Two short lines rather than one long one: at font size 32 the single
      // sentence overflowed the stage and was clipped at both edges.
      yield* say(
        title,
        `\\begin{gathered} ${roman("The band is about to narrow tenfold.")} \\\\ ${roman("Can the window still answer?")} \\end{gathered}`,
        b.ask!,
      );
      yield* waitFor(b.think!);
    },

    *tighter() {
      const b = beats("tighter");
      yield* all(
        epsilon(0.16, b.narrow!, easeInOutCubic),
        delta(0.16, b.narrow!, easeInOutCubic),
      );
      yield* say(title, roman("It can — and it always can"), b.title!);
      yield* say(
        caption,
        `${roman("that guarantee is what ")}\\lim_{h\\to0}${roman(" means")}`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *puncture() {
      const b = beats("puncture");
      yield* say(title, roman("The point never voted"), b.title!);
      // The hole was there all along; the scene now says so out loud.
      yield* all(hole.size(34, b.emphasis!), hole.lineWidth(5, b.emphasis!));
      yield* all(hole.size(22, b.settle!), hole.lineWidth(3, b.settle!));
      yield* say(
        caption,
        roman("delete the value, change it, move it — the limit is unchanged"),
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *fail() {
      const b = beats("fail");
      yield* all(
        title.opacity(0, b.clear!),
        caption.opacity(0, b.clear!),
        epsLabel.opacity(0, b.clear!),
        deltaLabel.opacity(0, b.clear!),
        ...tableRows.map((r) => r.opacity(0, b.clear!) as ThreadGenerator),
      );
      yield* showFailure(EX_JUMP, "jump: two different forced values", [-1, 3], [-0.6, 2.6], b.show!);
      yield* waitFor(b.hold!);
      yield* showFailure(
        EX_OSCILLATE,
        "oscillation: no forced value",
        [-0.6, 0.6],
        [-1.3, 1.3],
        b.swap!,
      );
      yield* waitFor(b.hold2!);
    },

    *continuity() {
      const b = beats("continuity");
      yield* failPanel.opacity(0, b.clear!);
      yield* say(title, roman("Continuity: the forced value is the real one"), b.title!);
      yield* say(
        caption,
        `\\lim_{x\\to a}f(x) = f(a)\\quad${roman("— so substitution is legal")}`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },

    *localOnly() {
      const b = beats("localOnly");
      yield* all(title.opacity(0, b.clear!), caption.opacity(0, b.clear!));
      yield* samplePanel.opacity(1, b.show!);
      yield* say(
        title,
        roman("This function is continuous. Every sample reads zero."),
        b.title!,
      );
      yield* waitFor(b.hold!);
      // The correction, made visible: continuity fixed no window width.
      yield* spikeTruth.opacity(1, b.reveal!);
      yield* say(
        caption,
        roman("a full-height spike, entirely between two samples"),
        b.caption!,
      );
      yield* waitFor(b.hold2!);
    },

    *modulus() {
      const b = beats("modulus");
      yield* say(title, roman("What a sampling claim actually needs"), b.title!);
      // The coarse polyline recedes; a grid chosen against a modulus arrives and
      // tracks the truth. Nothing here claims a bound the function can break.
      yield* all(
        guarantee.opacity(1, b.band!),
        spikeTruth.opacity(0.45, b.band!),
      );
      yield* say(
        caption,
        `${roman("a resolution, and a modulus ")}\\lvert f(x)-f(y)\\rvert \\le \\omega(\\lvert x-y\\rvert)${roman(" to choose it by")}`,
        b.caption!,
      );
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of LIMITS_CONTINUITY_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
