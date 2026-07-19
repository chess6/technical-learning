import { describe, expect, it, beforeEach } from "vitest";
import { StrictMode } from "react";
import { render } from "@testing-library/react";
import { GuidedScenePlayer } from "../GuidedScenePlayer";
import { SvgFallbackEngine } from "../../../guided-scenes/engine/SvgFallbackEngine";
import {
  guidedSceneDebug,
  instrumentation,
} from "../../../guided-scenes/engine/instrumentation";
import type { GuidedSceneEngineOptions } from "../../../guided-scenes/engine/types";

function makeFactory() {
  return (options: GuidedSceneEngineOptions) => new SvgFallbackEngine(options);
}

describe("GuidedScenePlayer lifecycle", () => {
  beforeEach(() => {
    instrumentation.reset();
  });

  it("mounts exactly one engine and disposes it on unmount", () => {
    const { unmount } = render(
      <GuidedScenePlayer sceneId="spike" createEngine={makeFactory()} />,
    );

    let snapshot = instrumentation.snapshot();
    expect(snapshot.activeEngines).toBe(1);
    expect(snapshot.activeSubscribers).toBe(1);

    unmount();

    snapshot = instrumentation.snapshot();
    expect(snapshot.activeEngines).toBe(0);
    expect(snapshot.activeSubscribers).toBe(0);
    expect(guidedSceneDebug.isClean()).toBe(true);
  });

  it("disposes the previous engine when the factory identity changes", () => {
    const { rerender } = render(
      <GuidedScenePlayer sceneId="a" createEngine={makeFactory()} />,
    );
    expect(instrumentation.snapshot().activeEngines).toBe(1);

    rerender(<GuidedScenePlayer sceneId="b" createEngine={makeFactory()} />);

    const snapshot = instrumentation.snapshot();
    expect(snapshot.disposals).toBe(1);
    expect(snapshot.activeEngines).toBe(1);
  });

  it("resetToken-style key change produces a clean engine replacement", () => {
    const factory = makeFactory();
    const { rerender } = render(
      <GuidedScenePlayer key="spike:0" sceneId="spike" createEngine={factory} />,
    );
    expect(instrumentation.snapshot().activeEngines).toBe(1);

    // A new key remounts the component (as resetToken does at the page level).
    rerender(
      <GuidedScenePlayer key="spike:1" sceneId="spike" createEngine={factory} />,
    );

    const snapshot = instrumentation.snapshot();
    expect(snapshot.created).toBe(2);
    expect(snapshot.disposals).toBe(1);
    expect(snapshot.activeEngines).toBe(1);
  });

  it("removes the engine subscription on unmount", () => {
    const { unmount } = render(
      <GuidedScenePlayer sceneId="spike" createEngine={makeFactory()} />,
    );
    expect(instrumentation.snapshot().activeSubscribers).toBe(1);
    unmount();
    expect(instrumentation.snapshot().activeSubscribers).toBe(0);
  });

  it("settles to zero active resources under StrictMode double-invocation", () => {
    const { unmount } = render(
      <StrictMode>
        <GuidedScenePlayer sceneId="spike" createEngine={makeFactory()} />
      </StrictMode>,
    );
    // StrictMode mounts, cleans up, and remounts; net one active engine.
    expect(instrumentation.snapshot().activeEngines).toBe(1);
    unmount();
    expect(guidedSceneDebug.isClean()).toBe(true);
  });
});
