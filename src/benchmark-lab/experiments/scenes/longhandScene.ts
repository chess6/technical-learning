import { Circle, Line, Node, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  easeInOutCubic,
  easeOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import {
  ACCENT,
  INK,
  INK_FAINT,
  INK_MUTED,
  STAGE_BG,
  makeAugmentedMatrix,
  makeIntertitle,
  clipLineToBox,
  makeTex,
  texEquation,
  texNumber,
  texRoman,
} from "../mathType";
import {
  COLUMNS,
  MULTIPLIER,
  NEW_R2,
  R1,
  R2,
  SCALED_R1,
  SOLUTION,
  assertExperimentDataIsConsistent,
} from "../eliminationExperimentData";
import { runCandidateBeats } from "../candidateKit";

/**
 * Candidate A — "Longhand".
 *
 * Design thesis: the defect this attacks is that the new row's entries appear
 * from nowhere. The production scene interpolates R₂'s three numbers from their
 * old values to their new ones, so for 2.6 seconds the screen shows
 * `1.87x − 1.38y = 5.13` — an equation nobody wrote, whose digits carry no
 * information. A learner watching that cannot say where −7 came from.
 *
 * So this clip does the arithmetic the way a person does it on paper: R₁ is
 * copied (the original stays put — it is the tool), the copy is doubled, it is
 * aligned column-under-column beneath R₂, a subtraction rule is drawn, and the
 * three columns are computed left to right with the cancelling column last in
 * emphasis and first in importance. Nothing interpolates; every number that
 * appears is typeset once, in place.
 *
 * Geometry is deliberately withheld to the final four seconds. The whole
 * argument is arithmetic, and a graph on screen during the working would be a
 * second thing to look at during the beat that most needs a single focus.
 */

const R1_Y = -186;
const R2_Y = -110;
const WORK_X = 40;
const SCRATCH_Y = 46;
const RULE_Y = 96;
const RESULT_Y = 146;

/** Column centres for the longhand working, wider than the matrix's. */
const COL_X = [-150, -8, 168] as const;

export const longhandScene = makeScene2D(function* (view) {
  assertExperimentDataIsConsistent();
  view.fill(STAGE_BG);

  /* ---------------------------------------------------------------- title */
  const title = makeIntertitle("Row operations, longhand", 44);
  title.node.position(new Vector2(0, -30));
  view.add(title.node);

  /* ------------------------------------------------------------ equations */
  const eq1 = makeTex(texEquation(R1), 46, { fill: ACCENT.rowOne, opacity: 0 });
  eq1.position(new Vector2(0, -46));
  view.add(eq1);
  const eq2 = makeTex(texEquation(R2), 46, { fill: ACCENT.rowTwo, opacity: 0 });
  eq2.position(new Vector2(0, 34));
  view.add(eq2);

  /* --------------------------------------------------- the augmented matrix */
  const matrix = makeAugmentedMatrix(
    [
      [texNumber(R1[0]), texNumber(R1[1]), texNumber(R1[2])],
      [texNumber(R2[0]), texNumber(R2[1]), texNumber(R2[2])],
    ],
    { size: 46, fills: [ACCENT.rowOne, ACCENT.rowTwo] },
  );
  matrix.node.position(new Vector2(WORK_X, R1_Y + 38));
  matrix.node.opacity(0);
  view.add(matrix.node);

  const rowLabel1 = makeTex("R_1", 34, { fill: ACCENT.rowOne, opacity: 0 });
  rowLabel1.position(new Vector2(WORK_X - 250, R1_Y));
  view.add(rowLabel1);
  const rowLabel2 = makeTex("R_2", 34, { fill: ACCENT.rowTwo, opacity: 0 });
  rowLabel2.position(new Vector2(WORK_X - 250, R2_Y));
  view.add(rowLabel2);

  /* ------------------------------------------------------- the aim marker */
  const aimRing = new Circle({
    size: 62,
    stroke: ACCENT.target,
    lineWidth: 3,
    opacity: 0,
    position: new Vector2(
      WORK_X + matrix.layout.columnX[0]!,
      R1_Y + 38 + matrix.layout.rowY[1]!,
    ),
  });
  view.add(aimRing);
  const pivotRing = new Circle({
    size: 62,
    stroke: ACCENT.rowOne,
    lineWidth: 3,
    opacity: 0,
    position: new Vector2(
      WORK_X + matrix.layout.columnX[0]!,
      R1_Y + 38 + matrix.layout.rowY[0]!,
    ),
  });
  view.add(pivotRing);

  const aimNote = makeTex(texRoman("we want a 0 here"), 28, {
    fill: ACCENT.target,
    opacity: 0,
  });
  aimNote.position(new Vector2(WORK_X + matrix.layout.columnX[0]! - 30, R2_Y + 76));
  view.add(aimNote);

  /* ----------------------------------------------------- the working area */
  // R₂'s three entries, re-typeset in the wider working grid. The matrix keeps
  // its own copy: this is the row being worked ON, not the row itself moving.
  const workRow = COLUMNS.map((column, index) => {
    const cell = makeTex(texNumber(column.minuend), 46, {
      fill: ACCENT.rowTwo,
      opacity: 0,
    });
    cell.position(new Vector2(WORK_X + COL_X[index]!, -14));
    view.add(cell);
    return cell;
  });

  /**
   * The scratch copy of R₁. It is created ON TOP of R₁ inside the matrix and
   * travels down, so the learner sees one row become two rather than a second
   * row fading in somewhere else.
   */
  const scratchGroup = new Node({ opacity: 0 });
  view.add(scratchGroup);
  const scratchCells = R1.map((value, index) => {
    const cell = makeTex(texNumber(value), 46, { fill: ACCENT.scratch });
    cell.position(
      new Vector2(
        WORK_X + matrix.layout.columnX[index]!,
        R1_Y + 38 + matrix.layout.rowY[0]!,
      ),
    );
    scratchGroup.add(cell);
    return cell;
  });
  const scratchTag = makeTex(`${MULTIPLIER}\\,R_1`, 34, {
    fill: ACCENT.scratch,
    opacity: 0,
  });
  scratchTag.position(new Vector2(WORK_X - 232, SCRATCH_Y));
  view.add(scratchTag);

  const minusSign = makeTex("-", 46, { fill: INK_MUTED, opacity: 0 });
  minusSign.position(new Vector2(WORK_X - 300, SCRATCH_Y));
  // Kept beside `scratchTag`: a lone dash in the gutter before the row is
  // labelled reads as a stray mark rather than as the subtraction operator.
  view.add(minusSign);

  const rule = new Line({
    stroke: INK,
    lineWidth: 3,
    opacity: 0,
    points: [
      new Vector2(WORK_X - 310, RULE_Y),
      new Vector2(WORK_X + 250, RULE_Y),
    ],
  });
  view.add(rule);

  /** The three results, each typeset once when its column is computed. */
  const resultCells = COLUMNS.map((column, index) => {
    const cell = makeTex(texNumber(column.result), 50, {
      fill: column.isTarget ? ACCENT.target : INK,
      opacity: 0,
    });
    cell.position(new Vector2(WORK_X + COL_X[index]!, RESULT_Y));
    view.add(cell);
    return cell;
  });

  /** The working shown for one column, e.g. `5 - (-2) = 7`, beside the rule. */
  const columnWorking = makeTex("", 34, { fill: INK_MUTED, opacity: 0 });
  columnWorking.position(new Vector2(WORK_X - 40, 216));
  view.add(columnWorking);

  const cancelNote = makeTex(texRoman("x is gone"), 32, {
    fill: ACCENT.target,
    opacity: 0,
  });
  cancelNote.position(new Vector2(WORK_X + COL_X[0]!, 216));
  view.add(cancelNote);

  /* ------------------------------------------------------------- the payoff */
  const payoff = new Node({ opacity: 0 });
  view.add(payoff);
  const PLOT = new Vector2(-238, 46);
  const S = 58;
  const PLOT_X: readonly [number, number] = [-2, 3.4];
  const PLOT_Y: readonly [number, number] = [-2.6, 2.2];
  const px = (p: readonly [number, number]) =>
    new Vector2(PLOT.x + p[0] * S, PLOT.y - p[1] * S);
  for (let k = -2; k <= 3; k += 1) {
    payoff.add(
      new Line({
        stroke: k === 0 ? INK_MUTED : INK_FAINT,
        lineWidth: k === 0 ? 2 : 1,
        points: [px([k, PLOT_Y[0]]), px([k, PLOT_Y[1]])],
      }),
    );
  }
  for (let k = -2; k <= 2; k += 1) {
    payoff.add(
      new Line({
        stroke: k === 0 ? INK_MUTED : INK_FAINT,
        lineWidth: k === 0 ? 2 : 1,
        points: [px([PLOT_X[0], k]), px([PLOT_X[1], k])],
      }),
    );
  }
  const lineFor = (row: readonly [number, number, number], colour: string) =>
    new Line({
      stroke: colour,
      lineWidth: 4,
      points: clipLineToBox(row, PLOT_X, PLOT_Y, px),
    });
  payoff.add(lineFor(R1, ACCENT.rowOne));
  const oldLine = lineFor(R2, ACCENT.rowTwo);
  oldLine.lineDash([9, 9]);
  oldLine.lineWidth(2.5);
  payoff.add(oldLine);
  payoff.add(lineFor(NEW_R2, ACCENT.target));
  const dot = new Circle({
    size: 20,
    fill: ACCENT.invariant,
    position: px([SOLUTION[0]!, SOLUTION[1]!]),
  });
  payoff.add(dot);
  const dotLabel = makeTex(
    `(${texNumber(SOLUTION[0]!)},\\, ${texNumber(SOLUTION[1]!)})`,
    32,
    { fill: ACCENT.invariant },
  );
  dotLabel.position(px([SOLUTION[0]!, SOLUTION[1]!]).add(new Vector2(-16, 52)));
  payoff.add(dotLabel);

  const finalSystem = makeTex(
    `\\begin{aligned} ${texEquation(R1).replace("=", "&=")} \\\\ ${texEquation(NEW_R2).replace("=", "&=")} \\end{aligned}`,
    46,
    { fill: INK },
  );
  finalSystem.position(new Vector2(252, 20));
  payoff.add(finalSystem);
  const payoffNote = makeTex(texRoman("same crossing, easier second row"), 28, {
    fill: INK_MUTED,
  });
  payoffNote.position(new Vector2(252, 140));
  payoff.add(payoffNote);

  /* ------------------------------------------------------------- the beats */
  const dimTo = (nodes: readonly { opacity: (v: number, d?: number) => unknown }[], value: number, duration: number) =>
    all(...nodes.map((n) => n.opacity(value, duration) as ThreadGenerator));

  /** Construction marks, retired once the working they align is finished. */
  const columnGuides: Line[] = [];

  const bodies: Record<string, () => ThreadGenerator> = {
    *system() {
      // The intertitle is already on screen at t = 0: a clip whose first
      // frame is empty gives a paused learner nothing to read.
      yield* waitFor(1.1);
      yield* all(title.node.opacity(0, 0.4), title.node.y(-90, 0.4));
      yield* all(eq1.opacity(1, 0.5), eq1.y(-46, 0.5, easeOutCubic));
      yield* waitFor(0.3);
      yield* eq2.opacity(1, 0.5);
      yield* waitFor(0.8);
    },

    *matrix() {
      // The equations retire upward as the matrix takes their place: the same
      // six numbers, now packed so a whole row is one move.
      yield* all(eq1.opacity(0, 0.45), eq2.opacity(0, 0.45));
      yield* all(
        matrix.node.opacity(1, 0.6),
        rowLabel1.opacity(1, 0.6),
        rowLabel2.opacity(1, 0.6),
      );
      yield* waitFor(1.9);
    },

    *aim() {
      yield* pivotRing.opacity(0.9, 0.4);
      yield* waitFor(0.5);
      yield* all(aimRing.opacity(1, 0.4), aimNote.opacity(1, 0.4));
      yield* waitFor(2.0);
    },

    *copy() {
      yield* all(aimNote.opacity(0, 0.3), aimRing.opacity(0.35, 0.3));
      // One row becomes two: the copy starts exactly on R₁ and travels.
      scratchGroup.opacity(1);
      yield* all(
        ...scratchCells.map((cell, index) =>
          cell.position(
            new Vector2(WORK_X + COL_X[index]!, SCRATCH_Y),
            0.9,
            easeInOutCubic,
          ),
        ),
        ...workRow.map((cell) => cell.opacity(1, 0.7)),
      );
      yield* waitFor(1.6);
    },

    *double() {
      // Each entry is REPLACED, not interpolated: 1 → 2, 3 → 6, −1 → −2.
      const tag = makeTex(`\\times ${MULTIPLIER}`, 32, { fill: ACCENT.scratch });
      tag.position(new Vector2(WORK_X + 300, SCRATCH_Y));
      tag.opacity(0);
      view.add(tag);
      yield* tag.opacity(1, 0.35);
      for (const [index, cell] of scratchCells.entries()) {
        yield* cell.opacity(0.15, 0.16);
        cell.tex(texNumber(SCALED_R1[index]!));
        yield* cell.opacity(1, 0.22);
      }
      yield* all(scratchTag.opacity(1, 0.35), minusSign.opacity(0.9, 0.35));
      yield* waitFor(0.9);
      yield* tag.opacity(0, 0.35);
    },

    *align() {
      yield* rule.opacity(1, 0.5);
      yield* waitFor(0.6);
      // Column guides make "these two numbers belong together" a fact of the
      // layout rather than an instruction.
      columnGuides.push(...COLUMNS.map((_, index) => {
        const guide = new Line({
          stroke: INK_FAINT,
          lineWidth: 1,
          lineDash: [6, 8],
          opacity: 0,
          points: [
            new Vector2(WORK_X + COL_X[index]!, -48),
            new Vector2(WORK_X + COL_X[index]!, RESULT_Y + 34),
          ],
        });
        view.add(guide);
        return guide;
      }));
      yield* all(...columnGuides.map((g) => g.opacity(1, 0.4)));
      yield* waitFor(1.3);
    },

    *subtract() {
      for (const [index, column] of COLUMNS.entries()) {
        // Light only the column being computed.
        yield* all(
          dimTo(
            workRow.filter((_, i) => i !== index),
            0.28,
            0.25,
          ),
          dimTo(
            scratchCells.filter((_, i) => i !== index),
            0.28,
            0.25,
          ),
          workRow[index]!.opacity(1, 0.25),
          scratchCells[index]!.opacity(1, 0.25),
        );
        const minuend = texNumber(column.minuend);
        const subtrahend =
          column.subtrahend < 0
            ? `(${texNumber(column.subtrahend)})`
            : texNumber(column.subtrahend);
        columnWorking.tex(
          `${minuend} - ${subtrahend} = ${texNumber(column.result)}`,
        );
        yield* columnWorking.opacity(1, 0.25);
        yield* waitFor(column.isTarget ? 0.75 : 0.5);
        yield* resultCells[index]!.opacity(1, 0.3);
        if (column.isTarget) {
          // The cancellation is the point of the whole operation, so it gets
          // the only emphasis in the beat.
          yield* all(cancelNote.opacity(1, 0.35), resultCells[index]!.scale(1.25, 0.35));
          yield* resultCells[index]!.scale(1, 0.3);
          yield* waitFor(0.5);
          yield* cancelNote.opacity(0, 0.3);
        }
        yield* columnWorking.opacity(0, 0.25);
      }
      yield* all(
        dimTo(workRow, 1, 0.3),
        dimTo(scratchCells, 1, 0.3),
      );
      yield* waitFor(0.4);
    },

    *promote() {
      // The result row travels up into the bracket and becomes the new R₂.
      yield* all(
        dimTo(scratchCells, 0.18, 0.4),
        minusSign.opacity(0.2, 0.4),
        rule.opacity(0.25, 0.4),
        dimTo(workRow, 0.18, 0.4),
        scratchTag.opacity(0.2, 0.4),
        ...columnGuides.map((g) => g.opacity(0, 0.4)),
      );
      for (const [index, cell] of matrix.entries[1]!.entries()) {
        cell.node.tex(texNumber(NEW_R2[index]!));
      }
      yield* all(
        ...resultCells.map((cell, index) =>
          all(
            cell.position(
              new Vector2(
                WORK_X + matrix.layout.columnX[index]!,
                R1_Y + 38 + matrix.layout.rowY[1]!,
              ),
              0.85,
              easeInOutCubic,
            ),
            cell.opacity(0, 0.85),
          ),
        ),
        aimRing.opacity(0, 0.5),
      );
      yield* waitFor(0.7);
    },

    *payoff() {
      yield* all(
        matrix.node.opacity(0, 0.5),
        rowLabel1.opacity(0, 0.5),
        rowLabel2.opacity(0, 0.5),
        pivotRing.opacity(0, 0.5),
        dimTo(scratchCells, 0, 0.5),
        dimTo(workRow, 0, 0.5),
        minusSign.opacity(0, 0.5),
        rule.opacity(0, 0.5),
        scratchTag.opacity(0, 0.5),
      );
      yield* payoff.opacity(1, 0.7);
      yield* all(dot.size(30, 0.4), dotLabel.scale(1.1, 0.4));
      yield* all(dot.size(20, 0.35), dotLabel.scale(1, 0.35));
      yield* waitFor(1.6);
    },
  };

  yield* runCandidateBeats("longhand", bodies);
});
