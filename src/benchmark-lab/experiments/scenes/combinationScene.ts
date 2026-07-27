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
  ALPHA_STOPS,
  COLUMNS,
  FACTOR,
  NEW_R2,
  R1,
  R2,
  SOLUTION,
  assertExperimentDataIsConsistent,
  rowAtAlpha,
} from "../eliminationExperimentData";
import { runCandidateBeats } from "../candidateKit";

/**
 * Candidate C — "Search".
 *
 * Design thesis: the multiplier looks pulled out of the air. Neither the
 * production scene nor candidate A ever shows that 2 was CHOSEN — that other
 * multiples were available, equally legal, and simply less useful. A learner
 * who never sees the alternatives cannot generalise the method to a system
 * whose leading entries are not 1 and 2.
 *
 * So the focal object here is a single number: the x-coefficient of the
 * candidate row R₂ + α·R₁. The dial steps through whole values of α; at each
 * stop the candidate row is typeset afresh and its line is drawn and LEFT on
 * screen. By the end the frame holds a fan of candidate lines, all of them
 * through (2, −1) — which is the invariance argument made structurally: every
 * legal move lands in the same pencil, so none of them can move the solution.
 *
 * Elimination is then not "the rule" but a selection: the one stop where the
 * coefficient hits zero.
 */

const S = 52;
const ORIGIN = new Vector2(-310, 66);
const px = (p: readonly [number, number]) =>
  new Vector2(ORIGIN.x + p[0] * S, ORIGIN.y - p[1] * S);
const X_RANGE: readonly [number, number] = [-2, 5];
const Y_RANGE: readonly [number, number] = [-3, 3];

const clip = (row: readonly [number, number, number]): [Vector2, Vector2] =>
  clipLineToBox(row, X_RANGE, Y_RANGE, px);

export const combinationScene = makeScene2D(function* (view) {
  assertExperimentDataIsConsistent();
  view.fill(STAGE_BG);

  const title = makeIntertitle("Which multiple, and why", 42);
  title.node.position(new Vector2(0, -20));
  view.add(title.node);

  /* --------------------------------------------------------- the companion */
  const plane = new Node({ opacity: 0 });
  view.add(plane);
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
  const line1 = new Line({
    stroke: ACCENT.rowOne,
    lineWidth: 4,
    points: clip(R1),
    opacity: 0,
  });
  view.add(line1);

  /** Every candidate line drawn so far — the fan is the invariance argument. */
  const fan = new Node({});
  view.add(fan);

  const dot = new Circle({
    size: 18,
    fill: ACCENT.invariant,
    position: px([SOLUTION[0]!, SOLUTION[1]!]),
    opacity: 0,
  });
  view.add(dot);
  const crossing = makePlatedLabel(
    `(${texNumber(SOLUTION[0]!)},\\, ${texNumber(SOLUTION[1]!)})`,
    28,
    ACCENT.invariant,
  );
  const dotLabel = crossing.node;
  dotLabel.opacity(0);
  dotLabel.position(px([SOLUTION[0]!, SOLUTION[1]!]).add(new Vector2(4, 62)));
  view.add(dotLabel);

  /* ------------------------------------------------------------- the dial */
  const PANEL_X = 236;
  /** Continuous, for the knob's travel only. */
  const knobAlpha = createSignal(0);
  /**
   * Discrete, and the only thing the mathematics reads. Set imperatively when
   * the dial reaches a stop, so the coefficient, the typeset row, and the drawn
   * line never show a value between two legal choices.
   */
  const alpha = createSignal(0);

  const familyLabel = makeTex(
    `R_2 + \\alpha\\,R_1`,
    46,
    { fill: INK, opacity: 0 },
  );
  familyLabel.position(new Vector2(PANEL_X, -200));
  view.add(familyLabel);

  const familyNote = makeTex(
    `${texRoman("every ")}\\alpha${texRoman(" is a legal move")}`,
    26,
    { fill: INK_MUTED, opacity: 0 },
  );
  familyNote.position(new Vector2(PANEL_X, -152));
  view.add(familyNote);

  // The dial: a track with a travelling knob and integer stops.
  const dial = new Node({ opacity: 0 });
  view.add(dial);
  const TRACK_LEFT = PANEL_X - 200;
  const TRACK_RIGHT = PANEL_X + 200;
  const alphaToX = (value: number) =>
    TRACK_LEFT +
    ((value - ALPHA_STOPS[0]!) /
      (ALPHA_STOPS[ALPHA_STOPS.length - 1]! - ALPHA_STOPS[0]!)) *
      (TRACK_RIGHT - TRACK_LEFT);
  dial.add(
    new Line({
      stroke: INK_FAINT,
      lineWidth: 3,
      points: [new Vector2(TRACK_LEFT, -92), new Vector2(TRACK_RIGHT, -92)],
    }),
  );
  for (const stop of ALPHA_STOPS) {
    dial.add(
      new Line({
        stroke: INK_MUTED,
        lineWidth: 2,
        points: [
          new Vector2(alphaToX(stop), -102),
          new Vector2(alphaToX(stop), -82),
        ],
      }),
    );
    const numeral = makeTex(texNumber(stop), 24, { fill: INK_MUTED });
    numeral.position(new Vector2(alphaToX(stop), -60));
    dial.add(numeral);
  }
  const knob = new Circle({
    size: 22,
    fill: INK,
    position: () => new Vector2(alphaToX(knobAlpha()), -92),
  });
  dial.add(knob);

  /* ---------------------------------------------- the focal number and row */
  const coefficientPlate = new Rect({
    width: 300,
    height: 108,
    y: 14,
    x: PANEL_X,
    radius: 16,
    fill: "#141a24",
    opacity: 0,
  });
  view.add(coefficientPlate);

  const coefficientCaption = makeTex(
    texRoman("x-coefficient"),
    26,
    { fill: INK_MUTED, opacity: 0 },
  );
  coefficientCaption.position(new Vector2(PANEL_X, -20));
  view.add(coefficientCaption);

  /**
   * The focal object. It reads the SAME α the row and the line read, so the
   * number, the typeset row, and the drawn line cannot disagree.
   */
  const coefficient = makeTex(
    () => texNumber(rowAtAlpha(alpha())[0]),
    72,
    { fill: INK },
  );
  coefficient.position(new Vector2(PANEL_X, 32));
  coefficient.opacity(0);
  view.add(coefficient);

  const candidateRow = makeTex(texEquation(R2), 36, {
    fill: ACCENT.rowTwo,
    opacity: 0,
  });
  candidateRow.position(new Vector2(PANEL_X, 122));
  view.add(candidateRow);

  const verdict = makeTex("", 30, { fill: INK_MUTED, opacity: 0 });
  verdict.position(new Vector2(PANEL_X, 182));
  view.add(verdict);

  const arithmetic = new Node({ opacity: 0 });
  view.add(arithmetic);
  COLUMNS.forEach((column, index) => {
    const subtrahend =
      column.subtrahend < 0
        ? `(${texNumber(column.subtrahend)})`
        : texNumber(column.subtrahend);
    const line = makeTex(
      `${texNumber(column.minuend)} - ${subtrahend} = ${texNumber(column.result)}`,
      28,
      { fill: column.isTarget ? ACCENT.target : INK_MUTED },
    );
    line.position(new Vector2(PANEL_X, 122 + index * 44));
    arithmetic.add(line);
  });

  const closing = makeTex("", 30, { fill: INK, opacity: 0 });
  closing.position(new Vector2(0, 244));
  view.add(closing);

  /** Draw the candidate line for a stop and leave it in the fan. */
  const addFanLine = (value: number, colour: string, width: number) => {
    const line = new Line({
      stroke: colour,
      lineWidth: width,
      points: clip(rowAtAlpha(value)),
      opacity: 0,
    });
    fan.add(line);
    return line;
  };

  const bodies: Record<string, () => ThreadGenerator> = {
    *legal() {
      // The intertitle is already on screen at t = 0: a clip whose first
      // frame is empty gives a paused learner nothing to read.
      yield* waitFor(1.4);
      yield* title.node.opacity(0, 0.45);
      yield* plane.opacity(1, 0.5);
      yield* all(
        line1.opacity(1, 0.45),
        dot.opacity(1, 0.45),
        dotLabel.opacity(1, 0.45),
      );
      const first = addFanLine(0, ACCENT.rowTwo, 4);
      yield* first.opacity(1, 0.4);
      yield* all(familyLabel.opacity(1, 0.5), familyNote.opacity(1, 0.5));
      yield* waitFor(0.5);
    },

    *dial() {
      yield* all(
        dial.opacity(1, 0.5),
        coefficientPlate.opacity(0.9, 0.5),
        coefficientCaption.opacity(1, 0.5),
        coefficient.opacity(1, 0.5),
        candidateRow.opacity(1, 0.5),
      );
      yield* waitFor(1.6);
    },

    *stops() {
      // Step the dial. The coefficient is live (it is a function of α), but the
      // ROW is only re-typeset at whole stops — no interpolated digits.
      for (const stop of [-1, -2, -3]) {
        yield* knobAlpha(stop, 1.0, easeInOutCubic);
        alpha(stop);
        candidateRow.tex(texEquation(rowAtAlpha(stop)));
        const isZero = Math.abs(rowAtAlpha(stop)[0]) < 1e-9;
        const line = addFanLine(
          stop,
          isZero ? ACCENT.target : ACCENT.rowTwo,
          isZero ? 5 : 2.5,
        );
        yield* all(
          line.opacity(isZero ? 1 : 0.45, 0.35),
          coefficient.fill(isZero ? ACCENT.target : INK, 0.35),
        );
        yield* waitFor(0.6);
      }
      yield* waitFor(0.4);
    },

    *zero() {
      // Come back to the stop that cancels and hold it.
      yield* knobAlpha(FACTOR, 0.9, easeInOutCubic);
      alpha(FACTOR);
      candidateRow.tex(texEquation(NEW_R2));
      yield* coefficient.fill(ACCENT.target, 0.3);
      verdict.tex(texRoman("the only stop that cancels x"));
      yield* all(verdict.opacity(1, 0.4), coefficient.scale(1.16, 0.4));
      yield* coefficient.scale(1, 0.35);
      yield* waitFor(1.5);
    },

    *why() {
      // Where the three entries came from, beside the number that selected them.
      yield* all(candidateRow.opacity(0, 0.35), verdict.opacity(0, 0.35));
      yield* arithmetic.opacity(1, 0.5);
      yield* waitFor(2.6);
    },

    *invariant() {
      yield* arithmetic.opacity(0, 0.4);
      closing.tex(
        `${texRoman("every ")}\\alpha${texRoman(" met at the same point — so none could move it")}`,
      );
      yield* all(
        closing.opacity(1, 0.5),
        ...fan.children().map((child) => child.opacity(0.85, 0.5) as ThreadGenerator),
      );
      yield* all(dot.size(30, 0.4), dotLabel.scale(1.14, 0.4));
      yield* all(dot.size(18, 0.35), dotLabel.scale(1, 0.35));
      yield* waitFor(1.8);
    },
  };

  yield* runCandidateBeats("combination", bodies);
});
