import { hasGuidedScene } from "./sceneMeta";

/**
 * Maps a sceneId to a loader for its Motion Canvas scene description.
 *
 * Each loader is a dynamic import so the @motion-canvas/2d scene code (and the
 * shared Motion Canvas runtime it pulls in) is fetched only when a learner
 * opens a lesson that uses it — never as part of the home-page bundle, and
 * never for scenes belonging to lessons the learner hasn't opened.
 *
 * Unknown ids throw synchronously (via `hasGuidedScene`, which needs no
 * Motion Canvas import) — never silently substitute the transform-spike scene.
 */
const LOADERS: Record<string, () => Promise<unknown>> = {
  "vectors-linear-combinations": () =>
    import("./linearCombinationScene").then((m) => m.linearCombinationScene),
  "matrix-transformations": () =>
    import("./matrixTransformationScene").then(
      (m) => m.matrixTransformationScene,
    ),
  "determinant-area-scaling": () =>
    import("./determinantAreaScalingScene").then(
      (m) => m.determinantAreaScalingScene,
    ),
  "eigenvectors-invariant-directions": () =>
    import("./eigenvectorsInvariantDirectionsScene").then(
      (m) => m.eigenvectorsInvariantDirectionsScene,
    ),
  "eigenvectors-derivation": () =>
    import("./eigenvectorsDerivationScene").then(
      (m) => m.eigenvectorsDerivationScene,
    ),
  "transform-spike": () =>
    import("./transformSpikeScene").then((m) => m.transformSpikeScene),
};

export function getSceneDescription(sceneId: string): Promise<unknown> {
  if (!hasGuidedScene(sceneId) || !(sceneId in LOADERS)) {
    throw new Error(
      `Unknown guided scene description for id: "${sceneId}". ` +
        `Register it in sceneDescriptions.ts (and SCENE_META).`,
    );
  }
  return LOADERS[sceneId]!();
}

/** For tests / registry introspection. Sync — does not trigger any import. */
export function listSceneDescriptionIds(): string[] {
  return Object.keys(LOADERS);
}
