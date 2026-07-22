import { Circle, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { OPENING_GRAPHIC, type OpeningGraphic } from "../../lessons/openingGraphic";
import { MATRIX_LESSON_EXAMPLE } from "../../lessons/exampleData";
import {
  matrixVectorMultiply,
  type Matrix2x2,
  type Vector2 as MathVector2,
} from "../../math";
import { COLUMNS_RULE_GRAPHIC_SEGMENTS } from "./sceneTimings";
import {
  ROLE,
  OVERLAY_CLEAR_HALF_EXTENT,
  makeArrow,
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
 * Lesson 2 callback — "return to the graphic", shown AFTER the columns rule is
 * derived. It writes one craft vertex as x = a·e₁ + b·e₂, shows its image is
 * a·T(e₁) + b·T(e₂) (same coordinates, transformed basis), and then applies the
 * rule to every marked vertex so the two columns reposition the whole craft.
 *
 * Uses the shared A = [[2, 1], [0, 1]] and the shared craft, so it stays
 * numerically and visually continuous with the main Lesson 2 scene/explorer.
 */

const A = MATRIX_LESSON_EXAMPLE.matrix as Matrix2x2;
const IDENTITY: Matrix2x2 = [
  [1, 0],
  [0, 1],
];

const DISPLAY = 0.78;
const scalePt = ([x, y]: MathVector2): MathVector2 => [x * DISPLAY, y * DISPLAY];
const DISPLAY_GRAPHIC: OpeningGraphic = {
  ...OPENING_GRAPHIC,
  outline: OPENING_GRAPHIC.outline.map(scalePt),
  parts: OPENING_GRAPHIC.parts.map((p) => ({ ...p, points: p.points.map(scalePt) })),
};

// A few marked vertices spread across the hull (indices into the outline).
const MARKED = [1, 3, 8, 12];
// The single demo vertex whose decomposition we narrate (both coords nonzero).
const DEMO = 1;

export const columnsRuleGraphicScene = makeScene2D(function* (view) {
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

  const ghostGrid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  ghostGrid.opacity(0.16);
  view.add(ghostGrid);
  const tGrid = makeTransformedGrid(matrix, OVERLAY_CLEAR_HALF_EXTENT);
  tGrid.opacity(0);
  view.add(tGrid);

  const ghostCraft = makeGraphicParts(() => IDENTITY, DISPLAY_GRAPHIC, {
    ghost: true,
  });
  view.add(ghostCraft);
  const craft = makeGraphicParts(matrix, DISPLAY_GRAPHIC);
  view.add(craft);

  const origin = new Circle({ size: 15, fill: ROLE.text });
  view.add(origin);

  // Basis vectors → columns.
  const e1 = makeArrow(ROLE.basis1, 6);
  e1.points(() => [new Vector2(0, 0), toPixels([ma(), mc()])]);
  const e2 = makeArrow(ROLE.basis2, 6);
  e2.points(() => [new Vector2(0, 0), toPixels([mb(), md()])]);
  view.add(e1);
  view.add(e2);
  const e1Label = makeLabel("e₁", ROLE.basis1, 30);
  e1Label.position(() => toPixels([ma(), mc()]).add(new Vector2(18, 16)));
  const e2Label = makeLabel("e₂", ROLE.basis2, 30);
  e2Label.position(() => toPixels([mb(), md()]).add(new Vector2(16, -8)));
  view.add(e1Label);
  view.add(e2Label);

  // Marked vertices (dots that ride the matrix).
  const markedDots = MARKED.map((i) => {
    const dot = new Circle({
      size: i === DEMO ? 18 : 14,
      fill: i === DEMO ? ROLE.selected : ROLE.original,
      opacity: 0,
      position: () => project(DISPLAY_GRAPHIC.outline[i]!),
    });
    view.add(dot);
    return dot;
  });

  const matrixLabel = makeOverlayLabel("", ROLE.text, 38);
  matrixLabel.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(matrixLabel);
  const caption = makeOverlayLabel("", ROLE.textMuted, 32);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  matrixLabel.text("x = a·e₁ + b·e₂");
  caption.text("Pick any vertex of the craft and read its coordinates (a, b).");

  const seconds = Object.fromEntries(
    COLUMNS_RULE_GRAPHIC_SEGMENTS.map((s) => [s.id, s.duration]),
  ) as Record<string, number>;

  const bodies: Record<string, () => ThreadGenerator> = {
    *vertex() {
      yield* all(
        ghostCraft.opacity(1, 0.5),
        craft.opacity(1, 0.5),
        e1.opacity(1, 0.4),
        e2.opacity(1, 0.4),
        e1Label.opacity(1, 0.4),
        e2Label.opacity(1, 0.4),
        matrixLabel.opacity(1, 0.5),
        caption.opacity(1, 0.5),
      );
      yield* markedDots[0]!.opacity(1, 0.4);
      yield* all(markedDots[0]!.size(24, 0.3), markedDots[0]!.size(18, 0.3));
      yield* waitFor(seconds.vertex - 1.6);
    },
    *image() {
      matrixLabel.text("T(x) = a·T(e₁) + b·T(e₂)");
      caption.text("Apply T: e₁, e₂ move to the columns — same a, b, new basis.");
      yield* tGrid.opacity(0.8, 0.4);
      yield* morphMatrixEntries(ma, mb, mc, md, A, seconds.image * 0.5);
      e1Label.text("T(e₁)");
      e2Label.text("T(e₂)");
      yield* all(markedDots[0]!.size(24, 0.3), markedDots[0]!.size(18, 0.3));
      yield* waitFor(seconds.image - (seconds.image * 0.5) - 0.9);
    },
    *["all-vertices"]() {
      caption.text("Every vertex follows the same two columns — the whole craft moves.");
      yield* all(...markedDots.slice(1).map((d) => d.opacity(1, 0.5)));
      for (const d of markedDots) {
        yield* d.size(d.size().x + 6, 0.12);
        yield* d.size(d.size().x - 6, 0.12);
      }
      yield* waitFor(seconds["all-vertices"] - 1.6);
    },
  };

  for (const segment of COLUMNS_RULE_GRAPHIC_SEGMENTS) {
    yield* bodies[segment.id]!();
  }
});
