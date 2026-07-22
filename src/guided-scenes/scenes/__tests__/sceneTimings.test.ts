import { describe, expect, it } from "vitest";
import {
  DETERMINANT_SEGMENTS,
  EIGEN_DERIVATION_SEGMENTS,
  EIGENVECTOR_SEGMENTS,
  ELIMINATION_BEATS,
  ELIMINATION_SEGMENTS,
  KARATSUBA_SEGMENTS,
  LINEAR_COMBINATION_SEGMENTS,
  sumBeats,
  totalDuration,
  toSteps,
} from "../sceneTimings";
import { getSceneMeta } from "../sceneMeta";

describe("scene timings (pure data)", () => {
  it("derives steps starting at 0 with monotonic progress", () => {
    for (const segments of [
      DETERMINANT_SEGMENTS,
      EIGENVECTOR_SEGMENTS,
      EIGEN_DERIVATION_SEGMENTS,
      KARATSUBA_SEGMENTS,
    ]) {
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

  // expand choreography: announce + reset (≈1.0) + morphs/hold (≈3.3) ≈ 4.25s floor.
  it("gives the determinant expand beat enough time for successive stretches", () => {
    const expand = DETERMINANT_SEGMENTS.find((s) => s.id === "expand");
    expect(expand).toBeDefined();
    expect(expand!.duration).toBeGreaterThanOrEqual(5.0);
  });

  it("extends Lesson 1 with basis + coordinates beats and enough time for the continuous coordinate transition", () => {
    const ids = LINEAR_COMBINATION_SEGMENTS.map((s) => s.id);
    expect(ids).toContain("basis");
    expect(ids).toContain("coordinates");
    // basis appears after the dependent contrast, coordinates last.
    expect(ids.indexOf("basis")).toBeGreaterThan(ids.indexOf("dependent"));
    expect(ids.indexOf("coordinates")).toBe(ids.length - 1);
    // The [p]_E -> [p]_B transition happens in one continuous beat; it needs room.
    const coordinates = LINEAR_COMBINATION_SEGMENTS.find((s) => s.id === "coordinates");
    expect(coordinates!.duration).toBeGreaterThanOrEqual(6);
    for (const segment of LINEAR_COMBINATION_SEGMENTS) {
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

  it("keeps determinant major steps including successive area expansion", () => {
    const meta = getSceneMeta("determinant-area-scaling");
    expect(meta.majorSteps.map((step) => step.id)).toEqual([
      "identity",
      "parallelogram",
      "area",
      "expand",
      "collapse",
      "negative",
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

  // Regression for the timing-drift finding: the elimination scene body used to
  // subtract guessed choreography totals (waitFor(duration - guess)), so it ran
  // ~23.8s against 27s of metadata. It now budgets every yield via
  // ELIMINATION_BEATS and pads with runSegment, so the generated length must
  // equal the metadata total. We assert the property that guarantees this.
  describe("elimination timeline matches its declared segment metadata", () => {
    it("declares 27s total across five segments", () => {
      expect(ELIMINATION_SEGMENTS.map((s) => s.id)).toEqual([
        "setup",
        "operation",
        "triangular",
        "invariance",
        "summary",
      ]);
      expect(totalDuration(ELIMINATION_SEGMENTS)).toBe(27);
    });

    it("every segment body fits its budget, so runSegment only pads (never truncates)", () => {
      for (const seg of ELIMINATION_SEGMENTS) {
        const consumed = sumBeats(ELIMINATION_BEATS[seg.id]);
        expect(consumed).toBeGreaterThanOrEqual(0);
        // A body must not overrun its segment, or the scene would drift long.
        expect(consumed).toBeLessThanOrEqual(seg.duration + 1e-9);
      }
    });

    it("generated scene length equals totalDuration(ELIMINATION_SEGMENTS)", () => {
      // runSegment holds each body for max(declared duration, consumed). Because
      // every body fits its budget (test above), that max is always the declared
      // duration — so the padded timeline is exactly the metadata total.
      const generated = ELIMINATION_SEGMENTS.reduce(
        (sum, seg) => sum + Math.max(seg.duration, sumBeats(ELIMINATION_BEATS[seg.id])),
        0,
      );
      expect(generated).toBeCloseTo(totalDuration(ELIMINATION_SEGMENTS), 9);
    });

    it("every beat budget is positive (no zero/negative animated yields)", () => {
      for (const seg of ELIMINATION_SEGMENTS) {
        for (const [id, dt] of Object.entries(ELIMINATION_BEATS[seg.id] ?? {})) {
          expect(dt, `${seg.id}.${id}`).toBeGreaterThan(0);
        }
      }
    });
  });

  it("karatsuba scene has no deeper beat and ~58s elementary timeline", () => {
    expect(KARATSUBA_SEGMENTS.map((s) => s.id)).not.toContain("deeper");
    expect(totalDuration(KARATSUBA_SEGMENTS)).toBeGreaterThanOrEqual(55);
    expect(totalDuration(KARATSUBA_SEGMENTS)).toBeLessThanOrEqual(65);
    const meta = getSceneMeta("karatsuba-cross-terms");
    expect(meta.majorSteps.map((s) => s.id)).toEqual([
      "foil",
      "share",
      "aux-rect",
      "subtract",
      "reassemble",
      "carry-vs-width",
      "branch",
      "exponent",
    ]);
  });
});
