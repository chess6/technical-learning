import { Circle, Latex, Line, Node, Rect, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import type { AugmentedRow } from "../../math";
import {
  ELIMINATION_COLUMNS as COLUMNS,
  ELIMINATION_FACTOR as FACTOR,
  ELIMINATION_MULTIPLIER as MULTIPLIER,
  ELIMINATION_SOLUTION as SOLUTION,
  NEW_R2,
  R1,
  R2,
  SCALED_R1,
  assertEliminationMathIsConsistent,
  displayedEquation,
  displayedRow,
  rowAtAlpha,
  texEquation as equation,
  texNumber as num,
} from "./eliminationRows";
import { ELIMINATION_BEATS, ELIMINATION_SEGMENTS } from "./sceneTimings";
import { ROLE, runSegment } from "./sceneKit";

/**
 * "Elimination" Watch scene — one row operation, done longhand and then watched
 * happen to the picture.
 *
 * This composition came out of the animation design experiment in
 * `src/benchmark-lab/experiments/` (see the benchmark-lab README): three
 * candidate clips were built and compared, and the accepted direction is the
 * arithmetic spine of "Longhand" followed by the geometric payoff of "Pivot".
 *
 * The two halves answer the two different questions a learner has:
 *
 *  1. **Where do the new numbers come from?** R₂ itself drops out of the
 *     bracket — leaving a translucent record of where it was, so the working is
 *     done ON the row rather than on a duplicate — a copy of R₁ lands beneath
 *     it, is doubled, and the three columns are subtracted one at a time. The
 *     computed row then travels back into the slot R₂ left.
 *  2. **What did that do, and why was it allowed?** The frame reframes, the two
 *     original constraints appear as lines crossing at (2, −1), and the new row
 *     is reached by rotating R₂'s line about that crossing until it is
 *     horizontal. A horizontal line is exactly one whose equation has no x left,
 *     which is what "eliminate x" means geometrically.
 *
 * Two rules the previous version broke, and this one does not:
 *
 *  - **No coefficient is ever interpolated.** The old scene tweened R₂'s three
 *    numbers from their old values to their new ones, so for ~2.6 s the frame
 *    read `1.87x − 1.38y = 5.13` — an equation nobody wrote. Every number here
 *    is typeset once, in place.
 *  - **The augmented matrix is a real one**, with drawn brackets, an
 *    augmentation rule, and one addressable node per entry — not a monospaced
 *    string of `[`, `|`, `]` characters, which cannot align and whose entries
 *    have no identity.
 *
 * The line sweep IS mathematically honest: every intermediate is `R₂ + α·R₁`
 * for some α between 0 and −2, which is itself a legal row operation's result,
 * so every intermediate line is a real constraint through the solution. The
 * equation label is re-typeset at whole stops, never interpolated.
 *
 * All numbers come from `src/math`: the system, the operation, its factor, the
 * scaled row, and the result. `assertSceneMathIsConsistent` re-checks the
 * relationships the choreography depends on before a frame renders.
 */

const SCENE_ID = "elimination";

/* ------------------------------------------------------------ typography */

/**
 * Every symbol in this scene is typeset through `Latex`, which renders via the
 * bundled MathJax to SVG paths: real italic variables, real minus signs, real
 * scaled brackets, and no webfont that could silently fall back to a system
 * sans face. The design experiment established this; the surrounding lesson UI
 * keeps the product type.
 */
const INK = "#e9eef6";
const INK_MUTED = "#8b97a8";
const INK_FAINT = "#3a4351";
const SCRATCH = "#d99a5b";

function tex(
  value: Parameters<typeof Latex.prototype.tex>[0] | (() => string),
  size: number,
  fill: string = INK,
  key?: string,
): Latex {
  return new Latex({ key, tex: value as never, fontSize: size, fill });
}

/* --------------------------------------------------------------- layout */

/** Matrix column centres and row heights, shared by the matrix and the working. */
const COL_X = [-104, -18, 96] as const;
const MATRIX_ROW_Y = [-34, 34] as const;
const MATRIX_HALF_W = 168;
const MATRIX_HALF_H = 74;

/** Where the matrix sits while the algebra has the frame, and afterwards. */
const MATRIX_HOME = new Vector2(20, -132);
const MATRIX_PARKED = new Vector2(-296, -150);
const MATRIX_PARKED_SCALE = 0.66;

/** The working area, below the matrix. */
const WORK_MINUEND_Y = 16;
const WORK_SCALED_Y = 86;
const WORK_RULE_Y = 134;
const WORK_RESULT_Y = 184;
// Clear of the stage edge: a 34px note centred lower than this loses its
// descenders off the bottom of the frame.
const WORK_NOTE_Y = 240;

/** The plane, once the geometry takes over. */
// Sized so an equation label attached to either end of the moving line —
// the steep one at α = 0 and the horizontal one at α = −2 — still lands inside
// the stage. A wider plot pushes the α = 0 label off the right edge.
const PLANE_ORIGIN = new Vector2(40, 34);
const PLANE_SCALE = 68;
const PLANE_X: readonly [number, number] = [-2, 3.4];
const PLANE_Y: readonly [number, number] = [-2.4, 1.6];
const toPlane = (point: readonly [number, number]): Vector2 =>
  new Vector2(
    PLANE_ORIGIN.x + point[0] * PLANE_SCALE,
    PLANE_ORIGIN.y - point[1] * PLANE_SCALE,
  );

/** `a x + b y = c` clipped to the plotted box; handles the horizontal case. */
function clipLine(row: AugmentedRow): [Vector2, Vector2] {
  const [a, b, c] = row;
  const hits: [number, number][] = [];
  if (Math.abs(b) > 1e-9) {
    for (const x of PLANE_X) {
      const y = (c - a * x) / b;
      if (y >= PLANE_Y[0] - 1e-6 && y <= PLANE_Y[1] + 1e-6) hits.push([x, y]);
    }
  }
  if (Math.abs(a) > 1e-9) {
    for (const y of PLANE_Y) {
      const x = (c - b * y) / a;
      if (x >= PLANE_X[0] - 1e-6 && x <= PLANE_X[1] + 1e-6) hits.push([x, y]);
    }
  }
  const distinct: [number, number][] = [];
  for (const point of hits) {
    if (
      !distinct.some(
        (other) => Math.hypot(other[0] - point[0], other[1] - point[1]) < 1e-6,
      )
    ) {
      distinct.push(point);
    }
  }
  return [toPlane(distinct[0] ?? [0, 0]), toPlane(distinct[1] ?? [0, 0])];
}

export const eliminationScene = makeScene2D(function* (view) {
  assertEliminationMathIsConsistent();
  view.fill(ROLE.background);

  const B = ELIMINATION_BEATS;

  /* ----------------------------------------------------------- equations */
  const eq1 = tex(equation(R1), 48, ROLE.basis1);
  eq1.position(new Vector2(0, -52));
  eq1.opacity(0);
  view.add(eq1);
  const eq2 = tex(equation(R2), 48, ROLE.basis2);
  eq2.position(new Vector2(0, 34));
  eq2.opacity(0);
  view.add(eq2);

  /* ------------------------------------------------------ the matrix group */
  // One group, moved and scaled once. The matrix never disappears and comes
  // back: it is the same object through the whole clip, which is what lets the
  // geometry half refer to rows the learner can still read.
  const matrixGroup = new Node({
    key: "semantic:elimination:matrix",
    position: MATRIX_HOME,
    opacity: 0,
  });
  view.add(matrixGroup);

  const brackets = new Node({});
  for (const side of [-1, 1] as const) {
    const x = side * MATRIX_HALF_W;
    brackets.add(
      new Line({
        stroke: INK,
        lineWidth: 3,
        lineCap: "square",
        points: [
          new Vector2(x - side * 18, -MATRIX_HALF_H),
          new Vector2(x, -MATRIX_HALF_H),
          new Vector2(x, MATRIX_HALF_H),
          new Vector2(x - side * 18, MATRIX_HALF_H),
        ],
      }),
    );
  }
  matrixGroup.add(brackets);

  // The augmentation divider is what makes this an augmented matrix rather
  // than a 2×3 one. Drawing it is not decoration.
  const divider = new Line({
    stroke: INK_MUTED,
    lineWidth: 2,
    points: [
      new Vector2(38, -MATRIX_HALF_H + 10),
      new Vector2(38, MATRIX_HALF_H - 10),
    ],
  });
  matrixGroup.add(divider);

  const row1Cells = R1.map((value, index) => {
    const cell = tex(num(value), 46, ROLE.basis1);
    cell.position(new Vector2(COL_X[index]!, MATRIX_ROW_Y[0]!));
    matrixGroup.add(cell);
    return cell;
  });

  /**
   * R₂'s entries — the objects that will travel. They are children of the
   * matrix group so they park with it, and they are moved in group-local
   * coordinates when they drop out of the bracket.
   */
  const row2Cells = R2.map((value, index) => {
    const cell = tex(
      num(value),
      46,
      ROLE.basis2,
      `semantic:elimination:row-2-entry-${index}`,
    );
    cell.position(new Vector2(COL_X[index]!, MATRIX_ROW_Y[1]!));
    matrixGroup.add(cell);
    return cell;
  });

  /**
   * The translucent record of where R₂ was. Revealed as R₂ leaves, so the
   * bracket is never drawn with an empty second row, and the learner can still
   * read the values being worked on.
   */
  const ghostCells = R2.map((value, index) => {
    const cell = tex(num(value), 46, ROLE.basis2);
    cell.position(new Vector2(COL_X[index]!, MATRIX_ROW_Y[1]!));
    cell.opacity(0);
    matrixGroup.add(cell);
    return cell;
  });

  const label1 = tex("R_1", 34, ROLE.basis1);
  label1.position(new Vector2(-MATRIX_HALF_W - 74, MATRIX_ROW_Y[0]!));
  label1.opacity(0);
  matrixGroup.add(label1);
  const label2 = tex("R_2", 34, ROLE.basis2);
  label2.position(new Vector2(-MATRIX_HALF_W - 74, MATRIX_ROW_Y[1]!));
  label2.opacity(0);
  matrixGroup.add(label2);

  /* ------------------------------------------------------------ the aim */
  const pivotRing = new Circle({
    size: 62,
    stroke: ROLE.basis1,
    lineWidth: 3,
    opacity: 0,
    position: new Vector2(COL_X[0]!, MATRIX_ROW_Y[0]!),
  });
  matrixGroup.add(pivotRing);
  const targetRing = new Circle({
    size: 62,
    stroke: ROLE.target,
    lineWidth: 3,
    opacity: 0,
    position: new Vector2(COL_X[0]!, MATRIX_ROW_Y[1]!),
  });
  matrixGroup.add(targetRing);

  const aimNote = tex(`\\text{we want a } 0 \\text{ here}`, 30, ROLE.target);
  aimNote.position(new Vector2(MATRIX_HOME.x + COL_X[0]! - 4, MATRIX_HOME.y + 128));
  aimNote.opacity(0);
  view.add(aimNote);

  /* -------------------------------------------------------- the working */
  const opLabel = tex(
    `R_2 \\leftarrow R_2 - ${MULTIPLIER}\\,R_1`,
    36,
    INK,
  );
  opLabel.position(new Vector2(300, -226));
  opLabel.opacity(0);
  view.add(opLabel);

  /** The copy of R₁ that becomes 2·R₁. R₁ itself never moves — it is the tool. */
  const scaledCells = R1.map((value, index) => {
    const cell = tex(
      num(value),
      46,
      SCRATCH,
      `semantic:elimination:scaled-entry-${index}`,
    );
    cell.position(
      new Vector2(MATRIX_HOME.x + COL_X[index]!, MATRIX_HOME.y + MATRIX_ROW_Y[0]!),
    );
    cell.opacity(0);
    view.add(cell);
    return cell;
  });

  const minusSign = tex("-", 46, INK_MUTED);
  minusSign.position(new Vector2(MATRIX_HOME.x + COL_X[0]! - 196, WORK_SCALED_Y));
  minusSign.opacity(0);
  view.add(minusSign);
  const scaledTag = tex(`${MULTIPLIER}\\,R_1`, 34, SCRATCH);
  scaledTag.position(new Vector2(MATRIX_HOME.x + COL_X[0]! - 126, WORK_SCALED_Y));
  scaledTag.opacity(0);
  view.add(scaledTag);

  const rule = new Line({
    stroke: INK,
    lineWidth: 3,
    opacity: 0,
    points: [
      new Vector2(MATRIX_HOME.x + COL_X[0]! - 210, WORK_RULE_Y),
      new Vector2(MATRIX_HOME.x + COL_X[2]! + 72, WORK_RULE_Y),
    ],
  });
  view.add(rule);

  /** Each result, typeset once when its column is computed. */
  const resultCells = COLUMNS.map((column, index) => {
    const cell = tex(
      num(column.result),
      50,
      column.isTarget ? ROLE.target : INK,
      `semantic:elimination:result-entry-${index}`,
    );
    cell.position(new Vector2(MATRIX_HOME.x + COL_X[index]!, WORK_RESULT_Y));
    cell.opacity(0);
    view.add(cell);
    return cell;
  });

  /** The working for one column, e.g. `5 - (-2) = 7`. */
  const columnNote = tex("", 34, INK_MUTED);
  columnNote.position(new Vector2(MATRIX_HOME.x + COL_X[1]!, WORK_NOTE_Y));
  columnNote.opacity(0);
  view.add(columnNote);

  const cancelNote = tex("\\text{no } x \\text{ left}", 32, ROLE.target);
  cancelNote.position(new Vector2(MATRIX_HOME.x + COL_X[0]! - 10, WORK_NOTE_Y));
  cancelNote.opacity(0);
  view.add(cancelNote);

  /* ---------------------------------------------------------- the plane */
  const plane = new Node({ opacity: 0 });
  view.add(plane);
  for (let x = PLANE_X[0]; x <= PLANE_X[1]; x += 1) {
    plane.add(
      new Line({
        stroke: x === 0 ? INK_MUTED : INK_FAINT,
        lineWidth: x === 0 ? 2 : 1,
        points: [toPlane([x, PLANE_Y[0]]), toPlane([x, PLANE_Y[1]])],
      }),
    );
  }
  for (let y = Math.ceil(PLANE_Y[0]); y <= PLANE_Y[1]; y += 1) {
    plane.add(
      new Line({
        stroke: y === 0 ? INK_MUTED : INK_FAINT,
        lineWidth: y === 0 ? 2 : 1,
        points: [toPlane([PLANE_X[0], y]), toPlane([PLANE_X[1], y])],
      }),
    );
  }
  for (const x of [-1, 1, 2, 3]) {
    plane.add(
      new Line({
        stroke: INK_MUTED,
        lineWidth: 2,
        points: [
          toPlane([x, 0]).add(new Vector2(0, -6)),
          toPlane([x, 0]).add(new Vector2(0, 6)),
        ],
      }),
    );
    const numeral = tex(num(x), 24, INK_MUTED);
    numeral.position(toPlane([x, 0]).add(new Vector2(0, 26)));
    plane.add(numeral);
  }
  for (const y of [-2, -1, 1]) {
    const numeral = tex(num(y), 24, INK_MUTED);
    numeral.position(toPlane([0, y]).add(new Vector2(-26, 0)));
    plane.add(numeral);
  }

  const line1 = new Line({
    key: "semantic:elimination:row-1-line",
    stroke: ROLE.basis1,
    lineWidth: 5,
    points: clipLine(R1),
    opacity: 0,
  });
  view.add(line1);

  /**
   * α drives R₂'s line. Every value in [−2, 0] gives a genuine constraint
   * through the crossing, so the sweep walks the pencil rather than dissolving
   * between two unrelated pictures.
   */
  const alpha = createSignal(0);
  const line2 = new Line({
    key: "semantic:elimination:row-2-line",
    stroke: ROLE.basis2,
    lineWidth: 5,
    points: () => clipLine(rowAtAlpha(alpha())),
    opacity: 0,
  });
  view.add(line2);

  /** R₁'s equation, parked beside the end of its own line. */
  const lineLabel1 = tex(equation(R1), 32, ROLE.basis1);
  lineLabel1.position(clipLine(R1)[0].add(new Vector2(-118, 44)));
  lineLabel1.opacity(0);
  view.add(lineLabel1);

  const ghostLine2 = new Line({
    stroke: ROLE.basis2,
    lineWidth: 2.5,
    lineDash: [10, 10],
    points: clipLine(R2),
    opacity: 0,
  });
  view.add(ghostLine2);

  /**
   * Which of the two writable rows the label is currently naming.
   *
   * Deliberately NOT `alpha`. The line's motion is continuous and honest, but
   * the algebra is not: the sweep passes through rows like `1.5x − 2.5y = 3`,
   * which are true constraints nobody writes. The label reads a whole stop
   * through `displayedEquation`, which throws on anything in between — so
   * wiring it back to the tween fails loudly instead of ticking.
   */
  const labelStop = createSignal(0);

  /** The equation rides at the line's end: it is the line's name, not a panel. */
  const lineLabel2 = tex(() => displayedEquation(labelStop()), 32, ROLE.basis2);
  lineLabel2.position(() =>
    clipLine(displayedRow(labelStop()))[1].add(new Vector2(84, -22)),
  );
  lineLabel2.opacity(0);
  view.add(lineLabel2);

  const solutionDot = new Circle({
    key: "semantic:elimination:solution",
    size: 20,
    fill: ROLE.selected,
    position: toPlane([SOLUTION[0]!, SOLUTION[1]!]),
    opacity: 0,
  });
  view.add(solutionDot);

  // The crossing label is, by construction, on the busiest ink in the frame;
  // a plate keeps it legible wherever the mathematics puts it.
  const crossing = new Node({ opacity: 0 });
  crossing.position(toPlane([SOLUTION[0]!, SOLUTION[1]!]).add(new Vector2(-6, 56)));
  crossing.add(
    new Rect({
      width: 150,
      height: 50,
      radius: 8,
      fill: ROLE.background,
      opacity: 0.82,
    }),
  );
  crossing.add(
    tex(`(${num(SOLUTION[0]!)},\\, ${num(SOLUTION[1]!)})`, 32, ROLE.selected),
  );
  view.add(crossing);

  /* ------------------------------------------------------- closing notes */
  // The strip must sit INSIDE the stage: the top edge is y = −270, so a band
  // centred lower than that loses its text off the frame entirely.
  const banner = new Rect({
    width: 1280,
    height: 78,
    y: -234,
    fill: "#05080d",
    opacity: 0,
  });
  view.add(banner);
  const bannerText = tex("", 34, INK);
  bannerText.position(new Vector2(0, -236));
  bannerText.opacity(0);
  view.add(bannerText);

  const note = tex("", 30, INK_MUTED);
  note.position(new Vector2(60, 244));
  note.opacity(0);
  view.add(note);

  // Two short lines rather than one aligned block: the block's natural width
  // ran off the left edge and straight across the plot.
  const readY = tex("", 30, ROLE.selected);
  readY.position(new Vector2(-292, 122));
  readY.opacity(0);
  view.add(readY);
  const readX = tex("", 30, ROLE.selected);
  readX.position(new Vector2(-292, 172));
  readX.opacity(0);
  view.add(readX);

  /* ---------------------------------------------------------- the beats */

  const fadeAll = (
    nodes: readonly { opacity: (value: number, duration?: number) => unknown }[],
    value: number,
    duration: number,
  ): ThreadGenerator =>
    all(...nodes.map((node) => node.opacity(value, duration) as ThreadGenerator));

  /** One column of the longhand subtraction. */
  function* subtractColumn(
    index: number,
    beats: { focus: number; show: number; wait: number; result: number; clear: number },
  ): ThreadGenerator {
    const column = COLUMNS[index]!;
    yield* all(
      fadeAll(
        row2Cells.filter((_, i) => i !== index),
        0.3,
        beats.focus,
      ),
      fadeAll(
        scaledCells.filter((_, i) => i !== index),
        0.3,
        beats.focus,
      ),
      row2Cells[index]!.opacity(1, beats.focus),
      scaledCells[index]!.opacity(1, beats.focus),
    );
    const subtrahend =
      column.subtrahend < 0
        ? `(${num(column.subtrahend)})`
        : num(column.subtrahend);
    columnNote.tex(
      `${num(column.minuend)} - ${subtrahend} = ${num(column.result)}`,
    );
    yield* columnNote.opacity(1, beats.show);
    yield* waitFor(beats.wait);
    yield* resultCells[index]!.opacity(1, beats.result);
    return;
  }

  const bodies: Record<string, () => ThreadGenerator> = {
    *system() {
      const b = B.system!;
      yield* eq1.opacity(1, b.first!);
      yield* waitFor(b.gap!);
      yield* eq2.opacity(1, b.second!);
      yield* waitFor(b.hold!);
    },

    *matrix() {
      const b = B.matrix!;
      // The equations retire and the matrix is built where they were: the same
      // six numbers, now packed so a whole equation is one row and one move.
      yield* all(eq1.opacity(0, b.retire!), eq2.opacity(0, b.retire!));
      matrixGroup.opacity(1);
      brackets.opacity(0);
      divider.opacity(0);
      yield* all(brackets.opacity(1, b.brackets!), divider.opacity(1, b.brackets!));
      yield* all(
        ...row1Cells.map((cell) => cell.opacity(1, b.entries!)),
        ...row2Cells.map((cell) => cell.opacity(1, b.entries!)),
      );
      yield* all(label1.opacity(1, b.labels!), label2.opacity(1, b.labels!));
      yield* waitFor(b.hold!);
    },

    *aim() {
      const b = B.aim!;
      // Snap-free: the rings grow in, the note follows. Scrubbing here lands on
      // the pivot already marked, which is what the chapter is about.
      yield* pivotRing.opacity(0.9, b.pivot!);
      yield* targetRing.opacity(1, b.target!);
      yield* all(aimNote.opacity(1, b.note!), opLabel.opacity(1, b.note!));
      yield* waitFor(b.hold!);
    },

    *detach() {
      const b = B.detach!;
      // Everything that is not the operation steps back, so the row that moves
      // is the only thing at full strength.
      yield* all(
        fadeAll(row1Cells, 0.42, b.dim!),
        label1.opacity(0.42, b.dim!),
        label2.opacity(0.42, b.dim!),
        brackets.opacity(0.42, b.dim!),
        divider.opacity(0.42, b.dim!),
        pivotRing.opacity(0.3, b.dim!),
        aimNote.opacity(0, b.dim!),
        targetRing.opacity(0.5, b.dim!),
      );
      // R₂ ITSELF leaves the bracket — it is not duplicated. The cells are
      // children of the matrix group, so the drop is in group-local space.
      yield* all(
        ...row2Cells.map((cell) =>
          cell.position(
            new Vector2(
              COL_X[row2Cells.indexOf(cell)]!,
              WORK_MINUEND_Y - MATRIX_HOME.y,
            ),
            b.drop!,
            easeInOutCubic,
          ),
        ),
      );
      // …and the record of where it was appears in the slot it vacated.
      yield* all(...ghostCells.map((cell) => cell.opacity(0.3, b.ghost!)));
      yield* waitFor(b.hold!);
    },

    *scale() {
      const b = B.scale!;
      // A copy of R₁ travels down. R₁ itself never moves: its permanence is
      // the point — it is the tool the operation is performed with.
      yield* all(
        ...scaledCells.map((cell, index) =>
          all(
            cell.opacity(1, b.copy! * 0.4),
            cell.position(
              new Vector2(MATRIX_HOME.x + COL_X[index]!, WORK_SCALED_Y),
              b.copy!,
              easeInOutCubic,
            ),
          ),
        ),
      );
      yield* minusSign.opacity(0.9, b.minus!);
      yield* rule.opacity(1, b.rule!);
      yield* waitFor(b.hold!);
    },

    *double() {
      const b = B.double!;
      const tag = tex(`\\times ${MULTIPLIER}`, 32, SCRATCH);
      tag.position(new Vector2(MATRIX_HOME.x + COL_X[2]! + 150, WORK_SCALED_Y));
      tag.opacity(0);
      view.add(tag);
      yield* all(tag.opacity(1, b.tag!), scaledTag.opacity(1, b.tag!));
      // Each entry is REPLACED, not interpolated: 1 → 2, 3 → 6, −1 → −2. An
      // interpolated coefficient shows numbers that were never anybody's row.
      for (const [index, key] of (["e0", "e1", "e2"] as const).entries()) {
        const cell = scaledCells[index]!;
        yield* cell.opacity(0.12, b[key]! * 0.4);
        cell.tex(num(SCALED_R1[index]!));
        yield* cell.opacity(1, b[key]! * 0.6);
      }
      yield* tag.opacity(0, b.tagOut!);
      yield* waitFor(b.hold!);
    },

    *subtract() {
      const b = B.subtract!;
      yield* subtractColumn(0, {
        focus: b.c0Focus!,
        show: b.c0Show!,
        wait: b.c0Wait!,
        result: b.c0Result!,
        clear: b.c0Clear!,
      });
      // The cancellation is the whole reason for the operation, so it is the
      // only thing in the beat that gets emphasis.
      yield* all(
        cancelNote.opacity(1, b.c0Cancel!),
        resultCells[0]!.scale(1.25, b.c0Cancel!),
      );
      yield* all(
        resultCells[0]!.scale(1, b.c0Settle!),
        cancelNote.opacity(0, b.c0Settle!),
      );
      yield* columnNote.opacity(0, b.c0Clear!);

      yield* subtractColumn(1, {
        focus: b.c1Focus!,
        show: b.c1Show!,
        wait: b.c1Wait!,
        result: b.c1Result!,
        clear: b.c1Clear!,
      });
      yield* columnNote.opacity(0, b.c1Clear!);

      yield* subtractColumn(2, {
        focus: b.c2Focus!,
        show: b.c2Show!,
        wait: b.c2Wait!,
        result: b.c2Result!,
        clear: b.c2Clear!,
      });
      yield* columnNote.opacity(0, b.c2Clear!);

      yield* all(fadeAll(row2Cells, 1, b.restore!), fadeAll(scaledCells, 1, b.restore!));
      yield* waitFor(b.hold!);
    },

    *promote() {
      const b = B.promote!;
      // The working steps back and the computed row travels into the slot R₂
      // left; the translucent record resolves into it as it lands.
      yield* all(
        fadeAll(row2Cells, 0.18, b.fade!),
        fadeAll(scaledCells, 0.18, b.fade!),
        minusSign.opacity(0.18, b.fade!),
        scaledTag.opacity(0.18, b.fade!),
        rule.opacity(0.2, b.fade!),
        targetRing.opacity(0, b.fade!),
        pivotRing.opacity(0, b.fade!),
      );
      for (const [index, cell] of ghostCells.entries()) {
        cell.tex(num(NEW_R2[index]!));
      }
      yield* all(
        ...resultCells.map((cell, index) =>
          all(
            cell.position(
              new Vector2(
                MATRIX_HOME.x + COL_X[index]!,
                MATRIX_HOME.y + MATRIX_ROW_Y[1]!,
              ),
              b.travel!,
              easeInOutCubic,
            ),
            cell.opacity(0, b.travel!),
          ),
        ),
        ...ghostCells.map((cell) => cell.opacity(1, b.travel!)),
      );
      yield* all(
        fadeAll(row1Cells, 1, b.settle!),
        label1.opacity(1, b.settle!),
        label2.opacity(1, b.settle!),
        brackets.opacity(1, b.settle!),
        divider.opacity(1, b.settle!),
      );
      yield* waitFor(b.hold!);
    },

    *plane() {
      const b = B.plane!;
      // Camera-style reframe: the matrix keeps its identity and parks, so the
      // geometry half can refer to rows the learner can still read — including
      // R₂'s original values, which the working leaves behind.
      yield* all(
        matrixGroup.position(MATRIX_PARKED, b.reframe!, easeInOutCubic),
        matrixGroup.scale(MATRIX_PARKED_SCALE, b.reframe!, easeInOutCubic),
        fadeAll(row2Cells, 0.4, b.reframe!),
        ...row2Cells.map((cell, index) =>
          cell.position(
            new Vector2(COL_X[index]!, MATRIX_ROW_Y[1]! + 118),
            b.reframe!,
            easeInOutCubic,
          ),
        ),
        fadeAll(scaledCells, 0, b.reframe!),
        minusSign.opacity(0, b.reframe!),
        scaledTag.opacity(0, b.reframe!),
        rule.opacity(0, b.reframe!),
        opLabel.position(new Vector2(300, -166), b.reframe!),
      );
      yield* plane.opacity(1, b.grid!);
      note.tex("\\text{the two rows, drawn}");
      yield* all(
        line1.opacity(1, b.lines!),
        line2.opacity(1, b.lines!),
        lineLabel1.opacity(1, b.lines!),
        lineLabel2.opacity(1, b.lines!),
        note.opacity(1, b.lines!),
      );
      yield* all(solutionDot.opacity(1, b.dot!), crossing.opacity(1, b.dot!));
      yield* solutionDot.size(32, b.dotUp!);
      yield* solutionDot.size(20, b.dotDown!);
      yield* waitFor(b.hold!);
    },

    *predict() {
      const b = B.predict!;
      // Every object the answer depends on stays up: both rows, the new row in
      // the bracket, both lines, and the crossing. A blanked stage would make
      // this a guess.
      bannerText.tex("\\text{Can that operation move the crossing?}");
      yield* all(
        banner.opacity(0.94, b.ask!),
        bannerText.opacity(1, b.ask!),
        note.opacity(0, b.ask!),
      );
      yield* waitFor(b.think!);
    },

    *pivot() {
      const b = B.pivot!;
      // The label goes down with the banner: while the line is between two
      // writable rows there is no equation to show, and showing the one it has
      // left would name a line it is no longer on.
      yield* all(
        banner.opacity(0, b.ghost!),
        bannerText.opacity(0, b.ghost!),
        ghostLine2.opacity(0.5, b.ghost!),
        lineLabel2.opacity(0, b.ghost!),
      );
      // The sweep walks the pencil R₂ + α·R₁ — continuous geometry, and every
      // intermediate is a real constraint through the crossing.
      yield* alpha(FACTOR, b.sweep!, easeInOutCubic);
      // Landed. NOW the exact final equation is written, at its stop.
      labelStop(1);
      yield* lineLabel2.opacity(1, b.relabel!);
      note.tex("\\text{horizontal — its equation has no } x \\text{ left}");
      yield* all(note.opacity(1, b.settle!), line2.lineWidth(8, b.settle!));
      yield* line2.lineWidth(5, b.emphasis!);
      yield* waitFor(b.hold!);
    },

    *read() {
      const b = B.read!;
      readY.tex(`${equation(NEW_R2)} \\;\\Rightarrow\\; y = ${num(SOLUTION[1]!)}`);
      readX.tex(`${equation(R1)} \\;\\Rightarrow\\; x = ${num(SOLUTION[0]!)}`);
      yield* all(readY.opacity(1, b.yOut!), note.opacity(0, b.yOut!));
      yield* waitFor(b.hold!);
      yield* readX.opacity(1, b.xOut!);
      yield* waitFor(b.hold2!);
      note.tex("\\text{same crossing, easier second row}");
      yield* all(note.opacity(1, b.back!), solutionDot.size(30, b.back!));
      yield* solutionDot.size(20, b.settle!);
      yield* waitFor(b.hold3!);
    },
  };

  for (const segment of ELIMINATION_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
