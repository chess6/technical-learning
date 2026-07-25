import { Circle, Line, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
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
import { CHAPTER0_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatSceneNumber,
  makeArrow,
  makeGraphicParts,
  makeLabel,
  makeOverlayLabel,
  makeStaticGrid,
  makeTransformedGrid,
  morphMatrixEntries,
  runSegment,
  toPixels,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Chapter 0 — "Why Linear Algebra?"
 *
 * The recognizable multi-part craft (shared OPENING_GRAPHIC) is the visual
 * subject. It is established first; then the basis vectors and one marked
 * vertex (x → Ax) are revealed; then each canonical transform is shown by
 * resetting to the identity and animating I → A_preset. The learner then
 * PREDICTS whether such a rule could slide the craft, the slide is enacted as a
 * ghost that travels, and the scene freezes on the mystery. Columns/derivation
 * are NOT taught here.
 *
 * Every vertex — of every part — is mapped through the shared
 * `matrixVectorMultiply` (via makeGraphicParts), never ad-hoc geometry.
 *
 * Two fixes from the July 2026 audit live here:
 *
 *  - The `reveal` caption called e₁ and e₂ "axes". They are basis vectors; the
 *    axes are the grid lines they happen to lie along at the identity, and the
 *    whole scene is about those arrows moving off them.
 *  - `translation` claimed "try to slide the whole craft over" while a dashed
 *    copy simply FADED IN already displaced. The ghost now starts coincident
 *    with the craft and travels, so the move the matrix cannot make is one the
 *    learner has actually watched.
 */

const SCENE_ID = "why-linear-algebra";

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
  ghostGrid.opacity(0.5);
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

  // The slide, as a travelling ghost. At slideT = 0 it sits exactly on the
  // identity craft, so revealing it changes nothing; tweening slideT to 1 IS
  // the translation. (It used to be a static outline at the destination that
  // faded in — the beat's caption described a motion the scene never ran.)
  const slideT = createSignal(0);
  const slidGhost = new Line({
    stroke: ROLE.violation,
    lineWidth: 3,
    lineDash: [10, 8],
    lineJoin: "round",
    closed: true,
    fill: null,
    opacity: 0,
    points: () =>
      DISPLAY_GRAPHIC.outline.map(([x, y]) =>
        toPixels([x + TRANSLATE[0] * slideT(), y + TRANSLATE[1] * slideT()]),
      ),
  });
  view.add(slidGhost);

  // The invariant this whole chapter turns on: the origin never moves. It is
  // marked from `reveal` onward so the learner can check it themselves during
  // every preset, rather than being told at the end.
  const originRing = new Circle({
    size: 40,
    stroke: ROLE.selected,
    lineWidth: 2,
    lineDash: [6, 6],
    opacity: 0,
  });
  view.add(originRing);
  const origin = new Circle({ size: 15, fill: ROLE.text });
  view.add(origin);
  const originNote = makeLabel("origin — watch it", ROLE.selected, 20);
  originNote.position(new Vector2(0, 64));
  originNote.opacity(0);
  view.add(originNote);

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

  // Overlay matrix + caption in the safe bands. The matrix readout is a LIVE
  // function of the four entry signals, so it can never show a matrix the
  // geometry has already left behind.
  const matrixLabel = makeOverlayLabel(
    () => `A = [[${fmt(ma())}, ${fmt(mb())}], [${fmt(mc())}, ${fmt(md())}]]`,
    ROLE.text,
    40,
  );
  matrixLabel.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(matrixLabel);

  const caption = makeOverlayLabel("", ROLE.textMuted, 32);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  const setCaption = (text: string) => caption.text(text);

  // Establishing frame (visible at t=0 / reduced motion): the craft is the subject.
  setCaption("A small craft, drawn from its corner points, on a coordinate grid.");

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  function* morphTo(target: Matrix2x2, dur: number): ThreadGenerator {
    yield* morphMatrixEntries(ma, mb, mc, md, target, dur);
  }

  /**
   * Reset to the identity, then animate identity → preset. Never preset →
   * preset: morphing one unrelated transformation straight into another
   * animates a transition that means nothing.
   */
  function* preset(id: string, text: string, target: Matrix2x2): ThreadGenerator {
    const b = beats(id);
    setCaption("Reset to the identity…");
    yield* all(tGrid.opacity(0.4, 0.3), morphTo(IDENTITY, b.reset!));
    setCaption(text);
    yield* all(tGrid.opacity(0.85, 0.3), morphTo(target, b.deform!));
    yield* waitFor(b.hold!);
  }

  const bodies: Record<string, () => ThreadGenerator> = {
    *establish() {
      const b = beats("establish");
      // Everything is already drawn at t = 0 so the paused first frame reads;
      // the only motion is a nudge onto the point the chapter is about.
      yield* origin.size(24, b.originUp!, easeInOutCubic);
      yield* origin.size(15, b.originDown!, easeInOutCubic);
      yield* waitFor(b.hold!);
    },
    *reveal() {
      const b = beats("reveal");
      setCaption(
        "Two basis vectors e₁, e₂ build the frame; watch one marked vertex x — and the origin.",
      );
      yield* all(
        e1Ghost.opacity(0.5, b.basisIn!),
        e2Ghost.opacity(0.5, b.basisIn!),
        e1.opacity(1, b.basisIn!),
        e2.opacity(1, b.basisIn!),
        e1Label.opacity(1, b.basisIn!),
        e2Label.opacity(1, b.basisIn!),
      );
      yield* all(
        noseGhost.opacity(1, b.vertexIn!),
        nose.opacity(1, b.vertexIn!),
        xLabel.opacity(1, b.vertexIn!),
        axLabel.opacity(1, b.vertexIn!),
        originRing.opacity(0.8, b.vertexIn!),
        originNote.opacity(0.9, b.vertexIn!),
      );
      yield* waitFor(b.hold!);
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
      const b = beats("projection");
      setCaption("Reset to the identity…");
      yield* all(tGrid.opacity(0.4, 0.3), morphTo(IDENTITY, b.reset!));
      setCaption("Projection — the plane collapses onto a line; depth is lost.");
      yield* all(tGrid.opacity(0.85, 0.3), morphTo(M.projection, b.deform!));
      yield* nose.size(24, b.pulseUp!);
      yield* nose.size(17, b.pulseDown!);
      yield* waitFor(b.hold!);
    },
    *["predict-translation"]() {
      const b = beats("predict-translation");
      // Back to the identity so the question is asked about the craft where it
      // started, with every apparatus (origin marker included) still on screen.
      yield* all(tGrid.opacity(0, 0.3), morphTo(IDENTITY, b.reset!));
      setCaption(
        "Five transformations just ran — and the origin dot never moved once.",
      );
      yield* all(originRing.opacity(1, b.ask!), origin.size(22, b.ask!));
      setCaption(
        "Predict: could any rule of this kind slide the whole craft sideways, off the origin?",
      );
      yield* waitFor(b.think!);
    },
    *translation() {
      const b = beats("translation");
      setCaption("Here is the move: slide the whole craft over — a translation.");
      slidGhost.opacity(0.9);
      slideT(0);
      // The ghost STARTS on the craft and travels. Nothing is faded in already
      // displaced, so the operation the caption names is the one on screen.
      yield* slideT(1, b.slide!, easeInOutCubic);
      yield* waitFor(b.hold!);
      setCaption(
        "No 2×2 matrix can follow it: A·0 = 0 pins the origin, so the craft is nailed there. Sliding needs more (later).",
      );
      yield* all(origin.fill(ROLE.violation, b.originUp!), origin.size(26, b.originUp!));
      yield* all(origin.fill(ROLE.text, b.originDown!), origin.size(15, b.originDown!));
      yield* waitFor(b.hold2!);
      yield* all(slidGhost.opacity(0, b.retire!), originNote.opacity(0, b.retire!));
    },
    *mystery() {
      const b = beats("mystery");
      yield* morphTo(M.shear, b.deform!);
      yield* tGrid.opacity(0.85, b.gridUp!);
      setCaption("Four numbers determined where every vertex went. How?");
      yield* all(
        matrixLabel.scale(1.12, b.emphUp!),
        matrixLabel.fill(ROLE.selected, b.emphUp!),
      );
      yield* matrixLabel.scale(1, b.emphDown!);
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of CHAPTER0_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
