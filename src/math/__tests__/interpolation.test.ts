import { describe, expect, it } from "vitest";
import { clamp, lerp, lerpMatrix, lerpVector } from "../interpolation";

describe("interpolation utilities", () => {
  it("lerps endpoints and midpoint", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it("lerps vectors and matrices", () => {
    expect(lerpVector([0, 0], [2, 4], 0.5)).toEqual([1, 2]);
    expect(
      lerpMatrix(
        [
          [1, 0],
          [0, 1],
        ],
        [
          [3, 2],
          [0, 1],
        ],
        0.5,
      ),
    ).toEqual([
      [2, 1],
      [0, 1],
    ]);
  });

  it("clamps values", () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(1.5, 0, 3)).toBe(1.5);
  });
});
