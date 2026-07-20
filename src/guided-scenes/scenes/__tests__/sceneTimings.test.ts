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
