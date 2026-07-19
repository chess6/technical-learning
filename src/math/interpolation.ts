import type { Matrix2x2, Vector2 } from "./types";
import { IDENTITY_MATRIX } from "./matrices";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVector(a: Vector2, b: Vector2, t: number): Vector2 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

/**
 * Entrywise matrix interpolation.
 *
 * Educational note: interpolating between identity and A is a visual aid, not a
 * mathematical matrix factorization or the unique path of the transformation.
 */
export function lerpMatrix(a: Matrix2x2, b: Matrix2x2, t: number): Matrix2x2 {
  return [
    [lerp(a[0][0], b[0][0], t), lerp(a[0][1], b[0][1], t)],
    [lerp(a[1][0], b[1][0], t), lerp(a[1][1], b[1][1], t)],
  ];
}

/** Interpolate from the identity toward a target matrix. */
export function lerpIdentityToMatrix(target: Matrix2x2, t: number): Matrix2x2 {
  return lerpMatrix(IDENTITY_MATRIX, target, t);
}

export function easeInOutCubic(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeInOutQuad(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function linear(t: number): number {
  return clamp(t, 0, 1);
}
