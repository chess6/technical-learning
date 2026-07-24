import { describe, expect, it } from "vitest";
import {
  getModuleSet,
  listModuleSets,
  resolveModuleSet,
  ModuleSetResolutionError,
  PRIMARY_SET_IDS,
  SPACED_SET_IDS,
  SPACED_EXERCISE_IDS,
  isPrimarySetId,
  isSpacedSetId,
  spacedSetForExercise,
  spacedExerciseForSet,
} from "../moduleSets";

describe("module sets", () => {
  it("registers the systems–elimination review set", () => {
    const set = getModuleSet("systems-elimination-review");
    expect(set).toBeDefined();
    expect(set?.moduleId).toBe("systems-elimination");
    expect(listModuleSets().length).toBeGreaterThan(0);
  });

  it("resolves every item id to a real lesson exercise, in order", () => {
    const { set, items } = resolveModuleSet("systems-elimination-review");
    expect(items).toHaveLength(set.itemIds.length);
    expect(items.map((e) => e.id)).toEqual([...set.itemIds]);
  });

  it("interleaves auto and human-scored items across L3–L5", () => {
    const { items } = resolveModuleSet("systems-elimination-review");
    const mc = items.filter((e) => e.type === "multiple-choice");
    const selfChecks = items.filter(
      (e) => e.type === "custom" && e.capabilityId === "self-check",
    );
    expect(mc.length).toBeGreaterThan(0);
    expect(selfChecks.length).toBeGreaterThan(0);
  });

  it("throws for an unknown set", () => {
    expect(() => resolveModuleSet("nope")).toThrow(ModuleSetResolutionError);
  });
});

describe("Package G module sets", () => {
  it("registers the transfer and applied sets with explicit versions", () => {
    for (const id of ["systems-elimination-transfer", "systems-elimination-applied"]) {
      const set = getModuleSet(id);
      expect(set, id).toBeDefined();
      expect(set?.moduleId).toBe("systems-elimination");
      expect(set?.mode).toBe("exam");
      expect(typeof set?.version).toBe("number");
      expect(set?.version).toBeGreaterThanOrEqual(1);
    }
  });

  it("resolves every Package G item id, in deterministic authored order", () => {
    const transfer = resolveModuleSet("systems-elimination-transfer");
    expect(transfer.items.map((e) => e.id)).toEqual([
      "mod-select-method",
      "mod-transfer-classify",
      "mod-transfer-solset-fresh",
      "mod-error-diagnose",
      "mod-proof-hyp",
    ]);
    const applied = resolveModuleSet("systems-elimination-applied");
    expect(applied.items.map((e) => e.id)).toEqual([
      "mod-p2-applied-3x3",
      "mod-cumulative-elim-solset",
      "mod-p2-applied-rect",
    ]);
  });

  it("has unique set ids across all registered sets", () => {
    const ids = listModuleSets().map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("Package H spaced sets & groupings", () => {
  it("registers three one-item spaced sets in deterministic order", () => {
    for (const id of SPACED_SET_IDS) {
      const set = getModuleSet(id);
      expect(set, id).toBeDefined();
      expect(set?.mode).toBe("exam");
      expect(set?.itemIds).toHaveLength(1);
    }
    const { items } = resolveModuleSet("systems-elimination-spaced-trichotomy");
    expect(items.map((e) => e.id)).toEqual(["mod-spaced-trichotomy"]);
  });

  it("keeps primary and spaced set ids disjoint", () => {
    for (const id of SPACED_SET_IDS) expect(PRIMARY_SET_IDS).not.toContain(id);
    for (const id of PRIMARY_SET_IDS) expect(SPACED_SET_IDS).not.toContain(id);
    expect(PRIMARY_SET_IDS.every(isPrimarySetId)).toBe(true);
    expect(SPACED_SET_IDS.every(isSpacedSetId)).toBe(true);
    expect(SPACED_SET_IDS.some(isPrimarySetId)).toBe(false);
  });

  it("round-trips the fixed spaced set ↔ exercise mapping", () => {
    expect(SPACED_EXERCISE_IDS).toHaveLength(SPACED_SET_IDS.length);
    for (const setId of SPACED_SET_IDS) {
      const ex = spacedExerciseForSet(setId)!;
      expect(SPACED_EXERCISE_IDS).toContain(ex);
      expect(spacedSetForExercise(ex)).toBe(setId);
    }
    expect(spacedSetForExercise("not-a-spaced-item")).toBeUndefined();
    expect(spacedExerciseForSet("systems-elimination-review")).toBeUndefined();
  });

  it("mixes auto-graded solution-set items with human-scored writing", () => {
    const transfer = resolveModuleSet("systems-elimination-transfer");
    const human = transfer.items.filter(
      (e) => e.type === "custom" && e.capabilityId === "self-check",
    );
    const auto = transfer.items.filter(
      (e) => e.type === "custom" && e.capabilityId === "solution-set",
    );
    expect(human.length).toBeGreaterThan(0);
    expect(auto.length).toBeGreaterThan(0);
  });
});
