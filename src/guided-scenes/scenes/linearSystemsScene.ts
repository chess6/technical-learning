import { Circle, Line, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { LINEAR_SYSTEM_EXAMPLE } from "../../lessons/exampleData";
import type { Vector2 as MathVector2 } from "../../math";
import { SYSTEMS_SEGMENTS } from "./sceneTimings";
import {
  ROLE,
  focusOpacities,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * "Linear Systems" Watch scene — solving `A x = b` seen as two pictures.
 *
 * One conceptual change at a time: the row picture (two lines meeting) is built
 * first, then the SAME numbers are regrouped into the column picture (combine
 * the columns to reach b), then the no / one / infinitely-many trichotomy is
 * walked in whichever picture reads it fastest. All numbers are Lesson 1's:
 * the independent columns are the basis (v, w); the dependent columns are the
 * pair (v, 2v); the targets are Lesson 1's q and r.
 *
 * A smaller local scale (than the shared SCALE) is used because the target
 * b = (-1, 5) reaches farther than the usual ±4 teaching grid.
 */

const EX = LINEAR_SYSTEM_EXAMPLE;
const SCALE_S = 30;
const EXT = 6;

const px = (p: MathVector2): Vector2 => new Vector2(p[0] * SCALE_S, -p[1] * SCALE_S);

/**
 * The segment of the line `a·x + b·y = c` clipped to the box [-ext, ext]².
 * Returns two boundary crossings so we never draw a line thousands of pixels
 * offstage. Every line in this scene crosses the box.
 */
function lineBoxPoints(
  a: number,
  b: number,
  c: number,
  ext: number,
): [MathVector2, MathVector2] {
  const pts: MathVector2[] = [];
  const inRange = (t: number) => t >= -ext - 1e-6 && t <= ext + 1e-6;
  if (Math.abs(b) > 1e-9) {
    for (const x of [-ext, ext]) {
      const y = (c - a * x) / b;
      if (inRange(y)) pts.push([x, y]);
    }
  }
  if (Math.abs(a) > 1e-9) {
    for (const y of [-ext, ext]) {
      const x = (c - b * y) / a;
      if (inRange(x)) pts.push([x, y]);
    }
  }
  const distinct: MathVector2[] = [];
  for (const p of pts) {
    if (!distinct.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-6)) {
      distinct.push(p);
    }
  }
  if (distinct.length >= 2) return [distinct[0]!, distinct[1]!];
  // Degenerate fallback (should not happen for these examples).
  return [
    [-ext, 0],
    [ext, 0],
  ];
}

export const linearSystemsScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  // Live system: matrix entries + target. Start at the independent example.
  const a11 = createSignal(EX.a[0][0]);
  const a12 = createSignal(EX.a[0][1]);
  const a21 = createSignal(EX.a[1][0]);
  const a22 = createSignal(EX.a[1][1]);
  const b1 = createSignal(EX.b[0]);
  const b2 = createSignal(EX.b[1]);
  // Trial coefficients for the column-picture combination.
  const cx = createSignal(0);
  const cy = createSignal(0);

  const col1 = (): MathVector2 => [a11(), a21()];
  const col2 = (): MathVector2 => [a12(), a22()];
  const scaledCol1 = (): MathVector2 => [cx() * a11(), cx() * a21()];
  const combo = (): MathVector2 => [
    cx() * a11() + cy() * a12(),
    cx() * a21() + cy() * a22(),
  ];

  // --- Static reference grid + axes (subdued) ---
  const grid = new Line({ points: [], stroke: ROLE.grid, lineWidth: 1 });
  view.add(grid);
  for (let k = -EXT; k <= EXT; k += 1) {
    const isAxis = k === 0;
    view.add(
      new Line({
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        opacity: 0.4,
        points: [px([k, -EXT]), px([k, EXT])],
      }),
    );
    view.add(
      new Line({
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        opacity: 0.4,
        points: [px([-EXT, k]), px([EXT, k])],
      }),
    );
  }
  const origin = new Circle({ size: 10, fill: ROLE.text, opacity: 0.8 });
  view.add(origin);

  // --- Row picture: two lines ---
  const line1 = makeSegment(ROLE.original, 4);
  line1.points(() => {
    const [p, q] = lineBoxPoints(a11(), a12(), b1(), EXT);
    return [px(p), px(q)];
  });
  line1.opacity(0);
  const line2 = makeSegment(ROLE.transformed, 4);
  line2.points(() => {
    const [p, q] = lineBoxPoints(a21(), a22(), b2(), EXT);
    return [px(p), px(q)];
  });
  line2.opacity(0);
  view.add(line1);
  view.add(line2);

  const solutionDot = new Circle({ size: 20, fill: ROLE.selected, opacity: 0 });
  solutionDot.position(() => px([EX.solution[0], EX.solution[1]]));
  view.add(solutionDot);

  // --- Column picture: column arrows, scaled combination, target b ---
  const scaled1 = makeArrow(ROLE.basis1, 5);
  scaled1.lineDash([10, 8]);
  scaled1.points(() => [px([0, 0]), px(scaledCol1())]);
  scaled1.opacity(0);
  const scaled2 = makeArrow(ROLE.basis2, 5);
  scaled2.lineDash([10, 8]);
  scaled2.points(() => [px(scaledCol1()), px(combo())]);
  scaled2.opacity(0);
  view.add(scaled1);
  view.add(scaled2);

  const arrow1 = makeArrow(ROLE.basis1, 6);
  arrow1.points(() => [px([0, 0]), px(col1())]);
  arrow1.opacity(0);
  const arrow2 = makeArrow(ROLE.basis2, 6);
  arrow2.points(() => [px([0, 0]), px(col2())]);
  arrow2.opacity(0);
  view.add(arrow1);
  view.add(arrow2);

  const comboDot = new Circle({ size: 18, fill: ROLE.result, opacity: 0 });
  comboDot.position(() => px(combo()));
  view.add(comboDot);

  const targetArrow = makeArrow(ROLE.selected, 5);
  targetArrow.points(() => [px([0, 0]), px([b1(), b2()])]);
  targetArrow.opacity(0);
  view.add(targetArrow);
  const targetLabel = makeLabel("b", ROLE.selected, 34);
  targetLabel.position(() => px([b1(), b2()]).add(new Vector2(20, -14)));
  targetLabel.opacity(0);
  view.add(targetLabel);

  // --- Overlay text ---
  const top = makeOverlayLabel("", ROLE.text, 38);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 30);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const setTop = (t: string) => top.text(t);
  const setCaption = (t: string) => caption.text(t);

  const seconds = Object.fromEntries(
    SYSTEMS_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  const showRow = function* (emphasis = 1): ThreadGenerator {
    yield* focusOpacities([
      { node: line1, opacity: emphasis },
      { node: line2, opacity: emphasis },
      { node: arrow1, opacity: 0 },
      { node: arrow2, opacity: 0 },
      { node: scaled1, opacity: 0 },
      { node: scaled2, opacity: 0 },
      { node: comboDot, opacity: 0 },
      { node: targetArrow, opacity: 0 },
      { node: targetLabel, opacity: 0 },
    ]);
  };

  const bodies: Record<string, () => ThreadGenerator> = {
    *equations() {
      setTop("A x = b");
      setCaption("x + 3y = −1     and     2x − y = 5");
      yield* all(top.opacity(1, 0.5), caption.opacity(1, 0.5));
      yield* waitFor(seconds.equations - 0.5);
    },
    *row() {
      setTop("Row picture");
      setCaption("Each equation is a line — the solution is where they cross");
      yield* all(line1.opacity(1, 0.6), line2.opacity(1, 0.6));
      yield* waitFor(1);
      yield* solutionDot.opacity(1, 0.4);
      yield* solutionDot.size(30, 0.3);
      yield* solutionDot.size(20, 0.3);
      setCaption("They meet once, at x = 2, y = −1");
      yield* waitFor(seconds.row - 3.6);
    },
    *regroup() {
      setTop("Same numbers, regrouped");
      setCaption("x·(1, 2) + y·(3, −1) = (−1, 5)");
      yield* all(
        solutionDot.opacity(0, 0.4),
        line1.opacity(0.14, 0.5),
        line2.opacity(0.14, 0.5),
        arrow1.opacity(1, 0.5),
        arrow2.opacity(1, 0.5),
        targetArrow.opacity(0.9, 0.5),
        targetLabel.opacity(1, 0.5),
      );
      yield* waitFor(seconds.regroup - 0.5);
    },
    *column() {
      setTop("Column picture");
      setCaption("Combine the columns to reach b");
      cx(0);
      cy(0);
      yield* all(scaled1.opacity(0.95, 0.4), comboDot.opacity(1, 0.4));
      yield* cx(EX.solution[0], 1.6, easeInOutCubic);
      yield* scaled2.opacity(0.95, 0.3);
      yield* cy(EX.solution[1], 1.6, easeInOutCubic);
      setCaption("2·col₁ − 1·col₂ lands exactly on b — same (2, −1)");
      yield* comboDot.size(26, 0.25);
      yield* comboDot.size(18, 0.25);
      yield* waitFor(seconds.column - 4.7);
    },
    *unique() {
      setTop("One solution");
      setCaption("Independent columns ⇒ one crossing, one recipe");
      yield* focusOpacities([
        { node: line1, opacity: 0.5 },
        { node: line2, opacity: 0.5 },
        { node: solutionDot, opacity: 0 },
      ]);
      yield* waitFor(seconds.unique - 0.35);
    },
    *infinite() {
      setTop("Infinitely many");
      setCaption("Dependent columns, b on their line: the two equations ARE one line");
      cx(0);
      cy(0);
      yield* showRow(1);
      yield* all(
        a11(EX.aDependent[0][0], 1.2, easeInOutCubic),
        a12(EX.aDependent[0][1], 1.2, easeInOutCubic),
        a21(EX.aDependent[1][0], 1.2, easeInOutCubic),
        a22(EX.aDependent[1][1], 1.2, easeInOutCubic),
        b1(EX.bInfinite[0], 1.2, easeInOutCubic),
        b2(EX.bInfinite[1], 1.2, easeInOutCubic),
      );
      setCaption("The lines coincide — every point on it solves the system");
      yield* line1.lineWidth(6, 0.3);
      yield* line1.lineWidth(4, 0.3);
      yield* waitFor(seconds.infinite - 2.4);
    },
    *none() {
      setTop("No solution");
      setCaption("Slide b off that line — the two lines become parallel");
      yield* all(
        b1(EX.bNone[0], 1.1, easeInOutCubic),
        b2(EX.bNone[1], 1.1, easeInOutCubic),
      );
      setCaption("Parallel lines never meet: b is unreachable by the columns");
      yield* waitFor(seconds.none - 1.1);
    },
    *summary() {
      setTop("Two pictures, one question");
      setCaption("A x = b is solvable ⇔ b lies in the span of A's columns");
      yield* all(line1.opacity(0.6, 0.5), line2.opacity(0.6, 0.5));
      yield* waitFor(seconds.summary - 0.5);
    },
  };

  for (const segment of SYSTEMS_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
