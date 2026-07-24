import { describe, expect, it } from "vitest";
import { snapshotItem, definitionFromSnapshot, gradeSnapshot } from "../attemptSnapshot";
import { SELF_CHECK_ID } from "../capabilities";
import type { ExerciseDefinition } from "../types";

const mc: ExerciseDefinition = {
  id: "sys-count-none",
  type: "multiple-choice",
  prompt: "How many solutions?",
  choices: ["none", "one", "infinite"],
  correctChoice: 0,
  explanation: "b is off the columns' line.",
};

const proof: ExerciseDefinition = {
  id: "sys-prove-trichotomy",
  type: "custom",
  capabilityId: SELF_CHECK_ID,
  prompt: "Prove the trichotomy.",
  config: { modelAnswer: "…", rubricId: "trichotomy", rubricVersion: 3, rubricText: "Cover all cases." },
};

describe("snapshotItem", () => {
  it("freezes a self-contained, JSON-safe definition + capability metadata", () => {
    const snap = snapshotItem(mc);
    expect(snap.exerciseId).toBe("sys-count-none");
    expect(snap.capabilityId).toBe("multiple-choice");
    expect(snap.answerSchemaVersion).toBe(1);
    expect(snap.requiresReview).toBe(false);
    // Round-trips as JSON (reproducible).
    expect(JSON.parse(JSON.stringify(snap))).toEqual(snap);
    // Reconstructs to the same definition.
    expect(definitionFromSnapshot(snap)).toEqual(mc);
  });

  it("marks human-scored items and captures the rubric snapshot", () => {
    const snap = snapshotItem(proof);
    expect(snap.requiresReview).toBe(true);
    expect(snap.rubric).toEqual({
      rubricId: "trichotomy",
      rubricVersion: 3,
      rubricText: "Cover all cases.",
      modelAnswer: "…",
    });
  });
});

describe("gradeSnapshot", () => {
  it("grades a captured answer against the snapshot (not the live registry)", () => {
    const snap = snapshotItem(mc);
    const auto = gradeSnapshot(snap, { choice: 0 });
    expect(auto.kind).toBe("graded");
    if (auto.kind === "graded") expect(auto.correct).toBe(true);
  });

  it("returns omitted for an unanswered item", () => {
    expect(gradeSnapshot(snapshotItem(mc), null)).toEqual({ kind: "omitted" });
  });

  it("returns a tagged error for an undecodable stored answer", () => {
    const auto = gradeSnapshot(snapshotItem(mc), { not: "a choice" });
    expect(auto.kind).toBe("error");
  });

  it("is stable if the live exercise later changes (snapshot wins)", () => {
    const snap = snapshotItem(mc);
    // Simulate a later edit: a DIFFERENT definition would grade differently, but
    // the snapshot preserves correctChoice = 0.
    const auto = gradeSnapshot(snap, { choice: 1 });
    expect(auto.kind).toBe("graded");
    if (auto.kind === "graded") expect(auto.correct).toBe(false);
  });
});
