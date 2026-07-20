import { Circle, Line, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { EIGEN_LESSON_EXAMPLE } from "../../lessons/exampleData";
import {
  analyzeEigen2x2,
  matrixVectorMultiply,
  normalizeVector,
  requireMatrixExample,
  scaleVector,
  stabilizeDirection,
  type Matrix2x2,
  type Vector2 as MathV,
} from "../../math";
import { EIGENVECTOR_SEGMENTS } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  makeArrow,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 4: eigenvectors as invariant directions; eigenvalues as signed scale.
 * All eigen geometry comes from analyzeEigen2x2 — never hardcoded independently.
 *
 * Choreography (learner-first):
 * - Keep ghost v while Av moves so input vs output is visible.
 * - Highlight full lines through the origin (same line ≠ same direction).
 * - Act out λ > 1 / λ < 0 / λ = 0 with length and flip, not matrix morph alone.
 */

const MAIN = EIGEN_LESSON_EXAMPLE.matrix as Matrix2x2;
const SCALAR = requireMatrixExample("eigen-repeated-diagonalizable")
  .matrix as Matrix2x2;
const DEFECTIVE = requireMatrixExample("eigen-repeated-defective")
  .matrix as Matrix2x2;
const ROTATION = requireMatrixExample("eigen-no-real").matrix as Matrix2x2;
const NEGATIVE = requireMatrixExample("eigen-negative").matrix as Matrix2x2;
const ZERO_EIG = requireMatrixExample("eigen-zero").matrix as Matrix2x2;

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

const fmt = (n: number): string => {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
};

function unitDir(v: MathV): MathV {
  const n = normalizeVector(v);
  if (!n) return [1, 0];
  return stabilizeDirection(n);
}

function eigenDirections(m: Matrix2x2): MathV[] {
  const analysis = analyzeEigen2x2(m);
  if (analysis.kind === "complex") return [];
  if (analysis.kind === "distinct-real") {
    return analysis.pairs
      .map((p) => normalizeVector(p.eigenvector))
      .filter((v): v is MathV => v !== null)
      .map((v) => scaleVector(stabilizeDirection(v), 1.6));
  }
  return analysis.eigenspaceBasis
    .map((v) => normalizeVector(v))
    .filter((v): v is MathV => v !== null)
    .map((v) => scaleVector(stabilizeDirection(v), 1.6));
}

function firstEigenpair(m: Matrix2x2): { lambda: number; dir: MathV } | null {
  const analysis = analyzeEigen2x2(m);
  if (analysis.kind === "distinct-real" && analysis.pairs[0]) {
    const p = analysis.pairs[0];
    const n = normalizeVector(p.eigenvector);
    if (!n) return null;
    return { lambda: p.eigenvalue, dir: stabilizeDirection(n) };
  }
  if (analysis.kind === "repeated-real" && analysis.eigenspaceBasis[0]) {
    const n = normalizeVector(analysis.eigenspaceBasis[0]);
    if (!n) return null;
    return { lambda: analysis.eigenvalue, dir: stabilizeDirection(n) };
  }
  return null;
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

  /** 0 = show v, 1 = show Av for the fan result arrows. */
  const applyT = createSignal(0);
  /** Ghost (original v) opacity. */
  const ghostOpacity = createSignal(0);
  /** Demo arrow along one eigendirection: tip = demoScale * demoDir. */
  const demoScale = createSignal(0);
  const demoDx = createSignal(1);
  const demoDy = createSignal(0);
  const demoOpacity = createSignal(0);
  const demoGhostOpacity = createSignal(0);
  const demoGhostScale = createSignal(1.6);

  const grid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  grid.opacity(0.45);
  view.add(grid);

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

  // Eigendirection lines (dashed — full line through origin).
  const eigenLines: Line[] = [0, 1].map(() => {
    const line = new Line({
      stroke: ROLE.selected,
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
    const ghostTip = px(scaleVector(d, demoGhostScale()));
    // Perpendicular screen offset so the label never sits on the arrow.
    return ghostTip.add(new Vector2(-d[1] * 46, -d[0] * 46));
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

  function* morphTo(target: Matrix2x2, dur: number): ThreadGenerator {
    yield* all(
      ma(target[0][0], dur, easeInOutCubic),
      mb(target[0][1], dur, easeInOutCubic),
      mc(target[1][0], dur, easeInOutCubic),
      md(target[1][1], dur, easeInOutCubic),
    );
  }

  function updateEigenGraphics(m: Matrix2x2): void {
    const dirs = eigenDirections(m);
    for (let i = 0; i < 2; i += 1) {
      const d = dirs[i];
      if (!d) {
        eigenLines[i]!.opacity(0);
        eigenArrows[i]!.opacity(0);
        continue;
      }
      const tip = px(d);
      const anti = px(scaleVector(d, -1));
      eigenLines[i]!.points([anti, tip]);
      eigenLines[i]!.opacity(0.9);
      eigenArrows[i]!.points([new Vector2(0, 0), tip]);
      eigenArrows[i]!.opacity(1);
    }
  }

  function hideEigenGraphics(): void {
    for (let i = 0; i < 2; i += 1) {
      eigenLines[i]!.opacity(0);
      eigenArrows[i]!.opacity(0);
    }
  }

  function setDemoDirection(dir: MathV): void {
    const u = unitDir(dir);
    demoDx(u[0]);
    demoDy(u[1]);
  }

  const seconds = Object.fromEntries(
    EIGENVECTOR_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  const bodies: Record<string, () => ThreadGenerator> = {
    *fan() {
      setTop("A fan of directions");
      setCaption("Most tips will leave their original ray");
      applyT(0);
      ghostOpacity(0);
      demoOpacity(0);
      demoGhostOpacity(0);
      demoLambdaOpacity(0);
      showPairLabels(0);
      hideEigenGraphics();
      yield* waitFor(seconds.fan);
    },

    *apply() {
      setTop("Most directions turn");
      setCaption("v is the input · Av is its image under A");
      // Reveal ghosts, then morph results toward Av.
      showPairLabels(1);
      yield* ghostOpacity(0.85, 0.4);
      yield* applyT(1, 2.2, easeInOutCubic);
      yield* waitFor(seconds.apply - 2.6);
    },

    *highlight() {
      setTop("Some stay on their line");
      setCaption("Dashed line through origin — same line, maybe flipped");
      showPairLabels(0);
      // Seek-friendly: teaching frame visible at segment start.
      for (const a of fanArrows) a.opacity(0.2);
      ghostOpacity(0.2);
      updateEigenGraphics(MAIN);
      const pair = firstEigenpair(MAIN);
      if (pair) {
        setDemoDirection(pair.dir);
        const base = 1.0;
        demoGhostScale(base);
        demoScale(base * pair.lambda);
        demoGhostOpacity(0.9);
        demoOpacity(1);
        demoLambda.text(`λ ≈ ${fmt(pair.lambda)}`);
        demoLambdaOpacity(1);
      }
      yield* waitFor(seconds.highlight);
    },

    *equation() {
      demoLambdaOpacity(0);
      const analysis = analyzeEigen2x2(MAIN);
      const lambdas =
        analysis.kind === "distinct-real"
          ? analysis.pairs.map((p) => fmt(p.eigenvalue)).join(", ")
          : "?";
      setTop("Av = λv");
      setCaption(`λ ≈ ${lambdas} · zero vector is never an eigenvector`);
      yield* waitFor(seconds.equation);
    },

    *lambdas() {
      // Hide fan clutter — held demos on one line only.
      for (const a of fanArrows) a.opacity(0);
      ghostOpacity(0);
      hideEigenGraphics();
      demoOpacity(0);
      demoGhostOpacity(0);
      demoLambdaOpacity(0);

      // --- Stretch (λ > 1) on NEGATIVE's x-axis ---
      // Ghost length = |v|, tip length = λ·|v|, so the readout is exactly λ.
      setTop("λ > 1 stretches");
      setCaption("Same line — tip moves farther from the origin");
      yield* morphTo(NEGATIVE, 0.8);
      setDemoDirection([1, 0]);
      demoGhostScale(1.0);
      demoScale(1.0);
      demoGhostOpacity(0.85);
      demoOpacity(1);
      demoLambda.text("λ = 2");
      demoLambdaOpacity(1);
      yield* demoScale(2.0, 1.4, easeInOutCubic);
      yield* waitFor(1.2);

      // --- Reverse (λ < 0) on NEGATIVE's y-axis ---
      setTop("λ < 0 reverses");
      setCaption("Same line — tip flips to the opposite ray");
      setDemoDirection([0, 1]);
      demoGhostScale(1.5);
      demoScale(1.5);
      demoGhostOpacity(0.9);
      demoLambda.text("λ = −1");
      yield* demoScale(-1.5, 1.6, easeInOutCubic);
      yield* waitFor(1.6);

      // --- Collapse (λ = 0) ---
      setTop("λ = 0 collapses");
      setCaption("Same line — tip retracts to the origin");
      yield* morphTo(ZERO_EIG, 0.8);
      setDemoDirection([0, 1]);
      demoGhostScale(1.6);
      demoScale(1.6);
      demoGhostOpacity(0.9);
      demoLambda.text("λ = 0");
      yield* demoScale(0, 1.6, easeInOutCubic);
      // Segment budget: 0.8+1.4+1.2+1.6+1.6+0.8+1.6 = 9.0s (fan hide is sync).
      yield* waitFor(Math.max(0, seconds.lambdas - 9.0));
    },

    *scalar() {
      setTop("Scalar: every direction");
      setCaption("A = λI — every nonzero arrow stays on its ray");
      demoOpacity(0);
      demoGhostOpacity(0);
      demoLambdaOpacity(0);
      yield* morphTo(SCALAR, 1.0);
      applyT(1);
      // Brighten whole fan: for λI, Av is parallel to v.
      yield* all(
        ...fanArrows.map((a) => a.opacity(0.95, 0.5)),
        ghostOpacity(0.55, 0.5),
      );
      updateEigenGraphics(SCALAR);
      // Scalar: two basis directions from analysis (whole plane is eigenspace).
      yield* waitFor(seconds.scalar - 1.5);
    },

    *defective() {
      setTop("Defective: only one line");
      setCaption("Repeated λ — only one eigendirection (not two)");
      demoOpacity(0);
      demoGhostOpacity(0);
      demoLambdaOpacity(0);
      yield* morphTo(DEFECTIVE, 1.0);
      updateEigenGraphics(DEFECTIVE);
      // Ensure second line stays hidden (analysis returns one basis vector).
      eigenLines[1]!.opacity(0);
      eigenArrows[1]!.opacity(0);
      yield* all(...fanArrows.map((a) => a.opacity(0.2, 0.4)), ghostOpacity(0.15, 0.4));
      yield* waitFor(seconds.defective - 1.4);
    },

    *rotation() {
      setTop("No real eigenvectors");
      setCaption("Rotation turns every arrow — complex λ still possible");
      hideEigenGraphics();
      demoOpacity(0);
      demoGhostOpacity(0);
      demoLambdaOpacity(0);
      yield* morphTo(ROTATION, 1.0);
      // Ghost fan at v; orange tips sweep to Av (90° for this matrix).
      applyT(0);
      yield* all(
        ...fanArrows.map((a) => a.opacity(0.95, 0.35)),
        ghostOpacity(0.85, 0.35),
      );
      yield* applyT(1, 1.8, easeInOutCubic);
      yield* waitFor(Math.max(0, seconds.rotation - 3.15));
    },

    *summary() {
      setTop("Invariant directions");
      setCaption("Eigenvector: nonzero direction A keeps; λ = signed scale");
      // Restore MAIN teaching state as the landing frame.
      yield* morphTo(MAIN, 1.0);
      applyT(1);
      ghostOpacity(0.35);
      for (const a of fanArrows) a.opacity(0.35);
      updateEigenGraphics(MAIN);
      demoOpacity(0);
      demoGhostOpacity(0);
      demoLambdaOpacity(0);
      showPairLabels(0);
      yield* waitFor(seconds.summary - 1.0);
    },
  };

  for (const segment of EIGENVECTOR_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
