import { Circle, Line, Node, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  createSignal,
  easeInOutCubic,
  waitFor,
  type ThreadGenerator,
} from "@motion-canvas/core";
import {
  columnSpaceBasis,
  matVec,
  nullSpaceBasis,
  rankOf,
  type Matrix,
  type Vec,
} from "../../math";
import { SUBSPACES_RANK_SEGMENTS, requireBeats } from "./sceneTimings";
import {
  CUBE_EDGES,
  ISO_CUBE_CORNERS,
  ROLE,
  makeArrow,
  makeIsometricAxes,
  makeLabel,
  makeOverlayLabel,
  makeSegment,
  runSegment,
  toIsometric,
} from "./sceneKit";
import { LABEL_BOTTOM_Y, LABEL_CENTER_X, LABEL_TOP_Y } from "./safeFrame";

/**
 * Lesson 8 Watch scene — "Subspaces, Column Space, Null Space, Rank".
 *
 * The lesson's central error is believing the two spaces live in the same place.
 * This scene prevents it by LAYOUT: two labelled panels, inputs on the left and
 * outputs on the right, with the null space only ever drawn on the left and the
 * column space only ever drawn on the right.
 *
 * R^3 is drawn under a fixed isometric projection, and the scene says so
 * on-canvas. The projection preserves straightness and incidence but not angles,
 * so the scene never invites an inference about perpendicularity — in
 * particular, the null line is NOT claimed to be perpendicular to the image
 * plane (it generally is not; that is Lesson 12's subject).
 *
 * ENACTMENT (July 2026 audit). Two claims used to be made by fading a
 * pre-computed picture in:
 *
 *  - "Push the whole unit cube through A and watch where it lands" faded in an
 *    ALREADY-FLAT cube. The output cube now starts as an exact copy of the input
 *    cube and is carried to its image by a single `applyT` signal, so the
 *    flattening is the event the caption names.
 *  - "A whole line of them lands on a single point" snapped a line and a dot on.
 *    A probe now TRAVELS the null line in the input panel while its image —
 *    computed through the same live matrix — visibly stays on the output origin.
 *
 * Every case matrix is swapped in at `applyT = 0`, where the interpolation is
 * the identity for every matrix, so the swap is invisible by construction and
 * costs no time (the same mechanism the eigenvectors scene uses).
 *
 * Correctness discipline: rank, both bases, and every plotted image come from
 * `src/math`. `assertSceneMathIsConsistent` re-checks the relationships the
 * choreography depends on before a frame renders.
 */

const SCENE_ID = "subspaces-rank";

/** Rank 2: row 3 = row 1 + row 2, so the cube flattens onto a plane. */
const RANK_TWO: Matrix = [
  [1, 0, 2],
  [0, 1, 3],
  [1, 1, 5],
];
/** Rank 1: every row is a multiple of (1,2,3), so the image is a line. */
const RANK_ONE: Matrix = [
  [1, 2, 3],
  [2, 4, 6],
  [3, 6, 9],
];

const COL_BASIS_2 = columnSpaceBasis(RANK_TWO).basis;
const NULL_BASIS_2 = nullSpaceBasis(RANK_TWO).basis;
const COL_BASIS_1 = columnSpaceBasis(RANK_ONE).basis;

function assertSceneMathIsConsistent(): void {
  if (rankOf(RANK_TWO) !== 2 || rankOf(RANK_ONE) !== 1) {
    throw new Error("subspacesRankScene: example ranks are not 2 and 1.");
  }
  if (COL_BASIS_2.length !== 2 || NULL_BASIS_2.length !== 1) {
    throw new Error("subspacesRankScene: rank-2 map must have a 2-D image and a 1-D null space.");
  }
  // The drawn null line really is crushed to the origin.
  const image = matVec(RANK_TWO, NULL_BASIS_2[0]!);
  if (Math.hypot(...image) > 1e-9) {
    throw new Error("subspacesRankScene: the drawn null direction is not in Null(A).");
  }
  // The drawn image plane really is spanned by columns of A.
  for (const basisVector of COL_BASIS_2) {
    const isColumn = RANK_TWO[0]!.some((_, j) =>
      RANK_TWO.every((row, i) => Math.abs(row[j]! - basisVector[i]!) < 1e-9),
    );
    if (!isColumn) {
      throw new Error("subspacesRankScene: image-plane basis is not made of columns of A.");
    }
  }
}

const SCALE = 44;
const LEFT = new Vector2(-236, 24);
const RIGHT = new Vector2(236, 24);

type P3 = readonly [number, number, number];

const asP3 = (v: Vec): P3 => [v[0] ?? 0, v[1] ?? 0, v[2] ?? 0];
const add3 = (a: P3, b: P3): P3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale3 = (a: P3, k: number): P3 => [a[0] * k, a[1] * k, a[2] * k];

/** Unit vector in the direction of `v` (or `v` itself if it is already tiny). */
function unit3(v: P3): P3 {
  const length = Math.hypot(v[0], v[1], v[2]);
  return length < 1e-9 ? v : scale3(v, 1 / length);
}

/** Straight-line interpolation from the identity to `m`, at parameter `t`. */
function lerpIdentityTo(m: Matrix, t: number): Matrix {
  return m.map((row, i) =>
    row.map((value, j) => {
      const identity = i === j ? 1 : 0;
      return identity + (value - identity) * t;
    }),
  );
}

/** Static cube edges under a fixed matrix (or the identity when null). */
function makeCube(matrix: Matrix | null, origin: Vector2, color: string, width = 3): Node {
  const group = new Node({});
  const corner = (i: number): P3 => {
    const c = ISO_CUBE_CORNERS[i]!;
    return matrix ? asP3(matVec(matrix, [c[0], c[1], c[2]])) : c;
  };
  for (const [a, b] of CUBE_EDGES) {
    group.add(
      new Line({
        stroke: color,
        lineWidth: width,
        lineCap: "round",
        points: [
          toIsometric(corner(a), SCALE, origin),
          toIsometric(corner(b), SCALE, origin),
        ],
      }),
    );
  }
  return group;
}

/** Cube edges that follow a LIVE matrix, so the deformation can be watched. */
function makeLiveCube(
  matrixAt: () => Matrix,
  origin: Vector2,
  color: string,
  width = 3,
): Node {
  const group = new Node({});
  const corner = (i: number): P3 => {
    const c = ISO_CUBE_CORNERS[i]!;
    return asP3(matVec(matrixAt(), [c[0], c[1], c[2]]));
  };
  for (const [a, b] of CUBE_EDGES) {
    group.add(
      new Line({
        stroke: color,
        lineWidth: width,
        lineCap: "round",
        points: () => [
          toIsometric(corner(a), SCALE, origin),
          toIsometric(corner(b), SCALE, origin),
        ],
      }),
    );
  }
  return group;
}

/**
 * A filled parallelogram spanning ±u, ±v — a subspace drawn as a patch of the
 * plane it spans.
 *
 * The spanning vectors are NORMALIZED first. A basis vector's length is an
 * arbitrary artifact of which basis the algorithm happened to produce, so
 * scaling the patch by it would make one subspace render three times larger
 * than another for no mathematical reason — and, in the rank-1 case, run the
 * patch off the safe frame. Normalizing gives every subspace the same drawn
 * extent, which is the honest choice: the patch represents an unbounded plane,
 * so its size carries no meaning at all.
 */
function makePlane(u: P3, v: P3, origin: Vector2, color: string): Line {
  const EXTENT = 1.45;
  const a = unit3(u);
  const b = unit3(v);
  const corners: P3[] = [
    add3(scale3(a, -EXTENT), scale3(b, -EXTENT)),
    add3(scale3(a, EXTENT), scale3(b, -EXTENT)),
    add3(scale3(a, EXTENT), scale3(b, EXTENT)),
    add3(scale3(a, -EXTENT), scale3(b, EXTENT)),
  ];
  return new Line({
    points: corners.map((c) => toIsometric(c, SCALE, origin)),
    closed: true,
    fill: color,
    stroke: color,
    lineWidth: 2.5,
    opacity: 0.22,
  });
}

export const subspacesRankScene = makeScene2D(function* (view) {
  assertSceneMathIsConsistent();
  view.fill(ROLE.background);

  // --- The live map. `activeMap` is only ever swapped at applyT === 0, where
  // lerpIdentityTo(m, 0) is the identity for EVERY m — so the swap cannot be
  // seen and costs no time. ---
  const applyT = createSignal(0);
  let activeMap: Matrix = RANK_TWO;
  const liveMatrix = (): Matrix => lerpIdentityTo(activeMap, applyT());

  // --- Panels ---
  view.add(makeIsometricAxes(SCALE, LEFT));
  view.add(makeIsometricAxes(SCALE, RIGHT));

  const leftTitle = makeLabel("input space  ℝ³", ROLE.textMuted, 26);
  leftTitle.position(new Vector2(LEFT.x, LEFT.y - 148));
  view.add(leftTitle);
  const rightTitle = makeLabel("output space  ℝ³", ROLE.textMuted, 26);
  rightTitle.position(new Vector2(RIGHT.x, RIGHT.y - 148));
  view.add(rightTitle);

  // The arrow between panels IS the map. Hidden until `two-panels` reveals it
  // — its 0.6s fade-in is only real if it starts from nothing.
  const mapArrow = makeSegment(ROLE.textMuted, 2.5, true);
  mapArrow.points([new Vector2(-70, 24), new Vector2(70, 24)]);
  mapArrow.opacity(0);
  view.add(mapArrow);
  const mapLabel = makeLabel("A", ROLE.text, 30);
  mapLabel.position(new Vector2(0, -6));
  view.add(mapLabel);

  // --- Persistent objects (created once; only revealed or deformed) ---
  const cube = makeCube(null, LEFT, ROLE.original, 3);
  cube.opacity(0);
  view.add(cube);

  // The output cube is the SAME cube, drawn in the output panel and carried by
  // the live matrix. At applyT = 0 it is an exact copy of the input cube.
  const imageCube = makeLiveCube(liveMatrix, RIGHT, ROLE.transformed, 3);
  imageCube.opacity(0);
  view.add(imageCube);

  const imagePlane = makePlane(
    asP3(COL_BASIS_2[0]!),
    asP3(COL_BASIS_2[1]!),
    RIGHT,
    ROLE.basis1,
  );
  imagePlane.opacity(0);
  view.add(imagePlane);

  const imageLine = makeSegment(ROLE.basis1, 5);
  {
    // Drawn slightly longer than the plane's half-extent so a 1-D subspace does
    // not read as "smaller" than a 2-D one — both are unbounded.
    const d = unit3(asP3(COL_BASIS_1[0]!));
    imageLine.points([
      toIsometric(scale3(d, -2), SCALE, RIGHT),
      toIsometric(scale3(d, 2), SCALE, RIGHT),
    ]);
  }
  imageLine.opacity(0);
  view.add(imageLine);

  const NULL_DIR = unit3(asP3(NULL_BASIS_2[0]!));
  const nullLine = makeSegment(ROLE.result, 5);
  nullLine.points([
    toIsometric(scale3(NULL_DIR, -2), SCALE, LEFT),
    toIsometric(scale3(NULL_DIR, 2), SCALE, LEFT),
  ]);
  nullLine.opacity(0);
  view.add(nullLine);

  // Rank-1 null space is a PLANE in the input panel.
  const nullPlane = (() => {
    const basis = nullSpaceBasis(RANK_ONE).basis;
    return makePlane(asP3(basis[0]!), asP3(basis[1]!), LEFT, ROLE.result);
  })();
  nullPlane.opacity(0);
  view.add(nullPlane);

  /**
   * The probe: one input travelling the null line, and its image. The image
   * position goes through the SAME live matrix as the cube, so "it never leaves
   * the origin" is computed, not drawn by hand.
   */
  const probeT = createSignal(0);
  const probePoint = (): P3 => scale3(NULL_DIR, probeT() * 1.7);
  const probeDot = new Circle({ size: 18, fill: ROLE.selected, opacity: 0 });
  probeDot.position(() => toIsometric(probePoint(), SCALE, LEFT));
  view.add(probeDot);
  const probeImage = new Circle({ size: 18, fill: ROLE.selected, opacity: 0 });
  probeImage.position(() =>
    toIsometric(asP3(matVec(liveMatrix(), [...probePoint()])), SCALE, RIGHT),
  );
  view.add(probeImage);

  // The origin dot in the output panel: where the whole null line lands.
  const outputOrigin = new Circle({ size: 16, fill: ROLE.result, opacity: 0 });
  outputOrigin.position(toIsometric([0, 0, 0], SCALE, RIGHT));
  view.add(outputOrigin);

  /* ---------------------------------------------------------------------
   * Building the column space out of the columns.
   *
   * The scene showed the image plane by flattening a cube, and then NAMED it
   * "the span of A's columns" — but the columns were never drawn, so span,
   * independence, and rank were three words attached to one picture rather
   * than three things a learner could see relate.
   *
   * This apparatus adds the columns one at a time. The first opens a line. The
   * second points off that line — a genuinely new direction — and the reachable
   * set grows to a plane, taking the rank with it. The third is 2c₁ + 3c₂, so it
   * lands INSIDE the plane it is offered to: nothing new is reached and the rank
   * does not move. That is what "dependent" costs, shown rather than defined.
   *
   * Drawn at a common length: span depends only on direction, and the columns'
   * true lengths differ by a factor of six here, which would push c₃ clean off
   * the panel while leaving c₁ a stub. The caption states the dependency
   * relation in full, so the arithmetic is not hidden by the drawing choice.
   * ------------------------------------------------------------------- */
  const ARROW_LEN = 1.5;
  const columnOf = (m: Matrix, j: number): P3 =>
    [m[0]![j]!, m[1]![j]!, m[2]![j]!] as P3;
  // c₁ and c₂ are the co-equal pair that spans, so they take the pair roles.
  // c₃ takes `selected` — the column currently under discussion — rather than
  // `violation`: a dependent column breaks no rule, it simply buys nothing.
  const COLUMN_ROLE = [ROLE.basis1, ROLE.basis2, ROLE.selected] as const;
  // Hand-placed: the isometric projection foreshortens c₃ almost to the origin,
  // so a proportional offset would print its label on the other two arrowheads.
  const COLUMN_LABEL_OFFSET = [
    new Vector2(20, 16),
    new Vector2(-6, -20),
    new Vector2(34, -18),
  ] as const;
  const columnArrows = [0, 1, 2].map((j) => {
    const direction = scale3(unit3(columnOf(RANK_TWO, j)), ARROW_LEN);
    const arrow = makeArrow(
      COLUMN_ROLE[j]!,
      5,
      `semantic:subspaces:column-${j + 1}`,
    );
    arrow.points([
      toIsometric([0, 0, 0], SCALE, RIGHT),
      toIsometric(direction, SCALE, RIGHT),
    ]);
    arrow.opacity(0);
    view.add(arrow);
    const label = makeLabel(`c${["₁", "₂", "₃"][j]}`, COLUMN_ROLE[j]!, 26);
    label.position(
      toIsometric(direction, SCALE, RIGHT).add(COLUMN_LABEL_OFFSET[j]!),
    );
    label.opacity(0);
    view.add(label);
    return { arrow, label };
  });

  /** The span of the columns admitted so far, while it is still just a line. */
  const spanLine = makeSegment(ROLE.basis1, 4, true);
  {
    const d = unit3(columnOf(RANK_TWO, 0));
    spanLine.points([
      toIsometric(scale3(d, -2), SCALE, RIGHT),
      toIsometric(scale3(d, 2), SCALE, RIGHT),
    ]);
  }
  spanLine.opacity(0);
  view.add(spanLine);

  /**
   * What the columns admitted so far can reach, and the rank that follows.
   * One string so the two can never be shown disagreeing.
   */
  const reachSoFar = createSignal("");
  const reachReadout = makeLabel(() => reachSoFar(), ROLE.basis1, 23);
  reachReadout.position(new Vector2(RIGHT.x, RIGHT.y + 150));
  reachReadout.opacity(0);
  view.add(reachReadout);

  const colLabel = makeLabel("Col(A)", ROLE.basis1, 28);
  colLabel.position(new Vector2(RIGHT.x + 6, RIGHT.y + 116));
  colLabel.opacity(0);
  view.add(colLabel);
  const nullLabel = makeLabel("Null(A)", ROLE.result, 28);
  nullLabel.position(new Vector2(LEFT.x + 4, LEFT.y + 116));
  nullLabel.opacity(0);
  view.add(nullLabel);

  // --- Overlays ---
  const top = makeOverlayLabel("Two spaces, not one", ROLE.text, 34);
  top.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y));
  view.add(top);
  const caption = makeOverlayLabel("", ROLE.textMuted, 25);
  caption.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y));
  view.add(caption);
  const setTop = (s: string) => top.text(s);
  const setCaption = (s: string) => caption.text(s);

  // The projection is named on-canvas: it preserves straightness, not angles.
  const projectionNote = makeLabel("isometric view — angles are not to scale", ROLE.dim, 20);
  // Under the title, not above the caption: the caption wraps to two lines on
  // the longer beats and printed itself over this note.
  projectionNote.position(new Vector2(LABEL_CENTER_X, LABEL_TOP_Y + 34));
  view.add(projectionNote);

  const beats = (id: string) => requireBeats(SCENE_ID, id);

  const bodies: Record<string, () => ThreadGenerator> = {
    *["two-panels"]() {
      const b = beats("two-panels");
      setTop("Two spaces, not one");
      setCaption("Inputs live on the left. Outputs live on the right. A is the arrow between them.");
      yield* waitFor(b.hold!);
      yield* all(cube.opacity(1, b.in!), mapArrow.opacity(1, b.in!));
      yield* waitFor(b.hold2!);
    },

    *reach() {
      const b = beats("reach");
      setTop("What the map can reach");
      setCaption("Copy the cube into the output panel — untouched, so far.");
      // applyT is 0, so this copy is geometrically identical to the input cube.
      yield* imageCube.opacity(1, b.copy!);
      yield* waitFor(b.hold!);
      setCaption("Now push it through A and watch where it lands.");
      yield* applyT(1, b.deform!, easeInOutCubic);
      setCaption("It is flat. Every output lies on one plane — the map cannot reach anything off it.");
      yield* waitFor(b.hold2!);
    },

    *columns() {
      const b = beats("columns");
      setTop("Where the plane comes from: the columns");
      setCaption("Admit the columns one at a time. First c₁ — on its own it opens a line.");
      reachSoFar("reach: a line   ·   rank so far 1");
      yield* all(
        columnArrows[0]!.arrow.opacity(1, b.c1!),
        columnArrows[0]!.label.opacity(1, b.c1!),
        reachReadout.opacity(1, b.c1!),
        cube.opacity(0.28, b.c1!),
        imageCube.opacity(0.35, b.c1!),
      );
      yield* spanLine.opacity(0.8, b.line!);
      yield* waitFor(b.hold!);

      setCaption("Now c₂. It points OFF that line — a direction c₁ could never reach.");
      yield* all(
        columnArrows[1]!.arrow.opacity(1, b.c2!),
        columnArrows[1]!.label.opacity(1, b.c2!),
      );
      setCaption("So the reachable set grows from a line to a plane, and the rank grows with it.");
      reachSoFar("reach: a plane   ·   rank so far 2");
      yield* all(imagePlane.opacity(0.22, b.plane!), spanLine.opacity(0, b.plane!));
      yield* waitFor(b.hold2!);

      // A real prediction, not a rhetorical one: both spanning columns and the
      // plane they opened are on screen, and c₃ is given as a combination of
      // them, so the answer follows from what the learner can see.
      setCaption(
        "The third column is c₃ = 2c₁ + 3c₂. Predict: does it reach somewhere new, or land inside the plane?",
      );
      yield* waitFor(b.hold3!);
      yield* all(
        columnArrows[2]!.arrow.opacity(1, b.c3!),
        columnArrows[2]!.label.opacity(1, b.c3!),
      );
      setCaption(
        "It lands inside. A dependent column reaches nothing new — three columns, still rank 2.",
      );
      yield* imagePlane.opacity(0.34, b.pulseUp!);
      yield* imagePlane.opacity(0.22, b.pulseDown!);
      yield* waitFor(b.hold4!);
    },

    *colspace() {
      const b = beats("colspace");
      setTop("Name it: the column space");
      setCaption("That plane is the span of A's columns: every vector the map can produce.");
      // The construction scaffolding retires now that the subspace it built has
      // a name — the plane and its label are what the rest of the scene needs.
      yield* all(
        colLabel.opacity(1, b.plane!),
        reachReadout.opacity(0, b.plane!),
        ...columnArrows.flatMap(({ arrow, label }) => [
          arrow.opacity(0, b.plane!),
          label.opacity(0, b.plane!),
        ]),
      );
      yield* waitFor(b.hold!);
      setCaption("So 'is A x = b solvable?' is one question: is b in Col(A)?");
      yield* waitFor(b.hold2!);
    },

    *crush() {
      const b = beats("crush");
      setTop("What the map destroys");
      setCaption("Now look at the inputs instead. Follow ONE input along this line.");
      // SNAP the configuration, then animate inside it. A learner who scrubs to
      // a chapter lands on its FIRST frame, and that frame has to already show
      // what the chapter is about. Only OPACITIES are snapped here — no drawn
      // object ever changes position or shape discontinuously, so nothing
      // teleports; the same rule governs `nullspace`, `count`, and `rank-one`.
      cube.opacity(1);
      imagePlane.opacity(0.12);
      nullLine.opacity(1);
      outputOrigin.opacity(1);
      probeT(-1);
      probeDot.opacity(1);
      probeImage.opacity(1);
      yield* waitFor(b.hold!);
      setCaption("The input travels the whole line — and its image never leaves the origin.");
      // The image position is computed through the live matrix, so this is a
      // consequence of the map rather than a dot parked on the origin by hand.
      yield* probeT(1, b.travel!, easeInOutCubic);
      yield* outputOrigin.size(26, b.up!);
      yield* outputOrigin.size(16, b.down!);
      setCaption("Every vector on that line is sent to zero. Their differences are invisible to A.");
      yield* waitFor(b.hold2!);
    },

    *nullspace() {
      const b = beats("nullspace");
      setTop("Name it: the null space");
      setCaption("That line is Null(A) — and it is drawn on the LEFT, in the input space.");
      nullLabel.opacity(1);
      imagePlane.opacity(0.1);
      imageCube.opacity(0.25);
      probeDot.opacity(0);
      probeImage.opacity(0);
      yield* waitFor(b.hold!);
      setCaption("Col(A) is made of outputs; Null(A) is made of inputs. Different spaces, different questions.");
      yield* waitFor(b.hold2!);
    },

    *count() {
      const b = beats("count");
      setTop("Rank counts what survived");
      setCaption("Three dimensions went in. Two came out. The rank is 2.");
      imagePlane.opacity(0.24);
      imageCube.opacity(1);
      cube.opacity(0.55);
      yield* waitFor(b.hold!);
      setCaption("One dimension was crushed — exactly the one line drawn on the left.");
      yield* waitFor(b.hold2!);
    },

    *["predict-rank-one"]() {
      const b = beats("predict-rank-one");
      setTop("Predict");
      setCaption("The next map has rank 1: its image will be a line, not a plane.");
      yield* waitFor(b.ask!);
      setCaption(
        "Predict: what happens to Null(A) on the left — does it shrink, stay a line, or grow?",
      );
      yield* waitFor(b.think!);
    },

    *["rank-one"]() {
      const b = beats("rank-one");
      setTop("Take away one more");
      setCaption("Un-deform first, so the new map starts from the same untouched cube.");
      imagePlane.opacity(0);
      nullLine.opacity(0);
      nullLabel.opacity(0);
      colLabel.opacity(0);
      imageCube.opacity(1);
      cube.opacity(1);
      // Return to the identity WITH the cube on screen, then swap the map there
      // (invisible, since lerpIdentityTo(m, 0) = I for every m) and deform again.
      yield* applyT(0, b.reset!, easeInOutCubic);
      activeMap = RANK_ONE;
      setCaption("A different map, of rank 1 — watch the image collapse one dimension further.");
      yield* applyT(1, b.deform!, easeInOutCubic);
      imageLine.opacity(1);
      colLabel.opacity(1);
      yield* waitFor(b.hold!);
      setCaption("And the null space has GROWN to a whole plane. Rank fell 2 → 1; nullity rose 1 → 2.");
      yield* all(nullPlane.opacity(0.22, b.grow!), nullLabel.opacity(1, b.grow!));
      yield* waitFor(b.hold2!);
    },
  };

  for (const segment of SUBSPACES_RANK_SEGMENTS) {
    yield* runSegment(
      segment.duration,
      bodies[segment.id]!,
      `${SCENE_ID}.${segment.id}`,
    );
  }
});
