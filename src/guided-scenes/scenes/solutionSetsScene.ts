import { Circle, Line, Txt, makeScene2D } from "@motion-canvas/2d";
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
  matrixVectorMultiply,
  nullspaceBasis2x2,
  particularSolution2x2,
  type Vector2 as MathVector2,
} from "../../math";
import { SOLUTION_SETS_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  makeArrow,
  makeOverlayLabel,
  makeSegment,
  runSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * "Solution Sets & Homogeneous Systems" Watch scene.
 *
 * The whole scene lives in solution space `(x, y)`. It earns the decomposition
 * `Sol(A, b) = x_p + Null(A)` rather than showing it up front:
 *
 *   1. two solutions of ONE consistent system are marked;
 *   2. their difference is drawn and TRAVELS to the origin, where it is shown
 *      to be a homogeneous solution (A·(x₁−x₂) = 0) — the discovery engine;
 *   3. the learner predicts what adding it back to a solution does;
 *   4. it generates a third solution, without re-solving;
 *   5. all differences fill Null(A), a line through the origin;
 *   6. the solution set is that null line translated by x_p (affine, off the
 *      origin unless b = 0);
 *   7. the three cases — empty, a point, a line — each get their own chapter.
 *
 * The travel in (2) is the audit's headline fix here: the caption said "slide
 * that same difference to the origin" while a SECOND arrow faded in at the
 * origin. One arrow now moves, with a dashed ghost left behind, so "the same
 * difference" is literally the same object.
 *
 * Numbers are the shared Lesson 3 system (columns (1,2),(2,4), b = (3,6)). The
 * particular solution and the homogeneous direction are DERIVED from the shared
 * math (particularSolution2x2 / nullspaceBasis2x2) and every plotted solution is
 * verified against A x = b, so the picture cannot drift from the algebra.
 */

const SCENE_ID = "solution-sets";

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

  // --- The null line: the set of ALL differences, so it wears the difference's
  // own role rather than a fourth unrelated hue. ---
  const nullSeg = clipLine([0, 0], D)!;
  const nullLine = makeSegment(ROLE.selected, 4);
  nullLine.points([px(nullSeg[0]), px(nullSeg[1])]);
  nullLine.opacity(0);
  view.add(nullLine);

  // --- The solution set: what the whole question is after. ---
  const solSeg = clipLine(XP, D)!;
  const solLine = makeSegment(ROLE.target, 4);
  solLine.points([px(solSeg[0]), px(solSeg[1])]);
  solLine.opacity(0);
  view.add(solLine);

  // --- Offset arrow origin → x_p (the translate that carries Null off zero) ---
  const offset = makeArrow(ROLE.transformed, 4);
  offset.points([px([0, 0]), px(XP)]);
  offset.opacity(0);
  view.add(offset);

  /**
   * The difference x₁ − x₂, as ONE arrow that travels.
   *
   * `slide` = 0 draws it in its natural place (tail on x₂, head on x₁);
   * `slide` = 1 translates the whole arrow by −x₂, which lands it on
   * (origin → d). Same object, same length, same direction — which is exactly
   * the claim the beat is making.
   */
  const slide = createSignal(0);
  const shifted = (p: MathVector2): MathVector2 => [
    p[0] - slide() * X2[0],
    p[1] - slide() * X2[1],
  ];
  const diffArrow = makeArrow(ROLE.selected, 5);
  diffArrow.points(() => [px(shifted(X2)), px(shifted(X1))]);
  diffArrow.opacity(0);
  view.add(diffArrow);
  // Where the difference started, so the travel has a visible "from".
  const diffGhost = makeArrow(ROLE.dim, 4);
  diffGhost.points([px(X2), px(X1)]);
  diffGhost.opacity(0);
  view.add(diffGhost);

  // --- Generate arrow x₁ → x₃ ---
  const genArrow = makeArrow(ROLE.result, 5);
  genArrow.points([px(X1), px(X3)]);
  genArrow.opacity(0);
  view.add(genArrow);

  // --- Solution dots: x₁ and x₂ are a co-equal pair; x₃ is derived. ---
  const dot1 = new Circle({ size: 20, fill: ROLE.basis1, opacity: 0 });
  dot1.position(px(X1));
  view.add(dot1);
  const dot2 = new Circle({ size: 20, fill: ROLE.basis2, opacity: 0 });
  dot2.position(px(X2));
  view.add(dot2);
  const dot3 = new Circle({ size: 20, fill: ROLE.result, opacity: 0 });
  dot3.position(px(X3));
  view.add(dot3);

  const lbl1 = makeTip("x₁ = (3, 0)", ROLE.basis1);
  lbl1.position(px(X1).add(new Vector2(20, -22)));
  lbl1.opacity(0);
  view.add(lbl1);
  const lbl2 = makeTip("x₂ = (1, 1)", ROLE.basis2);
  lbl2.position(px(X2).add(new Vector2(-6, -24)));
  lbl2.opacity(0);
  view.add(lbl2);
  const lbl3 = makeTip("x₃ = (5, −1)", ROLE.result);
  lbl3.position(px(X3).add(new Vector2(6, 26)));
  lbl3.opacity(0);
  view.add(lbl3);
  const lblXp = makeTip("xₚ", ROLE.transformed);
  lblXp.position(px(XP).add(new Vector2(24, 22)));
  lblXp.opacity(0);
  view.add(lblXp);
  const lblD = makeTip("x₁ − x₂ ∈ Null(A)", ROLE.selected);
  lblD.position(px(D).add(new Vector2(-40, 34)));
  lblD.opacity(0);
  view.add(lblD);
  const emptyMark = makeTip("Sol(A, b) = ∅", ROLE.violation);
  emptyMark.position(new Vector2(0, -HY * S * 0.55));
  emptyMark.opacity(0);
  view.add(emptyMark);
  const pointMark = makeTip("Null(A) = {0} ⇒ one point", ROLE.target);
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

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  /** Snap the whole picture to the "general case" configuration. */
  function showGeneralCase(): void {
    emptyMark.opacity(0);
    pointMark.opacity(0);
    nullLine.opacity(1);
    solLine.opacity(1);
    offset.opacity(1);
    lblXp.opacity(1);
    genArrow.opacity(1);
    dot1.opacity(1);
    lbl1.opacity(1);
    dot2.opacity(1);
    lbl2.opacity(1);
    dot3.opacity(1);
    lbl3.opacity(1);
    diffArrow.opacity(1);
    diffGhost.opacity(0.5);
    lblD.opacity(1);
  }

  const bodies: Record<string, () => ThreadGenerator> = {
    *["two-solutions"]() {
      const b = beats("two-solutions");
      setTop("Two solutions of one system");
      setCaption("Both (3, 0) and (1, 1) satisfy x + 2y = 3 and 2x + 4y = 6");
      yield* all(dot1.opacity(1, b.d1!), lbl1.opacity(1, b.d1!));
      yield* all(dot2.opacity(1, b.d2!), lbl2.opacity(1, b.d2!));
      yield* all(dot1.size(28, b.up!), dot2.size(28, b.up!));
      yield* all(dot1.size(20, b.down!), dot2.size(20, b.down!));
      yield* waitFor(b.hold!);
    },
    *difference() {
      const b = beats("difference");
      setTop("Subtract them");
      setCaption("x₁ − x₂ = (2, −1). Then A(x₁ − x₂) = A x₁ − A x₂ = b − b = 0.");
      yield* diffArrow.opacity(1, b.draw!);
      yield* waitFor(b.hold!);
      setCaption("Slide that same arrow to the origin — nothing about it changes but where it starts.");
      // The ghost is placed exactly under the arrow, so revealing it changes no
      // pixel; it only becomes visible as the arrow departs.
      diffGhost.opacity(0.5);
      yield* slide(1, b.slide!, easeInOutCubic);
      setCaption("Read from the origin it is a solution of A x = 0 — a homogeneous solution.");
      yield* lblD.opacity(1, b.label!);
      yield* diffArrow.lineWidth(8, b.up!);
      yield* diffArrow.lineWidth(5, b.down!);
      yield* waitFor(b.hold2!);
    },
    *["predict-generate"]() {
      const b = beats("predict-generate");
      setTop("Before adding it back");
      setCaption("A x₁ = b, and A(x₁ − x₂) = 0. Both are on screen.");
      yield* waitFor(b.ask!);
      setCaption(
        "Predict: what does A do to x₁ + (x₁ − x₂)? Is the result a solution — and if so, which point?",
      );
      yield* waitFor(b.think!);
    },
    *generate() {
      const b = beats("generate");
      setTop("Add it back to make more");
      setCaption("x₁ + (x₁ − x₂) = (5, −1) — a third solution, with no re-solving");
      yield* genArrow.opacity(1, b.arrow!);
      yield* all(dot3.opacity(1, b.dot!), lbl3.opacity(1, b.dot!));
      yield* dot3.size(28, b.up!);
      yield* dot3.size(20, b.down!);
      yield* waitFor(b.hold!);
    },
    *["null-line"]() {
      const b = beats("null-line");
      setTop("The homogeneous line");
      setCaption("Every difference lies on Null(A): the line { t·(2, −1) } through the origin");
      yield* nullLine.opacity(1, b.draw!);
      yield* nullLine.lineWidth(6, b.up!);
      yield* nullLine.lineWidth(4, b.down!);
      yield* waitFor(b.hold!);
    },
    *translate() {
      const b = beats("translate");
      setTop("The solution set is the null line, shifted");
      setCaption("Sol(A, b) = xₚ + Null(A): the null space carried off the origin");
      yield* all(offset.opacity(1, b.offset!), lblXp.opacity(1, b.offset!));
      yield* solLine.opacity(1, b.line!);
      setCaption("It is affine — parallel to Null(A), but off the origin (through xₚ, not 0)");
      yield* solLine.lineWidth(6, b.up!);
      yield* solLine.lineWidth(4, b.down!);
      yield* waitFor(b.hold!);
    },
    // The three cases are UNRELATED configurations of the same apparatus, so
    // each snaps to its own readable first frame (a tween between them would
    // animate a transition that means nothing) — and each is its own chapter,
    // so Prev/Next can reach "empty" and "a point" instead of only the line.
    *["case-empty"]() {
      const b = beats("case-empty");
      setTop("Case: empty");
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
      diffArrow.opacity(0);
      diffGhost.opacity(0);
      lblD.opacity(0);
      pointMark.opacity(0);
      emptyMark.opacity(1);
      nullLine.opacity(1);
      yield* emptyMark.scale(1.12, b.pause!);
      yield* emptyMark.scale(1, b.pause2!);
      yield* waitFor(b.hold!);
    },
    *["case-point"]() {
      const b = beats("case-point");
      setTop("Case: a single point");
      setCaption("Trivial null space (independent columns) ⇒ exactly one solution point");
      emptyMark.opacity(0);
      nullLine.opacity(0);
      solLine.opacity(0);
      genArrow.opacity(0);
      diffArrow.opacity(0);
      diffGhost.opacity(0);
      lblD.opacity(0);
      dot2.opacity(0);
      lbl2.opacity(0);
      dot3.opacity(0);
      lbl3.opacity(0);
      offset.opacity(1);
      lblXp.opacity(1);
      dot1.opacity(1);
      lbl1.opacity(0); // avoid stacking "x₁ = (3,0)" on the point-case caption
      pointMark.opacity(1);
      yield* dot1.size(28, b.up!);
      yield* dot1.size(20, b.down!);
      yield* waitFor(b.hold!);
    },
    *["case-line"]() {
      const b = beats("case-line");
      setTop("Case: a line");
      setCaption("Nontrivial Null(A) and a reachable b ⇒ the null line, shifted: Sol = xₚ + Null(A)");
      showGeneralCase();
      yield* solLine.lineWidth(6, b.up!);
      yield* solLine.lineWidth(4, b.down!);
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of SOLUTION_SETS_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
