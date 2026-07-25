import type { ProbeSample } from "../probes/probeRegistry";

/**
 * Comparison-system data model. Quality is NEVER one number: each check
 * belongs to one of nine independent dimensions and is either a HARD gate
 * (objective defect: broken math, discontinuity, clipping, desync, broken
 * seeking) or a CRAFT observation (composition, pacing, typography — author
 * judgment, recorded as evidence, never auto-failed).
 */

export type ComparisonDimension =
  | "math-validity"
  | "identity-continuity"
  | "composition"
  | "synchronization"
  | "timing"
  | "camera"
  | "text-treatment"
  | "reveal-structure"
  | "accessibility";

export const COMPARISON_DIMENSIONS: readonly ComparisonDimension[] = [
  "math-validity",
  "identity-continuity",
  "composition",
  "synchronization",
  "timing",
  "camera",
  "text-treatment",
  "reveal-structure",
  "accessibility",
];

export type CheckSeverity = "hard" | "craft";

export interface CheckResult {
  /** Stable id: "<checkKind>:<subject>". */
  id: string;
  dimension: ComparisonDimension;
  severity: CheckSeverity;
  passed: boolean;
  message: string;
  /** Measured / expected / tolerance where numeric (for the lab UI table). */
  measured?: number;
  expected?: number;
  tolerance?: number;
  beatId?: string;
  objectId?: string;
  /** Replica frame the finding anchors to, when frame-specific. */
  frame?: number;
}

/** One sampled frame of a benchmark run. */
export interface FrameSample {
  frame: number;
  /** Replica seconds. */
  time: number;
  samples: Record<string, ProbeSample>;
}

export interface SeekDeterminismRecord {
  beatId: string;
  frame: number;
  /** Canvas hash after seeking 0 -> frame. */
  hashFromStart: string;
  /** Canvas hash after seeking end -> frame. */
  hashFromEnd: string;
  samplesFromStart: Record<string, ProbeSample>;
  samplesFromEnd: Record<string, ProbeSample>;
}

export interface SegmentOverrunRecord {
  label: string;
  declared: number;
  measured: number;
}

/** Everything the sampler measures in one pass over a replica. */
export interface BenchmarkRun {
  benchmarkId: string;
  fps: number;
  /** Sampling stride in frames. */
  stride: number;
  durationFrames: number;
  frames: FrameSample[];
  /** Event id -> replica seconds (from the probe event log). */
  events: Record<string, number>;
  /** Beat id -> probe snapshot nearest the beat's END. */
  beatEndSamples: Record<string, Record<string, ProbeSample>>;
  seekRecords: SeekDeterminismRecord[];
  overruns: SegmentOverrunRecord[];
}

export interface DimensionSummary {
  dimension: ComparisonDimension;
  total: number;
  passed: number;
  hardFailures: number;
  craftFindings: number;
}

export interface ComparisonReport {
  benchmarkId: string;
  results: CheckResult[];
  summaries: DimensionSummary[];
  hardFailures: CheckResult[];
  craftFindings: CheckResult[];
}

export function summarize(
  benchmarkId: string,
  results: CheckResult[],
): ComparisonReport {
  const summaries: DimensionSummary[] = COMPARISON_DIMENSIONS.map(
    (dimension) => {
      const of = results.filter((r) => r.dimension === dimension);
      return {
        dimension,
        total: of.length,
        passed: of.filter((r) => r.passed).length,
        hardFailures: of.filter((r) => !r.passed && r.severity === "hard").length,
        craftFindings: of.filter((r) => !r.passed && r.severity === "craft").length,
      };
    },
  );
  return {
    benchmarkId,
    results,
    summaries,
    hardFailures: results.filter((r) => !r.passed && r.severity === "hard"),
    craftFindings: results.filter((r) => !r.passed && r.severity === "craft"),
  };
}
