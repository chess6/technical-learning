import { describe, expect, it } from "vitest";
import {
  DISTINCT_SEMANTIC_ROLES,
  RESOLVING_SEMANTIC_ROLES,
  ROLE,
} from "../semanticRoles";

/**
 * The colour grammar, held to its own rules.
 *
 * The July 2026 audit's "cross-scene colour drift" finding was that one hue
 * carried several unrelated meanings — worst of all `selected`, which marked
 * BOTH the target `b` and the solution point in linear-systems, the two objects
 * that scene exists to keep apart. `target` and `violation` were added so the
 * roles that collided have somewhere else to go; these tests keep them
 * genuinely distinguishable rather than three near-identical ambers.
 */

function toRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

/** Hue in degrees, 0..360. */
function hue(hex: string): number {
  const [r, g, b] = toRgb(hex).map((c) => c / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta < 1e-9) return 0;
  let h: number;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return (h * 60 + 360) % 360;
}

/** Relative luminance, for the contrast checks below. */
function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((c) => {
    const channel = c / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (high + 0.05) / (low + 0.05);
}

function hueDistance(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return raw > 180 ? 360 - raw : raw;
}

describe("semantic colour roles", () => {
  it("every role is a valid 6-digit hex", () => {
    for (const value of Object.values(ROLE)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("the roles that must be told apart all have different values", () => {
    const values = DISTINCT_SEMANTIC_ROLES.map((role) => ROLE[role]);
    expect(new Set(values).size).toBe(values.length);
  });

  it("keeps every distinguishable pair separated in hue", () => {
    // The tightest legacy pair is `transformed` (tan) / `selected` (gold) at
    // ~17°. That pair is deliberately never used for two objects inside ONE
    // comparison — where they do co-occur (the determinant scene's ghost square
    // and orientation arc) they differ in shape and dash as well — so the floor
    // here records the palette as it is rather than pretending it is wider.
    for (const first of DISTINCT_SEMANTIC_ROLES) {
      for (const second of DISTINCT_SEMANTIC_ROLES) {
        if (first === second) continue;
        const distance = hueDistance(hue(ROLE[first]), hue(ROLE[second]));
        expect(distance, `${first} vs ${second}`).toBeGreaterThanOrEqual(16);
      }
    }
  });

  it("holds the roles added to break a collision to a stricter 22° separation", () => {
    for (const added of RESOLVING_SEMANTIC_ROLES) {
      for (const other of DISTINCT_SEMANTIC_ROLES) {
        if (added === other) continue;
        const distance = hueDistance(hue(ROLE[added]), hue(ROLE[other]));
        expect(distance, `${added} vs ${other}`).toBeGreaterThanOrEqual(22);
      }
    }
  });

  it("names the two roles the linear-systems collision needed", () => {
    // b and the solution point shared `selected`. `target` is what b moved to.
    expect(ROLE.target).not.toBe(ROLE.selected);
    expect(ROLE.target).not.toBe(ROLE.result);
    // A forbidden move is not "just another result".
    expect(ROLE.violation).not.toBe(ROLE.result);
    expect(ROLE.violation).not.toBe(ROLE.transformed);
  });

  it("keeps the co-equal pair distinguishable from each other and from before/after", () => {
    expect(hueDistance(hue(ROLE.basis1), hue(ROLE.basis2))).toBeGreaterThanOrEqual(60);
    for (const role of ["original", "transformed"] as const) {
      expect(hueDistance(hue(ROLE.basis1), hue(ROLE[role]))).toBeGreaterThanOrEqual(22);
      expect(hueDistance(hue(ROLE.basis2), hue(ROLE[role]))).toBeGreaterThanOrEqual(22);
    }
  });

  it("every teaching role reads against the scene background", () => {
    for (const role of DISTINCT_SEMANTIC_ROLES) {
      expect(contrast(ROLE[role], ROLE.background), role).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps dimmed objects clearly below every teaching role", () => {
    for (const role of DISTINCT_SEMANTIC_ROLES) {
      expect(luminance(ROLE[role]), role).toBeGreaterThan(luminance(ROLE.dim));
    }
  });
});
