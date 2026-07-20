import { Line, Node, Txt } from "@motion-canvas/2d";
import { Vector2, type SignalValue } from "@motion-canvas/core";
import type { Vector2 as MathVector2, Matrix2x2 } from "../../math";
import { matrixVectorMultiply } from "../../math";
import { GRID_HALF_EXTENT, SCALE } from "./safeFrame";

export { SCALE, SCENE_SIZE, SAFE_MARGIN } from "./safeFrame";

/**
 * Shared building blocks for the guided lesson scenes. Both lessons need the
 * same coordinate mapping, semantic colours, arrow/label builders, and a static
 * background grid, so these live in one kit rather than being duplicated.
 *
 * Colours mirror the semantic role tokens in src/styles/tokens.css so the
 * canvas and the surrounding React UI stay visually consistent. Geometry must
 * respect the safe-frame convention in safeFrame.ts.
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
    fontSize,
    fontFamily: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    fontWeight: 600,
  });
}

/**
 * Centered overlay caption/equation for the safe top/bottom bands.
 * Always position at (LABEL_CENTER_X, LABEL_TOP_Y | LABEL_BOTTOM_Y).
 * Defaults sized so CSS-scaled canvases roughly match body-text weight.
 */
export function makeOverlayLabel(
  text: SignalValue<string>,
  color: string = ROLE.text,
  fontSize = 40,
): Txt {
  return new Txt({
    text,
    fill: color,
    fontSize,
    lineHeight: fontSize * 1.4,
    padding: [18, 16],
    cachePadding: 32,
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
