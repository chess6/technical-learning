import { describe, expect, it } from "vitest";
import { integralAccumulationLesson } from "../integralAccumulation";
import { describeGradingContract, type NamedAnswer } from "./gradingContract";
import { resolveCapabilityId } from "../capabilities";
import { CAPABILITY_EVIDENCE_CEILING } from "../evidence";
import type { ExerciseDefinition } from "../types";

/**
 * Grading contracts for `integral-accumulation`.
 *
 * The `mustReject` batteries pin this lesson's own regression classes on top of
 * the standard ones. Two are specific to it and worth naming:
 *
 *  - **The area answer.** "Area", "square units", and a non-negative total are
 *    the misconception the lesson exists to dislodge, so each appears as a
 *    rejected answer rather than only as prose.
 *  - **The FTC shortcut.** Nothing here may be gradeable by evaluating an
 *    antiderivative, because the learner does not have one. The parabola item is
 *    a sum → sum → limit chain for that reason.
 */

function byId(id: string): ExerciseDefinition {
  const found = integralAccumulationLesson.exercises?.find((e) => e.id === id);
  if (!found) throw new Error(`no integral-accumulation exercise "${id}"`);
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

describeGradingContract(byId("int-units-fresh"), {
  mustAccept: [
    { name: "rainfall, in millimetres", answer: seq({ choice: 0 }, { choice: 0 }) },
  ],
  mustReject: [
    {
      name: "THE misconception: the integral is an area",
      answer: seq({ choice: 2 }, { choice: 0 }),
    },
    {
      name: "square units — what an area on the page would be in",
      answer: seq({ choice: 0 }, { choice: 2 }),
    },
    {
      name: "gives the rate back instead of the accumulated quantity",
      answer: seq({ choice: 1 }, { choice: 0 }),
    },
    { name: "the input unit, not the product", answer: seq({ choice: 0 }, { choice: 3 }) },
    { name: "the rate's unit, unaccumulated", answer: seq({ choice: 0 }, { choice: 1 }) },
  ],
});

describeGradingContract(byId("int-bracket-fails"), {
  mustAccept: [{ name: "the rate that rises and falls", answer: { choice: 0 } }],
  mustReject: [
    { name: "increasing — brackets fine", answer: { choice: 1 } },
    { name: "decreasing — brackets fine, the other way round", answer: { choice: 2 } },
    { name: "constant — a degenerate but valid bracket", answer: { choice: 3 } },
  ],
});

describeGradingContract(byId("int-estimate-table"), {
  mustAccept: [
    { name: "55 L, low, because it decreases", answer: seq(55, { choice: 0 }, { choice: 0 }) },
  ],
  mustReject: [
    { name: "zero-filled", answer: seq(0, { choice: 0 }, { choice: 0 }) },
    { name: "used the LEFT readings — a different estimate", answer: seq(68, { choice: 0 }, { choice: 0 }) },
    { name: "forgot the 2-minute width: added the readings", answer: seq(27.5, { choice: 0 }, { choice: 0 }) },
    { name: "included all five readings", answer: seq(79, { choice: 0 }, { choice: 0 }) },
    {
      name: "right number, wrong direction — the verdict is the point",
      answer: seq(55, { choice: 1 }, { choice: 0 }),
    },
    {
      name: "right verdict, wrong reason — thinks the flow increases",
      answer: seq(55, { choice: 0 }, { choice: 1 }),
    },
  ],
});

describeGradingContract(byId("int-parabola-from-sum"), {
  mustAccept: [
    { name: "3.75, 2.7068, 8/3", answer: seq(3.75, 2.7068, 8 / 3) },
    { name: "the limit rounded", answer: seq(3.75, 2.707, 2.667) },
  ],
  mustReject: [
    { name: "all blank", answer: seq(null, null, null) },
    { name: "zero-filled", answer: seq(0, 0, 0) },
    {
      name: "gave the limit for S_4 — skipped the finite sums the item is about",
      answer: seq(8 / 3, 2.7068, 8 / 3),
    },
    { name: "S_100 unchanged from S_4", answer: seq(3.75, 3.75, 8 / 3) },
    {
      // The near-miss the tolerance must still reject: S_100 is a good estimate
      // and is not the limit.
      name: "read the limit off S_100 rather than taking it",
      answer: seq(3.75, 2.7068, 2.7068),
    },
    { name: "8/3 inverted", answer: seq(3.75, 2.7068, 3 / 8) },
    { name: "the interval length instead of the integral", answer: seq(3.75, 2.7068, 2) },
    { name: "f(2) rather than the integral", answer: seq(3.75, 2.7068, 4) },
  ],
});

describeGradingContract(byId("int-read-running-total"), {
  mustAccept: [
    {
      name: "rising / flat / falling / fastest at the rate's own peak",
      answer: seq({ choice: 0 }, { choice: 1 }, { choice: 2 }, { choice: 0 }),
    },
  ],
  mustReject: [
    {
      name: "reads the RATE instead of the total at the turning point",
      answer: seq({ choice: 0 }, { choice: 2 }, { choice: 2 }, { choice: 0 }),
    },
    {
      name: "thinks a negative rate still adds — the area model",
      answer: seq({ choice: 0 }, { choice: 1 }, { choice: 0 }, { choice: 0 }),
    },
    {
      name: "puts the fastest climb where the total peaks, not where the rate does",
      answer: seq({ choice: 0 }, { choice: 1 }, { choice: 2 }, { choice: 2 }),
    },
    {
      name: "puts the fastest climb at the start",
      answer: seq({ choice: 0 }, { choice: 1 }, { choice: 2 }, { choice: 1 }),
    },
  ],
});

describeGradingContract(byId("int-signed-transfer"), {
  mustAccept: [
    { name: "up 2 A then down 3 A", answer: vec(2, -3) },
    { name: "a large climb, a larger fall", answer: vec(10, -11) },
    { name: "barely enough", answer: vec(1, -1.01) },
    { name: "ends positive but below the peak", answer: vec(5, -1) },
  ],
  mustReject: [
    { name: "both positive — the total only ever climbs", answer: vec(2, 3) },
    { name: "second is zero — it flattens, it does not fall", answer: vec(2, 0) },
    { name: "both zero", answer: vec(0, 0) },
    {
      name: "never rises, so there is no maximum to end below",
      answer: vec(-2, -3),
    },
    { name: "starts flat then falls — still no maximum", answer: vec(0, -3) },
    { name: "the area model's answer: no sign change", answer: vec(4, 4) },
  ],
});

describeGradingContract(byId("int-scale-invariance"), {
  mustAccept: [
    { name: "unchanged, and both factors are unchanged", answer: seq({ choice: 0 }, { choice: 0 }) },
  ],
  mustReject: [
    { name: "scales with the ink — the area model", answer: seq({ choice: 1 }, { choice: 0 }) },
    { name: "scales the other way", answer: seq({ choice: 2 }, { choice: 0 }) },
    { name: "refuses to decide", answer: seq({ choice: 3 }, { choice: 0 }) },
    {
      name: "thinks only the rate survives the redrawing",
      answer: seq({ choice: 0 }, { choice: 1 }),
    },
    {
      name: "thinks the width is a length on the page",
      answer: seq({ choice: 0 }, { choice: 2 }),
    },
  ],
});

describeGradingContract(byId("int-same-machine"), {
  mustAccept: [
    {
      name: "charge in coulombs, 20; energy in joules, 240",
      answer: seq({ choice: 0 }, 20, { choice: 0 }, 240),
    },
  ],
  mustReject: [
    {
      name: "gives the rate's unit back",
      answer: seq({ choice: 1 }, 20, { choice: 0 }, 240),
    },
    {
      name: "swaps the two meters — power route names charge",
      answer: seq({ choice: 0 }, 20, { choice: 2 }, 240),
    },
    {
      name: "forgot the duration on the charge",
      answer: seq({ choice: 0 }, 5, { choice: 0 }, 240),
    },
    {
      name: "forgot the duration on the energy",
      answer: seq({ choice: 0 }, 20, { choice: 0 }, 60),
    },
  ],
});

/* --------------------------------------------------------------- coverage */

describe("integral-accumulation grading-contract coverage", () => {
  const CONTRACTED = new Set([
    "int-units-fresh",
    "int-bracket-fails",
    "int-estimate-table",
    "int-parabola-from-sum",
    "int-read-running-total",
    "int-signed-transfer",
    "int-scale-invariance",
    "int-same-machine",
  ]);

  const items = integralAccumulationLesson.exercises ?? [];

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
    expect(tally("drill")).toBe(3);
    expect(tally("transfer")).toBe(3);
    // Recall capped at one bare multiple choice.
    expect(items.filter((i) => i.type === "multiple-choice")).toHaveLength(1);
  });

  it("rests its single E4 claim on a capability whose ceiling permits it", () => {
    // The correction carried from L1's and L2's reviews. The contract as written
    // claimed E4 three times on capabilities capped below it; exactly one item is
    // an open construction, and that is what the E4 claim rests on. The other two
    // are recorded at E3 and E2 rather than the ceiling being bent to fit them.
    const open = items.filter(
      (i) => i.type === "custom" && i.capabilityId === "construct-in-explorer",
    );
    expect(open).toHaveLength(1);
    expect(open[0]!.id).toBe("int-signed-transfer");
    expect(CAPABILITY_EVIDENCE_CEILING["construct-in-explorer"]).toBe("E4");
    expect(CAPABILITY_EVIDENCE_CEILING["exercise-sequence"]).toBe("E3");
    expect(CAPABILITY_EVIDENCE_CEILING["multiple-choice"]).toBe("E2");
  });

  it("resolves a real capability for every item", () => {
    for (const item of items) {
      expect(() => resolveCapabilityId(item)).not.toThrow();
    }
  });
});
