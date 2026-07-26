/**
 * Pure layout/scheduling calculators behind the scene-kit motion primitives
 * that the animation benchmark laboratory showed were missing (sorted token
 * columns, focus-rig reframing, write-in pacing, staggered onsets, span-line
 * geometry). Motion-Canvas-free so unit tests can resolve this module in
 * jsdom; `kitMotion.ts` consumes it for the drawing side.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Integer-valued grid coordinates inside a symmetric half-extent. Fractional
 * extents constrain line length; they must not shift every grid line by half a
 * unit and silently omit the x/y axes.
 */
export function gridLineCoordinates(halfExtent: number): number[] {
  if (!Number.isFinite(halfExtent) || halfExtent < 0) return [];
  const start = Math.ceil(-halfExtent);
  const end = Math.floor(halfExtent);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Positions for a vertical column of tokens laid top-to-bottom in the given
 * order. The benchmark evidence (Reducible's Huffman build) is that a greedy
 * frontier should be a fixed PLACE on screen: same x, evenly spaced rows,
 * re-sorted contents.
 */
export function columnLayout(
  count: number,
  x: number,
  topY: number,
  rowGap: number,
): Point[] {
  return Array.from({ length: count }, (_, i) => ({ x, y: topY + i * rowGap }));
}

/**
 * Stable ascending order of `values`: ties keep their current relative order,
 * matching how a frontier re-sort must not swap equal-valued tokens (the
 * observable rule in the reference build).
 */
export function stableAscendingOrder(values: readonly number[]): number[] {
  return values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value || a.index - b.index)
    .map((entry) => entry.index);
}

/**
 * Group transform that reframes a fixed stage onto a focus point: the world
 * group is scaled by `scale` about the stage centre and shifted so `focus`
 * lands at the centre. This is the camera-as-group-move pattern (xiaoxiae's
 * zooms, Reducible's tree rescale) for a runtime without a camera rig.
 */
export function rigTransformForFocus(
  focus: Point,
  scale: number,
): { x: number; y: number; scale: number } {
  return { x: -focus.x * scale, y: -focus.y * scale, scale };
}

export interface WriteInSlot {
  /** Seconds from schedule start at which this line begins writing. */
  start: number;
  /** Seconds the write-in itself takes. */
  duration: number;
}

/**
 * Write-in schedule where each line's display time is proportional to its
 * length — the no-narration pacing rule observed in the manim-js reference
 * (line start = previous start + previous length * perChar + gap).
 */
export function writeInSchedule(
  lines: readonly string[],
  secondsPerChar: number,
  gapSeconds: number,
): WriteInSlot[] {
  const slots: WriteInSlot[] = [];
  let start = 0;
  for (const line of lines) {
    const duration = line.length * secondsPerChar;
    slots.push({ start, duration });
    start += duration + gapSeconds;
  }
  return slots;
}

/** Total seconds a writeInSchedule occupies. */
export function writeInTotal(
  lines: readonly string[],
  secondsPerChar: number,
  gapSeconds: number,
): number {
  if (lines.length === 0) return 0;
  const slots = writeInSchedule(lines, secondsPerChar, gapSeconds);
  const last = slots[slots.length - 1]!;
  return last.start + last.duration;
}

/**
 * Onset times for `count` sibling animations staggered `step` seconds apart —
 * the "neighbours pop in one at a time" pattern (manim-js staggering, 3b1b
 * fan reveals).
 */
export function staggerTimes(count: number, start: number, step: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i * step);
}

/**
 * Perpendicular distance from a point to the line through the origin with
 * direction `direction`, in the same units as the inputs. Used by the
 * stays-on-span invariant: an eigenvector tip must keep this at ~0 while it
 * tweens.
 */
export function distanceToLineThroughOrigin(point: Point, direction: Point): number {
  const length = Math.hypot(direction.x, direction.y);
  if (length === 0) return Math.hypot(point.x, point.y);
  return Math.abs(point.x * direction.y - point.y * direction.x) / length;
}

/** Linear interpolation between two hex colours (for family gradients). */
export function lerpHexColor(from: string, to: string, t: number): string {
  const parse = (hex: string) => {
    const clean = hex.replace("#", "");
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ] as const;
  };
  const clamp = Math.max(0, Math.min(1, t));
  const a = parse(from);
  const b = parse(to);
  const channel = (i: number) =>
    Math.round(a[i]! + (b[i]! - a[i]!) * clamp)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(1)}${channel(2)}`;
}
