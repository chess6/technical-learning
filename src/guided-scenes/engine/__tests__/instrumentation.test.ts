import { describe, expect, it, beforeEach } from "vitest";
import { guidedSceneDebug, instrumentation } from "../instrumentation";

describe("guided-scene instrumentation", () => {
  beforeEach(() => {
    instrumentation.reset();
  });

  it("starts clean", () => {
    expect(guidedSceneDebug.isClean()).toBe(true);
    expect(instrumentation.snapshot()).toMatchObject({
      activeEngines: 0,
      activeLoops: 0,
      activeResources: 0,
      activeSubscribers: 0,
    });
  });

  it("tracks create/dispose as balanced active counts", () => {
    instrumentation.registerCreated();
    expect(instrumentation.snapshot().activeEngines).toBe(1);
    expect(instrumentation.snapshot().created).toBe(1);
    instrumentation.registerDisposed();
    expect(instrumentation.snapshot().activeEngines).toBe(0);
    expect(instrumentation.snapshot().disposals).toBe(1);
    expect(guidedSceneDebug.isClean()).toBe(true);
  });

  it("tracks loops, resources, and subscribers to zero", () => {
    instrumentation.loopStarted();
    instrumentation.resourceAcquired(4);
    instrumentation.subscriberAdded();
    expect(guidedSceneDebug.isClean()).toBe(false);

    instrumentation.loopStopped();
    instrumentation.resourceReleased(4);
    instrumentation.subscriberRemoved();
    expect(guidedSceneDebug.isClean()).toBe(true);
  });
});
