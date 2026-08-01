import { describe, expect, it } from "vitest";
import { chainRuleLesson } from "../chainRule";
import { describeGradingContract, type NamedAnswer } from "./gradingContract";
import { requiresHumanScore, resolveCapabilityId } from "../capabilities";
import { CAPABILITY_EVIDENCE_CEILING } from "../evidence";
import { snapshotItem } from "../attemptSnapshot";
import type { ExerciseDefinition } from "../types";

/**
 * Grading contracts for `chain-rule` (spine L5, Package B's first lesson).
 *
 * Evidence discipline, applied before coding (the same preflight A2-A4 used):
 * `multiple-choice` is capped at E2, `numeric`/`exercise-sequence` at E3. One
 * item, `chain-derive-fresh`, uses `self-check` (ceiling E5) and claims E4 —
 * human-scored, so it is exempt from the auto-grading contract battery below
 * (matching `structureModuleItems.test.ts`'s precedent) and checked instead
 * for a real, versioned rubric.
 */

function byId(id: string): ExerciseDefinition {
  const found = chainRuleLesson.exercises?.find((e) => e.id === id);
  if (!found) throw new Error(`no chain-rule exercise "${id}"`);
  return found;
}

const seq = (
  ...responses: Array<number | { choice: number }>
): NamedAnswer["answer"] => ({
  responses: responses.map((value): Record<string, string | number> => {
    if (typeof value === "number") return { kind: "numeric", value };
    return { kind: "multiple-choice", choice: value.choice };
  }),
});

/* ------------------------------------------------------------------ items */

describeGradingContract(byId("chain-du-cancel-fails"), {
  mustAccept: [{ name: "silently needs Δu ≠ 0", answer: { choice: 0 } }],
  mustReject: [
    { name: "\"inelegant\", not a real gap", answer: { choice: 1 } },
    { name: "thinks it's polynomial-specific", answer: { choice: 2 } },
    { name: "thinks it gives the wrong sign", answer: { choice: 3 } },
  ],
});

describeGradingContract(byId("chain-corner-not-necessary"), {
  mustAccept: [{ name: "may still be differentiable — sufficient, not necessary", answer: { choice: 0 } }],
  mustReject: [
    { name: "claims it cannot be differentiable", answer: { choice: 1 } },
    { name: "claims it's always differentiable, for any f", answer: { choice: 2 } },
    { name: "claims nothing can be said", answer: { choice: 3 } },
  ],
});

describeGradingContract(byId("chain-differentiate-fresh"), {
  mustAccept: [
    { name: "f(u)=u², g(x)=2x+3, then 28", answer: seq({ choice: 0 }, 28) },
  ],
  mustReject: [
    { name: "blank second step", answer: seq({ choice: 0 }, NaN) },
    { name: "wrong decomposition", answer: seq({ choice: 1 }, 28) },
    { name: "right decomposition, dropped the g' factor (only f'(7)=14)", answer: seq({ choice: 0 }, 14) },
    { name: "right decomposition, only g'=2 (no f' factor)", answer: seq({ choice: 0 }, 2) },
  ],
});

describeGradingContract(byId("chain-compound-zoom"), {
  mustAccept: [{ name: "12 × 5 = -15... i.e. -3 × 5", answer: { value: -15 } }],
  mustReject: [
    { name: "sign lost", answer: { value: 15 } },
    { name: "added instead of multiplied", answer: { value: 2 } },
    { name: "blank", answer: { value: NaN } },
  ],
});

describeGradingContract(byId("chain-corroborate"), {
  mustAccept: [
    { name: "12 both ways, independent routes", answer: seq(12, 12, { choice: 0 }) },
  ],
  mustReject: [
    { name: "chain-rule route wrong", answer: seq(6, 12, { choice: 0 }) },
    { name: "expansion route wrong", answer: seq(12, 8, { choice: 0 }) },
    { name: "right numbers, thinks both routes used the same formula", answer: seq(12, 12, { choice: 1 }) },
  ],
});

describeGradingContract(byId("chain-zero-predict"), {
  mustAccept: [{ name: "0, regardless of f", answer: { value: 0 } }],
  mustReject: [
    { name: "blank", answer: { value: NaN } },
    { name: "guessed a nonzero product", answer: { value: 3 } },
  ],
});

describeGradingContract(byId("chain-select-method"), {
  mustAccept: [
    { name: "differentiate separately, then 240", answer: seq({ choice: 0 }, 240) },
  ],
  mustReject: [
    { name: "blank second step", answer: seq({ choice: 0 }, NaN) },
    { name: "chose the inefficient route", answer: seq({ choice: 1 }, 240) },
    { name: "right route, dropped the g' factor (only 5·2⁴=80)", answer: seq({ choice: 0 }, 80) },
  ],
});

/* --------------------------------------------------------------- coverage */

describe("chain-rule grading-contract coverage", () => {
  const CONTRACTED = new Set([
    "chain-du-cancel-fails",
    "chain-corner-not-necessary",
    "chain-differentiate-fresh",
    "chain-compound-zoom",
    "chain-corroborate",
    "chain-zero-predict",
    "chain-select-method",
  ]);
  const HUMAN_SCORED = new Set(["chain-derive-fresh"]);

  const items = chainRuleLesson.exercises ?? [];

  it("contracts every auto-graded exercise, and nothing else", () => {
    expect(items.length).toBe(CONTRACTED.size + HUMAN_SCORED.size);
    for (const item of items) {
      expect(item.type === "prediction").toBe(false);
      if (requiresHumanScore(item)) {
        expect(HUMAN_SCORED.has(item.id), `unexpected human-scored item "${item.id}"`).toBe(true);
      } else {
        expect(CONTRACTED.has(item.id), `missing contract for "${item.id}"`).toBe(true);
      }
    }
    const ids = new Set(items.map((i) => i.id));
    for (const id of CONTRACTED) {
      expect(ids.has(id), `contract for missing exercise "${id}"`).toBe(true);
    }
  });

  it("keeps the declared tier mix: 2 check, 3 drill, 3 transfer", () => {
    const tally = (t: string) => items.filter((i) => i.tier === t).length;
    expect(tally("check")).toBe(2);
    expect(tally("drill")).toBe(3);
    expect(tally("transfer")).toBe(3);
    // Recall capped at two bare multiple-choice checks.
    expect(items.filter((i) => i.type === "multiple-choice")).toHaveLength(2);
  });

  it("claims no E5, and E4 only on the human-scored derivation item", () => {
    const open = items.filter(
      (i) => i.type === "custom" && i.capabilityId === "construct-in-explorer",
    );
    expect(open).toHaveLength(0);
    expect(CAPABILITY_EVIDENCE_CEILING["exercise-sequence"]).toBe("E3");
    expect(CAPABILITY_EVIDENCE_CEILING["multiple-choice"]).toBe("E2");
    expect(CAPABILITY_EVIDENCE_CEILING["numeric"]).toBe("E3");
    expect(CAPABILITY_EVIDENCE_CEILING["self-check"]).toBe("E5");
  });

  it("routes chain-derive-fresh to human scoring, with a real versioned rubric", () => {
    const item = byId("chain-derive-fresh");
    expect(requiresHumanScore(item)).toBe(true);
    const snap = snapshotItem(item);
    expect(snap.requiresReview).toBe(true);
    expect(snap.rubric).toBeDefined();
    expect(snap.rubric!.rubricId).toBe("chain-derive-fresh");
    expect(snap.rubric!.rubricVersion).toBeGreaterThanOrEqual(1);
    expect(snap.rubric!.rubricText.length).toBeGreaterThan(20);
  });

  it("resolves a real capability for every item", () => {
    for (const item of items) {
      expect(() => resolveCapabilityId(item)).not.toThrow();
    }
  });
});
