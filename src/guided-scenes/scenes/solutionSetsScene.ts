import { Circle, Line, Txt, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { LINEAR_SYSTEM_EXAMPLE } from "../../lessons/exampleData";
import {
  matrixVectorMultiply,
  nullspaceBasis2x2,
  particularSolution2x2,
  type Vector2 as MathVector2,
} from "../../math";
import { SOLUTION_SETS_SEGMENTS } from "./sceneTimings";
import { ROLE, makeArrow, makeOverlayLabel, makeSegment, runSegment } from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * "Solution Sets & Homogeneous Systems" Watch scene.
 *
 * The whole scene lives in solution space `(x, y)`. It earns the decomposition
 * `Sol(A, b) = x_p + Null(A)` rather than showing it up front:
 *
 *   1. two solutions of ONE consistent system are marked;
 *   2. their difference is drawn and shown to be a homogeneous solution
 *      (A·(x₁−x₂) = 0) — the discovery engine;
 *   3. adding it back to a solution generates a third, without re-solving;
 *   4. all differences fill Null(A), a line through the origin;
 *   5. the solution set is that null line translated by x_p (affine, off the
 *      origin unless b = 0);
 *   6. the case split: no particular solution ⇒ empty; trivial null space ⇒ a
 *      single point.
 *
 * Numbers are the shared Lesson 3 system (columns (1,2),(2,4), b = (3,6)). The
 * particular solution and the homogeneous direction are DERIVED from the shared
 * math (particularSolution2x2 / nullspaceBasis2x2) and every plotted solution is
 * verified against A x = b, so the picture cannot drift from the algebra.
 */

const EX = LINEAR_SYSTEM_EXAMPLE;
const A = EX.aDependent;
const B = EX.bInfinite as MathVector2;

// x_p from shared math; the integer null vector d = (2, −1) comes from the column
// dependency col₂ = 2·col₁ (so A·(2,−1) = 2·col₁ − col₂ = 0). Verify both.
const XP: MathVector2 = particularSolution2x2(A, B) ?? [3, 0];
const D: MathVector2 = [2, -1];
const X1: MathVector2 = XP; // (3, 0)
const X2: MathVector2 = [XP[0] - D[0], XP[1] - D[1]]; // (1, 1)
const X3: MathVector2 = [XP[0] + D[0], XP[1] + D[1]]; // (5, -1)

/**
 * Correctness guard (single source of truth): d is a homogeneous solution, the
 * three plotted points all solve A x = b, and the shared null direction is
 * parallel to d. Never fires for the shared example; protects the scene if the
 * example data changes. Called once at the top of the scene generator.
 */
function assertSceneMathIsConsistent(): void {
  const ad = matrixVectorMultiply(A, D);
  if (Math.hypot(ad[0], ad[1]) > 1e-9) {
    throw new Error("solutionSetsScene: d is not a homogeneous solution of A.");
  }
  for (const x of [X1, X2, X3]) {
    const img = matrixVectorMultiply(A, x);
    if (Math.hypot(img[0] - B[0], img[1] - B[1]) > 1e-9) {
      throw new Error("solutionSetsScene: a plotted point does not solve A x = b.");
    }
  }
  const nul = nullspaceBasis2x2(A);
  if (nul.kind !== "line" || Math.abs(nul.basis[0] * D[1] - nul.basis[1] * D[0]) > 1e-9) {
    throw new Error("solutionSetsScene: null direction is not parallel to d.");
  }
}

const S = 52; // pixels per unit
const HX = 5.2;
const HY = 2.4;
const px = (p: MathVector2): Vector2 => new Vector2(p[0] * S, -p[1] * S);

/** Endpoints of the line through `p` with direction `dir`, clipped to ±HX × ±HY. */
function clipLine(p: MathVector2, dir: MathVector2): [MathVector2, MathVector2] | null {
  let tmin = -Infinity;
  let tmax = Infinity;
  const clip = (num: number, den: number): boolean => {
    if (Math.abs(den) < 1e-12) return num >= 0;
    const r = num / den;
    if (den > 0) {
      if (r < tmax) tmax = r;
    } else if (r > tmin) {
      tmin = r;
    }
    return true;
  };
  const ok =
    clip(HX - p[0], dir[0]) &&
    clip(HX + p[0], -dir[0]) &&
    clip(HY - p[1], dir[1]) &&
    clip(HY + p[1], -dir[1]);
  if (!ok || tmin > tmax) return null;
  return [
    [p[0] + tmin * dir[0], p[1] + tmin * dir[1]],
    [p[0] + tmax * dir[0], p[1] + tmax * dir[1]],
  ];
}

function makeTip(text: string, color: string): Txt {
  return new Txt({
    text,
    fill: color,
    fontSize: 22,
    fontWeight: 600,
    stroke: ROLE.background,
    lineWidth: 4,
    strokeFirst: true,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
  });
}

export const solutionSetsScene = makeScene2D(function* (view) {
  assertSceneMathIsConsistent();
  view.fill(ROLE.background);

  // --- Reference frame: subtle grid + axes ---
  for (let k = -5; k <= 5; k += 1) {
    view.add(
      new Line({
        stroke: k === 0 ? ROLE.axis : ROLE.grid,
        lineWidth: k === 0 ? 2 : 1,
        opacity: 0.55,
        points: [px([k, -HY]), px([k, HY])],
      }),
    );
  }
  for (let k = -2; k <= 2; k += 1) {
    view.add(
      new Line({
        stroke: k === 0 ? ROLE.axis : ROLE.grid,
        lineWidth: k === 0 ? 2 : 1,
        opacity: 0.55,
        points: [px([-HX, k]), px([HX, k])],
      }),
    );
  }
  const origin = new Circle({ size: 12, fill: ROLE.textMuted });
  origin.position(px([0, 0]));
  view.add(origin);

  // --- The null line (revealed later) ---
  const nullSeg = clipLine([0, 0], D)!;
  const nullLine = makeSegment(ROLE.basis1, 4);
  nullLine.points([px(nullSeg[0]), px(nullSeg[1])]);
  nullLine.opacity(0);
  view.add(nullLine);

  // --- The solution line (revealed later) ---
  const solSeg = clipLine(XP, D)!;
  const solLine = makeSegment(ROLE.selected, 4);
  solLine.points([px(solSeg[0]), px(solSeg[1])]);
  solLine.opacity(0);
  view.add(solLine);

  // --- Offset arrow origin → x_p (the translate) ---
  const offset = makeArrow(ROLE.result, 4);
  offset.points([px([0, 0]), px(XP)]);
  offset.opacity(0);
  view.add(offset);

  // --- Difference arrows: x₂ → x₁ (natural), and origin → d (translated) ---
  const diffNatural = makeArrow(ROLE.basis2, 5);
  diffNatural.points([px(X2), px(X1)]);
  diffNatural.opacity(0);
  view.add(diffNatural);
  const diffAtOrigin = makeArrow(ROLE.basis2, 5);
  diffAtOrigin.points([px([0, 0]), px(D)]);
  diffAtOrigin.opacity(0);
  view.add(diffAtOrigin);

  // --- Generate arrow x₁ → x₃ ---
  const genArrow = makeArrow(ROLE.transformed, 5);
  genArrow.points([px(X1), px(X3)]);
  genArrow.opacity(0);
  view.add(genArrow);

  // --- Solution dots ---
  const dot1 = new Circle({ size: 20, fill: ROLE.selected, opacity: 0 });
  dot1.position(px(X1));
  view.add(dot1);
  const dot2 = new Circle({ size: 20, fill: ROLE.original, opacity: 0 });
  dot2.position(px(X2));
  view.add(dot2);
  const dot3 = new Circle({ size: 20, fill: ROLE.transformed, opacity: 0 });
  dot3.position(px(X3));
  view.add(dot3);

  const lbl1 = makeTip("x₁ = (3, 0)", ROLE.selected);
  lbl1.position(px(X1).add(new Vector2(20, -22)));
  lbl1.opacity(0);
  view.add(lbl1);
  const lbl2 = makeTip("x₂ = (1, 1)", ROLE.original);
  lbl2.position(px(X2).add(new Vector2(-6, -24)));
  lbl2.opacity(0);
  view.add(lbl2);
  const lbl3 = makeTip("x₃ = (5, −1)", ROLE.transformed);
  lbl3.position(px(X3).add(new Vector2(6, 26)));
  lbl3.opacity(0);
  view.add(lbl3);
  const lblXp = makeTip("xₚ", ROLE.result);
  lblXp.position(px(XP).add(new Vector2(24, 22)));
  lblXp.opacity(0);
  view.add(lblXp);
  const lblD = makeTip("x₁ − x₂ ∈ Null(A)", ROLE.basis2);
  lblD.position(px(D).add(new Vector2(30, 18)));
  lblD.opacity(0);
  view.add(lblD);
  const emptyMark = makeTip("Sol(A, b) = ∅", ROLE.selected);
  emptyMark.position(new Vector2(0, -HY * S * 0.55));
  emptyMark.opacity(0);
  view.add(emptyMark);
  const pointMark = makeTip("Null(A) = {0} ⇒ one point", ROLE.result);
  pointMark.position(px(XP).add(new Vector2(28, -28)));
  pointMark.opacity(0);
  view.add(pointMark);

  // --- Overlay title + caption (safe bands) ---
  const top = makeOverlayLabel("Solution sets: one solution plus the null space", ROLE.text, 34);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 28);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);
  const setTop = (s: string) => top.text(s);
  const setCaption = (s: string) => caption.text(s);
  setCaption("A x = b with dependent columns: x + 2y = 3, 2x + 4y = 6");

  const bodies: Record<string, () => ThreadGenerator> = {
    *["two-solutions"]() {
      setTop("Two solutions of one system");
      setCaption("Both (3, 0) and (1, 1) satisfy x + 2y = 3 and 2x + 4y = 6");
      yield* all(dot1.opacity(1, 0.5), lbl1.opacity(1, 0.5));
      yield* all(dot2.opacity(1, 0.5), lbl2.opacity(1, 0.5));
      yield* all(dot1.size(28, 0.3), dot2.size(28, 0.3));
      yield* all(dot1.size(20, 0.3), dot2.size(20, 0.3));
    },
    *difference() {
      setTop("Subtract them");
      setCaption("x₁ − x₂ = (2, −1). Then A(x₁ − x₂) = A x₁ − A x₂ = b − b = 0.");
      yield* diffNatural.opacity(1, 0.7);
      setCaption("Slide that same difference to the origin — it is a homogeneous solution.");
      yield* all(diffAtOrigin.opacity(1, 0.8), lblD.opacity(1, 0.8));
      yield* diffAtOrigin.lineWidth(8, 0.35);
      yield* diffAtOrigin.lineWidth(5, 0.35);
    },
    *generate() {
      setTop("Add it back to make more");
      setCaption("x₁ + (x₁ − x₂) = (5, −1) — a third solution, with no re-solving");
      yield* genArrow.opacity(1, 0.7);
      yield* all(dot3.opacity(1, 0.5), lbl3.opacity(1, 0.5));
      yield* dot3.size(28, 0.3);
      yield* dot3.size(20, 0.3);
    },
    *["null-line"]() {
      setTop("The homogeneous line");
      setCaption("Every difference lies on Null(A): the line { t·(2, −1) } through the origin");
      yield* nullLine.opacity(1, 0.8);
      yield* nullLine.lineWidth(6, 0.35);
      yield* nullLine.lineWidth(4, 0.35);
    },
    *translate() {
      setTop("The solution set is the null line, shifted");
      setCaption("Sol(A, b) = xₚ + Null(A): the null space carried off the origin");
      yield* all(offset.opacity(1, 0.7), lblXp.opacity(1, 0.7));
      yield* solLine.opacity(1, 0.8);
      setCaption("It is affine — parallel to Null(A), but off the origin (through xₚ, not 0)");
      yield* solLine.lineWidth(6, 0.35);
      yield* solLine.lineWidth(4, 0.35);
    },
    *cases() {
      setTop("Empty, a point, or a line");
      // Snap-then-hold (not long opacity tweens): the geometry change must read
      // under scrubbing and reduced-motion, not only during continuous play.
      // --- Empty: no particular solution → remove the shifted set. Null(A) stays. ---
      setCaption("Off the column space ⇒ no xₚ ⇒ Sol(A, b) = ∅ (Null(A) is unchanged)");
      solLine.opacity(0);
      offset.opacity(0);
      lblXp.opacity(0);
      genArrow.opacity(0);
      dot1.opacity(0);
      lbl1.opacity(0);
      dot2.opacity(0);
      lbl2.opacity(0);
      dot3.opacity(0);
      lbl3.opacity(0);
      diffNatural.opacity(0);
      diffAtOrigin.opacity(0);
      lblD.opacity(0);
      pointMark.opacity(0);
      emptyMark.opacity(1);
      nullLine.opacity(1);
      yield* waitFor(1.6);
      // --- Point: trivial null space → collapse Null(A); one solution remains. ---
      setCaption("Trivial null space (independent columns) ⇒ exactly one solution point");
      emptyMark.opacity(0);
      nullLine.opacity(0);
      offset.opacity(1);
      lblXp.opacity(1);
      dot1.opacity(1);
      lbl1.opacity(0); // avoid stacking "x₁ = (3,0)" on the point-case caption
      pointMark.opacity(1);
      yield* all(dot1.size(28, 0.25), dot1.size(20, 0.25));
      yield* waitFor(1.5);
      // --- Line: restore the main dependent example. ---
      setCaption("Nontrivial Null(A) and a reachable b ⇒ the null line, shifted: Sol = xₚ + Null(A)");
      pointMark.opacity(0);
      nullLine.opacity(1);
      solLine.opacity(1);
      genArrow.opacity(1);
      lbl1.opacity(1);
      dot2.opacity(1);
      lbl2.opacity(1);
      dot3.opacity(1);
      lbl3.opacity(1);
      diffNatural.opacity(1);
      diffAtOrigin.opacity(1);
      lblD.opacity(1);
      yield* solLine.lineWidth(6, 0.25);
      yield* solLine.lineWidth(4, 0.25);
      yield* waitFor(1.4);
    },
  };

  for (const segment of SOLUTION_SETS_SEGMENTS) {
    yield* runSegment(segment.duration, bodies[segment.id]!);
  }
});
