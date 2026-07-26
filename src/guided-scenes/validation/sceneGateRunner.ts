import {
  MetaFile,
  Player,
  Stage,
  Vector2,
  type Project,
} from "@motion-canvas/core";
import { buildGuidedProject } from "../engine/MotionCanvasEngine";
import { getSceneMeta } from "../scenes/sceneMeta";
import {
  SCENE_BEATS,
  SCENE_SEGMENTS,
} from "../scenes/sceneTimings";
import { SEGMENT_OVERRUNS, resetSegmentOverruns } from "../scenes/sceneKit";
import { intentWindowsForSegment } from "../scenes/beatIntents";
import { hashCanvas, sampleSceneGraphDetailed } from "./sceneGraphSampler";
import { type SceneGateRun, type SceneSeekRecord } from "./gateTypes";

/**
 * Browser-side driver that mounts a production guided scene off-screen,
 * steps it frame by frame, and produces the `SceneGateRun` the pure hard
 * gates consume.
 *
 * Deliberately independent of the learner-facing player and of the benchmark
 * laboratory: the gates must be runnable against production scenes on their
 * own, which is what `e2e/guided-scene-hard-gates.spec.ts` does.
 */

/** MetaFile is only needed to satisfy the Project shape; see buildGuidedProject. */
void MetaFile;

export interface SceneGateOptions {
  /** Sampling stride in frames (default 3 ≈ 10 Hz at 30 fps). */
  stride?: number;
  onProgress?: (done: number, total: number) => void;
}

function segmentWindows(sceneId: string) {
  const segments = SCENE_SEGMENTS[sceneId] ?? [];
  const beats = SCENE_BEATS[sceneId] ?? {};
  let cursor = 0;
  return segments.map((segment) => {
    const start = cursor;
    cursor += segment.duration;
    return {
      id: segment.id,
      start,
      end: cursor,
      beats: intentWindowsForSegment(
        sceneId,
        segment,
        start,
        beats[segment.id] ?? {},
      ),
    };
  });
}

async function nextTask(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Mount `sceneId`, sample it, and tear everything down again.
 *
 * The container is supplied by the caller so the canvas is attached to the
 * document (Motion Canvas needs a live canvas to render into).
 */
export async function runSceneGateSampling(
  sceneId: string,
  container: HTMLElement,
  options: SceneGateOptions = {},
): Promise<SceneGateRun> {
  const stride = options.stride ?? 3;
  const meta = getSceneMeta(sceneId);
  resetSegmentOverruns();

  let project: Project;
  project = await buildGuidedProject(sceneId);

  const stage = new Stage();
  const player = new Player(project);
  const rendering = project.meta.getFullRenderingSettings();
  const fps = rendering.fps || 30;
  const settings = {
    ...rendering,
    size: new Vector2(meta.size.width, meta.size.height),
    resolutionScale: 1,
  };
  stage.configure(settings);

  const canvas = stage.finalBuffer;
  container.appendChild(canvas);

  let durationFrames = 0;
  let currentFrame = 0;
  const frameListeners = new Set<(frame: number) => void>();

  const unsubscribers = [
    player.onRender.subscribe(async () => {
      await stage.render(
        player.playback.currentScene,
        player.playback.previousScene,
      );
    }),
    player.onDurationChanged.subscribe((value) => {
      durationFrames = value;
    }),
    player.onFrameChanged.subscribe((value) => {
      currentFrame = value;
      for (const listener of frameListeners) listener(value);
    }),
  ];

  await player.configure(settings);
  player.togglePlayback(false);

  const waitForFrame = (target: number): Promise<void> =>
    new Promise((resolve, reject) => {
      if (currentFrame === target) {
        resolve();
        return;
      }
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`timed out seeking ${sceneId} to frame ${target}`));
      }, 8000);
      const listener = (frame: number) => {
        if (frame !== target) return;
        cleanup();
        resolve();
      };
      const cleanup = () => {
        clearTimeout(timer);
        frameListeners.delete(listener);
      };
      frameListeners.add(listener);
    });

  /**
   * The Player computes its duration asynchronously, several ticks after
   * `configure` resolves. Sampling before it lands silently produces ZERO
   * frames — and a gate run over zero frames reports "no findings", which is
   * a pass for a scene nobody looked at. Block until the duration is real.
   */
  const waitForDuration = async (): Promise<void> => {
    const deadline = Date.now() + 10_000;
    while (durationFrames <= 0) {
      if (Date.now() > deadline) {
        throw new Error(`${sceneId}: duration never became known`);
      }
      await nextTask();
    }
  };

  const seekAndSettle = async (frame: number): Promise<void> => {
    const clamped = Math.max(0, Math.min(frame, Math.max(0, durationFrames - 1)));
    player.requestSeek(clamped);
    await waitForFrame(clamped);
    // Let the render subscription flush to the canvas before measuring.
    await nextTask();
    await nextTask();
  };

  const snapshot = () => sampleSceneGraphDetailed(player.playback.currentScene);

  try {
    await waitForDuration();
    await seekAndSettle(0);
    const total = Math.max(1, Math.ceil(durationFrames / stride));

    const frames: SceneGateRun["frames"] = [];
    for (let frame = 0, i = 0; frame < durationFrames; frame += stride, i += 1) {
      await seekAndSettle(frame);
      const sampled = snapshot();
      frames.push({ frame, time: frame / fps, ...sampled });
      options.onProgress?.(i + 1, total);
    }

    // Seek determinism: reach each segment's midpoint from both directions.
    const segments = segmentWindows(sceneId);
    const seekRecords: SceneSeekRecord[] = [];
    for (const segment of segments) {
      const midpoint = Math.min(
        durationFrames - 1,
        Math.round(((segment.start + segment.end) / 2) * fps),
      );
      await seekAndSettle(0);
      await seekAndSettle(midpoint);
      const hashFromStart = hashCanvas(canvas);
      const fromStart = snapshot();
      await seekAndSettle(durationFrames - 1);
      await seekAndSettle(midpoint);
      const hashFromEnd = hashCanvas(canvas);
      const fromEnd = snapshot();
      seekRecords.push({
        segmentId: segment.id,
        frame: midpoint,
        hashFromStart,
        hashFromEnd,
        nodesFromStart: fromStart.nodes,
        nodesFromEnd: fromEnd.nodes,
        unmeasuredFromStart: fromStart.unmeasured,
        unmeasuredFromEnd: fromEnd.unmeasured,
      });
    }

    // Play the whole timeline once so segment bodies run start-to-finish and
    // any overrun is recorded (seeking alone re-runs from zero each time).
    await seekAndSettle(durationFrames - 1);

    return {
      sceneId,
      fps,
      stride,
      durationFrames,
      frames,
      segments,
      seekRecords,
      overruns: SEGMENT_OVERRUNS.map((overrun) => ({ ...overrun })),
    };
  } finally {
    for (const unsubscribe of unsubscribers) unsubscribe();
    player.togglePlayback(false);
    player.deactivate();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }
}
