import { describe, expect, it } from "vitest";
import { CALCULUS_TECHNIQUE_MODULE_ITEMS } from "../calculusTechniqueModuleItems";
import { requiresHumanScore } from "../capabilities";
import { snapshotItem } from "../attemptSnapshot";
import { ITEM_ASSESSMENT_META } from "../assessmentManifest";
import { MODULE_ITEMS } from "../moduleItems";
import { getModuleSet, resolveModuleSet } from "../moduleSets";

const IDS = [
  "mod-calctech-mixed-chain-matrix",
  "mod-calctech-mixed-optimize-composite",
  "mod-calctech-method-mix",
  "mod-calctech-diagnose-limit",
  "mod-calctech-retain-du-not-proof",
  "mod-calctech-retain-necessary-not-sufficient",
  "mod-calctech-retain-antiderivative-check",
  "mod-calctech-retain-convergence-limit",
  "mod-calctech-mock-derivative",
  "mod-calctech-mock-optimize",
  "mod-calctech-mock-improper",
] as const;

const HUMAN = new Set<string>(IDS.slice(0, 4));
const SETS = {
  "calculus-technique-review": IDS.slice(0, 4),
  "calculus-technique-retention": IDS.slice(4, 8),
  "calculus-technique-mock": IDS.slice(8, 11),
} as const;

describe("calculus-technique Gate-9 items", () => {
  it("registers exactly eleven unique module-owned items", () => {
    const ids = CALCULUS_TECHNIQUE_MODULE_ITEMS.map((item) => item.id);
    expect(ids).toEqual(IDS);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of IDS) expect(MODULE_ITEMS.some((item) => item.id === id), id).toBe(true);
  });

  it("routes only the four written integrations to human scoring with versioned rubrics", () => {
    for (const item of CALCULUS_TECHNIQUE_MODULE_ITEMS) {
      expect(requiresHumanScore(item), item.id).toBe(HUMAN.has(item.id));
      if (!HUMAN.has(item.id)) continue;
      const snapshot = snapshotItem(item);
      expect(snapshot.requiresReview, item.id).toBe(true);
      expect(snapshot.rubric?.rubricId, item.id).toBe(item.id);
      expect(snapshot.rubric?.rubricVersion, item.id).toBe(1);
    }
  });

  it("registers three disjoint exam sets and a ten-minute auto-graded mock", () => {
    const seen = new Set<string>();
    for (const [setId, expected] of Object.entries(SETS)) {
      const set = getModuleSet(setId)!;
      expect(set.moduleId, setId).toBe("calculus-technique");
      expect(set.mode, setId).toBe("exam");
      expect(resolveModuleSet(setId).items.map((item) => item.id), setId).toEqual(expected);
      for (const id of set.itemIds) {
        expect(seen.has(id), `${id} appears in multiple sets`).toBe(false);
        seen.add(id);
      }
    }
    const mock = getModuleSet("calculus-technique-mock")!;
    expect(mock.timeLimitSec).toBe(600);
    for (const item of resolveModuleSet(mock.id).items) expect(requiresHumanScore(item)).toBe(false);
    expect([...seen].sort()).toEqual([...IDS].sort());
  });

  it("declares the inherited E5 integrations, honest E1 retention, and method-selection guard", () => {
    for (const id of IDS.slice(0, 3)) {
      expect(ITEM_ASSESSMENT_META[id]!.evidenceTarget, id).toBe("E5");
    }
    expect(ITEM_ASSESSMENT_META["mod-calctech-method-mix"]!.methodSelection).toBe(true);
    for (const id of IDS.slice(4, 8)) {
      expect(ITEM_ASSESSMENT_META[id]!.evidenceTarget, id).toBe("E1");
    }
    for (const id of IDS.slice(8)) {
      expect(ITEM_ASSESSMENT_META[id]!.evidenceTarget, id).toBe("E3");
    }
  });

  it("pins the timed-set arithmetic independently", () => {
    const derivative = 24 * 1 * (3 * 1 ** 2 + 1) ** 3;
    expect(derivative).toBe(1536);
    const g = (x: number) => x ** 3 - 3 * x;
    expect([-1, 1, 2].map(g)).toEqual([2, -2, 2]);
    expect(5 * (1 / 5)).toBe(1); // [-x^-5]_1^∞
  });
});
