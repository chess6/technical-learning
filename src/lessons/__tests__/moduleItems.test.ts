import { describe, expect, it } from "vitest";
import { getGradingCapability, requiresHumanScore, resolveCapabilityId } from "../capabilities";
import { MODULE_ITEMS } from "../moduleItems";
import { snapshotItem } from "../attemptSnapshot";

const EXPECTED_IDS = [
  "mod-select-method",
  "mod-transfer-classify",
  "mod-transfer-solset-fresh",
  "mod-cumulative-elim-solset",
  "mod-error-diagnose",
  "mod-proof-hyp",
  "mod-p2-applied-3x3",
  "mod-p2-applied-rect",
];

const HUMAN_SCORED = new Set([
  "mod-select-method",
  "mod-transfer-classify",
  "mod-error-diagnose",
  "mod-proof-hyp",
]);

describe("Package G module items", () => {
  it("authors exactly the eight required items with unique ids", () => {
    const ids = MODULE_ITEMS.map((e) => e.id);
    expect(ids.sort()).toEqual([...EXPECTED_IDS].sort());
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every item resolves to a registered grading capability", () => {
    for (const item of MODULE_ITEMS) {
      expect(() => getGradingCapability(item), item.id).not.toThrow();
    }
  });

  it("routes the written reasoning/proof items to human scoring, others auto", () => {
    for (const item of MODULE_ITEMS) {
      expect(requiresHumanScore(item), item.id).toBe(HUMAN_SCORED.has(item.id));
    }
  });

  it("solution-set items are the produced auto items", () => {
    const auto = MODULE_ITEMS.filter((e) => resolveCapabilityId(e) === "solution-set");
    expect(auto.map((e) => e.id).sort()).toEqual(
      [
        "mod-cumulative-elim-solset",
        "mod-p2-applied-3x3",
        "mod-p2-applied-rect",
        "mod-transfer-solset-fresh",
      ].sort(),
    );
  });

  it("snapshots human-scored items with a versioned rubric", () => {
    for (const id of HUMAN_SCORED) {
      const item = MODULE_ITEMS.find((e) => e.id === id)!;
      const snap = snapshotItem(item);
      expect(snap.requiresReview, id).toBe(true);
      expect(snap.rubric, id).toBeDefined();
      expect(snap.rubric!.rubricId).toBe(id);
      expect(snap.rubric!.rubricVersion).toBeGreaterThanOrEqual(1);
      expect(snap.rubric!.rubricText.length).toBeGreaterThan(20);
    }
  });

  it("snapshots are JSON-safe and reproducible for auto items", () => {
    const snap = snapshotItem(MODULE_ITEMS.find((e) => e.id === "mod-transfer-solset-fresh")!);
    expect(snap.requiresReview).toBe(false);
    expect(snap.capabilityId).toBe("solution-set");
    expect(() => JSON.stringify(snap)).not.toThrow();
  });

  it("does not put raw array notation in learner-facing prompts", () => {
    for (const item of MODULE_ITEMS) {
      expect(item.prompt, item.id).not.toMatch(/\[\[/);
    }
  });
});
