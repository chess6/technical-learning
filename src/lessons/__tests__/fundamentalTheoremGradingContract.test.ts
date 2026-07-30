import { describe, expect, it } from "vitest";
import { fundamentalTheoremLesson } from "../fundamentalTheorem";
import { describeGradingContract, type NamedAnswer } from "./gradingContract";
import { resolveCapabilityId } from "../capabilities";
import { CAPABILITY_EVIDENCE_CEILING } from "../evidence";
import type { ExerciseDefinition } from "../types";

/**
 * Grading contracts for `fundamental-theorem` (spine L4, Package A's flagship).
 *
 * Evidence discipline: the Gate 5 contract claimed E4 four times on
 * capabilities that cap lower (`multiple-choice` at E2, `exercise-sequence`/
 * text at E3). This lesson builds no `construct-in-explorer` item, so **every**
 * claim here rests at E3 or below — the `resolveCapabilityId`/ceiling check
 * below asserts that structurally rather than by inspection.
 */

function byId(id: string): ExerciseDefinition {
  const found = fundamentalTheoremLesson.exercises?.find((e) => e.id === id);
  if (!found) throw new Error(`no fundamental-theorem exercise "${id}"`);
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

/* ------------------------------------------------------------------ items */

describeGradingContract(byId("ftc-differentiate-integral"), {
  mustAccept: [{ name: "A'(3) = g(3) = 7", answer: { value: 7 } }],
  mustReject: [
    { name: "blank", answer: { value: NaN } },
    { name: "evaluated g at 0, not 3", answer: { value: 1 } },
    { name: "integrated instead of differentiated: A(3) = 12", answer: { value: 12 } },
    { name: "forgot the +1 term: 2·3", answer: { value: 6 } },
  ],
});

describeGradingContract(byId("ftc-lower-limit-shift"), {
  mustAccept: [{ name: "vertically shifted, same slope", answer: { choice: 0 } }],
  mustReject: [
    { name: "horizontally shifted", answer: { choice: 1 } },
    { name: "scaled", answer: { choice: 2 } },
    { name: "slope changed", answer: { choice: 3 } },
  ],
});

describeGradingContract(byId("ftc-evaluate-fresh"), {
  mustAccept: [
    { name: "F'(1)=5, identically, 30", answer: seq(5, "identically", 30) },
    { name: "phrasing", answer: seq(5, "for every x", 30) },
  ],
  mustReject: [
    { name: "all blank", answer: seq(null, "", null) },
    { name: "zero-filled", answer: seq(0, "", 0) },
    { name: "used f(1) itself, not F'(1) — same value here by coincidence, still the wrong step to name", answer: seq(5, "only at that point", 30) },
    { name: "right verification, wrong evaluation — swapped F(1) and F(3)", answer: seq(5, "identically", -30) },
    { name: "used the wrong bounds (0 to 3 instead of 1 to 3)", answer: seq(5, "identically", 33) },
  ],
});

describeGradingContract(byId("ftc-telescope-count"), {
  mustAccept: [{ name: "pairs, 2, the two ends", answer: seq({ choice: 0 }, 2, { choice: 0 }) }],
  mustReject: [
    { name: "thinks they add rather than cancel", answer: seq({ choice: 1 }, 2, { choice: 0 }) },
    { name: "thinks equal widths are required", answer: seq({ choice: 2 }, 2, { choice: 0 }) },
    { name: "right mechanism, wrong count", answer: seq({ choice: 0 }, 4, { choice: 0 }) },
    { name: "right count, wrong survivors — named interior points instead", answer: seq({ choice: 0 }, 2, { choice: 1 }) },
  ],
});

describeGradingContract(byId("ftc-why-collapse"), {
  mustAccept: [
    { name: "interior terms cancel", answer: seq("interior terms cancel") },
    { name: "phrasing", answer: seq("everything in the middle cancels") },
  ],
  mustReject: [
    { name: "blank", answer: seq("") },
    {
      name: "names the conclusion, not the reason — explicitly rejected by the lesson plan",
      answer: seq("because integration is the opposite of differentiation"),
    },
    { name: "unrelated", answer: seq("because the function is continuous") },
  ],
});

describeGradingContract(byId("ftc-constant-cancels"), {
  mustAccept: [
    { name: "nothing; opposite signs cancel", answer: seq("nothing", "c cancels") },
    { name: "phrasing", answer: seq("unchanged", "added once and subtracted once") },
  ],
  mustReject: [
    { name: "all blank", answer: seq("", "") },
    { name: "thinks C changes the value", answer: seq("it increases by C", "c cancels") },
    { name: "right verdict, no mechanism", answer: seq("nothing", "it just does") },
  ],
});

describeGradingContract(byId("ftc-no-elementary-antiderivative"), {
  mustAccept: [
    { name: "a formula; e^(-x^2)", answer: seq("a formula", "e^(-x^2)") },
    { name: "phrasing; sin(x)/x", answer: seq("a closed form", "sin(x)/x") },
  ],
  mustReject: [
    { name: "all blank", answer: seq("", "") },
    { name: "no counterexample named — explicitly rejected by the lesson plan", answer: seq("a formula", "") },
    { name: "names a function that DOES have an elementary antiderivative", answer: seq("a formula", "x^2") },
    { name: "misstates what's missing: existence itself", answer: seq("existence", "e^(-x^2)") },
  ],
});

describeGradingContract(byId("ftc-falsify"), {
  mustAccept: [{ name: "the two instruments disagree", answer: seq("the two instruments would disagree") }],
  mustReject: [
    { name: "blank", answer: seq("") },
    { name: "unrelated", answer: seq("the car would stop") },
    { name: "restates the theorem rather than its falsification", answer: seq("the integral would equal F(b)-F(a)") },
  ],
});

describeGradingContract(byId("ftc-telescope-transfer"), {
  mustAccept: [
    { name: "10/11, the identity step, F(k) = -1/k", answer: seq(10 / 11, { choice: 0 }, "-1/k") },
  ],
  mustReject: [
    { name: "all blank", answer: seq(null, { choice: 0 }, "") },
    { name: "wrong sum — off by one term", answer: seq(1, { choice: 0 }, "-1/k") },
    { name: "right sum, wrong step identified", answer: seq(10 / 11, { choice: 1 }, "-1/k") },
    { name: "right sum and step, wrong F — sign error", answer: seq(10 / 11, { choice: 0 }, "1/k") },
  ],
});

describeGradingContract(byId("ftc-corroborate"), {
  mustAccept: [
    {
      name: "8/3 both ways, independent routes",
      answer: seq(8 / 3, 8 / 3, "the sum never used the antiderivative"),
    },
  ],
  mustReject: [
    { name: "all blank", answer: seq(null, null, "") },
    { name: "sum route wrong", answer: seq(2, 8 / 3, "the sum never used the antiderivative") },
    { name: "bracket route wrong", answer: seq(8 / 3, 4, "the sum never used the antiderivative") },
    { name: "right numbers, circular reasoning offered", answer: seq(8 / 3, 8 / 3, "because they're supposed to agree") },
  ],
});

/* --------------------------------------------------------------- coverage */

describe("fundamental-theorem grading-contract coverage", () => {
  const CONTRACTED = new Set([
    "ftc-differentiate-integral",
    "ftc-lower-limit-shift",
    "ftc-evaluate-fresh",
    "ftc-telescope-count",
    "ftc-why-collapse",
    "ftc-constant-cancels",
    "ftc-no-elementary-antiderivative",
    "ftc-falsify",
    "ftc-telescope-transfer",
    "ftc-corroborate",
  ]);

  const items = fundamentalTheoremLesson.exercises ?? [];

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

  it("keeps the reconciled tier mix: 2 check, 4 drill, 4 transfer", () => {
    const tally = (t: string) => items.filter((i) => i.tier === t).length;
    expect(tally("check")).toBe(2);
    expect(tally("drill")).toBe(4);
    expect(tally("transfer")).toBe(4);
    // Recall capped at one bare multiple choice.
    expect(items.filter((i) => i.type === "multiple-choice")).toHaveLength(1);
  });

  it("claims no E4: no item is built as construct-in-explorer, so E3 is the honest ceiling", () => {
    const open = items.filter(
      (i) => i.type === "custom" && i.capabilityId === "construct-in-explorer",
    );
    expect(open).toHaveLength(0);
    expect(CAPABILITY_EVIDENCE_CEILING["exercise-sequence"]).toBe("E3");
    expect(CAPABILITY_EVIDENCE_CEILING["multiple-choice"]).toBe("E2");
    expect(CAPABILITY_EVIDENCE_CEILING["numeric"]).toBe("E3");
  });

  it("resolves a real capability for every item", () => {
    for (const item of items) {
      expect(() => resolveCapabilityId(item)).not.toThrow();
    }
  });
});
