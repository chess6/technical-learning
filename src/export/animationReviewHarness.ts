/** Dev-server-only production-scene review API installed by exportHarness. */
import { authoringBeatContract } from "../guided-scenes/authoring/authoringBeatContracts";
import {
  resolveBeatCheckpoints,
  type SceneBeatContract,
} from "../guided-scenes/authoring/beatSpec";
import { analyzeReviewRun } from "../guided-scenes/authoring/reviewAnalysis";
import { runSceneGateSampling } from "../guided-scenes/validation/sceneGateRunner";

const FPS = 30;

export interface AnimationReviewDescription {
  sceneId: string;
  durationFrames: number;
  fps: number;
  checkpoints: ReturnType<typeof resolveBeatCheckpoints>;
  beats: SceneBeatContract["beats"];
  mathData: SceneBeatContract["mathData"];
  reducedMotionFrames: Array<{
    beatId: string;
    frame: number;
    source: "chapter-opening";
  }>;
  referenceComparisons: Array<{ benchmarkId: string; frames: number[] }>;
}

declare global {
  interface Window {
    __animationReviewReady?: boolean;
    __animationReviewApi?: {
      describe(sceneId: string): AnimationReviewDescription;
      analyze(
        sceneId: string,
        stride?: number,
      ): Promise<ReturnType<typeof analyzeReviewRun>>;
    };
  }
}

function describe(sceneId: string): AnimationReviewDescription {
  const contract = authoringBeatContract(sceneId);
  const checkpoints = resolveBeatCheckpoints(contract, FPS);
  return {
    sceneId,
    durationFrames: Math.max(...checkpoints.map(({ frame }) => frame)) + 1,
    fps: FPS,
    checkpoints,
    beats: contract.beats,
    mathData: contract.mathData,
    reducedMotionFrames: checkpoints
      .filter(({ checkpointId }) => checkpointId === "opening")
      .map(({ beatId, frame }) => ({
        beatId,
        frame,
        source: "chapter-opening" as const,
      })),
    // This pilot has no corresponding benchmark-lab replica. Keeping an
    // explicit empty list makes unsupported comparison evidence observable.
    referenceComparisons: [],
  };
}

async function analyze(
  sceneId: string,
  stride = 3,
): Promise<ReturnType<typeof analyzeReviewRun>> {
  const contract = authoringBeatContract(sceneId);
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  document.body.appendChild(container);
  try {
    const run = await runSceneGateSampling(sceneId, container, { stride });
    return analyzeReviewRun(
      contract,
      resolveBeatCheckpoints(contract, run.fps),
      run,
    );
  } finally {
    container.remove();
  }
}

export function installAnimationReviewHarness(): void {
  window.__animationReviewApi = { describe, analyze };
  window.__animationReviewReady = true;
}
