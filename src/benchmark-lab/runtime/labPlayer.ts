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
import { LAB_STAGE, REPLICA_FPS } from "../manifests";
import { getReplicaSceneDescription } from "../replicas/replicaScenes";

/**
 * Laboratory runtime: builds a plugin-free Motion Canvas project around a
 * benchmark REPLICA scene (mirroring buildGuidedProject's construction — see
 * docs/engineering/decisions/001-motion-canvas-runtime.md for why bootstrap/
 * MetaFile are used), and wraps Player+Stage in a frame-accurate controller.
 *
 * Deliberately separate from the guided-scene engine: replicas are not in
 * SCENE_META and must never be reachable by the learner-facing player.
 */

const MC_VERSION = "3.17.2";
const VERSIONS: Versions = {
  core: MC_VERSION,
  two: MC_VERSION,
  ui: null,
  vitePlugin: null,
};

export async function buildLabProject(
  benchmarkId: string,
  plugins: Project["plugins"] = [],
): Promise<Project> {
  const name = `benchmark-${benchmarkId}`;
  const description = {
    ...((await getReplicaSceneDescription(benchmarkId)) as object),
    name,
  } as unknown as FullSceneDescription;
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

export interface LabPlayerHandle {
  canvas: HTMLCanvasElement;
  /** Duration in frames at REPLICA_FPS (known after the first recalculation). */
  durationFrames(): number;
  currentFrame(): number;
  /** Seek to an absolute frame; render is asynchronous — use onFrame. */
  seekToFrame(frame: number): void;
  seekToTime(seconds: number): void;
  play(): void;
  pause(): void;
  setSpeed(speed: number): void;
  /** Subscribe to rendered-frame changes. Returns unsubscribe. */
  onFrame(listener: (frame: number) => void): () => void;
  /** Resolves after the player has rendered a frame >= the requested one. */
  dispose(): void;
}

/**
 * Mount a replica into a container. The returned handle exposes frame-level
 * control (the laboratory transport drives BOTH the replica and the reference
 * frame strip from these callbacks).
 */
export async function mountLabPlayer(
  benchmarkId: string,
  container: HTMLElement,
): Promise<LabPlayerHandle> {
  const project = await buildLabProject(benchmarkId);
  const stage = new Stage();
  const player = new Player(project);

  const size = new Vector2(LAB_STAGE.width, LAB_STAGE.height);
  const rendering = project.meta.getFullRenderingSettings();
  const settings = { ...rendering, fps: REPLICA_FPS, size, resolutionScale: 1 };
  stage.configure(settings);

  const canvas = stage.finalBuffer;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.objectFit = "contain";
  canvas.style.display = "block";
  canvas.dataset.benchmarkId = benchmarkId;
  container.appendChild(canvas);

  let duration = 0;
  let frame = 0;
  const frameListeners = new Set<(frame: number) => void>();

  const unsubscribers: Array<() => void> = [
    player.onRender.subscribe(async () => {
      await stage.render(
        player.playback.currentScene,
        player.playback.previousScene,
      );
    }),
    player.onDurationChanged.subscribe((value) => {
      duration = value;
    }),
    player.onFrameChanged.subscribe((value) => {
      frame = value;
      for (const listener of frameListeners) listener(value);
    }),
  ];

  await player.configure(settings);
  player.togglePlayback(false);

  return {
    canvas,
    durationFrames: () => duration,
    currentFrame: () => frame,
    seekToFrame: (target) => {
      player.requestSeek(Math.max(0, Math.round(target)));
    },
    seekToTime: (seconds) => {
      player.requestSeek(Math.max(0, Math.round(seconds * REPLICA_FPS)));
    },
    play: () => player.togglePlayback(true),
    pause: () => player.togglePlayback(false),
    setSpeed: (speed) => player.setSpeed(speed),
    onFrame: (listener) => {
      frameListeners.add(listener);
      return () => frameListeners.delete(listener);
    },
    dispose: () => {
      for (const unsubscribe of unsubscribers.splice(0)) unsubscribe();
      player.togglePlayback(false);
      player.deactivate();
      frameListeners.clear();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    },
  };
}

/** Await the next rendered frame at or beyond `target` (with a timeout). */
export function waitForFrame(
  handle: LabPlayerHandle,
  target: number,
  timeoutMs = 4000,
): Promise<number> {
  return new Promise((resolve, reject) => {
    if (handle.currentFrame() === Math.round(target)) {
      resolve(handle.currentFrame());
      return;
    }
    const timer = setTimeout(() => {
      unsubscribe();
      reject(new Error(`Timed out waiting for frame ${target}`));
    }, timeoutMs);
    const unsubscribe = handle.onFrame((frame) => {
      if (frame === Math.round(target)) {
        clearTimeout(timer);
        unsubscribe();
        resolve(frame);
      }
    });
  });
}
