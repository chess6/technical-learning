import { describe, expect, it } from "vitest";
import { derivativeLocalLinearityLesson } from "../derivativeLocalLinearity";
import { describeGradingContract, type NamedAnswer } from "./gradingContract";
import { resolveCapabilityId } from "../capabilities";
import { CAPABILITY_EVIDENCE_CEILING } from "../evidence";
import type { ExerciseDefinition } from "../types";

/**
 * Grading contracts for `derivative-local-linearity`.
 *
 * Every `mustReject` pins one regression class. The ones specific to this
 * lesson are the *related-but-wrong* derivatives — an antiderivative, a
 * dropped coefficient, a power not reduced — because those are the answers a
 * grader that had loosened its tolerance would start letting through, and they
 * are also exactly the misconceptions the lesson is about.
 */

function byId(id: string): ExerciseDefinition {
  const found = derivativeLocalLinearityLesson.exercises?.find((e) => e.id === id);
  if (!found) throw new Error(`no derivative-local-linearity exercise "${id}"`);
  return found;
}

const seq = (
  ...responses: Array<number | string | null | { choice: number }>
): NamedAnswer["answer"] => ({
  responses: responses.map((value): Record<string, string | number> => {
    if (typeof value === "number") return { kind: "numeric", value };
    if (typeof value === "string") return { kind: "text", value };
    if (value === null) return { kind: "numeric" };
    return { kind: "multiple-choice", choice: value.choice };
  }),
});

const vec = (x: number, y: number): NamedAnswer["answer"] => ({ vector: [x, y] });

/* ------------------------------------------------------------------ items */

describeGradingContract(byId("der-residual-remains"), {
  mustAccept: [
    { name: "not zero, and the ratio is what changed", answer: seq({ choice: 1 }, { choice: 0 }) },
  ],
  mustReject: [
    {
      name: "believes the curve is straight there — the misconception itself",
      answer: seq({ choice: 0 }, { choice: 1 }),
    },
    { name: "right verdict, wrong reason (residual reached zero)", answer: seq({ choice: 1 }, { choice: 1 }) },
    { name: "thinks nothing changed but the drawing", answer: seq({ choice: 1 }, { choice: 2 }) },
    { name: "thinks h reached zero", answer: seq({ choice: 1 }, { choice: 3 }) },
  ],
});

describeGradingContract(byId("der-identify-derivative"), {
  mustAccept: [{ name: "3x² − 4", answer: { choice: 0 } }],
  mustReject: [
    { name: "forgot to differentiate the linear term", answer: { choice: 1 } },
    { name: "lost the coefficient on x²", answer: { choice: 2 } },
    { name: "an ANTIderivative — differentiation run backwards", answer: { choice: 3 } },
  ],
});

describeGradingContract(byId("der-from-definition-fresh"), {
  mustAccept: [
    { name: "expanded quotient, then the limit", answer: seq("12+6h+h^2", 12) },
    { name: "spacing tolerated", answer: seq("12 + 6h + h^2", 12) },
    { name: "reordered", answer: seq("h^2 + 6h + 12", 12) },
  ],
  mustReject: [
    { name: "all blank", answer: seq("", null) },
    {
      name: "right number, no expansion — the step that carries the reasoning",
      answer: seq("", 12),
    },
    { name: "the unsimplified quotient, still 0/0 at h = 0", answer: seq("((2+h)^3-8)/h", 12) },
    { name: "zero", answer: seq("12+6h+h^2", 0) },
    { name: "f(2) rather than f′(2)", answer: seq("12+6h+h^2", 8) },
    { name: "the exponent, a related-but-wrong number", answer: seq("12+6h+h^2", 3) },
    { name: "2a instead of 3a² — the previous lesson's rule", answer: seq("12+6h+h^2", 4) },
  ],
});

describeGradingContract(byId("der-linearize-estimate"), {
  mustAccept: [{ name: "slope 3, estimate 1.6", answer: seq(3, 1.6) }],
  mustReject: [
    { name: "all blank", answer: seq(null, null) },
    { name: "zero-filled", answer: seq(0, 0) },
    { name: "used f(1) as the slope", answer: seq(1, 1.6) },
    {
      name: "gave the TRUE value instead of the estimate — the item is about the model",
      answer: seq(3, 1.728),
    },
    { name: "added h rather than f′(a)·h", answer: seq(3, 1.2) },
  ],
});

describeGradingContract(byId("der-three-names"), {
  mustAccept: [
    { name: "rate with units, slope, prediction", answer: seq("0.4 m/s", "0.4", 2.3) },
    { name: "spelled-out units", answer: seq("0.4 metres per second", "0.4 m/s", 2.3) },
  ],
  mustReject: [
    { name: "all blank", answer: seq("", "", null) },
    { name: "rate without units — the units are the argument", answer: seq("0.4", "0.4", 2.3) },
    { name: "wrong units on the rate", answer: seq("0.4 m", "0.4", 2.3) },
    { name: "prediction ignores the step", answer: seq("0.4 m/s", "0.4", 1.5) },
    { name: "prediction uses one second, not two", answer: seq("0.4 m/s", "0.4", 1.9) },
  ],
});
// NOTE: der-three-names' two `text` steps ask for a plain computed number
// (with units) rather than a word/phrase classification, so they were left as
// free text in the MCQ-conversion pass — the ambiguity that pass targeted was
// unclear wording, not numeric-answer formatting.

describeGradingContract(byId("der-tangent-crosses"), {
  mustAccept: [{ name: "0, then −2", answer: seq(0, -2) }],
  mustReject: [
    { name: "all blank", answer: seq(null, null) },
    { name: "picks the point asked about in part two for part one", answer: seq(1, -2) },
    { name: "sign error on the second meeting", answer: seq(0, 2) },
    { name: "gives the point of tangency again", answer: seq(0, 1) },
    { name: "halves rather than doubles", answer: seq(0, -0.5) },
  ],
});

describeGradingContract(byId("der-differentiable-definition"), {
  mustAccept: [
    { name: "no / yes / yes", answer: seq({ choice: 1 }, { choice: 0 }, { choice: 0 }) },
  ],
  mustReject: [
    {
      name: "assumes any absolute value makes a corner — x|x| is smooth at 0",
      answer: seq({ choice: 1 }, { choice: 1 }, { choice: 0 }),
    },
    {
      name: "assumes any piecewise definition breaks differentiability",
      answer: seq({ choice: 1 }, { choice: 0 }, { choice: 1 }),
    },
    { name: "misses the corner", answer: seq({ choice: 0 }, { choice: 0 }, { choice: 0 }) },
  ],
});

describeGradingContract(byId("der-corner-slopes"), {
  mustAccept: [
    { name: "−1 and +1, the canonical corner", answer: vec(-1, 1) },
    { name: "a zero coordinate is fine", answer: vec(0, 3) },
    { name: "both negative but different", answer: vec(-4, -1) },
    { name: "a small but real difference", answer: vec(2, 2.0001) },
  ],
  mustReject: [
    { name: "equal slopes — that point IS differentiable", answer: vec(2, 2) },
    { name: "both zero — differentiable, and the zero vector", answer: vec(0, 0) },
    { name: "equal negatives", answer: vec(-3, -3) },
  ],
});

describeGradingContract(byId("der-applied-transfer"), {
  mustAccept: [
    {
      name: "units, meaning, estimate, sign",
      answer: seq({ choice: 0 }, { choice: 0 }, 92, { choice: 0 }),
    },
  ],
  mustReject: [
    { name: "wrong units on the rate", answer: seq({ choice: 2 }, { choice: 0 }, 92, { choice: 0 }) },
    { name: "estimate ignores the two-minute step", answer: seq({ choice: 0 }, { choice: 0 }, 80, { choice: 0 }) },
    {
      name: "thinks the tangent describes the actual, ever-changing volume",
      answer: seq({ choice: 0 }, { choice: 1 }, 92, { choice: 0 }),
    },
    {
      name: "gets the sign backwards on an upward-bending curve",
      answer: seq({ choice: 0 }, { choice: 0 }, 92, { choice: 1 }),
    },
    {
      name: "thinks the tangent is exact",
      answer: seq({ choice: 0 }, { choice: 0 }, 92, { choice: 2 }),
    },
    {
      name: "refuses to decide although the bending was given",
      answer: seq({ choice: 0 }, { choice: 0 }, 92, { choice: 3 }),
    },
  ],
});

/* --------------------------------------------------------------- coverage */

describe("derivative-local-linearity grading-contract coverage", () => {
  const CONTRACTED = new Set([
    "der-residual-remains",
    "der-identify-derivative",
    "der-from-definition-fresh",
    "der-linearize-estimate",
    "der-three-names",
    "der-tangent-crosses",
    "der-differentiable-definition",
    "der-corner-slopes",
    "der-applied-transfer",
  ]);

  const items = derivativeLocalLinearityLesson.exercises ?? [];

  it("contracts every auto-graded exercise, and nothing else", () => {
    expect(items.length).toBe(CONTRACTED.size);
    for (const item of items) {
      expect(item.type === "prediction").toBe(false);
      expect(CONTRACTED.has(item.id), `missing contract for "${item.id}"`).toBe(true);
    }
    const ids = new Set(items.map((i) => i.id));
    for (const id of CONTRACTED) {
      expect(ids.has(id), `contract for missing exercise "${id}"`).toBe(true);
    }
  });

  it("keeps the tier mix the mastery contract declares", () => {
    const tally = (t: string) => items.filter((i) => i.tier === t).length;
    expect(tally("check")).toBe(2);
    expect(tally("drill")).toBe(5);
    expect(tally("transfer")).toBe(2);
    // Recall capped at one bare multiple choice.
    expect(items.filter((i) => i.type === "multiple-choice")).toHaveLength(1);
  });

  it("rests its single E4 claim on a capability whose ceiling permits it", () => {
    // The correction carried from L1's review: `exercise-sequence` is capped at
    // E3, so a transfer-tier chain is transfer *tier* at E3 *level*. Exactly one
    // item is an open construction, and that is what the E4 claim rests on.
    const open = items.filter(
      (i) => i.type === "custom" && i.capabilityId === "construct-in-explorer",
    );
    expect(open).toHaveLength(1);
    expect(open[0]!.id).toBe("der-corner-slopes");
    expect(CAPABILITY_EVIDENCE_CEILING["construct-in-explorer"]).toBe("E4");
    expect(CAPABILITY_EVIDENCE_CEILING["exercise-sequence"]).toBe("E3");
  });

  it("resolves a real capability for every item", () => {
    for (const item of items) {
      expect(() => resolveCapabilityId(item)).not.toThrow();
    }
  });
});
