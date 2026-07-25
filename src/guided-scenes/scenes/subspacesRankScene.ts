import { Circle, Line, Node, makeScene2D } from "@motion-canvas/2d";
import {
  Vector2,
  all,
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
import { SUBSPACES_RANK_SEGMENTS } from "./sceneTimings";
import {
  CUBE_EDGES,
  ISO_CUBE_CORNERS,
  ROLE,
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
 * Correctness discipline: rank, both bases, and every plotted image come from
 * `src/math`. `assertSceneMathIsConsistent` re-checks the relationships the
 * choreography depends on before a frame renders.
 */

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

/** Cube edges drawn under a matrix (identity for the original cube). */
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

/** Unit vector in the direction of `v` (or `v` itself if it is already tiny). */
function unit3(v: P3): P3 {
  const length = Math.hypot(v[0], v[1], v[2]);
  return length < 1e-9 ? v : scale3(v, 1 / length);
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

  // --- Panels ---
  view.add(makeIsometricAxes(SCALE, LEFT));
  view.add(makeIsometricAxes(SCALE, RIGHT));

  const leftTitle = makeLabel("input space  ℝ³", ROLE.textMuted, 26);
  leftTitle.position(new Vector2(LEFT.x, LEFT.y - 148));
  view.add(leftTitle);
  const rightTitle = makeLabel("output space  ℝ³", ROLE.textMuted, 26);
  rightTitle.position(new Vector2(RIGHT.x, RIGHT.y - 148));
  view.add(rightTitle);

  // The arrow between panels IS the map.
  const mapArrow = makeSegment(ROLE.textMuted, 2.5, true);
  mapArrow.points([new Vector2(-70, 24), new Vector2(70, 24)]);
  view.add(mapArrow);
  const mapLabel = makeLabel("A", ROLE.text, 30);
  mapLabel.position(new Vector2(0, -6));
  view.add(mapLabel);

  // --- Persistent objects (created once; only revealed or moved) ---
  const cube = makeCube(null, LEFT, ROLE.original, 3);
  view.add(cube);

  const imageCube = makeCube(RANK_TWO, RIGHT, ROLE.transformed, 3);
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

  const nullLine = makeSegment(ROLE.result, 5);
  {
    const d = unit3(asP3(NULL_BASIS_2[0]!));
    nullLine.points([
      toIsometric(scale3(d, -2), SCALE, LEFT),
      toIsometric(scale3(d, 2), SCALE, LEFT),
    ]);
  }
  nullLine.opacity(0);
  view.add(nullLine);

  // Rank-1 null space is a PLANE in the input panel.
  const nullPlane = (() => {
    const basis = nullSpaceBasis(RANK_ONE).basis;
    return makePlane(asP3(basis[0]!), asP3(basis[1]!), LEFT, ROLE.result);
  })();
  nullPlane.opacity(0);
  view.add(nullPlane);

  // The origin dot in the output panel: where the whole null line lands.
  const outputOrigin = new Circle({ size: 16, fill: ROLE.result, opacity: 0 });
  outputOrigin.position(toIsometric([0, 0, 0], SCALE, RIGHT));
  view.add(outputOrigin);

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
  projectionNote.position(new Vector2(LABEL_CENTER_X, LABEL_BOTTOM_Y - 34));
  view.add(projectionNote);

  const bodies: Record<string, () => ThreadGenerator> = {
    *["two-panels"]() {
      setTop("Two spaces, not one");
      setCaption("Inputs live on the left. Outputs live on the right. A is the arrow between them.");
      yield* waitFor(1.2);
      yield* all(cube.opacity(1, 0.6), mapArrow.opacity(1, 0.6));
      yield* waitFor(0.6);
    },

    *reach() {
      setTop("What the map can reach");
      setCaption("Push the whole unit cube through A and watch where it lands.");
      yield* imageCube.opacity(1, 1.1);
      setCaption("It is flat. Every output lies on one plane — the map cannot reach anything off it.");
      yield* waitFor(1.4);
    },

    *colspace() {
      setTop("Name it: the column space");
      setCaption("That plane is the span of A's columns: every vector the map can produce.");
      // Snap the focus so scrubbing to this beat lands on a readable frame.
      imagePlane.opacity(0.22);
      colLabel.opacity(1);
      cube.opacity(0.28);
      yield* waitFor(1.6);
      setCaption("So 'is A x = b solvable?' is one question: is b in Col(A)?");
      yield* waitFor(1.4);
    },

    *crush() {
      setTop("What the map destroys");
      setCaption("Now look at the inputs instead. A whole line of them lands on a single point.");
      cube.opacity(1);
      imagePlane.opacity(0.12);
      nullLine.opacity(1);
      outputOrigin.opacity(1);
      yield* waitFor(1.5);
      yield* all(outputOrigin.size(26, 0.4), outputOrigin.size(16, 0.4));
      setCaption("Every vector on that line is sent to zero. Their differences are invisible to A.");
      yield* waitFor(1.2);
    },

    *nullspace() {
      setTop("Name it: the null space");
      setCaption("That line is Null(A) — and it is drawn on the LEFT, in the input space.");
      nullLabel.opacity(1);
      imagePlane.opacity(0.1);
      imageCube.opacity(0.25);
      yield* waitFor(1.6);
      setCaption("Col(A) is made of outputs; Null(A) is made of inputs. Different spaces, different questions.");
      yield* waitFor(1.6);
    },

    *count() {
      setTop("Rank counts what survived");
      setCaption("Three dimensions went in. Two came out. The rank is 2.");
      imagePlane.opacity(0.24);
      imageCube.opacity(1);
      cube.opacity(0.55);
      yield* waitFor(1.8);
      setCaption("One dimension was crushed — exactly the one line drawn on the left.");
      yield* waitFor(1.6);
    },

    *["rank-one"]() {
      setTop("Take away one more");
      setCaption("A different map, of rank 1: the image is now only a LINE.");
      // Snap to the rank-1 configuration.
      imagePlane.opacity(0);
      imageCube.opacity(0);
      imageLine.opacity(1);
      nullLine.opacity(0);
      nullPlane.opacity(0.22);
      cube.opacity(1);
      yield* waitFor(1.8);
      setCaption("And the null space has GROWN to a whole plane. Rank fell from 2 to 1; nullity rose from 1 to 2.");
      yield* waitFor(1.8);
      setCaption("The two always move in opposite directions — the next lesson makes that a law.");
      yield* waitFor(1.4);
    },
  };

  for (const segment of SUBSPACES_RANK_SEGMENTS) {
    yield* runSegment(segment.duration, bodies[segment.id]!);
  }
});
