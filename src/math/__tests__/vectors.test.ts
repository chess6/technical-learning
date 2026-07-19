import { describe, expect, it } from "vitest";
import {
  addVectors,
  angleBetweenVectors,
  approximatelyEqualVector,
  areParallel,
  magnitude,
  normalizeVector,
  scaleVector,
  subtractVectors,
} from "../vectors";

describe("vector utilities", () => {
  it("adds vectors", () => {
    expect(addVectors([1, 2], [3, -1])).toEqual([4, 1]);
  });

  it("subtracts and scales", () => {
    expect(subtractVectors([3, 1], [1, 1])).toEqual([2, 0]);
    expect(scaleVector([1, -2], 3)).toEqual([3, -6]);
  });

  it("computes magnitude and normalizes", () => {
    expect(magnitude([3, 4])).toBe(5);
    expect(normalizeVector([3, 4])).toEqual([0.6, 0.8]);
  });

  it("returns null when normalizing the zero vector", () => {
    expect(normalizeVector([0, 0])).toBeNull();
    expect(normalizeVector([1e-12, 0], 1e-9)).toBeNull();
  });

  it("detects parallel and antiparallel vectors", () => {
    expect(areParallel([2, 0], [5, 0])).toBe(true);
    expect(areParallel([1, 1], [-2, -2])).toBe(true);
    expect(areParallel([1, 0], [0, 1])).toBe(false);
    expect(areParallel([0, 0], [4, 7])).toBe(true);
  });

  it("computes signed angle with tolerance", () => {
    const rightAngle = angleBetweenVectors([1, 0], [0, 1]);
    expect(rightAngle).not.toBeNull();
    expect(rightAngle!).toBeCloseTo(Math.PI / 2, 10);

    const opposite = angleBetweenVectors([1, 0], [-1, 0]);
    expect(opposite).not.toBeNull();
    expect(Math.abs(opposite!)).toBeCloseTo(Math.PI, 10);

    expect(angleBetweenVectors([0, 0], [1, 0])).toBeNull();
  });

  it("compares vectors approximately", () => {
    expect(approximatelyEqualVector([1, 2], [1 + 1e-12, 2])).toBe(true);
    expect(approximatelyEqualVector([1, 2], [1.01, 2], 1e-3)).toBe(false);
  });
});
