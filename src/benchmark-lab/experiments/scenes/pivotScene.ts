import { Circle, Line, Node, Rect, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import {
  ACCENT,
  INK,
  INK_FAINT,
  INK_MUTED,
  STAGE_BG,
  clipLineToBox,
  makeIntertitle,
  makePlatedLabel,
  makeTex,
  texEquation,
  texNumber,
  texRoman,
} from "../mathType";
import {
  COLUMNS,
  MULTIPLIER,
  R1,
  R2,
  SOLUTION,
  assertExperimentDataIsConsistent,
  rowAtAlpha,
} from "../eliminationExperimentData";
import { runCandidateBeats } from "../candidateKit";

/**
 * Candidate B — "Pivot".
 *
 * Design thesis: a learner who can already do the arithmetic still cannot say
 * what the new equation MEANS, or why swapping one constraint for another is
 * allowed. Both the production scene and candidate A assert the invariance in
 * words; here it is the only thing on screen that does not move.
 *
 * The operation is one continuous rotation of R₂'s line about the crossing.
 * That tween is mathematically honest, and this is the reason: every
 * intermediate is `R₂ + α·R₁` for some α between 0 and −2, which is itself a
 * legal row operation's result, so every intermediate line is a real constraint
 * satisfied by the solution. The sweep is not a transition between two pictures
 * — it is a walk through the pencil of constraints through (2, −1).
 *
 * The payoff is a geometric meaning for "eliminate x" that no caption in the
 * production scene states: the line rotates until it is HORIZONTAL, and a
 * horizontal line is exactly one whose equation no longer mentions x. Its
 * equation label is re-typeset at discrete stops, never interpolated.
 */

const S = 72;
const ORIGIN = new Vector2(-40, 20);
const px = (p: readonly [number, number]) =>
  new Vector2(ORIGIN.x + p[0] * S, ORIGIN.y - p[1] * S);

const X_RANGE: readonly [number, number] = [-2, 4];
// Deliberately short at the bottom: the closing note lives under the plot, and
// a plot that reaches the stage edge leaves nowhere for it to go.
const Y_RANGE: readonly [number, number] = [-2.5, 1.7];

/** This clip's box, bound once so every line in the scene shares it. */
const clip = (row: readonly [number, number, number]): [Vector2, Vector2] =>
  clipLineToBox(row, X_RANGE, Y_RANGE, px);

export const pivotScene = makeScene2D(function* (view) {
  assertExperimentDataIsConsistent();
  view.fill(STAGE_BG);

  /* ------------------------------------------------------------ the plane */
  const plane = new Node({ opacity: 0 });
  view.add(plane);

  // Minor grid, restrained; axes carry the weight.
  for (let x = X_RANGE[0]; x <= X_RANGE[1]; x += 1) {
    plane.add(
      new Line({
        stroke: x === 0 ? INK_MUTED : INK_FAINT,
        lineWidth: x === 0 ? 2 : 1,
        points: [px([x, Y_RANGE[0]]), px([x, Y_RANGE[1]])],
      }),
    );
  }
  for (let y = Y_RANGE[0]; y <= Y_RANGE[1]; y += 1) {
    plane.add(
      new Line({
        stroke: y === 0 ? INK_MUTED : INK_FAINT,
        lineWidth: y === 0 ? 2 : 1,
        points: [px([X_RANGE[0], y]), px([X_RANGE[1], y])],
      }),
    );
  }
  // Ticks and numerals: a professional axis says what its scale is.
  for (const x of [-1, 1, 2, 3]) {
    plane.add(
      new Line({
        stroke: INK_MUTED,
        lineWidth: 2,
        points: [px([x, 0]).add(new Vector2(0, -6)), px([x, 0]).add(new Vector2(0, 6))],
      }),
    );
    const numeral = makeTex(texNumber(x), 24, { fill: INK_MUTED });
    numeral.position(px([x, 0]).add(new Vector2(0, 26)));
    plane.add(numeral);
  }
  for (const y of [-2, -1, 1]) {
    plane.add(
      new Line({
        stroke: INK_MUTED,
        lineWidth: 2,
        points: [px([0, y]).add(new Vector2(-6, 0)), px([0, y]).add(new Vector2(6, 0))],
      }),
    );
    const numeral = makeTex(texNumber(y), 24, { fill: INK_MUTED });
    numeral.position(px([0, y]).add(new Vector2(-26, 0)));
    plane.add(numeral);
  }

  /* ----------------------------------------------------------- the lines */
  const line1 = new Line({
    stroke: ACCENT.rowOne,
    lineWidth: 5,
    points: clip(R1),
    opacity: 0,
  });
  view.add(line1);

  /**
   * α drives the SECOND line. Every value gives a genuine constraint through
   * the crossing, which is what licenses a continuous sweep here.
   */
  const alpha = createSignal(0);
  const liveRow = () => rowAtAlpha(alpha());
  const line2 = new Line({
    stroke: ACCENT.rowTwo,
    lineWidth: 5,
    points: () => clip(liveRow()),
    opacity: 0,
  });
  view.add(line2);

  /** Where R₂ started, kept as a dashed ghost so the rotation has a "from". */
  const ghost2 = new Line({
    stroke: ACCENT.rowTwo,
    lineWidth: 2.5,
    lineDash: [10, 10],
    points: clip(R2),
    opacity: 0,
  });
  view.add(ghost2);

  /* ------------------------------------------- equations attached to lines */
  // The equation is the line's NAME, not a panel entry: it rides at the line's
  // end, so a learner never has to match a symbol to a stroke.
  const label1 = makeTex(texEquation(R1), 34, { fill: ACCENT.rowOne, opacity: 0 });
  label1.position(px([-2, (R1[2] - R1[0] * -2) / R1[1]]).add(new Vector2(-118, -34)));
  view.add(label1);
  const leader1 = new Line({
    stroke: ACCENT.rowOne,
    lineWidth: 1.5,
    opacity: 0,
    points: [
      px([-2, (R1[2] - R1[0] * -2) / R1[1]]).add(new Vector2(-60, -22)),
      px([-2, (R1[2] - R1[0] * -2) / R1[1]]).add(new Vector2(-6, -4)),
    ],
  });
  view.add(leader1);

  const label2 = makeTex(texEquation(R2), 34, { fill: ACCENT.rowTwo, opacity: 0 });
  // Anchored to the live line's right-hand end: the equation is the line's
  // name, so it travels with the line through the whole pivot.
  label2.position(() => clip(liveRow())[1].add(new Vector2(96, -22)));
  view.add(label2);

  /* ------------------------------------------------------- the crossing */
  const dot = new Circle({
    size: 20,
    fill: ACCENT.invariant,
    position: px([SOLUTION[0]!, SOLUTION[1]!]),
    opacity: 0,
  });
  view.add(dot);
  const crossing = makePlatedLabel(
    `(${texNumber(SOLUTION[0]!)},\\, ${texNumber(SOLUTION[1]!)})`,
    32,
    ACCENT.invariant,
  );
  const dotLabel = crossing.node;
  dotLabel.opacity(0);
  dotLabel.position(px([SOLUTION[0]!, SOLUTION[1]!]).add(new Vector2(-8, 56)));
  view.add(dotLabel);

  /* ------------------------------------------------------------ intertitle */
  const title = makeIntertitle("A constraint you can replace", 42);
  title.node.position(new Vector2(0, -20));
  view.add(title.node);

  /** Banner for the prediction — the plane stays visible beneath it. */
  const bannerPlate = new Rect({
    width: 1280,
    height: 92,
    y: -284,
    fill: "#05080d",
    opacity: 0,
  });
  view.add(bannerPlate);
  const banner = makeTex("", 36, { fill: INK, opacity: 0 });
  banner.position(new Vector2(0, -286));
  view.add(banner);

  /** The operation, written once and kept while it is performed. */
  const opLabel = makeTex(
    `R_2 \\leftarrow R_2 - ${MULTIPLIER}\\,R_1`,
    38,
    { fill: INK, opacity: 0 },
  );
  opLabel.position(new Vector2(-150, -224));
  view.add(opLabel);

  /** Live α readout, so the sweep is legible as a quantity, not just motion. */
  const alphaReadout = makeTex(
    () => `\\alpha = ${texNumber(alpha())}`,
    32,
    { fill: INK_MUTED, opacity: 0 },
  );
  alphaReadout.position(new Vector2(210, -224));
  view.add(alphaReadout);

  const note = makeTex("", 30, { fill: INK_MUTED, opacity: 0 });
  note.position(new Vector2(0, 240));
  view.add(note);

  /* -------------------------------------------------- the column arithmetic */
  const arithmetic = new Node({ opacity: 0 });
  view.add(arithmetic);
  const ARITH_X = -300;
  COLUMNS.forEach((column, index) => {
    const minuend = texNumber(column.minuend);
    const subtrahend =
      column.subtrahend < 0
        ? `(${texNumber(column.subtrahend)})`
        : texNumber(column.subtrahend);
    const line = makeTex(
      `${minuend} - ${subtrahend} = ${texNumber(column.result)}`,
      30,
      { fill: column.isTarget ? ACCENT.target : INK_MUTED },
    );
    line.position(new Vector2(ARITH_X, -164 + index * 46));
    arithmetic.add(line);
  });

  /** The eliminated row read as a value of y. Hoisted so `read` can retire it. */
  const yCallout = makeTex(`y = ${texNumber(SOLUTION[1]!)}`, 40, {
    fill: ACCENT.target,
    opacity: 0,
  });
  yCallout.position(px([0.6, -1]).add(new Vector2(0, -46)));
  view.add(yCallout);

  // The closing read-off shares the empty upper-left block with the column
  // arithmetic, one after the other — never both at once.
  const readOff = makeTex("", 28, { fill: ACCENT.invariant, opacity: 0 });
  readOff.position(new Vector2(-256, -122));
  view.add(readOff);

  const bodies: Record<string, () => ThreadGenerator> = {
    *plane() {
      // The intertitle is already on screen at t = 0: a clip whose first
      // frame is empty gives a paused learner nothing to read.
      yield* waitFor(1.4);
      yield* title.node.opacity(0, 0.5);
      yield* plane.opacity(1, 0.6);
      yield* all(
        line1.opacity(1, 0.5),
        label1.opacity(1, 0.5),
        leader1.opacity(0.7, 0.5),
      );
      yield* waitFor(0.4);
      yield* all(line2.opacity(1, 0.5), label2.opacity(1, 0.5));
      yield* waitFor(0.6);
    },

    *crossing() {
      yield* all(dot.opacity(1, 0.45), dotLabel.opacity(1, 0.45));
      yield* dot.size(32, 0.35);
      yield* dot.size(20, 0.3);
      note.tex(texRoman("the one point both constraints allow"));
      yield* note.opacity(1, 0.4);
      yield* waitFor(1.6);
      yield* note.opacity(0, 0.35);
    },

    *predict() {
      yield* all(opLabel.opacity(1, 0.5), alphaReadout.opacity(1, 0.5));
      banner.tex(
        `\\text{Which of these can that move?}`,
      );
      yield* all(bannerPlate.opacity(0.94, 0.4), banner.opacity(1, 0.4));
      // Real think time, with every object the answer depends on still up.
      yield* waitFor(3.6);
      yield* all(bannerPlate.opacity(0, 0.4), banner.opacity(0, 0.4));
    },

    *sweep() {
      // Leave a ghost where R₂ started, then walk α from 0 to −2. The label is
      // re-typeset at whole stops only — never interpolated into digits that
      // were nobody's equation.
      yield* ghost2.opacity(0.5, 0.4);
      for (const stop of [-1, -2]) {
        yield* alpha(stop, 2.1, easeInOutCubic);
        label2.tex(texEquation(rowAtAlpha(stop)));
        yield* waitFor(0.5);
      }
      yield* waitFor(0.3);
    },

    *horizontal() {
      // The punchline: the line has become horizontal, and a horizontal line
      // is exactly one whose equation no longer mentions x.
      note.tex(texRoman("horizontal — its equation has no x left"));
      yield* all(note.opacity(1, 0.45), line2.lineWidth(8, 0.45));
      yield* line2.lineWidth(5, 0.4);
      yield* waitFor(1.4);
      yield* yCallout.opacity(1, 0.5);
      yield* waitFor(0.6);
    },

    *arithmetic() {
      // The upper-left block belongs to R₁'s label until now; the arithmetic
      // takes it over rather than being stacked on top of it.
      yield* all(
        label1.opacity(0, 0.4),
        leader1.opacity(0, 0.4),
        yCallout.opacity(0, 0.4),
      );
      note.tex(texRoman("the same move, entry by entry"));
      yield* all(arithmetic.opacity(1, 0.55), note.opacity(1, 0.4));
      yield* waitFor(2.4);
    },

    *read() {
      readOff.tex(
        `\\begin{aligned} y &= ${texNumber(SOLUTION[1]!)} \\\\ ${texEquation(R1).replace("=", "&=")} &\\;\\Rightarrow\\; x = ${texNumber(SOLUTION[0]!)} \\end{aligned}`,
      );
      note.tex(texRoman("back-substitute, and the crossing is confirmed"));
      yield* arithmetic.opacity(0, 0.35);
      yield* readOff.opacity(1, 0.5);
      yield* all(dot.size(32, 0.4), dotLabel.scale(1.12, 0.4));
      yield* all(dot.size(20, 0.35), dotLabel.scale(1, 0.35));
      yield* waitFor(1.6);
    },
  };

  yield* runCandidateBeats("pivot", bodies);
});
