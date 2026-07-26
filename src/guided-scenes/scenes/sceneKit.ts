import { Line, Node, Txt } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  easeInOutCubic,
  // Aliased away from the `use*` name so the react-hooks lint rule does not
  // mistake this Motion Canvas timeline helper for a React hook.
  useTime as readTimelineTime,
  waitFor,
  type SignalValue,
  type SimpleSignal,
  type ThreadGenerator,
  type TimingFunction,
} from "@motion-canvas/core";
import type { Vector2 as MathVector2, Matrix2x2 } from "../../math";
import { matrixVectorMultiply } from "../../math";
import type { GraphicRole, OpeningGraphic } from "../../lessons/openingGraphic";
import { GRID_HALF_EXTENT, SAFE_WIDTH, SCALE } from "./safeFrame";
import { gridLineCoordinates } from "./kitLayout";
import { ROLE } from "./semanticRoles";

export {
  SCALE,
  SCENE_SIZE,
  SAFE_MARGIN,
  OVERLAY_CLEAR_HALF_EXTENT,
} from "./safeFrame";

/**
 * Shared building blocks for the guided lesson scenes.
 *
 * Colours mirror the semantic role tokens in src/styles/tokens.css so the
 * canvas and the surrounding React UI stay visually consistent. Geometry must
 * respect the safe-frame convention in safeFrame.ts.
 *
 * Attention / continuity helpers (`focusOpacities`, `morphMatrixEntries`,
 * `makeGhostClosedRegion`) encode quality-bar patterns that proved to reduce
 * confusion — promote reuse across lessons; keep lesson-specific choreography
 * local to each scene module.
 */

/**
 * The semantic colour grammar lives in its own Motion-Canvas-free module so
 * `semanticRoles.test.ts` can resolve it (scene modules import
 * `@motion-canvas/2d` and are never resolved in jsdom). Re-exported here
 * because every scene already imports its drawing helpers from this kit.
 */
export { ROLE, DISTINCT_SEMANTIC_ROLES } from "./semanticRoles";

/** Map a math-space point (y up) to scene pixels. */
export function toPixels(point: MathVector2): Vector2 {
  return new Vector2(point[0] * SCALE, -point[1] * SCALE);
}

/** One segment body that ran longer than its declared duration. */
export interface SegmentOverrun {
  /** `"<sceneId>.<segmentId>"` when the caller labelled it, else `"<unlabelled>"`. */
  label: string;
  declared: number;
  measured: number;
}

/**
 * Every overrun observed since the module was loaded (or since
 * {@link resetSegmentOverruns}). A rendered scene appends here AND logs a
 * console error, so the Playwright specs — which fail on any console error —
 * catch a body that outgrows its segment even if its declared beat budget in
 * `sceneTimings.ts` still adds up. The pure-data budget test is the primary
 * gate; this is the belt-and-braces one that watches the code actually run.
 */
export const SEGMENT_OVERRUNS: SegmentOverrun[] = [];

export function resetSegmentOverruns(): void {
  SEGMENT_OVERRUNS.length = 0;
}

/** Tolerance for float accumulation across a long timeline (one 30fps frame). */
const OVERRUN_TOLERANCE = 1 / 30;

/**
 * Run one timeline segment's body, then pad the remainder so the segment
 * occupies EXACTLY `duration` seconds — by MEASURING real elapsed time
 * (`useTime`, which accounts for `waitFor` offsets) rather than manually
 * subtracting a guessed choreography total. This guarantees a scene assembled
 * as `for (seg of SEGMENTS) yield* runSegment(seg.duration, bodies[seg.id], id)`
 * has a total length equal to the sum of the segment durations, so scrubber
 * steps, next/previous-idea markers, reduced-motion frames, and seek all line
 * up with the timing metadata.
 *
 * A body that overruns is NOT truncated — truncating would cut a tween off
 * mid-motion, which is worse than running long. Instead the overrun is recorded
 * and reported (see {@link SEGMENT_OVERRUNS}) so it fails a check rather than
 * silently desynchronizing every later chapter marker.
 */
export function* runSegment(
  duration: number,
  body: () => ThreadGenerator,
  label?: string,
): ThreadGenerator {
  const start = readTimelineTime();
  yield* body();
  const measured = readTimelineTime() - start;
  const remaining = duration - measured;
  if (remaining > 1e-6) {
    yield* waitFor(remaining);
    return;
  }
  if (measured > duration + OVERRUN_TOLERANCE) {
    const overrun: SegmentOverrun = {
      label: label ?? "<unlabelled>",
      declared: duration,
      measured,
    };
    SEGMENT_OVERRUNS.push(overrun);
    console.error(
      `guided-scene segment overran its declared duration: ${overrun.label} ` +
        `took ${measured.toFixed(3)}s of a declared ${duration}s`,
    );
  }
}

/**
 * Numeric/readout formatting lives in the Motion-Canvas-free `sceneReadouts`
 * module so unit tests can resolve it; re-exported here because every scene
 * already imports its drawing helpers from this kit.
 */
export {
  formatSceneNumber,
  formatAreaFactor,
  formatLedgerTally,
  formatSignedArea,
  orientationSweep,
  orientationWord,
  worstCaseComparisons,
} from "./sceneReadouts";

/**
 * Nodes that expose Motion Canvas's animatable opacity API.
 * Used by attention choreography to brighten the focal object and dim the rest.
 */
export type OpacityAnimatable = {
  opacity: {
    (): number;
    (value: number): void;
    (
      value: number,
      duration: number,
      timingFunction?: TimingFunction,
    ): ThreadGenerator;
  };
};

export type FocusOpacityTarget = {
  node: OpacityAnimatable;
  opacity: number;
};

/**
 * Attention choreography: tween several opacities in parallel so one focal
 * relationship is bright and the rest retreat.
 */
export function* focusOpacities(
  targets: readonly FocusOpacityTarget[],
  duration = 0.35,
): ThreadGenerator {
  if (targets.length === 0) return;
  yield* all(
    ...targets.map(({ node, opacity }) =>
      node.opacity(opacity, duration, easeInOutCubic),
    ),
  );
}

/**
 * Morph a live 2×2 matrix (four entry signals) toward a target.
 * Shared so scenes do not reimplement entry-wise `all(...)` morphs.
 */
export function* morphMatrixEntries(
  a11: SimpleSignal<number, void>,
  a12: SimpleSignal<number, void>,
  a21: SimpleSignal<number, void>,
  a22: SimpleSignal<number, void>,
  target: Matrix2x2,
  duration: number,
): ThreadGenerator {
  yield* all(
    a11(target[0][0], duration, easeInOutCubic),
    a12(target[0][1], duration, easeInOutCubic),
    a21(target[1][0], duration, easeInOutCubic),
    a22(target[1][1], duration, easeInOutCubic),
  );
}

/**
 * Ghost of a closed region (e.g. original unit square) for object continuity:
 * the live shape morphs while the dashed ghost keeps "what it was" visible.
 */
export function makeGhostClosedRegion(
  points: SignalValue<Vector2[]>,
  color: string = ROLE.original,
): Line {
  return new Line({
    stroke: color,
    lineWidth: 2,
    closed: true,
    fill: color,
    opacity: 0.12,
    lineDash: [8, 8],
    points,
  });
}

/**
 * A closed graphic (polygon) whose vertices follow a live matrix. The points
 * signal maps each math-space outline vertex through the current matrix and into
 * scene pixels, so the shape deforms with the transformation. Solid stroke +
 * translucent fill = the "current / transformed" state (pair with
 * {@link makeGhostClosedRegion} for the dashed "original" ghost).
 *
 * Geometry always goes through the shared math (`matrixVectorMultiply`); this
 * helper never reimplements linear algebra.
 */
export function makeGraphic(
  matrixAt: () => Matrix2x2,
  outline: readonly MathVector2[],
  color: string = ROLE.transformed,
): Line {
  return new Line({
    stroke: color,
    lineWidth: 4,
    lineJoin: "round",
    closed: true,
    points: () =>
      outline.map((v) => toPixels(matrixVectorMultiply(matrixAt(), v))),
  });
}

/** Stroke colour per graphic part role, from the shared semantic palette. */
const GRAPHIC_ROLE_STROKE: Record<GraphicRole, string> = {
  hull: ROLE.transformed,
  cockpit: ROLE.selected,
  fin: ROLE.transformed,
  panel: ROLE.original,
  thruster: ROLE.result,
};

/**
 * Render the shared multi-part opening graphic as a group of `Line` nodes whose
 * vertices all follow a single live matrix. Every part (hull, cockpit, panel,
 * thruster) is transformed by the SAME matrix through the shared math, so the
 * internal features stay aligned to the hull under scale/shear/reflect/collapse.
 *
 * When `ghost` is true the parts render dashed + faint (the "original" state);
 * otherwise solid (the "transformed" state). A ghost uses the identity matrix so
 * it stays put while the live graphic deforms.
 */
export function makeGraphicParts(
  matrixAt: () => Matrix2x2,
  graphic: OpeningGraphic,
  options: { ghost?: boolean; color?: string } = {},
): Node {
  const group = new Node({});
  const pointsOf = (part: OpeningGraphic["parts"][number]) => () =>
    part.points.map((v) => toPixels(matrixVectorMultiply(matrixAt(), v)));

  for (const part of graphic.parts) {
    const stroke = options.color ?? GRAPHIC_ROLE_STROKE[part.role];
    const isHull = part.role === "hull";

    if (options.ghost) {
      group.add(
        new Line({
          stroke,
          lineWidth: 2,
          lineJoin: "round",
          lineCap: "round",
          closed: part.closed,
          opacity: isHull ? 0.28 : 0.2,
          lineDash: [8, 8],
          points: pointsOf(part),
        }),
      );
      continue;
    }

    // Solid graphic: a translucent fill body (closed parts) under a bright
    // opaque stroke, so the hull reads as a filled, outlined object.
    if (part.closed) {
      group.add(
        new Line({
          fill: stroke,
          lineWidth: 0,
          closed: true,
          opacity: isHull ? 0.16 : 0.28,
          points: pointsOf(part),
        }),
      );
    }
    group.add(
      new Line({
        stroke,
        lineWidth: isHull ? 4 : part.closed ? 2.5 : 3,
        lineJoin: "round",
        lineCap: "round",
        closed: part.closed,
        points: pointsOf(part),
      }),
    );
  }
  return group;
}

export function makeArrow(color: string, width = 6, key?: string): Line {
  return new Line({
    key,
    stroke: color,
    lineWidth: width,
    endArrow: true,
    arrowSize: 16,
    lineCap: "round",
    points: [new Vector2(0, 0), new Vector2(0, 0)],
  });
}

export function makeSegment(
  color: string,
  width = 3.5,
  dash = false,
  key?: string,
): Line {
  return new Line({
    key,
    stroke: color,
    lineWidth: width,
    lineDash: dash ? [10, 10] : [],
    lineCap: "round",
    points: [new Vector2(0, 0), new Vector2(0, 0)],
  });
}

export function makeLabel(
  text: SignalValue<string>,
  color: string = ROLE.text,
  fontSize = 44,
  key?: string,
): Txt {
  return new Txt({
    key,
    text,
    fill: color,
    stroke: ROLE.background,
    lineWidth: Math.max(4, Math.round(fontSize * 0.16)),
    strokeFirst: true,
    fontSize,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    fontWeight: 600,
  });
}

/**
 * Centered overlay caption/equation for the safe top/bottom bands.
 * Always position at (LABEL_CENTER_X, LABEL_TOP_Y | LABEL_BOTTOM_Y).
 * Width is capped to SAFE_WIDTH with wrapping so long captions never clip
 * the stage edges. A dark glyph stroke keeps axes/grid from cutting through
 * the letters when they share the vertical mid-line.
 */
export function makeOverlayLabel(
  text: SignalValue<string>,
  color: string = ROLE.text,
  fontSize = 40,
  key?: string,
): Txt {
  return new Txt({
    key,
    text,
    fill: color,
    stroke: ROLE.background,
    lineWidth: Math.max(6, Math.round(fontSize * 0.22)),
    strokeFirst: true,
    fontSize,
    lineHeight: fontSize * 1.3,
    padding: [8, 10],
    cachePadding: 56,
    width: SAFE_WIDTH,
    textWrap: true,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    fontWeight: 600,
    textAlign: "center",
    offset: [0, 0],
  });
}

/**
 * A static background grid + axes covering the given half-extents (in units).
 * Purely decorative reference frame; transformed grids are built per-scene.
 */
export interface GridHalfExtents {
  x: number;
  y: number;
}

function resolveGridHalfExtents(
  halfExtent: number | GridHalfExtents,
): GridHalfExtents {
  return typeof halfExtent === "number"
    ? { x: halfExtent, y: halfExtent }
    : halfExtent;
}

export function makeStaticGrid(
  halfExtent: number | GridHalfExtents = GRID_HALF_EXTENT,
): Node {
  const { x: xHalfExtent, y: yHalfExtent } = resolveGridHalfExtents(halfExtent);
  const group = new Node({ key: "semantic:grid:static" });
  for (const k of gridLineCoordinates(xHalfExtent)) {
    const isAxis = k === 0;
    group.add(
      new Line({
        key: `semantic:grid:static:x:${k}`,
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        points: [toPixels([k, -yHalfExtent]), toPixels([k, yHalfExtent])],
      }),
    );
  }
  for (const k of gridLineCoordinates(yHalfExtent)) {
    const isAxis = k === 0;
    group.add(
      new Line({
        key: `semantic:grid:static:y:${k}`,
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        points: [toPixels([-xHalfExtent, k]), toPixels([xHalfExtent, k])],
      }),
    );
  }
  return group;
}

/**
 * A grid whose vertices follow a matrix, evaluated live from a signal so it can
 * be animated. `matrixAt(t)` returns the matrix for the current progress.
 */
export function makeTransformedGrid(
  matrixAt: () => Matrix2x2,
  halfExtent: number | GridHalfExtents = GRID_HALF_EXTENT,
  color = ROLE.gridTransformed,
): Node {
  const { x: xHalfExtent, y: yHalfExtent } = resolveGridHalfExtents(halfExtent);
  const group = new Node({ key: "semantic:grid:transformed" });
  const project = (point: MathVector2): Vector2 =>
    toPixels(matrixVectorMultiply(matrixAt(), point));
  for (const k of gridLineCoordinates(xHalfExtent)) {
    const isAxis = k === 0;
    group.add(
      new Line({
        key: `semantic:grid:transformed:x:${k}`,
        stroke: isAxis ? ROLE.axis : color,
        lineWidth: isAxis ? 2.5 : 1.25,
        points: () => [project([k, -yHalfExtent]), project([k, yHalfExtent])],
      }),
    );
  }
  for (const k of gridLineCoordinates(yHalfExtent)) {
    const isAxis = k === 0;
    group.add(
      new Line({
        key: `semantic:grid:transformed:y:${k}`,
        stroke: isAxis ? ROLE.axis : color,
        lineWidth: isAxis ? 2.5 : 1.25,
        points: () => [project([-xHalfExtent, k]), project([xHalfExtent, k])],
      }),
    );
  }
  return group;
}

/* --------------------------------------------------------------------------
 * Three-dimensional scenes (isometric)
 *
 * Lessons 8 and 9 are the first whose content genuinely needs R³: in the plane,
 * "collapse" is binary, and rank has only degenerate values. These helpers draw
 * 3-D geometry under a FIXED isometric projection.
 *
 * The projection is a deliberate, stated simplification and every scene using it
 * must say so on-canvas: it preserves incidence and straightness (so a plane
 * reads as a plane and a line as a line) but NOT angles or lengths, so nothing
 * about perpendicularity or distance may be inferred from these pictures.
 * ------------------------------------------------------------------------ */

/** Cosine/sine of the standard 30° isometric tilt. */
const ISO_COS = Math.cos(Math.PI / 6);
const ISO_SIN = Math.sin(Math.PI / 6);

/**
 * Project a math-space 3-D point to scene pixels (y of the screen grows down).
 * `scale` is pixels per unit; `origin` shifts the whole panel.
 */
export function toIsometric(
  point: readonly [number, number, number],
  scale = 46,
  origin: Vector2 = new Vector2(0, 0),
): Vector2 {
  const [x, y, z] = point;
  const screenX = (x - y) * ISO_COS * scale;
  const screenY = ((x + y) * ISO_SIN - z) * scale;
  return new Vector2(origin.x + screenX, origin.y + screenY);
}

/** The 12 edges of the unit cube, as index pairs into `UNIT_CUBE`-style corners. */
export const CUBE_EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 3],
  [3, 2],
  [2, 0], // bottom face (z = 0)
  [4, 5],
  [5, 7],
  [7, 6],
  [6, 4], // top face (z = 1)
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7], // verticals
];

/**
 * Corners of the unit cube in the vertex order `CUBE_EDGES` indexes into.
 * Deliberately local rather than reusing `UNIT_CUBE` from src/math, whose corner
 * ORDER is its own contract; an edge list is only valid against a fixed order.
 */
export const ISO_CUBE_CORNERS: readonly (readonly [number, number, number])[] =
  [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [1, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ];

/** Short 3-D axis indicators for an isometric panel. */
export function makeIsometricAxes(
  scale: number,
  origin: Vector2,
  extent = 1.9,
): Node {
  const group = new Node({});
  const axes: readonly (readonly [number, number, number])[] = [
    [extent, 0, 0],
    [0, extent, 0],
    [0, 0, extent],
  ];
  for (const axis of axes) {
    group.add(
      new Line({
        stroke: ROLE.axis,
        lineWidth: 1.5,
        opacity: 0.75,
        points: [
          toIsometric([0, 0, 0], scale, origin),
          toIsometric(axis, scale, origin),
        ],
      }),
    );
  }
  return group;
}
