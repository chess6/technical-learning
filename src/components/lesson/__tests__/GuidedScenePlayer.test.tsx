import { describe, expect, it, beforeEach, vi } from "vitest";
import { StrictMode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GuidedScenePlayer } from "../GuidedScenePlayer";
import { SvgFallbackEngine } from "../../../guided-scenes/engine/SvgFallbackEngine";
import {
  guidedSceneDebug,
  instrumentation,
} from "../../../guided-scenes/engine/instrumentation";
import {
  createInitialState,
  type GuidedSceneEngine,
  type GuidedSceneEngineOptions,
  type GuidedSceneState,
  type GuidedSceneStep,
} from "../../../guided-scenes/engine/types";
import { resetPlaybackPreferences } from "../playbackPreferences";
import { getSceneMeta } from "../../../guided-scenes/scenes/sceneMeta";

function makeFactory() {
  return (options: GuidedSceneEngineOptions) => new SvgFallbackEngine(options);
}

/**
 * Deterministic scripted engine for control-surface tests: records calls,
 * reports a fixed duration, and lets tests drive state transitions directly.
 */
class ScriptedEngine implements GuidedSceneEngine {
  readonly steps: GuidedSceneStep[];
  readonly calls: string[] = [];
  private state: GuidedSceneState;
  private listeners = new Set<(state: GuidedSceneState) => void>();

  constructor(sceneId: string) {
    this.steps = getSceneMeta(sceneId).steps;
    this.state = { ...createInitialState(true), duration: 51 };
  }

  mount(): void {}
  play(): void {
    this.calls.push("play");
    this.patch({ status: "playing" });
  }
  pause(): void {
    this.calls.push("pause");
    this.patch({ status: "paused" });
  }
  reset(): void {
    this.calls.push("reset");
    this.patch({ status: "idle", progress: 0 });
  }
  seek(progress: number): void {
    this.calls.push(`seek:${progress.toFixed(3)}`);
    this.patch({ progress: Math.max(0, Math.min(1, progress)) });
  }
  setSpeed(speed: number): void {
    this.calls.push(`speed:${speed}`);
    this.patch({ speed });
  }
  resize(): void {}
  dispose(): void {}
  getState(): GuidedSceneState {
    return this.state;
  }
  subscribe(listener: (state: GuidedSceneState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }
  patch(patch: Partial<GuidedSceneState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener(this.state);
  }
}

function renderScripted(sceneId = "red-black-encoding") {
  let engine: ScriptedEngine | null = null;
  const factory = () => {
    engine = new ScriptedEngine(sceneId);
    return engine;
  };
  const view = render(
    <GuidedScenePlayer
      sceneId={sceneId}
      createEngine={factory}
      autoplayEnabled={false}
    />,
  );
  return { view, engine: engine! as ScriptedEngine };
}

describe("GuidedScenePlayer lifecycle", () => {
  beforeEach(() => {
    instrumentation.reset();
    resetPlaybackPreferences();
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
          speed: 1,
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
      setSpeed(): void {}
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

describe("GuidedScenePlayer playback speed", () => {
  beforeEach(() => {
    instrumentation.reset();
    resetPlaybackPreferences();
  });

  it("offers 0.5/1/1.5/2× and forwards the choice to the engine", async () => {
    const { engine } = renderScripted();

    const group = screen.getByRole("group", { name: "Playback speed" });
    const buttons = Array.from(group.querySelectorAll("button"));
    expect(buttons.map((button) => button.textContent)).toEqual([
      "0.5×",
      "1×",
      "1.5×",
      "2×",
    ]);

    fireEvent.click(screen.getByRole("button", { name: "1.5×" }));
    await waitFor(() => {
      expect(engine.calls).toContain("speed:1.5");
    });
    expect(
      screen.getByRole("button", { name: "1.5×" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("preserves the chosen speed across remounts (session preference)", async () => {
    const first = renderScripted();
    fireEvent.click(screen.getByRole("button", { name: "2×" }));
    await waitFor(() => expect(first.engine.calls).toContain("speed:2"));
    first.view.unmount();

    const second = renderScripted();
    await waitFor(() => {
      expect(second.engine.calls).toContain("speed:2");
    });
    expect(
      screen.getByRole("button", { name: "2×" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });
});

describe("GuidedScenePlayer keyboard controls", () => {
  beforeEach(() => {
    instrumentation.reset();
    resetPlaybackPreferences();
  });

  it("K toggles play/pause; arrows seek by 5s; [ and ] jump ideas", async () => {
    const { engine } = renderScripted();
    const figure = screen.getByRole("region", { name: "Guided animation" });

    fireEvent.keyDown(figure, { key: "k" });
    await waitFor(() => expect(engine.calls).toContain("play"));
    fireEvent.keyDown(figure, { key: "k" });
    await waitFor(() => expect(engine.calls).toContain("pause"));

    // Duration is 51s → 5s = 0.098 normalized.
    fireEvent.keyDown(figure, { key: "ArrowRight" });
    await waitFor(() =>
      expect(engine.calls.some((call) => call.startsWith("seek:0.098"))).toBe(
        true,
      ),
    );

    // "]" jumps to the next major idea; from t=0 that is majorSteps[1].
    const majorSteps = getSceneMeta("red-black-encoding").majorSteps;
    engine.patch({ progress: 0 });
    await waitFor(() =>
      expect(figure.getAttribute("data-major-step")).toBe(majorSteps[0]!.id),
    );
    fireEvent.keyDown(figure, { key: "]" });
    await waitFor(() =>
      expect(
        engine.calls.some(
          (call) => call === `seek:${majorSteps[1]!.at.toFixed(3)}`,
        ),
      ).toBe(true),
    );
  });

  it("does not intercept shortcuts while typing in an input", () => {
    const { engine } = renderScripted();
    const scrubber = screen.getByLabelText("Animation timeline");

    // The scrubber is an <input>; typing-context guard must skip it.
    fireEvent.keyDown(scrubber, { key: "k" });
    expect(engine.calls).not.toContain("play");
  });
});

describe("GuidedScenePlayer chapters", () => {
  beforeEach(() => {
    instrumentation.reset();
    resetPlaybackPreferences();
  });

  it("renders a timeline marker per major step and marks the active one", async () => {
    const { engine, view } = renderScripted();
    const majorSteps = getSceneMeta("red-black-encoding").majorSteps;

    const markers = view.container.querySelectorAll(
      ".guided-scene-player__chapter-marker",
    );
    expect(markers.length).toBe(majorSteps.length);

    // Drive progress into the middle of the timeline; the active marker moves.
    engine.patch({ progress: majorSteps[3]!.at + 0.01 });
    await waitFor(() => {
      const active = view.container.querySelectorAll(
        '.guided-scene-player__chapter-marker[data-active="true"]',
      );
      expect(active.length).toBe(1);
    });
  });

  it("shows the authored chapter summary for the active chapter", async () => {
    const { engine } = renderScripted();
    const majorSteps = getSceneMeta("red-black-encoding").majorSteps;
    const withSummary = majorSteps.find((step) => step.summary);
    expect(withSummary?.summary).toBeTruthy();

    engine.patch({ progress: withSummary!.at + 0.01 });
    await waitFor(() => {
      expect(screen.getByText(withSummary!.summary!)).toBeTruthy();
    });
  });

  it("keeps working for scenes without chapter summaries", () => {
    const { view } = renderScripted("transform-spike");
    // No summaries authored → no summary line, but markers still render.
    expect(
      view.container.querySelector(".guided-scene-player__stage-summary"),
    ).toBeNull();
    expect(
      view.container.querySelectorAll(".guided-scene-player__chapter-marker")
        .length,
    ).toBe(getSceneMeta("transform-spike").majorSteps.length);
  });
});

describe("GuidedScenePlayer theater mode", () => {
  beforeEach(() => {
    instrumentation.reset();
    resetPlaybackPreferences();
  });

  it("toggles via the button and exits with Escape without remounting", async () => {
    const { view } = renderScripted();
    const before = instrumentation.snapshot();

    fireEvent.click(screen.getByRole("button", { name: "Theater" }));
    const figure = screen.getByRole("region", { name: "Guided animation" });
    expect(figure.getAttribute("data-theater")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");

    // Theater listens document-wide.
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(figure.getAttribute("data-theater")).toBeNull();
    });
    expect(document.body.style.overflow).toBe("");

    // Same engine throughout — no dispose/recreate.
    const after = instrumentation.snapshot();
    expect(after.created).toBe(before.created);
    expect(after.disposals).toBe(before.disposals);
    view.unmount();
  });

  it("T toggles theater from the keyboard", async () => {
    renderScripted();
    const figure = screen.getByRole("region", { name: "Guided animation" });
    fireEvent.keyDown(figure, { key: "t" });
    await waitFor(() => expect(figure.getAttribute("data-theater")).toBe("true"));
    fireEvent.keyDown(document, { key: "t" });
    await waitFor(() => expect(figure.getAttribute("data-theater")).toBeNull());
  });
});

describe("GuidedScenePlayer fullscreen", () => {
  beforeEach(() => {
    instrumentation.reset();
    resetPlaybackPreferences();
  });

  it("requests fullscreen on the figure when supported", async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const original = HTMLElement.prototype.requestFullscreen;
    HTMLElement.prototype.requestFullscreen = requestFullscreen;
    try {
      renderScripted();
      const button = await screen.findByRole("button", { name: "Full screen" });
      fireEvent.click(button);
      expect(requestFullscreen).toHaveBeenCalledTimes(1);
    } finally {
      if (original) {
        HTMLElement.prototype.requestFullscreen = original;
      } else {
        delete (HTMLElement.prototype as { requestFullscreen?: unknown })
          .requestFullscreen;
      }
    }
  });

  it("hides the fullscreen control when the API is unavailable", () => {
    renderScripted();
    expect(screen.queryByRole("button", { name: "Full screen" })).toBeNull();
  });
});
