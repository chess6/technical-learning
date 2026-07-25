import {
  MetaFile,
  Player,
  Stage,
  ValueDispatcher,
  Vector2,
  bootstrap,
  type FullSceneDescription,
  type Project,
  type Versions,
} from "@motion-canvas/core";
import { AbstractGuidedSceneEngine } from "./AbstractEngine";
import { instrumentation } from "./instrumentation";
import type {
  GuidedSceneEngineOptions,
  GuidedSceneStep,
} from "./types";
import { getSceneMeta } from "../scenes/sceneMeta";
import { getSceneDescription } from "../scenes/sceneDescriptions";

const MC_VERSION = "3.17.2";

const VERSIONS: Versions = {
  core: MC_VERSION,
  two: MC_VERSION,
  ui: null,
  vitePlugin: null,
};

/**
 * Build a runnable Motion Canvas project at runtime, without the Vite plugin.
 *
 * The plugin's `?scene` transform normally promotes a scene description to a
 * FullSceneDescription and calls bootstrap() in generated code. We do the same
 * here: makeScene2D() supplies klass/config/meta, the Player constructor fills
 * the remaining runtime fields (playback, logger, size, timeEventsClass,
 * sharedWebGLContext), and bootstrap() assembles the project + metadata.
 *
 * `bootstrap` and `MetaFile` are marked @internal by Motion Canvas; this is the
 * one unavoidable use of internal APIs required for plugin-free embedding (see
 * docs/engineering/decisions/001-motion-canvas-runtime.md). They are used only for construction, never for
 * lifecycle instrumentation.
 *
 * Exported for the dev-only video-export harness (src/export/exportHarness.ts),
 * which needs the same plugin-free project construction plus a custom exporter
 * plugin. `plugins` stays empty for normal in-app playback.
 */
export async function buildGuidedProject(
  sceneId: string,
  plugins: Project["plugins"] = [],
): Promise<Project> {
  const name = `guided-${sceneId}`;
  const description = {
    ...((await getSceneDescription(sceneId)) as object),
    name,
  } as unknown as FullSceneDescription;
  // The vite plugin's generated `?scene` module assigns onReplaced so HMR and
  // the Renderer can reload scenes. Player only optionally chains it, but
  // Renderer.reloadScenes dereferences it — mirror the generated code here.
  description.onReplaced ??= new ValueDispatcher(description);

  return bootstrap(
    name,
    VERSIONS,
    plugins,
    { name, scenes: [description] },
    new MetaFile(name, false),
    new MetaFile(`${name}-settings`, false),
  );
}

export class MotionCanvasEngine extends AbstractGuidedSceneEngine {
  readonly steps: GuidedSceneStep[];

  private readonly sceneId: string;
  private readonly reducedMotion: boolean;
  private readonly sceneSize: { width: number; height: number };
  private readonly ariaLabel: string;
  private stage: Stage | null = null;
  private player: Player | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private readonly unsubscribers: Array<() => void> = [];
  private loopActive = false;

  private durationFrames = 0;
  private fps = 60;
  private paused = true;
  private hasPlayed = false;
  private reducedMotionApplied = false;
  /**
   * The learner's latest playback intent, tracked independently of the Player
   * because `mount()` is async and the Play button is live throughout it.
   * `mount()` resolves *to* this value instead of force-pausing, so a Play
   * pressed mid-mount is honored rather than silently reverted.
   */
  private playRequested = false;
  /** True once mount() has fully configured the Player. */
  private ready = false;

  constructor(options: GuidedSceneEngineOptions) {
    super(true);
    this.sceneId = options.sceneId ?? "matrix-transformations";
    this.reducedMotion = options.reducedMotion ?? false;
    const meta = getSceneMeta(this.sceneId);
    this.steps = meta.steps;
    this.sceneSize = meta.size;
    this.ariaLabel = meta.ariaLabel;
  }

  async mount(container: HTMLElement): Promise<void> {
    if (this.isDisposed) return;

    let project: Project;
    try {
      project = await buildGuidedProject(this.sceneId);
    } catch (error) {
      if (this.isDisposed) return;
      this.setState({
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Failed to load the guided animation.",
      });
      return;
    }
    // The scene module load above is async; the container may already have
    // been unmounted (fast navigation) by the time it resolves.
    if (this.isDisposed) return;

    const stage = new Stage();
    const player = new Player(project);
    // The Player constructor activates itself, starting the update loop.
    this.loopActive = true;
    instrumentation.loopStarted();

    this.stage = stage;
    this.player = player;

    const size = new Vector2(this.sceneSize.width, this.sceneSize.height);
    const rendering = project.meta.getFullRenderingSettings();
    this.fps = rendering.fps || 60;

    const settings = { ...rendering, size, resolutionScale: 1 };
    stage.configure(settings);

    const canvas = stage.finalBuffer;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", this.ariaLabel);
    canvas.dataset.sceneWidth = String(this.sceneSize.width);
    canvas.dataset.sceneHeight = String(this.sceneSize.height);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.objectFit = "contain";
    canvas.style.display = "block";
    this.canvas = canvas;
    container.appendChild(canvas);

    this.subscribe_(player.onRender.subscribe(this.handleRender));
    this.subscribe_(player.onFrameChanged.subscribe(this.handleFrame));
    this.subscribe_(player.onDurationChanged.subscribe(this.handleDuration));
    this.subscribe_(player.onStateChanged.subscribe(this.handleState));

    await player.configure(settings);
    if (this.isDisposed) return;

    // Resolve to the learner's intent, not unconditionally to paused. The Play
    // button is enabled for the whole of this async mount, so an unconditional
    // togglePlayback(false) here raced every early Play: the button flipped to
    // "Pause" and then back to "Play" a beat later with nothing having moved.
    this.ready = true;
    player.togglePlayback(this.playRequested);
    this.paused = !this.playRequested;

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.player?.requestRender();
      });
      this.resizeObserver.observe(container);
      instrumentation.resourceAcquired();
    }

    instrumentation.registerMount();
    this.recompute();
  }

  play(): void {
    if (this.isDisposed) return;
    this.hasPlayed = true;
    this.playRequested = true;
    // Before mount() finishes, the Player is absent or still being configured;
    // recording the intent is the whole handling — mount() applies it.
    if (!this.ready || !this.player) return;
    // Replaying from the end should start over.
    if (this.state.progress >= 0.999) {
      this.player.requestReset();
    }
    this.player.togglePlayback(true);
  }

  pause(): void {
    if (this.isDisposed) return;
    this.playRequested = false;
    if (!this.ready || !this.player) return;
    this.player.togglePlayback(false);
  }

  reset(): void {
    if (this.isDisposed) return;
    this.hasPlayed = false;
    this.playRequested = false;
    if (!this.ready || !this.player) return;
    this.player.togglePlayback(false);
    this.player.requestReset();
  }

  seek(progress: number): void {
    if (this.isDisposed || !this.player || this.durationFrames <= 0) return;
    const clamped = Math.max(0, Math.min(1, progress));
    this.hasPlayed = true;
    this.player.requestSeek(Math.round(clamped * this.durationFrames));
  }

  setSpeed(speed: number): void {
    if (this.isDisposed || !this.player) return;
    const clamped = Math.max(0.25, Math.min(4, speed));
    // Speed scales only the real-time update loop; frames, duration, and
    // normalized progress stay in authored time, so seeking and step markers
    // are unaffected. onStateChanged echoes the value back into engine state.
    this.player.setSpeed(clamped);
    this.setState({ speed: clamped });
  }

  resize(): void {
    this.player?.requestRender();
  }

  protected onDispose(): void {
    this.ready = false;
    this.playRequested = false;
    for (const unsubscribe of this.unsubscribers.splice(0)) {
      unsubscribe();
      instrumentation.resourceReleased();
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
      instrumentation.resourceReleased();
    }

    if (this.player) {
      this.player.togglePlayback(false);
      this.player.deactivate();
    }
    if (this.loopActive) {
      this.loopActive = false;
      instrumentation.loopStopped();
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.player = null;
    this.stage = null;
    this.canvas = null;
  }

  private subscribe_(unsubscribe: () => void): void {
    this.unsubscribers.push(unsubscribe);
    instrumentation.resourceAcquired();
  }

  private handleRender = async (): Promise<void> => {
    if (!this.stage || !this.player) return;
    await this.stage.render(
      this.player.playback.currentScene,
      this.player.playback.previousScene,
    );
  };

  private handleFrame = (frame: number): void => {
    if (this.durationFrames <= 0) return;
    this.updateProgress(frame / this.durationFrames);
  };

  private handleDuration = (duration: number): void => {
    this.durationFrames = duration;
    const seconds = duration > 0 ? duration / this.fps : null;
    this.setState({ duration: seconds });

    if (this.reducedMotion && !this.reducedMotionApplied && duration > 0) {
      this.reducedMotionApplied = true;
      this.hasPlayed = false;
      // Reduced motion has no continuous playback, so it also revokes any
      // pending play intent — otherwise mount() would honor it.
      this.playRequested = false;
      this.player?.togglePlayback(false);
      // Stay on the first frame; the player seeks to the first major idea.
      this.player?.requestSeek(0);
    }
  };

  private handleState = (playerState: { paused: boolean; speed?: number }): void => {
    this.paused = playerState.paused;
    if (typeof playerState.speed === "number" && playerState.speed > 0) {
      this.setState({ speed: playerState.speed });
    }
    this.recompute();
  };

  private updateProgress(progress: number): void {
    const clamped = Math.max(0, Math.min(1, progress));
    this.setState({
      progress: clamped,
      currentStep: this.stepForProgress(clamped),
      status: this.computeStatus(clamped),
    });
  }

  private recompute(): void {
    this.updateProgress(this.state.progress);
  }

  private computeStatus(progress: number): typeof this.state.status {
    if (this.state.error) return "error";
    if (!this.paused) return "playing";
    if (progress >= 0.999) return "complete";
    if (progress <= 0.001 && !this.hasPlayed) return "idle";
    return "paused";
  }
}
