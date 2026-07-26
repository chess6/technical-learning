import type { BenchmarkManifest } from "./types";
import { eigenSpanStretchManifest } from "./eigenSpanStretch";
import { huffmanMergeManifest } from "./huffmanMerge";
import { abSplitManifest } from "./abSplit";
import { bfsFrontierManifest } from "./bfsFrontier";
import { bfsIntertitleBuildManifest } from "./bfsIntertitleBuild";
import { bfsPseudocodeWriteinManifest } from "./bfsPseudocodeWritein";
import { abPredictionRevealManifest } from "./abPredictionReveal";
import { abCameraReframeManifest } from "./abCameraReframe";

/**
 * Registry of benchmark manifests — one per curated reference pack.
 *
 * Order is presentation order in the laboratory. Adding a benchmark means:
 * a manifest module here, a window in referenceWindows.json, a replica scene
 * registered in ../replicas/replicaScenes.ts, and locally fetched reference
 * frames (scripts/fetch-benchmark-media.sh). The laboratory itself needs no
 * changes.
 */
export const BENCHMARK_MANIFESTS: readonly BenchmarkManifest[] = [
  eigenSpanStretchManifest,
  huffmanMergeManifest,
  abSplitManifest,
  bfsFrontierManifest,
  bfsIntertitleBuildManifest,
  bfsPseudocodeWriteinManifest,
  abPredictionRevealManifest,
  abCameraReframeManifest,
];

export function getBenchmarkManifest(id: string): BenchmarkManifest {
  const manifest = BENCHMARK_MANIFESTS.find((m) => m.id === id);
  if (!manifest) {
    throw new Error(`Unknown benchmark id: "${id}"`);
  }
  return manifest;
}

export * from "./types";
