import { describe, expect, it } from "vitest";
import { getGradingCapability, requiresHumanScore, resolveCapabilityId } from "../capabilities";
import { MODULE_ITEMS, SYS_SPACED_TRICHOTOMY } from "../moduleItems";
import { snapshotItem } from "../attemptSnapshot";
import { solveLinearSystem } from "../../math/linearSystemsGeneral";

const PACKAGE_G_IDS = [
  "mod-select-method",
  "mod-transfer-classify",
  "mod-transfer-solset-fresh",
  "mod-cumulative-elim-solset",
  "mod-error-diagnose",
  "mod-proof-hyp",
  "mod-p2-applied-3x3",
  "mod-p2-applied-rect",
];

const SPACED_IDS = ["mod-spaced-trichotomy", "mod-spaced-uniqueness", "mod-spaced-rowops"];

const EXPECTED_IDS = [...PACKAGE_G_IDS, ...SPACED_IDS];

const HUMAN_SCORED = new Set([
  "mod-select-method",
  "mod-transfer-classify",
  "mod-error-diagnose",
  "mod-proof-hyp",
]);

describe("Package G module items", () => {
  it("authors exactly the required items (8 Package G + 3 spaced) with unique ids", () => {
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

  it("the fresh transfer item uses the produced solution-set capability", () => {
    const solset = MODULE_ITEMS.filter((e) => resolveCapabilityId(e) === "solution-set");
    expect(solset.map((e) => e.id).sort()).toEqual(["mod-transfer-solset-fresh"]);
  });

  it("the concrete elimination items capture produced elimination evidence", () => {
    const elim = MODULE_ITEMS.filter((e) => resolveCapabilityId(e) === "elimination-solution");
    expect(elim.map((e) => e.id).sort()).toEqual(
      ["mod-cumulative-elim-solset", "mod-p2-applied-3x3", "mod-p2-applied-rect"].sort(),
    );
  });

  it("mod-select-method does not name the two methods in the learner-facing prompt", () => {
    const select = MODULE_ITEMS.find((e) => e.id === "mod-select-method")!;
    expect(select.prompt.toLowerCase()).not.toMatch(/reachability|elimination/);
    // The expected methods live only in the post-commit rubric / model answer.
    if (select.type !== "custom") throw new Error("expected a custom exercise");
    const config = select.config as { rubricText: string; modelAnswer: string };
    expect((config.rubricText + config.modelAnswer).toLowerCase()).toMatch(/elimination/);
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

describe("Package H spaced-retrieval items", () => {
  it("authors the three spaced items as auto-graded multiple-choice (E1–E2 retention)", () => {
    for (const id of SPACED_IDS) {
      const item = MODULE_ITEMS.find((e) => e.id === id)!;
      expect(item, id).toBeDefined();
      expect(item.type, id).toBe("multiple-choice");
      expect(requiresHumanScore(item), id).toBe(false);
    }
  });

  it("the trichotomy item's correct choice matches the independently solved system", () => {
    // Fresh dependent + consistent 2×2 ⇒ infinitely many (the trichotomy branch).
    const sol = solveLinearSystem(SYS_SPACED_TRICHOTOMY.matrix, SYS_SPACED_TRICHOTOMY.rhs);
    expect(sol.consistent).toBe(true);
    expect(sol.freeCount).toBeGreaterThan(0);
    const item = MODULE_ITEMS.find((e) => e.id === "mod-spaced-trichotomy")!;
    if (item.type !== "multiple-choice") throw new Error("expected multiple-choice");
    expect(item.choices[item.correctChoice]).toMatch(/infinitely many/i);
  });

  it("the uniqueness item retrieves existence-≠-uniqueness (consistent + nonzero null ⇒ infinite)", () => {
    const item = MODULE_ITEMS.find((e) => e.id === "mod-spaced-uniqueness")!;
    if (item.type !== "multiple-choice") throw new Error("expected multiple-choice");
    expect(item.choices[item.correctChoice]).toMatch(/infinitely many/i);
  });

  it("the row-ops item marks the scale-by-zero (subtract-from-itself) move as illegal", () => {
    const item = MODULE_ITEMS.find((e) => e.id === "mod-spaced-rowops")!;
    if (item.type !== "multiple-choice") throw new Error("expected multiple-choice");
    // The illegal move is R3 -> R3 - R3 (scale by 0); adding a row to itself is legal.
    expect(item.choices[item.correctChoice]).toMatch(/R_3 - R_3/);
    expect(item.choices[item.correctChoice]).not.toMatch(/R_1 \+ R_1/);
  });

  it("spaced systems are numerically distinct from every Package G fixture", () => {
    // Guard against accidentally reusing a lesson/Package-G system as a 'fresh' one.
    const g = [
      "[[1,2,-1],[2,4,1]]",
      "[[1,1,1],[1,2,3],[2,3,4]]",
      "[[2,1,-1],[4,1,1],[2,0,2]]",
      "[[1,1],[1,-1],[2,1]]",
      "[[1,3],[2,6]]",
      "[[1,2],[2,4]]",
      "[[2,1],[1,3]]",
      "[[1,2],[3,4]]",
    ];
    expect(g).not.toContain(JSON.stringify(SYS_SPACED_TRICHOTOMY.matrix));
  });
});
