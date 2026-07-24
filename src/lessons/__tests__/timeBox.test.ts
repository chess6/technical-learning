import { describe, expect, it } from "vitest";
import { deadlineMs, formatRemaining, isExpired, remainingSec } from "../timeBox";

const START = "2026-01-01T00:00:00.000Z";
const startMs = Date.parse(START);
const at = (offsetSec: number) => new Date(startMs + offsetSec * 1000);

describe("timeBox — deadline math", () => {
  it("deadline is startedAt + timeLimitSec", () => {
    expect(deadlineMs(START, 1200)).toBe(startMs + 1200 * 1000);
  });

  it("returns null for an unparseable startedAt", () => {
    expect(deadlineMs("not-a-date", 1200)).toBeNull();
    expect(remainingSec("not-a-date", 1200, at(0))).toBeNull();
    expect(isExpired("not-a-date", 1200, at(0))).toBe(false);
  });

  it("remaining counts down and clamps at 0", () => {
    expect(remainingSec(START, 1200, at(0))).toBe(1200);
    expect(remainingSec(START, 1200, at(1199))).toBe(1);
    expect(remainingSec(START, 1200, at(1200))).toBe(0);
    expect(remainingSec(START, 1200, at(5000))).toBe(0); // never negative
  });

  it("isExpired flips exactly at the deadline", () => {
    expect(isExpired(START, 1200, at(1199))).toBe(false);
    expect(isExpired(START, 1200, at(1200))).toBe(true);
    expect(isExpired(START, 1200, at(1201))).toBe(true);
  });

  it("a reload well past the deadline reads as expired (elapsed from startedAt)", () => {
    expect(isExpired(START, 1200, at(99999))).toBe(true);
    expect(remainingSec(START, 1200, at(99999))).toBe(0);
  });

  it("formats mm:ss", () => {
    expect(formatRemaining(1200)).toBe("20:00");
    expect(formatRemaining(65)).toBe("1:05");
    expect(formatRemaining(9)).toBe("0:09");
    expect(formatRemaining(0)).toBe("0:00");
  });
});
