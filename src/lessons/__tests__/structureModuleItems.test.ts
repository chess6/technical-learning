import { describe, expect, it } from "vitest";
import { getGradingCapability, requiresHumanScore } from "../capabilities";
import { CALCULUS_FOUNDATIONS_MODULE_ITEMS } from "../calculusFoundationsModuleItems";
import { MODULE_ITEMS, SYSTEMS_ELIMINATION_ITEMS } from "../moduleItems";
import {
  STRUCTURE_MODULE_ITEMS,
  STRUCT_COB_A,
  STRUCT_COB_IN_BASIS,
  STRUCT_COB_P,
  STRUCT_DIAGNOSE,
  STRUCT_EIGEN_SHIFT,
  STRUCT_LEDGER,
  STRUCT_SELECT_Q,
} from "../structureModuleItems";
import { getModuleSet, resolveModuleSet } from "../moduleSets";
import { snapshotItem } from "../attemptSnapshot";
import { ITEM_ASSESSMENT_META } from "../assessmentManifest";
import { solveLinearSystem, vectorSetRank } from "../../math/linearSystemsGeneral";

const EXPECTED_IDS = [
  "mod-struct-rank-nullity-ledger",
  "mod-struct-eigen-shift",
  "mod-struct-cob-matrix-fresh",
  "mod-struct-select-method",
  "mod-struct-diagnose-colspace",
  "mod-struct-prove-subspace-inclusion",
  "mod-struct-prove-rank-nullity",
  "mod-struct-derive-similarity",
  "mod-struct-retain-two-spaces",
  "mod-struct-retain-total-n",
  "mod-struct-retain-p-direction",
];

const HUMAN_SCORED = new Set([
  "mod-struct-select-method",
  "mod-struct-diagnose-colspace",
  "mod-struct-prove-subspace-inclusion",
  "mod-struct-prove-rank-nullity",
  "mod-struct-derive-similarity",
]);

/** Multiply a 2×2 by a 2×2, locally — the assertion must not reuse item code. */
function mul2(a: readonly (readonly number[])[], b: readonly (readonly number[])[]) {
  return [0, 1].map((i) => [0, 1].map((j) => a[i]![0]! * b[0]![j]! + a[i]![1]! * b[1]![j]!));
}

describe("structure module items — registration", () => {
  it("authors exactly the eleven Gate 9 items, with unique ids", () => {
    const ids = STRUCTURE_MODULE_ITEMS.map((e) => e.id);
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
    for (const item of STRUCTURE_MODULE_ITEMS) {
      expect(() => getGradingCapability(item), item.id).not.toThrow();
    }
  });

  it("routes the written reasoning/proof items to human scoring, others auto", () => {
    for (const item of STRUCTURE_MODULE_ITEMS) {
      expect(requiresHumanScore(item), item.id).toBe(HUMAN_SCORED.has(item.id));
    }
  });

  it("snapshots the human-scored items with a versioned rubric", () => {
    for (const id of HUMAN_SCORED) {
      const item = STRUCTURE_MODULE_ITEMS.find((e) => e.id === id)!;
      const snap = snapshotItem(item);
      expect(snap.requiresReview, id).toBe(true);
      expect(snap.rubric, id).toBeDefined();
      expect(snap.rubric!.rubricId).toBe(id);
      expect(snap.rubric!.rubricVersion).toBeGreaterThanOrEqual(1);
      expect(snap.rubric!.rubricText.length).toBeGreaterThan(20);
    }
  });

  it("uses multiple choice ONLY for the delayed-retention items", () => {
    const mc = STRUCTURE_MODULE_ITEMS.filter((e) => e.type === "multiple-choice").map((e) => e.id);
    expect(mc.sort()).toEqual(
      ["mod-struct-retain-two-spaces", "mod-struct-retain-total-n", "mod-struct-retain-p-direction"].sort(),
    );
    // ...and every one of those claims only recognition.
    for (const id of mc) expect(ITEM_ASSESSMENT_META[id]!.evidenceTarget, id).toBe("E1");
  });

  it("does not put raw array notation in learner-facing prompts", () => {
    for (const item of STRUCTURE_MODULE_ITEMS) {
      expect(item.prompt, item.id).not.toMatch(/\[\[/);
    }
  });
});

describe("structure module sets", () => {
  it("registers three sets on the `structure` module, all exam mode", () => {
    for (const id of ["structure-review", "structure-proof", "structure-retention"]) {
      const set = getModuleSet(id);
      expect(set, id).toBeDefined();
      expect(set!.moduleId, id).toBe("structure");
      expect(set!.mode, id).toBe("exam");
      expect(set!.version).toBeGreaterThanOrEqual(1);
    }
  });

  it("resolves every set to real items in the authored order", () => {
    expect(resolveModuleSet("structure-review").items.map((e) => e.id)).toEqual([
      "mod-struct-rank-nullity-ledger",
      "mod-struct-select-method",
      "mod-struct-cob-matrix-fresh",
      "mod-struct-diagnose-colspace",
      "mod-struct-eigen-shift",
    ]);
    expect(resolveModuleSet("structure-proof").items.map((e) => e.id)).toEqual([
      "mod-struct-prove-subspace-inclusion",
      "mod-struct-prove-rank-nullity",
      "mod-struct-derive-similarity",
    ]);
    expect(resolveModuleSet("structure-retention").items.map((e) => e.id)).toEqual([
      "mod-struct-retain-two-spaces",
      "mod-struct-retain-total-n",
      "mod-struct-retain-p-direction",
    ]);
  });

  it("partitions the items — no item is administered in two sets", () => {
    const listed = ["structure-review", "structure-proof", "structure-retention"].flatMap(
      (id) => [...getModuleSet(id)!.itemIds],
    );
    expect(new Set(listed).size).toBe(listed.length);
    expect(listed.sort()).toEqual([...EXPECTED_IDS].sort());
  });

  it("interleaves auto-graded production with human-scored writing in the review set", () => {
    const kinds = resolveModuleSet("structure-review").items.map((e) => requiresHumanScore(e));
    // Alternating, so no run of one kind cues the next.
    expect(kinds).toEqual([false, true, false, true, false]);
  });

  it("the proof set is entirely human-scored (the P3 surface)", () => {
    for (const item of resolveModuleSet("structure-proof").items) {
      expect(requiresHumanScore(item), item.id).toBe(true);
    }
  });
});

describe("structure module items — mathematics, verified independently", () => {
  it("the ledger system is consistent, rank 2, nullity 2, on a 3x4 shape", () => {
    const { matrix, rhs } = STRUCT_LEDGER;
    const sol = solveLinearSystem(matrix, rhs);
    expect(sol.consistent).toBe(true);
    expect(sol.pivotColumns).toEqual([0, 2]);
    expect(sol.freeCount).toBe(2);
    // rank + nullity = n, and n is the INPUT dimension (4), not m (3).
    const rank = sol.pivotColumns.length;
    expect(rank + sol.freeCount).toBe(matrix[0]!.length);
    expect(matrix.length).toBe(3);
    expect(matrix[0]!.length).toBe(4);
  });

  it("the ledger's stated particular solution and null directions check out", () => {
    const { matrix, rhs } = STRUCT_LEDGER;
    const apply = (x: readonly number[]) =>
      matrix.map((row) => row.reduce((s: number, a, j) => s + a * x[j]!, 0));
    expect(apply([1, 0, 1, 0])).toEqual([...rhs]);
    expect(apply([-2, 1, 0, 0])).toEqual([0, 0, 0]);
    expect(apply([-3, 0, -1, 1])).toEqual([0, 0, 0]);
    expect(vectorSetRank([[-2, 1, 0, 0], [-3, 0, -1, 1]])).toBe(2);
  });

  it("the eigen-shift matrix really is A - I, with geometric multiplicity 2", () => {
    // A is the matrix quoted in the prompt; the config holds A - 1·I.
    const A = [
      [2, 1, 1],
      [1, 2, 1],
      [1, 1, 2],
    ];
    const shifted = A.map((row, i) => row.map((v, j) => v - (i === j ? 1 : 0)));
    expect(shifted).toEqual(STRUCT_EIGEN_SHIFT.matrix.map((r) => [...r]));

    const sol = solveLinearSystem(STRUCT_EIGEN_SHIFT.matrix, STRUCT_EIGEN_SHIFT.rhs);
    expect(sol.consistent).toBe(true);
    expect(sol.pivotColumns).toHaveLength(1); // rank(A - I) = 1
    // Geometric multiplicity = n - rank = 3 - 1 = 2, and it EQUALS the algebraic
    // multiplicity, so lambda = 1 supplies a plane rather than a line.
    expect(sol.freeCount).toBe(2);

    // The stated basis vectors are genuine eigenvectors of A for lambda = 1.
    for (const v of [[-1, 1, 0], [-1, 0, 1]]) {
      const Av = A.map((row) => row.reduce((s, a, j) => s + a * v[j]!, 0));
      expect(Av).toEqual(v);
    }
  });

  it("the change-of-basis answer is P inverse A P, and preserves trace and determinant", () => {
    const det = (m: readonly (readonly number[])[]) => m[0]![0]! * m[1]![1]! - m[0]![1]! * m[1]![0]!;
    const trace = (m: readonly (readonly number[])[]) => m[0]![0]! + m[1]![1]!;
    expect(det(STRUCT_COB_P)).toBe(1);
    const pInv = [
      [STRUCT_COB_P[1][1], -STRUCT_COB_P[0][1]],
      [-STRUCT_COB_P[1][0], STRUCT_COB_P[0][0]],
    ];
    expect(mul2(pInv, mul2(STRUCT_COB_A, STRUCT_COB_P))).toEqual(
      STRUCT_COB_IN_BASIS.map((r) => [...r]),
    );
    expect(trace(STRUCT_COB_IN_BASIS)).toBe(trace(STRUCT_COB_A));
    expect(det(STRUCT_COB_IN_BASIS)).toBe(det(STRUCT_COB_A));
    // ...and no real basis could diagonalize it: the discriminant is negative.
    const disc = trace(STRUCT_COB_A) ** 2 - 4 * det(STRUCT_COB_A);
    expect(disc).toBeLessThan(0);
  });

  it("the method-selection item's Q genuinely has a nontrivial null space", () => {
    const sol = solveLinearSystem(STRUCT_SELECT_Q, [0, 0, 0]);
    expect(sol.freeCount).toBe(1);
    const v = [-2, 1, 0];
    const Mv = STRUCT_SELECT_Q.map((row) =>
      row.reduce((s: number, a, j) => s + a * v[j]!, 0),
    );
    expect(Mv).toEqual([0, 0, 0]);
  });

  it("the diagnosis fixture is a real trap: the reduced pivot columns are NOT a basis of Col(A)", () => {
    const sol = solveLinearSystem(STRUCT_DIAGNOSE, [0, 0, 0]);
    expect(sol.pivotColumns).toEqual([0, 2]);
    const cols = [0, 1, 2].map((j) => STRUCT_DIAGNOSE.map((row) => row[j]!));
    const correct = [cols[0]!, cols[2]!]; // columns of A itself
    expect(vectorSetRank(correct)).toBe(2);
    // The student's answer, e_1 and e_3, spans a DIFFERENT plane: adding the true
    // basis vector (1,2,1) to it raises the rank, so it is not in their span.
    const studentBasis = [
      [1, 0, 0],
      [0, 0, 1],
    ];
    expect(vectorSetRank(studentBasis)).toBe(2);
    expect(vectorSetRank([...studentBasis, correct[0]!])).toBe(3);
  });

  it("no structure fixture reuses a lesson or systems-elimination matrix", () => {
    const prior = new Set(
      [
        // L8 / L9 / L10 lesson fixtures.
        [[1, 0, 2], [0, 1, 3], [1, 1, 5]],
        [[2, 1, 0], [0, 3, 1], [4, -1, -1]],
        [[1, -1, 2], [3, -3, 6], [-2, 2, -4]],
        [[1, 2, 3], [0, 1, 4]],
        [[2, 1, 0, 3], [0, 1, 1, 1]],
        [[1, 2, 1], [2, 4, 2], [3, 6, 3]],
        [[2, 1], [1, 3]],
        [[3, 1], [0, 2]],
        // systems-elimination module fixtures.
        [[1, 2, -1], [2, 4, 1]],
        [[1, 1, 1], [1, 2, 3], [2, 3, 4]],
        [[2, 1, -1], [4, 1, 1], [2, 0, 2]],
        [[1, 1], [1, -1], [2, 1]],
        [[1, 3], [2, 6]],
        [[1, 2], [2, 4]],
        [[1, 2], [3, 4]],
        [[2, 4], [3, 6]],
        [[1, 1, 0], [0, 1, 1], [1, 2, 1]],
        [[1, 1], [2, 3], [3, 4]],
      ].map((m) => JSON.stringify(m)),
    );
    for (const fixture of [
      STRUCT_LEDGER.matrix,
      STRUCT_EIGEN_SHIFT.matrix,
      STRUCT_COB_A,
      STRUCT_COB_P,
      STRUCT_SELECT_Q,
      STRUCT_DIAGNOSE,
    ]) {
      expect(prior.has(JSON.stringify(fixture.map((r) => [...r])))).toBe(false);
    }
  });
});

describe("structure module items — evidence claims are declared honestly", () => {
  it("every item has a manifest entry whose claim respects its capability ceiling", () => {
    // The ceiling check itself lives in evidenceCeiling.test.ts across all module
    // items; here we pin the module's OWN intent so a later edit cannot quietly
    // upgrade a recognition item.
    for (const item of STRUCTURE_MODULE_ITEMS) {
      expect(ITEM_ASSESSMENT_META[item.id], item.id).toBeDefined();
    }
    expect(ITEM_ASSESSMENT_META["mod-struct-cob-matrix-fresh"]!.evidenceTarget).toBe("E3");
    for (const id of ["mod-struct-rank-nullity-ledger", "mod-struct-eigen-shift"]) {
      expect(ITEM_ASSESSMENT_META[id]!.evidenceTarget, id).toBe("E5");
    }
  });

  it("the method-selection item is flagged so cue-lint protects its prompt", () => {
    expect(ITEM_ASSESSMENT_META["mod-struct-select-method"]!.methodSelection).toBe(true);
    const item = STRUCTURE_MODULE_ITEMS.find((e) => e.id === "mod-struct-select-method")!;
    // Belt and braces: the ONE thing the prompt must never do is name the method.
    expect(item.prompt).not.toMatch(/eliminat/i);
  });

  it("no structure item claims E4+ on self-marked or heavily scaffolded evidence", () => {
    for (const item of STRUCTURE_MODULE_ITEMS) {
      const meta = ITEM_ASSESSMENT_META[item.id]!;
      if (meta.evidenceTarget !== "E4" && meta.evidenceTarget !== "E5") continue;
      expect(meta.evidenceBasis.scoringAuthority, item.id).not.toBe("self-marked");
      expect(meta.evidenceBasis.scaffolding, item.id).toBe("none");
      expect(meta.evidenceBasis.freshness, item.id).toBe("fresh-instance");
    }
  });
});
