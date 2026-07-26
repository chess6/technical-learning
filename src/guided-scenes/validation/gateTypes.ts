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
}

export interface SceneFrameSample {
  frame: number;
  /** Seconds at the authored frame rate. */
  time: number;
  nodes: Record<string, NodeSample>;
}

/** A frame reached from two directions, to prove seeking is deterministic. */
export interface SceneSeekRecord {
  segmentId: string;
  frame: number;
  hashFromStart: string;
  hashFromEnd: string;
  nodesFromStart: Record<string, NodeSample>;
  nodesFromEnd: Record<string, NodeSample>;
}

export interface SceneSegmentWindow {
  id: string;
  /** Segment bounds in seconds on the scene timeline. */
  start: number;
  end: number;
  /**
   * Seconds of this segment's declared beat budget that are NOT holds —
   * i.e. time the scene's own timing data claims something is moving.
   * Computed from SCENE_BEATS by `motionBudgetOf`.
   */
  motionBudget: number;
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

/** Beat names that declare a deliberate STATIC hold rather than motion. */
const HOLD_BEAT_PATTERN = /^(hold|think|ask|wait|pause|linger|beat)\d*$/i;

/** True when a beat name declares a hold (no motion claimed). */
export function isHoldBeat(name: string): boolean {
  return HOLD_BEAT_PATTERN.test(name);
}

/**
 * Seconds of a segment's beat budget that claim motion.
 *
 * The scene's own `SCENE_BEATS` entry is the source of truth: every beat that
 * is not a hold is time the author declared something would be moving. A
 * segment with a real motion budget that renders identical frames throughout
 * is claiming motion it never enacts.
 */
export function motionBudgetOf(beats: Record<string, number>): number {
  let total = 0;
  for (const [name, seconds] of Object.entries(beats)) {
    if (!isHoldBeat(name)) total += seconds;
  }
  return total;
}

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
