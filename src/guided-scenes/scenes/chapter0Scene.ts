import { Circle, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { OPENING_GRAPHIC } from "../../lessons/openingGraphic";
import {
  matrixVectorMultiply,
  requireMatrixExample,
  type Matrix2x2,
  type Vector2 as MathVector2,
} from "../../math";
import { CHAPTER0_SEGMENTS } from "./sceneTimings";
import {
  ROLE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatSceneNumber,
  makeArrow,
  makeGhostClosedRegion,
  makeGraphic,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
  makeTransformedGrid,
  morphMatrixEntries,
  toPixels,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Chapter 0 — "Why Linear Algebra?" walking skeleton.
 *
 * A recognizable, asymmetric vector graphic (the shared OPENING_GRAPHIC) rides a
 * live 2×2 matrix through scaling, rotation, reflection, shear, and a projection
 * that collapses the plane, then freezes on the central mystery. The grid, the
 * basis vectors and their images, and one highlighted vertex x and its image Ax
 * all follow the same matrix. No columns / derivation are taught here.
 *
 * Every vertex is mapped through the shared `matrixVectorMultiply` — never
 * ad-hoc geometry (math-visualization-correctness).
 */

// Shrink the stored outline for display so even a ×2 scale stays inside the
// safe frame (max |coord| ≈ 1.6 → 1.2 → 2.4 units ≈ 154px under ×2).
const DISPLAY = 0.75;
const SHAPE: MathVector2[] = OPENING_GRAPHIC.outline.map(
  ([x, y]) => [x * DISPLAY, y * DISPLAY] as MathVector2,
);
const NOSE = OPENING_GRAPHIC.anchors.nose;

const M = {
  scale: requireMatrixExample("uniform-scale").matrix as Matrix2x2,
  rotation: requireMatrixExample("rotation").matrix as Matrix2x2,
  reflection: requireMatrixExample("reflection").matrix as Matrix2x2,
  shear: requireMatrixExample("shear-2-1").matrix as Matrix2x2,
  projection: requireMatrixExample("projection-x").matrix as Matrix2x2,
} as const;

const fmt = (n: number) => formatSceneNumber(n);

export const chapter0Scene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const ma = createSignal(1);
  const mb = createSignal(0);
  const mc = createSignal(0);
  const md = createSignal(1);
  const matrix = (): Matrix2x2 => [
    [ma(), mb()],
    [mc(), md()],
  ];

  const project = (v: MathVector2): Vector2 =>
    toPixels(matrixVectorMultiply(matrix(), v));

  // Reference frames.
  const ghostGrid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  ghostGrid.opacity(0.18);
  view.add(ghostGrid);

  const tGrid = makeTransformedGrid(matrix, OVERLAY_CLEAR_HALF_EXTENT);
  tGrid.opacity(0);
  view.add(tGrid);

  const origin = new Circle({ size: 14, fill: ROLE.text });
  view.add(origin);

  // Original (ghost) graphic and the live transformed graphic.
  const ghostGraphic = makeGhostClosedRegion(
    SHAPE.map((v) => toPixels(v)),
    ROLE.original,
  );
  view.add(ghostGraphic);

  const graphic = makeGraphic(matrix, SHAPE, ROLE.transformed);
  view.add(graphic);

  // Basis vectors and their images.
  const e1Ghost = makeArrow(ROLE.dim, 3);
  e1Ghost.opacity(0.4).points([new Vector2(0, 0), toPixels([1, 0])]);
  const e2Ghost = makeArrow(ROLE.dim, 3);
  e2Ghost.opacity(0.4).points([new Vector2(0, 0), toPixels([0, 1])]);
  view.add(e1Ghost);
  view.add(e2Ghost);

  const e1 = makeArrow(ROLE.basis1, 6);
  e1.points(() => [new Vector2(0, 0), toPixels([ma(), mc()])]);
  const e2 = makeArrow(ROLE.basis2, 6);
  e2.points(() => [new Vector2(0, 0), toPixels([mb(), md()])]);
  view.add(e1);
  view.add(e2);

  const e1Label = makeLabel("e₁", ROLE.basis1, 30);
  e1Label.position(() => toPixels([ma(), mc()]).add(new Vector2(16, 16)));
  const e2Label = makeLabel("e₂", ROLE.basis2, 30);
  e2Label.position(() => toPixels([mb(), md()]).add(new Vector2(16, -6)));
  view.add(e1Label);
  view.add(e2Label);

  // Highlighted vertex x and its image Ax (the nose anchor).
  const noseGhost = new Circle({
    size: 16,
    stroke: ROLE.original,
    lineWidth: 3,
    position: toPixels(SHAPE[NOSE]!),
  });
  view.add(noseGhost);

  const nose = new Circle({ size: 18, fill: ROLE.selected });
  nose.position(() => project(SHAPE[NOSE]!));
  view.add(nose);

  const xLabel = makeLabel("x", ROLE.original, 28);
  xLabel.position(toPixels(SHAPE[NOSE]!).add(new Vector2(-22, -6)));
  view.add(xLabel);

  const axLabel = makeLabel("Ax", ROLE.selected, 28);
  axLabel.position(() => project(SHAPE[NOSE]!).add(new Vector2(24, -6)));
  view.add(axLabel);

  // Overlay matrix + caption in the safe bands.
  const matrixLabel = makeOverlayLabel("", ROLE.text, 40);
  matrixLabel.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(matrixLabel);

  const caption = makeOverlayLabel("", ROLE.textMuted, 32);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const setMatrixLabel = () =>
    matrixLabel.text(
      `A = [[${fmt(ma())}, ${fmt(mb())}], [${fmt(mc())}, ${fmt(md())}]]`,
    );
  const setCaption = (text: string) => caption.text(text);

  // Establishing frame (visible at t=0 / reduced motion).
  setMatrixLabel();
  setCaption("One small craft on a coordinate grid — the origin stays put.");

  const seconds = Object.fromEntries(
    CHAPTER0_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  function* morphTo(target: Matrix2x2, dur: number): ThreadGenerator {
    yield* morphMatrixEntries(ma, mb, mc, md, target, dur);
    setMatrixLabel();
  }

  function* preset(
    id: string,
    text: string,
    target: Matrix2x2,
  ): ThreadGenerator {
    setCaption(text);
    const dur = seconds[id]!;
    yield* all(tGrid.opacity(0.85, 0.5), morphTo(target, dur * 0.55));
    yield* waitFor(dur * 0.45);
  }

  const bodies: Record<string, () => ThreadGenerator> = {
    *establish() {
      yield* all(
        matrixLabel.opacity(1, 0.5),
        caption.opacity(1, 0.5),
        graphic.opacity(1, 0.6),
        ghostGraphic.opacity(1, 0.6),
      );
      yield* waitFor(seconds.establish - 1.1);
    },
    *scale() {
      yield* preset(
        "scale",
        "Scaling — every vertex moves twice as far from the origin.",
        M.scale,
      );
    },
    *rotation() {
      yield* preset(
        "rotation",
        "Rotation — the whole craft turns about the origin.",
        M.rotation,
      );
    },
    *reflection() {
      yield* preset(
        "reflection",
        "Reflection — the craft flips across the x-axis.",
        M.reflection,
      );
    },
    *shear() {
      yield* preset(
        "shear",
        "Shear — horizontal layers slide by their height.",
        M.shear,
      );
    },
    *projection() {
      setCaption("Projection — the plane collapses onto a line; depth is lost.");
      yield* all(tGrid.opacity(0.85, 0.4), morphTo(M.projection, 2.2));
      yield* nose.size(24, 0.3);
      yield* nose.size(18, 0.3);
      yield* waitFor(seconds.projection - 3.2);
    },
    *mystery() {
      yield* morphTo(M.shear, 1.2);
      setCaption(
        "Four numbers determined where every vertex went. How?",
      );
      yield* all(
        matrixLabel.scale(1.12, 0.5),
        matrixLabel.fill(ROLE.selected, 0.5),
      );
      yield* matrixLabel.scale(1, 0.5);
      yield* waitFor(seconds.mystery - 2.2);
    },
  };

  for (const segment of CHAPTER0_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
