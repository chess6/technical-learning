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
  approximatelyEqualMatrix,
  approximatelyEqualVector,
  collapseWitness2x2,
  inverse2x2,
  matrixMatrixMultiply,
  matrixVectorMultiply,
  productColumn,
  requireMatrixExample,
  type Matrix2x2,
  type Vector2 as MathVector2,
} from "../../math";
import { MATRIX_COMPOSITION_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  focusOpacities,
  formatSceneNumber,
  makeArrow,
  makeGraphicParts,
  makeLabel,
  makeOverlayLabel,
  makeSegment,
  makeStaticGrid,
  morphMatrixEntries,
  runSegment,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 6 Watch scene — "Matrix Composition & Inverses".
 *
 * The scene never *states* the product rule; it lets the learner watch the two
 * basis arrows travel. `e_j` goes to `R e_j`, then to `A(R e_j)` — and that
 * endpoint IS column `j` of `AR`. Everything after that (order, undoing, and
 * the map that cannot be undone) is the same question asked again.
 *
 * Correctness discipline (math-visualization-correctness): every matrix,
 * product, inverse, and null vector drawn here comes from `src/math`. The scene
 * derives nothing on its own, and `assertSceneMathIsConsistent` re-checks the
 * few relationships the choreography depends on before a single frame renders.
 *
 * Object persistence: `craft`, `e1`, `e2`, and the two collapse dots are created
 * once and only ever moved (they follow the live matrix signal) or re-coloured.
 * No teaching object is removed and re-added mid-timeline, so scrubbing to any
 * frame shows the same objects in a different state rather than a different set
 * of objects.
 */

const SCENE_ID = "matrix-composition";

const A = requireMatrixExample("shear-2-1").matrix; // [[2,1],[0,1]]
const R = requireMatrixExample("rotation").matrix; // [[0,-1],[1,0]]
const SINGULAR = requireMatrixExample("singular-collapse").matrix; // [[2,4],[1,2]]

/** "Apply R, then A" — the matrix AR. Derived, never hand-written. */
const AR: Matrix2x2 = matrixMatrixMultiply(A, R);
/** The other order, for the counterexample beat. */
const RA: Matrix2x2 = matrixMatrixMultiply(R, A);
const A_INVERSE: Matrix2x2 = inverse2x2(A)!;

/**
 * Two distinct inputs the singular map sends to the SAME output. `v` is `u`
 * plus a scaled null vector, so the two are guaranteed to share an image no
 * matter what `singular-collapse` is; the scale is chosen only so both dots sit
 * inside the safe frame and are visibly far apart before they merge.
 */
const COLLAPSE_WITNESS: MathVector2 = collapseWitness2x2(SINGULAR)!;
const WITNESS_SCALE = 0.25;
const COLLAPSE_U: MathVector2 = [1.5, -1.2];
const COLLAPSE_V: MathVector2 = [
  COLLAPSE_U[0] + COLLAPSE_WITNESS[0] * WITNESS_SCALE,
  COLLAPSE_U[1] + COLLAPSE_WITNESS[1] * WITNESS_SCALE,
];

/**
 * Correctness guard (single source of truth). Never fires for the shared
 * examples; it protects the scene if the example data changes underneath it.
 * Called once at the top of the generator.
 */
function assertSceneMathIsConsistent(): void {
  // The composite really is "apply R, then A" on every basis vector.
  for (const j of [0, 1] as const) {
    const viaStages = productColumn(A, R, j);
    const viaProduct = matrixVectorMultiply(AR, j === 0 ? [1, 0] : [0, 1]);
    if (!approximatelyEqualVector(viaStages, viaProduct, 1e-9)) {
      throw new Error("matrixCompositionScene: col_j(AR) != A·col_j(R).");
    }
  }
  // The order beat is only honest if the two orders genuinely differ.
  if (approximatelyEqualMatrix(AR, RA)) {
    throw new Error("matrixCompositionScene: AR and RA agree; no counterexample.");
  }
  // The undo beat must return the plane exactly to the identity.
  if (!approximatelyEqualMatrix(matrixMatrixMultiply(A_INVERSE, A), IDENTITY, 1e-9)) {
    throw new Error("matrixCompositionScene: A⁻¹A is not the identity.");
  }
  // The collapse beat needs two DISTINCT inputs with ONE shared image.
  if (approximatelyEqualVector(COLLAPSE_U, COLLAPSE_V, 1e-9)) {
    throw new Error("matrixCompositionScene: collapse inputs are not distinct.");
  }
  if (
    !approximatelyEqualVector(
      matrixVectorMultiply(SINGULAR, COLLAPSE_U),
      matrixVectorMultiply(SINGULAR, COLLAPSE_V),
      1e-9,
    )
  ) {
    throw new Error("matrixCompositionScene: collapse inputs do not share an image.");
  }
}

const IDENTITY: Matrix2x2 = [
  [1, 0],
  [0, 1],
];

const px = (v: MathVector2): Vector2 => new Vector2(v[0] * SCALE, -v[1] * SCALE);
const fmt = (n: number) => formatSceneNumber(n);
const matrixText = (m: Matrix2x2): string =>
  `[${fmt(m[0][0])} ${fmt(m[0][1])} ; ${fmt(m[1][0])} ${fmt(m[1][1])}]`;

export const matrixCompositionScene = makeScene2D(function* (view) {
  assertSceneMathIsConsistent();
  view.fill(ROLE.background);

  // --- Live matrix: every moving object reads these four signals ---
  const m11 = createSignal(1);
  const m12 = createSignal(0);
  const m21 = createSignal(0);
  const m22 = createSignal(1);
  const matrix = (): Matrix2x2 => [
    [m11(), m12()],
    [m21(), m22()],
  ];
  const setMatrix = (m: Matrix2x2): void => {
    m11(m[0][0]);
    m12(m[0][1]);
    m21(m[1][0]);
    m22(m[1][1]);
  };

  const grid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  grid.opacity(0.24);
  view.add(grid);

  // The original craft, dashed and fixed — "what it was", always visible so a
  // learner can tell what moved.
  const ghost = makeGraphicParts(() => IDENTITY, OPENING_GRAPHIC, { ghost: true });
  view.add(ghost);

  // The one craft that moves. Created once; only ever deformed.
  const craft = makeGraphicParts(matrix, OPENING_GRAPHIC);
  view.add(craft);

  const origin = new Circle({ size: 12, fill: ROLE.text });
  view.add(origin);

  // --- The two tracked basis arrows (persistent identity) ---
  const e1 = makeArrow(ROLE.basis1, 6);
  e1.points(() => [new Vector2(0, 0), px([m11(), m21()])]);
  view.add(e1);
  const e2 = makeArrow(ROLE.basis2, 6);
  e2.points(() => [new Vector2(0, 0), px([m12(), m22()])]);
  view.add(e2);

  const e1Label = makeLabel("e₁", ROLE.basis1, 34);
  e1Label.position(() => px([m11(), m21()]).add(new Vector2(20, 18)));
  view.add(e1Label);
  const e2Label = makeLabel("e₂", ROLE.basis2, 34);
  e2Label.position(() => px([m12(), m22()]).add(new Vector2(20, -10)));
  view.add(e2Label);

  // --- Two-stage paths: e_j → R e_j → A(R e_j). Drawn once, revealed later. ---
  const path1 = makeSegment(ROLE.basis1, 3, true);
  path1.points([px([1, 0]), px(productColumn(IDENTITY, R, 0)), px(productColumn(A, R, 0))]);
  path1.opacity(0);
  view.add(path1);
  const path2 = makeSegment(ROLE.basis2, 3, true);
  path2.points([px([0, 1]), px(productColumn(IDENTITY, R, 1)), px(productColumn(A, R, 1))]);
  path2.opacity(0);
  view.add(path2);

  // Endpoint markers: "column j of AR is HERE".
  const end1 = new Circle({ size: 18, fill: ROLE.basis1, opacity: 0 });
  end1.position(px(productColumn(A, R, 0)));
  view.add(end1);
  const end2 = new Circle({ size: 18, fill: ROLE.basis2, opacity: 0 });
  end2.position(px(productColumn(A, R, 1)));
  view.add(end2);

  // --- The other order, kept as a dashed comparison outline ---
  const otherOrder = makeGraphicParts(() => AR, OPENING_GRAPHIC, {
    ghost: true,
    color: ROLE.transformed,
  });
  otherOrder.opacity(0);
  view.add(otherOrder);

  // --- Collapse beat: two distinct inputs that share one image ---
  const dotU = new Circle({ size: 22, fill: ROLE.selected, opacity: 0 });
  dotU.position(() => px(matrixVectorMultiply(matrix(), COLLAPSE_U)));
  view.add(dotU);
  const dotV = new Circle({ size: 22, fill: ROLE.result, opacity: 0 });
  dotV.position(() => px(matrixVectorMultiply(matrix(), COLLAPSE_V)));
  view.add(dotV);
  const dotULabel = makeLabel("u", ROLE.selected, 32);
  dotULabel.opacity(0);
  dotULabel.position(() =>
    px(matrixVectorMultiply(matrix(), COLLAPSE_U)).add(new Vector2(24, 20)),
  );
  view.add(dotULabel);
  const dotVLabel = makeLabel("v", ROLE.result, 32);
  dotVLabel.opacity(0);
  dotVLabel.position(() =>
    px(matrixVectorMultiply(matrix(), COLLAPSE_V)).add(new Vector2(-26, -20)),
  );
  view.add(dotVLabel);

  // --- Overlay bands ---
  const top = makeOverlayLabel("Composition: do one map, then another", ROLE.text, 34);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 26);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);
  const setTop = (s: string) => top.text(s);
  const setCaption = (s: string) => caption.text(s);
  setCaption(`A = ${matrixText(A)},  R = ${matrixText(R)} (rotate a quarter turn)`);

  /** Bring every teaching object back to full opacity after a focus beat. */
  const unfocusAll = (duration = 0.3): ThreadGenerator =>
    focusOpacities(
      [
        { node: craft, opacity: 1 },
        { node: e1, opacity: 1 },
        { node: e2, opacity: 1 },
        { node: e1Label, opacity: 1 },
        { node: e2Label, opacity: 1 },
      ],
      duration,
    );

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const bodies: Record<string, () => ThreadGenerator> = {
    *["apply-b"]() {
      const b = beats("apply-b");
      setTop("Apply the first map");
      setCaption("R rotates a quarter turn. Watch e₁ and e₂ — nothing else is needed.");
      yield* waitFor(b.hold!);
      yield* morphMatrixEntries(m11, m12, m21, m22, R, b.morph!);
      setCaption(`Now e₁ sits at ${vectorText(productColumn(IDENTITY, R, 0))} and e₂ at ${vectorText(productColumn(IDENTITY, R, 1))} — the columns of R.`);
      yield* waitFor(b.hold2!);
    },

    *["apply-a"]() {
      const b = beats("apply-a");
      setTop("Then apply the second");
      setCaption("A now acts on the R-image. Each basis arrow moves a SECOND time.");
      yield* waitFor(b.hold!);
      // Morph straight to AR: applying A to the current (R-deformed) plane IS
      // the composite, so the live matrix becomes AR.
      yield* morphMatrixEntries(m11, m12, m21, m22, AR, b.morph!);
      setCaption("Two moves. Each arrow traced a path: eⱼ → R eⱼ → A(R eⱼ).");
      yield* all(path1.opacity(0.85, b.paths!), path2.opacity(0.85, b.paths!));
      yield* waitFor(b.hold2!);
    },

    *["one-map"]() {
      const b = beats("one-map");
      setTop("One matrix does both");
      setCaption("Reset to the identity, then apply a SINGLE matrix — AR — in one motion.");
      // Snap-then-morph, so the reset reads under scrubbing rather than as a
      // long tween the learner might mistake for a third transformation. This is
      // the documented rule: return to an intelligible baseline (the identity)
      // before applying an unrelated map.
      setMatrix(IDENTITY);
      yield* waitFor(b.hold!);
      yield* morphMatrixEntries(m11, m12, m21, m22, AR, b.morph!);
      setCaption(`It lands in exactly the same place. AR = ${matrixText(AR)} — "apply R first, then A".`);
      yield* waitFor(b.hold2!);
    },

    *columns() {
      const b = beats("columns");
      setTop("Column j is where eⱼ ended up");
      setCaption("Dim everything else: follow e₁ alone, from where it started to where it stopped.");
      // Snap the focus (see the `no-undo` note): scrubbing to this beat must
      // land on "only e₁ is lit", not on the previous beat's full picture.
      craft.opacity(0.12);
      e2.opacity(0.12);
      e2Label.opacity(0.12);
      e1.opacity(1);
      path1.opacity(0.85);
      end1.opacity(1);
      yield* waitFor(b.hold!);
      setCaption(`Its endpoint is ${vectorText(productColumn(A, R, 0))} — and that is column 1 of AR. Column 1 of AR = A · (column 1 of R).`);
      yield* waitFor(b.hold2!);
      setCaption("The same is true of e₂ — so the product has no separate rule to memorize.");
      yield* focusOpacities(
        [
          { node: e2, opacity: 1 },
          { node: e2Label, opacity: 1 },
          { node: e1, opacity: 0.25 },
        ],
        b.focus!,
      );
      yield* end2.opacity(1, b.end2!);
      yield* waitFor(b.hold3!);
      yield* unfocusAll(b.unfocus!);
      yield* waitFor(b.hold4!);
    },

    *["predict-order"]() {
      const b = beats("predict-order");
      setTop("Predict: does the order matter?");
      // Keep AR's landing place on screen as a dashed outline — the prediction
      // is about whether the OTHER order reaches it, so it must stay visible.
      otherOrder.opacity(1);
      path1.opacity(0);
      path2.opacity(0);
      end1.opacity(0);
      end2.opacity(0);
      setMatrix(IDENTITY);
      setCaption("The dashed outline is where R-then-A landed. Now do it the other way: A first, then R.");
      yield* waitFor(b.reset!);
      yield* waitFor(b.ask!);
      setCaption("Predict: does the craft land back on that dashed outline, or somewhere else?");
      yield* waitFor(b.think!);
    },

    *order() {
      const b = beats("order");
      setTop("Swap the order");
      setCaption("Building A-then-R from the identity…");
      yield* waitFor(b.hold!);
      yield* morphMatrixEntries(m11, m12, m21, m22, RA, b.morph!);
      setCaption(`RA = ${matrixText(RA)} lands somewhere else entirely — clear of the dashed AR outline. Order matters in general (though I and its multiples do commute).`);
      yield* waitFor(b.hold2!);
    },

    *undo() {
      const b = beats("undo");
      setTop("Undo it");
      setCaption("Reset to the identity, then apply A on its own.");
      otherOrder.opacity(0);
      // Reset to the baseline and then WATCH A being applied, rather than
      // snapping the craft from RA straight onto A's image — a snap between two
      // unrelated states says nothing, and the undo only reads if the do was seen.
      setMatrix(IDENTITY);
      yield* waitFor(b.hold!);
      yield* morphMatrixEntries(m11, m12, m21, m22, A, b.toA!);
      setCaption("Is there a map that puts every point back?");
      yield* waitFor(b.hold2!);
      setCaption(`A⁻¹ = ${matrixText(A_INVERSE)} sends each basis arrow back where it started: A⁻¹A = I.`);
      // Morphing the live matrix A → I *is* applying A⁻¹ to the current plane.
      yield* morphMatrixEntries(m11, m12, m21, m22, IDENTITY, b.undo!);
      setCaption("The craft lands exactly on its dashed original. Nothing was lost, so everything came back.");
      yield* waitFor(b.hold3!);
    },

    *["no-undo"]() {
      const b = beats("no-undo");
      setTop("When there is nothing to undo");
      setCaption("Two different starting points, u and v.");
      setMatrix(IDENTITY);
      // SNAP, don't tween. A learner who scrubs to this beat lands on its FIRST
      // frame, and that frame must already say what the beat is about: the craft
      // retired, the two points lit. Fading in over half a second would leave
      // the first frame showing the previous beat's picture.
      // (Dimmed, not removed — object persistence holds across the whole scene.)
      craft.opacity(0.1);
      ghost.opacity(0.1);
      e1.opacity(0.15);
      e2.opacity(0.15);
      e1Label.opacity(0.15);
      e2Label.opacity(0.15);
      dotU.opacity(1);
      dotV.opacity(1);
      dotULabel.opacity(1);
      dotVLabel.opacity(1);
      yield* waitFor(b.hold!);
      setCaption("This map squashes the whole plane onto a line.");
      yield* morphMatrixEntries(m11, m12, m21, m22, SINGULAR, b.morph!);
      setCaption("u and v have landed on ONE point. An undo would have to choose which to send back — so no function can exist.");
      // Pulse the merged point rather than drawing a "reverse" arrow: there is
      // no reverse arrow to draw, and inventing one would be a lie.
      yield* all(dotU.size(34, b.up!), dotV.size(34, b.up!));
      yield* all(dotU.size(22, b.down!), dotV.size(22, b.down!));
      yield* waitFor(b.hold2!);
    },
  };

  for (const segment of MATRIX_COMPOSITION_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});

function vectorText(v: MathVector2): string {
  return `(${fmt(v[0])}, ${fmt(v[1])})`;
}
