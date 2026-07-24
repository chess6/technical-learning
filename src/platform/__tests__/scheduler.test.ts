import { afterEach, describe, expect, it, vi } from "vitest";
import {
  NOOP_SCHEDULER,
  getScheduler,
  registerScheduler,
  resetScheduler,
  type SchedulerHook,
} from "../scheduler";

afterEach(() => resetScheduler());

describe("scheduler seam", () => {
  it("defaults to a no-op that returns nothing (and has no dueReviews method — narrowed)", () => {
    expect(getScheduler()).toBe(NOOP_SCHEDULER);
    expect(NOOP_SCHEDULER.onAttemptReleased({
      attemptSetId: "a",
      setId: "s",
      moduleId: "m",
      releasedAt: "2026-01-01T00:00:00.000Z",
      outcomes: [],
    })).toEqual({});
    // The bypassed `dueReviews` method was removed in Package H (see scheduler.ts).
    expect("dueReviews" in NOOP_SCHEDULER).toBe(false);
  });

  it("lets Package H register a hook, then resets", () => {
    const hook: SchedulerHook = {
      onAttemptReleased: vi.fn(() => ({ hint: "later" })),
    };
    registerScheduler(hook);
    expect(getScheduler()).toBe(hook);
    resetScheduler();
    expect(getScheduler()).toBe(NOOP_SCHEDULER);
  });
});
