import { Circle, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { OPENING_GRAPHIC, type OpeningGraphic } from "../../lessons/openingGraphic";
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
  makeGraphicParts,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
  makeTransformedGrid,
  morphMatrixEntries,
  toPixels,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Chapter 0 — "Why Linear Algebra?"
 *
 * The recognizable multi-part craft (shared OPENING_GRAPHIC) is the visual
 * subject. It is established first; then the standard basis vectors and one
 * marked vertex (x → Ax) are revealed; then each canonical transform is shown
 * by resetting to the identity and animating I → A_preset. A translation beat
 * shows the one move a 2×2 matrix cannot make (the origin is pinned), and the
 * scene freezes on the mystery. Columns/derivation are NOT taught here.
 *
 * Every vertex — of every part — is mapped through the shared
 * `matrixVectorMultiply` (via makeGraphicParts), never ad-hoc geometry.
 */

const IDENTITY: Matrix2x2 = [
  [1, 0],
  [0, 1],
];

// Display-scale the shared graphic so even a ×2 scale stays in the safe frame.
const DISPLAY = 0.78;
const scalePt = ([x, y]: MathVector2): MathVector2 => [x * DISPLAY, y * DISPLAY];
const DISPLAY_GRAPHIC: OpeningGraphic = {
  ...OPENING_GRAPHIC,
  outline: OPENING_GRAPHIC.outline.map(scalePt),
  parts: OPENING_GRAPHIC.parts.map((p) => ({ ...p, points: p.points.map(scalePt) })),
};
const NOSE = OPENING_GRAPHIC.anchors.nose;
const NOSE_PT = DISPLAY_GRAPHIC.outline[NOSE]!;

/** Where a "slide" would carry the craft — used only to show it is impossible. */
const TRANSLATE: MathVector2 = [1.5, 0.2];

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
  ghostGrid.opacity(0.16);
  view.add(ghostGrid);

  const tGrid = makeTransformedGrid(matrix, OVERLAY_CLEAR_HALF_EXTENT);
  tGrid.opacity(0);
  view.add(tGrid);

  // Original (ghost) craft stays put; live craft rides the matrix.
  const ghostCraft = makeGraphicParts(() => IDENTITY, DISPLAY_GRAPHIC, {
    ghost: true,
  });
  view.add(ghostCraft);

  const craft = makeGraphicParts(matrix, DISPLAY_GRAPHIC);
  view.add(craft);

  // Translation target (dashed): where sliding the craft would put it. Static —
  // revealed only during the translation beat to show a 2×2 can't reach it.
  const slidOutline = DISPLAY_GRAPHIC.outline.map(
    ([x, y]) => toPixels([x + TRANSLATE[0], y + TRANSLATE[1]]),
  );
  const slidGhost = makeGhostClosedRegion(slidOutline, ROLE.result);
  slidGhost.opacity(0);
  view.add(slidGhost);

  const origin = new Circle({ size: 15, fill: ROLE.text });
  view.add(origin);

  // Basis vectors + their images (revealed progressively).
  const e1Ghost = makeArrow(ROLE.dim, 3);
  e1Ghost.opacity(0).points([new Vector2(0, 0), toPixels([1, 0])]);
  const e2Ghost = makeArrow(ROLE.dim, 3);
  e2Ghost.opacity(0).points([new Vector2(0, 0), toPixels([0, 1])]);
  view.add(e1Ghost);
  view.add(e2Ghost);

  const e1 = makeArrow(ROLE.basis1, 6);
  e1.opacity(0).points(() => [new Vector2(0, 0), toPixels([ma(), mc()])]);
  const e2 = makeArrow(ROLE.basis2, 6);
  e2.opacity(0).points(() => [new Vector2(0, 0), toPixels([mb(), md()])]);
  view.add(e1);
  view.add(e2);

  const e1Label = makeLabel("e₁", ROLE.basis1, 30);
  e1Label.opacity(0).position(() => toPixels([ma(), mc()]).add(new Vector2(16, 16)));
  const e2Label = makeLabel("e₂", ROLE.basis2, 30);
  e2Label.opacity(0).position(() => toPixels([mb(), md()]).add(new Vector2(16, -6)));
  view.add(e1Label);
  view.add(e2Label);

  // Highlighted vertex x (original) and its image Ax (revealed progressively).
  const noseGhost = new Circle({
    size: 15,
    stroke: ROLE.original,
    lineWidth: 3,
    opacity: 0,
    position: toPixels(NOSE_PT),
  });
  view.add(noseGhost);

  const nose = new Circle({ size: 17, fill: ROLE.selected, opacity: 0 });
  nose.position(() => project(NOSE_PT));
  view.add(nose);

  const xLabel = makeLabel("x", ROLE.original, 28);
  xLabel.opacity(0).position(toPixels(NOSE_PT).add(new Vector2(-24, -6)));
  view.add(xLabel);

  const axLabel = makeLabel("Ax", ROLE.selected, 28);
  axLabel.opacity(0).position(() => project(NOSE_PT).add(new Vector2(26, -6)));
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

  // Establishing frame (visible at t=0 / reduced motion): the craft is the subject.
  setMatrixLabel();
  setCaption("A small craft, drawn from its corner points, on a coordinate grid.");

  const seconds = Object.fromEntries(
    CHAPTER0_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  function* morphTo(target: Matrix2x2, dur: number): ThreadGenerator {
    yield* morphMatrixEntries(ma, mb, mc, md, target, dur);
    setMatrixLabel();
  }

  // Reset to the identity, then animate identity → preset (never preset→preset).
  function* preset(
    id: string,
    text: string,
    target: Matrix2x2,
  ): ThreadGenerator {
    const dur = seconds[id]!;
    setCaption("Reset to the identity…");
    yield* all(tGrid.opacity(0.4, 0.3), morphTo(IDENTITY, dur * 0.2));
    setCaption(text);
    yield* all(tGrid.opacity(0.85, 0.3), morphTo(target, dur * 0.45));
    yield* waitFor(dur * 0.35);
  }

  const bodies: Record<string, () => ThreadGenerator> = {
    *establish() {
      yield* all(
        matrixLabel.opacity(1, 0.5),
        caption.opacity(1, 0.5),
        ghostCraft.opacity(1, 0.6),
        craft.opacity(1, 0.6),
      );
      yield* waitFor(seconds.establish - 1.1);
    },
    *reveal() {
      setCaption("Two axes e₁, e₂ set the frame; watch one marked vertex x.");
      yield* all(
        e1Ghost.opacity(0.5, 0.4),
        e2Ghost.opacity(0.5, 0.4),
        e1.opacity(1, 0.4),
        e2.opacity(1, 0.4),
        e1Label.opacity(1, 0.4),
        e2Label.opacity(1, 0.4),
      );
      yield* all(
        noseGhost.opacity(1, 0.4),
        nose.opacity(1, 0.4),
        xLabel.opacity(1, 0.4),
        axLabel.opacity(1, 0.4),
      );
      yield* waitFor(seconds.reveal - 1.6);
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
        "Reflection — the craft flips across the x-axis (fins swap sides).",
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
      const dur = seconds.projection;
      setCaption("Reset to the identity…");
      yield* all(tGrid.opacity(0.4, 0.3), morphTo(IDENTITY, dur * 0.2));
      setCaption("Projection — the plane collapses onto a line; depth is lost.");
      yield* all(tGrid.opacity(0.85, 0.3), morphTo(M.projection, dur * 0.4));
      yield* all(nose.size(24, 0.25), nose.size(17, 0.25));
      yield* waitFor(dur * 0.35);
    },
    *translation() {
      const dur = seconds.translation;
      // Back to identity: the live craft sits on the original.
      yield* all(tGrid.opacity(0, 0.3), morphTo(IDENTITY, dur * 0.15));
      setCaption("Now try to slide the whole craft over — a translation.");
      yield* slidGhost.opacity(0.9, 0.5);
      yield* waitFor(0.5);
      setCaption(
        "No 2×2 matrix can: A·0 = 0 always pins the origin. Sliding needs more (later).",
      );
      // Emphasize the pinned origin.
      yield* all(origin.fill(ROLE.result, 0.3), origin.size(24, 0.3));
      yield* all(origin.fill(ROLE.text, 0.3), origin.size(15, 0.3));
      yield* waitFor(dur - 2.6);
      yield* slidGhost.opacity(0, 0.4);
    },
    *mystery() {
      yield* morphTo(M.shear, 1.2);
      yield* all(tGrid.opacity(0.85, 0.4));
      setCaption("Four numbers determined where every vertex went. How?");
      yield* all(
        matrixLabel.scale(1.12, 0.5),
        matrixLabel.fill(ROLE.selected, 0.5),
      );
      yield* matrixLabel.scale(1, 0.5);
      yield* waitFor(seconds.mystery - 2.6);
    },
  };

  for (const segment of CHAPTER0_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
