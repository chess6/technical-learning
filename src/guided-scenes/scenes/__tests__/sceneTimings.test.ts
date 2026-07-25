import { describe, expect, it } from "vitest";
import {
  COLUMNS_RULE_GRAPHIC_SEGMENTS,
  DETERMINANT_SEGMENTS,
  EIGEN_DERIVATION_SEGMENTS,
  EIGENVECTOR_SEGMENTS,
  ELIMINATION_BEATS,
  ELIMINATION_SEGMENTS,
  MATRIX_TRANSFORMATION_SEGMENTS,
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
  // ELIMINATION_BEATS and pads with `runSegment`.
  //
  // IMPORTANT (scope of these tests): they are PURE DATA checks. They do NOT
  // instantiate or run the Motion Canvas scene (that only executes in the
  // browser player), so they do NOT directly measure the rendered timeline.
  // What they prove is the necessary precondition for `runSegment` to hit the
  // declared total: each segment's declared beat budget fits within its
  // segment, so `runSegment(duration, body)` — which holds for
  // max(duration, consumed) — can only ever PAD (never truncate) each segment.
  // The Playwright spec (`e2e/lesson-elimination.spec.ts`) is the behavioral
  // evidence that the actual rendered timeline is aligned: it scrubs to 28% of
  // the timeline and asserts the operation-beat marker is showing, and steps
  // through all five idea markers derived from this same metadata.
  describe("elimination declared beat budgets fit within their segments (runSegment then only pads)", () => {
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

    it("every declared segment body fits its budget, so runSegment only pads (never truncates)", () => {
      for (const seg of ELIMINATION_SEGMENTS) {
        const consumed = sumBeats(ELIMINATION_BEATS[seg.id]);
        expect(consumed).toBeGreaterThanOrEqual(0);
        // A body must not overrun its segment, or the scene would drift long.
        expect(consumed).toBeLessThanOrEqual(seg.duration + 1e-9);
      }
    });

    it("padded declared-segment lengths sum to totalDuration(ELIMINATION_SEGMENTS)", () => {
      // This is the PADDING ARITHMETIC that `runSegment` performs, computed from
      // the declared budgets — NOT a measurement of the executed scene. Because
      // every body fits its budget (test above), runSegment's
      // max(declared duration, consumed) is always the declared duration, so the
      // padded declared timeline equals the metadata total. Whether the RUNNING
      // scene actually lands here is asserted behaviorally by the Playwright
      // scrubber/marker checks, not by this unit test.
      const paddedDeclared = ELIMINATION_SEGMENTS.reduce(
        (sum, seg) => sum + Math.max(seg.duration, sumBeats(ELIMINATION_BEATS[seg.id])),
        0,
      );
      expect(paddedDeclared).toBeCloseTo(totalDuration(ELIMINATION_SEGMENTS), 9);
    });

    it("every beat budget is positive (no zero/negative animated yields)", () => {
      for (const seg of ELIMINATION_SEGMENTS) {
        for (const [id, dt] of Object.entries(ELIMINATION_BEATS[seg.id] ?? {})) {
          expect(dt, `${seg.id}.${id}`).toBeGreaterThan(0);
        }
      }
    });
  });

  it("matrix-transformations gives the sample its own travel beat and an unhurried tour", () => {
    const byId = Object.fromEntries(
      MATRIX_TRANSFORMATION_SEGMENTS.map((s) => [s.id, s]),
    );
    // The linearity payoff is x visibly travelling to Ax: 0.4 ghost + 2.6
    // travel + 0.7 pulse ≈ 3.7s of choreography, and it must not feel rushed.
    expect(byId["transform-sample"]!.duration).toBeGreaterThanOrEqual(6.0);
    // The sample beat draws x BEFORE it moves, plus its components.
    expect(byId.sample!.duration).toBeGreaterThanOrEqual(4.0);
    // A prediction sits between drawing x and moving it, and is only real if
    // there is silence to think in (≈0.5s of choreography, the rest held).
    const ids = MATRIX_TRANSFORMATION_SEGMENTS.map((s) => s.id);
    expect(ids.indexOf("sample")).toBeLessThan(ids.indexOf("predict-sample"));
    expect(ids.indexOf("predict-sample")).toBeLessThan(
      ids.indexOf("transform-sample"),
    );
    expect(byId["predict-sample"]!.duration).toBeGreaterThanOrEqual(4.5);
    // The grid beat traces a gridline against its image.
    expect(byId.grid!.duration).toBeGreaterThanOrEqual(5.0);
    // Four presets, each reset-to-identity then applied: keep ≥3s per new
    // transformation (the audit measured the old tour at ~1.5s each).
    const PRESET_COUNT = 4;
    expect(byId.presets!.duration / PRESET_COUNT).toBeGreaterThanOrEqual(3.0);

    // Every beat is navigable, including the payoff that used to be skipped.
    const meta = getSceneMeta("matrix-transformations");
    const majorIds = meta.majorSteps.map((s) => s.id);
    expect(majorIds).toContain("transform-sample");
    expect(majorIds).toContain("col2");
    expect(majorIds).toEqual(MATRIX_TRANSFORMATION_SEGMENTS.map((s) => s.id));
    expect(
      MATRIX_TRANSFORMATION_SEGMENTS.every((s) => Boolean(s.summary)),
    ).toBe(true);
  });

  it("columns-rule callback constructs the decomposition and predicts before revealing", () => {
    const ids = COLUMNS_RULE_GRAPHIC_SEGMENTS.map((s) => s.id);
    // The rule is built, not asserted: a decompose beat draws the head-to-tail
    // walk, a predict beat holds before the reveal, and image resolves it.
    expect(ids).toEqual([
      "vertex",
      "decompose",
      "predict",
      "image",
      "all-vertices",
    ]);
    expect(ids.indexOf("predict")).toBeLessThan(ids.indexOf("image"));

    const byId = Object.fromEntries(
      COLUMNS_RULE_GRAPHIC_SEGMENTS.map((s) => [s.id, s]),
    );
    // decompose choreography: 0.5 dim + 1.4 grow₁ + 0.3 fade + 1.4 grow₂
    // + 0.6 pulse ≈ 4.2s; keep headroom so the walk never feels rushed.
    expect(byId.decompose!.duration).toBeGreaterThanOrEqual(6.5);
    // image: 0.5 restore + 3.4 morph + 0.7 pulse ≈ 4.6s.
    expect(byId.image!.duration).toBeGreaterThanOrEqual(7.0);
    // A prediction is only real if there is silence to think in: the beat
    // spends ≈0.5s brightening the basis, the rest is think time.
    expect(byId.predict!.duration).toBeGreaterThanOrEqual(4.5);

    // Every beat is a navigable chapter with a summary.
    expect(COLUMNS_RULE_GRAPHIC_SEGMENTS.every((s) => Boolean(s.summary))).toBe(
      true,
    );
    const meta = getSceneMeta("columns-rule-graphic");
    expect(meta.majorSteps.map((s) => s.id)).toEqual(ids);
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
