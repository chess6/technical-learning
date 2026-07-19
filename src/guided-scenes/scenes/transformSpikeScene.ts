import { Grid, Line, Node, makeScene2D } from "@motion-canvas/2d";
import {
  createSignal,
  easeInOutCubic,
  waitFor,
  type SimpleSignal,
  type Vector2 as Vector2Type,
} from "@motion-canvas/core";
import { Vector2 } from "@motion-canvas/core";
import type { Vector2 as MathVector2 } from "../../math";
import {
  SAMPLE_VECTOR,
  SPIKE_SCENE_SIZE,
  applyMatrix,
  lerpMatrix,
} from "./spikeConstants";

/**
 * Minimal spike scene: a coordinate grid, the two basis vectors, and one sample
 * vector smoothly transformed from the identity to the matrix [[2, 1], [0, 1]].
 *
 * This is intentionally NOT a polished lesson scene — it exists only to validate
 * that a Motion Canvas animation embeds and controls cleanly inside React.
 */

/** Pixels per unit in the scene coordinate system. */
const SCALE = 70;

const ROLE = {
  grid: "#1e2633",
  axis: "#3a4556",
  basis1: "#7dba8a",
  basis2: "#b89ad4",
  sample: "#e8d48a",
};

/** Map a math-space point to scene pixels (y up). */
function toPixels([x, y]: MathVector2): Vector2Type {
  return new Vector2(x * SCALE, -y * SCALE);
}

function transformedPoint(
  progress: number,
  point: MathVector2,
): Vector2Type {
  return toPixels(applyMatrix(lerpMatrix(progress), point));
}

function makeGridLines(progress: SimpleSignal<number>): Node {
  const group = new Node({});
  for (let k = -4; k <= 4; k += 1) {
    const isAxis = k === 0;
    group.add(
      new Line({
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        points: () => [
          transformedPoint(progress(), [k, -4]),
          transformedPoint(progress(), [k, 4]),
        ],
      }),
    );
    group.add(
      new Line({
        stroke: isAxis ? ROLE.axis : ROLE.grid,
        lineWidth: isAxis ? 2 : 1,
        points: () => [
          transformedPoint(progress(), [-4, k]),
          transformedPoint(progress(), [4, k]),
        ],
      }),
    );
  }
  return group;
}

function makeVector(
  progress: SimpleSignal<number>,
  point: MathVector2,
  color: string,
): Line {
  return new Line({
    stroke: color,
    lineWidth: 4,
    endArrow: true,
    arrowSize: 12,
    points: () => [new Vector2(0, 0), transformedPoint(progress(), point)],
  });
}

export const transformSpikeScene = makeScene2D(function* (view) {
  view.fill("#0a0d11");

  const progress = createSignal(0);

  view.add(
    new Grid({
      stroke: "#141a22",
      lineWidth: 1,
      width: SPIKE_SCENE_SIZE.width,
      height: SPIKE_SCENE_SIZE.height,
      spacing: SCALE,
      opacity: 0.4,
    }),
  );

  view.add(makeGridLines(progress));
  view.add(makeVector(progress, [1, 0], ROLE.basis1));
  view.add(makeVector(progress, [0, 1], ROLE.basis2));
  view.add(makeVector(progress, SAMPLE_VECTOR, ROLE.sample));

  yield* waitFor(0.4);
  yield* progress(1, 2.0, easeInOutCubic);
  yield* waitFor(0.6);
});
