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
  makeArrow,
  makeOverlayLabel,
  makeStaticGrid,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 4: eigenvectors as invariant directions; eigenvalues as signed scale.
 * All eigen geometry comes from analyzeEigen2x2 — never hardcoded independently.
 */

const MAIN = EIGEN_LESSON_EXAMPLE.matrix as Matrix2x2;
const SCALAR = requireMatrixExample("eigen-repeated-diagonalizable")
  .matrix as Matrix2x2;
const DEFECTIVE = requireMatrixExample("eigen-repeated-defective")
  .matrix as Matrix2x2;
const ROTATION = requireMatrixExample("eigen-no-real").matrix as Matrix2x2;
const NEGATIVE = requireMatrixExample("eigen-negative").matrix as Matrix2x2;
const ZERO_EIG = requireMatrixExample("eigen-zero").matrix as Matrix2x2;

const FAN: MathV[] = [
  [1.5, 0],
  [1.2, 0.8],
  [0.6, 1.4],
  [0, 1.5],
  [-0.8, 1.1],
  [-1.4, 0.4],
];

const px = (v: readonly [number, number]): Vector2 =>
  new Vector2(v[0] * SCALE, -v[1] * SCALE);

const fmt = (n: number): string => {
  const r = Math.round(n * 100) / 100;
  return Object.is(r, -0) ? "0" : String(r);
};

function eigenDirections(m: Matrix2x2): MathV[] {
  const analysis = analyzeEigen2x2(m);
  if (analysis.kind === "complex") return [];
  if (analysis.kind === "distinct-real") {
    return analysis.pairs
      .map((p) => normalizeVector(p.eigenvector))
      .filter((v): v is MathV => v !== null)
      .map((v) => scaleVector(stabilizeDirection(v), 2));
  }
  return analysis.eigenspaceBasis
    .map((v) => normalizeVector(v))
    .filter((v): v is MathV => v !== null)
    .map((v) => scaleVector(stabilizeDirection(v), 2));
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

  // Progress 0 = show v, 1 = show Av for the fan.
  const applyT = createSignal(0);

  const grid = makeStaticGrid(3);
  grid.opacity(0.5);
  view.add(grid);

  const origin = new Circle({ size: 14, fill: ROLE.text, opacity: 1 });
  view.add(origin);

  const fanArrows = FAN.map((v) => {
    const arrow = makeArrow(ROLE.dim, 4);
    arrow.points(() => {
      const Av = matrixVectorMultiply(matrix(), v);
      const tip: MathV = [
        v[0] + (Av[0] - v[0]) * applyT(),
        v[1] + (Av[1] - v[1]) * applyT(),
      ];
      return [new Vector2(0, 0), px(tip)];
    });
    arrow.opacity(0.85);
    view.add(arrow);
    return arrow;
  });

  // Eigendirection lines (dashed — non-color cue).
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

  const top = makeOverlayLabel("", ROLE.text, 40);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 32);
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
      eigenLines[i]!.opacity(0.85);
      eigenArrows[i]!.points([new Vector2(0, 0), tip]);
      eigenArrows[i]!.opacity(1);
    }
  }

  const seconds = Object.fromEntries(
    EIGENVECTOR_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  const bodies: Record<string, () => ThreadGenerator> = {
    *fan() {
      setTop("A fan of directions");
      setCaption("Most tips will leave their original ray");
      applyT(0);
      yield* waitFor(seconds.fan);
    },
    *apply() {
      setCaption("Apply A — most directions turn");
      yield* applyT(1, 1.8, easeInOutCubic);
      yield* waitFor(seconds.apply - 1.8);
    },
    *highlight() {
      setCaption("Dashed lines: directions that stayed on their line");
      updateEigenGraphics(MAIN);
      yield* all(
        ...eigenLines.map((l) => l.opacity(0.9, 0.6)),
        ...eigenArrows.map((a) => a.opacity(1, 0.6)),
      );
      yield* waitFor(seconds.highlight - 0.6);
    },
    *equation() {
      const analysis = analyzeEigen2x2(MAIN);
      const lambdas =
        analysis.kind === "distinct-real"
          ? analysis.pairs.map((p) => fmt(p.eigenvalue)).join(", ")
          : "?";
      setTop("Av = λv");
      setCaption(`Eigenvalues λ ≈ ${lambdas} — never call 0 an eigenvector`);
      yield* waitFor(seconds.equation);
    },
    *lambdas() {
      setCaption("λ > 1 stretch · 0 < λ < 1 shrink · λ = 0 collapse · λ < 0 reverse");
      yield* morphTo(NEGATIVE, 1.2);
      updateEigenGraphics(NEGATIVE);
      yield* waitFor(0.8);
      yield* morphTo(ZERO_EIG, 1.2);
      updateEigenGraphics(ZERO_EIG);
      yield* waitFor(seconds.lambdas - 3.2);
    },
    *scalar() {
      setCaption("Scalar A = λI — every nonzero direction is an eigenvector");
      yield* morphTo(SCALAR, 1.2);
      updateEigenGraphics(SCALAR);
      // Hide fan noise; show that all directions work.
      yield* all(...fanArrows.map((a) => a.opacity(0.35, 0.5)));
      yield* waitFor(seconds.scalar - 1.7);
    },
    *defective() {
      setCaption("Defective repeated λ — only one eigendirection (do not invent a second)");
      yield* morphTo(DEFECTIVE, 1.2);
      updateEigenGraphics(DEFECTIVE);
      yield* waitFor(seconds.defective - 1.2);
    },
    *rotation() {
      setCaption("Rotation: no real eigenvectors (complex eigenvalues may still exist)");
      yield* morphTo(ROTATION, 1.2);
      updateEigenGraphics(ROTATION);
      yield* applyT(1, 0.1);
      yield* waitFor(seconds.rotation - 1.3);
    },
    *summary() {
      setCaption("Eigenvectors: nonzero directions A preserves; λ is signed scale");
      yield* morphTo(MAIN, 1.2);
      updateEigenGraphics(MAIN);
      yield* all(...fanArrows.map((a) => a.opacity(0.5, 0.4)));
      yield* waitFor(seconds.summary - 1.6);
    },
  };

  for (const segment of EIGENVECTOR_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
