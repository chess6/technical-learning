import { describe, expect, it } from "vitest";
import {
  BST_LIFT_SEGMENTS,
  CHAPTER0_SEGMENTS,
  CHANGE_OF_BASIS_SEGMENTS,
  COLUMNS_RULE_GRAPHIC_SEGMENTS,
  DETERMINANT_SEGMENTS,
  EIGEN_DERIVATION_SEGMENTS,
  EIGENVECTOR_SEGMENTS,
  ELIMINATION_BEATS,
  ELIMINATION_SEGMENTS,
  KARATSUBA_SEGMENTS,
  LINEAR_COMBINATION_SEGMENTS,
  MATRIX_COMPOSITION_SEGMENTS,
  MATRIX_TRANSFORMATION_SEGMENTS,
  RANK_NULLITY_SEGMENTS,
  SCENE_BEATS,
  SCENE_SEGMENTS,
  SCENES_WITHOUT_DECLARED_BEATS,
  SOLUTION_SETS_SEGMENTS,
  SUBSPACES_RANK_SEGMENTS,
  SYSTEMS_SEGMENTS,
  requireBeats,
  sumBeats,
  totalDuration,
  toSteps,
} from "../sceneTimings";
import { SCENE_META, getSceneMeta } from "../sceneMeta";
import {
  SCENE_BEAT_INTENTS,
  validateBeatIntentRegistry,
} from "../beatIntents";

/**
 * Timing, chapter, and prediction metadata — all pure data, so all checkable.
 *
 * SCOPE (do not overstate it): these tests do NOT instantiate or run the Motion
 * Canvas scenes (that only happens in a browser), so they do not directly
 * measure the rendered timeline. What they prove is the PRECONDITION for
 * `runSegment` to hit the declared total: every segment body's declared beat
 * budget fits inside its segment, so `runSegment` can only ever PAD. The two
 * behavioural backstops are (a) `sceneKit.runSegment`, which records and logs a
 * console error for any body that really does overrun at runtime, and the
 * Playwright specs that fail on console errors, and (b) the frame-exact MP4
 * exports recorded in the audit.
 */

const PRODUCTION_SCENE_IDS = Object.keys(SCENE_META).filter(
  (id) => id !== "transform-spike",
);

describe("scene timings (pure data)", () => {
  it("derives steps starting at 0 with monotonic progress", () => {
    for (const segments of Object.values(SCENE_SEGMENTS)) {
      const steps = toSteps(segments);
      expect(steps[0]!.at).toBe(0);
      for (let i = 1; i < steps.length; i += 1) {
        expect(steps[i]!.at).toBeGreaterThan(steps[i - 1]!.at);
        expect(steps[i]!.at).toBeLessThan(1);
      }
      expect(totalDuration(segments)).toBeGreaterThan(0);
    }
  });

  it("registers every scene in SCENE_META, and nothing else", () => {
    expect(Object.keys(SCENE_SEGMENTS).sort()).toEqual(
      Object.keys(SCENE_META).sort(),
    );
  });

  /* ======================================================================
   * The automatic timing-budget gate
   * ==================================================================== */
  describe("declared beat budgets", () => {
    it("covers every registered scene (a new scene cannot skip the gate)", () => {
      for (const sceneId of Object.keys(SCENE_SEGMENTS)) {
        const declared = Object.prototype.hasOwnProperty.call(
          SCENE_BEATS,
          sceneId,
        );
        const exempt = SCENES_WITHOUT_DECLARED_BEATS.includes(sceneId);
        expect(
          declared || exempt,
          `${sceneId} declares no beat budget and is not on the documented exemption list`,
        ).toBe(true);
        // Never both: an exempt scene that starts declaring budgets should be
        // taken off the list, or the list stops meaning anything.
        expect(declared && exempt, `${sceneId} is both declared and exempt`).toBe(
          false,
        );
      }
    });

    it("classifies every timed beat explicitly and reserves holds for actual holds", () => {
      expect(validateBeatIntentRegistry(SCENE_BEATS)).toEqual([]);
      for (const [sceneId, segments] of Object.entries(SCENE_BEAT_INTENTS)) {
        for (const [segmentId, intents] of Object.entries(segments)) {
          for (const [beatId, spec] of Object.entries(intents)) {
            expect(
              beatId,
              sceneId + "." + segmentId + ": pause is not an intent",
            ).not.toMatch(/^pause\d*/i);
            const intent = typeof spec === "string" ? spec : spec.intent;
            if (beatId === "hold" || /^hold\d+/i.test(beatId)) {
              expect(intent, sceneId + "." + segmentId + "." + beatId).toBe(
                "hold",
              );
            }
          }
        }
      }
    });

    it("every exemption names a real scene", () => {
      for (const sceneId of SCENES_WITHOUT_DECLARED_BEATS) {
        expect(SCENE_SEGMENTS[sceneId], sceneId).toBeDefined();
      }
    });

    it("declares a budget for every segment of every covered scene", () => {
      for (const [sceneId, beats] of Object.entries(SCENE_BEATS)) {
        const segments = SCENE_SEGMENTS[sceneId]!;
        const segmentIds = segments.map((segment) => segment.id);
        expect(Object.keys(beats).sort(), sceneId).toEqual(
          [...segmentIds].sort(),
        );
      }
    });

    // THE GATE. Adding choreography to a body without adding time to its
    // segment fails here instead of silently pushing every later chapter marker
    // out of sync with the timeline.
    it("no segment body can outgrow its segment (runSegment only ever pads)", () => {
      for (const [sceneId, beats] of Object.entries(SCENE_BEATS)) {
        for (const segment of SCENE_SEGMENTS[sceneId]!) {
          const consumed = sumBeats(beats[segment.id]);
          expect(
            consumed,
            `${sceneId}.${segment.id} budgets ${consumed}s inside a ${segment.duration}s segment`,
          ).toBeLessThanOrEqual(segment.duration + 1e-9);
        }
      }
    });

    it("keeps padding slack in every segment, so frame quantization cannot tip a body over", () => {
      for (const [sceneId, beats] of Object.entries(SCENE_BEATS)) {
        for (const segment of SCENE_SEGMENTS[sceneId]!) {
          const slack = segment.duration - sumBeats(beats[segment.id]);
          expect(slack, `${sceneId}.${segment.id}`).toBeGreaterThanOrEqual(0.05);
        }
      }
    });

    it("every beat budget is positive (no zero/negative animated yields)", () => {
      for (const [sceneId, beats] of Object.entries(SCENE_BEATS)) {
        for (const [segmentId, segmentBeats] of Object.entries(beats)) {
          for (const [beatId, duration] of Object.entries(segmentBeats)) {
            expect(
              duration,
              `${sceneId}.${segmentId}.${beatId}`,
            ).toBeGreaterThan(0);
          }
        }
      }
    });

    it("requireBeats resolves declared budgets and refuses undeclared ones", () => {
      expect(requireBeats("elimination", "pivot").sweep).toBe(2.6);
      expect(() => requireBeats("elimination", "nope")).toThrow(/beat budget/);
      expect(() => requireBeats("no-such-scene", "setup")).toThrow(/beat budget/);
    });

    it("keeps the ELIMINATION_BEATS alias pointing at the registry", () => {
      expect(ELIMINATION_BEATS).toBe(SCENE_BEATS.elimination);
    });
  });

  /* ======================================================================
   * Chapter metadata: every conceptual beat is reachable and described
   * ==================================================================== */
  describe("chapter metadata", () => {
    it("gives every production segment an authored summary", () => {
      for (const sceneId of PRODUCTION_SCENE_IDS) {
        for (const segment of SCENE_SEGMENTS[sceneId]!) {
          expect(
            segment.summary,
            `${sceneId}.${segment.id} has no chapter summary`,
          ).toBeTruthy();
        }
      }
    });

    it("makes every production segment reachable through Prev/Next chapters", () => {
      for (const sceneId of PRODUCTION_SCENE_IDS) {
        const meta = getSceneMeta(sceneId);
        expect(
          meta.majorSteps.map((step) => step.id),
          sceneId,
        ).toEqual(SCENE_SEGMENTS[sceneId]!.map((segment) => segment.id));
      }
    });

    it("carries each summary through to the chapter markers", () => {
      for (const sceneId of PRODUCTION_SCENE_IDS) {
        for (const step of getSceneMeta(sceneId).majorSteps) {
          expect(step.summary, `${sceneId}.${step.id}`).toBeTruthy();
        }
      }
    });
  });

  /* ======================================================================
   * Prediction beats
   * ==================================================================== */
  describe("prediction beats", () => {
    /**
     * Every scene that carries a prediction, and the beat the prediction must
     * come BEFORE. Scenes absent from this list are recorded in the audit with
     * the reason a prediction would be artificial there.
     */
    const PREDICTIONS: Record<string, { predict: string; reveal: string }> = {
      "why-linear-algebra": { predict: "predict-translation", reveal: "translation" },
      "vectors-linear-combinations": {
        predict: "predict-coordinates",
        reveal: "coordinates",
      },
      "matrix-transformations": {
        predict: "predict-sample",
        reveal: "transform-sample",
      },
      "columns-rule-graphic": { predict: "predict", reveal: "image" },
      "linear-systems": { predict: "predict-column", reveal: "column" },
      elimination: { predict: "predict", reveal: "pivot" },
      "solution-sets": { predict: "predict-generate", reveal: "generate" },
      "matrix-composition": { predict: "predict-order", reveal: "order" },
      "determinant-area-scaling": {
        predict: "predict-negative",
        reveal: "negative",
      },
      "subspaces-rank": { predict: "predict-rank-one", reveal: "rank-one" },
      "rank-nullity": { predict: "predict-degrade", reveal: "degrade" },
      "change-of-basis": { predict: "predict-readout", reveal: "new-readout" },
      "eigenvectors-invariant-directions": {
        predict: "predict-reverse",
        reveal: "reverse",
      },
      "eigenvectors-derivation": { predict: "predict", reveal: "determinant" },
      "eigenvectors-characteristic-equation": {
        predict: "predict",
        reveal: "firstZero",
      },
      "limits-continuity": { predict: "predict", reveal: "tighter" },
      "derivative-local-linearity": { predict: "predict", reveal: "zoom" },
      "derivative-three-names": { predict: "predictDecay", reveal: "decay" },
      "integral-accumulation": { predict: "predict", reveal: "refine" },
      "ftc-accumulate-then-measure": { predict: "predict", reveal: "close" },
      "ftc-telescoping": { predict: "predict", reveal: "cancel" },
      "chain-rule": { predict: "predict", reveal: "zoomOuter" },
      "bst-lift-from-array": { predict: "predict-gap", reveal: "the-gap" },
      "red-black-encoding": { predict: "overflow", reveal: "split-is-recolour" },
      "karatsuba-cross-terms": { predict: "subtract", reveal: "subtract" },
    };

    it("names a prediction for every production scene", () => {
      expect(Object.keys(PREDICTIONS).sort()).toEqual(
        [...PRODUCTION_SCENE_IDS].sort(),
      );
    });

    it("places each prediction immediately before its reveal", () => {
      for (const [sceneId, { predict, reveal }] of Object.entries(PREDICTIONS)) {
        const ids = SCENE_SEGMENTS[sceneId]!.map((segment) => segment.id);
        expect(ids, `${sceneId} is missing ${predict}`).toContain(predict);
        expect(ids.indexOf(predict), sceneId).toBeLessThanOrEqual(
          ids.indexOf(reveal),
        );
      }
    });

    it("gives each prediction enough room for real think time", () => {
      for (const [sceneId, { predict }] of Object.entries(PREDICTIONS)) {
        const segment = SCENE_SEGMENTS[sceneId]!.find((s) => s.id === predict)!;
        // A prediction is only real if there is silence to think in. The audit
        // measured karatsuba's old prompt at 1.2s of think time, which is a
        // beat of dead air rather than a question.
        expect(segment.duration, `${sceneId}.${predict}`).toBeGreaterThanOrEqual(5);
      }
    });

    it("budgets at least 3s of held silence inside each budgeted prediction", () => {
      for (const [sceneId, { predict }] of Object.entries(PREDICTIONS)) {
        const beats = SCENE_BEATS[sceneId]?.[predict];
        if (!beats) continue; // exempt scenes: verified by export, see the audit
        expect(beats.think, `${sceneId}.${predict} has no think budget`).toBeDefined();
        expect(beats.think!, `${sceneId}.${predict}`).toBeGreaterThanOrEqual(3);
      }
    });
  });

  /* ======================================================================
   * Per-scene shape regressions
   * ==================================================================== */

  it("splits the eigen λ ladder into navigable beats with a prediction before the reveal", () => {
    const ids = EIGENVECTOR_SEGMENTS.map((s) => s.id);
    const byId = Object.fromEntries(EIGENVECTOR_SEGMENTS.map((s) => [s.id, s]));

    // The opaque 11s `lambdas` block is gone: stretch, reverse, and collapse
    // are each their own chapter, so Prev/Next can reach them.
    expect(ids).not.toContain("lambdas");
    for (const id of ["stretch", "reverse", "collapse"]) {
      expect(ids).toContain(id);
    }

    // The prediction sits AFTER the mechanic it builds on (stretch established
    // that λ scales along the line) and BEFORE the counterintuitive reveal, so
    // the answer is derivable rather than a guess.
    expect(ids.indexOf("equation")).toBeLessThan(ids.indexOf("stretch"));
    expect(ids.indexOf("stretch")).toBeLessThan(ids.indexOf("predict-reverse"));
    expect(ids.indexOf("predict-reverse")).toBeLessThan(ids.indexOf("reverse"));
    expect(byId["predict-reverse"]!.duration).toBeGreaterThanOrEqual(4.5);

    // Each case matrix is reached from the identity WITH the grid on screen
    // (return ≈0.9 + deform ≈1.9 + annotate ≈0.8), instead of fading in a
    // pre-deformed grid. That choreography needs ≥5s per case beat.
    for (const id of ["scalar", "defective", "rotation"]) {
      expect(byId[id]!.duration, id).toBeGreaterThanOrEqual(5.0);
    }
  });

  it("gives the determinant scene a live-readout arc and a prediction before the flip", () => {
    const ids = DETERMINANT_SEGMENTS.map((s) => s.id);
    // The collapse → past-zero sequence is the scene's one counterintuitive
    // moment, so the prediction sits exactly between them.
    expect(ids.indexOf("collapse")).toBeLessThan(ids.indexOf("predict-negative"));
    expect(ids.indexOf("predict-negative")).toBeLessThan(ids.indexOf("negative"));
    // `basis` and `sign` were unreachable chapters before this pass.
    expect(getSceneMeta("determinant-area-scaling").majorSteps.map((s) => s.id))
      .toEqual(ids);
    const expand = DETERMINANT_SEGMENTS.find((s) => s.id === "expand");
    expect(expand!.duration).toBeGreaterThanOrEqual(5.0);
  });

  it("splits Lesson 1's coordinate payoff into read → predict → construct", () => {
    const ids = LINEAR_COMBINATION_SEGMENTS.map((s) => s.id);
    expect(ids).toContain("basis");
    expect(ids).toContain("coordinates");
    expect(ids.indexOf("basis")).toBeGreaterThan(ids.indexOf("dependent"));
    expect(ids.indexOf("read-standard")).toBeLessThan(
      ids.indexOf("predict-coordinates"),
    );
    expect(ids.indexOf("coordinates")).toBe(ids.length - 1);
    // The head-to-tail travel of w is a real translation now, and needs room.
    const addition = LINEAR_COMBINATION_SEGMENTS.find((s) => s.id === "addition")!;
    expect(addition.duration).toBeGreaterThanOrEqual(5);
  });

  it("keeps the eigen Watch major steps in learning order", () => {
    const meta = getSceneMeta("eigenvectors-invariant-directions");
    expect(meta.majorSteps.map((step) => step.id)).toEqual([
      "fan",
      "apply",
      "highlight",
      "equation",
      "stretch",
      "predict-reverse",
      "reverse",
      "collapse",
      "scalar",
      "defective",
      "rotation",
      "summary",
    ]);
  });

  /**
   * The worked-calculation clip: the derivation written as a chain of
   * equivalences, promoted from the laboratory. Its ladder is the argument, in
   * the order a learner would write it.
   */
  it("eigenvectors-derivation walks the whole chain in argument order", () => {
    const majorIds = getSceneMeta("eigenvectors-derivation").majorSteps.map(
      (step) => step.id,
    );
    expect(majorIds).toEqual([
      "defining",
      "gather",
      "factor",
      "nonzero",
      "singular",
      "predict",
      "determinant",
      "expand",
      "roots",
      "eigenspaces",
    ]);
    const ids = EIGEN_DERIVATION_SEGMENTS.map((s) => s.id);
    // Each inference depends on the one before it, so the order IS the proof.
    expect(ids.indexOf("gather")).toBeLessThan(ids.indexOf("factor"));
    expect(ids.indexOf("factor")).toBeLessThan(ids.indexOf("nonzero"));
    expect(ids.indexOf("nonzero")).toBeLessThan(ids.indexOf("singular"));
    // The prediction is answerable only once v ≠ 0 and singularity are both on
    // the page, and it is resolved by the line that states the determinant.
    expect(ids.indexOf("singular")).toBeLessThan(ids.indexOf("predict"));
    expect(ids.indexOf("predict")).toBeLessThan(ids.indexOf("determinant"));
    // Substituting a root back only makes sense once the roots exist.
    expect(ids.indexOf("roots")).toBeLessThan(ids.indexOf("eigenspaces"));
    // Two eigenspaces are solved one at a time in one beat, so it needs room.
    const eigenspaces = EIGEN_DERIVATION_SEGMENTS.find(
      (s) => s.id === "eigenspaces",
    )!;
    expect(eigenspaces.duration).toBeGreaterThanOrEqual(8);
  });

  describe("elimination", () => {
    /**
     * The clip that came out of the design experiment: an arithmetic spine
     * (the row leaves the bracket, a doubled copy of R1 lands under it, the
     * three columns are subtracted, the result returns) followed by the
     * geometric payoff (the line pivots about the crossing until horizontal).
     */
    it("runs the longhand arithmetic before the geometry", () => {
      const ids = ELIMINATION_SEGMENTS.map((s) => s.id);
      expect(ids).toEqual([
        "system",
        "matrix",
        "aim",
        "detach",
        "scale",
        "double",
        "subtract",
        "promote",
        "plane",
        "predict",
        "pivot",
        "read",
      ]);
      // Every result entry is computed before any of it is drawn as a line.
      expect(ids.indexOf("subtract")).toBeLessThan(ids.indexOf("plane"));
      expect(ids.indexOf("promote")).toBeLessThan(ids.indexOf("pivot"));
      expect(totalDuration(ELIMINATION_SEGMENTS)).toBe(53.3);
    });

    it("gives the three-column subtraction the most time of any beat", () => {
      const byId = Object.fromEntries(
        ELIMINATION_SEGMENTS.map((s) => [s.id, s.duration]),
      );
      const longest = Math.max(...ELIMINATION_SEGMENTS.map((s) => s.duration));
      expect(byId.subtract).toBe(longest);
      // The cancelling column is held longer than the other two: it is the one
      // the whole operation exists to produce.
      const beats = SCENE_BEATS.elimination!.subtract!;
      expect(beats.c0Wait!).toBeGreaterThan(beats.c1Wait!);
      expect(beats.c0Wait!).toBeGreaterThan(beats.c2Wait!);
    });
  });

  /**
   * Regression for the one learner-visible defect Batch 1 left open: the three
   * beats that begin a fresh trial used to rewrite the live matrix imperatively,
   * so the craft and both basis arrows teleported from their previous state back
   * to the identity in a single frame.
   *
   * The fix is a staged reset (`stagedReset` in sceneKit): fade the objects that
   * read the live matrix out, rewrite the state while nothing is drawn, fade
   * them back in. This asserts the budget that choreography needs still exists —
   * if a later edit drops the fade and goes back to an instant `setMatrix`, the
   * beat keys disappear and this fails.
   */
  it("stages every matrix-composition trial restart behind a fade", () => {
    const TRIAL_RESTARTS = ["one-map", "predict-order", "undo"];
    const beats = SCENE_BEATS["matrix-composition"]!;
    const intents = SCENE_BEAT_INTENTS["matrix-composition"]!;

    for (const segmentId of TRIAL_RESTARTS) {
      const segment = beats[segmentId]!;
      for (const phase of ["fadeOut", "resetHold", "fadeIn"] as const) {
        expect(segment[phase], `${segmentId}.${phase}`).toBeGreaterThan(0);
        // Never reclassified as a hold: the blank moment is the transition.
        expect(intents[segmentId]![phase], `${segmentId}.${phase}`).toBe(
          "transition",
        );
      }
      // The state is rewritten while nothing is drawn, so the blank has to
      // outlast a single frame at 30fps or the snap is still on screen.
      expect(segment.resetHold!, `${segmentId}.resetHold`).toBeGreaterThan(1 / 30);
    }

    // The old snap-based `predict-order` budgeted a single `reset` beat.
    expect(Object.keys(beats["predict-order"]!)).not.toContain("reset");
  });

  it("matrix-transformations gives the sample its own travel beat and an unhurried tour", () => {
    const byId = Object.fromEntries(
      MATRIX_TRANSFORMATION_SEGMENTS.map((s) => [s.id, s]),
    );
    expect(byId["transform-sample"]!.duration).toBeGreaterThanOrEqual(6.0);
    expect(byId.sample!.duration).toBeGreaterThanOrEqual(4.0);
    expect(byId["predict-sample"]!.duration).toBeGreaterThanOrEqual(4.5);
    expect(byId.grid!.duration).toBeGreaterThanOrEqual(5.0);
    const PRESET_COUNT = 4;
    expect(byId.presets!.duration / PRESET_COUNT).toBeGreaterThanOrEqual(3.0);
  });

  it("columns-rule callback constructs the decomposition and predicts before revealing", () => {
    const ids = COLUMNS_RULE_GRAPHIC_SEGMENTS.map((s) => s.id);
    expect(ids).toEqual(["vertex", "decompose", "predict", "image", "all-vertices"]);
    const byId = Object.fromEntries(
      COLUMNS_RULE_GRAPHIC_SEGMENTS.map((s) => [s.id, s]),
    );
    expect(byId.decompose!.duration).toBeGreaterThanOrEqual(6.5);
    expect(byId.image!.duration).toBeGreaterThanOrEqual(7.0);
    expect(byId.predict!.duration).toBeGreaterThanOrEqual(4.5);
  });

  it("karatsuba keeps its elementary timeline and gives the climax room to move", () => {
    expect(KARATSUBA_SEGMENTS.map((s) => s.id)).not.toContain("deeper");
    expect(totalDuration(KARATSUBA_SEGMENTS)).toBeGreaterThanOrEqual(55);
    expect(totalDuration(KARATSUBA_SEGMENTS)).toBeLessThanOrEqual(70);
    const byId = Object.fromEntries(KARATSUBA_SEGMENTS.map((s) => [s.id, s]));
    // `exponent`'s promised leaf-row pulse was an opacity no-op; the beat now
    // animates the leaf dots and two same-scale count bars, and is budgeted so.
    expect(SCENE_BEATS["karatsuba-cross-terms"]!.exponent!.leafPulse).toBeGreaterThan(0);
    expect(SCENE_BEATS["karatsuba-cross-terms"]!.exponent!.countUp).toBeGreaterThan(0);
    // The middle-term collapse is a travel now, not a cross-fade.
    expect(SCENE_BEATS["karatsuba-cross-terms"]!.share!.merge).toBeGreaterThan(0);
    // The old prediction gave 1.2s of think time.
    expect(byId.subtract!.duration).toBeGreaterThanOrEqual(7);
  });

  it("bst-lift inserts the degenerate chain one key at a time", () => {
    const ids = BST_LIFT_SEGMENTS.map((s) => s.id);
    expect(ids.indexOf("degenerate")).toBeLessThan(ids.indexOf("predict-gap"));
    const degenerate = BST_LIFT_SEGMENTS.find((s) => s.id === "degenerate")!;
    // Seven staggered moves plus six edges cannot fit the old 6.5s budget.
    expect(degenerate.duration).toBeGreaterThanOrEqual(7.5);
    expect(SCENE_BEATS["bst-lift-from-array"]!.degenerate!.insert).toBeGreaterThanOrEqual(4);
  });

  it("gives the enacted beats the time their new choreography needs", () => {
    const bySceneAndId = (segments: readonly { id: string; duration: number }[], id: string) =>
      segments.find((segment) => segment.id === id)!.duration;
    // solution-sets: the difference now TRAVELS to the origin.
    expect(bySceneAndId(SOLUTION_SETS_SEGMENTS, "difference")).toBeGreaterThanOrEqual(7);
    // linear-systems: b now visibly leaves the column line before the row picture.
    expect(bySceneAndId(SYSTEMS_SEGMENTS, "none")).toBeGreaterThanOrEqual(7);
    // subspaces-rank: the output cube deforms instead of fading in flat.
    expect(bySceneAndId(SUBSPACES_RANK_SEGMENTS, "reach")).toBeGreaterThanOrEqual(8);
    expect(bySceneAndId(SUBSPACES_RANK_SEGMENTS, "crush")).toBeGreaterThanOrEqual(7);
    // change-of-basis: the deformation is replayed over the eigenbasis.
    expect(bySceneAndId(CHANGE_OF_BASIS_SEGMENTS, "map-eigenbasis")).toBeGreaterThanOrEqual(8);
    // chapter 0: the slide is enacted rather than faded in already displaced.
    expect(bySceneAndId(CHAPTER0_SEGMENTS, "translation")).toBeGreaterThanOrEqual(6);
    // rank-nullity: the tokens travel in.
    expect(bySceneAndId(RANK_NULLITY_SEGMENTS, "budget")).toBeGreaterThanOrEqual(6);
    // matrix-composition: undo resets and re-applies A before undoing it.
    expect(bySceneAndId(MATRIX_COMPOSITION_SEGMENTS, "undo")).toBeGreaterThanOrEqual(7);
  });
});
