import { Circle, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import { MATRIX_LESSON_EXAMPLE } from "../../lessons/exampleData";
import {
  lerpIdentityToMatrix,
  matrixVectorMultiply,
  type Matrix2x2,
} from "../../math";
import { MATRIX_TRANSFORMATION_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  ROLE,
  SCALE,
  OVERLAY_CLEAR_HALF_EXTENT,
  formatSceneNumber,
  focusOpacities,
  makeArrow,
  makeLabel,
  makeSegment,
  makeStaticGrid,
  makeTransformedGrid,
  morphMatrixEntries,
  runSegment,
} from "./sceneKit";
import {
  makeAttachedLabel,
  makeEquationLedger,
  makeFullFrameTreatment,
  makeTemporaryAnnotation,
  makeViewportRig,
  silentHold,
  uninterruptedMotion,
} from "./scenePresentation";

/**
 * Guided scene for Lesson 2: a 2x2 matrix moves the basis vectors, deforms the
 * grid, carries a sample vector along, and tours a few canonical
 * transformations. The concrete matrix is the shared A = [[2, 1], [0, 1]].
 *
 * This scene is deliberately UNCLUTTERED: it focuses on e₁, e₂, their images,
 * the matrix columns, one general vector, and the transformed grid — the
 * derivation of the columns rule. The shared craft is NOT carried through here;
 * it returns in a dedicated callback scene (columnsRuleGraphicScene) after the
 * rule is derived.
 *
 * Quality-bar focus: column→Aeᵢ identity (tip coordinates bind column to
 * vector), attention focus during column beats, shared morph helper.
 */

const A = MATRIX_LESSON_EXAMPLE.matrix as Matrix2x2;
const IDENTITY: Matrix2x2 = [
  [1, 0],
  [0, 1],
];
const SAMPLE = (MATRIX_LESSON_EXAMPLE.inputVector ?? [1.5, 0.5]) as [
  number,
  number,
];

const px = (v: readonly [number, number]): Vector2 =>
  new Vector2(v[0] * SCALE, -v[1] * SCALE);
const fmt = (n: number) => formatSceneNumber(n);
const SCENE_ID = "matrix-transformations";

export const matrixTransformationScene = makeScene2D(function* (view) {
  view.fill(ROLE.background);

  const viewport = makeViewportRig();
  const world = viewport.world;
  view.add(world);

  const ma = createSignal(1);
  const mb = createSignal(0);
  const mc = createSignal(0);
  const md = createSignal(1);
  const matrix = (): Matrix2x2 => [
    [ma(), mb()],
    [mc(), md()],
  ];

  const ghostGrid = makeStaticGrid(OVERLAY_CLEAR_HALF_EXTENT);
  ghostGrid.opacity(0.18);
  world.add(ghostGrid);

  const tGrid = makeTransformedGrid(matrix, OVERLAY_CLEAR_HALF_EXTENT);
  tGrid.opacity(0);
  world.add(tGrid);

  const origin = new Circle({ size: 14, fill: ROLE.text });
  world.add(origin);

  const e1Ghost = makeArrow(ROLE.dim, 3);
  e1Ghost.opacity(0).points([new Vector2(0, 0), px([1, 0])]);
  const e2Ghost = makeArrow(ROLE.dim, 3);
  e2Ghost.opacity(0).points([new Vector2(0, 0), px([0, 1])]);
  world.add(e1Ghost);
  world.add(e2Ghost);

  const e1 = makeArrow(ROLE.basis1, 6, "semantic:matrix:column-1");
  e1.end(0).points(() => [new Vector2(0, 0), px([ma(), mc()])]);
  const e2 = makeArrow(ROLE.basis2, 6, "semantic:matrix:column-2");
  e2.end(0).points(() => [new Vector2(0, 0), px([mb(), md()])]);
  world.add(e1);
  world.add(e2);

  /**
   * How far the sample vector has been carried along by A, independent of the
   * basis morph. At 0 the sample sits at x (its ORIGINAL position); at 1 it
   * sits at Ax. Because lerpIdentityToMatrix is linear in the entries,
   * ((1−t)I + tA)·x = (1−t)x + t·Ax — the straight-line path is exactly the
   * path the deforming grid takes, so the travel is not an invented motion.
   *
   * This exists because the sample used to be bound directly to `matrix()`,
   * which by the sample beat was already A: the vector was born transformed
   * and its "transform" beat was only a line-width pulse.
   */
  const sampleT = createSignal(0);
  const sampleMatrix = (): Matrix2x2 =>
    lerpIdentityToMatrix(matrix(), sampleT());
  const samplePoint = (): [number, number] =>
    matrixVectorMultiply(sampleMatrix(), SAMPLE) as [number, number];

  // Where the sample started, kept on screen so the travel has a reference.
  const sampleGhost = makeArrow(ROLE.dim, 3);
  sampleGhost.opacity(0).points([new Vector2(0, 0), px(SAMPLE)]);
  world.add(sampleGhost);

  // The two components of the sample, on whichever basis is current: they make
  // "same coefficients, new basis images" watchable rather than asserted.
  const comp1 = makeSegment(
    ROLE.basis1,
    3,
    true,
    "semantic:matrix:component-1",
  );
  comp1.opacity(0).points(() => {
    const m = sampleMatrix();
    return [new Vector2(0, 0), px([SAMPLE[0] * m[0][0], SAMPLE[0] * m[1][0]])];
  });
  const comp2 = makeSegment(
    ROLE.basis2,
    3,
    true,
    "semantic:matrix:component-2",
  );
  comp2.opacity(0).points(() => {
    const m = sampleMatrix();
    return [px([SAMPLE[0] * m[0][0], SAMPLE[0] * m[1][0]]), px(samplePoint())];
  });
  world.add(comp1);
  world.add(comp2);

  const sample = makeArrow(ROLE.selected, 5, "semantic:matrix:sample");
  sample.end(0).points(() => [new Vector2(0, 0), px(samplePoint())]);
  world.add(sample);

  /**
   * One gridline and its image — the "lines stay lines" probe.
   *
   * Deliberately the VERTICAL line x = 1: this shear maps every horizontal
   * line onto itself, so a horizontal probe would draw its image exactly on
   * top of its ghost and demonstrate nothing. The vertical line visibly tilts
   * (endpoints (1, ±1.8) land at (1∓1.8, ±1.8)) while staying straight.
   */
  const PROBE_FROM: [number, number] = [1, -1.8];
  const PROBE_TO: [number, number] = [1, 1.8];
  const probeGhost = makeSegment(ROLE.dim, 3);
  probeGhost.opacity(0).points([px(PROBE_FROM), px(PROBE_TO)]);
  const probeImage = makeSegment(
    ROLE.transformed,
    4,
    false,
    "semantic:matrix:probe-image",
  );
  probeImage
    .opacity(0)
    .end(0)
    .points(() => [
      px(matrixVectorMultiply(matrix(), PROBE_FROM) as [number, number]),
      px(matrixVectorMultiply(matrix(), PROBE_TO) as [number, number]),
    ]);
  world.add(probeGhost);
  world.add(probeImage);

  // Tip annotations are stacked away from the vectors and from each other:
  // Ae₁ ends near (2, 0) and Ae₂ near (1, 1), so labels offset toward the
  // arrows used to pile onto the same few pixels (and onto the sample once it
  // is drawn at its untransformed position). e₁ reads below its tip, e₂ above.
  const e1Label = makeAttachedLabel("e₁", () => px([ma(), mc()]), {
    color: ROLE.basis1,
    fontSize: 34,
    offset: new Vector2(20, 28),
    key: "semantic:matrix:column-1-label",
  });
  e1Label.opacity(0);
  const e2Label = makeAttachedLabel("e₂", () => px([mb(), md()]), {
    color: ROLE.basis2,
    fontSize: 34,
    offset: new Vector2(-16, -32),
    key: "semantic:matrix:column-2-label",
  });
  e2Label.opacity(0);
  world.add(e1Label);
  world.add(e2Label);

  // Tip coordinate readouts — bind column entries to the landing tip.
  const e1Coords = makeLabel("", ROLE.basis1, 26);
  e1Coords.opacity(0).position(() => px([ma(), mc()]).add(new Vector2(20, 62)));
  const e2Coords = makeLabel("", ROLE.basis2, 26);
  e2Coords
    .opacity(0)
    .position(() => px([mb(), md()]).add(new Vector2(-16, -66)));
  world.add(e1Coords);
  world.add(e2Coords);

  // A compact, persistent algebra ledger replaces the old permanent title and
  // prose caption bands. Geometry remains the primary explanation.
  const ledger = makeEquationLedger(
    [
      {
        id: "matrix",
        label: "map",
        value: () =>
          `A = [[${fmt(ma())}, ${fmt(mb())}], [${fmt(mc())}, ${fmt(md())}]]`,
      },
      { id: "relation", label: "watch", value: "", color: ROLE.selected },
    ],
    {
      position: new Vector2(-285, -190),
      width: 360,
      key: "semantic:matrix:ledger",
    },
  );
  ledger.node.opacity(0);
  view.add(ledger.node);
  const caption = ledger.row("relation").value;
  const setCaption = (text: string) => caption.text(text);

  const prediction = makeFullFrameTreatment(
    "Both columns are known. Where does x land?",
    { kind: "prediction", key: "presentation:matrix:prediction" },
  );
  view.add(prediction.node);

  const lineAnnotation = makeTemporaryAnnotation(
    "straight line",
    new Vector2(245, -105),
    () => px(matrixVectorMultiply(matrix(), PROBE_TO) as [number, number]),
    { key: "presentation:matrix:line-annotation" },
  );
  world.add(lineAnnotation.node);

  setCaption("e₁=(1,0) · e₂=(0,1)");
  e1Label.opacity(1);
  e2Label.opacity(1);
  e1Ghost.opacity(0.35);
  e2Ghost.opacity(0.35);

  function* morphTo(target: Matrix2x2, dur: number): ThreadGenerator {
    yield* morphMatrixEntries(ma, mb, mc, md, target, dur);
  }

  const beats = (segmentId: string) => requireBeats(SCENE_ID, segmentId);

  const bodies: Record<string, () => ThreadGenerator> = {
    *identity() {
      const b = beats("identity");
      setCaption("e₁=(1,0) · e₂=(0,1)");
      yield* all(
        ledger.node.opacity(1, b.establish!),
        e1.end(1, b.establish!),
        e2.end(1, b.establish!),
        e1Label.opacity(1, b.establish!),
        e2Label.opacity(1, b.establish!),
      );
      yield* all(
        e1Ghost.opacity(0.5, b.ghostsIn!),
        e2Ghost.opacity(0.5, b.ghostsIn!),
      );
      yield* silentHold(b.hold!);
    },
    *col1() {
      const b = beats("col1");
      // Column → tip coordinates → Ae₁: identity preserved across the beat.
      setCaption("col₁(A)=Ae₁");
      // The grid is VISIBLE (dim) while the column moves, so the deformation is
      // watched as a consequence of the column. It used to be forced to 0 here
      // and faded in already-deformed two beats later, which asserted the
      // scene's own motto instead of showing it.
      yield* all(
        focusOpacities(
          [
            { node: e1, opacity: 1 },
            { node: e1Label, opacity: 1 },
            { node: e2, opacity: 0.3 },
            { node: e2Label, opacity: 0.3 },
            { node: sample, opacity: 0.2 },
            { node: tGrid, opacity: 0.32 },
          ],
          b.focus!,
        ),
        viewport.focusOn({ x: 70, y: 0 }, 1.12, b.focus!),
      );
      yield* e1.lineWidth(9, b.columnUp!);
      yield* all(
        ma(A[0][0], b.columnMove!, easeInOutCubic),
        mc(A[1][0], b.columnMove!, easeInOutCubic),
      );
      e1Coords.text(`(${fmt(A[0][0])}, ${fmt(A[1][0])})`);
      e1Label.text("Ae₁");
      yield* e1Coords.opacity(1, b.readoutIn!);
      yield* e1.lineWidth(6, b.columnDown!);
      yield* silentHold(b.hold!);
    },
    *col2() {
      const b = beats("col2");
      setCaption("col₂(A)=Ae₂");
      yield* all(
        focusOpacities(
          [
            { node: e2, opacity: 1 },
            { node: e2Label, opacity: 1 },
            { node: e1, opacity: 0.35 },
            { node: e1Label, opacity: 0.35 },
            { node: e1Coords, opacity: 0.45 },
            { node: sample, opacity: 0.2 },
          ],
          b.focus!,
        ),
        viewport.focusOn({ x: 30, y: -30 }, 1.12, b.focus!),
      );
      yield* e2.lineWidth(9, b.columnUp!);
      yield* all(
        mb(A[0][1], b.columnMove!, easeInOutCubic),
        md(A[1][1], b.columnMove!, easeInOutCubic),
      );
      e2Coords.text(`(${fmt(A[0][1])}, ${fmt(A[1][1])})`);
      e2Label.text("Ae₂");
      yield* e2Coords.opacity(1, b.readoutIn!);
      yield* e2.lineWidth(6, b.columnDown!);
      yield* silentHold(b.hold!);
    },
    *sample() {
      const b = beats("sample");
      // sampleT is still 0, so this draws x where it actually is — BEFORE the
      // transformation reaches it. Its components are shown on the original
      // (ghost) basis, which is what the coefficients are read against.
      setCaption(`x=${fmt(SAMPLE[0])}e₁+${fmt(SAMPLE[1])}e₂`);
      // The column readouts have made their point; retire them so the sample's
      // own construction owns the space it is drawn in.
      yield* all(
        focusOpacities(
          [
            { node: sample, opacity: 1 },
            { node: e1, opacity: 0.55 },
            { node: e2, opacity: 0.55 },
            { node: e1Label, opacity: 0.5 },
            { node: e2Label, opacity: 0.5 },
            { node: e1Coords, opacity: 0 },
            { node: e2Coords, opacity: 0 },
          ],
          b.focus!,
        ),
        viewport.reset(b.focus!),
      );
      yield* sample.end(1, b.draw!, easeInOutCubic);
      yield* all(
        comp1.opacity(0.85, b.componentsIn!),
        comp2.opacity(0.85, b.componentsIn!),
      );
      yield* silentHold(b.hold!);
    },
    *["predict-sample"]() {
      const b = beats("predict-sample");
      // A prediction is only real if the learner already holds every piece.
      // Both columns were derived two beats ago, so bring their tip readouts
      // back: (2, 0) and (1, 1) are exactly the data the answer is built from.
      setCaption("same coefficients → ?");
      yield* all(
        prediction.show(b.evidenceIn!),
        e1.opacity(1, b.evidenceIn!),
        e2.opacity(1, b.evidenceIn!),
        e1Label.opacity(1, b.evidenceIn!),
        e2Label.opacity(1, b.evidenceIn!),
        e1Coords.opacity(0.9, b.evidenceIn!),
        e2Coords.opacity(0.9, b.evidenceIn!),
      );
      yield* waitFor(b.think!);
    },
    *["transform-sample"]() {
      const b = beats("transform-sample");
      setCaption("x → Ax");
      // Retire the column readouts again so the travel owns the space.
      yield* all(
        prediction.hide(b.readoutsOut!),
        e1Coords.opacity(0, b.readoutsOut!),
        e2Coords.opacity(0, b.readoutsOut!),
      );
      // Leave the starting position on screen so the travel has a reference…
      yield* sampleGhost.opacity(0.45, b.ghostIn!);
      // …then carry x to Ax. Every bound node moves off the same signal: the
      // arrow, both dashed components, and the tip they meet at. The tip is
      // Ax by construction, so the drawing cannot drift from the claim.
      yield* uninterruptedMotion(sampleT(1, b.carry!, easeInOutCubic));
      // Close the loop on the prediction with the actual landing point,
      // computed from the shared matrix helper rather than written by hand.
      const landed = matrixVectorMultiply(A, SAMPLE);
      setCaption(`Ax=(${fmt(landed[0])},${fmt(landed[1])})`);
      yield* sample.lineWidth(8, b.landUp!);
      yield* sample.lineWidth(5, b.landDown!);
      yield* silentHold(b.hold!);
    },
    *grid() {
      const b = beats("grid");
      setCaption("lines→lines · 0→0");
      yield* all(
        tGrid.opacity(0.9, b.gridIn!),
        comp1.opacity(0.25, b.gridIn!),
        comp2.opacity(0.25, b.gridIn!),
      );
      // Trace one original gridline and its image: straightness and
      // parallelism are read off the picture instead of being claimed.
      yield* probeGhost.opacity(0.6, b.ghostLineIn!);
      yield* all(
        probeImage.opacity(1, b.imageIn!),
        lineAnnotation.show(b.imageIn!),
      );
      yield* probeImage.end(1, b.trace!, easeInOutCubic);
      setCaption("straightness preserved");
      yield* silentHold(b.hold!);
    },
    *compare() {
      const b = beats("compare");
      setCaption("I (ghost) ↔ A");
      yield* all(
        e1Ghost.opacity(0.7, b.ghostsIn!),
        e2Ghost.opacity(0.7, b.ghostsIn!),
      );
      yield* silentHold(b.hold!);
    },
    *presets() {
      const b = beats("presets");
      // Retire the derivation annotations; the tour is about the rule holding
      // for other matrices, not about this one's columns.
      yield* all(
        e1Coords.opacity(0, b.retire!),
        e2Coords.opacity(0, b.retire!),
        comp1.opacity(0, b.retire!),
        comp2.opacity(0, b.retire!),
        sampleGhost.opacity(0, b.retire!),
        probeGhost.opacity(0, b.retire!),
        probeImage.opacity(0, b.retire!),
        lineAnnotation.hide(b.retire!),
        sample.opacity(0.3, b.retire!),
      );
      // One preset dropped (a second rank-1 example after the projection added
      // no new idea) to buy time: each remaining step now gets ~3.1s, above the
      // one-new-idea-per-3s bar the audit measured this beat against.
      const tour: Array<[string, Matrix2x2]> = [
        [
          "scale",
          [
            [2, 0],
            [0, 2],
          ],
        ],
        [
          "rotation",
          [
            [0, -1],
            [1, 0],
          ],
        ],
        [
          "reflection",
          [
            [1, 0],
            [0, -1],
          ],
        ],
        [
          "projection · det=0",
          [
            [1, 0],
            [0, 0],
          ],
        ],
      ];
      const per = b.tour! / tour.length;
      for (const [name, target] of tour) {
        // Reset to the identity before each preset, as chapter0 does: morphing
        // one unrelated preset straight into another animates a transition that
        // means nothing.
        yield* morphTo(IDENTITY, per * 0.18);
        setCaption(name);
        yield* morphTo(target, per * 0.52);
        yield* waitFor(per * 0.3);
      }
    },
    *summary() {
      const b = beats("summary");
      setCaption("A[e₁ e₂]=[Ae₁ Ae₂]");
      yield* all(morphTo(A, b.restore!), sample.opacity(1, b.restore!));
      e1Label.text("Ae₁");
      e2Label.text("Ae₂");
      yield* silentHold(b.hold!);
    },
  };

  // Measured padding: each body runs, then the segment is padded to its exact
  // authored length, so the timeline always matches the step metadata.
  for (const segment of MATRIX_TRANSFORMATION_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `matrix-transformations.${segment.id}`,
    );
  }
});
