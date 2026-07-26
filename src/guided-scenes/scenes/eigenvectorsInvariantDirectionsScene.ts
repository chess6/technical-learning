import { Circle, Line, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import {
  lerpIdentityToMatrix,
  matrixVectorMultiply,
  normalizeVector,
  scaleVector,
  stabilizeDirection,
  type Matrix2x2,
  type Vector2 as MathV,
} from "../../math";
import {
  COLLAPSE,
  DEFECTIVE,
  MAIN,
  MAIN_FIRST,
  MAIN_PAIRS,
  NEGATIVE,
  REVERSE,
  ROTATION,
  SCALAR,
  STRETCH,
  ZERO_EIG,
  demoBaseFor,
  eigenDirections,
  type Eigenpair,
} from "./eigenSceneData";
import { EIGENVECTOR_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatSceneNumber,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
  makeTransformedGrid,
  runSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 4: eigenvectors as invariant directions; eigenvalues as signed scale.
 * All eigen geometry comes from analyzeEigen2x2 — never hardcoded independently.
 *
 * Choreography (learner-first):
 * - Deform the whole grid with A (the base visual language of linear algebra):
 *   as space stretches/rotates, most directions turn but eigenlines stay put,
 *   which is *why* eigenvectors land on their own line. The transformed grid is
 *   built from the shared `lerpIdentityToMatrix` × `matrixVectorMultiply` path —
 *   never ad-hoc slopes — and rides the fan exactly because
 *   lerp(v, Av, t) = (lerp(I, A, t)) · v.
 * - Keep ghost v while Av moves so input vs output is visible.
 * - Highlight full lines through the origin (same line ≠ same direction).
 * - Act out λ > 1 / λ < 0 / λ = 0 with length and flip, not matrix morph alone.
 *
 * Three rules this scene now holds itself to (July 2026 guided-animation audit,
 * which found the earlier cut violating all three):
 *
 * 1. **No pre-deformed grid, and no snap.** Every case matrix is swapped in
 *    *at the identity* — where `lerpIdentityToMatrix(M, 0) = I` for every M, so
 *    the swap is invisible by construction — and then applied with the grid on
 *    screen. `toIdentity()` + `setMatrixAtIdentity()` are the only sanctioned
 *    way to change matrices, which is what removes the `applyT(0)` snap that
 *    used to jolt every fan arrow entering `rotation`.
 * 2. **No hidden morphs.** Time is never spent animating something invisible.
 *    The old `scalar` beat burned a full second morphing a matrix while the
 *    grid, fan, ghosts and demo were all at opacity 0; matrix swaps behind a
 *    hidden grid are now instantaneous, and the seconds go to visible motion.
 * 3. **Every λ is derived, geometry included.** `requireEigenpair` reads both
 *    the eigenvalue and its direction from `analyzeEigen2x2`, and the demo
 *    arrow's landing point is `base · λ` — so the label and the picture are
 *    computed from the same number and cannot drift apart. Editing a matrix in
 *    `src/math/examples.ts` now fails loudly instead of silently relabeling.
 */

/** Fan chosen so several directions clearly leave their ray under MAIN.
 * Lengths stay inside the overlay-clear teaching band (~±2.5 units). */
const FAN: MathV[] = [
  [1.15, 0.15],
  [0.95, 0.65],
  [0.35, 1.1],
  [-0.2, 1.1],
  [-0.9, 0.75],
  [-1.1, 0.2],
];

/** Index used for explicit v / Av tip labels. */
const LABEL_FAN_INDEX = 1;

const px = (v: readonly [number, number]): Vector2 =>
  new Vector2(v[0] * SCALE, -v[1] * SCALE);

const fmt = (n: number) => formatSceneNumber(n);
const SCENE_ID = "eigenvectors-invariant-directions";

function unitDir(v: MathV): MathV {
  const n = normalizeVector(v);
  if (!n) return [1, 0];
  return stabilizeDirection(n);
}

export const eigenvectorsInvariantDirectionsScene = makeScene2D(function* (
  view,
) {
  view.fill(ROLE.background);

  const ma = createSignal(MAIN[0][0]);
  const mb = createSignal(MAIN[0][1]);
  const mc = createSignal(MAIN[1][0]);
  const md = createSignal(MAIN[1][1]);
  const matrix = (): Matrix2x2 => [
    [ma(), mb()],
    [mc(), md()],
  ];

  /** 0 = show v, 1 = show Av for the fan result arrows. Also drives the
   * transformed grid so the whole space deforms in lockstep with the fan. */
  const applyT = createSignal(0);
  /** Opacity of the deforming grid — revealed only where "the whole space
   * moves" is the point (apply, highlight, scalar, defective, rotation). */
  const gridDeformOpacity = createSignal(0);
  /** Ghost (original v) opacity. */
  const ghostOpacity = createSignal(0);
  /** Demo arrow along one eigendirection: tip = demoScale * demoDir. */
  const demoScale = createSignal(0);
  const demoDx = createSignal(1);
  const demoDy = createSignal(0);
  const demoOpacity = createSignal(0);
  const demoGhostOpacity = createSignal(0);
  const demoGhostScale = createSignal(1.6);

  // Faint identity grid: the "before" reference the transformed grid moves off.
  const grid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  grid.opacity(0.3);
  view.add(grid);

  // The whole space deforming under A. Endpoints come from the shared
  // matrix→screen path inside makeTransformedGrid; the interpolation from
  // identity to A is the tested `lerpIdentityToMatrix` educational transition.
  const tGrid = makeTransformedGrid(
    () => lerpIdentityToMatrix(matrix(), applyT()),
    OVERLAY_CLEAR_HALF_EXTENT,
  );
  tGrid.opacity(() => gridDeformOpacity());
  view.add(tGrid);

  const origin = new Circle({ size: 14, fill: ROLE.text, opacity: 1 });
  view.add(origin);

  // Results: morph from v toward Av (drawn under ghosts so v stays visible).
  const fanArrows = FAN.map((v) => {
    const arrow = makeArrow(ROLE.transformed, 5);
    arrow.points(() => {
      const Av = matrixVectorMultiply(matrix(), v);
      const tip: MathV = [
        v[0] + (Av[0] - v[0]) * applyT(),
        v[1] + (Av[1] - v[1]) * applyT(),
      ];
      return [new Vector2(0, 0), px(tip)];
    });
    arrow.opacity(0.9);
    view.add(arrow);
    return arrow;
  });

  // Ghosts: stay at original v (input). Drawn above Av so labels read clearly.
  for (const v of FAN) {
    const arrow = makeArrow(ROLE.original, 4);
    arrow.points([new Vector2(0, 0), px(v)]);
    arrow.opacity(() => ghostOpacity());
    view.add(arrow);
  }

  const showPairLabels = createSignal(0);
  const labelV = FAN[LABEL_FAN_INDEX]!;
  const vLabel = makeLabel("v", ROLE.original, 32);
  const avLabel = makeLabel("Av", ROLE.transformed, 32);
  vLabel.opacity(() => showPairLabels());
  avLabel.opacity(() => (showPairLabels() > 0 && applyT() > 0.12 ? 1 : 0));
  vLabel.position(() => px(labelV).add(new Vector2(18, -22)));
  avLabel.position(() => {
    const Av = matrixVectorMultiply(matrix(), labelV);
    const tip: MathV = [
      labelV[0] + (Av[0] - labelV[0]) * applyT(),
      labelV[1] + (Av[1] - labelV[1]) * applyT(),
    ];
    return px(tip).add(new Vector2(18, 18));
  });
  view.add(vLabel);
  view.add(avLabel);

  // Eigendirection lines (dashed — full line through origin). Each line wears
  // the colour of the arrow drawn on it: the two eigendirections are a CO-EQUAL
  // pair, so they take the co-equal pair roles rather than both wearing gold
  // (which is also the "selected/under discussion" role, and which the
  // derivation scene assigned differently — the audit's colour-drift finding).
  const eigenLines: Line[] = [0, 1].map((i) => {
    const line = new Line({
      stroke: i === 0 ? ROLE.basis1 : ROLE.basis2,
      lineWidth: 3,
      lineDash: [12, 8],
      opacity: 0,
      points: [new Vector2(0, 0), new Vector2(0, 0)],
    });
    view.add(line);
    return line;
  });

  const eigenArrows = [0, 1].map((i) => {
    const arrow = makeArrow(i === 0 ? ROLE.basis1 : ROLE.basis2, 6);
    arrow.opacity(0);
    arrow.points([new Vector2(0, 0), new Vector2(0, 0)]);
    view.add(arrow);
    return arrow;
  });

  // Demo arrow + ghost for λ stretch / reverse / collapse.
  const demoGhost = makeArrow(ROLE.original, 5);
  demoGhost.opacity(() => demoGhostOpacity());
  demoGhost.points(() => {
    const d: MathV = [demoDx(), demoDy()];
    return [new Vector2(0, 0), px(scaleVector(d, demoGhostScale()))];
  });
  view.add(demoGhost);

  const demoArrow = makeArrow(ROLE.result, 7);
  demoArrow.opacity(() => demoOpacity());
  demoArrow.points(() => {
    const d: MathV = [demoDx(), demoDy()];
    return [new Vector2(0, 0), px(scaleVector(d, demoScale()))];
  });
  view.add(demoArrow);

  // λ readout tied to the demo geometry: the number equals demoScale /
  // demoGhostScale, so it is exactly the signed scale of Av relative to v.
  const demoLambdaOpacity = createSignal(0);
  const demoLambda = makeLabel("", ROLE.result, 34);
  demoLambda.opacity(() => demoLambdaOpacity());
  demoLambda.position(() => {
    const d: MathV = [demoDx(), demoDy()];
    // Beside the SHAFT, not at the tip: parked at the tip, a wide readout
    // ("λ = -1") overlapped its own arrowhead. Perpendicular screen offset.
    const mid = px(scaleVector(d, demoGhostScale() * 0.55));
    return mid.add(new Vector2(-d[1] * 66, -d[0] * 66));
  });
  view.add(demoLambda);

  const top = makeOverlayLabel("", ROLE.text, 38);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 30);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const setTop = (t: string) => top.text(t);
  const setCaption = (t: string) => caption.text(t);

  setTop("Directions from the origin");
  setCaption("Which arrows stay on their line under A?");
  top.opacity(1);
  caption.opacity(1);

  /**
   * Bring space back to the identity so a new matrix can be swapped in without
   * a jump. Tweened while the grid is on screen — the un-deformation is itself
   * worth watching, and it is what replaced the `applyT(0)` snap that used to
   * jolt every fan arrow at the top of `rotation`. Instant only when nothing
   * bound to `applyT` is visible, where a tween would be time spent on nothing.
   */
  function* toIdentity(dur: number): ThreadGenerator {
    if (applyT() === 0) return;
    if (gridDeformOpacity() > 0.01) {
      yield* applyT(0, dur, easeInOutCubic);
      return;
    }
    applyT(0);
  }

  /**
   * Write the live matrix. Legal ONLY at the identity (`applyT() === 0`), where
   * `lerpIdentityToMatrix(M, 0) = I` and every fan tip sits at its own `v`
   * regardless of M — so the swap is invisible by construction and costs no
   * time. Always `yield* toIdentity(...)` first; that pairing is what lets each
   * case beat *show* its deformation instead of fading in a pre-deformed grid.
   */
  function setMatrixAtIdentity(m: Matrix2x2): void {
    ma(m[0][0]);
    mb(m[0][1]);
    mc(m[1][0]);
    md(m[1][1]);
  }

  /** Directions the eigenline apparatus is currently drawn at. */
  let placedDirs: MathV[] = [];

  function placeEigenGraphics(dirs: readonly MathV[]): void {
    for (let i = 0; i < 2; i += 1) {
      const d = dirs[i];
      if (!d) continue;
      eigenLines[i]!.points([px(scaleVector(d, -1)), px(d)]);
      eigenArrows[i]!.points([new Vector2(0, 0), px(d)]);
    }
    placedDirs = dirs.slice();
  }

  /**
   * Fade the eigenlines of `m` in, and any surplus line out.
   *
   * Re-pointing a line that is ON SCREEN teleports it — entering `stretch`,
   * A's diagonal eigenline jumped onto NEGATIVE's vertical one in a single
   * frame, which is the same snap this scene exists to have stopped doing. So
   * a *moving* apparatus is retired first and then arrives at its new position;
   * an unchanged one (NEGATIVE and ZERO_EIG share both axes) is left alone.
   */
  function* showEigenGraphics(m: Matrix2x2, dur = 0.45): ThreadGenerator {
    const dirs = eigenDirections(m);
    const moving =
      dirs.length !== placedDirs.length ||
      dirs.some((d, i) => {
        const was = placedDirs[i];
        return !was || Math.hypot(d[0] - was[0], d[1] - was[1]) > 1e-9;
      });
    const onScreen = eigenLines.some((line) => line.opacity() > 0.01);
    if (moving && onScreen) yield* hideEigenGraphics(dur * 0.6);
    placeEigenGraphics(dirs);
    yield* all(
      ...[0, 1].flatMap((i) => [
        eigenLines[i]!.opacity(i < dirs.length ? 0.9 : 0, dur),
        eigenArrows[i]!.opacity(i < dirs.length ? 1 : 0, dur),
      ]),
    );
  }

  function* hideEigenGraphics(dur = 0.35): ThreadGenerator {
    yield* all(
      ...[0, 1].flatMap((i) => [
        eigenLines[i]!.opacity(0, dur),
        eigenArrows[i]!.opacity(0, dur),
      ]),
    );
  }

  function setDemoDirection(dir: MathV): void {
    const u = unitDir(dir);
    demoDx(u[0]);
    demoDy(u[1]);
  }

  /**
   * Park the demo arrow + ghost on `pair`'s line at its un-transformed length,
   * with the λ label showing. Nothing has moved yet: the reveal is the caller's
   * `demoScale(base * λ, …)`, and because that target is computed from the same
   * λ the label prints, the number and the picture cannot disagree.
   */
  function* armDemo(
    pair: Eigenpair,
    // `label` exists so `highlight` can say "scale" before `equation` has
    // earned the name λ — name-after-intuition, on the same readout object.
    opts: { fadeIn?: number; label?: (lambda: number) => string } = {},
  ): ThreadGenerator {
    const { fadeIn = 0.4, label = (l: number) => `λ = ${fmt(l)}` } = opts;
    const base = demoBaseFor(pair.lambda);
    setDemoDirection(pair.dir);
    demoGhostScale(base);
    demoScale(base);
    demoLambda.text(label(pair.lambda));
    yield* all(
      demoGhostOpacity(0.9, fadeIn),
      demoOpacity(1, fadeIn),
      demoLambdaOpacity(1, fadeIn),
    );
  }

  /** The armed demo's reveal: carry the tip to Av = λ·v over `dur`. */
  function* revealDemo(pair: Eigenpair, dur: number): ThreadGenerator {
    yield* demoScale(demoBaseFor(pair.lambda) * pair.lambda, dur, easeInOutCubic);
  }

  function* hideDemo(dur = 0.3): ThreadGenerator {
    yield* all(
      demoOpacity(0, dur),
      demoGhostOpacity(0, dur),
      demoLambdaOpacity(0, dur),
    );
  }

  const beats = (segmentId: string) => requireBeats(SCENE_ID, segmentId);

  const bodies: Record<string, () => ThreadGenerator> = {
    *fan() {
      const b = beats("fan");
      setTop("A fan of directions");
      setCaption("Six directions from the origin — watch which tips leave their ray");
      // Establishing frame at t = 0: direct sets, because there is nothing yet
      // to tween from. Every later state change in this scene is animated.
      applyT(0);
      gridDeformOpacity(0);
      ghostOpacity(0);
      demoOpacity(0);
      demoGhostOpacity(0);
      demoLambdaOpacity(0);
      showPairLabels(0);
      for (let i = 0; i < 2; i += 1) {
        eigenLines[i]!.opacity(0);
        eigenArrows[i]!.opacity(0);
      }
      // Nothing moves in this beat: it is the paused establishing frame, and
      // runSegment holds it for the segment's full length so the learner can
      // take in the fan before A touches it.
      yield* waitFor(b.hold!);
    },

    *apply() {
      const b = beats("apply");
      setTop("The whole grid moves");
      setCaption("Space follows A — ghost v · bright tip Av · most directions turn");
      showPairLabels(1);
      yield* ghostOpacity(0.85, b.ghostsIn!);
      // One signal drives the grid and the fan, so the deforming space and the
      // moving tips cannot drift apart: lerp(v, Av, t) = lerp(I, A, t) · v.
      yield* all(gridDeformOpacity(0.85, b.deform!), applyT(1, b.deform!, easeInOutCubic));
      yield* waitFor(b.hold!);
    },

    *highlight() {
      const b = beats("highlight");
      setTop("Some lines stay put");
      setCaption("Most tips swung off their ray — but two lines map onto themselves");
      showPairLabels(0);
      yield* all(
        ...fanArrows.map((a) => a.opacity(0.2, b.focus!)),
        ghostOpacity(0.2, b.focus!),
        gridDeformOpacity(0.4, b.focus!),
      );
      yield* showEigenGraphics(MAIN, b.linesIn!);
      // The scale factor is READ OFF the picture, not asserted: the ghost sits
      // at `base` and the result lands at `base · λ`, both from the analyzer.
      yield* armDemo(MAIN_FIRST, { fadeIn: b.arm!, label: (l) => `scale = ${fmt(l)}` });
      setCaption(
        `This line maps onto itself — the tip only scales, by ${fmt(MAIN_FIRST.lambda)}`,
      );
      yield* revealDemo(MAIN_FIRST, b.reveal!);
      yield* waitFor(b.hold!);
    },

    *equation() {
      const b = beats("equation");
      // Name-after-intuition: the line-staying behavior was felt; now name it.
      setTop("Call them eigenvectors");
      setCaption("Nonzero directions A only scales — Av = λv");
      yield* waitFor(b.leadIn!);
      const lambdas = MAIN_PAIRS.map((p) => fmt(p.lambda)).join(", ");
      setTop("Av = λv");
      setCaption(`λ ≈ ${lambdas} · the zero vector is never an eigenvector`);
      // Rename the SAME readout rather than swapping in a new one: the number
      // the learner has been watching is the thing that just got a name.
      demoLambda.text(`λ = ${fmt(MAIN_FIRST.lambda)}`);
      yield* waitFor(b.name!);
      yield* waitFor(b.hold!);
    },

    *stretch() {
      const b = beats("stretch");
      setTop("λ > 1 stretches");
      setCaption("Retire the fan — one line, one arrow, and the signed scale on it");
      yield* all(
        ...fanArrows.map((a) => a.opacity(0, b.clear!)),
        ghostOpacity(0, b.clear!),
        gridDeformOpacity(0, b.clear!),
        hideDemo(b.clear!),
      );
      // With the grid hidden this return is instant and the swap shows nothing,
      // so neither costs time. The old cut spent 0.8s morphing a matrix that
      // no visible node was bound to — a full second of blank screen.
      yield* toIdentity(b.clear!);
      setMatrixAtIdentity(NEGATIVE);
      // Both of this matrix's eigenlines are the axes, and ZERO_EIG's are the
      // same two — so this apparatus is placed once and persists unchanged
      // across stretch → predict → reverse → collapse.
      yield* showEigenGraphics(NEGATIVE, b.linesIn!);
      setCaption("Same line — the tip just moves farther from the origin");
      yield* armDemo(STRETCH, { fadeIn: b.arm! });
      yield* revealDemo(STRETCH, b.reveal!);
      yield* waitFor(b.hold!);
    },

    *["predict-reverse"]() {
      const b = beats("predict-reverse");
      setTop("Predict");
      // Caption FIRST: set after the re-arm, a learner who jumps straight to
      // this chapter reads the previous beat's caption under a "Predict"
      // heading for the better part of a second.
      setCaption(
        `Av = λv, and on this line λ = ${fmt(REVERSE.lambda)}. Where does the tip land?`,
      );
      // A prediction, not a guess: Av = λv was named two beats ago, the line is
      // already on screen, and λ for THIS line is stated outright. Everything
      // the answer is built from is visible and fixed before the question.
      yield* hideDemo(b.clear!);
      yield* armDemo(REVERSE, { fadeIn: b.arm! });
      yield* waitFor(b.think!);
    },

    *reverse() {
      const b = beats("reverse");
      setTop("λ < 0 reverses");
      // The reveal resolves the prediction concretely, on the same arrow the
      // question was asked about — nothing is faded out and replaced.
      yield* revealDemo(REVERSE, b.reveal!);
      setCaption("Same line, opposite ray — the length is kept, the direction is not");
      yield* waitFor(b.hold!);
    },

    *collapse() {
      const b = beats("collapse");
      setTop("λ = 0 collapses");
      yield* hideDemo(b.clear!);
      yield* toIdentity(b.clear!);
      setMatrixAtIdentity(ZERO_EIG);
      yield* showEigenGraphics(ZERO_EIG, b.linesIn!);
      yield* armDemo(COLLAPSE, { fadeIn: b.arm! });
      setCaption("Lesson 3's collapse along one line — zero scale kills the length");
      yield* revealDemo(COLLAPSE, b.reveal!);
      yield* waitFor(b.hold!);
    },

    *scalar() {
      const b = beats("scalar");
      setTop("Scalar: every direction");
      setCaption("Space is back at the identity — now watch A = λI act on all of it");
      yield* hideDemo(b.clear!);
      // The λ beats left applyT at 0, so this swap is invisible and free. What
      // follows is the FIRST sight of this matrix acting: the grid deforms on
      // screen instead of being faded in already deformed.
      setMatrixAtIdentity(SCALAR);
      yield* all(
        ...fanArrows.map((a) => a.opacity(0.95, b.establish!)),
        ghostOpacity(0.55, b.establish!),
        gridDeformOpacity(0.8, b.establish!),
        hideEigenGraphics(b.establish!),
      );
      yield* applyT(1, b.deform!, easeInOutCubic);
      setCaption("Every line came back onto itself — so every direction is an eigendirection");
      yield* showEigenGraphics(SCALAR, b.linesIn!);
      yield* waitFor(b.hold!);
    },

    *defective() {
      const b = beats("defective");
      setTop("Defective: only one line");
      setCaption("Undo A first — space springs back to the identity");
      yield* hideEigenGraphics(b.linesOut!);
      // The grid is on screen, so this return is TWEENED and watchable. It is
      // also what makes the next deformation honest: the learner sees the
      // shear happen rather than arriving pre-cooked under a caption.
      yield* toIdentity(b.reset!);
      setMatrixAtIdentity(DEFECTIVE);
      setCaption("Repeated λ — the grid shears, and just one line survives");
      yield* applyT(1, b.deform!, easeInOutCubic);
      yield* showEigenGraphics(DEFECTIVE, b.linesIn!);
      yield* all(
        ...fanArrows.map((a) => a.opacity(0.25, b.focus!)),
        ghostOpacity(0.2, b.focus!),
      );
      yield* waitFor(b.hold!);
    },

    *rotation() {
      const b = beats("rotation");
      setTop("No real eigenvectors");
      setCaption("Undo it again — every arrow back on its own ray");
      yield* all(
        hideEigenGraphics(b.clear!),
        ...fanArrows.map((a) => a.opacity(0.95, b.clear!)),
        ghostOpacity(0.85, b.clear!),
      );
      // This is the beat whose applyT(0) snap the audit caught: the fan used to
      // jump from Av back to v in a single frame. It is now tweened, and the
      // matrix swap happens at the identity where it cannot show.
      yield* toIdentity(b.reset!);
      setMatrixAtIdentity(ROTATION);
      setCaption("Counterexample: the grid rotates — no line is left in place");
      yield* applyT(1, b.deform!, easeInOutCubic);
      yield* waitFor(b.hold!);
    },

    *summary() {
      const b = beats("summary");
      setTop("Invariant directions");
      setCaption("Back to A one last time");
      yield* toIdentity(b.reset!);
      setMatrixAtIdentity(MAIN);
      yield* applyT(1, b.deform!, easeInOutCubic);
      yield* all(
        showEigenGraphics(MAIN, b.focus!),
        ...fanArrows.map((a) => a.opacity(0.35, b.focus!)),
        ghostOpacity(0.35, b.focus!),
        gridDeformOpacity(0.4, b.focus!),
      );
      setCaption("Eigenvector: nonzero direction A keeps · λ: the signed scale along it");
      yield* waitFor(b.hold!);
    },
  };

  // Measured padding: each body runs, then the segment is padded to its exact
  // authored length, so the rendered timeline matches the step metadata and the
  // chapter markers cannot drift when choreography is edited.
  for (const segment of EIGENVECTOR_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `eigenvectors-invariant-directions.${segment.id}`,
    );
  }
});
