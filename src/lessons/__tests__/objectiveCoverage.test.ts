import { describe, expect, it } from "vitest";
import { lessons } from "../registry";
import { CAPABILITY_EVIDENCE_CEILING, withinCeiling } from "../evidence";
import type { ExerciseDefinition } from "../types";

/**
 * Objective coverage (ADR-004) — the replacement for the fixed exercise quota
 * "at least two exercises and a checkpoint". A `lesson-owned` objective must
 * resolve to at least one item whose capability ceiling reaches the
 * objective's claimed `evidenceLevel`; a `module-owned` or `course-owned`
 * objective is not required to name any lesson exercise at all, because its
 * evidence is discharged by that unit's module set instead.
 *
 * No registered lesson declares `objectives` yet (all 19 still use the
 * required `learningObjectives: string[]`, which this validator does not
 * touch) — these tests exercise real logic against the (currently empty) set
 * of lessons that opt in, and will start asserting real coverage the moment a
 * lesson migrates.
 */
function capabilityIdFor(exercise: ExerciseDefinition): string {
  return exercise.type === "custom" ? exercise.capabilityId : exercise.type;
}

describe("objective coverage for lessons that declare `objectives`", () => {
  it("has unique objective ids within each lesson", () => {
    for (const lesson of lessons) {
      const objectives = lesson.objectives ?? [];
      const ids = objectives.map((objective) => objective.id);
      expect(new Set(ids).size, `Duplicate objective id in lesson "${lesson.id}"`).toBe(
        ids.length,
      );
    }
  });

  it("resolves every lesson-owned objective to a resolvable item at or above its claimed level", () => {
    for (const lesson of lessons) {
      const exerciseById = new Map<string, ExerciseDefinition>(
        (lesson.exercises ?? []).map((exercise) => [exercise.id, exercise]),
      );

      for (const objective of lesson.objectives ?? []) {
        if (objective.evidence !== "lesson-owned") continue;

        const itemIds = objective.itemIds ?? [];
        expect(
          itemIds.length,
          `Objective "${objective.id}" in lesson "${lesson.id}" is lesson-owned but names no itemIds`,
        ).toBeGreaterThan(0);

        const meetsLevel = itemIds.some((itemId) => {
          const exercise = exerciseById.get(itemId);
          if (!exercise) return false;
          const ceiling = CAPABILITY_EVIDENCE_CEILING[capabilityIdFor(exercise)];
          if (!ceiling) return false;
          return withinCeiling(objective.evidenceLevel, ceiling);
        });

        expect(
          meetsLevel,
          `Objective "${objective.id}" in lesson "${lesson.id}" claims ${objective.evidenceLevel} but no itemId resolves to an exercise whose capability ceiling reaches that level`,
        ).toBe(true);
      }
    }
  });

  it("does not require module-owned or course-owned objectives to name lesson exercises", () => {
    for (const lesson of lessons) {
      for (const objective of lesson.objectives ?? []) {
        if (objective.evidence === "lesson-owned") continue;
        // No itemIds requirement — evidence lives in that unit's module set.
        // This is a documentation-shaped assertion: it only confirms the
        // field stays legitimately optional for these two evidence owners.
        expect(objective.evidence).toMatch(/^(module|course)-owned$/);
      }
    }
  });
});
