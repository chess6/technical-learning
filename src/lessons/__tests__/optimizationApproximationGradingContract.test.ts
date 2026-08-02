import { describe, expect, it } from "vitest";
import { optimizationApproximationLesson } from "../optimizationApproximation";
import { describeGradingContract, type NamedAnswer } from "./gradingContract";
import { requiresHumanScore, resolveCapabilityId } from "../capabilities";
import { CAPABILITY_EVIDENCE_CEILING } from "../evidence";
import { snapshotItem } from "../attemptSnapshot";
import type { ExerciseDefinition } from "../types";

/**
 * Grading contracts for `optimization-approximation` (spine L6, Package B's
 * second lesson).
 *
 * Reject batteries are aimed specifically at this lesson's own failure modes,
 * found across two Mode B review rounds and now held as regressions:
 *
 *  - a correct extremum chosen from an INCOMPLETE candidate set (the local
 *    max 12 instead of the global max 37 in `opt-endpoint-fresh`; a
 *    non-endpoint value in `opt-candidate-set`'s final step);
 *  - treating f'(a) = 0 as SUFFICIENT (`opt-flat-not-extremum`'s distractor 1);
 *  - treating f''(a) = 0 as a VERDICT rather than silence
 *    (`opt-second-test-silent`'s step 2 distractor 1);
 *  - getting a method choice right while failing to supply the CAPTURED
 *    justification (`opt-select-route`'s step 2);
 *  - confusing sampled disagreement with the certified radius is guarded at
 *    the math layer (`optimization.test.ts`) and the explorer
 *    (`OptimizationApproximationExplorer.test.tsx`), not by a lesson exercise
 *    — no exercise here asks the learner to compute either number;
 *  - identifying only ONE sign of h, or conflating differentiability with
 *    interiority, in `opt-derive-steps` — its four-step design (added after
 *    owner review) is tested exhaustively below, one step wrong at a time.
 */

function byId(id: string): ExerciseDefinition {
  const found = optimizationApproximationLesson.exercises?.find((e) => e.id === id);
  if (!found) throw new Error(`no optimization-approximation exercise "${id}"`);
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

describeGradingContract(byId("opt-candidate-set"), {
  mustAccept: [{ name: "5 candidates, endpoint reason, max 47", answer: seq(5, { choice: 0 }, 47) }],
  mustReject: [
    { name: "incomplete count — endpoints forgotten", answer: seq(3, { choice: 0 }, 47) },
    { name: "wrong reason for the endpoint's inclusion", answer: seq(5, { choice: 1 }, 47) },
    {
      name: "a correct-LOOKING extremum chosen from an incomplete candidate set (a stationary value, not the true max)",
      answer: seq(5, { choice: 0 }, 2),
    },
    { name: "blank final step", answer: seq(5, { choice: 0 }, NaN) },
  ],
});

describeGradingContract(byId("opt-flat-not-extremum"), {
  mustAccept: [{ name: "nothing follows — only that no step is guaranteed to improve", answer: { choice: 0 } }],
  mustReject: [
    { name: "treats f'(a)=0 as SUFFICIENT for an extremum", answer: { choice: 1 } },
    { name: "treats f'(a)=0 as proof of NO extremum", answer: { choice: 2 } },
    { name: "TRUE but not the conclusion — continuity was never in question", answer: { choice: 3 } },
  ],
});

describeGradingContract(byId("opt-second-test-silent"), {
  mustAccept: [{ name: "min, silent, the x^6/-x^6 pair", answer: seq({ choice: 0 }, { choice: 0 }, { choice: 0 }) }],
  mustReject: [
    { name: "misclassifies the warm-up (u''(3)=2>0 is a min, not a max)", answer: seq({ choice: 1 }, { choice: 0 }, { choice: 0 }) },
    {
      name: "treats f''(a)=0 as a VERDICT (\"always a minimum\") rather than silence",
      answer: seq({ choice: 0 }, { choice: 1 }, { choice: 0 }),
    },
    { name: "picks a pair that doesn't actually separate the silent case", answer: seq({ choice: 0 }, { choice: 0 }, { choice: 1 }) },
  ],
});

describeGradingContract(byId("opt-linearize-tolerance"), {
  mustAccept: [{ name: "sqrt(2*0.002/8)", answer: { value: Math.sqrt((2 * 0.002) / 8) } }],
  mustReject: [
    { name: "inverted the bound (sqrt(M/(2*eps)))", answer: { value: Math.sqrt(8 / (2 * 0.002)) } },
    { name: "forgot the factor of 2", answer: { value: Math.sqrt(0.002 / 8) } },
    { name: "blank", answer: { value: NaN } },
  ],
});

describeGradingContract(byId("opt-open-interval"), {
  mustAccept: [{ name: "no conclusion — a correct output", answer: { choice: 0 } }],
  mustReject: [
    { name: "\"the method failed\"", answer: { choice: 1 } },
    { name: "treats the supremum as attained", answer: { choice: 2 } },
    { name: "checks the midpoint instead", answer: { choice: 3 } },
  ],
});

describeGradingContract(byId("opt-endpoint-fresh"), {
  mustAccept: [{ name: "check the whole candidate set, global max 37", answer: seq({ choice: 0 }, 37) }],
  mustReject: [
    { name: "would only check the interior local max — an incomplete candidate set by design", answer: seq({ choice: 1 }, 37) },
    {
      name: "a correct extremum chosen from an INCOMPLETE candidate set — the interior local max 12, not the true global max 37",
      answer: seq({ choice: 0 }, 12),
    },
    { name: "blank numeric step", answer: seq({ choice: 0 }, NaN) },
  ],
});

describeGradingContract(byId("opt-which-hypothesis"), {
  mustAccept: [{ name: "min 0, differentiability fails", answer: seq(0, { choice: 0 }) }],
  mustReject: [
    { name: "wrong minimum value", answer: seq(1, { choice: 0 }) },
    { name: "claims x=1 is not interior (false)", answer: seq(0, { choice: 1 }) },
    { name: "claims EVT fails (false — domain is closed)", answer: seq(0, { choice: 2 }) },
    { name: "claims n is not continuous at x=1 (false)", answer: seq(0, { choice: 3 }) },
  ],
});

describeGradingContract(byId("opt-select-route"), {
  mustAccept: [{ name: "certificate route, the real reason, minimum 4", answer: seq({ choice: 0 }, { choice: 0 }, 4) }],
  mustReject: [
    { name: "chooses the inefficient route", answer: seq({ choice: 1 }, { choice: 0 }, 4) },
    {
      name: "chooses a method WITHOUT supplying the correct captured justification (right route, wrong reason)",
      answer: seq({ choice: 0 }, { choice: 1 }, 4),
    },
    { name: "right route and reason, wrong minimum", answer: seq({ choice: 0 }, { choice: 0 }, 100) },
  ],
});

describeGradingContract(byId("opt-derive-steps"), {
  mustAccept: [
    { name: "differentiability, one sign, interiority, 1.84", answer: seq({ choice: 0 }, { choice: 0 }, { choice: 0 }, 1.84) },
  ],
  mustReject: [
    {
      name: "step (A): names continuity instead of differentiability as the residual-control property",
      answer: seq({ choice: 1 }, { choice: 0 }, { choice: 0 }, 1.84),
    },
    {
      name: "step (B): identifies only the WRONG single sign of h's refutation (claims 'local maximum' refuted, not minimum)",
      answer: seq({ choice: 0 }, { choice: 1 }, { choice: 0 }, 1.84),
    },
    {
      name: "step (B): claims a single direction refutes BOTH — collapses the two-sign structure",
      answer: seq({ choice: 0 }, { choice: 2 }, { choice: 0 }, 1.84),
    },
    {
      name: "step (C): conflates INTERIORITY with differentiability — names the same property twice",
      answer: seq({ choice: 0 }, { choice: 0 }, { choice: 1 }, 1.84),
    },
    { name: "final numeric step wrong", answer: seq({ choice: 0 }, { choice: 0 }, { choice: 0 }, 99) },
  ],
});

/* --------------------------------------------------------------- coverage */

describe("optimization-approximation grading-contract coverage", () => {
  const CONTRACTED = new Set([
    "opt-candidate-set",
    "opt-flat-not-extremum",
    "opt-second-test-silent",
    "opt-linearize-tolerance",
    "opt-open-interval",
    "opt-endpoint-fresh",
    "opt-which-hypothesis",
    "opt-select-route",
    "opt-derive-steps",
  ]);
  const SELF_MARKED = new Set(["opt-derive-escape"]);

  const items = optimizationApproximationLesson.exercises ?? [];

  it("contracts every auto-graded exercise, and nothing else", () => {
    expect(items.length).toBe(CONTRACTED.size + SELF_MARKED.size);
    for (const item of items) {
      expect(item.type === "prediction").toBe(false);
      if (requiresHumanScore(item)) {
        expect(SELF_MARKED.has(item.id), `unexpected self-marked item "${item.id}"`).toBe(true);
      } else {
        expect(CONTRACTED.has(item.id), `missing contract for "${item.id}"`).toBe(true);
      }
    }
    const ids = new Set(items.map((i) => i.id));
    for (const id of CONTRACTED) {
      expect(ids.has(id), `contract for missing exercise "${id}"`).toBe(true);
    }
  });

  it("keeps the declared tier mix: 5 drill, 4 transfer (evidence-bearing), 1 checkpoint, 1 self-marked practice event", () => {
    const tally = (t: string) => items.filter((i) => i.tier === t).length;
    // opt-derive-escape is tier "transfer" in its authored shape but carries
    // no evidence claim — excluded explicitly here so a later edit cannot
    // silently inflate the transfer count by adding a real evidence item.
    const transferEvidence = items.filter(
      (i) => i.tier === "transfer" && i.id !== "opt-derive-escape",
    ).length;
    expect(tally("drill")).toBe(5);
    expect(transferEvidence).toBe(4);
    expect(items.filter((i) => i.id === "opt-derive-escape")).toHaveLength(1);
    expect(optimizationApproximationLesson.checkpoints).toHaveLength(1);
    // No bare definition-recall item: every multiple-choice item/step is a
    // diagnosis with rival answers, never a pure "what is the definition of X".
    expect(tally("check")).toBe(0);
  });

  it("claims no E4+ anywhere, and matches every capability's ceiling", () => {
    expect(CAPABILITY_EVIDENCE_CEILING["exercise-sequence"]).toBe("E3");
    expect(CAPABILITY_EVIDENCE_CEILING["multiple-choice"]).toBe("E2");
    expect(CAPABILITY_EVIDENCE_CEILING["numeric"]).toBe("E3");
    expect(CAPABILITY_EVIDENCE_CEILING["self-check"]).toBe("E5");
    for (const objective of optimizationApproximationLesson.objectives ?? []) {
      if (objective.evidence !== "lesson-owned") continue;
      expect(["E2", "E3"]).toContain(objective.evidenceLevel);
    }
  });

  it("opt-derive-escape is self-marked, has a real versioned rubric, and covers NO objective", () => {
    const item = byId("opt-derive-escape");
    // requiresHumanScore/snapshotItem describe the CAPABILITY's declarative
    // shape, not what ExercisePanel actually does with a lesson exercise —
    // see chainRuleGradingContract.test.ts's identical note. It is real
    // practice with a real regression guard, but it discharges no objective.
    expect(requiresHumanScore(item)).toBe(true);
    const snap = snapshotItem(item);
    expect(snap.rubric).toBeDefined();
    expect(snap.rubric!.rubricId).toBe("opt-derive-escape");
    expect(snap.rubric!.rubricVersion).toBeGreaterThanOrEqual(1);
    expect(snap.rubric!.rubricText.length).toBeGreaterThan(20);

    const covered = (optimizationApproximationLesson.objectives ?? []).some((o) =>
      (o.itemIds ?? []).includes("opt-derive-escape"),
    );
    expect(covered, "opt-derive-escape must not appear in any objective's itemIds").toBe(false);
  });

  it("resolves a real capability for every item", () => {
    for (const item of items) {
      expect(() => resolveCapabilityId(item)).not.toThrow();
    }
  });

  it("every evidence-bearing item runs on a function the lesson never displays", () => {
    // The lesson's own shown functions/domains, by construction.
    // Precise (not substring-loose) markers of the lesson's own shown
    // fixtures — "x^3 - 3x^2" (opt-endpoint-fresh's genuinely different k)
    // must NOT false-positive against the main example "x^3 - 3x".
    const shownFragments = ["x^3 - 3x$", "= x^3$", "e^{-t/1.5}", "|x|"];
    for (const id of CONTRACTED) {
      const item = byId(id);
      const promptText = item.type === "custom" ? item.prompt : "";
      for (const fragment of shownFragments) {
        expect(promptText, `${id} prompt should not reuse a shown fixture`).not.toContain(fragment);
      }
    }
  });
});
