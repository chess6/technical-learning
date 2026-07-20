import { describe, expect, it, beforeEach } from "vitest";
import { StrictMode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GuidedScenePlayer } from "../GuidedScenePlayer";
import { SvgFallbackEngine } from "../../../guided-scenes/engine/SvgFallbackEngine";
import {
  guidedSceneDebug,
  instrumentation,
} from "../../../guided-scenes/engine/instrumentation";
import type {
  GuidedSceneEngine,
  GuidedSceneEngineOptions,
  GuidedSceneState,
} from "../../../guided-scenes/engine/types";

function makeFactory() {
  return (options: GuidedSceneEngineOptions) => new SvgFallbackEngine(options);
}

describe("GuidedScenePlayer lifecycle", () => {
  beforeEach(() => {
    instrumentation.reset();
  });

  it("mounts exactly one engine and disposes it on unmount", () => {
    const { unmount } = render(
      <GuidedScenePlayer sceneId="transform-spike" createEngine={makeFactory()} />,
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
      <GuidedScenePlayer sceneId="transform-spike" createEngine={makeFactory()} />,
    );
    expect(instrumentation.snapshot().activeEngines).toBe(1);

    rerender(
      <GuidedScenePlayer sceneId="transform-spike" createEngine={makeFactory()} />,
    );

    const snapshot = instrumentation.snapshot();
    expect(snapshot.disposals).toBe(1);
    expect(snapshot.activeEngines).toBe(1);
  });

  it("resetToken-style key change produces a clean engine replacement", () => {
    const factory = makeFactory();
    const { rerender } = render(
      <GuidedScenePlayer key="spike:0" sceneId="transform-spike" createEngine={factory} />,
    );
    expect(instrumentation.snapshot().activeEngines).toBe(1);

    // A new key remounts the component (as resetToken does at the page level).
    rerender(
      <GuidedScenePlayer key="spike:1" sceneId="transform-spike" createEngine={factory} />,
    );

    const snapshot = instrumentation.snapshot();
    expect(snapshot.created).toBe(2);
    expect(snapshot.disposals).toBe(1);
    expect(snapshot.activeEngines).toBe(1);
  });

  it("removes the engine subscription on unmount", () => {
    const { unmount } = render(
      <GuidedScenePlayer sceneId="transform-spike" createEngine={makeFactory()} />,
    );
    expect(instrumentation.snapshot().activeSubscribers).toBe(1);
    unmount();
    expect(instrumentation.snapshot().activeSubscribers).toBe(0);
  });

  it("settles to zero active resources under StrictMode double-invocation", () => {
    const { unmount } = render(
      <StrictMode>
        <GuidedScenePlayer sceneId="transform-spike" createEngine={makeFactory()} />
      </StrictMode>,
    );
    // StrictMode mounts, cleans up, and remounts; net one active engine.
    expect(instrumentation.snapshot().activeEngines).toBe(1);
    unmount();
    expect(guidedSceneDebug.isClean()).toBe(true);
  });

  it("shows learner-facing error UI with a retry when the engine fails to load (M6)", async () => {
    let attempt = 0;

    class FakeFailingThenWorkingEngine implements GuidedSceneEngine {
      readonly steps = [];
      private state: GuidedSceneState;
      private listener: ((state: GuidedSceneState) => void) | null = null;
      private readonly shouldFail: boolean;

      constructor(shouldFail: boolean) {
        this.shouldFail = shouldFail;
        this.state = {
          status: "idle",
          progress: 0,
          duration: null,
          currentStep: null,
          canSeek: false,
          error: null,
        };
      }

      mount(): void {
        if (this.shouldFail) {
          this.state = {
            ...this.state,
            status: "error",
            error: "chunk load failed",
          };
          this.listener?.(this.state);
        }
      }
      play(): void {}
      pause(): void {}
      reset(): void {}
      seek(): void {}
      resize(): void {}
      dispose(): void {}
      getState(): GuidedSceneState {
        return this.state;
      }
      subscribe(listener: (state: GuidedSceneState) => void): () => void {
        this.listener = listener;
        listener(this.state);
        return () => {
          this.listener = null;
        };
      }
    }

    const factory = () => {
      attempt += 1;
      return new FakeFailingThenWorkingEngine(attempt === 1);
    };

    render(<GuidedScenePlayer sceneId="transform-spike" createEngine={factory} />);

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("chunk load failed");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
    expect(attempt).toBe(2);
  });
});
