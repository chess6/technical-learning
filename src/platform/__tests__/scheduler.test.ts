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
  it("defaults to a no-op that returns nothing", () => {
    expect(getScheduler()).toBe(NOOP_SCHEDULER);
    expect(NOOP_SCHEDULER.onAttemptReleased({
      attemptSetId: "a",
      setId: "s",
      moduleId: "m",
      releasedAt: "2026-01-01T00:00:00.000Z",
      outcomes: [],
    })).toEqual({});
    expect(NOOP_SCHEDULER.dueReviews(new Date())).toEqual([]);
  });

  it("lets Package H register a hook, then resets", () => {
    const hook: SchedulerHook = {
      onAttemptReleased: vi.fn(() => ({ hint: "later" })),
      dueReviews: vi.fn(() => []),
    };
    registerScheduler(hook);
    expect(getScheduler()).toBe(hook);
    resetScheduler();
    expect(getScheduler()).toBe(NOOP_SCHEDULER);
  });
});
