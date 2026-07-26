import type { BeatIntent } from "../scenes/beatIntents";

/**
 * Data model for the production guided-scene hard gates.
 *
 * These are the benchmark laboratory's findings promoted into checks that run
 * against EVERY production scene without per-scene instrumentation: the
 * sampler walks the live Motion Canvas node tree, and the gates in
 * `hardGates.ts` are pure functions over the resulting records.
 *
 * Everything a gate consumes lives here, Motion-Canvas-free, so the gates are
 * unit-testable in jsdom against synthetic runs.
 */

/** One node of a scene graph at one sampled frame. */
export interface NodeSample {
  /** Motion Canvas node key — stable across frames, so it IS the identity. */
  key: string;
  /** Constructor name (Txt, Line, Rect, Node, …). */
  type: string;
  /** World-space bounding-box centre, stage coordinates (origin at centre). */
  x: number;
  y: number;
  /** World-space bounding-box size in stage pixels. */
  width: number;
  height: number;
  /** Absolute opacity (product of the ancestor chain). */
  opacity: number;
  /** Displayed string, for Txt nodes. */
  text?: string;
  /**
   * Font size in stage px, for Txt nodes.
   *
   * The single reliable typographic quantity available: a text node's BOX is
   * layout, not ink (it carries line leading and padding, measuring up to
   * ~3.4× the glyph height for the repo's overlay captions), so gates that
   * need to reason about what a reader sees use this instead.
   */
  fontSize?: number;
  /** Keys of every ancestor, root first — lets gates skip nested pairs. */
  ancestors: string[];
  /** Parsed Line points in stage coordinates, when the node is a line/polygon. */
  points?: { x: number; y: number }[];
  /** Visible fraction of a Curve, so a line growing in place counts as geometry motion. */
  drawnStart?: number;
  drawnEnd?: number;
}

export interface UnmeasuredNodeSample {
  key: string;
  type: string;
  opacity?: number;
  reason: string;
}

export interface SceneFrameSample {
  frame: number;
  /** Seconds at the authored frame rate. */
  time: number;
  nodes: Record<string, NodeSample>;
  /** Nodes the sampler saw but could not measure; never silently discarded. */
  unmeasured: UnmeasuredNodeSample[];
}

/** A frame reached from two directions, to prove seeking is deterministic. */
export interface SceneSeekRecord {
  segmentId: string;
  frame: number;
  hashFromStart: string;
  hashFromEnd: string;
  nodesFromStart: Record<string, NodeSample>;
  nodesFromEnd: Record<string, NodeSample>;
  unmeasuredFromStart?: UnmeasuredNodeSample[];
  unmeasuredFromEnd?: UnmeasuredNodeSample[];
}

export interface SceneBeatWindow {
  id: string;
  intent: BeatIntent;
  start: number;
  end: number;
  targets: readonly string[];
}

export interface SceneSegmentWindow {
  id: string;
  /** Segment bounds in seconds on the scene timeline. */
  start: number;
  end: number;
  /** Explicit authored intent for every timed beat; names carry no semantics. */
  beats: SceneBeatWindow[];
}

export interface SegmentOverrunRecord {
  label: string;
  declared: number;
  measured: number;
}

/** Everything one sampling pass over a production scene produced. */
export interface SceneGateRun {
  sceneId: string;
  fps: number;
  /** Sampling stride in frames. */
  stride: number;
  durationFrames: number;
  frames: SceneFrameSample[];
  segments: SceneSegmentWindow[];
  seekRecords: SceneSeekRecord[];
  overruns: SegmentOverrunRecord[];
}

/**
 * A hard-gate violation. Every finding this module produces is a HARD
 * failure by construction — craft differences belong to the benchmark
 * laboratory's craft dimension, never here.
 */
export interface SceneGateFinding {
  /** Gate id, e.g. "text-clipping". */
  gate: string;
  sceneId: string;
  message: string;
  segmentId?: string;
  frame?: number;
  nodeKey?: string;
  measured?: number;
  limit?: number;
}

/** Stage bounds every production scene draws inside. */
export const STAGE_BOUNDS = { halfWidth: 480, halfHeight: 270 } as const;

/** Opacity above which a node counts as visible to the gates. */
export const VISIBLE_OPACITY = 0.06;

export function isVisible(sample: NodeSample | undefined): sample is NodeSample {
  return !!sample && sample.opacity > VISIBLE_OPACITY;
}

/** Axis-aligned overlap area of two samples' bounding boxes. */
export function overlapArea(a: NodeSample, b: NodeSample): number {
  const dx =
    Math.min(a.x + a.width / 2, b.x + b.width / 2) -
    Math.max(a.x - a.width / 2, b.x - b.width / 2);
  const dy =
    Math.min(a.y + a.height / 2, b.y + b.height / 2) -
    Math.max(a.y - a.height / 2, b.y - b.height / 2);
  return dx > 0 && dy > 0 ? dx * dy : 0;
}

/** True when either node is an ancestor of the other (nesting, not collision). */
export function isNested(a: NodeSample, b: NodeSample): boolean {
  return a.ancestors.includes(b.key) || b.ancestors.includes(a.key);
}
