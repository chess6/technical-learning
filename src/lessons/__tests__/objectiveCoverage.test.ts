import { describe, expect, it } from "vitest";
import { lessons } from "../registry";
import { CAPABILITY_EVIDENCE_CEILING, withinCeiling } from "../evidence";
import {
  ITEM_ASSESSMENT_META,
  evidenceContradictions,
  type ItemAssessmentMeta,
} from "../assessmentManifest";
import type { EvidenceLevel } from "../evidence";
import type { ExerciseDefinition, LessonObjective } from "../types";

/**
 * Objective coverage (ADR-004) — the replacement for the fixed exercise quota
 * "at least two exercises and a checkpoint".
 *
 * **A capability ceiling is NOT evidence.** `evidence.ts` says so explicitly:
 * the ceiling is what a capture interface *could ever* support, "a *necessary*
 * bound... emphatically NOT *sufficient*." An earlier version of this file
 * checked only the ceiling, which meant a lesson-owned objective could claim
 * E3 on the strength of a numeric input field being able, in principle, to
 * record E3 — with no statement anywhere that this *particular* item does.
 *
 * Coverage now requires an item satisfying all five conditions:
 *   1. resolves to a real exercise on the lesson;
 *   2. has an explicit `ITEM_ASSESSMENT_META` entry (a deliberate claim, not an
 *      inference from its input widget);
 *   3. declares an `evidenceTarget` at least as high as the objective claims;
 *   4. does not exceed its capability's ceiling;
 *   5. has an `evidenceBasis` that does not contradict the claim.
 *
 * `ITEM_ASSESSMENT_META` is the single source of truth for both module items
 * and lesson exercises — deliberately not a second registry, which would drift.
 */
function capabilityIdFor(exercise: ExerciseDefinition): string {
  return exercise.type === "custom" ? exercise.capabilityId : exercise.type;
}

/** Why a given itemId fails to cover the objective, or `null` when it covers it. */
export function coverageFailure(
  objective: LessonObjective,
  itemId: string,
  exerciseById: Map<string, ExerciseDefinition>,
  meta: Record<string, ItemAssessmentMeta> = ITEM_ASSESSMENT_META,
): string | null {
  const exercise = exerciseById.get(itemId);
  if (!exercise) return `itemId "${itemId}" does not resolve to an exercise on this lesson`;

  const itemMeta = meta[itemId];
  if (!itemMeta) {
    return `item "${itemId}" has no ITEM_ASSESSMENT_META entry — a capability ceiling alone is not evidence (see evidence.ts)`;
  }

  const ceiling = CAPABILITY_EVIDENCE_CEILING[capabilityIdFor(exercise)];
  if (!ceiling) return `item "${itemId}" uses a capability with no declared ceiling`;

  if (!withinCeiling(itemMeta.evidenceTarget, ceiling)) {
    return `item "${itemId}" claims ${itemMeta.evidenceTarget} but its capability ceiling is ${ceiling}`;
  }
  if (!withinCeiling(objective.evidenceLevel, itemMeta.evidenceTarget)) {
    return `item "${itemId}" declares evidenceTarget ${itemMeta.evidenceTarget}, below the objective's claimed ${objective.evidenceLevel}`;
  }
  // Checked at the ITEM's own declared level, which is >= the objective's by
  // the test just above — so an E4 objective forces an E4+ item, whose basis is
  // then held to the E4 bar. Uses the SHARED definition, so this can no longer
  // drift below what module items are held to.
  const contra = evidenceContradictions(itemMeta.evidenceTarget, itemMeta.evidenceBasis);
  if (contra.length > 0) {
    return `item "${itemId}" has an evidenceBasis contradicting the claim (${contra.join(", ")})`;
  }
  return null;
}

describe("objective coverage for lessons that declare `objectives`", () => {
  it("has unique objective ids within each lesson", () => {
    for (const lesson of lessons) {
      const ids = (lesson.objectives ?? []).map((o) => o.id);
      expect(new Set(ids).size, `Duplicate objective id in lesson "${lesson.id}"`).toBe(
        ids.length,
      );
    }
  });

  it("covers every lesson-owned objective with an item carrying an explicit, sufficient, uncontradicted claim", () => {
    const problems: string[] = [];
    for (const lesson of lessons) {
      const exerciseById = new Map<string, ExerciseDefinition>(
        (lesson.exercises ?? []).map((e) => [e.id, e]),
      );
      for (const objective of lesson.objectives ?? []) {
        if (objective.evidence !== "lesson-owned") continue;
        const itemIds = objective.itemIds ?? [];
        if (itemIds.length === 0) {
          problems.push(`${lesson.id}/${objective.id}: lesson-owned but names no itemIds`);
          continue;
        }
        const failures = itemIds.map((id) => coverageFailure(objective, id, exerciseById));
        if (failures.every((f) => f !== null)) {
          problems.push(
            `${lesson.id}/${objective.id} (claims ${objective.evidenceLevel}) — no item covers it:\n` +
              failures.map((f, i) => `      ${itemIds[i]}: ${f}`).join("\n"),
          );
        }
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("does not require module-owned or course-owned objectives to name lesson exercises", () => {
    for (const lesson of lessons) {
      for (const objective of lesson.objectives ?? []) {
        if (objective.evidence === "lesson-owned") continue;
        expect(objective.evidence).toMatch(/^(module|course)-owned$/);
      }
    }
  });
});

/**
 * Negative cases. Each isolates one of the five conditions and proves coverage
 * FAILS without it — otherwise a green suite would say nothing about whether
 * the contract is actually enforced.
 */
describe("objective coverage rejects insufficient evidence", () => {
  const objective = (level: EvidenceLevel): LessonObjective => ({
    id: "obj",
    text: "an objective",
    evidence: "lesson-owned",
    evidenceLevel: level,
    itemIds: ["ex1"],
  });

  const numericExercise = {
    id: "ex1",
    type: "numeric",
    tier: "drill",
    prompt: "p",
    answer: 1,
    explanation: "e",
  } as unknown as ExerciseDefinition;

  const exerciseById = new Map<string, ExerciseDefinition>([["ex1", numericExercise]]);

  const basis = {
    freshness: "fresh-instance",
    unfamiliarity: "near",
    integration: "single-outcome",
    scaffolding: "none",
    scoringAuthority: "auto",
  } as const;

  it("fails when the capability ceiling is high enough but there is NO metadata", () => {
    // `numeric` has ceiling E3, so a ceiling-only check would have PASSED this.
    const failure = coverageFailure(objective("E3"), "ex1", exerciseById, {});
    expect(failure).toMatch(/no ITEM_ASSESSMENT_META entry/);
  });

  it("fails when the explicit evidence target is below the objective's claim", () => {
    const failure = coverageFailure(objective("E3"), "ex1", exerciseById, {
      ex1: { evidenceTarget: "E2", methodSelection: false, evidenceBasis: basis },
    });
    expect(failure).toMatch(/below the objective's claimed E3/);
  });

  /**
   * Contradiction cases. The rule is LEVEL-AWARE: a reused fixture and a
   * familiar drill are what E2/E3 items are supposed to be, and only
   * contradict a claim of transfer (E4+). These pin both halves — that the
   * high bar bites, and that it does not wrongly reject the drill tier.
   */
  const constructExercise = {
    id: "ex2",
    type: "custom",
    capabilityId: "construct-in-explorer", // ceiling E4
    tier: "transfer",
    prompt: "p",
  } as unknown as ExerciseDefinition;
  const constructById = new Map<string, ExerciseDefinition>([["ex2", constructExercise]]);

  it("fails an E4 claim backed by a REUSED, FAMILIAR item", () => {
    // The reviewer's adversarial case. The previous lesson-side filter checked
    // only heavy scaffolding and self-marking, so this was accepted.
    const failure = coverageFailure(objective("E4"), "ex2", constructById, {
      ex2: {
        evidenceTarget: "E4",
        methodSelection: false,
        evidenceBasis: {
          ...basis,
          freshness: "reused-fixture",
          unfamiliarity: "familiar-drill",
        },
      },
    });
    expect(failure).toMatch(/reused fixture/);
    expect(failure).toMatch(/familiar drill/);
  });

  it("fails an E4 claim that is self-marked or heavily scaffolded", () => {
    const selfMarked = coverageFailure(objective("E4"), "ex2", constructById, {
      ex2: {
        evidenceTarget: "E4",
        methodSelection: false,
        evidenceBasis: { ...basis, scoringAuthority: "self-marked" },
      },
    });
    expect(selfMarked).toMatch(/self-marked/);

    const scaffolded = coverageFailure(objective("E4"), "ex2", constructById, {
      ex2: {
        evidenceTarget: "E4",
        methodSelection: false,
        evidenceBasis: { ...basis, scaffolding: "heavy" },
      },
    });
    expect(scaffolded).toMatch(/heavy scaffolding/);
  });

  it("does NOT reject a reused, familiar item at E2/E3 — that is the drill tier", () => {
    // Applying the E4 grounds at every level would reject every drill in the
    // course, including the karatsuba items that legitimately evidence E2/E3.
    const failure = coverageFailure(objective("E3"), "ex1", exerciseById, {
      ex1: {
        evidenceTarget: "E3",
        methodSelection: false,
        evidenceBasis: {
          ...basis,
          freshness: "reused-fixture",
          unfamiliarity: "familiar-drill",
        },
      },
    });
    expect(failure).toBeNull();
  });

  it("fails when the claimed target exceeds the capability ceiling", () => {
    const failure = coverageFailure(objective("E3"), "ex1", exerciseById, {
      ex1: { evidenceTarget: "E5", methodSelection: false, evidenceBasis: basis },
    });
    expect(failure).toMatch(/capability ceiling is E3/);
  });

  it("fails when the itemId does not resolve", () => {
    const failure = coverageFailure(objective("E3"), "missing", exerciseById, {});
    expect(failure).toMatch(/does not resolve/);
  });

  it("passes only when every condition holds", () => {
    const failure = coverageFailure(objective("E3"), "ex1", exerciseById, {
      ex1: { evidenceTarget: "E3", methodSelection: false, evidenceBasis: basis },
    });
    expect(failure).toBeNull();
  });
});
