/**
 * Grading-contract harness (ADR-002 safeguard). NOT a `*.test.ts` file — it
 * exports helpers that `gradingContract.test.ts` drives, so vitest never collects
 * it as a suite on its own.
 *
 * `describeGradingContract(exercise, { mustAccept, mustReject })` runs, for one
 * auto-graded item: every accepted answer grades correct (and round-trips
 * through the capability), and every rejected answer grades incorrect — a decode
 * error counts as a rejection. The rejected set is where the recurring defect
 * classes are pinned: an all-blank answer, a blank in a cell whose TRUE value is
 * 0 (blank ≠ 0), a zero-filled blank, a mathematically-related-but-wrong answer,
 * and (text) an accepted string embedded in a longer one. A grader that regressed
 * to coercing null→0, crediting incomplete objects, or substring-matching would
 * flip one of these rejects to an accept and fail loudly.
 */

import { describe, expect, it } from "vitest";
import type { JsonValue } from "../../platform/json";
import { getGradingCapability } from "../capabilities";
import { gradeExercise } from "../grading";
import type { ExerciseDefinition } from "../types";

export type NamedAnswer = { name: string; answer: JsonValue };

export interface GradingContractSpec {
  /** ≥1 fully-correct serialized answers; each must grade correct + round-trip. */
  mustAccept: readonly NamedAnswer[];
  /** Wrong / incomplete / blank answers; each must grade incorrect (or fail to decode). */
  mustReject: readonly NamedAnswer[];
}

/** Grade a serialized answer through the capability; may throw on a decode error. */
function gradesCorrect(exercise: ExerciseDefinition, answer: JsonValue): boolean {
  const cap = getGradingCapability(exercise);
  const parsed = cap.parseAnswer(answer);
  return gradeExercise(exercise, parsed).correct;
}

export function describeGradingContract(
  exercise: ExerciseDefinition,
  spec: GradingContractSpec,
): void {
  describe(`grading contract: ${exercise.id}`, () => {
    const cap = getGradingCapability(exercise);

    it("declares accepted and rejected answers", () => {
      expect(spec.mustAccept.length, "needs ≥1 accepted answer").toBeGreaterThan(0);
      expect(spec.mustReject.length, "needs adversarial rejected answers").toBeGreaterThan(0);
    });

    for (const { name, answer } of spec.mustAccept) {
      it(`accepts: ${name}`, () => {
        const parsed = cap.parseAnswer(answer);
        expect(gradeExercise(exercise, parsed).correct).toBe(true);
        // Round-trip: serialize → re-parse must not throw.
        const reserialized = cap.serializeAnswer(parsed);
        expect(() => cap.parseAnswer(reserialized)).not.toThrow();
      });
    }

    for (const { name, answer } of spec.mustReject) {
      it(`rejects: ${name}`, () => {
        let accepted = false;
        try {
          accepted = gradesCorrect(exercise, answer);
        } catch {
          accepted = false; // a decode error is a valid rejection
        }
        expect(accepted, `"${name}" was wrongly accepted`).toBe(false);
      });
    }
  });
}

/**
 * One variant per position of a flat numeric array with that position blanked
 * (`null`) — INCLUDING positions whose true value is 0. Feeding these as rejects
 * proves no blanked cell is credited (the structural kill for blank ≠ 0).
 */
export function blankEachCell(base: readonly (number | null)[]): (number | null)[][] {
  return base.map((_, i) => base.map((v, j) => (i === j ? null : v)));
}
