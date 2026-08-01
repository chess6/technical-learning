import { describe, expect, it } from "vitest";
import { boundaryAwareDerivative, riemannSum } from "../../math";
import {
  CALCULUS_FOUNDATIONS_MODULE_ITEMS,
  MOD_EX_COOLANT,
  MOD_EX_DIALYSIS,
  MOD_EX_FURNACE,
  MOD_EX_REACTOR,
  MOD_EX_TURBINE,
} from "../calculusFoundationsModuleItems";
import { getGradingCapability, requiresHumanScore } from "../capabilities";
import { CALCULUS_FIXTURES } from "../../math/calculus";
import { MODULE_ITEMS, SYSTEMS_ELIMINATION_ITEMS } from "../moduleItems";
import { STRUCTURE_MODULE_ITEMS } from "../structureModuleItems";
import { getModuleSet, resolveModuleSet } from "../moduleSets";
import { snapshotItem } from "../attemptSnapshot";
import { ITEM_ASSESSMENT_META } from "../assessmentManifest";

const EXPECTED_IDS = [
  "mod-calcfound-limit-in-derivative",
  "mod-calcfound-mixed-rate-total",
  "mod-calcfound-mixed-ftc",
  "mod-calcfound-select-method",
  "mod-calcfound-diagnose-signed-split",
  "mod-calcfound-transfer-bracket-window",
  "mod-calcfound-retain-point-value",
  "mod-calcfound-retain-diff-cont",
  "mod-calcfound-retain-signed",
  "mod-calcfound-retain-existence",
  "mod-calcfound-mock-limit",
  "mod-calcfound-mock-total",
  "mod-calcfound-mock-slope-of-total",
];

const HUMAN_SCORED = new Set([
  "mod-calcfound-mixed-ftc",
  "mod-calcfound-select-method",
  "mod-calcfound-diagnose-signed-split",
]);

describe("calculus-foundations module items — registration", () => {
  it("authors exactly the thirteen Gate 9 items, with unique ids", () => {
    const ids = CALCULUS_FOUNDATIONS_MODULE_ITEMS.map((e) => e.id);
    expect(ids.sort()).toEqual([...EXPECTED_IDS].sort());
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is included in MODULE_ITEMS without colliding with another module", () => {
    const all = MODULE_ITEMS.map((e) => e.id);
    expect(new Set(all).size).toBe(all.length);
    expect(all).toHaveLength(
      SYSTEMS_ELIMINATION_ITEMS.length +
        STRUCTURE_MODULE_ITEMS.length +
        CALCULUS_FOUNDATIONS_MODULE_ITEMS.length,
    );
    for (const id of EXPECTED_IDS) expect(all).toContain(id);
  });

  it("every item resolves to a registered grading capability", () => {
    for (const item of CALCULUS_FOUNDATIONS_MODULE_ITEMS) {
      expect(() => getGradingCapability(item), item.id).not.toThrow();
    }
  });

  it("routes the written-reasoning items to human scoring, others auto", () => {
    for (const item of CALCULUS_FOUNDATIONS_MODULE_ITEMS) {
      expect(requiresHumanScore(item), item.id).toBe(HUMAN_SCORED.has(item.id));
    }
  });

  it("snapshots the human-scored items with a versioned rubric", () => {
    for (const id of HUMAN_SCORED) {
      const item = CALCULUS_FOUNDATIONS_MODULE_ITEMS.find((e) => e.id === id)!;
      const snap = snapshotItem(item);
      expect(snap.requiresReview, id).toBe(true);
      expect(snap.rubric, id).toBeDefined();
      expect(snap.rubric!.rubricId).toBe(id);
      expect(snap.rubric!.rubricVersion).toBeGreaterThanOrEqual(1);
      expect(snap.rubric!.rubricText.length).toBeGreaterThan(20);
    }
  });

  it("uses multiple choice ONLY for the delayed-retention items", () => {
    const mc = CALCULUS_FOUNDATIONS_MODULE_ITEMS.filter((e) => e.type === "multiple-choice").map(
      (e) => e.id,
    );
    expect(mc.sort()).toEqual(
      [
        "mod-calcfound-retain-point-value",
        "mod-calcfound-retain-diff-cont",
        "mod-calcfound-retain-signed",
        "mod-calcfound-retain-existence",
      ].sort(),
    );
    for (const id of mc) expect(ITEM_ASSESSMENT_META[id]!.evidenceTarget, id).toBe("E1");
  });

  it("does not put raw array notation in learner-facing prompts", () => {
    for (const item of CALCULUS_FOUNDATIONS_MODULE_ITEMS) {
      expect(item.prompt, item.id).not.toMatch(/\[\[/);
    }
  });
});

describe("calculus-foundations module sets", () => {
  it("registers three sets on the `calculus-foundations` module, all exam mode", () => {
    for (const id of [
      "calculus-foundations-review",
      "calculus-foundations-retention",
      "calculus-foundations-mock",
    ]) {
      const set = getModuleSet(id);
      expect(set, id).toBeDefined();
      expect(set!.moduleId, id).toBe("calculus-foundations");
      expect(set!.mode, id).toBe("exam");
      expect(set!.version).toBeGreaterThanOrEqual(1);
    }
  });

  it("resolves every set to real items in the authored order", () => {
    expect(resolveModuleSet("calculus-foundations-review").items.map((e) => e.id)).toEqual([
      "mod-calcfound-limit-in-derivative",
      "mod-calcfound-select-method",
      "mod-calcfound-transfer-bracket-window",
      "mod-calcfound-diagnose-signed-split",
      "mod-calcfound-mixed-rate-total",
      "mod-calcfound-mixed-ftc",
    ]);
    expect(resolveModuleSet("calculus-foundations-retention").items.map((e) => e.id)).toEqual([
      "mod-calcfound-retain-point-value",
      "mod-calcfound-retain-diff-cont",
      "mod-calcfound-retain-signed",
      "mod-calcfound-retain-existence",
    ]);
    expect(resolveModuleSet("calculus-foundations-mock").items.map((e) => e.id)).toEqual([
      "mod-calcfound-mock-limit",
      "mod-calcfound-mock-total",
      "mod-calcfound-mock-slope-of-total",
    ]);
  });

  it("partitions the items — no item is administered in two sets", () => {
    const listed = [
      "calculus-foundations-review",
      "calculus-foundations-retention",
      "calculus-foundations-mock",
    ].flatMap((id) => [...getModuleSet(id)!.itemIds]);
    expect(new Set(listed).size).toBe(listed.length);
    expect(listed.sort()).toEqual([...EXPECTED_IDS].sort());
  });

  it("strictly alternates auto-graded and human-scored items in the review set", () => {
    const kinds = resolveModuleSet("calculus-foundations-review").items.map((e) =>
      requiresHumanScore(e),
    );
    expect(kinds).toEqual([false, true, false, true, false, true]);
  });

  it("the mock set is timed and entirely auto-graded", () => {
    const set = getModuleSet("calculus-foundations-mock")!;
    expect(set.timeLimitSec).toBe(600);
    for (const item of resolveModuleSet("calculus-foundations-mock").items) {
      expect(requiresHumanScore(item), item.id).toBe(false);
    }
  });
});

describe("calculus-foundations module items — mathematics, verified independently", () => {
  it("mod-ex-coolant: R is really an antiderivative of r, and the two routes agree at 20", () => {
    const { f, antiderivative, domain } = MOD_EX_COOLANT;
    for (const t of [0.3, 1.1, 2.7, 3.9, 4.6]) {
      const numeric = (antiderivative(t + 1e-6) - antiderivative(t - 1e-6)) / (2e-6);
      expect(numeric).toBeCloseTo(f(t), 3);
    }
    const [lo, hi] = domain;
    const fine = riemannSum(f, lo, hi, 20000, "mid");
    const bracket = antiderivative(hi) - antiderivative(lo);
    expect(fine).toBeCloseTo(20, 3);
    expect(bracket).toBe(20);
    // Left/right endpoint sums at n = 5 straddle the answer.
    const left = riemannSum(f, lo, hi, 5, "left");
    const right = riemannSum(f, lo, hi, 5, "right");
    expect(left).toBeCloseTo(15, 6);
    expect(right).toBeCloseTo(30, 6);
    expect(left).toBeLessThanOrEqual(20);
    expect(right).toBeGreaterThanOrEqual(20);
    // The turn at t=2 is strictly interior — no monotone certificate covers [0,5].
    expect(f(1.9)).toBeGreaterThan(f(2));
    expect(f(2.1)).toBeGreaterThan(f(2));
    // A'(4), by the theorem's first half, is r(4) — no need to compute A.
    const A = (x: number) => riemannSum(f, lo, x, 4000, "mid");
    expect(boundaryAwareDerivative(A, 4, domain)).toBeCloseTo(f(4), 3);
    expect(f(4)).toBe(9);
  });

  it("mod-ex-furnace: the split at h's zeros gives 20, -4, 20, and the net is 36 (not 44)", () => {
    const { f, antiderivative } = MOD_EX_FURNACE;
    expect(antiderivative(2) - antiderivative(0)).toBe(20);
    expect(antiderivative(4) - antiderivative(2)).toBe(-4);
    expect(antiderivative(6) - antiderivative(4)).toBe(20);
    expect(antiderivative(6) - antiderivative(0)).toBe(36);
    // h really is negative on (2,4) and positive either side — the split points
    // are h's own zeros, not its turn (at t=3).
    expect(f(3)).toBeLessThan(0);
    expect(f(1)).toBeGreaterThan(0);
    expect(f(5)).toBeGreaterThan(0);
    // |h| totals 44 — a real, different quantity from the signed net.
    const totalMoved =
      riemannSum((t) => Math.abs(f(t)), 0, 6, 20000, "mid");
    expect(totalMoved).toBeCloseTo(44, 1);
  });

  it("mod-ex-turbine: the turn sits at t=3, strictly inside [2.6,3.4] but not [1.5,2.4]", () => {
    const { f, turningPoints } = MOD_EX_TURBINE;
    expect(turningPoints[0]).toBe(3);
    expect(f(3)).toBe(-4);
    // Numerically confirm the turn: derivative changes sign there.
    const before = (f(3) - f(3 - 1e-3)) / 1e-3;
    const after = (f(3 + 1e-3) - f(3)) / 1e-3;
    expect(before).toBeLessThan(0);
    expect(after).toBeGreaterThan(0);
  });

  it("mod-ex-dialysis: net 0 over [0,6], max 82 at t=2, fastest-fall at t=4", () => {
    const { f, antiderivative } = MOD_EX_DIALYSIS;
    expect(antiderivative(6) - antiderivative(0)).toBe(0);
    const V0 = 50;
    const V = (t: number) => V0 + antiderivative(t) - antiderivative(0);
    expect(V(2)).toBe(82);
    expect(V(6)).toBe(50);
    expect(V(7)).toBe(57);
    expect(V(2)).toBeGreaterThan(V(7));
    // f' = 6t - 24 vanishes at t = 4, the rate's own minimum.
    const fPrimeAt4 = (f(4 + 1e-6) - f(4 - 1e-6)) / (2e-6);
    expect(fPrimeAt4).toBeCloseTo(0, 3);
    expect(f(4)).toBe(-12);
  });

  it("mod-ex-reactor: the mock set's exact values (12, 16, and A'(4)=0)", () => {
    const { f, antiderivative, domain } = MOD_EX_REACTOR;
    expect(antiderivative(6) - antiderivative(0)).toBe(12);
    expect(antiderivative(4) - antiderivative(0)).toBe(16);
    expect(f(4)).toBe(0);
    const A = (x: number) => riemannSum(f, domain[0], x, 4000, "mid");
    expect(boundaryAwareDerivative(A, 4, domain)).toBeCloseTo(0, 3);
    // d/dx(1/x) at x=1, via the actual limit definition.
    const g = (x: number) => 1 / x;
    const quotient = (h: number) => (g(1 + h) - g(1)) / h;
    expect(quotient(1e-4)).toBeCloseTo(-1, 3);
  });

  it("no calc-foundations fixture reuses a lesson fixture's rate on its domain", () => {
    // Fixtures here are fresh closed-form rates distinct from every declared
    // lesson CalculusFixture — spot-checked by comparing sampled values across
    // shared domain overlaps rather than by object identity.
    const lessonFixtures = CALCULUS_FIXTURES;
    const moduleFixtures = [
      MOD_EX_COOLANT,
      MOD_EX_FURNACE,
      MOD_EX_TURBINE,
      MOD_EX_DIALYSIS,
      MOD_EX_REACTOR,
    ];
    for (const mod of moduleFixtures) {
      for (const lesson of lessonFixtures) {
        const [lo, hi] = [
          Math.max(mod.domain[0], lesson.domain[0]),
          Math.min(mod.domain[1], lesson.domain[1]),
        ];
        if (hi <= lo) continue; // no domain overlap to compare
        const mid = (lo + hi) / 2;
        const differs =
          Math.abs(mod.f(mid) - lesson.f(mid)) > 1e-6 ||
          Math.abs(mod.f(lo + 1e-3) - lesson.f(lo + 1e-3)) > 1e-6;
        expect(differs, `${lesson.id} vs a calc-foundations module fixture`).toBe(true);
      }
    }
  });
});

describe("calculus-foundations module items — evidence claims are declared honestly", () => {
  it("every item has a manifest entry whose claim respects its capability ceiling", () => {
    for (const item of CALCULUS_FOUNDATIONS_MODULE_ITEMS) {
      expect(ITEM_ASSESSMENT_META[item.id], item.id).toBeDefined();
    }
    // The module's one E5 item.
    expect(ITEM_ASSESSMENT_META["mod-calcfound-mixed-ftc"]!.evidenceTarget).toBe("E5");
    // The two inherited E5 requests that land at E3 (partially discharged —
    // see the assessment plan's level notes).
    for (const id of ["mod-calcfound-limit-in-derivative", "mod-calcfound-mixed-rate-total"]) {
      expect(ITEM_ASSESSMENT_META[id]!.evidenceTarget, id).toBe("E3");
    }
    expect(ITEM_ASSESSMENT_META["mod-calcfound-transfer-bracket-window"]!.evidenceTarget).toBe("E4");
  });

  it("the method-selection item is flagged so cue-lint protects its prompt", () => {
    expect(ITEM_ASSESSMENT_META["mod-calcfound-select-method"]!.methodSelection).toBe(true);
    const item = CALCULUS_FOUNDATIONS_MODULE_ITEMS.find(
      (e) => e.id === "mod-calcfound-select-method",
    )!;
    expect(item.prompt).not.toMatch(/antideriv|riemann|fundamental theorem|\bftc\b/i);
  });

  it("no calc-foundations item claims E4+ on self-marked or heavily scaffolded evidence", () => {
    for (const item of CALCULUS_FOUNDATIONS_MODULE_ITEMS) {
      const meta = ITEM_ASSESSMENT_META[item.id]!;
      if (meta.evidenceTarget !== "E4" && meta.evidenceTarget !== "E5") continue;
      expect(meta.evidenceBasis.scoringAuthority, item.id).not.toBe("self-marked");
      expect(meta.evidenceBasis.scaffolding, item.id).toBe("none");
      expect(meta.evidenceBasis.freshness, item.id).toBe("fresh-instance");
    }
  });
});
