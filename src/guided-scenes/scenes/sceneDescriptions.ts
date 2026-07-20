import { linearCombinationScene } from "./linearCombinationScene";
import { matrixTransformationScene } from "./matrixTransformationScene";
import { determinantAreaScalingScene } from "./determinantAreaScalingScene";
import { eigenvectorsInvariantDirectionsScene } from "./eigenvectorsInvariantDirectionsScene";
import { transformSpikeScene } from "./transformSpikeScene";
import { hasGuidedScene } from "./sceneMeta";

/**
 * Maps a sceneId to its Motion Canvas scene description. This is the ONLY
 * production module that imports @motion-canvas/2d scene code, so the fallback
 * engine and unit tests never pull the 2D runtime into their module graph.
 *
 * Unknown ids throw — never silently substitute the transform-spike scene.
 */
const DESCRIPTIONS: Record<string, unknown> = {
  "vectors-linear-combinations": linearCombinationScene,
  "matrix-transformations": matrixTransformationScene,
  "determinant-area-scaling": determinantAreaScalingScene,
  "eigenvectors-invariant-directions": eigenvectorsInvariantDirectionsScene,
  "transform-spike": transformSpikeScene,
};

export function getSceneDescription(sceneId: string): unknown {
  if (!hasGuidedScene(sceneId) || DESCRIPTIONS[sceneId] === undefined) {
    throw new Error(
      `Unknown guided scene description for id: "${sceneId}". ` +
        `Register it in sceneDescriptions.ts (and SCENE_META).`,
    );
  }
  return DESCRIPTIONS[sceneId];
}

/** For tests / registry introspection. */
export function listSceneDescriptionIds(): string[] {
  return Object.keys(DESCRIPTIONS);
}
