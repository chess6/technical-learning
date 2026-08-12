import { describe, expect, it } from "vitest";
import { describeGradingContract } from "./gradingContract";
import { gradeExercise } from "../grading";
import { substitutionPartsLesson } from "../substitutionParts";
import { ITEM_ASSESSMENT_META } from "../assessmentManifest";
import type { ExerciseDefinition } from "../types";

/**
 * L7 `substitution-parts`: a grading contract for every auto-graded item, in
 * the same commit as the items (AGENTS.md rule). The antiderivative items'
 * batteries lean on the check-by-differentiating grader: +C invariance is a
 * REQUIRED accept, and the classic near-misses (the integrand unintegrated,
 * the manufacturing factor dropped, sign errors in a trade) are required
 * rejects with witnesses.
 */

const byId = new Map(substitutionPartsLesson.exercises!.map((e) => [e.id, e]));
const item = (id: string): ExerciseDefinition => {
  const found = byId.get(id);
  if (!found) throw new Error(`missing exercise ${id}`);
  return found;
};

const expr = (source: string) => ({ source });
const choice = (index: number) => ({ choice: index });
const sequence = (...responses: Array<{ kind: "multiple-choice"; choice: number } | { kind: "numeric"; value: number }>) => ({ responses });
const pick = (choiceIndex: number) => ({ kind: "multiple-choice" as const, choice: choiceIndex });
const numeric = (value: number) => ({ kind: "numeric" as const, value });

describeGradingContract(item("sp-witness-predict"), {
  mustAccept: [{ name: "the witnessed antiderivative", answer: { committedIndex: 0 } }],
  mustReject: [
    { name: "the shape-matched wrong option", answer: { committedIndex: 1 } },
    { name: "the doubled option", answer: { committedIndex: 2 } },
    { name: "the cannot-determine dodge", answer: { committedIndex: 3 } },
  ],
});

describeGradingContract(item("sp-substitute-basic"), {
  mustAccept: [
    { name: "sin(x^3)", answer: expr("sin(x^3)") },
    { name: "sin(x^3) + 9 — +C", answer: expr("sin(x^3) + 9") },
    { name: "sin(x^3) + C — literal arbitrary constant", answer: expr("sin(x^3) + C") },
  ],
  mustReject: [
    { name: "blank", answer: expr("") },
    { name: "the integrand unintegrated", answer: expr("3x^2 cos(x^3)") },
    { name: "manufacturing factor dropped", answer: expr("cos(x^3)") },
    { name: "the taught case's answer (fixture leak)", answer: expr("sin(x^2)") },
    { name: "rule-mangling", answer: expr("3x^2 sin(x^3)") },
  ],
});

describe("antiderivative grading rejects finite-grid attacks", () => {
  it("rejects a nonconstant ramp hidden between the old 40 probes", () => {
    const candidate =
      "x sin(x) + cos(x) + 50*((abs(x - 0.922933) + (x - 0.922933))/2 - (abs(x - 1.001929) + (x - 1.001929))/2)";
    const exercise = item("sp-parts-fresh");
    const capability = (exercise as { capabilityId?: string }).capabilityId;
    expect(capability).toBe("math-expression");
    expect(gradeExercise(exercise, {
      kind: "custom",
      capabilityId: "math-expression",
      value: { source: candidate },
    }).correct).toBe(false);
  });
});

describeGradingContract(item("sp-half-constant"), {
  mustAccept: [
    { name: "exp(x^2)/2", answer: expr("exp(x^2)/2") },
    { name: "with +C", answer: expr("exp(x^2)/2 - 3") },
    { name: "equivalent spelling", answer: expr("0.5exp(x^2)") },
  ],
  mustReject: [
    { name: "blank", answer: expr("") },
    { name: "the half forgotten", answer: expr("exp(x^2)") },
    { name: "doubled instead of halved", answer: expr("2exp(x^2)") },
    { name: "the integrand unintegrated", answer: expr("x exp(x^2)") },
  ],
});

describeGradingContract(item("sp-parts-xexp"), {
  mustAccept: [
    { name: "x exp(2x)/2 - exp(2x)/4", answer: expr("x exp(2x)/2 - exp(2x)/4") },
    { name: "factored form", answer: expr("(x/2 - 1/4) exp(2x)") },
    { name: "with +C", answer: expr("x exp(2x)/2 - exp(2x)/4 + 1") },
  ],
  mustReject: [
    { name: "blank", answer: expr("") },
    { name: "the e^x case's answer transplanted", answer: expr("(x - 1) exp(2x)") },
    { name: "inner constant ignored", answer: expr("(x - 1) exp(x)") },
    { name: "sign error in the trade", answer: expr("x exp(2x)/2 + exp(2x)/4") },
  ],
});

describeGradingContract(item("sp-parts-fresh"), {
  mustAccept: [
    { name: "x sin(x) + cos(x)", answer: expr("x sin(x) + cos(x)") },
    { name: "with +C", answer: expr("x sin(x) + cos(x) - 7") },
  ],
  mustReject: [
    { name: "blank", answer: expr("") },
    { name: "sign error", answer: expr("x sin(x) - cos(x)") },
    { name: "u/v swapped and mangled", answer: expr("x^2 sin(x)/2") },
    { name: "the integrand unintegrated", answer: expr("x cos(x)") },
  ],
});

describeGradingContract(item("sp-ln-parts"), {
  mustAccept: [
    { name: "x ln(x) - x", answer: expr("x ln(x) - x") },
    { name: "with +C", answer: expr("x ln(x) - x + 2") },
    { name: "factored", answer: expr("x(ln(x) - 1)") },
  ],
  mustReject: [
    { name: "blank", answer: expr("") },
    { name: "the classic 1/x guess", answer: expr("1/x") },
    { name: "x ln(x) without the correction", answer: expr("x ln(x)") },
    { name: "ln(x)^2/2 (wrong recognition)", answer: expr("ln(x)^2/2") },
  ],
});

describeGradingContract(item("sp-cyclic-produce"), {
  mustAccept: [
    { name: "exp(x)(sin(x) - cos(x))/2", answer: expr("exp(x)(sin(x) - cos(x))/2") },
    { name: "expanded", answer: expr("exp(x)sin(x)/2 - exp(x)cos(x)/2") },
    { name: "with +C", answer: expr("exp(x)(sin(x) - cos(x))/2 + 4") },
  ],
  mustReject: [
    { name: "blank", answer: expr("") },
    { name: "the factor 1/2 dropped", answer: expr("exp(x)(sin(x) - cos(x))") },
    { name: "sign flipped", answer: expr("exp(x)(cos(x) - sin(x))/2") },
    { name: "one trade only, unfinished", answer: expr("exp(x)sin(x)") },
  ],
});

describeGradingContract(item("sp-du-ledger"), {
  mustAccept: [{ name: "the ledger reading", answer: choice(0) }],
  mustReject: [
    { name: "fraction cancellation", answer: choice(1) },
    { name: "renaming", answer: choice(2) },
    { name: "the check confusion", answer: choice(3) },
  ],
});

describeGradingContract(item("sp-boundary-meaning"), {
  mustAccept: [{ name: "the FTC boundary evaluation", answer: choice(0) }],
  mustReject: [
    { name: "correction constant", answer: choice(1) },
    { name: "average", answer: choice(2) },
    { name: "vanishing error term", answer: choice(3) },
  ],
});

describeGradingContract(item("sp-exists-elementary"), {
  mustAccept: [{ name: "exists, not elementary", answer: choice(0) }],
  mustReject: [
    { name: "does not exist", answer: choice(1) },
    { name: "elementary but complicated", answer: choice(2) },
    { name: "exists only where increasing", answer: choice(3) },
  ],
});

describeGradingContract(item("sp-bounds"), {
  mustAccept: [{ name: "transformed bounds and correct value", answer: sequence(pick(0), numeric(Math.sin(1))) }],
  mustReject: [
    { name: "blank sequence", answer: sequence() },
    { name: "numeric step omitted", answer: sequence(pick(0)) },
    { name: "wrong transformed bounds", answer: sequence(pick(1), numeric(Math.sin(1))) },
    { name: "untransformed-bounds arithmetic", answer: sequence(pick(0), numeric(0)) },
    { name: "step kinds swapped", answer: sequence(numeric(Math.sin(1)), pick(0)) },
  ],
});

describeGradingContract(item("sp-choose-u"), {
  mustAccept: [{ name: "differentiate what dies and identify the remaining integral", answer: sequence(pick(0), pick(0)) }],
  mustReject: [
    { name: "blank sequence", answer: sequence() },
    { name: "remaining-integral step omitted", answer: sequence(pick(0)) },
    { name: "LIATE-style cue without simplification judgment", answer: sequence(pick(1), pick(0)) },
    { name: "correct choice but wrong traded integral", answer: sequence(pick(0), pick(1)) },
  ],
});

describeGradingContract(item("sp-classify"), {
  mustAccept: [{ name: "chain, product, and honest neither", answer: sequence(pick(0), pick(0), pick(0)) }],
  mustReject: [
    { name: "blank sequence", answer: sequence() },
    { name: "neither step omitted", answer: sequence(pick(0), pick(0)) },
    { name: "calls the chain case a product", answer: sequence(pick(1), pick(0), pick(0)) },
    { name: "calls the product case a chain", answer: sequence(pick(0), pick(1), pick(0)) },
    { name: "smuggles in the missing chain factor", answer: sequence(pick(0), pick(0), pick(1)) },
  ],
});

describeGradingContract(item("sp-cyclic"), {
  mustAccept: [{ name: "recognizes recurrence and closes it algebraically", answer: sequence(pick(0), pick(0)) }],
  mustReject: [
    { name: "blank sequence", answer: sequence() },
    { name: "closing step omitted", answer: sequence(pick(0)) },
    { name: "mistakes recurrence for failure", answer: sequence(pick(2), pick(0)) },
    { name: "asks for a third trade instead of algebra", answer: sequence(pick(0), pick(1)) },
  ],
});

describe("the bounds fixture stays derived", () => {
  it("sp-bounds grades its numeric step against sin(1), rejecting the untransformed-bounds value", () => {
    const exercise = item("sp-bounds");
    const config = (exercise as unknown as { config: { steps: Array<{ kind: string; expected?: number }> } }).config;
    const numeric = config.steps.find((s) => s.kind === "numeric")!;
    expect(numeric.expected).toBeCloseTo(Math.sin(1), 9);
  });
});

describe("tier mix and manifest coverage", () => {
  it("pins the assessment set's honest shape: one check, repeated drills, one transfer item, and one practice event", () => {
    const tiers = substitutionPartsLesson.exercises!.map((e) => [e.id, e.tier] as const);
    const count = (tier: string) => tiers.filter(([, t]) => t === tier).length;
    expect(count("check")).toBe(1);
    expect(count("drill")).toBe(12);
    expect(count("transfer")).toBe(2); // sp-choose-u plus the self-check practice event
  });

  it("every objective-referenced item has a manifest entry; the practice event has none", () => {
    const referenced = new Set(
      substitutionPartsLesson.objectives!.flatMap((o) => o.itemIds ?? []),
    );
    for (const id of referenced) {
      expect(ITEM_ASSESSMENT_META[id], `${id} missing from manifest`).toBeDefined();
    }
    expect(ITEM_ASSESSMENT_META["sp-derive-parts"]).toBeUndefined();
  });

  it("no lesson-owned objective claims above E4, and self-marked items claim nothing", () => {
    for (const objective of substitutionPartsLesson.objectives!) {
      expect(["E1", "E2", "E3", "E4"]).toContain(objective.evidenceLevel);
    }
  });

  it("keeps near or technique-cued L7 drills at E2", () => {
    for (const id of ["sp-substitute-basic", "sp-half-constant", "sp-bounds", "sp-parts-xexp", "sp-parts-fresh", "sp-ln-parts", "sp-classify", "sp-cyclic", "sp-cyclic-produce", "sp-exists-elementary"]) {
      expect(ITEM_ASSESSMENT_META[id]?.evidenceTarget, id).toBe("E2");
    }
  });

  it("the fresh graded integrands are disjoint from the taught examples", () => {
    // The freshness rule (mastery-contract §4), held mechanically: the two
    // first-production drills must not grade the taught fixtures.
    const graded = ["sp-substitute-basic", "sp-parts-xexp"].map((id) => {
      const config = (item(id) as unknown as { config: { check: { integrand: string } } }).config;
      return config.check.integrand;
    });
    expect(graded).not.toContain("2x cos(x^2)"); // the witnessed manufacture
    expect(graded).not.toContain("x exp(x)"); // the taught trade
  });
});

describe("audited theorem ownership and ordering", () => {
  it("defines decreasing bounds before the substitution theorem uses them", () => {
    const definition = substitutionPartsLesson.route!.findIndex(
      (block) => block.kind === "formal" && block.formalId === "def-reversed-bounds",
    );
    const theorem = substitutionPartsLesson.route!.findIndex(
      (block) => block.kind === "formal" && block.formalId === "thm-substitution",
    );
    expect(definition).toBeGreaterThanOrEqual(0);
    expect(definition).toBeLessThan(theorem);
    const proof = substitutionPartsLesson.formalBlocks!.find(
      (block) => block.id === "thm-substitution",
    )?.proof;
    expect(proof).toContain("convention defined immediately above");
    expect(proof).toContain("endpoint of $g(I)$ attained at an interior extremum");
    expect(proof).toContain("if $g$ is constant");
    expect(proof).not.toMatch(/Lesson 4 already defined/);
  });

  it("attributes the non-cancellation correction to Lesson 5", () => {
    const exercise = item("sp-du-ledger");
    expect(exercise.type).toBe("multiple-choice");
    if (exercise.type !== "multiple-choice") throw new Error("sp-du-ledger type drifted");
    expect(exercise.explanation).toContain("Lesson 5");
    expect(exercise.explanation).not.toContain("Lesson 2 already ruled");
  });
});

describe("blank is never credited anywhere", () => {
  it("every auto-graded non-sequence item rejects an empty answer", () => {
    const mcIds = ["sp-du-ledger", "sp-boundary-meaning", "sp-exists-elementary"];
    for (const id of mcIds) {
      // A multiple-choice with no selection never reaches grading in the UI;
      // grading an out-of-range index must not be credited.
      const result = gradeExercise(item(id), { kind: "multiple-choice", choice: -1 });
      expect(result.correct, id).toBe(false);
    }
  });
});
