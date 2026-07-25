import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Regression cover for the Play→Pause race.
 *
 * `mount()` is async (it builds the project, then awaits `player.configure`),
 * but the player's Play button is enabled for that entire window. Mount used to
 * end with an unconditional `player.togglePlayback(false)`, so a Play pressed
 * mid-mount was silently reverted: the button flipped to "Pause" and then back
 * to "Play" a beat later with nothing having moved. It reproduced only on slow
 * loads, which is why it stayed invisible.
 *
 * These tests drive that window deterministically by gating `configure()` on a
 * promise the test resolves, so "the learner pressed Play while mounting" is an
 * ordering fact rather than a timing hope.
 */

/** Minimal ValueDispatcher stand-in: subscribers fire synchronously on set. */
class FakeDispatcher<T> {
  private listeners = new Set<(value: T) => void>();
  private value: T;
  constructor(value: T) {
    this.value = value;
  }
  get current(): T {
    return this.value;
  }
  set current(next: T) {
    this.value = next;
    for (const listener of this.listeners) listener(next);
  }
  get subscribable() {
    return {
      subscribe: (listener: (value: T) => void) => {
        this.listeners.add(listener);
        listener(this.value);
        return () => this.listeners.delete(listener);
      },
    };
  }
}

/** Hooks the test uses to hold `mount()` open at the configure() await. */
const configureGate = {
  release: () => {},
  reached: Promise.resolve(),
};

class FakePlayer {
  static last: FakePlayer | null = null;

  readonly playerState = new FakeDispatcher<{ paused: boolean; speed: number }>({
    paused: true,
    speed: 1,
  });
  private readonly durationDispatcher = new FakeDispatcher<number>(0);
  private readonly frameDispatcher = new FakeDispatcher<number>(0);
  /** Every togglePlayback(value) the engine issued, in order. */
  readonly toggles: boolean[] = [];
  seeks: number[] = [];
  resets = 0;

  constructor() {
    FakePlayer.last = this;
  }

  get onStateChanged() {
    return this.playerState.subscribable;
  }
  get onDurationChanged() {
    return this.durationDispatcher.subscribable;
  }
  get onFrameChanged() {
    return this.frameDispatcher.subscribable;
  }
  get onRender() {
    return { subscribe: () => () => {} };
  }
  get playback() {
    return { currentScene: null, previousScene: null };
  }

  async configure(): Promise<void> {
    await configureGate.reached;
  }

  togglePlayback(value: boolean): void {
    this.toggles.push(value);
    // Mirror the real guard: a toggle to the state already in effect is a no-op.
    if (value === this.playerState.current.paused) {
      this.playerState.current = { ...this.playerState.current, paused: !value };
    }
  }

  setSpeed(speed: number): void {
    this.playerState.current = { ...this.playerState.current, speed };
  }
  requestSeek(frame: number): void {
    this.seeks.push(frame);
  }
  requestReset(): void {
    this.resets += 1;
  }
  requestRender(): void {}
  deactivate(): void {}

  /** Test helper: publish a duration the way the real Player does. */
  emitDuration(frames: number): void {
    this.durationDispatcher.current = frames;
  }
}

class FakeStage {
  finalBuffer = document.createElement("canvas");
  configure(): void {}
  async render(): Promise<void> {}
}

vi.mock("@motion-canvas/core", () => ({
  Player: FakePlayer,
  Stage: FakeStage,
  MetaFile: class {},
  ValueDispatcher: FakeDispatcher,
  Vector2: class {
    x: number;
    y: number;
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  },
  bootstrap: () => ({
    meta: {
      getFullRenderingSettings: () => ({ fps: 60 }),
    },
    plugins: [],
  }),
}));

vi.mock("../../scenes/sceneDescriptions", () => ({
  getSceneDescription: async () => ({ name: "fake" }),
}));

const { MotionCanvasEngine } = await import("../MotionCanvasEngine");

/** Opens the configure() gate and returns a resolver for it. */
function holdMountOpen(): () => void {
  let release = () => {};
  configureGate.reached = new Promise<void>((resolve) => {
    release = resolve;
  });
  return release;
}

/** Lets any queued microtasks (the awaits inside mount) run to completion. */
async function flush(): Promise<void> {
  for (let i = 0; i < 8; i += 1) await Promise.resolve();
}

describe("MotionCanvasEngine mount/playback ordering", () => {
  beforeEach(() => {
    FakePlayer.last = null;
    configureGate.reached = Promise.resolve();
  });

  it("honors a Play pressed while mount() is still configuring", async () => {
    const releaseConfigure = holdMountOpen();
    const engine = new MotionCanvasEngine({ sceneId: "transform-spike" });
    const container = document.createElement("div");

    const mounted = engine.mount(container);
    await flush();

    // The learner presses Play in the window before configure() resolves.
    engine.play();

    releaseConfigure();
    await mounted;

    const player = FakePlayer.last!;
    // The regression: mount ended with togglePlayback(false), reverting Play.
    expect(player.toggles.at(-1)).toBe(true);
    expect(player.playerState.current.paused).toBe(false);
    expect(engine.getState().status).toBe("playing");

    engine.dispose();
  });

  it("still settles paused when no Play was pressed during mount", async () => {
    const releaseConfigure = holdMountOpen();
    const engine = new MotionCanvasEngine({ sceneId: "transform-spike" });

    const mounted = engine.mount(document.createElement("div"));
    await flush();
    releaseConfigure();
    await mounted;

    const player = FakePlayer.last!;
    expect(player.playerState.current.paused).toBe(true);
    expect(engine.getState().status).toBe("idle");

    engine.dispose();
  });

  it("lets a Pause during mount cancel an earlier Play (last intent wins)", async () => {
    const releaseConfigure = holdMountOpen();
    const engine = new MotionCanvasEngine({ sceneId: "transform-spike" });

    const mounted = engine.mount(document.createElement("div"));
    await flush();
    engine.play();
    engine.pause();

    releaseConfigure();
    await mounted;

    expect(FakePlayer.last!.playerState.current.paused).toBe(true);
    expect(engine.getState().status).toBe("paused");

    engine.dispose();
  });

  it("plays normally after mount completes", async () => {
    const engine = new MotionCanvasEngine({ sceneId: "transform-spike" });
    await engine.mount(document.createElement("div"));

    const player = FakePlayer.last!;
    expect(player.playerState.current.paused).toBe(true);

    engine.play();
    expect(player.playerState.current.paused).toBe(false);
    expect(engine.getState().status).toBe("playing");

    engine.pause();
    expect(player.playerState.current.paused).toBe(true);
    expect(engine.getState().status).toBe("paused");

    engine.dispose();
  });

  it("drops a mid-mount Play when reduced motion is on", async () => {
    const releaseConfigure = holdMountOpen();
    const engine = new MotionCanvasEngine({
      sceneId: "transform-spike",
      reducedMotion: true,
    });

    const mounted = engine.mount(document.createElement("div"));
    await flush();
    engine.play();
    // Duration arrives while mount is still open; reduced motion revokes the
    // pending intent so mount cannot resume playback behind the learner.
    FakePlayer.last!.emitDuration(600);

    releaseConfigure();
    await mounted;

    expect(FakePlayer.last!.playerState.current.paused).toBe(true);

    engine.dispose();
  });
});
