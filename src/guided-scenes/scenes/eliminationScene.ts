import { Circle, Line, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { LINEAR_SYSTEM_EXAMPLE } from "../../lessons/exampleData";
import {
  applyRowOperation,
  augmentedFromSystem,
  classifyRowConstraint,
  eliminationStepToClearX,
  lerp,
  type Vector2 as MathVector2,
} from "../../math";
import { ELIMINATION_BEATS, ELIMINATION_SEGMENTS } from "./sceneTimings";
import {
  ROLE,
  formatSceneNumber,
  makeOverlayLabel,
  makeSegment,
  runSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * "Elimination" Watch scene — one row operation as reversible constraint
 * manipulation, in three synchronized views:
 *
 *   1. the written equations (left, top),
 *   2. the augmented matrix [A | b] (left, bottom),
 *   3. the two constraint lines in a bordered viewport (right).
 *
 * The system, the row operation, and the resulting row are ALL derived from the
 * shared `src/math` elimination helpers — nothing is hardcoded here:
 *
 *   const start = augmentedFromSystem(EX.a, EX.b);   // Lesson 3's system
 *   const op    = eliminationStepToClearX(start);    // R2 → R2 − 2·R1
 *   const end   = applyRowOperation(start, op);       // R2 becomes (0, −7, 7)
 *
 * Row 2 is then driven by a SINGLE progress signal that interpolates the whole
 * row from `start.rows[1]` to `end.rows[1]`, so the equations, the augmented
 * matrix, and the line all read one consistent mathematical state at every
 * frame (they cannot drift apart, and they follow the shared example if it
 * changes). The change added to R2 is −2·R1, which VANISHES at the solution
 * ((−2)(1·2 + 3·(−1) − (−1)) = 0), so every intermediate row still passes
 * through (2, −1): the orange line pivots about the fixed dot. To make the
 * *combination* legible (rather than numbers silently ticking down), the scaled
 * −2·R1 term is shown as its own row and slid up INTO R2 as the row
 * interpolates — the addition R2 + (−2·R1) is enacted, not merely implied.
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

  // Derive the system, the operation, and the result row from shared math — the
  // scene never hardcodes (2,−1,5)→(0,−7,7) (correctness: single source of truth).
  const startSys = augmentedFromSystem(EX.a, EX.b);
  const op = eliminationStepToClearX(startSys);
  if (!op || op.kind !== "add") {
    throw new Error("Expected an add row-operation to clear x from R2.");
  }
  const endSys = applyRowOperation(startSys, op);
  const r2Start = startSys.rows[1];
  const r2End = endSys.rows[1];
  // The scaled term the operation adds to R2: op.factor · R1 (here −2·R1).
  const scaledR1: [number, number, number] = [
    op.factor * startSys.rows[0][0],
    op.factor * startSys.rows[0][1],
    op.factor * startSys.rows[0][2],
  ];

  // Row 1 is fixed.
  const a11 = createSignal(startSys.rows[0][0]);
  const a12 = createSignal(startSys.rows[0][1]);
  const b1 = createSignal(startSys.rows[0][2]);
  // Row 2 is driven by ONE progress signal 0→1 that interpolates the whole row
  // from r2Start to r2End, so equations, matrix, and line stay one state.
  const progress = createSignal(0);
  const a21 = () => lerp(r2Start[0], r2End[0], progress());
  const a22 = () => lerp(r2Start[1], r2End[1], progress());
  const b2 = () => lerp(r2Start[2], r2End[2], progress());

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
  const MAT2_Y = 90;
  const mat2 = makeMono(28, ROLE.transformed);
  mat2.text(() => matrixRowString(a21(), a22(), b2()));
  mat2.position(new Vector2(LEFT_X, MAT2_Y));
  mat2.opacity(0);
  view.add(mat2);

  // The scaled term −2·R1 shown as its OWN row (in R1's colour, so its origin is
  // unmistakable) below R2, plus a small "+ (−2)·R1" tag. During the operation
  // it slides UP onto R2 while R2 interpolates to the sum — the addition is
  // enacted on screen, not left implicit in ticking digits.
  const GHOST_START_Y = 150;
  const ghostRow = makeMono(28, ROLE.original);
  ghostRow.text(matrixRowString(scaledR1[0], scaledR1[1], scaledR1[2]));
  ghostRow.position(new Vector2(LEFT_X, GHOST_START_Y));
  ghostRow.opacity(0);
  view.add(ghostRow);
  const ghostTag = new Txt({
    text: `add  ${fmt(op.factor)}·R1`,
    fill: ROLE.original,
    fontSize: 20,
    fontWeight: 600,
    x: LEFT_X + 210,
    y: GHOST_START_Y,
    textAlign: "left",
  });
  ghostTag.opacity(0);
  view.add(ghostTag);

  // --- Overlay title + caption (safe bands) ---
  const top = makeOverlayLabel("Elimination: rewrite, don't recompute", ROLE.text, 36);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 28);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const setTop = (t: string) => top.text(t);
  const setCaption = (t: string) => caption.text(t);

  // Every animated yield reads its duration from the pure ELIMINATION_BEATS
  // budget; runSegment then pads each body up to its segment's declared length,
  // so the generated timeline equals totalDuration(ELIMINATION_SEGMENTS).
  const B = ELIMINATION_BEATS;

  const bodies: Record<string, () => ThreadGenerator> = {
    *setup() {
      const b = B.setup!;
      setCaption("The same system, three ways: equations, matrix, and two lines");
      yield* all(
        eqHeading.opacity(0.9, b.panels),
        matHeading.opacity(0.9, b.panels),
        eq1.opacity(1, b.panels),
        eq2.opacity(1, b.panels),
        mat1.opacity(1, b.panels),
        mat2.opacity(1, b.panels),
      );
      yield* all(line1.opacity(1, b.lines), line2.opacity(1, b.lines));
      yield* solutionDot.opacity(1, b.dotIn);
      yield* all(solutionLabel.opacity(1, b.dotPulseUp), solutionDot.size(28, b.dotPulseUp));
      yield* solutionDot.size(18, b.dotPulseDown);
      setCaption("The two lines cross once, at (2, −1) — that point is the solution");
    },
    *operation() {
      const b = B.operation!;
      setTop("One row operation:  R2 → R2 − 2·R1");
      setCaption("Take −2 · R1 and add it, entry by entry, to R2 …");
      // Anchor the eye on the fixed point before the pivot.
      yield* all(solutionDot.size(26, b.anchorUp), solutionLabel.opacity(1, b.anchorUp));
      yield* solutionDot.size(18, b.anchorDown);
      // Reveal the scaled −2·R1 term as its own row below the matrix.
      yield* all(ghostRow.opacity(0.9, b.ghostReveal), ghostTag.opacity(0.9, b.ghostReveal));
      setCaption("Slide it up onto R2 — the x-column cancels and the line pivots.");
      // Enact the addition: the ghost row slides up onto R2 and fades as R2 (and
      // its line) interpolate to R2 + (−2·R1). One progress signal drives the
      // whole row, so equations, matrix, and line move as one state.
      yield* all(
        progress(1, b.combine, easeInOutCubic),
        ghostRow.y(MAT2_Y, b.combine, easeInOutCubic),
        ghostTag.y(MAT2_Y, b.combine, easeInOutCubic),
        ghostRow.opacity(0, b.combine),
        ghostTag.opacity(0, b.combine),
      );
      setCaption("…the line swings, but it still passes through (2, −1). The point held.");
      // Land pulse on the fixed dot.
      yield* solutionDot.size(26, b.landUp);
      yield* solutionDot.size(18, b.landDown);
    },
    *triangular() {
      const b = B.triangular!;
      setTop("Now it's triangular");
      setCaption("R2 is now −7y = 7 ⇒ y = −1, with no x left");
      yield* line2.lineWidth(6, b.lineUp);
      yield* line2.lineWidth(4, b.lineDown);
      setCaption("Back-substitute into R1: x + 3(−1) = −1 ⇒ x = 2. Solution (2, −1).");
      yield* all(solutionDot.size(28, b.dotUp), solutionLabel.scale(1.15, b.dotUp));
      yield* all(solutionDot.size(18, b.dotDown), solutionLabel.scale(1, b.dotDown));
    },
    *invariance() {
      const b = B.invariance!;
      setTop("Why the crossing can't move");
      setCaption(
        "The new R2 is R2 − 2·R1. Any point on both old lines satisfies it too — and back.",
      );
      // Dim R1, brighten the fixed dot + new R2 to make the shared point the focus.
      yield* all(line1.opacity(0.45, b.dim), solutionDot.opacity(1, b.dim));
      yield* solutionDot.size(30, b.grow);
      yield* solutionDot.size(18, b.shrink);
      yield* line1.opacity(1, b.restore);
    },
    *summary() {
      const b = B.summary!;
      setTop("Same solutions, easier system");
      setCaption(
        "Elimination replaces the constraints with equivalent ones — the solution set is untouched",
      );
      // A final gentle emphasis on the solution that never moved.
      yield* all(solutionLabel.scale(1.08, b.settleUp), solutionDot.size(24, b.settleUp));
      yield* all(solutionLabel.scale(1, b.settleDown), solutionDot.size(18, b.settleDown));
    },
  };

  for (const segment of ELIMINATION_SEGMENTS) {
    yield* runSegment(segment.duration, bodies[segment.id]!);
  }
});
