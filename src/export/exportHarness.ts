/**
 * Dev-server-only video-export harness, served at /export-harness.html.
 *
 * Drives Motion Canvas's own `Renderer` (the editor's export path) over a
 * guided scene and hands each rendered frame to the Node CLI
 * (scripts/export-scene.mjs) through a window-level frame queue. The stock
 * ImageExporter needs the Motion Canvas Vite plugin's HMR channel, which this
 * repo cannot use (see docs/engineering/decisions/001-motion-canvas-runtime.md),
 * so a minimal in-page exporter captures `canvas.toDataURL` instead.
 *
 * This page is not part of the production build (vite build only bundles
 * index.html) and nothing in the app imports it.
 */

import {
  ObjectMetaField,
  Renderer,
  RendererResult,
  Vector2,
  makePlugin,
  type Exporter,
  type Project,
  type RendererSettings,
} from "@motion-canvas/core";
import { buildGuidedProject } from "../guided-scenes/engine/MotionCanvasEngine";
import { SCENE_META, getSceneMeta } from "../guided-scenes/scenes/sceneMeta";
import { buildLabProject } from "../benchmark-lab/runtime/labPlayer";
import { listReplicaIds } from "../benchmark-lab/replicas/replicaScenes";
import { LAB_STAGE } from "../benchmark-lab/manifests";
import { installAnimationReviewHarness } from "./animationReviewHarness";

/**
 * Benchmark replicas are exportable through the same harness under a
 * "benchmark:" id prefix (dev-only page; replicas never enter SCENE_META).
 */
const BENCHMARK_PREFIX = "benchmark:";

type QueuedFrame = { frame: number; data: string };

type ExportStatus = {
  state: "idle" | "rendering" | "done" | "error";
  totalFrames: number | null;
  handledFrames: number;
  error: string | null;
  result: string | null;
};

declare global {
  interface Window {
    __exportReady?: boolean;
    __exportStatus?: ExportStatus;
    __exportQueue?: QueuedFrame[];
    __exportApi?: {
      listScenes(): string[];
      start(options: {
        sceneId: string;
        fps: number;
        resolutionScale: number;
      }): Promise<void>;
    };
  }
}

const status: ExportStatus = {
  state: "idle",
  totalFrames: null,
  handledFrames: 0,
  error: null,
  result: null,
};

window.__exportStatus = status;
window.__exportQueue = [];

function buildCaptureMeta() {
  return new ObjectMetaField("canvas capture", {});
}

/** Captures each rendered frame as a PNG data URL into the window queue. */
class CanvasCaptureExporter implements Exporter {
  static readonly id = "app/canvas-capture";
  static readonly displayName = "Canvas capture";

  static meta(): ReturnType<typeof buildCaptureMeta> {
    return buildCaptureMeta();
  }

  static async create(): Promise<CanvasCaptureExporter> {
    return new CanvasCaptureExporter();
  }

  async handleFrame(canvas: HTMLCanvasElement, frame: number): Promise<void> {
    window.__exportQueue!.push({
      frame,
      data: canvas.toDataURL("image/png"),
    });
    status.handledFrames += 1;
    // Bound in-page memory: wait for the CLI to drain the queue.
    while (window.__exportQueue!.length > 120) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}

const capturePlugin = makePlugin({
  name: "app/canvas-capture-plugin",
  exporters() {
    return [CanvasCaptureExporter];
  },
});

async function startExport(options: {
  sceneId: string;
  fps: number;
  resolutionScale: number;
}): Promise<void> {
  const { sceneId, fps, resolutionScale } = options;
  const isBenchmark = sceneId.startsWith(BENCHMARK_PREFIX);
  const size = isBenchmark
    ? LAB_STAGE
    : getSceneMeta(sceneId).size;
  status.state = "rendering";
  status.error = null;
  status.handledFrames = 0;

  let project: Project;
  try {
    project = isBenchmark
      ? await buildLabProject(sceneId.slice(BENCHMARK_PREFIX.length), [
          capturePlugin(),
        ])
      : await buildGuidedProject(sceneId, [capturePlugin()]);
  } catch (error) {
    status.state = "error";
    status.error = error instanceof Error ? error.message : String(error);
    return;
  }

  // Renderer routes failures through the project logger; mirror them into the
  // status object so the CLI can report a real cause.
  project.logger.onLogged.subscribe((payload) => {
    if (payload.level === "error") {
      status.error = [payload.message, payload.stack ?? ""].join("\n").trim();
      console.error("[export]", payload.message, payload.stack ?? "");
    }
  });

  const renderer = new Renderer(project);
  document.body.appendChild(renderer.stage.finalBuffer);

  const rendering = project.meta.getFullRenderingSettings();
  const settings: RendererSettings = {
    ...rendering,
    name: `guided-${sceneId}`,
    fps,
    range: [0, Infinity],
    size: new Vector2(size.width, size.height),
    resolutionScale,
    exporter: { name: CanvasCaptureExporter.id, options: {} },
  };

  renderer.onFinished.subscribe((result) => {
    status.result = RendererResult[result] ?? String(result);
    status.state = result === RendererResult.Success ? "done" : "error";
    if (result !== RendererResult.Success && !status.error) {
      status.error = `Renderer finished with ${status.result}`;
    }
  });

  await renderer.render(settings);
}

window.__exportApi = {
  listScenes: () => [
    ...Object.keys(SCENE_META),
    ...listReplicaIds().map((id) => `${BENCHMARK_PREFIX}${id}`),
  ],
  start: startExport,
};
installAnimationReviewHarness();
window.__exportReady = true;
