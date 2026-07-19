import { linearCombinationScene } from "./linearCombinationScene";
import { matrixTransformationScene } from "./matrixTransformationScene";
import { transformSpikeScene } from "./transformSpikeScene";
import { FALLBACK_SCENE_ID } from "./sceneMeta";

/**
 * Maps a sceneId to its Motion Canvas scene description. This is the ONLY
 * production module that imports @motion-canvas/2d scene code, so the fallback
 * engine and unit tests never pull the 2D runtime into their module graph.
 */
const DESCRIPTIONS: Record<string, unknown> = {
  "vectors-linear-combinations": linearCombinationScene,
  "matrix-transformations": matrixTransformationScene,
  "transform-spike": transformSpikeScene,
};

export function getSceneDescription(sceneId: string): unknown {
  return DESCRIPTIONS[sceneId] ?? DESCRIPTIONS[FALLBACK_SCENE_ID];
}
