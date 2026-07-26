import type { BenchmarkManifest } from "../manifests";
import { toReplicaTime } from "../manifests";
import {
  checkBeatVisibility,
  checkCamera,
  checkContinuity,
  checkDuration,
  checkEventTimes,
  checkHoldDurations,
  checkLandmarks,
  checkOpacityReplacement,
  checkOverruns,
  checkSeekDeterminism,
  checkStageClipping,
  checkTextOcclusion,
} from "./checks";
import { checkInvariants } from "./invariantEvaluators";
import { summarize, type BenchmarkRun, type ComparisonReport } from "./types";

/** Run the full multi-dimension comparison over one sampled run. */
export function runAllChecks(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
): ComparisonReport {
  const results = [
    ...checkInvariants(manifest, run),
    ...checkBeatVisibility(manifest, run),
    ...checkContinuity(manifest, run),
    ...checkOpacityReplacement(manifest, run),
    ...checkLandmarks(manifest, run),
    ...checkEventTimes(manifest, run),
    ...checkHoldDurations(manifest, run),
    ...checkStageClipping(manifest, run),
    ...checkTextOcclusion(manifest, run),
    ...checkSeekDeterminism(manifest, run),
    ...checkCamera(manifest, run),
    ...checkOverruns(run),
    ...checkDuration(manifest, run),
  ];
  return summarize(manifest.id, results);
}

/**
 * Serializable measurement record for the committed evidence reports
 * (docs/quality/benchmark-lab/measurements/): every event delta, landmark
 * delta, and check outcome, plus the manifest's explicitly accepted deviations.
 */
export function buildMeasurementReport(
  manifest: BenchmarkManifest,
  run: BenchmarkRun,
  report: ComparisonReport,
): object {
  return {
    benchmarkId: manifest.id,
    source: manifest.source,
    sampledAt: {
      fps: run.fps,
      stride: run.stride,
      durationFrames: run.durationFrames,
      sampledFrames: run.frames.length,
    },
    events: manifest.events.map((event) => {
      const expected = toReplicaTime(manifest, event.refTime);
      const measured = run.events[event.id];
      return {
        id: event.id,
        anchor: event.anchor,
        referenceSec: event.refTime,
        expectedReplicaSec: Math.round(expected * 100) / 100,
        measuredReplicaSec:
          measured === undefined ? null : Math.round(measured * 100) / 100,
        deltaSec:
          measured === undefined
            ? null
            : Math.round((measured - expected) * 100) / 100,
      };
    }),
    landmarks: report.results
      .filter((r) => r.id.startsWith("landmark:"))
      .map((r) => ({
        id: r.id.slice("landmark:".length),
        deltaPx: r.measured ?? null,
        tolerancePx: r.tolerance ?? null,
        passed: r.passed,
      })),
    dimensions: report.summaries,
    hardFailures: report.hardFailures.map((r) => r.message),
    craftFindings: report.craftFindings.map((r) => r.message),
    acceptedDeviations: manifest.knownDeviations,
  };
}
