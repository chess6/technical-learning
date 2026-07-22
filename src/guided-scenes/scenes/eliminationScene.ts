import { Circle, Line, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { LINEAR_SYSTEM_EXAMPLE } from "../../lessons/exampleData";
import { classifyRowConstraint, type Vector2 as MathVector2 } from "../../math";
import { ELIMINATION_SEGMENTS } from "./sceneTimings";
import { ROLE, formatSceneNumber, makeOverlayLabel, makeSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * "Elimination" Watch scene — one row operation as reversible constraint
 * manipulation, in three synchronized views:
 *
 *   1. the written equations (left, top),
 *   2. the augmented matrix [A | b] (left, bottom),
 *   3. the two constraint lines in a bordered viewport (right).
 *
 * The system is Lesson 3's A = [[1,3],[2,-1]], b = (−1,5), solution (2,−1). The
 * single operation R2 → R2 − 2·R1 turns row 2 into (0, −7, 7). The change added
 * to R2 is −2·R1, which VANISHES at the solution ((−2)(1·2+3·(−1)−(−1)) = 0), so
 * every intermediate row still passes through (2,−1): the orange line pivots
 * about the fixed dot. That makes the invariance of the solution set visually
 * inevitable, not a rule to memorize.
 *
 * All "is this row a line?" decisions go through the shared classifyRowConstraint
 * (a zero row is never drawn as a false line); no linear algebra is reimplemented.
 */

const EX = LINEAR_SYSTEM_EXAMPLE;

// Right-hand viewport: a bordered mini-plane so the lines never collide with the
// symbolic panels on the left.
const BOX_CX = 250;
const BOX_SCALE = 46;
const BOX_EXT = 4;
const lpx = (p: MathVector2): Vector2 =>
  new Vector2(BOX_CX + p[0] * BOX_SCALE, -p[1] * BOX_SCALE);

const fmt = (n: number): string => formatSceneNumber(n).replace("-", "−");

/** The segment of `a x + b y = c` clipped to the ±ext box, or null if not a line. */
function rowLineBoxPoints(
  a: number,
  b: number,
  c: number,
  ext: number,
): [MathVector2, MathVector2] | null {
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

/** Plain-text equation `a x + b y = c` (unicode minus, drops zero / unit 1). */
function equationString(a: number, b: number, c: number): string {
  const parts: string[] = [];
  const push = (coef: number, v: string) => {
    if (Math.abs(coef) < 1e-9) return;
    const r = Math.round(coef * 100) / 100;
    const mag = Math.abs(r);
    const m = mag === 1 ? "" : fmt(mag);
    if (parts.length === 0) {
      parts.push(`${r < 0 ? "−" : ""}${m}${v}`);
    } else {
      parts.push(`${r < 0 ? "−" : "+"} ${m}${v}`);
    }
  };
  push(a, "x");
  push(b, "y");
  const lhs = parts.length > 0 ? parts.join(" ") : "0";
  return `${lhs} = ${fmt(c)}`;
}

/** One augmented row as a fixed-width bracketed string. */
function matrixRowString(a: number, b: number, c: number): string {
  const pad = (n: number) => fmt(n).padStart(3, " ");
  return `[ ${pad(a)}  ${pad(b)}  |  ${pad(c)} ]`;
}

function makeMono(size: number, color: string): Txt {
  return new Txt({
    text: "",
    fill: color,
    fontSize: size,
    fontFamily: "'JetBrains Mono', 'SF Mono', 'Consolas', monospace",
    fontWeight: 500,
    textAlign: "left",
  });
}

export const eliminationScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  // Row 1 is fixed; row 2 animates from (2,−1,5) → (0,−7,7).
  const a11 = createSignal(EX.a[0][0]);
  const a12 = createSignal(EX.a[0][1]);
  const b1 = createSignal(EX.b[0]);
  const a21 = createSignal(EX.a[1][0]);
  const a22 = createSignal(EX.a[1][1]);
  const b2 = createSignal(EX.b[1]);

  // --- Right viewport: border + subdued grid + axes ---
  const box = new Rect({
    x: BOX_CX,
    y: 0,
    width: 2 * BOX_EXT * BOX_SCALE,
    height: 2 * BOX_EXT * BOX_SCALE,
    stroke: ROLE.axis,
    lineWidth: 2,
    radius: 8,
  });
  view.add(box);
  for (let k = -BOX_EXT; k <= BOX_EXT; k += 1) {
    const isAxis = k === 0;
    view.add(
      new Line({
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        opacity: 0.5,
        points: [lpx([k, -BOX_EXT]), lpx([k, BOX_EXT])],
      }),
    );
    view.add(
      new Line({
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        opacity: 0.5,
        points: [lpx([-BOX_EXT, k]), lpx([BOX_EXT, k])],
      }),
    );
  }

  const line1 = makeSegment(ROLE.original, 4);
  line1.points(() => {
    const seg = rowLineBoxPoints(a11(), a12(), b1(), BOX_EXT);
    return seg ? [lpx(seg[0]), lpx(seg[1])] : [];
  });
  line1.opacity(0);
  view.add(line1);

  const line2 = makeSegment(ROLE.transformed, 4);
  line2.points(() => {
    const seg = rowLineBoxPoints(a21(), a22(), b2(), BOX_EXT);
    return seg ? [lpx(seg[0]), lpx(seg[1])] : [];
  });
  line2.opacity(0);
  view.add(line2);

  // Fixed solution dot — stays put the whole scene (the invariant).
  const solutionDot = new Circle({ size: 18, fill: ROLE.selected, opacity: 0 });
  solutionDot.position(lpx([EX.solution[0], EX.solution[1]]));
  view.add(solutionDot);
  const solutionLabel = new Txt({
    text: `(${fmt(EX.solution[0])}, ${fmt(EX.solution[1])})`,
    fill: ROLE.selected,
    fontSize: 22,
    fontWeight: 600,
    stroke: ROLE.background,
    lineWidth: 4,
    strokeFirst: true,
  });
  solutionLabel.position(lpx([EX.solution[0], EX.solution[1]]).add(new Vector2(64, 8)));
  solutionLabel.opacity(0);
  view.add(solutionLabel);

  // --- Left symbolic column: equations + augmented matrix ---
  const LEFT_X = -280;
  const eqHeading = new Txt({
    text: "Equations",
    fill: ROLE.textMuted,
    fontSize: 22,
    fontWeight: 600,
    x: LEFT_X,
    y: -150,
    textAlign: "left",
  });
  eqHeading.opacity(0);
  view.add(eqHeading);

  const eq1 = makeMono(30, ROLE.original);
  eq1.text(() => equationString(a11(), a12(), b1()));
  eq1.position(new Vector2(LEFT_X, -110));
  eq1.opacity(0);
  view.add(eq1);
  const eq2 = makeMono(30, ROLE.transformed);
  eq2.text(() => equationString(a21(), a22(), b2()));
  eq2.position(new Vector2(LEFT_X, -70));
  eq2.opacity(0);
  view.add(eq2);

  const matHeading = new Txt({
    text: "Augmented matrix  [A | b]",
    fill: ROLE.textMuted,
    fontSize: 22,
    fontWeight: 600,
    x: LEFT_X,
    y: 10,
    textAlign: "left",
  });
  matHeading.opacity(0);
  view.add(matHeading);

  const mat1 = makeMono(28, ROLE.original);
  mat1.text(() => matrixRowString(a11(), a12(), b1()));
  mat1.position(new Vector2(LEFT_X, 52));
  mat1.opacity(0);
  view.add(mat1);
  const mat2 = makeMono(28, ROLE.transformed);
  mat2.text(() => matrixRowString(a21(), a22(), b2()));
  mat2.position(new Vector2(LEFT_X, 90));
  mat2.opacity(0);
  view.add(mat2);

  // --- Overlay title + caption (safe bands) ---
  const top = makeOverlayLabel("Elimination: rewrite, don't recompute", ROLE.text, 36);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 28);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const setTop = (t: string) => top.text(t);
  const setCaption = (t: string) => caption.text(t);

  const seconds = Object.fromEntries(
    ELIMINATION_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  const bodies: Record<string, () => ThreadGenerator> = {
    *setup() {
      setCaption("The same system, three ways: equations, matrix, and two lines");
      yield* all(
        eqHeading.opacity(0.9, 0.4),
        matHeading.opacity(0.9, 0.4),
        eq1.opacity(1, 0.5),
        eq2.opacity(1, 0.5),
        mat1.opacity(1, 0.5),
        mat2.opacity(1, 0.5),
      );
      yield* all(line1.opacity(1, 0.5), line2.opacity(1, 0.5));
      yield* solutionDot.opacity(1, 0.4);
      yield* all(solutionLabel.opacity(1, 0.4), solutionDot.size(28, 0.3));
      yield* solutionDot.size(18, 0.3);
      setCaption("The two lines cross once, at (2, −1) — that point is the solution");
      yield* waitFor(seconds.setup - 3.1);
    },
    *operation() {
      setTop("One row operation:  R2 → R2 − 2·R1");
      setCaption("Subtract 2·R1 from R2 to clear x. Watch R2's line pivot…");
      // Pulse the fixed dot so the eye anchors on it before the pivot.
      yield* all(solutionDot.size(26, 0.3), solutionLabel.opacity(1, 0.2));
      yield* solutionDot.size(18, 0.3);
      // Animate row 2 → (0, −7, 7). Every intermediate row passes through (2,−1),
      // so the orange line rotates about the fixed dot; equations + matrix update
      // live because they read the same signals.
      yield* all(
        a21(0, 2.2, easeInOutCubic),
        a22(-7, 2.2, easeInOutCubic),
        b2(7, 2.2, easeInOutCubic),
      );
      setCaption("…the line swings, but it still passes through (2, −1). The point held.");
      yield* waitFor(seconds.operation - 3.7);
    },
    *triangular() {
      setTop("Now it's triangular");
      setCaption("R2 is now −7y = 7 ⇒ y = −1, with no x left");
      yield* all(line2.lineWidth(6, 0.3), eq2.opacity(1, 0.2));
      yield* line2.lineWidth(4, 0.3);
      setCaption("Back-substitute into R1: x + 3(−1) = −1 ⇒ x = 2. Solution (2, −1).");
      yield* all(solutionDot.size(28, 0.3), solutionLabel.scale(1.15, 0.3));
      yield* all(solutionDot.size(18, 0.3), solutionLabel.scale(1, 0.3));
      yield* waitFor(seconds.triangular - 1.9);
    },
    *invariance() {
      setTop("Why the crossing can't move");
      setCaption(
        "The new R2 is R2 − 2·R1. Any point on both old lines satisfies it too — and back.",
      );
      // Dim R1, brighten the fixed dot + new R2 to make the shared point the focus.
      yield* all(line1.opacity(0.45, 0.4), solutionDot.opacity(1, 0.2));
      yield* solutionDot.size(30, 0.35);
      yield* solutionDot.size(18, 0.35);
      yield* line1.opacity(1, 0.4);
      yield* waitFor(seconds.invariance - 1.9);
    },
    *summary() {
      setTop("Same solutions, easier system");
      setCaption(
        "Elimination replaces the constraints with equivalent ones — the solution set is untouched",
      );
      yield* waitFor(seconds.summary - 0.2);
    },
  };

  for (const segment of ELIMINATION_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
