/**
 * Registry mapping benchmark ids to their replica scene descriptions.
 *
 * Mirrors src/guided-scenes/scenes/sceneDescriptions.ts but is deliberately
 * SEPARATE: replicas are laboratory fixtures, never learner content. Nothing
 * in the production route tree, SCENE_META, or lesson definitions may point
 * here; the laboratory page and the dev export harness are the only readers.
 */

const LOADERS: Record<string, () => Promise<unknown>> = {
  "eigen-span-stretch": () =>
    import("./eigenSpanReplicaScene").then((m) => m.eigenSpanReplicaScene),
  "huffman-merge": () =>
    import("./huffmanMergeReplicaScene").then((m) => m.huffmanMergeReplicaScene),
  "ab-split": () =>
    import("./abSplitReplicaScene").then((m) => m.abSplitReplicaScene),
  "bfs-frontier": () =>
    import("./bfsFrontierReplicaScene").then((m) => m.bfsFrontierReplicaScene),
  "bfs-intertitle-build": () =>
    import("./bfsIntertitleBuildReplicaScene").then(
      (m) => m.bfsIntertitleBuildReplicaScene,
    ),
  "bfs-pseudocode-writein": () =>
    import("./bfsPseudocodeWriteinReplicaScene").then(
      (m) => m.bfsPseudocodeWriteinReplicaScene,
    ),
  "ab-prediction-reveal": () =>
    import("./abPredictionRevealReplicaScene").then(
      (m) => m.abPredictionRevealReplicaScene,
    ),
  "ab-camera-reframe": () =>
    import("./abCameraReframeReplicaScene").then(
      (m) => m.abCameraReframeReplicaScene,
    ),
};

export function getReplicaSceneDescription(benchmarkId: string): Promise<unknown> {
  const loader = LOADERS[benchmarkId];
  if (!loader) {
    throw new Error(
      `No replica scene registered for benchmark "${benchmarkId}".`,
    );
  }
  return loader();
}

/** Sync id listing (no imports triggered). */
export function listReplicaIds(): string[] {
  return Object.keys(LOADERS);
}
