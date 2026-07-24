import { describe, expect, it } from "vitest";
import {
  getModuleSet,
  listModuleSets,
  resolveModuleSet,
  ModuleSetResolutionError,
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
