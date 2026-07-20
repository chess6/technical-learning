import { describe, expect, it } from "vitest";
import {
  EIGEN_DERIVATION_SEGMENTS,
  EIGENVECTOR_SEGMENTS,
  totalDuration,
  toSteps,
} from "../sceneTimings";
import { getSceneMeta } from "../sceneMeta";

describe("scene timings (pure data)", () => {
  it("derives steps starting at 0 with monotonic progress", () => {
    for (const segments of [EIGENVECTOR_SEGMENTS, EIGEN_DERIVATION_SEGMENTS]) {
      const steps = toSteps(segments);
      expect(steps[0]!.at).toBe(0);
      for (let i = 1; i < steps.length; i += 1) {
        expect(steps[i]!.at).toBeGreaterThan(steps[i - 1]!.at);
        expect(steps[i]!.at).toBeLessThan(1);
      }
      expect(totalDuration(segments)).toBeGreaterThan(0);
    }
  });

  it("gives the eigen Watch scene enough time for its held demos", () => {
    // The lambdas beat runs stretch → reverse → collapse with explicit holds.
    // Internal choreography budget (see eigenvectorsInvariantDirectionsScene):
    //   0.8 + 1.4 + 1.2 + 1.6 + 1.6 + 0.8 + 1.6 = 9.0s.
    const lambdas = EIGENVECTOR_SEGMENTS.find((s) => s.id === "lambdas");
    expect(lambdas).toBeDefined();
    expect(lambdas!.duration).toBeGreaterThanOrEqual(9.0);
    for (const segment of EIGENVECTOR_SEGMENTS) {
      expect(segment.duration).toBeGreaterThan(0);
    }
  });

  it("keeps the eigen Watch major steps in learning order", () => {
    const meta = getSceneMeta("eigenvectors-invariant-directions");
    expect(meta.majorSteps.map((step) => step.id)).toEqual([
      "fan",
      "apply",
      "highlight",
      "equation",
      "lambdas",
      "scalar",
      "defective",
      "rotation",
      "summary",
    ]);
  });

  it("eigenvectors-derivation major steps resolve every ladder rung", () => {
    const meta = getSceneMeta("eigenvectors-derivation");
    const majorIds = meta.majorSteps.map((step) => step.id);
    expect(majorIds).toEqual([
      "recap",
      "shift",
      "charpoly",
      "solveLambda",
      "solveV",
      "interpret",
    ]);
    for (const id of majorIds) {
      expect(meta.steps.some((step) => step.id === id)).toBe(true);
    }
  });
});
