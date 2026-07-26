import { describe, expect, it } from "vitest";
import {
  columnLayout,
  distanceToLineThroughOrigin,
  gridLineCoordinates,
  lerpHexColor,
  rigTransformForFocus,
  stableAscendingOrder,
  staggerTimes,
  writeInSchedule,
  writeInTotal,
} from "../kitLayout";

describe("gridLineCoordinates", () => {
  it("keeps integer grid lines centred on zero for fractional extents", () => {
    expect(gridLineCoordinates(2.5)).toEqual([-2, -1, 0, 1, 2]);
  });

  it("preserves integer boundary lines for integer extents", () => {
    expect(gridLineCoordinates(2)).toEqual([-2, -1, 0, 1, 2]);
  });
});

describe("columnLayout", () => {
  it("stacks rows top to bottom at a fixed x", () => {
    expect(columnLayout(3, -338, -172, 88)).toEqual([
      { x: -338, y: -172 },
      { x: -338, y: -84 },
      { x: -338, y: 4 },
    ]);
  });
});

describe("stableAscendingOrder", () => {
  it("sorts ascending", () => {
    expect(stableAscendingOrder([0.35, 0.15, 0.16])).toEqual([1, 2, 0]);
  });
  it("keeps ties in their current relative order", () => {
    expect(stableAscendingOrder([0.17, 0.17, 0.31])).toEqual([0, 1, 2]);
  });
});

describe("rigTransformForFocus", () => {
  it("moves the focus point to the stage centre at the requested scale", () => {
    const t = rigTransformForFocus({ x: 120, y: -20 }, 1.5);
    // world point (120,-20) after scale+shift: 120*1.5 + x = 0.
    expect(t.x + 120 * t.scale).toBeCloseTo(0);
    expect(t.y + -20 * t.scale).toBeCloseTo(0);
  });
  it("is the identity for centre focus at scale 1", () => {
    expect(rigTransformForFocus({ x: 0, y: 0 }, 1)).toEqual({ x: -0, y: -0, scale: 1 });
  });
});

describe("writeInSchedule", () => {
  it("paces each line proportionally to its length", () => {
    const slots = writeInSchedule(["abcd", "ab"], 0.5, 1);
    expect(slots[0]).toEqual({ start: 0, duration: 2 });
    expect(slots[1]).toEqual({ start: 3, duration: 1 });
    expect(writeInTotal(["abcd", "ab"], 0.5, 1)).toBe(4);
  });
  it("handles the empty schedule", () => {
    expect(writeInSchedule([], 0.5, 1)).toEqual([]);
    expect(writeInTotal([], 0.5, 1)).toBe(0);
  });
});

describe("staggerTimes", () => {
  it("spaces onsets evenly from the start time", () => {
    expect(staggerTimes(3, 10, 0.2)).toEqual([10, 10.2, 10.4]);
  });
});

describe("distanceToLineThroughOrigin", () => {
  it("is zero for points on the line", () => {
    expect(
      distanceToLineThroughOrigin({ x: -3, y: 3 }, { x: -1, y: 1 }),
    ).toBeCloseTo(0);
  });
  it("measures perpendicular distance off the line", () => {
    expect(
      distanceToLineThroughOrigin({ x: 1, y: 1 }, { x: 1, y: 0 }),
    ).toBeCloseTo(1);
  });
  it("falls back to point distance for a degenerate direction", () => {
    expect(
      distanceToLineThroughOrigin({ x: 3, y: 4 }, { x: 0, y: 0 }),
    ).toBeCloseTo(5);
  });
});

describe("lerpHexColor", () => {
  it("interpolates channels and clamps t", () => {
    expect(lerpHexColor("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(lerpHexColor("#102030", "#102030", 0.3)).toBe("#102030");
    expect(lerpHexColor("#000000", "#ffffff", 2)).toBe("#ffffff");
  });
});
