import type { Vector2 } from "../math";

/**
 * The shared opening vector graphic — a single source of truth for the
 * recognizable object that Chapter 0 (and, later, Lesson 2) transform.
 *
 * Stored ONCE, in math space (y up), centered near the origin with
 * |coord| ≲ 1.7 so 2×2 matrices in the teaching range keep it on-frame.
 * The outline is intentionally ASYMMETRIC (a larger right fin) so reflection
 * and rotation are unmistakable.
 *
 * Every transform of this graphic MUST go through the shared math helpers
 * (`matrixVectorMultiply` / `applyMatrixToPoints`) — never ad-hoc geometry —
 * per math-visualization-correctness. The matrix maps the COORDINATES of these
 * vertices (control points), not "pixels".
 */
export interface OpeningGraphic {
  id: "opening-explorer";
  /** Closed outline in math space (y up). Draw as a closed polygon. */
  outline: readonly Vector2[];
  /** Named vertices tracked across every transform for correspondence. */
  anchors: {
    /** Index into `outline` — the tip (highlighted as x / Ax). */
    nose: number;
    /** Index into `outline` — the larger fin that breaks symmetry. */
    rightFin: number;
  };
}

/** A small asymmetric "explorer craft": a bigger right fin breaks symmetry. */
export const OPENING_GRAPHIC: OpeningGraphic = {
  id: "opening-explorer",
  outline: [
    [0.0, 1.6], // 0 nose      (anchor)
    [0.5, 0.4], // 1 rShoulder
    [1.1, -0.9], // 2 rightFin  (anchor, larger fin)
    [0.4, -0.6], // 3 rBase
    [0.0, -1.0], // 4 tail
    [-0.4, -0.6], // 5 lBase
    [-0.7, -1.1], // 6 lFin
    [-0.5, 0.4], // 7 lShoulder
  ],
  anchors: { nose: 0, rightFin: 2 },
};
