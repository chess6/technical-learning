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
import {
  classifyRowConstraint,
  matrixColumn,
  matrixVectorMultiply,
  scaleVector,
  type Matrix2x2,
  type Vector2 as MathVector2,
} from "../../math";
import { SYSTEMS_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  focusOpacities,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeSegment,
  runSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * "Linear Systems" Watch scene — solving `A x = b` seen as two pictures.
 *
 * One conceptual change at a time: the row picture (two lines meeting) is built
 * first, then the SAME numbers are regrouped into the column picture (combine
 * the columns to reach b), then the no / one / infinitely-many trichotomy is
 * walked. All numbers are Lesson 1's: the independent columns are the basis
 * (v, w); the dependent columns are the pair (v, 2v); the targets are Lesson 1's
 * q and r.
 *
 * COLOUR CONTRACT (July 2026 audit fix). The scene's whole job is keeping the
 * coefficient space and the output space apart, and it used to colour the
 * target `b` and the solution point the SAME gold — the one collision that
 * matters here. Now:
 *
 *   R1 / R2                 co-equal pair   → basis1 / basis2
 *   col₁ / col₂             co-equal pair   → basis1 / basis2 (never on screen
 *                                             with the rows; index 1 is always
 *                                             the greener one)
 *   the solution point      the invariant   → selected
 *   the target b            what we aim at  → target
 *   the running combination derived value   → result
 *
 * A smaller local scale (than the shared SCALE) is used because the target
 * b = (-1, 5) reaches farther than the usual ±4 teaching grid.
 */

const SCENE_ID = "linear-systems";

const EX = LINEAR_SYSTEM_EXAMPLE;
const SCALE_S = 30;
const EXT = 6;

const px = (p: MathVector2): Vector2 => new Vector2(p[0] * SCALE_S, -p[1] * SCALE_S);

/**
 * The segment of the equation `a·x + b·y = c` clipped to the box [-ext, ext]²,
 * or `null` when the equation is NOT a line.
 *
 * Whether the row is a genuine line is decided by the shared
 * `classifyRowConstraint` (the single source of truth): a zero row is `all`
 * (`0 = 0`, no constraint) or `empty` (`0 = c ≠ 0`, impossible) and must never
 * be drawn as a false line (e.g. a spurious x-axis). Only when it is a real
 * `line` do we clip it to two boundary crossings so we never draw a segment
 * thousands of pixels offstage. Every genuine line in this scene crosses the
 * box.
 */
function rowLineBoxPoints(
  a: number,
  b: number,
  c: number,
  ext: number,
): [MathVector2, MathVector2] | null {
  // Source of truth: is this row a line at all? A zero row is not.
  if (classifyRowConstraint(a, b, c).kind !== "line") return null;

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
  return distinct.length >= 2 ? [distinct[0]!, distinct[1]!] : null;
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

  // All column arithmetic flows through the shared src/math helpers — this scene
  // never re-packs a matrix or reimplements the column combination.
  const matrix = (): Matrix2x2 => [
    [a11(), a12()],
    [a21(), a22()],
  ];
  const col1 = (): MathVector2 => matrixColumn(matrix(), 0);
  const col2 = (): MathVector2 => matrixColumn(matrix(), 1);
  // x·col₁ is the matrix acting on (x, 0); equivalently the first column scaled.
  const scaledCol1 = (): MathVector2 => scaleVector(matrixColumn(matrix(), 0), cx());
  // The running combination x·col₁ + y·col₂ is exactly A·(x, y).
  const combo = (): MathVector2 => matrixVectorMultiply(matrix(), [cx(), cy()]);

  // --- Static reference grid + axes (subdued) ---
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

  // --- Row picture: two lines (a CO-EQUAL pair, so basis1 / basis2) ---
  const line1 = makeSegment(ROLE.basis1, 4);
  line1.points(() => {
    const seg = rowLineBoxPoints(a11(), a12(), b1(), EXT);
    // A non-line row (0 = 0 / 0 = c) draws nothing — never a false line.
    return seg ? [px(seg[0]), px(seg[1])] : [];
  });
  line1.opacity(0);
  const line2 = makeSegment(ROLE.basis2, 4);
  line2.points(() => {
    const seg = rowLineBoxPoints(a21(), a22(), b2(), EXT);
    return seg ? [px(seg[0]), px(seg[1])] : [];
  });
  line2.opacity(0);
  view.add(line1);
  view.add(line2);

  const solutionDot = new Circle({ size: 20, fill: ROLE.selected, opacity: 0 });
  solutionDot.position(() => px([EX.solution[0], EX.solution[1]]));
  view.add(solutionDot);

  // --- Column picture ---
  /**
   * Everything the columns can reach when they are DEPENDENT: the line through
   * the origin along col₁. Drawn only in the dependent beats, where "b is on it"
   * and "b is off it" is the whole distinction between infinitely many
   * solutions and none — a distinction the scene used to make in a caption
   * while b itself was hidden.
   */
  const colSpanLine = makeSegment(ROLE.original, 3, true);
  colSpanLine.points(() => {
    const c = col1();
    const len = Math.hypot(c[0], c[1]);
    if (len < 1e-9) return [];
    const u: MathVector2 = [c[0] / len, c[1] / len];
    return [px(scaleVector(u, -EXT)), px(scaleVector(u, EXT))];
  });
  colSpanLine.opacity(0);
  view.add(colSpanLine);

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

  const targetArrow = makeArrow(ROLE.target, 5);
  targetArrow.points(() => [px([0, 0]), px([b1(), b2()])]);
  targetArrow.opacity(0);
  view.add(targetArrow);
  const targetLabel = makeLabel("b", ROLE.target, 34);
  // Below-right of the tip, not above it: b points up into the band where the
  // persistent space tag sits, and an above-tip label printed "b" onto
  // "output space — columns combine to reach b" (text-overlap hard gate).
  targetLabel.position(() => px([b1(), b2()]).add(new Vector2(22, 20)));
  targetLabel.opacity(0);
  view.add(targetLabel);

  // --- Overlay text ---
  // Both start hidden: the `equations` segment budgets 0.5s to fade them in,
  // and a label created at full opacity turns that tween into 0.5s of nothing
  // (caught by the missing-claimed-motion gate).
  const top = makeOverlayLabel("", ROLE.text, 38);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  top.opacity(0);
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 30);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  caption.opacity(0);
  view.add(caption);
  // A persistent tag naming WHICH space we are in — the row and column pictures
  // live in different spaces (coefficient vs output), and must never be implied
  // to share one plane.
  const spaceTag = makeOverlayLabel("", ROLE.textMuted, 24);
  spaceTag.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y + 46));
  spaceTag.opacity(0);
  view.add(spaceTag);

  const setTop = (t: string) => top.text(t);
  const setCaption = (t: string) => caption.text(t);
  const setSpace = (t: string) => spaceTag.text(t);
  const COEFFICIENT_SPACE = "coefficient space  (x, y) — solutions are points";
  const OUTPUT_SPACE = "output space — columns combine to reach b";

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  /**
   * Cross to the other space.
   *
   * The tag is taken DOWN for the crossfade and only re-labelled once the
   * outgoing space's objects are gone. Setting it first — which is what the
   * scene used to do — meant that for the third of a second the transition
   * takes, a tag reading "coefficient space" sat over the column arrows: the
   * scene naming one space while the other's objects were still on screen, in
   * the one scene whose entire job is keeping the two apart.
   */
  function* crossTo(
    space: string,
    targets: readonly { node: Parameters<typeof focusOpacities>[0][number]["node"]; opacity: number }[],
    fade: number,
    tag: number,
  ): ThreadGenerator {
    yield* focusOpacities([...targets, { node: spaceTag, opacity: 0 }], fade);
    setSpace(space);
    yield* spaceTag.opacity(0.85, tag);
  }

  // Establish the coefficient space (row picture) — every output-space object is
  // fully hidden, so the two pictures never share one visible plane.
  const showRow = function* (
    emphasis = 1,
    duration = 0.35,
    tag = 0.2,
  ): ThreadGenerator {
    yield* crossTo(
      COEFFICIENT_SPACE,
      [
        { node: line1, opacity: emphasis },
        { node: line2, opacity: emphasis },
        { node: arrow1, opacity: 0 },
        { node: arrow2, opacity: 0 },
        { node: scaled1, opacity: 0 },
        { node: scaled2, opacity: 0 },
        { node: comboDot, opacity: 0 },
        { node: colSpanLine, opacity: 0 },
        { node: targetArrow, opacity: 0 },
        { node: targetLabel, opacity: 0 },
      ],
      duration,
      tag,
    );
  };

  // Establish the output space (column picture) — the row-picture lines are fully
  // faded to 0 first, a true transition rather than a translucent overlay.
  const showColumn = function* (
    duration = 0.35,
    span = 0,
    tag = 0.2,
  ): ThreadGenerator {
    yield* crossTo(
      OUTPUT_SPACE,
      [
        { node: line1, opacity: 0 },
        { node: line2, opacity: 0 },
        { node: solutionDot, opacity: 0 },
        { node: arrow1, opacity: 1 },
        { node: arrow2, opacity: 1 },
        { node: colSpanLine, opacity: span },
        { node: targetArrow, opacity: 0.9 },
        { node: targetLabel, opacity: 1 },
      ],
      duration,
      tag,
    );
  };

  const bodies: Record<string, () => ThreadGenerator> = {
    *equations() {
      const b = beats("equations");
      setTop("A x = b");
      setCaption("x + 3y = −1     and     2x − y = 5");
      yield* all(top.opacity(1, b.textReveal!), caption.opacity(1, b.textReveal!));
      yield* waitFor(b.hold!);
    },
    *row() {
      const b = beats("row");
      setTop("Row picture");
      setSpace(COEFFICIENT_SPACE);
      setCaption("Each equation is a line — the solution is where they cross");
      yield* all(
        spaceTag.opacity(0.85, b.lines!),
        line1.opacity(1, b.lines!),
        line2.opacity(1, b.lines!),
      );
      yield* waitFor(b.hold!);
      yield* solutionDot.opacity(1, b.dotIn!);
      yield* solutionDot.size(30, b.pulseUp!);
      yield* solutionDot.size(20, b.pulseDown!);
      setCaption("They meet once, at the point (x, y) = (2, −1)");
      yield* waitFor(b.hold2!);
    },
    *regroup() {
      const b = beats("regroup");
      // True transition: fully fade the coefficient-space picture, THEN name and
      // establish the output space — the lines never linger under the columns.
      setTop("A different space");
      setCaption("Fade the lines away — the same numbers, regrouped by column");
      yield* all(
        solutionDot.opacity(0, b.fade!),
        line1.opacity(0, b.fade!),
        line2.opacity(0, b.fade!),
      );
      setCaption("x·(1, 2) + y·(3, −1) = (−1, 5) — columns and target live here");
      // Establish the output-space frame only after the lines are fully gone.
      yield* showColumn(b.show!, 0, b.tag!);
      yield* waitFor(b.hold!);
    },
    *["predict-column"]() {
      const b = beats("predict-column");
      setTop("Predict");
      setCaption(
        "The row picture already told you where the lines meet: (2, −1).",
      );
      yield* waitFor(b.ask!);
      setCaption(
        "Predict: use those same two numbers as the multiples of col₁ and col₂ — where does the walk end?",
      );
      yield* waitFor(b.think!);
    },
    *column() {
      const b = beats("column");
      setTop("Column picture");
      setSpace(OUTPUT_SPACE);
      setCaption("Combine the columns to reach b");
      cx(0);
      cy(0);
      yield* all(scaled1.opacity(0.95, b.arm!), comboDot.opacity(1, b.arm!));
      yield* cx(EX.solution[0], b.cx!, easeInOutCubic);
      yield* scaled2.opacity(0.95, b.arm2!);
      yield* cy(EX.solution[1], b.cy!, easeInOutCubic);
      setCaption("2·col₁ − 1·col₂ lands exactly on b — the same (2, −1)");
      yield* comboDot.size(26, b.pulseUp!);
      yield* comboDot.size(18, b.pulseDown!);
      yield* waitFor(b.hold!);
    },
    *unique() {
      const b = beats("unique");
      setTop("One solution");
      setCaption("Independent columns ⇒ the lines cross exactly once");
      // Back to the coefficient space; the output-space arrows fully clear.
      yield* all(
        scaled1.opacity(0, b.clear!),
        scaled2.opacity(0, b.clear!),
        comboDot.opacity(0, b.clear!),
      );
      yield* showRow(0.6, b.show!, b.tag!);
      yield* waitFor(b.hold!);
    },
    *infinite() {
      const b = beats("infinite");
      setTop("Infinitely many");
      setCaption("Watch the two lines slide onto each other");
      cx(0);
      cy(0);
      yield* showRow(1, b.show!, b.tag!);
      yield* all(
        a11(EX.aDependent[0][0], b.morph!, easeInOutCubic),
        a12(EX.aDependent[0][1], b.morph!, easeInOutCubic),
        a21(EX.aDependent[1][0], b.morph!, easeInOutCubic),
        a22(EX.aDependent[1][1], b.morph!, easeInOutCubic),
        b1(EX.bInfinite[0], b.morph!, easeInOutCubic),
        b2(EX.bInfinite[1], b.morph!, easeInOutCubic),
      );
      setCaption(
        "They coincide — one line, so every point on it solves the system. The columns became dependent.",
      );
      yield* line1.lineWidth(6, b.pulseUp!);
      yield* line1.lineWidth(4, b.pulseDown!);
      yield* waitFor(b.hold!);
    },
    *none() {
      const b = beats("none");
      setTop("No solution");
      // Cross to the output space so the move the caption describes — b leaving
      // the columns' line — is one the learner can actually watch. It used to be
      // tweened while every output-space object was at opacity 0.
      setCaption("In the output space: dependent columns span only this line, and b sits on it");
      yield* showColumn(b.toColumn!, 0.9, b.tag!);
      yield* waitFor(b.hold!);
      setCaption("Now slide b off that line — watch it leave");
      yield* all(
        b1(EX.bNone[0], b.slideB!, easeInOutCubic),
        b2(EX.bNone[1], b.slideB!, easeInOutCubic),
      );
      yield* waitFor(b.hold2!);
      setCaption("b is unreachable now. Back in the row picture, that reads as parallel lines.");
      yield* showRow(1, b.toRow!, b.tag2!);
      yield* waitFor(b.hold3!);
    },
    *summary() {
      const b = beats("summary");
      setTop("Two spaces, one question");
      // Return to the scene's own system before closing. Freezing on the
      // no-solution configuration under a caption about "the same solution set"
      // would leave the last frame contradicting the sentence over it.
      setCaption("Back to the system we started with — two lines, one crossing");
      yield* all(
        spaceTag.opacity(0, b.restore!),
        line1.opacity(1, b.restore!),
        line2.opacity(1, b.restore!),
        solutionDot.opacity(1, b.restore!),
        a11(EX.a[0][0], b.restore!, easeInOutCubic),
        a12(EX.a[0][1], b.restore!, easeInOutCubic),
        a21(EX.a[1][0], b.restore!, easeInOutCubic),
        a22(EX.a[1][1], b.restore!, easeInOutCubic),
        b1(EX.b[0], b.restore!, easeInOutCubic),
        b2(EX.b[1], b.restore!, easeInOutCubic),
      );
      setCaption("Same solution set, seen through two different spaces");
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of SYSTEMS_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
