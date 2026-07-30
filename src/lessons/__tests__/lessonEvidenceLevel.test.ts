import { describe, expect, it } from "vitest";
import { limitsContinuityLesson } from "../limitsContinuity";
import { derivativeLocalLinearityLesson } from "../derivativeLocalLinearity";
import { integralAccumulationLesson } from "../integralAccumulation";
import { fundamentalTheoremLesson } from "../fundamentalTheorem";
import {
  CONSTRUCT_IN_EXPLORER_ID,
  EXERCISE_SEQUENCE_ID,
  type ExerciseSequenceConfig,
} from "../capabilities";
import type { ExerciseDefinition } from "../types";

/**
 * `CAPABILITY_EVIDENCE_CEILING` (src/lessons/evidence.ts) is a MAXIMUM: it
 * lets an `exercise-sequence` item claim up to E3 even when every one of its
 * steps is `multiple-choice` recognition. A 2026-07-30 package-level review
 * found several Package A items that had kept an E3 claim in their
 * mastery-contract for exactly that reason, after an earlier pass converted
 * their steps to multiple-choice — the capability's ceiling never stopped
 * being true, so nothing here caught the drift.
 *
 * This asserts each lesson's ACTUAL claim (the mastery-contract's §1d "Level"
 * column, mirrored below) against its ACTUAL step composition, independent of
 * what the capability's ceiling would merely permit:
 *
 *  - A claim above E2 on an `exercise-sequence` item requires at least one
 *    step that PRODUCES something (`text`, `numeric`, `vector`, `construct`),
 *    not just a selection among shown choices.
 *  - A standalone `multiple-choice` item may never claim above E2.
 *  - `construct-in-explorer` is the only capability that may claim E4.
 *
 * Update the level maps below in the SAME commit as any mastery-contract
 * change to a Level column, or this test and the docs will drift again.
 */

type ClaimedLevel = "E1" | "E2" | "E3" | "E4";

// Mirrors 01-limits-continuity/mastery-contract.md §1d.
const LIMITS_CONTINUITY_LEVELS: Record<string, ClaimedLevel> = {
  "lim-diagnose-definition": "E2",
  "lim-point-value-irrelevant": "E2",
  "lim-zero-over-zero-fresh": "E3",
  "lim-continuity-test": "E3",
  "lim-limit-not-continuity": "E4",
  "lim-repair-transfer": "E2",
  "lim-why-substitution-works": "E2",
  "lim-continuity-not-enough": "E2",
  "lim-choose-spacing": "E3",
  "lim-symbolic-recognition": "E1",
};

// Mirrors 02-derivative-local-linearity/mastery-contract.md §1d.
const DERIVATIVE_LOCAL_LINEARITY_LEVELS: Record<string, ClaimedLevel> = {
  "der-from-definition-fresh": "E3",
  "der-linearize-estimate": "E3",
  "der-three-names": "E3",
  "der-tangent-crosses": "E3",
  "der-differentiable-definition": "E2",
  "der-corner-slopes": "E4",
  "der-identify-derivative": "E1",
  "der-residual-remains": "E2",
  "der-applied-transfer": "E2",
};

// Mirrors 03-integral-accumulation/mastery-contract.md §1d.
const INTEGRAL_ACCUMULATION_LEVELS: Record<string, ClaimedLevel> = {
  "int-units-fresh": "E2",
  "int-estimate-table": "E3",
  "int-parabola-from-sum": "E3",
  "int-signed-transfer": "E4",
  "int-read-running-total": "E2",
  "int-scale-invariance": "E2",
  "int-same-machine": "E3",
  "int-bracket-fails": "E2",
};

// Mirrors 04-fundamental-theorem/mastery-contract.md §1d.
const FUNDAMENTAL_THEOREM_LEVELS: Record<string, ClaimedLevel> = {
  "ftc-evaluate-fresh": "E3",
  "ftc-differentiate-integral": "E3",
  "ftc-telescope-count": "E3",
  "ftc-why-collapse": "E2",
  "ftc-constant-cancels": "E2",
  "ftc-lower-limit-shift": "E2",
  "ftc-no-elementary-antiderivative": "E2",
  "ftc-falsify": "E2",
  "ftc-telescope-transfer": "E3",
  "ftc-corroborate": "E3",
};

/** A step that produces/constructs a fresh answer, rather than selecting among shown options. */
function isProducedStepKind(kind: string): boolean {
  return kind === "text" || kind === "numeric" || kind === "vector" || kind === "construct";
}

function assertLevelMatchesComposition(item: ExerciseDefinition, claimed: ClaimedLevel): void {
  if (item.type === "multiple-choice") {
    expect(
      claimed === "E1" || claimed === "E2",
      `${item.id}: a standalone multiple-choice item cannot claim above E2 (claimed ${claimed})`,
    ).toBe(true);
    return;
  }

  if (item.type !== "custom") {
    // numeric / vector / prediction / eigenvalue: genuine production. No ceiling issue here.
    return;
  }

  if (item.capabilityId === CONSTRUCT_IN_EXPLORER_ID) {
    // Open, predicate-graded construction — E4 is both the ceiling and the honest level.
    return;
  }

  if (item.capabilityId === EXERCISE_SEQUENCE_ID) {
    const { steps } = item.config as unknown as ExerciseSequenceConfig;
    const hasProducedStep = steps.some((s) => isProducedStepKind(s.kind));
    if (!hasProducedStep) {
      expect(
        claimed === "E1" || claimed === "E2",
        `${item.id}: every step is multiple-choice recognition, so it cannot claim above E2 (claimed ${claimed})`,
      ).toBe(true);
    }
    return;
  }

  throw new Error(`${item.id}: unrecognised capability "${item.capabilityId}" for this test`);
}

function checkLesson(
  name: string,
  items: readonly ExerciseDefinition[],
  levels: Record<string, ClaimedLevel>,
): void {
  describe(`${name} — claimed evidence level matches actual step composition`, () => {
    it("has exactly one claimed level per shipped item, and nothing stale", () => {
      const ids = new Set(items.map((i) => i.id));
      expect(Object.keys(levels).sort()).toEqual([...ids].sort());
    });

    for (const item of items) {
      const claimed = levels[item.id];
      it(`${item.id}: claimed ${claimed ?? "(missing)"} is honestly supported by its step composition`, () => {
        expect(claimed, `no claimed level recorded for "${item.id}"`).toBeDefined();
        assertLevelMatchesComposition(item, claimed);
      });
    }
  });
}

checkLesson("limits-continuity", limitsContinuityLesson.exercises ?? [], LIMITS_CONTINUITY_LEVELS);
checkLesson(
  "derivative-local-linearity",
  derivativeLocalLinearityLesson.exercises ?? [],
  DERIVATIVE_LOCAL_LINEARITY_LEVELS,
);
checkLesson(
  "integral-accumulation",
  integralAccumulationLesson.exercises ?? [],
  INTEGRAL_ACCUMULATION_LEVELS,
);
checkLesson(
  "fundamental-theorem",
  fundamentalTheoremLesson.exercises ?? [],
  FUNDAMENTAL_THEOREM_LEVELS,
);
