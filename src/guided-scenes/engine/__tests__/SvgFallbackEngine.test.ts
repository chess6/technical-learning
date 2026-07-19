import { describe, expect, it, beforeEach } from "vitest";
import { SvgFallbackEngine } from "../SvgFallbackEngine";
import { guidedSceneDebug, instrumentation } from "../instrumentation";

describe("SvgFallbackEngine", () => {
  beforeEach(() => {
    instrumentation.reset();
  });

  it("is interface-complete and cleans up on dispose", () => {
    const engine = new SvgFallbackEngine({});
    const container = document.createElement("div");
    document.body.appendChild(container);

    engine.mount(container);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(instrumentation.snapshot().activeEngines).toBe(1);
    expect(instrumentation.snapshot().mounts).toBe(1);

    // Interface methods exist and are callable without throwing.
    engine.seek(0.5);
    expect(engine.getState().progress).toBeCloseTo(0.5, 5);
    engine.pause();
    engine.reset();
    engine.resize();

    engine.dispose();
    expect(container.querySelector("svg")).toBeNull();
    expect(guidedSceneDebug.isClean()).toBe(true);

    container.remove();
  });

  it("dispose is idempotent", () => {
    const engine = new SvgFallbackEngine({});
    const container = document.createElement("div");
    engine.mount(container);
    engine.dispose();
    engine.dispose();
    expect(instrumentation.snapshot().disposals).toBe(1);
    expect(instrumentation.snapshot().activeEngines).toBe(0);
  });

  it("reduced motion mounts at the final state", () => {
    const engine = new SvgFallbackEngine({ reducedMotion: true });
    const container = document.createElement("div");
    engine.mount(container);
    expect(engine.getState().status).toBe("complete");
    expect(engine.getState().progress).toBe(1);
    engine.dispose();
  });
});
