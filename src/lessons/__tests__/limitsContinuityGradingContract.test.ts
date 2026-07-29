import { describe, expect, it } from "vitest";
import { limitsContinuityLesson } from "../limitsContinuity";
import { describeGradingContract, type NamedAnswer } from "./gradingContract";
import { resolveCapabilityId } from "../capabilities";
import type { ExerciseDefinition } from "../types";

/**
 * Grading contracts for the `limits-continuity` lesson's auto-graded items.
 *
 * The repo's mandatory harness is scoped to `MODULE_ITEMS`, so these are not
 * owed — but this lesson's items are exactly the shapes the recurring defect
 * classes bite: typed categorical answers (where substring matching would credit
 * a wrong answer embedded in a right one), numeric answers with a
 * mathematically-*related* wrong value one step away, and a predicate-graded
 * construction whose two failure modes must be rejected for different reasons.
 *
 * The `mustReject` entries are chosen so that each pins one specific way a
 * grader could regress:
 *
 *  - blank / empty text is not credited;
 *  - a **related but wrong** number (the value at the point rather than the
 *    limit; the tolerance rather than the spacing) is rejected;
 *  - a construction with EQUAL coordinates is rejected — that describes a
 *    continuous point, which is the exact thing the item asks the learner not to
 *    produce;
 *  - a longer string containing an accepted answer is rejected, so "no" cannot
 *    be credited by appearing inside "I do not know".
 */

function byId(id: string): ExerciseDefinition {
  const found = limitsContinuityLesson.exercises?.find((ex) => ex.id === id);
  if (!found) throw new Error(`no limits-continuity exercise "${id}"`);
  return found;
}

const seq = (
  ...responses: Array<
    number | string | null | readonly [number, number] | { choice: number }
  >
): NamedAnswer["answer"] => ({
  responses: responses.map((value): Record<string, string | number | number[]> => {
    if (typeof value === "number") return { kind: "numeric", value };
    if (typeof value === "string") return { kind: "text", value };
    if (value === null) return { kind: "numeric" };
    if (Array.isArray(value)) return { kind: "construct", value: [value[0], value[1]] };
    return { kind: "multiple-choice", choice: (value as { choice: number }).choice };
  }),
});

/* ------------------------------------------------------------------ items */

describeGradingContract(byId("lim-point-value-irrelevant"), {
  mustAccept: [
    { name: "both steps: the limit is unchanged", answer: seq("7", "7") },
    { name: "spelled out", answer: seq("seven", "unchanged") },
    { name: "case and padding tolerated", answer: seq("  7  ", "STILL 7") },
  ],
  mustReject: [
    { name: "empty", answer: seq("", "") },
    {
      name: "the changed VALUE, not the limit (the misconception itself)",
      answer: seq("-100", "7"),
    },
    { name: "claims the limit dies with the point", answer: seq("7", "no limit") },
    { name: "second step blank", answer: seq("7", "") },
    {
      name: "an accepted answer embedded in a longer one",
      answer: seq("I think it is 7 but I am not sure", "7"),
    },
  ],
});

describeGradingContract(byId("lim-symbolic-recognition"), {
  mustAccept: [{ name: "epsilon quantified first", answer: { choice: 0 } }],
  mustReject: [
    { name: "quantifiers reversed", answer: { choice: 1 } },
    { name: "drops 0 < |x - a| — that is continuity", answer: { choice: 2 } },
    { name: "window named first", answer: { choice: 3 } },
  ],
});

describeGradingContract(byId("lim-diagnose-graph"), {
  mustAccept: [
    {
      name: "exists / jump / oscillation / blow-up",
      answer: seq("exists", "jump", "oscillation", "blow-up"),
    },
    {
      name: "accepted synonyms",
      answer: seq("removable", "jump", "oscillates", "blows up"),
    },
  ],
  mustReject: [
    { name: "all blank", answer: seq("", "", "", "") },
    {
      name: "calls the removable case a failure — the classic error",
      answer: seq("jump", "jump", "oscillation", "blow-up"),
    },
    {
      name: "calls the oscillation a blow-up (they are different failures)",
      answer: seq("exists", "jump", "blow-up", "blow-up"),
    },
    {
      name: "says sin(1/x) has limit 0",
      answer: seq("exists", "jump", "exists", "blow-up"),
    },
    { name: "one step blank", answer: seq("exists", "jump", "oscillation", "") },
  ],
});

/** The top-level `numeric` capability takes `{ value }`, not a bare number. */
const num = (value: number | null): NamedAnswer["answer"] => ({ value });

describeGradingContract(byId("lim-zero-over-zero-fresh"), {
  mustAccept: [{ name: "the forced value", answer: num(10) }],
  mustReject: [
    { name: "blank", answer: num(null) },
    { name: "zero — the 0/0 read as an answer", answer: num(0) },
    { name: "the point itself, not the limit", answer: num(5) },
    { name: "off by the point's value (x, not x + 5)", answer: num(25) },
    { name: "the derivative of the numerator instead", answer: num(2) },
  ],
});

describeGradingContract(byId("lim-continuity-test"), {
  mustAccept: [
    { name: "yes / 4 / no", answer: seq("yes", 4, "no") },
    { name: "synonyms", answer: seq("exists", 4, "discontinuous") },
  ],
  mustReject: [
    { name: "all blank", answer: seq("", null, "") },
    {
      name: "reads the limit off the DEFINED value (1, not 4)",
      answer: seq("yes", 1, "no"),
    },
    {
      name: "concludes continuity because both parts exist",
      answer: seq("yes", 4, "yes"),
    },
    { name: "limit blank", answer: seq("yes", null, "no") },
    { name: "zero-filled limit", answer: seq("yes", 0, "no") },
  ],
});

describeGradingContract(byId("lim-why-substitution-works"), {
  mustAccept: [
    { name: "continuity", answer: seq("continuity") },
    { name: "adjectival form", answer: seq("continuous") },
    { name: "the polynomial phrasing", answer: seq("polynomials are continuous") },
  ],
  mustReject: [
    { name: "blank", answer: seq("") },
    { name: "because it is easy", answer: seq("it is easy") },
    { name: "names the answer, not the property", answer: seq("56") },
    { name: "differentiability is not the reason", answer: seq("differentiability") },
    {
      name: "an accepted word buried in a longer sentence",
      answer: seq("the function looks continuous enough to me honestly"),
    },
  ],
});

describeGradingContract(byId("lim-choose-spacing"), {
  mustAccept: [{ name: "0.02", answer: num(0.02) }],
  mustReject: [
    { name: "blank", answer: num(null) },
    { name: "zero", answer: num(0) },
    { name: "the tolerance itself, unconverted", answer: num(0.06) },
    { name: "multiplied instead of divided", answer: num(0.18) },
    { name: "the modulus's coefficient", answer: num(3) },
  ],
});

describeGradingContract(byId("lim-limit-not-continuity"), {
  mustAccept: [
    { name: "limit 3, value 0", answer: seq([3, 0] as const) },
    { name: "limit 0, value 2 — a zero coordinate is fine", answer: seq([0, 2] as const) },
    { name: "negatives", answer: seq([-1.5, 4] as const) },
  ],
  mustReject: [
    {
      name: "equal coordinates — that point is CONTINUOUS",
      answer: seq([3, 3] as const),
    },
    { name: "both zero — continuous, and the zero vector", answer: seq([0, 0] as const) },
  ],
});

describeGradingContract(byId("lim-continuity-not-enough"), {
  mustAccept: [
    { name: "no, then resolution + modulus", answer: seq("no", { choice: 0 }) },
    { name: "synonym", answer: seq("not justified", { choice: 0 }) },
  ],
  mustReject: [
    { name: "blank verdict", answer: seq("", { choice: 0 }) },
    {
      name: "accepts the conclusion — the misconception itself",
      answer: seq("yes", { choice: 0 }),
    },
    {
      name: "right verdict, but thinks continuity already suffices",
      answer: seq("no", { choice: 1 }),
    },
    { name: "thinks more samples alone would do it", answer: seq("no", { choice: 2 }) },
    { name: "thinks differentiability is the missing piece", answer: seq("no", { choice: 3 }) },
  ],
});

describeGradingContract(byId("lim-repair-transfer"), {
  mustAccept: [
    { name: "no / yes / continuity only", answer: seq("no", "yes", { choice: 0 }) },
    { name: "synonyms", answer: seq("cannot", "can", { choice: 0 }) },
  ],
  mustReject: [
    { name: "all blank", answer: seq("", "", { choice: 0 }) },
    {
      name: "thinks a jump is repairable from one point",
      answer: seq("yes", "yes", { choice: 0 }),
    },
    {
      name: "thinks the removable case is not repairable",
      answer: seq("no", "no", { choice: 0 }),
    },
    {
      name: "inverts the general rule (limit repairable, continuity not)",
      answer: seq("no", "yes", { choice: 1 }),
    },
    { name: "claims both are repairable", answer: seq("no", "yes", { choice: 2 }) },
  ],
});

/* --------------------------------------------------------------- coverage */

describe("limits-continuity grading-contract coverage", () => {
  const CONTRACTED = new Set([
    "lim-point-value-irrelevant",
    "lim-symbolic-recognition",
    "lim-diagnose-graph",
    "lim-zero-over-zero-fresh",
    "lim-continuity-test",
    "lim-why-substitution-works",
    "lim-choose-spacing",
    "lim-limit-not-continuity",
    "lim-continuity-not-enough",
    "lim-repair-transfer",
  ]);

  it("contracts every auto-graded exercise in the lesson", () => {
    const items = limitsContinuityLesson.exercises ?? [];
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      // Every item in this lesson is auto-graded; none is a `prediction` or a
      // `self-check`, so none is exempt.
      expect(item.type === "prediction").toBe(false);
      expect(
        CONTRACTED.has(item.id),
        `missing grading contract for "${item.id}"`,
      ).toBe(true);
    }
  });

  it("contracts nothing that is not in the lesson", () => {
    const ids = new Set((limitsContinuityLesson.exercises ?? []).map((e) => e.id));
    for (const id of CONTRACTED) {
      expect(ids.has(id), `contract for missing exercise "${id}"`).toBe(true);
    }
  });

  it("resolves a real capability for every item", () => {
    for (const item of limitsContinuityLesson.exercises ?? []) {
      expect(() => resolveCapabilityId(item)).not.toThrow();
    }
  });

  it("keeps the tier mix the mastery contract declares", () => {
    const items = limitsContinuityLesson.exercises ?? [];
    const tally = (tier: string) => items.filter((i) => i.tier === tier).length;
    expect(tally("check")).toBe(2);
    expect(tally("drill")).toBe(5);
    expect(tally("transfer")).toBe(3);
    // Recall is capped at one: only the symbolic-recognition item is a bare
    // multiple choice, and the contract records it as E1 recognition.
    expect(items.filter((i) => i.type === "multiple-choice")).toHaveLength(1);
  });
});
