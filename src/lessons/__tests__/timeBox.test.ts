import { describe, expect, it } from "vitest";
import {
  deadlineMs,
  formatRemaining,
  governingTimeLimitSec,
  isExpired,
  remainingSec,
} from "../timeBox";

const START = "2026-01-01T00:00:00.000Z";
const startMs = Date.parse(START);
const at = (offsetSec: number) => new Date(startMs + offsetSec * 1000);

describe("timeBox — deadline math", () => {
  it("deadline is startedAt + timeLimitSec", () => {
    expect(deadlineMs(START, 1200)).toBe(startMs + 1200 * 1000);
  });

  // Regression (review finding 3): an attempt whose deadline cannot be computed
  // must never read as untimed — no deadline means EXPIRED, not unlimited time.
  it("fails CLOSED for an unparseable startedAt", () => {
    expect(deadlineMs("not-a-date", 1200)).toBeNull();
    expect(remainingSec("not-a-date", 1200, at(0))).toBe(0);
    expect(isExpired("not-a-date", 1200, at(0))).toBe(true);
    // Even far "before" any plausible deadline, and for an empty string.
    expect(isExpired("", 1200, at(-99999))).toBe(true);
    expect(remainingSec("", 1200, at(-99999))).toBe(0);
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

  // Regression (review finding 1): the attempt's snapshotted limit governs; the
  // registry is only a fallback for an attempt that recorded no limit at all.
  it("the attempt's snapshotted limit wins over the registry", () => {
    expect(governingTimeLimitSec(1200, 600)).toBe(1200);
    expect(governingTimeLimitSec(1200, undefined)).toBe(1200);
    // A registry edit cannot move a running attempt's deadline.
    expect(deadlineMs(START, governingTimeLimitSec(1200, 60)!)).toBe(startMs + 1200 * 1000);
    expect(isExpired(START, governingTimeLimitSec(1200, 60)!, at(61))).toBe(false);
  });

  it("falls back to the registry only when the attempt recorded no limit", () => {
    expect(governingTimeLimitSec(undefined, 1200)).toBe(1200);
    expect(governingTimeLimitSec(undefined, undefined)).toBeUndefined(); // untimed set
  });

  it("formats mm:ss", () => {
    expect(formatRemaining(1200)).toBe("20:00");
    expect(formatRemaining(65)).toBe("1:05");
    expect(formatRemaining(9)).toBe("0:09");
    expect(formatRemaining(0)).toBe("0:00");
  });
});
