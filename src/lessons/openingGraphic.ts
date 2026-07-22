import type { Vector2 } from "../math";

/**
 * The shared opening vector graphic — a single source of truth for the
 * recognizable object that Chapter 0 and Lesson 2 transform.
 *
 * It is a genuine multi-part craft (a small side-view starfighter): an
 * asymmetric hull silhouette, a cockpit window, a tall dorsal fin and a small
 * ventral fin (the asymmetry that makes reflection / rotation unmistakable), an
 * internal panel seam, and an engine tick. Every part lives in ONE shared
 * math-space coordinate system (y up), centered near the origin with
 * |coord| ≲ 1.6 so 2×2 matrices in the teaching range keep it on-frame.
 *
 * Every transform of this graphic MUST go through the shared math helpers
 * (`matrixVectorMultiply` / `applyMatrixToPoints`) — never ad-hoc geometry —
 * per math-visualization-correctness. A matrix maps the COORDINATES of these
 * vertices/control points, not "pixels", and every part is transformed by the
 * same matrix so internal features stay aligned to the hull.
 */

/** Semantic role of a drawable part (drives stroke/fill styling per renderer). */
export type GraphicRole = "hull" | "cockpit" | "fin" | "panel" | "thruster";

export interface GraphicPart {
  id: string;
  role: GraphicRole;
  /** Draw closed (polygon) when true; open polyline (a seam / tick) when false. */
  closed: boolean;
  /** Ordered control points in shared math space (y up). */
  points: readonly Vector2[];
}

export interface OpeningGraphic {
  id: "opening-explorer";
  /**
   * Primary hull silhouette. Kept as a first-class field (not only inside
   * `parts`) because it is the source of the anchor indices and the thing math
   * tests transform vertex-by-vertex.
   */
  outline: readonly Vector2[];
  /** All drawable parts in back-to-front draw order (hull first). */
  parts: readonly GraphicPart[];
  /**
   * Named control vertices, tracked across every transform for correspondence.
   * Indices into `outline` (the hull).
   */
  anchors: { nose: number; fin: number };
}

/**
 * Asymmetric hull: nose points +x, a tall dorsal fin points +y, a small ventral
 * fin points −y. Left/right and top/bottom are both asymmetric, so no rotation
 * or reflection can be mistaken for the original.
 */
const HULL: readonly Vector2[] = [
  [1.55, 0.0], // 0 nose            (anchor: nose)
  [0.55, 0.42], // 1 upper bow
  [0.15, 0.42], // 2 dorsal front base
  [-0.15, 1.25], // 3 dorsal fin tip  (anchor: fin — tall, breaks symmetry)
  [-0.45, 0.42], // 4 dorsal back base
  [-1.05, 0.38], // 5 upper tail
  [-1.35, 0.2], // 6 engine top
  [-1.35, -0.2], // 7 engine bottom
  [-1.05, -0.3], // 8 lower tail
  [-0.55, -0.3], // 9 ventral back base
  [-0.75, -0.68], // 10 ventral fin tip (small)
  [-0.25, -0.3], // 11 ventral front base
  [0.55, -0.34], // 12 lower bow
];

/** Cockpit window — a small quad near the bow, on the upper side. */
const COCKPIT: readonly Vector2[] = [
  [0.78, 0.1],
  [0.5, 0.3],
  [0.28, 0.26],
  [0.44, 0.06],
];

/** A horizontal hull seam (open polyline) that shears/reflects with the body. */
const PANEL: readonly Vector2[] = [
  [0.5, -0.02],
  [-0.2, -0.02],
  [-0.9, -0.02],
];

/** A short engine exhaust tick (open polyline) at the tail. */
const THRUSTER: readonly Vector2[] = [
  [-1.35, 0.0],
  [-1.6, 0.0],
];

export const OPENING_GRAPHIC: OpeningGraphic = {
  id: "opening-explorer",
  outline: HULL,
  parts: [
    { id: "hull", role: "hull", closed: true, points: HULL },
    { id: "cockpit", role: "cockpit", closed: true, points: COCKPIT },
    { id: "panel", role: "panel", closed: false, points: PANEL },
    { id: "thruster", role: "thruster", closed: false, points: THRUSTER },
  ],
  anchors: { nose: 0, fin: 3 },
};
