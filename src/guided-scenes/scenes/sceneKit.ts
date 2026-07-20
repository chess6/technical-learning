import { Line, Node, Txt } from "@motion-canvas/2d";
import {
  Vector2,
  all,
  easeInOutCubic,
  type SignalValue,
  type SimpleSignal,
  type ThreadGenerator,
  type TimingFunction,
} from "@motion-canvas/core";
import type { Vector2 as MathVector2, Matrix2x2 } from "../../math";
import { matrixVectorMultiply } from "../../math";
import { GRID_HALF_EXTENT, SAFE_WIDTH, SCALE } from "./safeFrame";

export { SCALE, SCENE_SIZE, SAFE_MARGIN, OVERLAY_CLEAR_HALF_EXTENT } from "./safeFrame";

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

export const ROLE = {
  background: "#0e1116",
  grid: "#1e2633",
  gridTransformed: "#2f3a4d",
  axis: "#3a4556",
  text: "#e8edf4",
  textMuted: "#9aa6b5",
  original: "#7eb8d4",
  transformed: "#d4a574",
  basis1: "#7dba8a",
  basis2: "#b89ad4",
  selected: "#e8d48a",
  result: "#e87a9a",
  dim: "#3a4453",
} as const;

/** Map a math-space point (y up) to scene pixels. */
export function toPixels(point: MathVector2): Vector2 {
  return new Vector2(point[0] * SCALE, -point[1] * SCALE);
}

/** Compact numeric formatting for on-canvas labels (avoids "-0"). */
export function formatSceneNumber(n: number, digits = 2): string {
  const factor = 10 ** digits;
  const r = Math.round(n * factor) / factor;
  return Object.is(r, -0) ? "0" : String(r);
}

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

export function makeArrow(
  color: string,
  width = 6,
): Line {
  return new Line({
    stroke: color,
    lineWidth: width,
    endArrow: true,
    arrowSize: 16,
    lineCap: "round",
    points: [new Vector2(0, 0), new Vector2(0, 0)],
  });
}

export function makeSegment(color: string, width = 3.5, dash = false): Line {
  return new Line({
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
): Txt {
  return new Txt({
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
): Txt {
  return new Txt({
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
 * A static background grid + axes covering the given half-extent (in units).
 * Purely decorative reference frame; transformed grids are built per-scene.
 */
export function makeStaticGrid(halfExtent = GRID_HALF_EXTENT): Node {
  const group = new Node({});
  for (let k = -halfExtent; k <= halfExtent; k += 1) {
    const isAxis = k === 0;
    group.add(
      new Line({
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        points: [toPixels([k, -halfExtent]), toPixels([k, halfExtent])],
      }),
    );
    group.add(
      new Line({
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        points: [toPixels([-halfExtent, k]), toPixels([halfExtent, k])],
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
  halfExtent = GRID_HALF_EXTENT,
  color = ROLE.gridTransformed,
): Node {
  const group = new Node({});
  const project = (point: MathVector2): Vector2 =>
    toPixels(matrixVectorMultiply(matrixAt(), point));
  for (let k = -halfExtent; k <= halfExtent; k += 1) {
    const isAxis = k === 0;
    group.add(
      new Line({
        stroke: isAxis ? ROLE.axis : color,
        lineWidth: isAxis ? 2.5 : 1.25,
        points: () => [project([k, -halfExtent]), project([k, halfExtent])],
      }),
    );
    group.add(
      new Line({
        stroke: isAxis ? ROLE.axis : color,
        lineWidth: isAxis ? 2.5 : 1.25,
        points: () => [project([-halfExtent, k]), project([halfExtent, k])],
      }),
    );
  }
  return group;
}
