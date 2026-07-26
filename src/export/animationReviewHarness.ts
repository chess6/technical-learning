/** Dev-server-only production-scene review API installed by exportHarness. */
import {MATRIX_TRANSFORMATION_BEAT_CONTRACT} from "../guided-scenes/authoring/matrixTransformationBeatSpec";
import {resolveBeatCheckpoints} from "../guided-scenes/authoring/beatSpec";
import {analyzeReviewRun} from "../guided-scenes/authoring/reviewAnalysis";
import {runSceneGateSampling} from "../guided-scenes/validation/sceneGateRunner";

const PILOT_SCENE = "matrix-transformations";
const FPS = 30;

export interface AnimationReviewDescription {
  sceneId: string;
  fps: number;
  checkpoints: ReturnType<typeof resolveBeatCheckpoints>;
  beats: Array<{
    id: string;
    purpose: string;
    chapter: {id: string; title: string; summary?: string};
    prediction?: {question: string; revealBeat: string};
  }>;
  reducedMotionFrames: Array<{beatId: string; frame: number; source: "chapter-opening"}>;
  referenceComparisons: Array<{benchmarkId: string; frames: number[]}>;
}

declare global {
  interface Window {
    __animationReviewReady?: boolean;
    __animationReviewApi?: {
      describe(sceneId: string): AnimationReviewDescription;
      analyze(sceneId: string, stride?: number): Promise<ReturnType<typeof analyzeReviewRun>>;
    };
  }
}

function assertPilot(sceneId: string): void {
  if (sceneId !== PILOT_SCENE) {
    throw new Error(
      `Review packets are piloted only for "${PILOT_SCENE}"; received "${sceneId}".`,
    );
  }
}

function describe(sceneId: string): AnimationReviewDescription {
  assertPilot(sceneId);
  const checkpoints = resolveBeatCheckpoints(MATRIX_TRANSFORMATION_BEAT_CONTRACT, FPS);
  return {
    sceneId,
    fps: FPS,
    checkpoints,
    beats: MATRIX_TRANSFORMATION_BEAT_CONTRACT.beats.map((beat) => ({
      id: beat.id,
      purpose: beat.purpose,
      chapter: beat.chapter,
      ...(beat.prediction ? {prediction: beat.prediction} : {}),
    })),
    reducedMotionFrames: checkpoints
      .filter(({checkpointId}) => checkpointId === "opening")
      .map(({beatId, frame}) => ({beatId, frame, source: "chapter-opening" as const})),
    // This pilot has no corresponding benchmark-lab replica. Keeping an
    // explicit empty list makes unsupported comparison evidence observable.
    referenceComparisons: [],
  };
}

async function analyze(
  sceneId: string,
  stride = 3,
): Promise<ReturnType<typeof analyzeReviewRun>> {
  assertPilot(sceneId);
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  document.body.appendChild(container);
  try {
    const run = await runSceneGateSampling(sceneId, container, {stride});
    return analyzeReviewRun(
      MATRIX_TRANSFORMATION_BEAT_CONTRACT,
      resolveBeatCheckpoints(MATRIX_TRANSFORMATION_BEAT_CONTRACT, run.fps),
      run,
    );
  } finally {
    container.remove();
  }
}

export function installAnimationReviewHarness(): void {
  window.__animationReviewApi = {describe, analyze};
  window.__animationReviewReady = true;
}
