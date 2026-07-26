import { Circle, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
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
import { COLUMNS_RULE_GRAPHIC_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatSceneNumber,
  makeArrow,
  makeGraphicParts,
  makeLabel,
  makeOverlayLabel,
  makeSegment,
  makeStaticGrid,
  makeTransformedGrid,
  morphMatrixEntries,
  runSegment,
  toPixels,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 2 callback — "return to the graphic", shown AFTER the columns rule is
 * derived. It CONSTRUCTS one craft vertex as x = a·e₁ + b·e₂ (a head-to-tail
 * walk that ends on the vertex), pauses for the learner to predict where that
 * walk lands once the basis moves, then carries the very same component arrows
 * through T so they arrive at a·T(e₁) + b·T(e₂) — the moved vertex.
 *
 * Object-identity rule: the two component arrows are created once and bound to
 * the LIVE matrix columns (`a·col₁` and `b·col₂`). They are never faded out and
 * replaced, so the learner watches one recipe ride the transformation, and the
 * walk's endpoint is *by construction* the transformed vertex — the drawing
 * cannot drift from the claim. Only the labels re-text (e₁ → T(e₁)).
 *
 * Uses the shared A = [[2, 1], [0, 1]] and the shared craft, so it stays
 * numerically and visually continuous with the main Lesson 2 scene/explorer.
 */

const A = MATRIX_LESSON_EXAMPLE.matrix as Matrix2x2;
const IDENTITY: Matrix2x2 = [
  [1, 0],
  [0, 1],
];

/**
 * Craft scale. Larger than the other callback scenes on purpose: this scene's
 * subject is the *components* of one vertex, and at the previous 0.78 the two
 * component arrows were ~27 px — too short to read as a construction.
 * Bounded by the safe frame after T doubles x: the extremes are the thruster
 * (x = −1.6) and the nose (x = 1.55), giving |2 · 1.6 · 1.6| ≈ 328 px and
 * 2 · 1.55 · 1.6 ≈ 317 px against a 400 px half-width.
 */
const DISPLAY = 1.6;
const scalePt = ([x, y]: MathVector2): MathVector2 => [x * DISPLAY, y * DISPLAY];
const DISPLAY_GRAPHIC: OpeningGraphic = {
  ...OPENING_GRAPHIC,
  outline: OPENING_GRAPHIC.outline.map(scalePt),
  parts: OPENING_GRAPHIC.parts.map((p) => ({ ...p, points: p.points.map(scalePt) })),
};

// A few marked vertices spread across the hull (indices into the outline).
const MARKED = [1, 3, 8, 12];
// The single demo vertex whose decomposition we construct (both coords nonzero).
const DEMO = 1;
const SCENE_ID = "columns-rule-graphic";

const lerp = (from: number, to: number, t: number): number =>
  from + (to - from) * t;

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

  // The demo vertex's standard coordinates. These are the (a, b) of the whole
  // scene: fixed by the craft, never re-derived, and unchanged by T.
  const [aCoord, bCoord] = DISPLAY_GRAPHIC.outline[DEMO]!;

  /** Tip of the first component, a·col₁, in math units. */
  const firstLeg = (): MathVector2 => [aCoord * ma(), aCoord * mc()];
  /** Tip of the walk, a·col₁ + b·col₂ — identically M·x, the moved vertex. */
  const walkEnd = (): MathVector2 => [
    aCoord * ma() + bCoord * mb(),
    aCoord * mc() + bCoord * md(),
  ];

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
  // Basis labels sit at the arrow tips, offset outward; the component labels
  // below live at the segment midpoints, so the two sets never stack.
  const e1Label = makeLabel("e₁", ROLE.basis1, 28);
  e1Label.position(() => toPixels([ma(), mc()]).add(new Vector2(30, 30)));
  const e2Label = makeLabel("e₂", ROLE.basis2, 28);
  e2Label.position(() => toPixels([mb(), md()]).add(new Vector2(-40, -22)));
  view.add(e1Label);
  view.add(e2Label);

  // ---- the demo vertex's head-to-tail walk -------------------------------
  // Growth fractions for the initial construction; held at 1 afterwards so the
  // same two arrows ride the transformation.
  const grow1 = createSignal(0);
  const grow2 = createSignal(0);

  const comp1 = makeArrow(ROLE.basis1, 7);
  comp1.points(() => {
    const tip = firstLeg();
    return [
      new Vector2(0, 0),
      toPixels([tip[0] * grow1(), tip[1] * grow1()]),
    ];
  });
  comp1.opacity(0);
  const comp2 = makeArrow(ROLE.basis2, 7);
  comp2.points(() => {
    const start = firstLeg();
    const end = walkEnd();
    return [
      toPixels(start),
      toPixels([
        lerp(start[0], end[0], grow2()),
        lerp(start[1], end[1], grow2()),
      ]),
    ];
  });
  comp2.opacity(0);
  view.add(comp1);
  view.add(comp2);

  const comp1Label = makeLabel("a·e₁", ROLE.basis1, 26);
  comp1Label.position(() => {
    const tip = firstLeg();
    return toPixels([tip[0] * 0.5, tip[1] * 0.5]).add(new Vector2(-16, 36));
  });
  comp1Label.opacity(0);
  const comp2Label = makeLabel("b·e₂", ROLE.basis2, 26);
  comp2Label.position(() => {
    const start = firstLeg();
    const end = walkEnd();
    return toPixels([
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
    ]).add(new Vector2(76, 16));
  });
  comp2Label.opacity(0);
  view.add(comp1Label);
  view.add(comp2Label);

  // Dashed guides from the vertex back to the axes: what "coordinates" means.
  const guideX = makeSegment(ROLE.textMuted, 2.5, true);
  guideX.points(() => {
    const v = walkEnd();
    return [toPixels([v[0], 0]), toPixels(v)];
  });
  guideX.opacity(0);
  const guideY = makeSegment(ROLE.textMuted, 2.5, true);
  guideY.points(() => {
    const v = walkEnd();
    return [toPixels([0, v[1]]), toPixels(v)];
  });
  guideY.opacity(0);
  view.add(guideX);
  view.add(guideY);

  // ---- the other marked vertices, each with its own walk -----------------
  // Same two columns, different (a, b) — built the same way so the closing beat
  // shows a rule applying vertex-wise rather than four dots pulsing.
  const otherWalks = MARKED.filter((i) => i !== DEMO).map((i) => {
    const [va, vb] = DISPLAY_GRAPHIC.outline[i]!;
    const leg = (): MathVector2 => [va * ma(), va * mc()];
    const end = (): MathVector2 => [
      va * ma() + vb * mb(),
      va * mc() + vb * md(),
    ];
    const first = makeSegment(ROLE.basis1, 3);
    first.points(() => [new Vector2(0, 0), toPixels(leg())]);
    first.opacity(0);
    const second = makeSegment(ROLE.basis2, 3);
    second.points(() => [toPixels(leg()), toPixels(end())]);
    second.opacity(0);
    view.add(first);
    view.add(second);
    return { first, second };
  });

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
  const demoDot = markedDots[MARKED.indexOf(DEMO)]!;

  // The recipe readout: pinned, and deliberately never edited after the
  // transform — the visible proof that (a, b) is what stays fixed.
  const recipe = makeLabel(
    `a = ${formatSceneNumber(aCoord)}   b = ${formatSceneNumber(bCoord)}`,
    ROLE.selected,
    26,
  );
  recipe.position(new Vector2(-236, -150));
  recipe.opacity(0);
  view.add(recipe);

  const matrixLabel = makeOverlayLabel("", ROLE.text, 38);
  matrixLabel.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(matrixLabel);
  const caption = makeOverlayLabel("", ROLE.textMuted, 30);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);

  // Establishing frame, correct at t = 0.
  matrixLabel.text("x = ?");
  caption.text("One vertex of the craft, and the basis it is measured against.");

  const beats = (segmentId: string) => requireBeats(SCENE_ID, segmentId);

  const bodies: Record<string, () => ThreadGenerator> = {
    *vertex() {
      const b = beats("vertex");
      yield* all(
        ghostCraft.opacity(1, b.establish!),
        craft.opacity(1, b.establish!),
        e1.opacity(1, b.establish!),
        e2.opacity(1, b.establish!),
        e1Label.opacity(1, b.establish!),
        e2Label.opacity(1, b.establish!),
        matrixLabel.opacity(1, b.establish!),
        caption.opacity(1, b.establish!),
      );
      yield* demoDot.opacity(1, b.vertexIn!);
      caption.text("Drop it onto the axes: that pair of readings is (a, b).");
      yield* all(guideX.opacity(0.9, b.guidesIn!), guideY.opacity(0.9, b.guidesIn!));
      yield* recipe.opacity(1, b.recipeIn!);
      yield* waitFor(b.hold!);
    },

    *decompose() {
      const b = beats("decompose");
      matrixLabel.text("x = a·e₁");
      caption.text("Walk a steps along e₁…");
      // Hand the stage to the walk: the craft becomes context and the unit
      // basis arrows step back, so a·e₁ (shorter than e₁, since a < 1) is not
      // read as a second copy of e₁ lying on top of it.
      yield* all(
        craft.opacity(0.3, b.focus!),
        ghostCraft.opacity(0.45, b.focus!),
        e1.opacity(0.35, b.focus!),
        e2.opacity(0.35, b.focus!),
        e1Label.opacity(0.35, b.focus!),
        e2Label.opacity(0.35, b.focus!),
        comp1.opacity(1, b.focus!),
        comp1Label.opacity(1, b.focus!),
      );
      yield* grow1(1, b.firstLeg!, easeInOutCubic);

      matrixLabel.text("x = a·e₁ + b·e₂");
      caption.text("…then b steps along e₂ — head to tail, ending on the vertex.");
      yield* all(comp2.opacity(1, b.secondLegIn!), comp2Label.opacity(1, b.secondLegIn!));
      yield* grow2(1, b.secondLeg!, easeInOutCubic);
      // The walk's endpoint IS the vertex (same matrix, same coordinates):
      // pulse the dot so the coincidence is read, not assumed.
      yield* demoDot.size(30, b.landUp!);
      yield* demoDot.size(18, b.landDown!);
      yield* waitFor(b.hold!);
    },

    *predict() {
      const b = beats("predict");
      matrixLabel.text("T(x) = a·T(e₁) + b·T(e₂)  →  where?");
      caption.text(
        "T moves e₁ and e₂ to the columns (2, 0) and (1, 1). The recipe (a, b) does not change. Predict where this walk now ends.",
      );
      // Bring the basis arrows back up: they are what is about to move, so the
      // prediction is made against the objects that will change.
      yield* all(
        e1.opacity(1, b.basisIn!),
        e2.opacity(1, b.basisIn!),
        e1Label.opacity(1, b.basisIn!),
        e2Label.opacity(1, b.basisIn!),
      );
      yield* waitFor(b.think!);
    },

    *image() {
      const b = beats("image");
      caption.text("Same two steps, now walked on the columns.");
      yield* all(
        craft.opacity(0.85, b.contextIn!),
        ghostCraft.opacity(0.5, b.contextIn!),
        tGrid.opacity(0.8, b.contextIn!),
      );
      e1Label.text("T(e₁)");
      e2Label.text("T(e₂)");
      comp1Label.text("a·T(e₁)");
      comp2Label.text("b·T(e₂)");
      // The single motion of the scene: every bound node — grid, craft, basis
      // arrows, both component arrows, the guides and every marked dot — is a
      // function of this matrix, so they all move together and the walk stays
      // exact on every frame.
      yield* morphMatrixEntries(ma, mb, mc, md, A, b.transform!);
      // Resolve the prediction: the question mark set in `predict` must not
      // survive its own answer.
      matrixLabel.text("T(x) = a·T(e₁) + b·T(e₂)");
      caption.text("It lands on the moved vertex — the same (a, b), a new basis.");
      yield* demoDot.size(28, b.landUp!);
      yield* demoDot.size(18, b.landDown!);
      yield* waitFor(b.hold!);
    },

    *["all-vertices"]() {
      const b = beats("all-vertices");
      matrixLabel.text("every vertex: same columns, its own (a, b)");
      caption.text(
        "Each vertex walks its own recipe on the same two columns — which is why two columns move the whole craft.",
      );
      yield* all(
        craft.opacity(1, b.focus!),
        guideX.opacity(0, b.focus!),
        guideY.opacity(0, b.focus!),
        ...markedDots.map((d) => d.opacity(1, b.focus!)),
      );
      yield* all(
        ...otherWalks.flatMap(({ first, second }) => [
          first.opacity(0.75, b.walksIn!),
          second.opacity(0.75, b.walksIn!),
        ]),
      );
      yield* waitFor(b.settle!);
      yield* waitFor(b.hold!);
    },
  };

  for (const segment of COLUMNS_RULE_GRAPHIC_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `columns-rule-graphic.${segment.id}`,
    );
  }
});
