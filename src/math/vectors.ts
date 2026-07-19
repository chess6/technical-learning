import {
  DEFAULT_TOLERANCE,
  type Vector2,
} from "./types";

export function addVectors(a: Vector2, b: Vector2): Vector2 {
  return [a[0] + b[0], a[1] + b[1]];
}

export function subtractVectors(a: Vector2, b: Vector2): Vector2 {
  return [a[0] - b[0], a[1] - b[1]];
}

export function scaleVector(v: Vector2, scalar: number): Vector2 {
  return [v[0] * scalar, v[1] * scalar];
}

export function dotProduct(a: Vector2, b: Vector2): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function magnitude(v: Vector2): number {
  return Math.hypot(v[0], v[1]);
}

/**
 * Normalize a vector to unit length.
 * Returns null for the zero vector (no well-defined direction).
 */
export function normalizeVector(
  v: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): Vector2 | null {
  const mag = magnitude(v);
  if (mag <= tolerance) return null;
  return [v[0] / mag, v[1] / mag];
}

export function approximatelyEqualVector(
  a: Vector2,
  b: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  return Math.abs(a[0] - b[0]) <= tolerance && Math.abs(a[1] - b[1]) <= tolerance;
}

/**
 * Whether two vectors are scalar multiples of each other (including antiparallel).
 * The zero vector is parallel to every vector by convention.
 */
export function areParallel(
  a: Vector2,
  b: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  const cross = a[0] * b[1] - a[1] * b[0];
  return Math.abs(cross) <= tolerance;
}

/**
 * Signed angle from a to b in radians, in (−π, π].
 * Returns null if either vector is (near) zero.
 */
export function angleBetweenVectors(
  a: Vector2,
  b: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): number | null {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA <= tolerance || magB <= tolerance) return null;
  const cos = Math.max(-1, Math.min(1, dotProduct(a, b) / (magA * magB)));
  const sin = (a[0] * b[1] - a[1] * b[0]) / (magA * magB);
  return Math.atan2(sin, cos);
}

/** Absolute unsigned angle between directions, in [0, π]. */
export function absoluteAngleBetweenVectors(
  a: Vector2,
  b: Vector2,
  tolerance = DEFAULT_TOLERANCE,
): number | null {
  const signed = angleBetweenVectors(a, b, tolerance);
  if (signed === null) return null;
  return Math.abs(signed);
}
